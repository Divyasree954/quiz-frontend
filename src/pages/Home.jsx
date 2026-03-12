import { Link } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const features = [
    { icon: '🎯', title: 'Create Quizzes', desc: 'Build custom quizzes with multiple choice questions' },
    { icon: '⚡', title: 'Instant Results', desc: 'Get immediate feedback and detailed score breakdowns' },
    { icon: '🏆', title: 'Leaderboards', desc: 'Compete with others and climb the rankings' },
    { icon: '📊', title: 'Track Progress', desc: 'Monitor your performance over time with analytics' },
  ];

  const categories = ['Technology', 'Science', 'History', 'Mathematics', 'Geography', 'Sports', 'Entertainment', 'General Knowledge'];

  return (
    <div>
      <div className="hero">
        <h1 className="hero-title">
          Test Your Knowledge<br/>
          <span className="gradient-text">Master Any Topic</span>
        </h1>
        <p className="hero-subtitle">
          Create, share, and take quizzes on any subject. Challenge yourself and others with our interactive quiz platform.
        </p>
        <div className="hero-btns">
          <Link to="/quizzes" className="btn btn-primary btn-lg">Browse Quizzes</Link>
          {user ? (
            <Link to="/quiz/create" className="btn btn-secondary btn-lg">Create a Quiz</Link>
          ) : (
            <Link to="/register" className="btn btn-secondary btn-lg">Get Started Free</Link>
          )}
        </div>
      </div>

      <div className="page-container">
        {/* Features */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, marginBottom: '1rem' }}>
            Browse Categories
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
            {categories.map(cat => (
              <Link
                key={cat}
                to={`/quizzes?category=${cat}`}
                className="badge badge-category"
                style={{ padding: '0.5rem 1rem', fontSize: '0.6rem', textDecoration: 'none', cursor: 'pointer' }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
