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
      
      // For document and agent modes, search for relevant documents
      let relevantDocuments = "";
      if (mode === "document" || mode === "agent") {
        try {
          const searchResults = await documentService.searchDocuments(prompt, 3);
          if (searchResults.length > 0) {
            relevantDocuments = "\n\nRelevant documentation:\n" + 
              searchResults.map((result, index) => 
                `[Document ${index + 1} - ${result.metadata.filename}]\n${result.content}\n`
              ).join("\n");
          }
        } catch (error) {
          console.error("Error searching documents:", error);
        }
      }
      
      // Enhance prompt based on mode
      const enhancedPrompt = this.enhancePrompt(prompt, mode, customSystemPrompt, relevantDocuments);
      
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

  private enhancePrompt(prompt: string, mode: "direct" | "document" | "agent", customSystemPrompt?: string | null, relevantDocuments?: string): string {
    const systemPrompt = customSystemPrompt || `You are an AI Network Engineering Assistant. You help network engineers with configuration, troubleshooting, and best practices. 

Please provide a helpful, accurate, and detailed response. If the user asks about network concepts, explain them clearly. If they ask for configuration examples, provide practical examples. If they ask for troubleshooting help, provide step-by-step guidance.`;

    const basePrompt = `${systemPrompt}

Current user query: ${prompt}${relevantDocuments || ""}

Response:`;

    switch (mode) {
      case "direct":
        return basePrompt;
      
      case "document":
        return `${basePrompt}

Note: The user has uploaded network documentation. Please reference relevant documentation in your response when applicable.`;
      
      case "agent":
        return `${basePrompt}

Note: You are operating in advanced agent mode. Please provide comprehensive, multi-step analysis and solutions. Break down complex problems into actionable steps.`;
      
      default:
        return basePrompt;
    }
  }

  private getFallbackResponse(prompt: string, mode: string): string {
    return `I apologize, but I'm currently unable to connect to the Ollama server. Please ensure that:

1. Ollama is installed and running
2. The server URL is correct (default: http://localhost:11434)
3. You have a model pulled (e.g., ollama pull llama3.2)

Your query was: "${prompt}"

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