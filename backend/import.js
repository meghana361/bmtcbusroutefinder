const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const filePath = 'bus_routes.csv';
const BATCH_SIZE = 500; // Define a batch size to control the number of records inserted at once

async function main() {
  const stops = []; // Array to store stop data
  const routes = []; // Array to store route data
  const routeStops = []; // Array to store routeStop data
  const stopMap = new Map(); // To avoid duplicate stop inserts
  const routeMap = new Map(); // To avoid duplicate route inserts

  const rows = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => rows.push(row))
    .on('end', async () => {
      for (const row of rows) {
        const stopKey = `${row.stop_name}_${row.latitude}_${row.longitude}`;
        const routeCode = row.route.trim();

        let stopId;
        if (!stopMap.has(stopKey)) {
          stops.push({
            stop_name: row.stop_name,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
          });
          stopMap.set(stopKey, stops.length - 1); // Store index of stop in array
        }
        stopId = stopMap.get(stopKey);

        let routeId;
        if (!routeMap.has(routeCode)) {
          routes.push({ route_code: routeCode });
          routeMap.set(routeCode, routes.length - 1); // Store index of route in array
        }
        routeId = routeMap.get(routeCode);

        routeStops.push({
          route_id: routeId,
          stop_id: stopId,
        });
      }

      // Split data into batches and insert in chunks
      try {
        await batchInsert('stop', stops);
        await batchInsert('route', routes);
        await batchInsert('routeStop', routeStops);

        console.log('✅ CSV Import Complete');
      } catch (error) {
        console.error('Error during import:', error);
      } finally {
        await prisma.$disconnect();
      }
    });
}

// Function to handle batch insert
async function batchInsert(model, data) {
  const batches = chunkArray(data, BATCH_SIZE);
  for (const batch of batches) {
    await prisma[model].createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
}

// Function to chunk an array into smaller arrays (batches)
function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
