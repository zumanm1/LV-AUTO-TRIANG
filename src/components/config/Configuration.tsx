import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  Brain, 
  Settings, 
  Network, 
  Shield, 
  Key, 
  Server, 
  Globe, 
  Database,
  Save,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";

interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  agentType: string;
}

interface OllamaConfig {
  serverUrl: string;
  defaultModel: string;
  isRunning: boolean;
}

interface NetworkConfig {
  sshTimeout: number;
  telnetTimeout: number;
  maxConcurrentConnections: number;
  enableLogging: boolean;
}

interface SystemConfig {
  theme: string;
  language: string;
  autoSave: boolean;
  notifications: boolean;
}

const Configuration: React.FC = () => {
  const [activeTab, setActiveTab] = useState("ai-config");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: "ollama",
    apiKey: "",
    model: "phi4-mini:latest",
    temperature: 0.7,
    maxTokens: 2048,
    agentType: "direct"
  });

  // Ollama Configuration State
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>({
    serverUrl: "http://localhost:11434",
    defaultModel: "phi4-mini:latest",
    isRunning: false
  });

  // Network Configuration State
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>({
    sshTimeout: 30,
    telnetTimeout: 30,
    maxConcurrentConnections: 10,
    enableLogging: true
  });

  // System Configuration State
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    theme: "dark",
    language: "en",
    autoSave: true,
    notifications: true
  });

  // Load saved configuration from localStorage
  useEffect(() => {
    const savedAiConfig = localStorage.getItem("aiConfig");
    const savedOllamaConfig = localStorage.getItem("ollamaConfig");
    const savedNetworkConfig = localStorage.getItem("networkConfig");
    const savedSystemConfig = localStorage.getItem("systemConfig");

    if (savedAiConfig) setAiConfig(JSON.parse(savedAiConfig));
    if (savedOllamaConfig) setOllamaConfig(JSON.parse(savedOllamaConfig));
    if (savedNetworkConfig) setNetworkConfig(JSON.parse(savedNetworkConfig));
    if (savedSystemConfig) setSystemConfig(JSON.parse(savedSystemConfig));
  }, []);

  // Check Ollama server status
  useEffect(() => {
    const checkOllamaStatus = async () => {
      try {
        const response = await fetch(`${ollamaConfig.serverUrl}/api/tags`);
        setOllamaConfig(prev => ({ ...prev, isRunning: response.ok }));
      } catch (error) {
        setOllamaConfig(prev => ({ ...prev, isRunning: false }));
      }
    };

    if (ollamaConfig.serverUrl) {
      checkOllamaStatus();
    }
  }, [ollamaConfig.serverUrl]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      // Save configurations to localStorage
      localStorage.setItem("aiConfig", JSON.stringify(aiConfig));
      localStorage.setItem("ollamaConfig", JSON.stringify(ollamaConfig));
      localStorage.setItem("networkConfig", JSON.stringify(networkConfig));
      localStorage.setItem("systemConfig", JSON.stringify(systemConfig));

      // Simulate API call to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const aiProviders = [
    { id: "ollama", name: "🏠 Ollama (Local)", description: "Local Model", type: "local" },
    { id: "gemini", name: "🧠 Google Gemini 2.5 Pro", description: "Online API", type: "online" },
    { id: "claude", name: "🤖 Claude (Anthropic)", description: "Online API", type: "online" },
    { id: "openai", name: "🚀 OpenAI GPT-4", description: "Online API", type: "online" },
    { id: "huggingface", name: "🤗 Hugging Face", description: "Online API", type: "online" }
  ];

  const agentTypes = [
    { id: "direct", name: "Direct AI", description: "Simple AI responses" },
    { id: "rag", name: "RAG Enhanced", description: "Document-enhanced responses" },
    { id: "advanced", name: "Advanced Agent", description: "Multi-step reasoning" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your AI network assistant and API providers
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {saveStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Configuration saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Error saving configuration. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-config" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI & LLM
          </TabsTrigger>
          <TabsTrigger value="api-providers" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Providers
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* AI & LLM Configuration */}
        <TabsContent value="ai-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI & LLM Configuration
              </CardTitle>
              <CardDescription>
                Configure AI provider and model settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Provider Selection */}
              <div className="space-y-4">
                <Label>AI Provider</Label>
                <div className="grid gap-3">
                  {aiProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        aiConfig.provider === provider.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setAiConfig(prev => ({ ...prev, provider: provider.id }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg">{provider.name.split(" ")[0]}</div>
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-sm text-muted-foreground">{provider.description}</div>
                        </div>
                      </div>
                      <Badge variant={provider.type === "local" ? "default" : "secondary"}>
                        {provider.type === "local" ? "Local" : "Online"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Configuration */}
              {aiConfig.provider === "ollama" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ollama Model</Label>
                      <Input
                        value={aiConfig.model}
                        onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="phi4-mini:latest"
                      />
                    </div>
                    <div>
                      <Label>Server Status</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${ollamaConfig.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">
                          {ollamaConfig.isRunning ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Model Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Temperature: {aiConfig.temperature}</Label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={aiConfig.temperature}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Lower = more focused, Higher = more creative
                  </div>
                </div>
                <div>
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={aiConfig.maxTokens}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    min="1"
                    max="8192"
                  />
                </div>
              </div>

              {/* Agent Type */}
              <div>
                <Label>Agent Type</Label>
                <Select value={aiConfig.agentType} onValueChange={(value) => setAiConfig(prev => ({ ...prev, agentType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Providers Configuration */}
        <TabsContent value="api-providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Provider Configuration
              </CardTitle>
              <CardDescription>
                Configure API keys for online LLM providers and local Ollama setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Online API Providers */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Online API Providers</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      🧠 Google Gemini 2.5 Pro API Key
                    </Label>
                    <Input
                      type="password"
                      placeholder="AIza..."
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Get your API key from <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
                    </p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      🤖 Claude (Anthropic) API Key
                    </Label>
                    <Input
                      type="password"
                      placeholder="sk-ant-..."
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Get your API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Anthropic Console</a>
                    </p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      🚀 OpenAI API Key
                    </Label>
                    <Input
                      type="password"
                      placeholder="sk-..."
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Get your API key from <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
                    </p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      🤗 Hugging Face API Key
                    </Label>
                    <Input
                      type="password"
                      placeholder="hf_..."
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Get your API key from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Hugging Face Settings</a>
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Local Ollama Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Local Ollama Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ollama Server URL</Label>
                    <Input
                      value={ollamaConfig.serverUrl}
                      onChange={(e) => setOllamaConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
                      placeholder="http://localhost:11434"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Default: http://localhost:11434</p>
                  </div>
                  <div>
                    <Label>Default Model</Label>
                    <Input
                      value={ollamaConfig.defaultModel}
                      onChange={(e) => setOllamaConfig(prev => ({ ...prev, defaultModel: e.target.value }))}
                      placeholder="phi4-mini:latest"
                    />
                  </div>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Ollama Setup Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="space-y-1">
                      <p><strong>1.</strong> Install Ollama:</p>
                      <code className="block bg-blue-100 p-2 rounded text-xs">curl -fsSL https://ollama.ai/install.sh | sh</code>
                    </div>
                    <div className="space-y-1">
                      <p><strong>2.</strong> Pull a model:</p>
                      <code className="block bg-blue-100 p-2 rounded text-xs">ollama pull llama3.2</code>
                    </div>
                    <div className="space-y-1">
                      <p><strong>3.</strong> Start server:</p>
                      <code className="block bg-blue-100 p-2 rounded text-xs">ollama serve</code>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert className="border-yellow-200 bg-yellow-50">
                <Shield className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Security Notice:</strong> API keys are stored locally in your browser's localStorage. 
                  For production use, consider using Supabase for secure secret management.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Settings */}
        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                Network Settings
              </CardTitle>
              <CardDescription>
                Configure network connection parameters and device management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SSH Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={networkConfig.sshTimeout}
                    onChange={(e) => setNetworkConfig(prev => ({ ...prev, sshTimeout: parseInt(e.target.value) }))}
                    min="5"
                    max="300"
                  />
                </div>
                <div>
                  <Label>Telnet Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={networkConfig.telnetTimeout}
                    onChange={(e) => setNetworkConfig(prev => ({ ...prev, telnetTimeout: parseInt(e.target.value) }))}
                    min="5"
                    max="300"
                  />
                </div>
                <div>
                  <Label>Max Concurrent Connections</Label>
                  <Input
                    type="number"
                    value={networkConfig.maxConcurrentConnections}
                    onChange={(e) => setNetworkConfig(prev => ({ ...prev, maxConcurrentConnections: parseInt(e.target.value) }))}
                    min="1"
                    max="50"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-logging"
                    checked={networkConfig.enableLogging}
                    onCheckedChange={(checked) => setNetworkConfig(prev => ({ ...prev, enableLogging: checked }))}
                  />
                  <Label htmlFor="enable-logging">Enable Connection Logging</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Preferences */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Preferences
              </CardTitle>
              <CardDescription>
                Configure application appearance and behavior settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Theme</Label>
                  <Select value={systemConfig.theme} onValueChange={(value) => setSystemConfig(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Select value={systemConfig.language} onValueChange={(value) => setSystemConfig(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-save Configuration</Label>
                    <p className="text-sm text-muted-foreground">Automatically save changes to configuration</p>
                  </div>
                  <Switch
                    checked={systemConfig.autoSave}
                    onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, autoSave: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show system notifications and alerts</p>
                  </div>
                  <Switch
                    checked={systemConfig.notifications}
                    onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuration; 