import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Terminal,
  Send,
  Save,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";

interface Device {
  id: string;
  name: string;
  ip: string;
  port: number;
  device_type: string;
  software_type: "cisco_ios_ssh" | "cisco_ios_telnet" | "cisco_ios_xr_ssh";
  username: string;
  password: string;
  status?: "online" | "offline" | "unknown";
}

interface CommandResponse {
  output: string;
  success: boolean;
  timestamp: string;
}

const NetworkOperations = () => {
  // Mock devices data - Cisco routers and switches
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "1",
      name: "Dummy-RT1",
      ip: "10.255.255.3",
      port: 23,
      device_type: "router",
      software_type: "cisco_ios_telnet",
      username: "admin",
      password: "cisco",
      status: "online",
    },
    {
      id: "2",
      name: "Dummy-RT2",
      ip: "10.255.255.4",
      port: 23,
      device_type: "router",
      software_type: "cisco_ios_telnet",
      username: "admin",
      password: "cisco",
      status: "online",
    },
    {
      id: "3",
      name: "Dummy-RT3",
      ip: "10.255.255.5",
      port: 23,
      device_type: "router",
      software_type: "cisco_ios_telnet",
      username: "admin",
      password: "cisco",
      status: "offline",
    },
    {
      id: "4",
      name: "R15",
      ip: "172.16.39.102",
      port: 32783,
      device_type: "router",
      software_type: "cisco_ios_telnet",
      username: "admin",
      password: "cisco",
      status: "online",
    },
    {
      id: "5",
      name: "R16",
      ip: "172.16.39.102",
      port: 32784,
      device_type: "router",
      software_type: "cisco_ios_telnet",
      username: "admin",
      password: "cisco",
      status: "online",
    },
    {
      id: "6",
      name: "R17",
      ip: "172.16.39.102",
      port: 32785,
      device_type: "router",
      software_type: "cisco_ios_ssh",
      username: "admin",
      password: "cisco",
      status: "unknown",
    },
  ]);

  // State for form inputs
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [username, setUsername] = useState<string>("admin");
  const [password, setPassword] = useState<string>("cisco");
  const [commands, setCommands] = useState<string>("");
  const [configText, setConfigText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<CommandResponse | null>(null);
  const [configRetrievalLogs, setConfigRetrievalLogs] = useState<string[]>([]);
  const [isRetrievingConfig, setIsRetrievingConfig] = useState<boolean>(false);

  // State for device management
  const [showAddDevice, setShowAddDevice] = useState<boolean>(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [newDevice, setNewDevice] = useState<Partial<Device>>({
    name: "",
    ip: "",
    port: 22,
    device_type: "router",
    software_type: "cisco_ios_ssh",
    username: "admin",
    password: "cisco",
  });

  // Handle adding a new device
  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.ip || !newDevice.port) {
      return;
    }

    const device: Device = {
      id: Date.now().toString(),
      name: newDevice.name,
      ip: newDevice.ip,
      port: newDevice.port,
      device_type: newDevice.device_type || "router",
      software_type: newDevice.software_type || "cisco_ios_ssh",
      username: newDevice.username || "admin",
      password: newDevice.password || "cisco",
      status: "unknown",
    };

    setDevices([...devices, device]);
    setNewDevice({
      name: "",
      ip: "",
      port: 22,
      device_type: "router",
      software_type: "cisco_ios_ssh",
      username: "admin",
      password: "cisco",
    });
    setShowAddDevice(false);
  };

  // Handle editing a device
  const handleEditDevice = (device: Device) => {
    setEditingDevice(device);
    setNewDevice({ ...device });
    setShowAddDevice(true);
  };

  // Handle updating a device
  const handleUpdateDevice = () => {
    if (!editingDevice || !newDevice.name || !newDevice.ip || !newDevice.port) {
      return;
    }

    const updatedDevice: Device = {
      ...editingDevice,
      name: newDevice.name,
      ip: newDevice.ip,
      port: newDevice.port,
      device_type: newDevice.device_type || "router",
      software_type: newDevice.software_type || "cisco_ios_ssh",
      username: newDevice.username || "admin",
      password: newDevice.password || "cisco",
    };

    setDevices(
      devices.map((d) => (d.id === editingDevice.id ? updatedDevice : d)),
    );
    setEditingDevice(null);
    setNewDevice({
      name: "",
      ip: "",
      port: 22,
      device_type: "router",
      software_type: "cisco_ios_ssh",
      username: "admin",
      password: "cisco",
    });
    setShowAddDevice(false);
  };

  // Handle deleting a device
  const handleDeleteDevice = (deviceId: string) => {
    setDevices(devices.filter((d) => d.id !== deviceId));
  };

  // Handle running commands
  const handleRunCommands = () => {
    if (!selectedDevice || !commands) {
      return;
    }

    setIsLoading(true);

    // Simulate API call with timeout
    setTimeout(() => {
      const device = devices.find((d) => d.name === selectedDevice);
      const isDummy = device?.name.startsWith("Dummy");
      const softwareType = device?.software_type || "cisco_ios_telnet";

      setResponse({
        output: `Running command on ${selectedDevice} (${softwareType.toUpperCase()}):\n${commands}\n\nOutput:\n${isDummy ? "DUMMY DEVICE SIMULATION" : "REAL DEVICE"}\nInterface                  IP-Address      OK? Method Status                Protocol\nFastEthernet0/0            192.168.1.1     YES NVRAM  up                    up      \nFastEthernet0/1            unassigned      YES NVRAM  administratively down down    \nSerial0/0                  10.1.1.1        YES NVRAM  up                    up      \nSerial0/1                  unassigned      YES NVRAM  administratively down down\n\nCisco IOS Software - Version 15.1(4)M`,
        success: true,
        timestamp: new Date().toISOString(),
      });
      setIsLoading(false);
    }, 1500);
  };

  // Handle pushing configuration
  const handlePushConfig = () => {
    if (!selectedDevice || !configText) {
      return;
    }

    setIsLoading(true);

    // Simulate API call with timeout
    setTimeout(() => {
      const device = devices.find((d) => d.name === selectedDevice);
      const isDummy = device?.name.startsWith("Dummy");
      const softwareType = device?.software_type || "cisco_ios_telnet";

      setResponse({
        output: `Pushing configuration to ${selectedDevice} (${softwareType.toUpperCase()}):\n${configText}\n\nOutput:\n${isDummy ? "DUMMY DEVICE SIMULATION" : "REAL DEVICE"}\nEntering configuration commands, one per line.  End with CNTL/Z.\nRouter(config)#\nRouter(config-if)#\n%SYS-5-CONFIG_I: Configured from console by console\nRouter#write memory\nBuilding configuration...\n[OK]\nRouter#\n\nConfiguration Applied Successfully`,
        success: true,
        timestamp: new Date().toISOString(),
      });
      setIsLoading(false);
    }, 2000);
  };

  // Handle config retrieval
  const handleConfigRetrieval = () => {
    if (!selectedDevice) return;

    setIsRetrievingConfig(true);
    setConfigRetrievalLogs([]);

    const device = devices.find((d) => d.name === selectedDevice);
    const isDummy = device?.name.startsWith("Dummy");
    const softwareType = device?.software_type || "cisco_ios_telnet";

    const steps = [
      `Connecting to ${selectedDevice} (${device?.ip}:${device?.port}) via ${softwareType.toUpperCase()}...`,
      `Authenticating with device...`,
      `Entering privileged mode...`,
      `Retrieving running configuration...`,
      `Parsing configuration data...`,
      `Extracting interface configurations...`,
      `Processing routing protocols...`,
      `Validating configuration syntax...`,
      `Configuration retrieval completed successfully`,
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setConfigRetrievalLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ${steps[stepIndex]}`,
        ]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setIsRetrievingConfig(false);

        // Set the retrieved config as response
        setResponse({
          output: `Configuration retrieved from ${selectedDevice} (${softwareType.toUpperCase()}):\n\n${isDummy ? "! DUMMY DEVICE SIMULATION\n" : "! REAL DEVICE\n"}version 15.1\nservice timestamps debug datetime msec\nservice timestamps log datetime msec\nno service password-encryption\n!\nhostname ${selectedDevice}\n!\ninterface GigabitEthernet0/0\n description LAN Interface\n ip address 192.168.1.1 255.255.255.0\n no shutdown\n!\ninterface GigabitEthernet0/1\n description WAN Interface\n no ip address\n shutdown\n!\ninterface Serial0/0\n description Point-to-Point Link\n ip address 10.1.1.1 255.255.255.252\n no shutdown\n!\nrouter ospf 1\n network 192.168.1.0 0.0.0.255 area 0\n network 10.1.1.0 0.0.0.3 area 0\n!\nline con 0\nline aux 0\nline vty 0 4\n password cisco\n login\n!\nend`,
          success: true,
          timestamp: new Date().toISOString(),
        });
      }
    }, 800);
  };

  // Get status badge color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Network Operations</h1>
        <p className="text-gray-500">
          Manage network devices, run commands, and push configurations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Management */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Terminal className="mr-2 h-5 w-5" /> Device Management
              </div>
              <Button
                onClick={() => {
                  setEditingDevice(null);
                  setNewDevice({
                    name: "",
                    ip: "",
                    port: 22,
                    device_type: "router",
                    software_type: "cisco_ios_ssh",
                    username: "admin",
                    password: "cisco",
                  });
                  setShowAddDevice(true);
                }}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Device
              </Button>
            </CardTitle>
            <CardDescription>
              Manage network devices (routers and switches)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showAddDevice && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingDevice ? "Edit Device" : "Add New Device"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Device Name</label>
                      <Input
                        placeholder="e.g., R15, SW1"
                        value={newDevice.name || ""}
                        onChange={(e) =>
                          setNewDevice({ ...newDevice, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">IP Address</label>
                      <Input
                        placeholder="e.g., 172.16.39.102"
                        value={newDevice.ip || ""}
                        onChange={(e) =>
                          setNewDevice({ ...newDevice, ip: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Port</label>
                      <Input
                        type="number"
                        placeholder="22 or 23"
                        value={newDevice.port || ""}
                        onChange={(e) =>
                          setNewDevice({
                            ...newDevice,
                            port: parseInt(e.target.value) || 22,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Device Type</label>
                      <Select
                        value={newDevice.device_type || "router"}
                        onValueChange={(value) =>
                          setNewDevice({ ...newDevice, device_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="router">Router</SelectItem>
                          <SelectItem value="switch">Switch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Software Type
                      </label>
                      <Select
                        value={newDevice.software_type || "cisco_ios_ssh"}
                        onValueChange={(value) => {
                          const softwareType = value as
                            | "cisco_ios_ssh"
                            | "cisco_ios_telnet"
                            | "cisco_ios_xr_ssh";
                          setNewDevice({
                            ...newDevice,
                            software_type: softwareType,
                            port: softwareType === "cisco_ios_telnet" ? 23 : 22,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cisco_ios_ssh">
                            Cisco IOS SSH
                          </SelectItem>
                          <SelectItem value="cisco_ios_telnet">
                            Cisco IOS Telnet
                          </SelectItem>
                          <SelectItem value="cisco_ios_xr_ssh">
                            Cisco IOS XR SSH
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username</label>
                      <Input
                        placeholder="admin"
                        value={newDevice.username || ""}
                        onChange={(e) =>
                          setNewDevice({
                            ...newDevice,
                            username: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        type="password"
                        placeholder="cisco"
                        value={newDevice.password || ""}
                        onChange={(e) =>
                          setNewDevice({
                            ...newDevice,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={
                      editingDevice ? handleUpdateDevice : handleAddDevice
                    }
                    disabled={
                      !newDevice.name || !newDevice.ip || !newDevice.port
                    }
                  >
                    {editingDevice ? "Update Device" : "Add Device"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddDevice(false);
                      setEditingDevice(null);
                    }}
                  >
                    Cancel
                  </Button>
                </CardFooter>
              </Card>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Name</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Software</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">
                        {device.name}
                      </TableCell>
                      <TableCell>{device.ip}</TableCell>
                      <TableCell>{device.port}</TableCell>
                      <TableCell className="capitalize">
                        {device.device_type}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {device.software_type
                            .replace(/_/g, " ")
                            .toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(device.status)}>
                          {device.status || "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditDevice(device)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDevice(device.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="commands" className="lg:col-span-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="commands">Run Commands</TabsTrigger>
            <TabsTrigger value="config">Push Configuration</TabsTrigger>
            <TabsTrigger value="retrieve">Retrieve Configuration</TabsTrigger>
          </TabsList>

          {/* Run Commands Tab */}
          <TabsContent value="commands">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Run Commands</CardTitle>
                  <CardDescription>
                    Execute commands on selected device
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="device" className="text-sm font-medium">
                      Select Device
                    </label>
                    <Select
                      value={selectedDevice}
                      onValueChange={setSelectedDevice}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a device" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map((device) => (
                          <SelectItem key={device.name} value={device.name}>
                            {device.name} ({device.ip})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="commands" className="text-sm font-medium">
                      Commands
                    </label>
                    <Textarea
                      id="commands"
                      placeholder="show ip int brief"
                      value={commands}
                      onChange={(e) => setCommands(e.target.value)}
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium">
                        Username
                      </label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleRunCommands}
                    disabled={isLoading || !selectedDevice || !commands}
                    className="w-full"
                  >
                    {isLoading ? (
                      <span className="flex items-center">Processing...</span>
                    ) : (
                      <span className="flex items-center">
                        <Send className="mr-2 h-4 w-4" /> Run Commands
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Command Output</CardTitle>
                  <CardDescription>Results from device</CardDescription>
                </CardHeader>
                <CardContent>
                  {response ? (
                    <div className="space-y-4">
                      {response.success ? (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-700">
                            Command executed successfully
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="bg-red-50 border-red-200">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">
                            Error executing command
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="p-4 bg-black text-green-400 font-mono text-sm rounded-md overflow-auto max-h-[300px]">
                        <pre>{response.output}</pre>
                      </div>
                      <div className="text-xs text-gray-500">
                        Timestamp:{" "}
                        {new Date(response.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] border rounded-md border-dashed text-gray-400">
                      No output to display. Run a command to see results.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Push Configuration Tab */}
          <TabsContent value="config">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Push Configuration</CardTitle>
                  <CardDescription>
                    Apply configuration to selected device
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="device-config"
                      className="text-sm font-medium"
                    >
                      Select Device
                    </label>
                    <Select
                      value={selectedDevice}
                      onValueChange={setSelectedDevice}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a device" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map((device) => (
                          <SelectItem key={device.name} value={device.name}>
                            {device.name} ({device.ip})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="config" className="text-sm font-medium">
                      Configuration Commands
                    </label>
                    <Textarea
                      id="config"
                      placeholder="interface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown"
                      value={configText}
                      onChange={(e) => setConfigText(e.target.value)}
                      rows={8}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="username-config"
                        className="text-sm font-medium"
                      >
                        Username
                      </label>
                      <Input
                        id="username-config"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="password-config"
                        className="text-sm font-medium"
                      >
                        Password
                      </label>
                      <Input
                        id="password-config"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handlePushConfig}
                    disabled={isLoading || !selectedDevice || !configText}
                    className="w-full"
                  >
                    {isLoading ? (
                      <span className="flex items-center">Processing...</span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="mr-2 h-4 w-4" /> Push Configuration
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuration Result</CardTitle>
                  <CardDescription>
                    Output from configuration push
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {response ? (
                    <div className="space-y-4">
                      {response.success ? (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-700">
                            Configuration applied successfully
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="bg-red-50 border-red-200">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">
                            Error applying configuration
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="p-4 bg-black text-green-400 font-mono text-sm rounded-md overflow-auto max-h-[300px]">
                        <pre>{response.output}</pre>
                      </div>
                      <div className="text-xs text-gray-500">
                        Timestamp:{" "}
                        {new Date(response.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] border rounded-md border-dashed text-gray-400">
                      No output to display. Push a configuration to see results.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Retrieve Configuration Tab */}
          <TabsContent value="retrieve">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Retrieve Configuration</CardTitle>
                  <CardDescription>
                    Retrieve and extract configuration from selected device
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="device-retrieve"
                      className="text-sm font-medium"
                    >
                      Select Device
                    </label>
                    <Select
                      value={selectedDevice}
                      onValueChange={setSelectedDevice}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a device" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map((device) => (
                          <SelectItem key={device.id} value={device.name}>
                            {device.name} ({device.ip}:{device.port}) -{" "}
                            {device.software_type
                              .replace(/_/g, " ")
                              .toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="username-retrieve"
                        className="text-sm font-medium"
                      >
                        Username
                      </label>
                      <Input
                        id="username-retrieve"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="password-retrieve"
                        className="text-sm font-medium"
                      >
                        Password
                      </label>
                      <Input
                        id="password-retrieve"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Configuration Retrieval Steps */}
                  {(isRetrievingConfig || configRetrievalLogs.length > 0) && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Retrieval Steps & Logs
                      </label>
                      <div className="p-4 bg-black text-green-400 font-mono text-sm rounded-md max-h-[200px] overflow-auto">
                        {configRetrievalLogs.map((log, index) => (
                          <div key={index} className="mb-1">
                            {log}
                          </div>
                        ))}
                        {isRetrievingConfig && (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400 mr-2"></div>
                            Processing...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleConfigRetrieval}
                    disabled={isRetrievingConfig || !selectedDevice}
                    className="w-full"
                  >
                    {isRetrievingConfig ? (
                      <span className="flex items-center">Retrieving...</span>
                    ) : (
                      <span className="flex items-center">
                        <Terminal className="mr-2 h-4 w-4" /> Retrieve
                        Configuration
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retrieved Configuration</CardTitle>
                  <CardDescription>
                    Configuration data from device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {response ? (
                    <div className="space-y-4">
                      {response.success ? (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-700">
                            Configuration retrieved successfully
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="bg-red-50 border-red-200">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <AlertDescription className="text-red-700">
                            Error retrieving configuration
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="p-4 bg-black text-green-400 font-mono text-sm rounded-md overflow-auto max-h-[300px]">
                        <pre>{response.output}</pre>
                      </div>
                      <div className="text-xs text-gray-500">
                        Timestamp:{" "}
                        {new Date(response.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] border rounded-md border-dashed text-gray-400">
                      No configuration retrieved. Click retrieve to get device
                      configuration.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NetworkOperations;
