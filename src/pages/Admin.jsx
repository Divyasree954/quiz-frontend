import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Admin() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get('/quizzes/admin');
      setQuizzes(data.quizzes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz permanently?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes(quizzes.filter(q => q._id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleTogglePublish = async (id) => {
    const { data } = await api.patch(`/quizzes/${id}/publish`);
    setQuizzes(quizzes.map(q => q._id === id ? data.quiz : q));
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Manage all quizzes on the platform</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{quizzes.length}</div><div className="stat-label">Total Quizzes</div></div>
        <div className="stat-card"><div className="stat-value">{quizzes.filter(q => q.isPublished).length}</div><div className="stat-label">Published</div></div>
        <div className="stat-card"><div className="stat-value">{quizzes.filter(q => !q.isPublished).length}</div><div className="stat-label">Drafts</div></div>
        <div className="stat-card"><div className="stat-value">{quizzes.reduce((s, q) => s + (q.totalAttempts || 0), 0)}</div><div className="stat-label">Total Attempts</div></div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Creator</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Questions</th>
              <th>Attempts</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map(quiz => (
              <tr key={quiz._id}>
                <td>
                  <Link to={`/quiz/${quiz._id}`} style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
                    {quiz.title}
                  </Link>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{quiz.createdBy?.username}</td>
                <td><span className="badge badge-category">{quiz.category}</span></td>
                <td><span className={`badge badge-${quiz.difficulty?.toLowerCase()}`}>{quiz.difficulty}</span></td>
                <td>{quiz.questions?.length}</td>
                <td>{quiz.totalAttempts || 0}</td>
                <td><span className={`badge badge-${quiz.isPublished ? 'published' : 'draft'}`}>{quiz.isPublished ? 'Published' : 'Draft'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/quiz/${quiz._id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                    <button onClick={() => handleTogglePublish(quiz._id)} className={`btn btn-sm ${quiz.isPublished ? 'btn-secondary' : 'btn-success'}`}>
                      {quiz.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => handleDelete(quiz._id)} className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
