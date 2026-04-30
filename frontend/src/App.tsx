import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SpacePage from './pages/SpacePage';
import ItemDetailPage from './pages/ItemDetailPage';
import ReportItemPage from './pages/ReportItemPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/spaces/:spaceId" element={<RequireAuth><SpacePage /></RequireAuth>} />
      <Route path="/spaces/:spaceId/manage" element={<RequireAuth><ManagerDashboardPage /></RequireAuth>} />
      <Route path="/spaces/:spaceId/report" element={<RequireAuth><ReportItemPage /></RequireAuth>} />
      <Route path="/items/:itemId" element={<RequireAuth><ItemDetailPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
