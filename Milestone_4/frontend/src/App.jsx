import { useState, useEffect } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SplashScreen from "./components/SplashScreen";

function App() {
  const [user, setUser] = useState(null);
  const [loginTimestamp, setLoginTimestamp] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  const handleLogin = (userData) => {
    setUser(userData);
    setLoginTimestamp(Date.now());
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setLoginTimestamp(null);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <Login onSuccess={handleLogin} />;
  }

  return <Dashboard user={user} loginTimestamp={loginTimestamp} onLogout={handleLogout} />;
}

export default App;