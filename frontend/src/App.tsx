import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { AgentLabPage } from './pages/AgentLabPage';
import { AttackTestsPage } from './pages/AttackTestsPage';
import { RiskMatrixPage } from './pages/RiskMatrixPage';
import { McpLabPage } from './pages/McpLabPage';
import { MitigationsPage } from './pages/MitigationsPage';
import { BeforeAfterPage } from './pages/BeforeAfterPage';
import { WazuhPage } from './pages/WazuhPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [selectedModel, setSelectedModel] = useState<string>('claude');

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#080808] text-white overflow-hidden">
        {/* Persistent CyberSOC Sidebar */}
        <Sidebar />

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header selectedModel={selectedModel} onSelectModel={setSelectedModel} />

          <main className="flex-1 overflow-y-auto px-7 py-6">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/chat" element={<PlaygroundPage />} />
              <Route path="/agent" element={<AgentLabPage />} />
              <Route path="/tests" element={<AttackTestsPage />} />
              <Route path="/matrix" element={<RiskMatrixPage />} />
              <Route path="/mcp" element={<McpLabPage />} />
              <Route path="/mitigations" element={<MitigationsPage />} />
              <Route path="/before-after" element={<BeforeAfterPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/integrations" element={<WazuhPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

