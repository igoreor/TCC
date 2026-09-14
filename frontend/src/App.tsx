import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ChatPage } from './features/chat/ChatPage'
import { ChunkDetailPage } from './features/knowledge/ChunkDetailPage'
import { KnowledgeBrowserPage } from './features/knowledge/KnowledgeBrowserPage'
import { EvaluationDashboardPage } from './features/evaluation/EvaluationDashboardPage'
import { RetrievalExplorerPage } from './features/retrieval/RetrievalExplorerPage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/recuperacao" element={<RetrievalExplorerPage />} />
        <Route path="/base" element={<KnowledgeBrowserPage />} />
        <Route path="/base/chunks/:chunkId" element={<ChunkDetailPage />} />
        <Route path="/avaliacao" element={<EvaluationDashboardPage />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
