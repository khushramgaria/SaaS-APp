import React, { useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Documents from "./pages/Documents";
import Chat from "./pages/Chat";
import Members from "./pages/Members";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import { getMeUser } from "./redux/slices/authSlice";

// Main App Layout component containing Sidebar and main content Outlet
const AppLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0 bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && isAuthenticated) {
      dispatch(getMeUser());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="documents" element={<Documents />} />
          <Route path="chat" element={<Chat />} />
          <Route path="members" element={<Members />} />
          <Route path="activity" element={<Activity />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
