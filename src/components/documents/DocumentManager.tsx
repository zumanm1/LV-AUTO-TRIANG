import React, { useState, useEffect } from "react";
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
  Trash2,
  Eye,
} from "lucide-react";
import documentService from "@/services/documentService";

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

const DocumentManager: React.FC<DocumentManagerProps> = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [collectionStats, setCollectionStats] = useState<{ totalDocuments: number; totalChunks: number }>({ totalDocuments: 0, totalChunks: 0 });

  // Load documents and check DB status on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const isConnected = await documentService.isServerRunning();
        setDbStatus(isConnected ? "connected" : "disconnected");
        
        if (isConnected) {
          const docs = await documentService.getAllDocuments();
          const stats = await documentService.getCollectionStats();
          
          setDocuments(docs.map(doc => ({
            id: doc.id,
            name: doc.metadata.filename,
            type: doc.metadata.fileType.toUpperCase(),
            size: `${Math.round(doc.metadata.size / 1024)} KB`,
            uploadDate: doc.metadata.uploadDate,
            status: "processed" as const,
          })));
          
          setCollectionStats(stats);
        }
      } catch (error) {
        setDbStatus("disconnected");
      }
    };

    loadDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);

      try {
        for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          const content = await readFileContent(file);
          
          const document = {
            id: `${Date.now()}_${i}`,
            content: content,
            metadata: {
              filename: file.name,
              fileType: file.type || file.name.split('.').pop() || 'unknown',
              uploadDate: new Date().toISOString(),
              size: file.size,
              category: "network"
            }
          };

          const success = await documentService.addDocument(document);
          if (!success) {
            throw new Error(`Failed to add document ${file.name}`);
          }

          setUploadProgress(((i + 1) / e.target.files.length) * 100);
        }

        setUploadStatus("success");
        // Reload documents
        const docs = await documentService.getAllDocuments();
        setDocuments(docs.map(doc => ({
          id: doc.id,
          name: doc.metadata.filename,
          type: doc.metadata.fileType.toUpperCase(),
          size: `${Math.round(doc.metadata.size / 1024)} KB`,
          uploadDate: doc.metadata.uploadDate,
          status: "processed" as const,
        })));
      } catch (error) {
        console.error("Upload error:", error);
        setUploadStatus("error");
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadStatus("idle"), 3000);
      }
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await documentService.searchDocuments(searchQuery, 10);
      console.log("Search results:", results);
      // You can display search results in a modal or separate section
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const success = await documentService.deleteDocument(documentId);
      if (success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Document Management</h1>
        <p className="text-gray-500">
          Upload and manage network documentation to enhance AI responses
        </p>
        
        {/* Database Status */}
        <div className="mt-4">
          {dbStatus === "checking" && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Checking ChromaDB connection...
              </AlertDescription>
            </Alert>
          )}
          
          {dbStatus === "connected" && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Connected to ChromaDB. Documents: {collectionStats.totalDocuments}, Chunks: {collectionStats.totalChunks}
              </AlertDescription>
            </Alert>
          )}
          
          {dbStatus === "disconnected" && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Cannot connect to ChromaDB server. Please ensure ChromaDB is running at http://localhost:8000
              </AlertDescription>
            </Alert>
          )}
        </div>
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
