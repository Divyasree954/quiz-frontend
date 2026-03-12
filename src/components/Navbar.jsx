import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">⚡ QuizMaster</Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/quizzes" className={isActive('/quizzes')}>Browse</Link>
            <Link to="/my-quizzes" className={isActive('/my-quizzes')}>My Quizzes</Link>
            <Link to="/results" className={isActive('/results')}>Results</Link>
            {isAdmin && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
            <Link to="/quiz/create" className="btn btn-primary btn-sm">+ Create Quiz</Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/quizzes" className={isActive('/quizzes')}>Browse</Link>
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
