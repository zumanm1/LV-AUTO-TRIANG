import documentService from './documentService';

interface OllamaConfig {
  serverUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
    top_p?: number;
    top_k?: number;
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
}

class OllamaService {
  private config: OllamaConfig;

  constructor(config: OllamaConfig) {
    this.config = config;
  }

  async generateResponse(prompt: string, mode: "direct" | "document" | "agent" = "direct"): Promise<string> {
    try {
      // Get custom system prompt from localStorage
      const customSystemPrompt = localStorage.getItem("systemPrompt");
      
      // For document and agent modes, search for relevant documents and knowledge libraries
      let relevantContext = "";
      if (mode === "document" || mode === "agent") {
        try {
          // Use enhanced search that includes knowledge libraries
          const enhancedResults = await documentService.enhancedSearch(prompt, 5);
          
          // Build comprehensive context
          let contextSections = [];
          
          // Add general documents
          if (enhancedResults.general.length > 0) {
            contextSections.push("=== Relevant Documentation ===");
            enhancedResults.general.forEach((result, index) => {
              contextSections.push(`[Doc ${index + 1} - ${result.metadata.filename}]\n${result.content}`);
            });
          }
          
          // Add error patterns if available
          if (enhancedResults.errorPatterns.length > 0) {
            contextSections.push("\n=== Known Error Patterns ===");
            enhancedResults.errorPatterns.forEach((result, index) => {
              contextSections.push(`[Error Pattern ${index + 1}]\n${result.content}`);
            });
          }
          
          // Add best practices if available
          if (enhancedResults.bestPractices.length > 0) {
            contextSections.push("\n=== Best Practices ===");
            enhancedResults.bestPractices.forEach((result, index) => {
              contextSections.push(`[Best Practice ${index + 1}]\n${result.content}`);
            });
          }
          
          if (contextSections.length > 0) {
            relevantContext = "\n\n" + contextSections.join("\n\n");
          }
        } catch (error) {
          console.error("Error searching enhanced documents:", error);
          // Fallback to basic document search
        try {
          const searchResults = await documentService.searchDocuments(prompt, 3);
          if (searchResults.length > 0) {
              relevantContext = "\n\nRelevant documentation:\n" + 
              searchResults.map((result, index) => 
                `[Document ${index + 1} - ${result.metadata.filename}]\n${result.content}\n`
              ).join("\n");
          }
          } catch (fallbackError) {
            console.error("Error with fallback document search:", fallbackError);
          }
        }
      }
      
      // Enhance prompt based on mode
      const enhancedPrompt = this.enhancePrompt(prompt, mode, customSystemPrompt, relevantContext);
      
      const request: OllamaRequest = {
        model: this.config.model,
        prompt: enhancedPrompt,
        stream: false,
        options: {
          temperature: this.config.temperature || 0.7,
          num_predict: this.config.maxTokens || 2048,
          top_p: 0.9,
          top_k: 40,
        },
      };

      const response = await fetch(`${this.config.serverUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama API error:', error);
      return this.getFallbackResponse(prompt, mode);
    }
  }

  // Enhanced prompt engineering with knowledge library context
  private enhancePrompt(prompt: string, mode: "direct" | "document" | "agent", customSystemPrompt?: string | null, relevantContext?: string): string {
    const systemPrompt = customSystemPrompt || `You are an AI Network Engineering Assistant specialized in Cisco networking. You help network engineers with configuration, troubleshooting, and best practices. 

Please provide helpful, accurate, and detailed responses. If the user asks about network concepts, explain them clearly. If they ask for configuration examples, provide practical examples. If they ask for troubleshooting help, provide step-by-step guidance.

When provided with error patterns, always reference them when identifying potential issues. When provided with best practices, incorporate them into your recommendations.`;

    const basePrompt = `${systemPrompt}

Current user query: ${prompt}${relevantContext || ""}

Response:`;

    switch (mode) {
      case "direct":
        return basePrompt;
      
      case "document":
        return `${basePrompt}

Note: You have access to uploaded network documentation and knowledge libraries. Please reference relevant documentation, error patterns, and best practices in your response when applicable. If error patterns are provided, use them to identify potential issues. If best practices are provided, incorporate them into your recommendations.`;
      
      case "agent":
        return `${basePrompt}

Note: You are operating in advanced agent mode with access to comprehensive knowledge libraries including error patterns and best practices. Please provide thorough, multi-step analysis and solutions:

1. If error patterns are provided, check the user's query against known error patterns
2. If best practices are provided, ensure your recommendations align with established best practices
3. Break down complex problems into actionable steps
4. Consider security implications and network stability
5. Provide configuration examples when relevant
6. Include validation steps and potential troubleshooting approaches

Your response should be comprehensive and leverage all available knowledge sources.`;
      
      default:
        return basePrompt;
    }
  }

  // Enhanced fallback response with knowledge library awareness
  private getFallbackResponse(prompt: string, mode: string): string {
    const baseResponse = `I apologize, but I'm currently unable to connect to the Ollama server. Please ensure that:

1. Ollama is installed and running
2. The server URL is correct (default: http://localhost:11434)
3. You have a model pulled (e.g., ollama pull llama3.2)

Your query was: "${prompt}"`;

    if (mode === "document" || mode === "agent") {
      return baseResponse + `

Note: This query was attempting to use enhanced RAG mode with knowledge libraries (error patterns and best practices). Once Ollama is running, you'll have access to:
- Comprehensive error pattern database for troubleshooting
- Best practices library for configuration guidance
- Enhanced document search capabilities

For now, I can provide general guidance on network engineering topics. Would you like me to help you with:
- Common Cisco IOS configuration patterns
- Network troubleshooting methodologies  
- Security best practices for network devices
- Standard network protocols and concepts`;
    }

    return baseResponse + `

For now, I can provide general guidance on network engineering topics. Would you like me to help you with:
- Network configuration examples
- Troubleshooting procedures
- Best practices for network management
- Common network protocols and concepts`;
  }

  async checkServerStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.serverUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.serverUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }

  updateConfig(newConfig: Partial<OllamaConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Get enhanced RAG status
  async getEnhancedRAGStatus(): Promise<{
    documentServiceConnected: boolean;
    knowledgeLibrariesLoaded: boolean;
    totalDocuments: number;
    totalChunks: number;
    knowledgeLibraries: any;
  }> {
    try {
      const isConnected = await documentService.isServerRunning();
      const stats = await documentService.getCollectionStats();
      
      return {
        documentServiceConnected: isConnected,
        knowledgeLibrariesLoaded: stats.knowledgeLibraries && Object.keys(stats.knowledgeLibraries).length > 0,
        totalDocuments: stats.totalDocuments,
        totalChunks: stats.totalChunks,
        knowledgeLibraries: stats.knowledgeLibraries
      };
    } catch (error) {
      return {
        documentServiceConnected: false,
        knowledgeLibrariesLoaded: false,
        totalDocuments: 0,
        totalChunks: 0,
        knowledgeLibraries: {}
      };
    }
  }
}

// Create a singleton instance
const ollamaService = new OllamaService({
  serverUrl: localStorage.getItem('ollamaConfig') 
    ? JSON.parse(localStorage.getItem('ollamaConfig')!).serverUrl 
    : 'http://localhost:11434',
  model: localStorage.getItem('aiConfig') 
    ? JSON.parse(localStorage.getItem('aiConfig')!).model 
    : 'llama3.2:1b',
  temperature: localStorage.getItem('aiConfig') 
    ? JSON.parse(localStorage.getItem('aiConfig')!).temperature 
    : 0.7,
  maxTokens: localStorage.getItem('aiConfig') 
    ? JSON.parse(localStorage.getItem('aiConfig')!).maxTokens 
    : 2048,
});

export default ollamaService; 