import { useState, useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import api from '../api/api';

function GraphVisualization() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterLabel, setFilterLabel] = useState('ALL');
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
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
      const visibleNodes = filterLabel === 'ALL'
        ? graphData.nodes
        : graphData.nodes.filter(n => n.labels && n.labels.includes(filterLabel));

      const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

      const nodes = visibleNodes.map(node => {
        const props = node.properties;
        const labelType = node.labels[0] || 'Node';
        let label = '';

        if (props.name) label = props.name;
        else if (props.registration_no) label = props.registration_no;
        else if (props.appointment_id) label = `Appt #${props.appointment_id}`;
        else label = `#${node.id}`;

        let background = '#2563eb';
        let border = '#1d4ed8';
        let shape = 'dot';
        let size = 20;

        if (labelType === 'Customer') {
          background = '#059669';
          border = '#047857';
          shape = 'box';
          size = 24;
        } else if (labelType === 'Vehicle') {
          background = '#2563eb';
          border = '#1d4ed8';
          shape = 'dot';
          size = 22;
        } else if (labelType === 'Appointment') {
          background = '#d97706';
          border = '#b45309';
          shape = 'diamond';
          size = 22;
        } else if (labelType === 'Mechanic') {
          background = '#7c3aed';
          border = '#6d28d9';
          shape = 'box';
          size = 24;
        }

        return {
          id: node.id,
          label: label,
          group: labelType,
          shape: shape,
          size: size,
          color: {
            background: background,
            border: border,
            highlight: {
              background: '#0f172a',
              border: '#0f172a'
            }
          },
          font: {
            size: 12,
            color: '#ffffff',
            face: 'Plus Jakarta Sans'
          },
          borderWidth: 2,
          shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.15)',
            size: 4,
            x: 1,
            y: 2
          }
        };
      });

      const edges = graphData.links
        .filter(l => visibleNodeIds.has(l.from) && visibleNodeIds.has(l.to))
        .map(link => ({
          from: link.from,
          to: link.to,
          label: link.relationship,
          arrows: {
            to: { enabled: true, scaleFactor: 0.7 }
          },
          color: {
            color: '#94a3b8',
            highlight: '#2563eb',
            hover: '#0f172a'
          },
          font: {
            size: 11,
            color: '#475569',
            face: 'JetBrains Mono',
            background: '#ffffff',
            strokeWidth: 0
          },
          smooth: {
            type: 'curvedCW',
            roundness: 0.2
          },
          width: 2
        }));

      const container = networkRef.current;
      const data = { nodes, edges };

      const options = {
        physics: {
          enabled: physicsEnabled,
          barnesHut: {
            gravitationalConstant: -4000,
            springLength: 130,
            springConstant: 0.04,
            damping: 0.5
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

      networkInstance.current.on('click', function (params) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = graphData.nodes.find(n => n.id === nodeId);
          setSelectedNode(node || null);
        } else {
          setSelectedNode(null);
        }
      });
    }
  }, [graphData, filterLabel, physicsEnabled]);

  const handleFit = () => {
    if (networkInstance.current) {
      networkInstance.current.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    }
  };

  const togglePhysics = () => {
    setPhysicsEnabled(!physicsEnabled);
  };

  return (
    <div className="graph-page">
      <div className="page-header-row">
        <div className="page-title-wrap">
          <h1>Graph Visualization</h1>
          <p className="page-subtitle">Entity relationship map and graph topology</p>
        </div>
      </div>

      <div className="graph-viewport-card">
        {/* Top Control Bar */}
        <div className="graph-top-bar">
          <div className="graph-legend-pills">
            <button
              className="legend-pill"
              style={{ background: filterLabel === 'ALL' ? '#f1f5f9' : '#ffffff' }}
              onClick={() => setFilterLabel('ALL')}
            >
              All Entities
            </button>
            <button
              className="legend-pill"
              style={{ borderColor: filterLabel === 'Customer' ? '#059669' : '#cbd5e1' }}
              onClick={() => setFilterLabel('Customer')}
            >
              <span className="legend-circle customer"></span>
              <span>Customer</span>
            </button>
            <button
              className="legend-pill"
              style={{ borderColor: filterLabel === 'Vehicle' ? '#2563eb' : '#cbd5e1' }}
              onClick={() => setFilterLabel('Vehicle')}
            >
              <span className="legend-circle vehicle"></span>
              <span>Vehicle</span>
            </button>
            <button
              className="legend-pill"
              style={{ borderColor: filterLabel === 'Appointment' ? '#d97706' : '#cbd5e1' }}
              onClick={() => setFilterLabel('Appointment')}
            >
              <span className="legend-circle appointment"></span>
              <span>Appointment</span>
            </button>
            <button
              className="legend-pill"
              style={{ borderColor: filterLabel === 'Mechanic' ? '#7c3aed' : '#cbd5e1' }}
              onClick={() => setFilterLabel('Mechanic')}
            >
              <span className="legend-circle mechanic"></span>
              <span>Mechanic</span>
            </button>
          </div>

          <div className="graph-controls-group">
            <button className="graph-ctrl-btn" onClick={handleFit}>
              Fit Graph
            </button>
            <button className="graph-ctrl-btn" onClick={togglePhysics}>
              {physicsEnabled ? 'Pause Physics' : 'Resume Physics'}
            </button>
          </div>
        </div>

        {/* Vis.js Canvas */}
        <div className="graph-canvas" ref={networkRef}></div>

        {/* Bottom Status Bar */}
        <div className="graph-status-bar">
          <span>Click any node to view properties. Drag nodes to reposition.</span>
          <span>{graphData.nodes.length} Nodes • {graphData.links.length} Relationships</span>
        </div>

        {/* Floating Node Inspector */}
        {selectedNode && (
          <div className="node-inspector-drawer">
            <div className="inspector-header">
              <div>
                <span className={`status-badge ${(selectedNode.labels[0] || '').toLowerCase()}`}>
                  {selectedNode.labels[0]}
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>
                  {selectedNode.properties.name || selectedNode.properties.registration_no || `Appt #${selectedNode.properties.appointment_id}`}
                </div>
              </div>
              <button className="inspector-close-btn" onClick={() => setSelectedNode(null)}>
                ×
              </button>
            </div>

            <div className="inspector-props">
              <div className="prop-row">
                <span className="prop-key">Node ID</span>
                <span className="prop-value">#{selectedNode.id.split(':').pop() || selectedNode.id}</span>
              </div>
              <div className="prop-row">
                <span className="prop-key">Label</span>
                <span className="prop-value">{selectedNode.labels.join(', ')}</span>
              </div>

              {Object.entries(selectedNode.properties).map(([key, val]) => (
                <div key={key} className="prop-row">
                  <span className="prop-key">{key}</span>
                  <span className="prop-value">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GraphVisualization;