import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import QuizList from './pages/QuizList';
import QuizDetail from './pages/QuizDetail';
import QuizForm from './pages/QuizForm';
import MyQuizzes from './pages/MyQuizzes';
import Results from './pages/Results';
import ResultPage from './pages/ResultPage';
import Admin from './pages/Admin';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/quizzes" element={<QuizList />} />
          <Route path="/quiz/:id" element={<QuizDetail />} />
          <Route path="/quiz/create" element={
            <ProtectedRoute><QuizForm /></ProtectedRoute>
          } />
          <Route path="/quiz/:id/edit" element={
            <ProtectedRoute><QuizForm /></ProtectedRoute>
          } />
          <Route path="/my-quizzes" element={
            <ProtectedRoute><MyQuizzes /></ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute><Results /></ProtectedRoute>
          } />
          <Route path="/result/:id" element={
            <ProtectedRoute><ResultPage /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
