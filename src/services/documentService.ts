import { ChromaClient } from 'chromadb';

interface Document {
  id: string;
  content: string;
  metadata: {
    filename: string;
    fileType: string;
    uploadDate: string;
    size: number;
    category?: string;
  };
}

interface SearchResult {
  id: string;
  content: string;
  metadata: any;
  distance: number;
}

// Enhanced chunking strategies
interface ChunkingStrategy {
  name: string;
  method: (content: string, options?: any) => string[];
}

class DocumentService {
  private client: ChromaClient;
  private collection: any;
  private isInitialized: boolean = false;
  private chunkingStrategies: Map<string, ChunkingStrategy>;

  constructor() {
    this.client = new ChromaClient({
      path: "http://localhost:8000" // Default ChromaDB server
    });
    this.initializeCollection();
    this.initializeChunkingStrategies();
  }

  private initializeChunkingStrategies() {
    this.chunkingStrategies = new Map([
      ['default', {
        name: 'Default Sentence-Aware',
        method: this.splitDocumentIntoChunks.bind(this)
      }],
      ['context_aware', {
        name: 'Context-Aware Configuration Blocks',
        method: this.contextAwareChunking.bind(this)
      }],
      ['semantic_cisco', {
        name: 'Cisco IOS Command Grouping',
        method: this.ciscoSemanticChunking.bind(this)
      }],
      ['error_pattern', {
        name: 'Error Pattern Structured',
        method: this.errorPatternChunking.bind(this)
      }]
    ]);
  }

  private async initializeCollection() {
    try {
      // Create or get the collection
      this.collection = await this.client.getOrCreateCollection({
        name: "network_documents",
        metadata: {
          "hnsw:space": "cosine",
          "description": "Network engineering documents for RAG"
        }
      });
      this.isInitialized = true;
      console.log("ChromaDB collection initialized successfully");
    } catch (error) {
      console.error("Failed to initialize ChromaDB collection:", error);
      this.isInitialized = false;
    }
  }

  async addDocument(document: Document, chunkingStrategy: string = 'default'): Promise<boolean> {
    if (!this.isInitialized) {
      console.error("Document service not initialized");
      return false;
    }

    try {
      // Select and apply chunking strategy
      const strategy = this.chunkingStrategies.get(chunkingStrategy) || this.chunkingStrategies.get('default')!;
      
      // Auto-select chunking strategy based on document type
      let selectedStrategy = chunkingStrategy;
      if (chunkingStrategy === 'auto') {
        selectedStrategy = this.selectOptimalChunkingStrategy(document);
      }
      
      const finalStrategy = this.chunkingStrategies.get(selectedStrategy) || this.chunkingStrategies.get('default')!;
      const chunks = finalStrategy.method(document.content);
      
      const ids = chunks.map((_, index) => `${document.id}_chunk_${index}`);
      const documents = chunks;
      const metadatas = chunks.map((chunk, index) => ({
        filename: document.metadata.filename,
        fileType: document.metadata.fileType,
        uploadDate: document.metadata.uploadDate,
        size: document.metadata.size,
        category: document.metadata.category || "general",
        chunkIndex: index,
        chunkingStrategy: selectedStrategy,
        chunkSize: chunk.length
      }));

      await this.collection.add({
        ids: ids,
        documents: documents,
        metadatas: metadatas
      });

      console.log(`Document ${document.metadata.filename} added successfully with ${chunks.length} chunks using ${selectedStrategy} strategy`);
      return true;
    } catch (error) {
      console.error("Error adding document:", error);
      return false;
    }
  }

  // Enhanced search with category filtering
  async searchDocuments(query: string, limit: number = 5, category?: string): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      console.error("Document service not initialized");
      return [];
    }

    try {
      const searchParams: any = {
        queryTexts: [query],
        nResults: limit
      };

      // Add category filter if specified
      if (category) {
        searchParams.where = { category: category };
      }

      const results = await this.collection.query(searchParams);

      if (results.documents && results.documents[0]) {
        return results.documents[0].map((doc: any, index: number) => ({
          id: results.ids[0][index],
          content: doc,
          metadata: results.metadatas[0][index],
          distance: results.distances[0][index]
        }));
      }

      return [];
    } catch (error) {
      console.error("Error searching documents:", error);
      return [];
    }
  }

  // Search specifically in error patterns
  async searchErrorPatterns(query: string, limit: number = 3): Promise<SearchResult[]> {
    return this.searchDocuments(query, limit, 'error_patterns');
  }

  // Search specifically in best practices
  async searchBestPractices(query: string, limit: number = 3): Promise<SearchResult[]> {
    return this.searchDocuments(query, limit, 'best_practices');
  }

  // Enhanced search that combines general documents with knowledge libraries
  async enhancedSearch(query: string, limit: number = 5): Promise<{
    general: SearchResult[];
    errorPatterns: SearchResult[];
    bestPractices: SearchResult[];
  }> {
    const [general, errorPatterns, bestPractices] = await Promise.all([
      this.searchDocuments(query, Math.ceil(limit * 0.6)),
      this.searchErrorPatterns(query, Math.ceil(limit * 0.2)),
      this.searchBestPractices(query, Math.ceil(limit * 0.2))
    ]);

    return { general, errorPatterns, bestPractices };
  }

  private selectOptimalChunkingStrategy(document: Document): string {
    const content = document.content.toLowerCase();
    const category = document.metadata.category;

    // Select strategy based on content type
    if (category === 'error_patterns' || content.includes('error:') || content.includes('% ')) {
      return 'error_pattern';
    }
    
    if (category === 'best_practices' || content.includes('best practice')) {
      return 'context_aware';
    }
    
    if (content.includes('interface ') || content.includes('router ') || content.includes('vlan ')) {
      return 'semantic_cisco';
    }
    
    if (content.includes('configuration') || content.includes('config')) {
      return 'context_aware';
    }

    return 'default';
  }

  // Context-aware chunking for configuration blocks
  private contextAwareChunking(content: string): string[] {
    const chunks: string[] = [];
    const lines = content.split('\n');
    let currentChunk = '';
    let currentContext = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detect context changes (interface, router, vlan, etc.)
      if (trimmedLine.match(/^(interface|router|vlan|access-list|ip route)/i)) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = line + '\n';
        currentContext = trimmedLine.split(' ')[0];
      } else if (trimmedLine.startsWith('!') || trimmedLine === '') {
        // Comments or empty lines can start new chunks if current chunk is large enough
        if (currentChunk.length > 800) {
          chunks.push(currentChunk.trim());
          currentChunk = line + '\n';
        } else {
          currentChunk += line + '\n';
        }
      } else {
        currentChunk += line + '\n';
        
        // If chunk gets too large, force a break
        if (currentChunk.length > 1500) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter(chunk => chunk.length > 0);
  }

  // Cisco-specific semantic chunking
  private ciscoSemanticChunking(content: string): string[] {
    const chunks: string[] = [];
    const lines = content.split('\n');
    let currentChunk = '';
    let commandGroup = '';

    const commandGroupings = {
      'interface': ['description', 'ip address', 'switchport', 'speed', 'duplex'],
      'router': ['network', 'neighbor', 'redistribute'],
      'vlan': ['name', 'state'],
      'access-list': ['permit', 'deny'],
      'line': ['password', 'login', 'transport'],
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detect major command groups
      const majorCommand = Object.keys(commandGroupings).find(cmd => 
        trimmedLine.toLowerCase().startsWith(cmd)
      );

      if (majorCommand) {
        if (currentChunk && commandGroup !== majorCommand) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        commandGroup = majorCommand;
      }

      currentChunk += line + '\n';

      // Force break on large chunks
      if (currentChunk.length > 1200) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        commandGroup = '';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter(chunk => chunk.length > 0);
  }

  // Structured chunking for error patterns
  private errorPatternChunking(content: string): string[] {
    // For error patterns, keep each error-cause-solution group together
    const errorBlocks = content.split(/(?=Error:|Cause:|Solution:)/i);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const block of errorBlocks) {
      if (currentChunk.length + block.length > 800) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = block;
      } else {
        currentChunk += block;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter(chunk => chunk.length > 0);
  }

  async getAllDocuments(): Promise<Document[]> {
    if (!this.isInitialized) {
      console.error("Document service not initialized");
      return [];
    }

    try {
      const results = await this.collection.get({
        limit: 1000
      });

      // Group chunks by original document
      const documents: { [key: string]: Document } = {};
      
      if (results.documents) {
        results.documents.forEach((doc: any, index: number) => {
          const id = results.ids[index];
          const metadata = results.metadatas[index];
          
          // Extract original document ID from chunk ID
          const originalId = id.split('_chunk_')[0];
          
          if (!documents[originalId]) {
            documents[originalId] = {
              id: originalId,
              content: doc,
              metadata: metadata
            };
          } else {
            // Combine chunks
            documents[originalId].content += '\n\n' + doc;
          }
        });
      }

      return Object.values(documents);
    } catch (error) {
      console.error("Error getting all documents:", error);
      return [];
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    if (!this.isInitialized) {
      console.error("Document service not initialized");
      return false;
    }

    try {
      // Get all chunks for this document
      const results = await this.collection.get({
        where: { filename: documentId }
      });

      if (results.ids && results.ids.length > 0) {
        await this.collection.delete({
          ids: results.ids
        });
        console.log(`Document ${documentId} deleted successfully`);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  }

  private splitDocumentIntoChunks(content: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      let chunk = content.substring(start, end);

      // Try to break at sentence boundaries
      if (end < content.length) {
        const lastPeriod = chunk.lastIndexOf('.');
        const lastNewline = chunk.lastIndexOf('\n');
        const breakPoint = Math.max(lastPeriod, lastNewline);
        
        if (breakPoint > start + chunkSize * 0.7) {
          chunk = content.substring(start, start + breakPoint + 1);
          start = start + breakPoint + 1;
        } else {
          start = end;
        }
      } else {
        start = end;
      }

      chunks.push(chunk.trim());
    }

    return chunks.filter(chunk => chunk.length > 0);
  }

  async getCollectionStats(): Promise<{ totalDocuments: number; totalChunks: number; knowledgeLibraries: any }> {
    if (!this.isInitialized) {
      return { totalDocuments: 0, totalChunks: 0, knowledgeLibraries: {} };
    }

    try {
      const results = await this.collection.get({
        limit: 10000
      });

      const totalChunks = results.ids ? results.ids.length : 0;
      const uniqueDocuments = new Set();
      const categories = new Map();
      
      if (results.ids && results.metadatas) {
        results.ids.forEach((id: string, index: number) => {
          const originalId = id.split('_chunk_')[0];
          uniqueDocuments.add(originalId);
          
          const metadata = results.metadatas[index];
          const category = metadata.category || 'general';
          categories.set(category, (categories.get(category) || 0) + 1);
        });
      }

      return {
        totalDocuments: uniqueDocuments.size,
        totalChunks: totalChunks,
        knowledgeLibraries: Object.fromEntries(categories)
      };
    } catch (error) {
      console.error("Error getting collection stats:", error);
      return { totalDocuments: 0, totalChunks: 0, knowledgeLibraries: {} };
    }
  }

  async isServerRunning(): Promise<boolean> {
    try {
      await this.client.heartbeat();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get available chunking strategies
  getAvailableChunkingStrategies(): string[] {
    return Array.from(this.chunkingStrategies.keys());
  }

  // Get chunking strategy info
  getChunkingStrategyInfo(strategyName: string): ChunkingStrategy | undefined {
    return this.chunkingStrategies.get(strategyName);
  }
}

// Create singleton instance
const documentService = new DocumentService();

export default documentService; 