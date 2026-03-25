import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nDocumentSync } from './components/I18nDocumentSync';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Spinner } from './components/Spinner';
import LoginPage from './pages/LoginPage';
import RoutingSheetsPage from './pages/RoutingSheetsPage';
import OperationsByGuildPage from './pages/OperationsByGuildPage';
import UsersPage from './pages/UsersPage';
import ReferencesPage from './pages/ReferencesPage';

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoutingSheetsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operations"
        element={
          <ProtectedRoute>
            <OperationsByGuildPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/references"
        element={
          <ProtectedRoute>
            <ReferencesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <I18nDocumentSync />
          <AppRoutes />
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast:
                  '!bg-white !border !border-gray-200 !shadow-lg !rounded-2xl !text-[var(--color-black)]',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
