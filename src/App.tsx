import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./components/home";
import NetworkOperations from "./components/network/NetworkOperations";
import DocumentManager from "./components/documents/DocumentManager";
import ChatInterface from "./components/chat/ChatInterface";
import GenAIAutomation from "./components/genai/GenAIAutomation";
import Configuration from "./components/config/Configuration";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="network" element={<NetworkOperations />} />
          <Route path="documents" element={<DocumentManager />} />
          <Route path="chat" element={<ChatInterface />} />
          <Route path="genai" element={<GenAIAutomation />} />
          <Route path="config" element={<Configuration />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
