import { Outlet } from 'react-router-dom'
import { GlobalHeader } from './GlobalHeader'

export function PublicLayout() {
  return (
    <div className="min-h-dvh bg-canvas text-text-primary">
      <GlobalHeader />
      <Outlet />
    </div>
  )
}
