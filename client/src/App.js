import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [merchant, setMerchant] = useState(null);

  const handleLogin = (merchantData) => {
    setMerchant(merchantData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setMerchant(null);
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard merchant={merchant} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
