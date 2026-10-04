 // Import libraries
  const express = require('express');
  const cors = require('cors');
  const dotenv = require('dotenv');
  const neo4j = require('neo4j-driver');

  // Load environment variables from .env file
  dotenv.config();

  // Create Express app
  const app = express();

  // Enable CORS (allows frontend to call this backend)
  app.use(cors());

  // ============================================
  // NEO4J CONNECTION
  // ============================================

  // neo4j-driver's constructor:
  //   driver(uri, { auth: { username, password } })

  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );

  // Verify the connection works when the server starts
  driver.verifyConnectivity().then(
    () => {
      console.log("✅ Neo4j connected successfully!");
    },
    (error) => {
      console.error("❌ Neo4j connection failed:", error.message);
    }
  );

  // ============================================
  // HELPER: Run a Cypher query
  // ============================================
  // This function takes a Cypher query string and optional
  // parameters, runs it against Neo4j, and returns results.
  async function runCypher(query, parameters = {}) {
    const session = driver.session({ database: 'vehicle-service' });
    try {
      const result = await session.run(query, parameters);
      return result.records;
    } finally {
      await session.close();
    }
  }
 // Helper functions to convert Neo4j objects to plain JSON
  function elementId(node) {
    return node.identity;  // Unique ID for the node
  }
  function nodeLabels(node) {
    return node.labels;    // e.g., ['Customer']
  }
  function nodeProperties(node) {
    // Convert Neo4j property values to plain JS values
    const props = {};
    for (const key in node.properties) {
      const val = node.properties[key];
      props[key] = (typeof val === 'object' && val && val.toNumber) ?
  val.toNumber() : val;
    }
    return props;
  }

  // ============================================
  // API ROUTES
  // ============================================


  // TEST ROUTE - hit http://localhost:5000/ to check the server is up
  app.get('/', (req, res) => {
    res.json({
      message: "Vehicle Service DA3 API is running!",
      endpoints: [
        "GET /api/customers",
        "GET /api/customers/:id/vehicles",
        "GET /api/vehicles/:id/history",
        "GET /api/mechanics/:id/vehicles",
        "GET /api/graph"
      ]
    });
  });

  // ROUTE 1: Get all customers with their vehicles
  app.get('/api/customers', async (req, res) => {
    try {
      const query = `
        MATCH (c:Customer)-[:OWNS]->(v:Vehicle)
        RETURN c.customer_id AS customer_id,
               c.name AS name,
               collect({
                 vehicle_id: v.vehicle_id,
                 registration_no: v.registration_no,
                 brand: v.brand,
                 model: v.model,
                 year: v.year
               }) AS vehicles
      `;
      const records = await runCypher(query);
      const customers = records.map(r => ({
        customer_id: r.get('customer_id').toNumber(),
        name: r.get('name'),
        vehicles: r.get('vehicles').map(v => ({
          vehicle_id: v.vehicle_id.toNumber(),
          registration_no: v.registration_no,
          brand: v.brand,
          model: v.model,
          year: v.year.toNumber()
        }))
      }));
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ROUTE 2: Get a customer's vehicles (by ID)
  app.get('/api/customers/:id/vehicles', async (req, res) => {
    try {
      const customerId = req.params.id;
      const query = `
        MATCH (c:Customer {customer_id: $customerId})-[:OWNS]->(v:Vehicle)
        RETURN c.name AS customer_name,
               v.vehicle_id AS vehicle_id,
               v.registration_no AS registration_no,
               v.brand AS brand,
               v.model AS model,
               v.year AS year
      `;
      const records = await runCypher(query, { customerId: Number(customerId) });
      res.json(records.map(r => ({
        customer_name: r.get('customer_name'),
        vehicle_id: r.get('vehicle_id').toNumber(),
        registration_no: r.get('registration_no'),
        brand: r.get('brand'),
        model: r.get('model'),
        year: r.get('year').toNumber()
      })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ROUTE 3: Get a vehicle's appointment history
  app.get('/api/vehicles/:id/history', async (req, res) => {
    try {
      const vehicleId = req.params.id;
      const query = `
        MATCH (v:Vehicle {vehicle_id:
  $vehicleId})-[:HAS_APPOINTMENT]->(a:Appointment)
        OPTIONAL MATCH (a)-[:ASSIGNED_TO]->(m:Mechanic)
        RETURN v.registration_no AS vehicle,
               a.appointment_id AS appointment_id,
               a.appointment_date AS appointment_date,
               a.timeslot AS timeslot,
               a.status AS status,
               m.name AS mechanic_name,
               m.specialization AS specialization
        ORDER BY a.appointment_date
      `;
      const records = await runCypher(query, { vehicleId: Number(vehicleId) });
      res.json(records.map(r => ({
        vehicle: r.get('vehicle'),
        appointment_id: r.get('appointment_id').toNumber(),
        appointment_date: r.get('appointment_date'),
        timeslot: r.get('timeslot'),
        status: r.get('status'),
        mechanic_name: r.get('mechanic_name'),
        specialization: r.get('specialization')
      })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ROUTE 4: Get a mechanic's serviced vehicles
  app.get('/api/mechanics/:id/vehicles', async (req, res) => {
    try {
      const mechanicId = req.params.id;
      const query = `
        MATCH (m:Mechanic {mechanic_id: $mechanicId})-[:SERVICES]->(v:Vehicle)
        RETURN m.name AS mechanic_name,
               m.specialization AS specialization,
               v.registration_no AS registration_no,
               v.brand AS brand,
               v.model AS model
      `;
      const records = await runCypher(query, { mechanicId: Number(mechanicId) });
      res.json(records.map(r => ({
        mechanic_name: r.get('mechanic_name'),
        specialization: r.get('specialization'),
        registration_no: r.get('registration_no'),
        brand: r.get('brand'),
        model: r.get('model')
      })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ROUTE 5: Get the full graph (nodes + relationships) for visualization
  app.get('/api/graph', async (req, res) => {
    try {
      // Get all nodes
      const nodeQuery = `
        MATCH (n)
        RETURN n, labels(n) AS labels
      `;
      // Get all relationships
      const relQuery = `
        MATCH (a)-[r]->(b)
        RETURN elementId(a) AS from_id,
               elementId(b) AS to_id,
               labels(a) AS from_labels,
               labels(b) AS to_labels,
               type(r) AS relationship
      `;
      const [nodeRecords, relRecords] = await Promise.all([
        runCypher(nodeQuery),
        runCypher(relQuery)
      ]);

      // Convert Neo4j nodes to JSON-friendly objects
      const nodes = nodeRecords.map(r => {
        const node = r.get('n');
        return {
          id: elementId(node),
          labels: nodeLabels(node),
          properties: nodeProperties(node)
        };
      });

      const links = relRecords.map(r => ({
        from: r.get('from_id'),
        to: r.get('to_id'),
        relationship: r.get('relationship')
      }));

      res.json({ nodes, links });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // START THE SERVER
  // ============================================
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Backend API running at http://localhost:${PORT}`);
    console.log(`Test it: open http://localhost:${PORT}/ in your browser`);
  });