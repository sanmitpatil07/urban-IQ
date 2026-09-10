import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ThermometerSun, Map as MapIcon, Activity, Leaf, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="nav-logo">
          <ThermometerSun size={24} className="text-accent" />
          <span className="font-semibold text-lg">Urban Heat DSS</span>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/map')} className="nav-link">Map</button>
          <a href="#story" className="nav-link">Story</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Urban Heat Decision Support System
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hero-subtitle"
            >
              See heat hotspots, test tree cover and cool roof interventions, and estimate temperature reduction.
            </motion.p>
            
            <motion.div 
              className="hero-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button className="btn btn-primary" onClick={() => navigate('/map')}>
                <MapIcon size={18} /> Explore heat map
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/map')}>
                <Activity size={18} /> Run a simulation
              </button>
            </motion.div>
          </div>

          <motion.div 
            className="hero-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="preview-map-placeholder" style={{ cursor: 'pointer' }} onClick={() => navigate('/map')}>
              {/* This represents a static preview of the map to draw users in */}
              <div className="preview-overlay">
                <ThermometerSun size={48} className="text-accent" />
                <span>Live Heat Map Preview</span>
                <span style={{ fontSize: '14px', opacity: 0.7 }}>(Click to launch)</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Metric Cards at bottom of hero */}
        <motion.div 
          className="hero-metrics"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="metric-card">
            <div className="metric-icon hot"><Sun size={24} /></div>
            <div className="metric-info">
              <span className="metric-label">Hottest Zone</span>
              <span className="metric-value">46.2°C</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon avg"><ThermometerSun size={24} /></div>
            <div className="metric-info">
              <span className="metric-label">Average LST</span>
              <span className="metric-value">38.4°C</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon cool"><Leaf size={24} /></div>
            <div className="metric-info">
              <span className="metric-label">Estimated Cooling Potential</span>
              <span className="metric-value">-2.4°C</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Story Section */}
      <section id="story" className="story-section">
        <div className="story-container">
          <div className="story-header">
            <h2>Understanding the Urban Heat Island</h2>
            <p>A step-by-step guide to geospatial microclimate mitigation.</p>
          </div>
          
          <div className="story-grid">
            <motion.div 
              className="story-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="story-icon"><Sun size={40} className="text-red-500" /></div>
              <h3>1. Where is the heat?</h3>
              <p>The interactive map above highlights the hottest zones in the city in deep red. These areas experience the strongest Urban Heat Island (UHI) effect, where surface temperatures can be significantly higher than surrounding rural areas.</p>
            </motion.div>

            <motion.div 
              className="story-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="story-icon"><Activity size={40} className="text-yellow-500" /></div>
              <h3>2. Why is it hot?</h3>
              <p>Heat hotspots strongly correlate with low vegetation (low NDVI) and high built-up concrete/asphalt density (high NDBI). Dark surfaces absorb solar radiation throughout the day and radiate it back into the environment.</p>
            </motion.div>

            <motion.div 
              className="story-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="story-icon"><Leaf size={40} className="text-green-500" /></div>
              <h3>3. What changes help?</h3>
              <p>By using the "Plant Tree" or "Green Area" drawing tools on the map, you can simulate localized interventions. Our AI engine recalculates the surface temperature to show how much cooling can be achieved through these nature-based solutions.</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      <footer className="dashboard-footer">
        <p>Built with MapLibre, React, and FastAPI.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
