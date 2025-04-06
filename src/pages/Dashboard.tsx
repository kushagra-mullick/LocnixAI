import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';

const Dashboard = () => {
  const history = useHistory();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Get location state to handle redirects after login
  const from = location.state?.from || '/';

  React.useEffect(() => {
    // If already authenticated, redirect to the originally requested page or dashboard
    if (isAuthenticated) {
      history.push(from);
    }
  }, [isAuthenticated, history, from]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      {isAuthenticated ? (
        <button onClick={() => history.push('/study')}>Go to Study</button>
      ) : (
        <p>Please log in to access the study area.</p>
      )}
    </div>
  );
};

export default Dashboard;
