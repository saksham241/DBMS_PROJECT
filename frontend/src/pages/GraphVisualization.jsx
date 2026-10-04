import { useState, useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import api from '../api/api';

function GraphVisualization() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const networkRef = useRef(null);
  const networkInstance = useRef(null);

  useEffect(() => {
    const loadGraph = async () => {
      try {
        const response = await api.getGraph();
        setGraphData(response.data);
      } catch (error) {
        console.error('Error loading graph:', error);
      }
    };
    loadGraph();
  }, []);

  useEffect(() => {
    if (graphData.nodes.length > 0 && networkRef.current) {
      const nodes = graphData.nodes.map(node => {
        const props = node.properties;
        let label = '';
        if (props.name) label = props.name;
        else if (props.registration_no) label = props.registration_no;
        else if (props.email) label = props.email;
        else if (props.phone) label = props.phone;
        else if (props.appointment_id) label = 'Appt #' + props.appointment_id;
        else label = 'Node ' + node.id;

        return {
          id: node.id,
          label: label,
          group: node.labels[0],
          title: JSON.stringify(props, null, 2),
          shape: node.labels[0] === 'Customer' || node.labels[0] === 'Mechanic' ? 'box' :
                 node.labels[0] === 'Appointment' ? 'diamond' : 'dot',
          size: node.labels[0] === 'Customer' || node.labels[0] === 'Mechanic' ? 25 : 18,
          font: { size: 11, color: 'white', face: 'Inter' }
        };
      });

      const edges = graphData.links.map(link => ({
        from: link.from,
        to: link.to,
        label: link.relationship,
        arrows: 'to',
        color: { color: '#94a3b8', highlight: '#6366f1' },
        font: { size: 10, color: '#64748b', face: 'Inter' },
        smooth: { type: 'continuous' }
      }));

      const container = networkRef.current;
      const data = { nodes, edges };

      const options = {
        nodes: {
          border_width: 2,
          shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 5 }
        },
        edges: {
          width: 2,
          selectionWidth: 3
        },
        groups: {
          Customer: {
            color: { background: '#10b981', border: '#059669', highlight: { background: '#34d399', border: '#10b981' } },
            shape: 'box'
          },
          Vehicle: {
            color: { background: '#3b82f6', border: '#2563eb', highlight: { background: '#60a5fa', border: '#3b82f6' } },
            shape: 'dot'
          },
          Appointment: {
            color: { background: '#f59e0b', border: '#d97706', highlight: { background: '#fbbf24', border: '#f59e0b' } },
            shape: 'diamond'
          },
          Mechanic: {
            color: { background: '#8b5cf6', border: '#7c3aed', highlight: { background: '#a78bfa', border: '#8b5cf6' } },
            shape: 'box'
          },
          Phone: {
            color: { background: '#64748b', border: '#475569' },
            shape: 'dot'
          },
          Email: {
            color: { background: '#0d9488', border: '#0f766e' },
            shape: 'dot'
          },
          PersonalVehicle: {
            color: { background: '#3b82f6', border: '#2563eb' },
            shape: 'dot'
          },
          CommercialVehicle: {
            color: { background: '#ef4444', border: '#dc2626' },
            shape: 'dot'
          }
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -5000,
            springLength: 120,
            springConstant: 0.08,
            damping: 0.4
          },
          stabilization: { iterations: 100 }
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          zoomView: true,
          dragView: true,
          dragNodes: true,
          navigationButtons: true,
          keyboard: true
        }
      };

      if (networkInstance.current) {
        networkInstance.current.destroy();
      }

      networkInstance.current = new Network(container, data, options);

      networkInstance.current.on('click', function(params) {
        if (params.nodes.length > 0) {
          var nodeId = params.nodes[0];
          var node = graphData.nodes.find(function(n) { return n.id === nodeId; });
          setSelectedNode(node || null);
        } else {
          setSelectedNode(null);
        }
      });
    }
  }, [graphData]);

  return (
    <div className="graph-page">
      <div className="page-header">
        <h1>Graph Visualization</h1>
      </div>

      <div className="graph-legend">
        <div className="legend-item"><span className="legend-dot customer"></span><span>Customer</span></div>
        <div className="legend-item"><span className="legend-dot vehicle"></span><span>Vehicle</span></div>
        <div className="legend-item"><span className="legend-dot appointment"></span><span>Appointment</span></div>
        <div className="legend-item"><span className="legend-dot mechanic"></span><span>Mechanic</span></div>
        <div className="legend-item"><span className="legend-dot phone"></span><span>Phone</span></div>
        <div className="legend-item"><span className="legend-dot email"></span><span>Email</span></div>
      </div>

      <div className="graph-container" ref={networkRef} style={{ width: '100%', height: '600px' }}></div>

      <div className="graph-stats">
        <p>
          <strong>Nodes:</strong> {graphData.nodes.length} |
          <strong>Relationships:</strong> {graphData.links.length}
        </p>
      </div>

      {selectedNode && (
        <div className="section-card" style={{ marginTop: '1.5rem' }}>
          <h3>Selected Node</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
            <div className="detail-item">
              <div className="label">Node ID</div>
              <div className="value">#{selectedNode.id}</div>
            </div>
            <div className="detail-item">
              <div className="label">Labels</div>
              <div className="value">{selectedNode.labels.join(', ')}</div>
            </div>
            {Object.entries(selectedNode.properties).map(function(keyValue) {
              return (
                <div key={keyValue[0]} className="detail-item">
                  <div className="label">{keyValue[0]}</div>
                  <div className="value">{String(keyValue[1])}</div>
                </div>
              );
            })}
          </div>
          <button
            style={{ marginTop: '1rem', padding: '8px 16px', background: '#111827', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            onClick={() => setSelectedNode(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default GraphVisualization;