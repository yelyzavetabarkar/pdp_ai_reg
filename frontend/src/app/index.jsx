import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/widgets/header';
import { useUser } from '@/shared/store/app/selectors';
import { AppProvider } from './providers/app-provider';

import { LoginPage } from '@/pages/login';
import { SignupPage } from '@/pages/signup';
import { PropertiesPage } from '@/pages/properties';
import { PropertyDetailsPage } from '@/pages/property-details';

function ProtectedRoute({ children }) {
  const user = useUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <div>Bookings (TODO)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <div>Saved Properties (TODO)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Profile (TODO)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div>Settings (TODO)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute>
                <div>Manager Dashboard (TODO)</div>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/properties" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
