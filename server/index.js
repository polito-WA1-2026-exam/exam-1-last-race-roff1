// imports
import express from "express";
import morgan from 'morgan';
import cors from "cors";
import { check, validationResult } from 'express-validator';

import { getUser } from "./dao/userDao.js"
import { getNetwork } from "./dao/networkDao.js"
import { createGame, endGame, getActiveGame, closeExpiredGames, getRanking } from "./dao/gameDao.js"

import dayjs from 'dayjs'
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

// init express
const app = new express();
const port = 3001;

// CORS policy configuration: rejects requests from different origins and allows credentials (cookies) for authentication
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
}
app.use(cors(corsOptions))

// authentication with sessions
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  if (!user)  // If login fails: passport blocks the route, response with error 401 Unauthorized + header message
    return cb(null, false, "Wrong username or password."); // error message in the WWW-Authenticated header of the response

  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authorized" });
}

app.use(session({
  secret: "wa1-exam-1-last-race",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate("session"));

// validation functions
const errorFormatter = ({ msg }) => {
  return msg;
};

const onValidationErrors = (validationResult, res) => {
  const errors = validationResult.formatWith(errorFormatter);
  return res.status(422).json({ validationErrors: errors.mapped() });
};





const userValidation = [
  check('username').isString().notEmpty(),
  check('password').isString().notEmpty()
]

const routeValidation = [
  check('route').isArray({ min: 1 }),
  check('route.*').isInt()
]

// network graph initialization
let graph = new Map();
let network = null

function buildGraph(network) {
  for (const s of network.stations)
    graph.set(s.id, []);

  for (const seg of network.segments) {
    graph.get(seg.stationA).push(seg.stationB);
    graph.get(seg.stationB).push(seg.stationA);
  }
}

async function initGraph() {
  try {
    network = await getNetwork();
    buildGraph();
    console.log("Graph initialized");
  } catch (err) {
    console.error("Failed to initialize network:", err);
    process.exit(1);
  }
}

function bfsDistances(graph, startId) {
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

function setupGameStations() {
  const start = network.stations[Math.floor(Math.random() * network.stations.length)].id;

  const distances = bfsDistances(graph, start);

  const validDestinations = network.stations.map(s => s.id).filter(id => id !== start && distances.get(id) >= 4 );

  if (validDestinations.length === 0)
    return setupGameStations(); // change start station

  const destination = validDestinations[Math.floor(Math.random() * validDestinations.length)];

  return { start, destination };
}






// publis APIs

// if valid credentials, passport.authenticate("local") middleware creates the session and attaches req.user (session deserialization)
app.post('/api/sessions', passport.authenticate("local"), async (req, res) => {
  return res.status(201).json(req.user);
})

app.delete('/api/sessions/current', async (req, res) => {
  req.logout(() => {
    res.end();
  });
})

/* private APIs */
app.use(isLoggedIn)

app.get('/api/sessions/current', async (req, res) => {
  res.json(req.user);
})

app.get('/api/ranking', async (req, res) => {
  getRanking()
    .then(ranking => res.json(ranking))
    .catch(err => res.status(500).json(err))
})

app.get('/api/network', async (req, res) => {
  res.json(network)
})

app.get('/api/games/current', async (req, res) => {
  await closeExpiredGames();

  const activeGame = await getActiveGame(req.user.id);
  if (!activeGame)
    return res.status(404).json({ error: 'No active game found.' });

  res.json(activeGame);
})

app.post('/api/games', async (req, res) => {
  try {
    await closeExpiredGames();

    const activeGame = await getActiveGame(req.user.id);
    if (activeGame)
        return res.status(409).json({ error: 'An active game already exists.' });

    
    const [startStationId, destinationStationId] = setupGameStations()
    
    const newGame = new Game(req.user.id, startStationId, destinationStationId, dayjs().toISOString(), 'active')
  
  
    const result = await createGame(newGame);
    res.status(201).json(result);
  
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
  
})

app.post('/api/games/route', async (req, res) => {
  // find active game
})


// activate the server
initGraph().then(() => {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
});
