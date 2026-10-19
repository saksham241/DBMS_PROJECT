const dotenv = require('dotenv');
const neo4j = require('neo4j-driver');

dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

async function seed() {
  const sessionOptions = process.env.NEO4J_DATABASE ? { database: process.env.NEO4J_DATABASE } : {};
  const session = driver.session(sessionOptions);

  try {
    console.log("🌱 Clearing old data (if any)...");
    await session.run('MATCH (n) DETACH DELETE n');

    console.log("🌱 Inserting Customers, Vehicles, Mechanics, and Appointments...");

    const seedCypher = `
      // Create Customers
      CREATE (c1:Customer {customer_id: 1, name: 'Saksham Mittal'})
      CREATE (c2:Customer {customer_id: 2, name: 'Alice Johnson'})
      CREATE (c3:Customer {customer_id: 3, name: 'Bob Smith'})
      CREATE (c4:Customer {customer_id: 4, name: 'Emma Davis'})

      // Create Vehicles
      CREATE (v1:Vehicle {vehicle_id: 101, registration_no: 'KA-01-MJ-5021', brand: 'Tesla', model: 'Model 3', year: 2022})
      CREATE (v2:Vehicle {vehicle_id: 102, registration_no: 'DL-04-AB-1234', brand: 'BMW', model: 'M340i', year: 2023})
      CREATE (v3:Vehicle {vehicle_id: 103, registration_no: 'MH-12-PQ-9876', brand: 'Toyota', model: 'Fortuner', year: 2021})
      CREATE (v4:Vehicle {vehicle_id: 104, registration_no: 'HR-26-CD-4567', brand: 'Honda', model: 'City', year: 2019})
      CREATE (v5:Vehicle {vehicle_id: 105, registration_no: 'KA-05-XY-7890', brand: 'Audi', model: 'A6', year: 2024})

      // Create Mechanics
      CREATE (m1:Mechanic {mechanic_id: 201, name: 'John Miller', specialization: 'Electric Powertrain & Battery'})
      CREATE (m2:Mechanic {mechanic_id: 202, name: 'David Wilson', specialization: 'Engine & Transmission'})
      CREATE (m3:Mechanic {mechanic_id: 203, name: 'Carlos Sanchez', specialization: 'Brakes & Suspension Diagnostics'})

      // Create Appointments
      CREATE (a1:Appointment {appointment_id: 301, appointment_date: '2026-10-10', timeslot: '09:30 AM', status: 'Completed'})
      CREATE (a2:Appointment {appointment_id: 302, appointment_date: '2026-10-12', timeslot: '02:00 PM', status: 'In Progress'})
      CREATE (a3:Appointment {appointment_id: 303, appointment_date: '2026-10-15', timeslot: '11:00 AM', status: 'Scheduled'})
      CREATE (a4:Appointment {appointment_id: 304, appointment_date: '2026-10-18', timeslot: '04:30 PM', status: 'Scheduled'})

      // Customer OWNS Vehicle
      CREATE (c1)-[:OWNS]->(v1)
      CREATE (c2)-[:OWNS]->(v2)
      CREATE (c3)-[:OWNS]->(v3)
      CREATE (c4)-[:OWNS]->(v4)
      CREATE (c1)-[:OWNS]->(v5)

      // Vehicle HAS_APPOINTMENT Appointment
      CREATE (v1)-[:HAS_APPOINTMENT]->(a1)
      CREATE (v2)-[:HAS_APPOINTMENT]->(a2)
      CREATE (v3)-[:HAS_APPOINTMENT]->(a3)
      CREATE (v5)-[:HAS_APPOINTMENT]->(a4)

      // Appointment ASSIGNED_TO Mechanic
      CREATE (a1)-[:ASSIGNED_TO]->(m1)
      CREATE (a2)-[:ASSIGNED_TO]->(m2)
      CREATE (a3)-[:ASSIGNED_TO]->(m3)
      CREATE (a4)-[:ASSIGNED_TO]->(m1)

      // Mechanic SERVICES Vehicle
      CREATE (m1)-[:SERVICES]->(v1)
      CREATE (m2)-[:SERVICES]->(v2)
      CREATE (m3)-[:SERVICES]->(v3)
      CREATE (m1)-[:SERVICES]->(v5)
    `;

    await session.run(seedCypher);
    console.log("✅ Sample data inserted successfully!");

    const counts = await session.run(`
      MATCH (n)
      RETURN labels(n)[0] AS label, count(n) AS count
    `);
    console.log("Summary of created nodes:");
    counts.records.forEach(r => {
      console.log(` - ${r.get('label')}: ${r.get('count').toNumber()}`);
    });

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
