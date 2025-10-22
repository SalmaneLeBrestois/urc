import './App.css';
import { Routes, Route } from "react-router-dom";

import { Login } from "./user/Login"; 
import ChatPage from "./pages/ChatPage"; 

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login/>} />
        
        <Route path="/" element={<ChatPage/>} />
      </Routes>
    </div>
  );
}

export default App;