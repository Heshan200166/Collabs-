import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>
      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {user?.name || 'User'}!</h2>
          <p>Email: {user?.email}</p>
          <p>You are successfully authenticated.</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
