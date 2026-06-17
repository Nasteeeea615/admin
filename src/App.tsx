import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import api from './services/api';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#FF9800',
    },
  },
});

interface PrivateRouteProps {
  children: React.ReactNode;
  checking: boolean;
  authenticated: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, checking, authenticated }) => {
  if (checking) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return authenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PageLoader: React.FC = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress />
  </Box>
);

function App() {
  const [authChecking, setAuthChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const isValidAuthPayload = (payload: unknown): boolean => {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    return true;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authPayload = await api.get('/auth/me');
        if (!isValidAuthPayload(authPayload)) {
          throw new Error('Invalid auth payload');
        }
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setAuthenticated(true);
    setAuthChecking(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAuthenticated(false);
    setAuthChecking(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/login"
              element={authenticated ? <Navigate to="/" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/"
              element={
                <PrivateRoute checking={authChecking} authenticated={authenticated}>
                  <Layout onLogout={handleLogout}>
                    <DashboardPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute checking={authChecking} authenticated={authenticated}>
                  <Layout onLogout={handleLogout}>
                    <OrdersPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute checking={authChecking} authenticated={authenticated}>
                  <Layout onLogout={handleLogout}>
                    <UsersPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <PrivateRoute checking={authChecking} authenticated={authenticated}>
                  <Layout onLogout={handleLogout}>
                    <PaymentsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/support"
              element={
                <PrivateRoute checking={authChecking} authenticated={authenticated}>
                  <Layout onLogout={handleLogout}>
                    <SupportPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute checking={authChecking} authenticated={authenticated}>
                  <Layout onLogout={handleLogout}>
                    <AnalyticsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
