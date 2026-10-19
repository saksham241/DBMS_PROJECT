import { useState, useEffect } from 'react';
import api from '../api/api';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await api.getCustomers();
        const allVehicles = response.data.flatMap(c =>
          (c.vehicles || []).map((v, i) => ({
            ...v,
            owner: c.name,
            owner_id: c.customer_id,
            image: `/images/car${(v.vehicle_id % 4) + 1 === 1 ? '' : (v.vehicle_id % 4) + 1}.jpg`
          }))
        );
        setVehicles(allVehicles);
      } catch (error) {
        console.error('Error loading vehicles:', error);
      }
    };
    loadVehicles();
  }, []);

  const openVehicleModal = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setLoadingHistory(true);
    try {
      const res = await api.getVehicleHistory(vehicle.vehicle_id);
      setVehicleHistory(res.data);
    } catch (e) {
      console.error(e);
      setVehicleHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch =
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.registration_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === 'all' || v.brand.toLowerCase() === filterBrand.toLowerCase();
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="vehicles-page">
      <div className="page-header-row">
        <div className="page-title-wrap">
          <h1>Vehicles</h1>
          <p className="page-subtitle">Registered vehicle fleet and maintenance tracking</p>
        </div>
      </div>

      {/* Search and Brand Filters */}
      <div className="search-filter-bar">
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="Search by brand, model, registration number, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="filter-select" value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
          <option value="all">All Brands</option>
          <option value="tesla">Tesla</option>
          <option value="bmw">BMW</option>
          <option value="toyota">Toyota</option>
          <option value="honda">Honda</option>
          <option value="audi">Audi</option>
        </select>
      </div>

      {/* Cards Grid */}
      <div className="cards-grid">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.vehicle_id}
            className="vehicle-card"
            onClick={() => openVehicleModal(vehicle)}
          >
            <div className="vehicle-card-img-wrap">
              <img
                src={vehicle.image || '/images/car.jpg'}
                alt={`${vehicle.brand} ${vehicle.model}`}
                onError={(e) => { e.target.src = '/images/car.jpg'; }}
              />
              <span className="vehicle-brand-pill">{vehicle.brand}</span>
            </div>

            <div className="vehicle-card-body">
              <h3>{vehicle.brand} {vehicle.model}</h3>

              <div className="license-plate">
                {vehicle.registration_no}
              </div>

              <div className="vehicle-specs-list">
                <div className="v-spec-item">
                  <span className="v-spec-label">Year</span>
                  <span className="v-spec-val">{vehicle.year}</span>
                </div>
                <div className="v-spec-item">
                  <span className="v-spec-label">Owner</span>
                  <span className="v-spec-val">
                    {vehicle.owner}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="empty-box">
          <p>No vehicles found matching your criteria</p>
        </div>
      )}

      {/* Vehicle Modal with Service History */}
      {selectedVehicle && (
        <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div>
                <h3 style={{ margin: 0, color: '#0f172a' }}>
                  {selectedVehicle.brand} {selectedVehicle.model}
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  Vehicle ID #{selectedVehicle.vehicle_id}
                </span>
              </div>
              <button className="modal-close-icon" onClick={() => setSelectedVehicle(null)}>
                ×
              </button>
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden', height: '180px', marginBottom: '1.25rem' }}>
              <img
                src={selectedVehicle.image || '/images/car.jpg'}
                alt="Vehicle Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div className="license-plate" style={{ fontSize: '1rem' }}>
                {selectedVehicle.registration_no}
              </div>
            </div>

            <div className="detail-specs-grid">
              <div className="spec-cell">
                <div className="spec-cell-label">Brand & Model</div>
                <div className="spec-cell-val">{selectedVehicle.brand} {selectedVehicle.model}</div>
              </div>
              <div className="spec-cell">
                <div className="spec-cell-label">Year</div>
                <div className="spec-cell-val">{selectedVehicle.year}</div>
              </div>
              <div className="spec-cell">
                <div className="spec-cell-label">Owner</div>
                <div className="spec-cell-val">{selectedVehicle.owner}</div>
              </div>
              <div className="spec-cell">
                <div className="spec-cell-label">Status</div>
                <div className="spec-cell-val" style={{ color: '#059669' }}>Registered</div>
              </div>
            </div>

            {/* Service History */}
            <h4 style={{ marginTop: '1.25rem', marginBottom: '0.75rem', color: '#0f172a' }}>
              Service & Appointment History
            </h4>

            {loadingHistory ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading appointment records...</p>
            ) : vehicleHistory.length > 0 ? (
              vehicleHistory.map((h, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem' }}>
                      Appointment #{h.appointment_id} • {h.appointment_date} ({h.timeslot})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      Mechanic: {h.mechanic_name || 'Assigned Specialist'} ({h.specialization || 'General'})
                    </div>
                  </div>
                  <span className={`status-badge ${(h.status || '').toLowerCase().replace(' ', '-')}`}>
                    {h.status}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No past appointments recorded for this vehicle.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehicles;