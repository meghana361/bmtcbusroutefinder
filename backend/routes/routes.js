const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// ✅ Route to fetch all stops
router.get('/stops', async (req, res) => {
  try {
    const stops = await prisma.stop.findMany(); // use lowercase 'stop'
    res.json(stops);
  } catch (err) {
    console.error('Error fetching stops:', err);
    res.status(500).json({ error: 'Failed to fetch stops' });
  }
});

// ✅ Route to fetch routes based on source and destination
router.get('/routes', async (req, res) => {
  const { source, destination } = req.query;

  if (!source || !destination) {
    return res.status(400).json({ error: 'Both source and destination are required' });
  }

  try {
    // 1. Fetch the source and destination stop records
    const sourceStop = await prisma.stop.findUnique({ where: { stop_name: source } });
    const destinationStop = await prisma.stop.findUnique({ where: { stop_name: destination } });

    if (!sourceStop || !destinationStop) {
      return res.status(404).json({ error: 'Source or destination stop not found' });
    }

    // 2. Get all routes that contain the source stop
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

    // 3. Filter routes that also contain the destination stop
    const matchingRoutes = candidateRoutes.filter(route =>
      route.routeStops.some(rs => rs.stop_id === destinationStop.id)
    );

    if (matchingRoutes.length === 0) {
      return res.status(404).json({ error: 'No matching routes found between source and destination.You might have to take multiple stops' });
    }

    // 4. Return route codes
    const routeCodes = matchingRoutes.map(route => route.route_code);
    res.json({ routes: routeCodes });

  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
