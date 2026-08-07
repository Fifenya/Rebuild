import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';

// Pages
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ChatListPage = React.lazy(() => import('./pages/ChatListPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка Nexus...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      }
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <ChatListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat/:id"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </React.Suspense>
  );
}

export default App;
