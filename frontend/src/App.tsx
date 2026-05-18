import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SpacePage from './pages/SpacePage';
import ItemDetailPage from './pages/ItemDetailPage';
import ReportItemPage from './pages/ReportItemPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import SpaceSettingsPage from './pages/SpaceSettingsPage';
import ClaimPage from './pages/ClaimPage';
import ClaimReviewPage from './pages/ClaimReviewPage';
import JoinSpacePage from './pages/JoinSpacePage';
import PickupPage from './pages/PickupPage';

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--brand-indigo-600)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
  </div>
);

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RootRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
      <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />
      <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/spaces/:spaceId" element={<RequireAuth><SpacePage /></RequireAuth>} />
      <Route path="/spaces/:spaceId/manage" element={<RequireAuth><ManagerDashboardPage /></RequireAuth>} />
      <Route path="/spaces/:spaceId/settings" element={<RequireAuth><SpaceSettingsPage /></RequireAuth>} />
      <Route path="/spaces/:spaceId/report" element={<RequireAuth><ReportItemPage /></RequireAuth>} />
      <Route path="/items/:itemId" element={<RequireAuth><ItemDetailPage /></RequireAuth>} />
      <Route path="/items/:itemId/claim" element={<RequireAuth><ClaimPage /></RequireAuth>} />
      <Route path="/items/:itemId/claims/:claimId/review" element={<RequireAuth><ClaimReviewPage /></RequireAuth>} />
      <Route path="/items/:itemId/claims/:claimId/pickup" element={<RequireAuth><PickupPage /></RequireAuth>} />
      <Route path="/join" element={<RequireAuth><JoinSpacePage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
