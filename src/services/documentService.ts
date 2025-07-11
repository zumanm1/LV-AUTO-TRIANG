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

class DocumentService {
  private client: ChromaClient;
  private collection: any;
  private isInitialized: boolean = false;

  constructor() {
    this.client = new ChromaClient({
      path: "http://localhost:8000" // Default ChromaDB server
    });
    this.initializeCollection();
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

  async addDocument(document: Document): Promise<boolean> {
    if (!this.isInitialized) {
      console.error("Document service not initialized");
      return false;
    }

    try {
      // Split document into chunks for better retrieval
      const chunks = this.splitDocumentIntoChunks(document.content);
      
      const ids = chunks.map((_, index) => `${document.id}_chunk_${index}`);
      const documents = chunks;
      const metadatas = chunks.map(() => ({
        filename: document.metadata.filename,
        fileType: document.metadata.fileType,
        uploadDate: document.metadata.uploadDate,
        size: document.metadata.size,
        category: document.metadata.category || "general"
      }));

      await this.collection.add({
        ids: ids,
        documents: documents,
        metadatas: metadatas
      });

      console.log(`Document ${document.metadata.filename} added successfully with ${chunks.length} chunks`);
      return true;
    } catch (error) {
      console.error("Error adding document:", error);
      return false;
    }
  }

  async searchDocuments(query: string, limit: number = 5): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      console.error("Document service not initialized");
      return [];
    }

    try {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: limit
      });

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

  async getCollectionStats(): Promise<{ totalDocuments: number; totalChunks: number }> {
    if (!this.isInitialized) {
      return { totalDocuments: 0, totalChunks: 0 };
    }

    try {
      const results = await this.collection.get({
        limit: 10000
      });

      const totalChunks = results.ids ? results.ids.length : 0;
      const uniqueDocuments = new Set();
      
      if (results.ids) {
        results.ids.forEach((id: string) => {
          const originalId = id.split('_chunk_')[0];
          uniqueDocuments.add(originalId);
        });
      }

      return {
        totalDocuments: uniqueDocuments.size,
        totalChunks: totalChunks
      };
    } catch (error) {
      console.error("Error getting collection stats:", error);
      return { totalDocuments: 0, totalChunks: 0 };
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
}

// Create singleton instance
const documentService = new DocumentService();

export default documentService; 