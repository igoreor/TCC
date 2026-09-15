import { NavLink } from 'react-router-dom'
import styles from './NavBar.module.css'

const links = [
  { to: '/dashboard/chat', label: 'Chat' },
  { to: '/dashboard/recuperacao', label: 'Retrieval Explorer' },
  { to: '/dashboard/base', label: 'Base de conhecimento' },
  { to: '/dashboard/avaliacao', label: 'Avaliação' },
]

export function NavBar() {
  return (
    <nav className={styles.nav}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => [styles.link, isActive ? styles.active : ''].filter(Boolean).join(' ')}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
