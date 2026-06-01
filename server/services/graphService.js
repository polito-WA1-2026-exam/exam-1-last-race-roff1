export const buildGraph = (network) => {
    const graph = new Map();
    for (const s of network.stations)
        graph.set(s.id, []);

    for (const seg of network.segments) { // keep duplicated neighbors, they do not affect validation (caused by segments shared by multiple lines)
        graph.get(seg.stationA).push(seg.stationB);
        graph.get(seg.stationB).push(seg.stationA);
    }
    return graph
}

export const bfsDistances = (graph, startId) => {
    const distances = new Map();
    const queue = [startId];

    distances.set(startId, 0);

    while (queue.length > 0) {
        const current = queue.shift(); // remove first element of the queue

        for (const neighbor of graph.get(current)) { // expore its neighbors
            if (!distances.has(neighbor)) { // if neighbors are new nodes
                distances.set(neighbor, distances.get(current) + 1);
                queue.push(neighbor);
            }
        }
    }

    return distances;
}


export const setupGameStations = (network, graph) => {
    for (let i=0; i<20; i++) {
        const start = network.stations[Math.floor(Math.random() * network.stations.length)].id;
        const distances = bfsDistances(graph, start);
        const validDestinations = network.stations.map(s => s.id).filter(id => id !== start && distances.get(id) >= 3);

        if (validDestinations.length > 0) {
            const destination = validDestinations[Math.floor(Math.random() * validDestinations.length)];
            return { start, destination };
        }
    }

    throw new Error("No valid station pair found");
};

export const validateRoute = (route, graph) => {
  if (!route || route.length < 5) return false;

  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to = route[i + 1];

    const neighbors = graph.get(from);

    if (!neighbors || !neighbors.includes(to))
      return false;

  }

  return true;
}