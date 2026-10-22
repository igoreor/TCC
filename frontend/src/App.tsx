import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { PublicLayout } from './components/layout/PublicLayout'
import { LoginPage } from './features/auth/LoginPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { ChatPage } from './features/chat/ChatPage'
import { ChunkDetailPage } from './features/knowledge/ChunkDetailPage'
import { KnowledgeBrowserPage } from './features/knowledge/KnowledgeBrowserPage'
import { EvaluationDashboardPage } from './features/evaluation/EvaluationDashboardPage'
import { RetrievalExplorerPage } from './features/retrieval/RetrievalExplorerPage'
import { LandingPage } from './features/landing/LandingPage'
import { ComparisonPage } from './features/comparison/ComparisonPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* A página inicial é pública; a consulta (gaveta), a comparação e o painel exigem login. */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/comparacao"
          element={
            <RequireAuth>
              <ComparisonPage />
            </RequireAuth>
          }
        />
      </Route>

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <AppShell>
              <Outlet />
            </AppShell>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="chat" replace />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="recuperacao" element={<RetrievalExplorerPage />} />
        <Route path="base" element={<KnowledgeBrowserPage />} />
        <Route path="base/chunks/:chunkId" element={<ChunkDetailPage />} />
        <Route path="avaliacao" element={<EvaluationDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
