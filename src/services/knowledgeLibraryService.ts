import errorPatterns from '../knowledge/error-patterns.json';
import bestPractices from '../knowledge/best-practices.json';
import networkProtocols from '../knowledge/network-protocols.json';

export interface ErrorPattern {
  id: string;
  category: string;
  pattern: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  solutions: string[];
  examples: string[];
}

export interface BestPractice {
  id: string;
  category: string;
  title: string;
  description: string;
  implementation: string;
  benefits: string[];
  examples: string[];
}

export interface NetworkProtocol {
  id: string;
  name: string;
  description: string;
  configuration: string;
  troubleshooting: string[];
  bestPractices: string[];
}

class KnowledgeLibraryService {
  private errorPatterns: ErrorPattern[] = errorPatterns;
  private bestPractices: BestPractice[] = bestPractices;
  private networkProtocols: NetworkProtocol[] = networkProtocols;

  // Error Pattern Methods
  async searchErrorPatterns(query: string, category?: string): Promise<ErrorPattern[]> {
    const searchTerm = query.toLowerCase();
    let results = this.errorPatterns;

    if (category) {
      results = results.filter(pattern => 
        pattern.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    return results.filter(pattern =>
      pattern.pattern.toLowerCase().includes(searchTerm) ||
      pattern.description.toLowerCase().includes(searchTerm) ||
      pattern.solutions.some(solution => solution.toLowerCase().includes(searchTerm))
    );
  }

  async getErrorPatternById(id: string): Promise<ErrorPattern | null> {
    return this.errorPatterns.find(pattern => pattern.id === id) || null;
  }

  async getErrorPatternsByCategory(category: string): Promise<ErrorPattern[]> {
    return this.errorPatterns.filter(pattern => 
      pattern.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getErrorPatternsBySeverity(severity: string): Promise<ErrorPattern[]> {
    return this.errorPatterns.filter(pattern => 
      pattern.severity === severity
    );
  }

  // Best Practice Methods
  async searchBestPractices(query: string, category?: string): Promise<BestPractice[]> {
    const searchTerm = query.toLowerCase();
    let results = this.bestPractices;

    if (category) {
      results = results.filter(practice => 
        practice.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    return results.filter(practice =>
      practice.title.toLowerCase().includes(searchTerm) ||
      practice.description.toLowerCase().includes(searchTerm) ||
      practice.implementation.toLowerCase().includes(searchTerm)
    );
  }

  async getBestPracticeById(id: string): Promise<BestPractice | null> {
    return this.bestPractices.find(practice => practice.id === id) || null;
  }

  async getBestPracticesByCategory(category: string): Promise<BestPractice[]> {
    return this.bestPractices.filter(practice => 
      practice.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Network Protocol Methods
  async searchNetworkProtocols(query: string): Promise<NetworkProtocol[]> {
    const searchTerm = query.toLowerCase();
    return this.networkProtocols.filter(protocol =>
      protocol.name.toLowerCase().includes(searchTerm) ||
      protocol.description.toLowerCase().includes(searchTerm) ||
      protocol.configuration.toLowerCase().includes(searchTerm)
    );
  }

  async getNetworkProtocolById(id: string): Promise<NetworkProtocol | null> {
    return this.networkProtocols.find(protocol => protocol.id === id) || null;
  }

  // Combined Search Methods
  async searchAllKnowledge(query: string): Promise<{
    errorPatterns: ErrorPattern[];
    bestPractices: BestPractice[];
    networkProtocols: NetworkProtocol[];
  }> {
    const [errorPatterns, bestPractices, networkProtocols] = await Promise.all([
      this.searchErrorPatterns(query),
      this.searchBestPractices(query),
      this.searchNetworkProtocols(query)
    ]);

    return {
      errorPatterns,
      bestPractices,
      networkProtocols
    };
  }

  // Validation Methods
  async validateConfiguration(config: string): Promise<{
    errors: ErrorPattern[];
    recommendations: BestPractice[];
    protocols: NetworkProtocol[];
  }> {
    const searchResults = await this.searchAllKnowledge(config);
    
    return {
      errors: searchResults.errorPatterns.filter(pattern => 
        pattern.severity === 'high' || pattern.severity === 'critical'
      ),
      recommendations: searchResults.bestPractices,
      protocols: searchResults.networkProtocols
    };
  }

  // Statistics Methods
  async getKnowledgeStats(): Promise<{
    totalErrorPatterns: number;
    totalBestPractices: number;
    totalNetworkProtocols: number;
    categories: string[];
    severityDistribution: Record<string, number>;
  }> {
    const categories = [...new Set([
      ...this.errorPatterns.map(p => p.category),
      ...this.bestPractices.map(p => p.category)
    ])];

    const severityDistribution = this.errorPatterns.reduce((acc, pattern) => {
      acc[pattern.severity] = (acc[pattern.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrorPatterns: this.errorPatterns.length,
      totalBestPractices: this.bestPractices.length,
      totalNetworkProtocols: this.networkProtocols.length,
      categories,
      severityDistribution
    };
  }

  // Library Management Methods
  getLibraryStats(): { errorPatterns: number; bestPractices: number } {
    return {
      errorPatterns: this.errorPatterns.length,
      bestPractices: this.bestPractices.length
    };
  }

  async loadKnowledgeLibraries(): Promise<boolean> {
    try {
      // Libraries are already loaded from imports
      return this.errorPatterns.length > 0 && this.bestPractices.length > 0;
    } catch (error) {
      console.error("Error loading knowledge libraries:", error);
      return false;
    }
  }

  async uploadLibrariesToChromaDB(): Promise<boolean> {
    try {
      // Import documentService to upload to ChromaDB
      const documentService = (await import('./documentService')).default;
      
      // Upload error patterns
      for (const pattern of this.errorPatterns) {
        const document = {
          id: `error_pattern_${pattern.id}`,
          content: `${pattern.pattern}\n\n${pattern.description}\n\nSolutions:\n${pattern.solutions.join('\n')}\n\nExamples:\n${pattern.examples.join('\n')}`,
          metadata: {
            filename: `error_pattern_${pattern.id}.txt`,
            fileType: 'text',
            uploadDate: new Date().toISOString(),
            size: 0,
            category: "error_patterns",
            pattern: pattern.pattern,
            severity: pattern.severity,
            category_type: pattern.category
          }
        };
        await documentService.addDocument(document, 'knowledge');
      }

      // Upload best practices
      for (const practice of this.bestPractices) {
        const document = {
          id: `best_practice_${practice.id}`,
          content: `${practice.title}\n\n${practice.description}\n\nImplementation:\n${practice.implementation}\n\nBenefits:\n${practice.benefits.join('\n')}\n\nExamples:\n${practice.examples.join('\n')}`,
          metadata: {
            filename: `best_practice_${practice.id}.txt`,
            fileType: 'text',
            uploadDate: new Date().toISOString(),
            size: 0,
            category: "best_practices",
            title: practice.title,
            category_type: practice.category
          }
        };
        await documentService.addDocument(document, 'knowledge');
      }

      // Upload network protocols
      for (const protocol of this.networkProtocols) {
        const document = {
          id: `network_protocol_${protocol.id}`,
          content: `${protocol.name}\n\n${protocol.description}\n\nConfiguration:\n${protocol.configuration}\n\nTroubleshooting:\n${protocol.troubleshooting.join('\n')}\n\nBest Practices:\n${protocol.bestPractices.join('\n')}`,
          metadata: {
            filename: `network_protocol_${protocol.id}.txt`,
            fileType: 'text',
            uploadDate: new Date().toISOString(),
            size: 0,
            category: "network_protocols",
            name: protocol.name
          }
        };
        await documentService.addDocument(document, 'knowledge');
      }

      return true;
    } catch (error) {
      console.error("Error uploading knowledge libraries to ChromaDB:", error);
      return false;
    }
  }
}

const knowledgeLibraryService = new KnowledgeLibraryService();
export default knowledgeLibraryService; 