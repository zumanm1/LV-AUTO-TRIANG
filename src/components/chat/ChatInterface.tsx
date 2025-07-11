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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  FileText,
  Brain,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  mode?: "direct" | "document" | "agent";
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI Network Engineering Assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date().toISOString(),
      mode: "direct",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeMode, setActiveMode] = useState<"direct" | "document" | "agent">(
    "direct",
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
      mode: activeMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputMessage, activeMode),
        sender: "ai",
        timestamp: new Date().toISOString(),
        mode: activeMode,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (query: string, mode: string): string => {
    const responses = {
      direct: `Based on your query about "${query}", here's what I can help with: Network configuration, troubleshooting, and best practices. Would you like me to provide specific commands or explanations?`,
      document: `I've searched through your uploaded network documentation for "${query}". Here are the relevant findings from your documents, including configuration examples and troubleshooting guides.`,
      agent: `I'm analyzing your complex request about "${query}". Let me break this down into actionable steps and provide a comprehensive solution using advanced AI capabilities.`,
    };
    return responses[mode as keyof typeof responses];
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "direct":
        return <MessageSquare className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "agent":
        return <Brain className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "direct":
        return "bg-blue-500";
      case "document":
        return "bg-green-500";
      case "agent":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Chat Interface</h1>
        <p className="text-gray-500">
          Interact with AI for network engineering assistance
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mode Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Modes</CardTitle>
              <CardDescription>Choose your interaction mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant={activeMode === "direct" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveMode("direct")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Direct AI
              </Button>
              <Button
                variant={activeMode === "document" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveMode("document")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Document Enhanced
              </Button>
              <Button
                variant={activeMode === "agent" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveMode("agent")}
              >
                <Brain className="mr-2 h-4 w-4" />
                Advanced Agent
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Current Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div
                  className={`p-2 rounded-full ${getModeColor(activeMode)} text-white`}
                >
                  {getModeIcon(activeMode)}
                </div>
                <div>
                  <p className="font-medium capitalize">{activeMode} AI</p>
                  <p className="text-xs text-gray-500">
                    {activeMode === "direct" && "Direct AI responses"}
                    {activeMode === "document" && "Enhanced with documents"}
                    {activeMode === "agent" && "Advanced AI agent"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.sender === "user"
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        {message.sender === "user" ? (
                          <>
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=ai" />
                            <AvatarFallback>
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div
                        className={`flex-1 max-w-[80%] ${
                          message.sender === "user" ? "text-right" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {message.sender === "user" ? (
                            <>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  message.timestamp,
                                ).toLocaleTimeString()}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {message.mode}
                              </Badge>
                            </>
                          ) : (
                            <>
                              <Badge variant="outline" className="text-xs">
                                {message.mode}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  message.timestamp,
                                ).toLocaleTimeString()}
                              </span>
                            </>
                          )}
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            message.sender === "user"
                              ? "bg-blue-500 text-white ml-auto"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <div className="flex w-full space-x-2">
                <Textarea
                  placeholder="Ask me about network engineering..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 min-h-[40px] max-h-[120px]"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
