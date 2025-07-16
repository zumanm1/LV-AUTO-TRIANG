import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Zap,
  CheckCircle2,
  AlertCircle,
  Settings,
  Play,
  Loader2,
  Shield,
  BookOpen,
} from "lucide-react";
import ollamaService from "@/services/ollamaService";
import documentService from "@/services/documentService";

interface Device {
  name: string;
  ip: string;
  type: string;
}

interface AutomationStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  details: string;
  timestamp?: string;
}

const GenAIAutomation = () => {
  // Mock devices - Cisco 3725 routers
  const devices: Device[] = [
    { name: "Dummy-RT1", ip: "10.255.255.3", type: "Cisco 3725" },
    { name: "Dummy-RT2", ip: "10.255.255.4", type: "Cisco 3725" },
    { name: "Real-RT1", ip: "172.16.39.102", type: "Cisco 3725" },
    { name: "Real-RT2", ip: "172.16.39.103", type: "Cisco 3725" },
  ];

  // State management
  const [networkIntent, setNetworkIntent] = useState(
    'from interface fastethernet0/0 and configure the interface description of "NEW-INT"',
  );
  const [selectedDevice, setSelectedDevice] = useState(
    "Dummy-RT1 (10.255.255.3)",
  );
  const [generatedCommands, setGeneratedCommands] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [automationSteps, setAutomationSteps] = useState<AutomationStep[]>([]);
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "validating" | "success" | "failed"
  >("idle");
  const [deploymentStatus, setDeploymentStatus] = useState<
    "idle" | "deploying" | "success" | "failed"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [enhancedRAGStatus, setEnhancedRAGStatus] = useState<any>(null);

  // Check enhanced RAG status on component mount
  React.useEffect(() => {
    const checkRAGStatus = async () => {
      try {
        const status = await ollamaService.getEnhancedRAGStatus();
        setEnhancedRAGStatus(status);
      } catch (error) {
        console.error('Error checking enhanced RAG status:', error);
      }
    };
    
    checkRAGStatus();
  }, []);

  // Generate commands using LLM + AI Agent
  const handleGenerateCommands = async () => {
    setIsGenerating(true);
    setErrorMessage("");

    try {
      const prompt = `You are an AI Network Engineering Assistant specialized in Cisco IOS configuration. 

User Intent: ${networkIntent}
Target Device: ${selectedDevice}

Please generate valid Cisco IOS configuration commands based on the user's intent. The commands should be:
1. Syntactically correct for Cisco IOS
2. Compatible with the target device type
3. Safe to execute
4. Include proper comments

Generate only the configuration commands, no explanations. Format the output as Cisco IOS commands with comments starting with "!".

Configuration commands:`;

      const commands = await ollamaService.generateResponse(prompt, "agent");
      setGeneratedCommands(commands);
    } catch (error) {
      console.error('Error generating commands:', error);
      setErrorMessage("Failed to generate commands. Please check your Ollama server connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhanced validation using AI Agent with knowledge libraries
  const handleValidateCommands = async () => {
    setIsValidating(true);
    setValidationStatus("validating");
    setErrorMessage("");

    const steps: AutomationStep[] = [
      {
        id: "1",
        name: "Error Pattern Analysis",
        status: "running",
        details: "Checking commands against known error patterns and common mistakes",
      },
      {
        id: "2",
        name: "Best Practices Validation",
        status: "pending",
        details: "Verifying commands follow industry best practices and security standards",
      },
      {
        id: "3",
        name: "Syntax & Compatibility Check",
        status: "pending",
        details: "Validating command syntax and device compatibility for Cisco 3725",
      },
      {
        id: "4",
        name: "Security & Impact Assessment",
        status: "pending",
        details: "Analyzing security implications and potential network impact",
      },
    ];

    setAutomationSteps(steps);

    try {
      // Use enhanced AI validation with knowledge libraries
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        let validationPrompt = "";

        // Create specialized prompts that leverage knowledge libraries
        switch (step.id) {
          case "1": // Error Pattern Analysis
            validationPrompt = `You are an AI Network Engineering Assistant performing error pattern analysis.

Configuration to validate:
${generatedCommands}

Task: ${step.details}

Please check the configuration against common Cisco IOS errors and known problem patterns. Look for:
- Syntax errors that commonly occur
- Missing parameters or incomplete commands
- Invalid IP addresses or subnet masks
- Common configuration mistakes

If error patterns are provided in the context, use them to identify potential issues. Respond with either "VALID" or "INVALID" followed by specific error details if found.

Analysis:`;
            break;

          case "2": // Best Practices Validation
            validationPrompt = `You are an AI Network Engineering Assistant performing best practices validation.

Configuration to validate:
${generatedCommands}

Task: ${step.details}

Please validate the configuration against Cisco networking best practices. Check for:
- Security best practices (password encryption, access controls)
- Interface documentation and descriptions
- Proper VLAN management
- Spanning tree configuration standards
- Network design principles

If best practices are provided in the context, ensure the configuration follows them. Respond with either "VALID" or "INVALID" followed by recommendations.

Validation:`;
            break;

          case "3": // Syntax & Compatibility
            validationPrompt = `You are an AI Network Engineering Assistant performing syntax and compatibility validation.

Configuration to validate:
${generatedCommands}

Task: ${step.details}
Target Device: ${selectedDevice}

Please validate:
- Command syntax correctness for Cisco IOS
- Device compatibility (Cisco 3725 specific)
- Parameter validity and completeness
- Command sequence and dependencies

Respond with either "VALID" or "INVALID" followed by specific syntax issues if found.

Validation:`;
            break;

          case "4": // Security & Impact Assessment
            validationPrompt = `You are an AI Network Engineering Assistant performing security and impact assessment.

Configuration to validate:
${generatedCommands}

Task: ${step.details}

Please assess:
- Security implications of the configuration changes
- Potential impact on network operations
- Risk level and mitigation strategies
- Compliance with security standards

Respond with either "VALID" or "INVALID" followed by security concerns and impact analysis.

Assessment:`;
            break;
        }

        // Use agent mode to get enhanced validation with knowledge libraries
        const validationResult = await ollamaService.generateResponse(validationPrompt, "agent");
        
        // Update the current step
        setAutomationSteps((prev) =>
          prev.map((s, index) => {
            if (index === i) {
              return {
                ...s,
                status: validationResult.toLowerCase().includes("valid") && !validationResult.toLowerCase().includes("invalid") ? "completed" : "failed",
                details: validationResult,
                timestamp: new Date().toLocaleTimeString(),
              };
            } else if (index === i + 1 && i < steps.length - 1) {
              return { ...s, status: "running" };
            }
            return s;
          }),
        );

        // Add delay between steps for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Check if all steps passed
      const finalSteps = await new Promise<AutomationStep[]>((resolve) => {
        setAutomationSteps((prev) => {
          resolve(prev);
          return prev;
        });
      });
      
      const allPassed = finalSteps.every(step => step.status === "completed");
      setValidationStatus(allPassed ? "success" : "failed");
      
    } catch (error) {
      console.error('Error during validation:', error);
      setErrorMessage("Failed to validate commands. Please check your Ollama server connection.");
      setValidationStatus("failed");
    } finally {
      setIsValidating(false);
    }
  };

  // Deploy configuration
  const handleDeployConfiguration = () => {
    setIsDeploying(true);
    setDeploymentStatus("deploying");
    setErrorMessage("");

    // Simulate deployment process
    setTimeout(() => {
      // Simulate random error for demonstration
      if (Math.random() > 0.7) {
        setErrorMessage(
          "Error: An unexpected error occurred during the automation flow.",
        );
        setDeploymentStatus("failed");
      } else {
        setDeploymentStatus("success");
      }
      setIsDeploying(false);
    }, 3000);
  };

  // Reset automation flow
  const handleReset = () => {
    setGeneratedCommands("");
    setAutomationSteps([]);
    setValidationStatus("idle");
    setDeploymentStatus("idle");
    setErrorMessage("");
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50";
      case "running":
        return "border-blue-200 bg-blue-50";
      case "failed":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Enhanced GenAI Network Automation</h1>
        <p className="text-gray-500">
          Transform natural language into validated network commands using enhanced RAG with error patterns and best practices
        </p>
        
        {/* Enhanced RAG Status */}
        {enhancedRAGStatus && (
          <div className="mt-4">
            <Alert className={enhancedRAGStatus.knowledgeLibrariesLoaded ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              <Brain className={`h-4 w-4 ${enhancedRAGStatus.knowledgeLibrariesLoaded ? "text-green-600" : "text-yellow-600"}`} />
              <AlertDescription>
                {enhancedRAGStatus.knowledgeLibrariesLoaded ? (
                  <span className="text-green-800">
                    🚀 Enhanced RAG Active: {Object.entries(enhancedRAGStatus.knowledgeLibraries).map(([key, value]) => 
                      `${key}: ${value}`
                    ).join(", ")} | Total Documents: {enhancedRAGStatus.totalDocuments}
                  </span>
                ) : (
                  <span className="text-yellow-800">
                    ⚠️ Basic RAG Mode: Knowledge libraries not loaded. Go to Documents → Knowledge Libraries to enable enhanced validation.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                Network Intent Description
              </CardTitle>
              <CardDescription>
                Describe your network intent in natural language. The enhanced RAG system will validate against error patterns and best practices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="intent" className="text-sm font-medium">
                  Describe your network intent
                </label>
                <Textarea
                  id="intent"
                  placeholder="e.g., Configure interface FastEthernet0/0 with IP 192.168.1.1/24 and enable OSPF area 0"
                  value={networkIntent}
                  onChange={(e) => setNetworkIntent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="device" className="text-sm font-medium">
                  Target Device
                </label>
                <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target device" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((device) => (
                      <SelectItem
                        key={device.name}
                        value={`${device.name} (${device.ip})`}
                      >
                        {device.name} - {device.ip} ({device.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateCommands}
                disabled={isGenerating || !networkIntent.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Commands...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Commands
                  </>
                )}
              </Button>

              {enhancedRAGStatus?.knowledgeLibrariesLoaded && (
                <div className="text-xs text-green-600 text-center">
                  ✨ Using enhanced generation with best practices
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Commands */}
          {generatedCommands && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Commands</CardTitle>
                <CardDescription>
                  AI-generated Cisco IOS configuration commands
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedCommands}
                  onChange={(e) => setGeneratedCommands(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Generated commands will appear here..."
                />
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleValidateCommands}
                  disabled={isValidating || !generatedCommands.trim()}
                  className="mr-2"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Validate Commands
                    </>
                  )}
                </Button>
                
                {enhancedRAGStatus?.knowledgeLibrariesLoaded && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <BookOpen className="mr-1 h-3 w-3" />
                    Enhanced Validation
                  </Badge>
                )}
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Validation & Deployment Section */}
        <div className="space-y-6">
          {/* Validation Steps */}
          {automationSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Validation Pipeline</CardTitle>
                <CardDescription>
                  Multi-step validation using error patterns and best practices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {automationSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-3 border rounded-lg ${getStepStatusColor(step.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStepIcon(step.status)}
                        <span className="font-medium">{step.name}</span>
                      </div>
                      {step.timestamp && (
                        <span className="text-xs text-gray-500">
                          {step.timestamp}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 ml-6">
                      {step.details}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Deployment Section */}
          {validationStatus === "success" && (
            <Card>
              <CardHeader>
                <CardTitle>Deployment</CardTitle>
                <CardDescription>
                  Deploy validated configuration to target device
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleDeployConfiguration}
                  disabled={isDeploying}
                  className="w-full"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Deploy Configuration
                    </>
                  )}
                </Button>

                {deploymentStatus === "success" && (
                  <Alert className="mt-4 border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Configuration deployed successfully!
                    </AlertDescription>
                  </Alert>
                )}

                {deploymentStatus === "failed" && (
                  <Alert className="mt-4 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Deployment failed. Please check the configuration and try again.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error Messages */}
          {errorMessage && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Reset Button */}
          {(generatedCommands || automationSteps.length > 0) && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              Reset Workflow
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenAIAutomation;
