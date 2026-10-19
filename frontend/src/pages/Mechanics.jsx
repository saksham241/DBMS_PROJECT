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
          (c.vehicles || []).map(v => ({ ...v, owner: c.name }))
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
      <div className="page-header-row">
        <div className="page-title-wrap">
          <h1>Mechanics</h1>
          <p className="page-subtitle">Service technicians and assigned vehicle workloads</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-filter-bar">
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="Search mechanics by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Mechanics Grid */}
      <div className="cards-grid">
        {filteredMechanics.map((mechanic, index) => (
          <div
            key={index}
            className="mechanic-card"
            onClick={() => setSelectedMechanic(mechanic)}
          >
            <div className="mechanic-card-header">
              <div className="mechanic-avatar">
                {mechanic.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="mechanic-card-info">
                <h3>{mechanic.name}</h3>
                <span className="mechanic-specialty">{mechanic.specialization}</span>
              </div>
            </div>

            <div className="customer-card-body">
              <h4>Assigned Vehicles ({mechanic.vehicles.length})</h4>
              {mechanic.vehicles.map((v, vIndex) => (
                <div key={vIndex} className="vehicle-mini-badge">
                  <span className="v-plate-chip">{v.registration_no}</span>
                  <span className="v-desc-chip">
                    {v.brand} {v.model}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredMechanics.length === 0 && (
        <div className="empty-box">
          <p>No mechanics found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Mechanic Detail Modal */}
      {selectedMechanic && (
        <div className="modal-overlay" onClick={() => setSelectedMechanic(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="mechanic-avatar">
                  {selectedMechanic.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#0f172a' }}>{selectedMechanic.name}</h3>
                  <span style={{ fontSize: '0.82rem', color: '#2563eb' }}>
                    {selectedMechanic.specialization}
                  </span>
                </div>
              </div>
              <button className="modal-close-icon" onClick={() => setSelectedMechanic(null)}>
                ×
              </button>
            </div>

            <div className="detail-specs-grid">
              <div className="spec-cell">
                <div className="spec-cell-label">Specialization</div>
                <div className="spec-cell-val">{selectedMechanic.specialization}</div>
              </div>
              <div className="spec-cell">
                <div className="spec-cell-label">Vehicles Serviced</div>
                <div className="spec-cell-val">{selectedMechanic.vehicles.length}</div>
              </div>
              <div className="spec-cell">
                <div className="spec-cell-label">Total Appointments</div>
                <div className="spec-cell-val">{selectedMechanic.appointments.length}</div>
              </div>
              <div className="spec-cell">
                <div className="spec-cell-label">Status</div>
                <div className="spec-cell-val" style={{ color: '#059669' }}>Active</div>
              </div>
            </div>

            <h4 style={{ marginTop: '1.25rem', marginBottom: '0.65rem', color: '#0f172a' }}>
              Serviced Vehicles
            </h4>
            {selectedMechanic.vehicles.map((v, i) => (
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
                  <div className="license-plate" style={{ marginBottom: 0 }}>
                    {v.registration_no}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                    {v.brand} {v.model} • Owner: {v.owner}
                  </div>
                </div>
                <span className="status-badge completed">Serviced</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Mechanics;