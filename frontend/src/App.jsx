import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MapView from './pages/MapView';
import UrbanThermalDSS from './pages/UrbanThermalDSS';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/dss" element={<UrbanThermalDSS />} />
        <Route path="/workbench" element={<UrbanThermalDSS />} />
      </Routes>
    </Router>
  );
}

export default App;
