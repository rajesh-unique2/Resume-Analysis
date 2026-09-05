import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Remember where they were headed so we could send them back after
    // login if you want that later - not wired up yet, but the state
    // is there (location.state.from) if you add it to LoginPage.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}