import './App.css';
import { Routes, Route } from "react-router-dom";
import { RegisterPage } from "./pages/RegisterPage";
import { Login } from "./user/Login"; 
import ChatPage from "./pages/ChatPage"; 
import { PusherSetup } from './components/PusherSetup';
function App() {
  return (
    <div className="App">
      <PusherSetup /> {/* Initialisation de Pusher Beams */}
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/messages" element={<ChatPage />} />
        <Route path="/messages/user/:userId" element={<ChatPage />} />
        <Route path="/" element={<ChatPage/>} />
      </Routes>
    </div>
  );
}

export default App;