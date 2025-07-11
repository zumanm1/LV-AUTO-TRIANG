import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  MessageSquare,
  FileText,
  Server,
  Settings,
  BarChart3,
  Brain,
  Activity,
} from "lucide-react";

const Home = () => {
  // Mock data for dashboard
  const stats = {
    totalInteractions: 124,
    documents: 18,
    devices: 6,
    models: 7,
  };

  const recentInteractions = [
    {
      id: 1,
      mode: "Direct AI",
      query: "How to configure OSPF on Cisco routers?",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      mode: "Document Enhanced",
      query: "What are the best practices for BGP route filtering?",
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      mode: "Advanced Agent",
      query: "Diagnose potential causes for intermittent connectivity on R15",
      timestamp: "1 day ago",
    },
  ];

  const deviceStatus = [
    {
      name: "R15",
      status: "online",
      ip: "172.16.39.102",
      lastCheck: "2 min ago",
    },
    {
      name: "R16",
      status: "online",
      ip: "172.16.39.103",
      lastCheck: "2 min ago",
    },
    {
      name: "R17",
      status: "offline",
      ip: "172.16.39.104",
      lastCheck: "15 min ago",
    },
    {
      name: "R18",
      status: "online",
      ip: "172.16.39.105",
      lastCheck: "2 min ago",
    },
  ];

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h1 className="text-3xl font-bold mb-2">
          AI Network Engineering Assistant
        </h1>
        <p className="text-lg opacity-90">
          Advanced AI-powered network management and troubleshooting
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInteractions}</div>
            <Progress className="mt-2" value={65} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documents}</div>
            <Progress className="mt-2" value={40} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.devices}</div>
            <Progress className="mt-2" value={100} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.models}</div>
            <Progress className="mt-2" value={85} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/chat">
          <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-indigo-500 mb-2" />
              <CardTitle>Chat Interface</CardTitle>
              <CardDescription>
                Interact with AI for network engineering assistance
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-between">
                Start Chat <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>

        <Link to="/documents">
          <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader>
              <FileText className="h-8 w-8 text-indigo-500 mb-2" />
              <CardTitle>Document Manager</CardTitle>
              <CardDescription>
                Upload and manage network documentation
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-between">
                Manage Documents <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>

        <Link to="/genai">
          <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader>
              <Brain className="h-8 w-8 text-indigo-500 mb-2" />
              <CardTitle>GenAI Automation</CardTitle>
              <CardDescription>
                Transform natural language into validated network commands
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-between">
                GenAI Automation <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </div>

      {/* Dashboard Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="interactions">
            <TabsList className="mb-4">
              <TabsTrigger value="interactions">
                Recent Interactions
              </TabsTrigger>
              <TabsTrigger value="devices">Device Status</TabsTrigger>
            </TabsList>

            <TabsContent value="interactions">
              <Card>
                <CardHeader>
                  <CardTitle>Recent AI Interactions</CardTitle>
                  <CardDescription>
                    Your latest network engineering queries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentInteractions.map((interaction) => (
                      <div
                        key={interaction.id}
                        className="flex items-start space-x-4 p-3 rounded-lg border"
                      >
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${interaction.id}`}
                          />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {interaction.mode}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {interaction.timestamp}
                            </span>
                          </div>
                          <p className="text-sm">{interaction.query}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Interactions
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="devices">
              <Card>
                <CardHeader>
                  <CardTitle>Network Devices</CardTitle>
                  <CardDescription>
                    Status of connected network devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deviceStatus.map((device) => (
                      <div
                        key={device.name}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center space-x-4">
                          <Server className="h-5 w-5 text-indigo-500" />
                          <div>
                            <p className="font-medium">{device.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {device.ip}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-muted-foreground">
                            Last check: {device.lastCheck}
                          </span>
                          <Badge
                            variant={
                              device.status === "online"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {device.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Devices
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Available tools and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Settings className="h-5 w-5 text-indigo-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Configuration</h4>
                    <p className="text-sm text-muted-foreground">
                      Customize AI models and settings
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start space-x-3">
                  <Brain className="h-5 w-5 text-indigo-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">GenAI Automation</h4>
                    <p className="text-sm text-muted-foreground">
                      Automate network tasks with AI
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start space-x-3">
                  <BarChart3 className="h-5 w-5 text-indigo-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      View usage statistics and insights
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start space-x-3">
                  <Activity className="h-5 w-5 text-indigo-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Network Monitoring</h4>
                    <p className="text-sm text-muted-foreground">
                      Real-time device monitoring
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Explore All Features
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
