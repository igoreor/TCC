import { NavLink } from 'react-router-dom'
import styles from './NavBar.module.css'

const links = [
  { to: '/chat', label: 'Chat' },
  { to: '/recuperacao', label: 'Retrieval Explorer' },
  { to: '/base', label: 'Base de conhecimento' },
  { to: '/avaliacao', label: 'Avaliação' },
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
