import { useState, useEffect } from 'react';
import api from '../api/api';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await api.getCustomers();
        const allVehicles = response.data.flatMap(c =>
          c.vehicles.map(v => ({...v, owner: c.name, owner_id: c.customer_id}))
        );
        setVehicles(allVehicles);
      } catch (error) {
        console.error('Error loading vehicles:', error);
      }
    };
    loadVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch =
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.registration_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' ||
      (filterType === 'personal' && v.year >= 2020) ||
      (filterType === 'commercial' && v.year < 2020);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="vehicles-page">
      <div className="page-header">
        <h1>Vehicles</h1>
      </div>

      <div className="search-filter">
        <div className="search-box">
          <span className="search-icon">Search</span>
          <input
            type="text"
            placeholder="Search by brand, model, registration, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Vehicles</option>
          <option value="personal">Personal (2020+)</option>
          <option value="commercial">Commercial (Pre-2020)</option>
        </select>
      </div>

      <div className="cards-grid">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.vehicle_id}
            className="vehicle-card"
            onClick={() => setSelectedVehicle(vehicle)}
          >
            <div className="vehicle-image">
              <img src={`/images/car.jpg`} alt={`${vehicle.brand} ${vehicle.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className="vehicle-badge">#{vehicle.vehicle_id}</span>
            </div>
            <div className="vehicle-card-body">
              <h3>{vehicle.brand} {vehicle.model}</h3>
              <span className="vehicle-plate">{vehicle.registration_no}</span>

              <div className="vehicle-details">
                <div className="detail-row">
                  <span className="detail-label">Year</span>
                  <span className="detail-value">{vehicle.year}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Owner</span>
                  <span className="detail-value">{vehicle.owner}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Vehicle ID</span>
                  <span className="detail-value">#{vehicle.vehicle_id}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="empty-state">
          <p>No vehicles found matching your search</p>
        </div>
      )}

      {selectedVehicle && (
        <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Vehicle Details</h3>
              <button className="modal-close" onClick={() => setSelectedVehicle(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <img src={`/images/car.jpg`} alt={`${selectedVehicle.brand} ${selectedVehicle.model}`} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} />
              </div>
              <h3 style={{ margin: 0, color: '#111827' }}>{selectedVehicle.brand} {selectedVehicle.model}</h3>
              <span style={{ fontWeight: 600, color: '#2563eb', fontSize: '1.1rem' }}>{selectedVehicle.registration_no}</span>

              <div className="detail-grid" style={{ marginTop: '1.5rem' }}>
                <div className="detail-item">
                  <div className="label">Vehicle ID</div>
                  <div className="value">#{selectedVehicle.vehicle_id}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Registration No</div>
                  <div className="value">{selectedVehicle.registration_no}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Brand</div>
                  <div className="value">{selectedVehicle.brand}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Model</div>
                  <div className="value">{selectedVehicle.model}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Year</div>
                  <div className="value">{selectedVehicle.year}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Owner</div>
                  <div className="value">{selectedVehicle.owner}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehicles;