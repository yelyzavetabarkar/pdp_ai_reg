import React, { useState, useEffect, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import useAppStore from "./stores/use-app-store";
import Header from "./components/header";
import PropertyList from "./pages/property-list";
import PropertyDetails from "./pages/property-details";
import BookingList from "./pages/booking-list";
import Settings from "./pages/settings";
import SavedProperties from "./pages/saved-properties";
import Profile from "./pages/profile";
import ManagerDashboard from "./pages/manager-dashboard";
import Login from "./pages/login";
import Signup from "./pages/signup";

axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "dark";
  }
  return localStorage.getItem("theme") || "dark";
};

export default function App() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({});
  const [theme, setTheme] = useState(getInitialTheme);
  const [notifications, setNotifications] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const store = useAppStore();
  const setFavorites = store.setFavorites;

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  useLayoutEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (user && notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications, user]);

  useEffect(() => {
    const fetchFavorites = async (userId) => {
      try {
        const response = await axios.get(`/api/favorites/user/${userId}`);
        const data = response.data.data || response.data || [];
        const favoriteIds = data.map((favorite) => favorite.property_id ?? favorite.id);
        setFavorites(favoriteIds);
      } catch (err) {
        console.log("Error loading favorites:", err);
      }
    };

    if (user?.id) {
      fetchFavorites(user.id);
    } else {
      setFavorites([]);
    }
  }, [user?.id, setFavorites]);

  const loadUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedCompany = localStorage.getItem('company');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        const parsedCompany = storedCompany ? JSON.parse(storedCompany) : null;
        const storedNotifications = localStorage.getItem('notifications');

        setUser(parsedUser);
        setCompany(parsedCompany);
        store.setUser(parsedUser);
        if (parsedCompany) {
          store.setCompanyData(parsedCompany);
        }

        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        } else {
          setNotifications([
            {
              id: 1,
              type: "booking_confirmed",
              message: "Your booking has been confirmed",
              read: false,
            },
          ]);
        }
        store.setNotifications([]);
      }
    } catch (err) {
      console.log("Error loading user from storage:", err);
      localStorage.removeItem('user');
      localStorage.removeItem('company');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, companyData) => {
    setUser(userData);
    setCompany(companyData);
    store.setUser(userData);
    if (companyData) {
      store.setCompanyData(companyData);
    }
    setNotifications([
      {
        id: 1,
        type: "welcome",
        message: "Welcome to StayCorp!",
        read: false,
      },
    ]);
  };

  const handleLogout = () => {
    setUser(null);
    setCompany(null);
    setNotifications([]);
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    localStorage.removeItem('token');
    localStorage.removeItem('notifications');
    store.logout();
  };

  const handleMarkNotificationRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    store.setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppShell
        user={user}
        settings={settings}
        theme={theme}
        setTheme={setTheme}
        notifications={notifications}
        company={company}
        onLogout={handleLogout}
        onLogin={handleLogin}
        onUpdateUser={handleUpdateUser}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      />
    </BrowserRouter>
  );
}

function AppShell({
  user,
  settings,
  theme,
  setTheme,
  notifications,
  company,
  onLogout,
  onLogin,
  onUpdateUser,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
}) {
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 right-10 w-80 h-80 rounded-full bg-primary/15 blur-[140px]" />
        <div className="absolute top-1/3 -left-20 w-96 h-96 rounded-full bg-accent/10 blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-[50%] bg-primary/5 blur-[180px]" />
      </div>
      <Header
        user={user}
        settings={settings}
        theme={theme}
        setTheme={setTheme}
        onLogout={onLogout}
        notifications={notifications}
        company={company}
        onMarkNotificationRead={onMarkNotificationRead}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
      />
      <main className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="min-h-[calc(100vh-4rem)]"
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/properties" replace />} />
              <Route
                path="/login"
                element={
                  user ? (
                    <Navigate to="/properties" replace />
                  ) : (
                    <Login onLogin={onLogin} />
                  )
                }
              />
              <Route
                path="/signup"
                element={
                  user ? (
                    <Navigate to="/properties" replace />
                  ) : (
                    <Signup onLogin={onLogin} />
                  )
                }
              />
              <Route
                path="/properties"
                element={
                  <PropertyList
                    user={user}
                    settings={settings}
                    theme={theme}
                    onLogout={onLogout}
                    notifications={notifications}
                    company={company}
                  />
                }
              />
              <Route
                path="/saved"
                element={
                  user ? (
                    <SavedProperties
                      user={user}
                      settings={settings}
                      theme={theme}
                      onLogout={onLogout}
                      notifications={notifications}
                      company={company}
                    />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            <Route
                path="/properties/:id"
                element={
                  <PropertyDetails
                    user={user}
                    settings={settings}
                    theme={theme}
                    onLogout={onLogout}
                    notifications={notifications}
                    company={company}
                  />
                }
              />
              <Route
                path="/bookings"
                element={
                  user ? (
                    <BookingList
                      user={user}
                      settings={settings}
                      theme={theme}
                      onLogout={onLogout}
                      notifications={notifications}
                      company={company}
                    />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/settings"
                element={
                  user ? (
                    <Settings
                      user={user}
                      settings={settings}
                      theme={theme}
                      setTheme={setTheme}
                      onLogout={onLogout}
                      notifications={notifications}
                      company={company}
                      onUpdateUser={onUpdateUser}
                    />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/profile"
                element={
                  user ? (
                    <Profile
                      user={user}
                      settings={settings}
                      theme={theme}
                      onLogout={onLogout}
                      notifications={notifications}
                      company={company}
                    />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/manager"
                element={
                  user ? (
                    <ManagerDashboard
                      user={user}
                      settings={settings}
                      theme={theme}
                      onLogout={onLogout}
                      notifications={notifications}
                      company={company}
                    />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/profile/:id"
                element={
                  <Profile
                    user={user}
                    settings={settings}
                    theme={theme}
                    onLogout={onLogout}
                    notifications={notifications}
                    company={company}
                  />
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "toast-card",
        }}
      />
    </div>
  );
}
