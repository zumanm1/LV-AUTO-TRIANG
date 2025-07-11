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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Database,
  Search,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: "processed" | "failed" | "processing";
}

interface DocumentManagerProps {
  documents?: Document[];
  onUpload?: (files: FileList) => void;
  onSearch?: (query: string) => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents = [
    {
      id: "1",
      name: "network-topology.pdf",
      type: "PDF",
      size: "2.4 MB",
      uploadDate: "2023-06-15",
      status: "processed",
    },
    {
      id: "2",
      name: "cisco-router-config.txt",
      type: "TXT",
      size: "45 KB",
      uploadDate: "2023-06-14",
      status: "processed",
    },
    {
      id: "3",
      name: "network-diagram.jpg",
      type: "JPG",
      size: "1.2 MB",
      uploadDate: "2023-06-10",
      status: "processed",
    },
  ],
  onUpload = () => {},
  onSearch = () => {},
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setUploadStatus("success");
            setTimeout(() => setUploadStatus("idle"), 3000);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      onUpload(e.target.files);
    }
  };

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <div className="bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Document Management</h1>
        <p className="text-gray-500">
          Upload and manage network documentation to enhance AI responses
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="manage">Manage Documents</TabsTrigger>
          <TabsTrigger value="search">Search Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload size={20} />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Upload network documentation files to enhance AI responses.
                Supported formats: PDF, TXT, JPG, PNG.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  Drag and drop files here
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse files
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.jpg,.jpeg,.png"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileUpload}
                />
                <Button asChild>
                  <label htmlFor="file-upload">Select Files</label>
                </Button>
              </div>

              {isUploading && (
                <div className="mt-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Uploading...</span>
                    <span className="text-sm">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {uploadStatus === "success" && (
                <Alert className="mt-6 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-600">
                    Upload Successful
                  </AlertTitle>
                  <AlertDescription className="text-green-600">
                    Your documents have been uploaded and are being processed.
                  </AlertDescription>
                </Alert>
              )}

              {uploadStatus === "error" && (
                <Alert
                  className="mt-6 bg-red-50 border-red-200"
                  variant="destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upload Failed</AlertTitle>
                  <AlertDescription>
                    There was an error uploading your documents. Please try
                    again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={20} />
                Document Repository
              </CardTitle>
              <CardDescription>
                Manage your uploaded network documentation files.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          {doc.name}
                        </TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>{doc.uploadDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              doc.status === "processed"
                                ? "default"
                                : doc.status === "processing"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {doc.status === "processed"
                              ? "Processed"
                              : doc.status === "processing"
                                ? "Processing"
                                : "Failed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                {documents.length} documents
              </div>
              <Button variant="outline">Export List</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search size={20} />
                Search Documents
              </CardTitle>
              <CardDescription>
                Search through your uploaded network documentation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Search for keywords in documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>

              <div className="text-center py-8 text-gray-500">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>Enter a search term to find content in your documents</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-blue-800 font-medium mb-2 flex items-center gap-2">
          <Database size={16} />
          Document Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="text-2xl font-bold">{documents.length}</div>
            <div className="text-sm text-gray-500">Total Documents</div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="text-2xl font-bold">
              {documents.filter((d) => d.status === "processed").length}
            </div>
            <div className="text-sm text-gray-500">Processed</div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="text-2xl font-bold">
              {documents.filter((d) => d.status === "processing").length}
            </div>
            <div className="text-sm text-gray-500">Processing</div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="text-2xl font-bold">
              {documents.filter((d) => d.status === "failed").length}
            </div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
