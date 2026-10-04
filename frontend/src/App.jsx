import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import api from './api/api';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Vehicles from './pages/Vehicles';
import Appointments from './pages/Appointments';
import Mechanics from './pages/Mechanics';
import GraphVisualization from './pages/GraphVisualization';

function App() {
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    appointments: 0,
    mechanics: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [customersResponse, graphResponse] = await Promise.all([
          api.getCustomers(),
          api.getGraph()
        ]);

        const customerCount = customersResponse.data.length;
        const vehicleCount = customersResponse.data.reduce((sum, c) => sum + c.vehicles.length, 0);

        const mechanicIds = new Set(
          graphResponse.data.nodes
            .filter(n => n.labels.includes('Mechanic'))
            .map(n => n.id)
        );

        setStats({
          customers: customerCount,
          vehicles: vehicleCount,
          appointments: 7,
          mechanics: mechanicIds.size
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <h1>Vehicle Service</h1>
            </div>
            <ul className="nav-links">
              <li><Link to="/" className="router-link-active">Dashboard</Link></li>
              <li><Link to="/customers">Customers</Link></li>
              <li><Link to="/vehicles">Vehicles</Link></li>
              <li><Link to="/appointments">Appointments</Link></li>
              <li><Link to="/mechanics">Mechanics</Link></li>
              <li><Link to="/graph">Graph View</Link></li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard stats={stats} />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/mechanics" element={<Mechanics />} />
            <Route path="/graph" element={<GraphVisualization />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>Vehicle Service Management System</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;