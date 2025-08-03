import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Viewer from "./components/Viewer";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Login />} />
        {/* <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              // <Login onLogin={() => setIsLoggedIn(true)} />
              <Navigate to="/dashboard" />
            )
          }
        /> */}
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              selectedItem ? (
                <Viewer
                  item={selectedItem}
                  goBack={() => setSelectedItem(null)}
                />
              ) : (
                <Dashboard onItemClick={setSelectedItem} />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />
        {/* Optional: fallback for 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
