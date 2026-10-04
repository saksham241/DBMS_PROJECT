import { useState, useEffect } from 'react';
import api from '../api/api';

function Mechanics() {
  const [mechanics, setMechanics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState(null);

  useEffect(() => {
    const loadMechanics = async () => {
      try {
        const customersResponse = await api.getCustomers();
        const allVehicles = customersResponse.data.flatMap(c =>
          c.vehicles.map(v => ({...v, owner: c.name}))
        );

        const mechanicMap = new Map();

        for (const vehicle of allVehicles) {
          const historyResponse = await api.getVehicleHistory(vehicle.vehicle_id);
          historyResponse.data.forEach(apt => {
            if (apt.mechanic_name) {
              const key = apt.mechanic_name;
              if (!mechanicMap.has(key)) {
                mechanicMap.set(key, {
                  name: apt.mechanic_name,
                  specialization: apt.specialization,
                  vehicles: [],
                  appointments: []
                });
              }
              const mech = mechanicMap.get(key);
              if (!mech.vehicles.find(v => v.vehicle_id === vehicle.vehicle_id)) {
                mech.vehicles.push(vehicle);
              }
              mech.appointments.push(apt);
            }
          });
        }

        setMechanics(Array.from(mechanicMap.values()));
      } catch (error) {
        console.error('Error loading mechanics:', error);
      }
    };
    loadMechanics();
  }, []);

  const filteredMechanics = mechanics.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mechanics-page">
      <div className="page-header">
        <h1>Mechanics</h1>
      </div>

      <div className="search-filter">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search mechanics by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="cards-grid">
        {filteredMechanics.map((mechanic, index) => (
          <div
            key={index}
            className="mechanic-card"
            onClick={() => setSelectedMechanic(mechanic)}
          >
            <div className="mechanic-card-header">
              <div className="mechanic-avatar">
                {mechanic.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="mechanic-card-info">
                <h3>{mechanic.name}</h3>
                <span className="mechanic-specialty">{mechanic.specialization}</span>
              </div>
            </div>
            <div className="mechanic-card-body">
              <h4>Vehicles Serviced ({mechanic.vehicles.length})</h4>
              {mechanic.vehicles.map((vehicle, vIndex) => (
                <div key={vIndex} className="vehicle-mini">
                  <span className="car-icon">🚗</span>
                  <span className="v-plate">{vehicle.registration_no}</span>
                  <span className="v-details">{vehicle.brand} {vehicle.model}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredMechanics.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No mechanics found matching "{searchTerm}"</p>
        </div>
      )}

      {selectedMechanic && (
        <div className="modal-overlay" onClick={() => setSelectedMechanic(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Mechanic Details</h3>
              <button className="modal-close" onClick={() => setSelectedMechanic(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827', fontSize: '16px', fontWeight: 600 }}>
                  {selectedMechanic.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#111827' }}>{selectedMechanic.name}</h3>
                  <span style={{ color: '#6b7280' }}>{selectedMechanic.specialization}</span>
                </div>
              </div>

              <div className="detail-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="detail-item">
                  <div className="label">Specialization</div>
                  <div className="value">{selectedMechanic.specialization}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Vehicles Serviced</div>
                  <div className="value">{selectedMechanic.vehicles.length}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Total Appointments</div>
                  <div className="value">{selectedMechanic.appointments.length}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Status</div>
                  <div className="value" style={{ color: '#10b981' }}>Active</div>
                </div>
              </div>

              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Served Vehicles</h4>
              {selectedMechanic.vehicles.map((v, i) => (
                <div key={i} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '3px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{v.registration_no}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{v.brand} {v.model} (Owner: {v.owner})</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mechanics;