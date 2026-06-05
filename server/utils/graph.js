export const buildGraph = (nodes, edges) => {
    const graph = new Map();

    for (const n of nodes)
        graph.set(n, new Set());

    for (const e of edges) {
        graph.get(e[0]).add(e[1]);
        graph.get(e[1]).add(e[0]);
    }

    return graph;
}

const bfsDistances = (graph, startId) => {
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


export const findRandomNodesAtMinDistance = (graph, distance) => {
    const nodes = [...graph.keys()]
    for (let i = 0; i < 20; i++) {
        const start = nodes[Math.floor(Math.random() * nodes.length)];
        const distances = bfsDistances(graph, start);
        const validDestinations = nodes.filter(id => id !== start && distances.get(id) >= distance);

        if (validDestinations.length > 0) {
            const destination = validDestinations[Math.floor(Math.random() * validDestinations.length)];
            return { start, destination };
        }
    }

    throw new Error("No valid pair found in the graph");
};

export const validatePath = (edges) => {
    for (let i = 1; i < edges.length; i++) {
        const prevEdge = edges[i - 1];
        const currEdge = edges[i];
        const sharedEdge = prevEdge.some(node => currEdge.includes(node));
        if (!sharedEdge) 
            return false;
    }
    return true;
}