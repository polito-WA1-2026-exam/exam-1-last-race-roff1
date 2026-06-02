// imports
import express from "express";
import morgan from 'morgan';
import cors from "cors";
import { check, validationResult } from 'express-validator';

import { Game } from "./LastRaceModels.mjs";

import { getUser } from "./dao/userDao.js"
import { getNetwork } from "./dao/networkDao.js"
import { createGame, endGame, getActiveGame, closeExpiredGames, getRanking } from "./dao/gameDao.js"
import { getEvents } from "./dao/eventDao.js"

import { buildGraph, findRandomNodesAtMinDistance, validatePath } from "./utils/graph.js"

import dayjs from 'dayjs'
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

// init express
const app = new express();
const port = 3001;

// middlewares
app.use(morgan('dev'));
app.use(express.json());

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

  return cb(null, { id: user.id, username: user.username });
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


const routeValidation = [
  check('route')
    .isArray({ min: 4 })
    .withMessage('Route must be an array with at least 4 elements ')
    .bail() // stop is any previous validation fails
    .custom(route => {
      if (!Array.isArray(route) || !route.every(Number.isInteger))
        throw new Error('Route must be an array of integers')
      return true;
    })
    .bail()
    .custom((route, { req }) => { // check stations existance
      const network = req.app.get('network');
      const stationIds = new Set(network.stations.map(s => s.id));
      for (const id of route)
        if (!stationIds.has(id))
          throw new Error(`Station ${id} does not exist`);
      return true;
    })
    .bail()
    .custom((route) => { // check segment duplicates
      const segments = [];
      for (let i=0; i<route.length-1; i++) 
        segments.push(`${route[i]}-${route[i+1]}`);
      if (new Set(segments).size !== segments.length)
        throw new Error('Route cannot contain duplicate segments');
      return true;
    })
    .bail()
    .custom((route, { req }) => { // check segments existance
      const graph = req.app.get('graph');
      if (!validatePath(route, graph))
        throw new Error('Invalid route segments');
      return true;
    })
];


const userValidation = [
  check('username').trim().isString().notEmpty().withMessage("Username must be a non-empty string"),
  check('password').isString().notEmpty().withMessage("Password must be a non-empty string")
]


// publis APIs

app.post(
  '/api/sessions',
  userValidation,
  (req, res, next) => { // force validation before authentication step
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return onValidationErrors(errors, res);
    next();
  },
  passport.authenticate("local"), // if valid credentials, passport.authenticate("local") middleware creates the session and attaches req.user (session deserialization)
  (req, res) => res.status(201).json({ id: req.user.id, username: req.user.username })
);

app.delete('/api/sessions/current', async (req, res) => {
  req.logout(() => {
    res.end();
  });
})

/* private APIs */
app.use(isLoggedIn)

app.get('/api/sessions/current', async (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
})

app.get('/api/ranking', async (req, res) => {
  getRanking()
    .then(ranking => res.json(ranking))
    .catch(err => res.status(500).json(err))
})

app.get('/api/network', async (req, res) => {
  res.json(app.get('network'))
})

app.get('/api/games/current', async (req, res) => {
  await closeExpiredGames(req.user.id);

  const activeGame = await getActiveGame(req.user.id);

  console.log(activeGame)
  console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'))

  if (!activeGame)
    return res.status(404).json({ error: 'No active game found.' });

  res.json({ startStationId: activeGame.startStationId, destinationStationId: activeGame.destinationStationId, startTime: activeGame.startTime.format('YYYY-MM-DD HH:mm:ss') });
})

app.post('/api/games', async (req, res) => {

  try {
    await closeExpiredGames(req.user.id);

    const activeGame = await getActiveGame(req.user.id);
    if (activeGame)
      return res.status(409).json({ error: 'An active game already exists.' });

    const {
      start: startStationId,
      destination: destinationStationId
    } = findRandomNodesAtMinDistance(req.app.get('graph'), 3);

    const newGame = new Game(null, req.user.id, startStationId, destinationStationId, dayjs().toISOString(), 'active')

    const result = await createGame(newGame);
    res.status(201).json({ startStationId: result.startStationId, destinationStationId: result.destinationStationId, startTime: result.startTime.format('YYYY-MM-DD HH:mm:ss') });

  } catch (err) {
    return res.status(500).json({ err: err.message });
  }

})

app.post('/api/games/route', routeValidation,  async (req, res) => {

  const invalidFields = validationResult(req);
  const route = req.body.route

  try {

    const expiredCount = await closeExpiredGames(req.user.id);
    const game = await getActiveGame(req.user.id);
    if (!game){
      if(expiredCount === 0)
        return res.status(404).json({ error: "No active game found." });
      else
        return res.status(404).json({ error: "No active game found (it may be expired due to time limit: 90 seconds)." });
    }

    // validation errors + check start and destination stations
    if (!invalidFields.isEmpty()){
      await endGame(game.id, 0);
      return onValidationErrors(invalidFields, res);
    }
    if (game.startStationId !== route[0] || game.destinationStationId !== route[route.length -1])
      return res.status(422).json({ error: "Route start and destination do not match the assigned game stations." });

    // score computation + events generation
    const events = await getEvents();
    let score = 20;
    const appliedEvents = [];
    for (let i = 0; i < route.length - 1; i++) {
      const event = events[Math.floor(Math.random() * events.length)];
      score += event.effect;
      appliedEvents.push({ description: event.description, effect: event.effect });
    }

    const finalScore = Math.max(0, score);
    const endCount = await endGame(game.id, finalScore);
    if(endCount === 0)
      return res.status(409).json({ error: "Game cannot be updated because it has already been completed or expired."});
    return res.status(200).json({ events: appliedEvents, score: finalScore, status: "completed" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


// activate the server

async function initApp() {
  try {
    const network = await getNetwork();

    if (!network?.stations?.length)
      throw new Error("Database not seeded: no stations found");
    
    if (!network?.segments?.length)
      throw new Error("Database not seeded: no segments found");
    

    const graph = buildGraph(network.stations.map(s => s.id), network.segments.map(s => s.stationIds));

    if (!graph || graph.size === 0)
      throw new Error("Graph initialization failed");

    // set as global variables
    app.set('network', network);
    app.set('graph', graph);

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });

  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
}

initApp()
