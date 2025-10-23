// src/App.tsx
import './App.css';
// 1. Import Routes, Route, Navigate
import { Routes, Route, Navigate } from "react-router-dom";

// Your page/component imports
import { Login } from "./user/Login";
import { RegisterPage } from "./pages/RegisterPage"; // Assuming you have this
import ChatPage from "./pages/ChatPage";
import { PusherSetup } from './components/PusherSetup'; // Assuming you have this
import { ProtectedRoute } from './components/ProtectedRoute'; // 2. Import ProtectedRoute

function App() {
  return (
    <div className="App">
      <PusherSetup /> {/* Place PusherSetup outside Routes if it should always run */}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Protected Routes --- */}
        {/* Wrap all protected routes within the ProtectedRoute element */}
        <Route element={<ProtectedRoute />}>
          {/* Redirect base path "/" to "/messages" */}
          <Route path="/" element={<Navigate to="/messages" replace />} />
          {/* Base messages route (no specific chat selected) */}
          <Route path="/messages" element={<ChatPage />} />
          {/* Route for user-to-user chat */}
          <Route path="/messages/user/:userId" element={<ChatPage />} />
          {/* --- Add Route for Rooms --- */}
          <Route path="/messages/room/:roomId" element={<ChatPage />} />
          {/* --- End Add --- */}
        </Route>
        {/* --- End Protected Routes --- */}

      </Routes>
    </div>
  );
}

export default App;

