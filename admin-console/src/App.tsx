import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Layout from './components/Layout';
import AccessDenied from './pages/AccessDenied';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/Map';
import Notifications from './pages/Notifications';
import AssistantDetections from './pages/AssistantDetections';
import Users from './pages/Users';
import CreateBullet from './pages/CreateBullet';
import CreateCaliber from './pages/CreateCaliber';
import CreateVendor from './pages/CreateVendor';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  if (!auth.checked) return null;
  if (!auth.token) return <Navigate to="/login" replace />;
  if (!auth.isAdmin) return <AccessDenied />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <Layout>
              <MapPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <Notifications />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant-detections"
        element={
          <ProtectedRoute>
            <Layout>
              <AssistantDetections />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-bullet"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateBullet />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-caliber"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateCaliber />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-vendor"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateVendor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/admin-console">
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
