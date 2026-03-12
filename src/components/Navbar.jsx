import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) =>
    location.pathname === path ? 'nav-link active' : 'nav-link'

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      
      <Link to="/" className="nav-logo">⚡ QuizMaster</Link>

      {/* hamburger button */}
      <button className="nav-toggle" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-links ${menuOpen ? 'active' : ''}`}>

        {user ? (
          <>
            <Link to="/quizzes" onClick={closeMenu} className={isActive('/quizzes')}>Browse</Link>

            <Link to="/my-quizzes" onClick={closeMenu} className={isActive('/my-quizzes')}>My Quizzes</Link>

            <Link to="/results" onClick={closeMenu} className={isActive('/results')}>Results</Link>

            {isAdmin && (
              <Link to="/admin" onClick={closeMenu} className={isActive('/admin')}>
                Admin
              </Link>
            )}

            <Link to="/quiz/create" onClick={closeMenu} className="btn btn-primary btn-sm">
              + Create Quiz
            </Link>

            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/quizzes" onClick={closeMenu} className={isActive('/quizzes')}>
              Browse
            </Link>

            <Link to="/login" onClick={closeMenu} className="btn btn-secondary btn-sm">
              Login
            </Link>

            <Link to="/register" onClick={closeMenu} className="btn btn-primary btn-sm">
              Sign Up
            </Link>
          </>
        )}

      </div>
    </nav>
  )
}