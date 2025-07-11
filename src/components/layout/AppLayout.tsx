import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  MessageSquare,
  FileText,
  Network,
  BarChart3,
  Settings,
  Brain,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps = {}) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true for UI scaffolding
  const [username, setUsername] = useState("admin"); // Default username for UI scaffolding

  // Navigation items
  const navItems = [
    { path: "/", icon: <LayoutGrid size={20} />, label: "Dashboard" },
    {
      path: "/chat",
      icon: <MessageSquare size={20} />,
      label: "Chat Interface",
    },
    { path: "/documents", icon: <FileText size={20} />, label: "Documents" },
    { path: "/network", icon: <Network size={20} />, label: "Network Ops" },
    { path: "/analytics", icon: <BarChart3 size={20} />, label: "Analytics" },
    { path: "/config", icon: <Settings size={20} />, label: "Configuration" },
    { path: "/genai", icon: <Brain size={20} />, label: "GenAI Automation" },
  ];

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Login form
  const LoginForm = () => {
    const [loginUsername, setLoginUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (loginUsername && password) {
        setIsAuthenticated(true);
        setUsername(loginUsername);
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md p-6 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              AI Network Engineering Assistant
            </h1>
            <p className="text-muted-foreground">
              Login to access the platform
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Login
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground pt-2">
                <span>Don't have an account? </span>
                <a href="#" className="text-primary hover:underline">
                  Register
                </a>
              </div>
            </div>
          </form>
        </Card>
      </div>
    );
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card flex flex-col">
        {/* Logo and title */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Network AI Assistant
          </h1>
        </div>

        {/* User info */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{username}</p>
              <p className="text-xs text-muted-foreground">Network Engineer</p>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="p-4 border-b">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-md">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-sm font-medium">System Online</span>
            </div>
            <p className="text-xs mt-1">All services running</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <span
                      className={
                        isActive ? "text-primary" : "text-muted-foreground"
                      }
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b flex items-center px-6 bg-card">
          <h2 className="text-xl font-semibold">
            {navItems.find((item) => item.path === location.pathname)?.label ||
              "Dashboard"}
          </h2>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
