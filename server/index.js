// imports
import express from "express";
import morgan from 'morgan';
import cors from "cors";
import { check, validationResult } from 'express-validator';

import { Game } from "./dao/LastRaceModels.js";

import { getUser } from "./dao/userDao.js"
import { getNetwork } from "./dao/networkDao.js"
import { createGame, endGame, getActiveGame, closeExpiredGames, getRanking } from "./dao/gameDao.js"
import { getEvents } from "./dao/eventDao.js"

import { buildGraph, bfsDistances, setupGameStations, validateRoute } from "./services/graphService.js"

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

  return cb(null, {id: user.id, username: user.username});
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


const checkRouteDuplicate = (route) => {
  const set = new Set(route);
  if (set.size !== route.length)
    throw new Error('Route cannot contain duplicate stations');
  return true;
}

const checkRouteValidStationIds = (route, { req }) => {
  const stationIds = req.app.get('network').stations.map(s => s.id);
  for(const routeStationId of route)
    if(!stationIds.includes(routeStationId))
      throw new Error(`Station ${routeStationId} does not exist`)
  return true
}

const routeValidation = [
  check('route').isArray({ min: 3 }).withMessage('Route must be a non-empty array'),
  check('route.*').toInt().isInt().withMessage('Route must be an array containing only integer station IDs'),
  check('route').custom(route => checkRouteDuplicate(route)),
  check('route').custom(checkRouteValidStationIds)
]

const userValidation = [
  check('username').trim().isString().notEmpty().withMessage("Username must be a non-empty string"),
  check('password').isString().notEmpty().withMessage("Password must be a non-empty string")
]


// network graph initialization
let graph = null
let network = null


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
  (req, res) => res.status(201).json({id: req.user.id, username: req.user.username})
);

app.delete('/api/sessions/current', async (req, res) => {
  req.logout(() => {
    res.end();
  });
})

/* private APIs */
app.use(isLoggedIn)

app.get('/api/sessions/current', async (req, res) => {
  res.json({id: req.user.id, username: req.user.username});
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

  res.json({ startStationId: activeGame.startStationId, destinationStationId: activeGame.destinationStationId, startTime: activeGame.startTime});
})

app.post('/api/games', async (req, res) => {
  try {
    await closeExpiredGames();

    const activeGame = await getActiveGame(req.user.id);
    if (activeGame)
      return res.status(409).json({ error: 'An active game already exists.' });

    const {
      start: startStationId,
      destination: destinationStationId
    } = setupGameStations(network, graph);

    const newGame = new Game(null, req.user.id, startStationId, destinationStationId, dayjs().toISOString(), 'active')

    const result = await createGame(newGame);
    res.status(201).json({ startStationId: result.startStationId, destinationStationId: result.destinationStationId, startTime: result.startTime});

  } catch (err) {
    return res.status(500).json({ err: err.message });
  }

})

app.post('/api/games/route', routeValidation, async (req, res) => {
  const invalidFields = validationResult(req);

  if (!invalidFields.isEmpty())
      return onValidationErrors(invalidFields, res);

  try {
    await closeExpiredGames();

    const game = await getActiveGame(req.user.id);
    if (!game)
      return res.status(404).json({ error: "No active game." });
    if (game.status !== "active") // defense from race conditions (like 2 user requests affecting the same game)
      return res.status(409).json({ error: "Game already completed." });

    const now = dayjs();
    const start = dayjs(game.startTime);
    if (now.diff(start, "second") > 90) {
      await endGame(game.id, 0);
      return res.status(409).json({ error: "Time expired. Game over." });
    }

    const route = [game.startStationId, ...req.body.route, game.destinationStationId]
    const isValid = validateRoute(route, graph);
    if (!isValid) {
      await endGame(game.id, 0);
      return res.status(400).json({ error: "Invalid route" });
    }

    const events = await getEvents();
    let score = 20;
    const appliedEvents = [];

    for (let i = 0; i < route.length - 1; i++) {
      const event = events[Math.floor(Math.random() * events.length)];
      score += event.effect;
      appliedEvents.push({ description: event.description, effect: event.effect });
    }

    const finalScore = Math.max(0, score);
    await endGame(game.id, finalScore);
    return res.status(200).json({ events: appliedEvents, score: finalScore, status: "completed" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


// activate the server

async function initApp() {
  try {
    network = await getNetwork();
    graph = buildGraph(network);

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

initApp()
