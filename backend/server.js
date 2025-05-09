require('dotenv').config({ path: './backend/.env' }); // make sure .env loads

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cors = require('cors');
const path = require('path');
const app = express();
const port = 5000;

// Middleware to handle JSON requests
app.use(express.json());
app.use(cors());

// Route to fetch all stops
app.get('/stops', async (req, res) => {
  try {
    const stops = await prisma.stop.findMany(); // Fetch all stops
    res.json(stops); // Send the stops in JSON format
  } catch (err) {
    console.error('Error fetching stops:', err);
    res.status(500).json({ error: 'Failed to fetch stops' });
  }
});

// Route to fetch routes based on source and destination
app.get('/routes', async (req, res) => {
  const { source, destination } = req.query;

  if (!source || !destination) {
    return res.status(400).json({ error: 'Both source and destination are required' });
  }

  try {
    // It Fetchs the source and destination stop records
    const sourceStop = await prisma.stop.findUnique({ where: { stop_name: source } });
    const destinationStop = await prisma.stop.findUnique({ where: { stop_name: destination } });

    if (!sourceStop || !destinationStop) {
      return res.status(404).json({ error: 'Source or destination stop not found' });
    }

    // To Fetch all routes that contain the source stop
    const candidateRoutes = await prisma.route.findMany({
      where: {
        routeStops: {
          some: {
            stop_id: sourceStop.id,
          },
        },
      },
      include: {
        routeStops: true,
      },
    });

    // To Filter routes that also contain the destination stop
    const matchingRoutes = candidateRoutes.filter(route =>
      route.routeStops.some(rs => rs.stop_id === destinationStop.id)
    );

    if (matchingRoutes.length === 0) {
      return res.status(404).json({ error: 'No matching routes found between source and destination. You might have to take multiple routes.' });
    }

    // To Return route codes
    const routeCodes = matchingRoutes.map(route => route.route_code);
    res.json({ routes: routeCodes });

  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const host = '0.0.0.0'; // ← THIS is important

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
