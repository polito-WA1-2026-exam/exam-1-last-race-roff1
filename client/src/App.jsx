import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useState, useEffect } from 'react';
import UserContext from './contexts/UserContext.js';
import { useNavigate, Link, Outlet, Route, Routes } from 'react-router'

import dayjs from 'dayjs'

import { Container, Row, Col, Button } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';

import { Header } from './components/Header.jsx'
import { NavigationRail } from './components/NavigationRail.jsx'
import { Footer } from './components/Footer.jsx'
import { LoginModal, Logout } from './components/Login.jsx'
import { MovingTrain } from './components/MovingTrain.jsx'
import { Logo } from './components/Logo.jsx'
import { RulePlayButton } from './components/RulePlayButton.jsx'
import { InstructionsAccordion } from './components/InstructionsAccordion.jsx'
import { RankingList } from './components/RankingList.jsx'
import { NetworkMap, SegmentsList, SelectedRoute, Timer, Coins, EventsCarousel } from './components/Game.jsx'

import { getCurrentUser } from './api/auth.js'
import { getNetwork, getActiveGame, startNewGame, submitRoute } from './api/api.js'

import { User, Game } from './models/LastRaceModels.mjs'

function App() {
  const [user, setUser] = useState(new User({}));
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [playAfterLogin, setPlayAfterLogin] = useState(false)
  const navigate = useNavigate()

  // at application launch > check session
  useEffect(() => {
    getCurrentUser().then(result => {
      if (result) {
        setUser(new User({ id: result.id, username: result.username }))
      }
    })
  }, [])

  const doLogin = (newUser) => {
    setUser(new User({ id: newUser.id, username: newUser.username }))
    navigate('/')
  }

  const handlePlay = () => {
    if (!user?.id) {
      setPlayAfterLogin(true)
      return setIsLoginVisible(true);
    }
    navigate('/game');
  };

  return (
    <UserContext.Provider value={user}>
      <Container fluid className='p-0'>
        <Routes>

          <Route path='/' element={<BaseLayout doLogin={doLogin} isLoginVisible={isLoginVisible} setIsLoginVisible={setIsLoginVisible} playAfterLogin={playAfterLogin} setPlayAfterLogin={setPlayAfterLogin} />}>
            <Route index element={<HomeLayout handlePlay={handlePlay} />} />
            <Route path='instructions' element={<InstructionsLayout handlePlay={handlePlay} />} />
            <Route path='game' element={<GameLayout />} />
            <Route path='ranking' element={<RankingLayout />} />
            <Route path='logout' element={<Logout doLogin={doLogin} />} />
            <Route path='*' element={<PageNotFoundLayout />} />
          </Route>

        </Routes>
      </Container>

    </UserContext.Provider>
  )
}

function BaseLayout(props) {

  const handleModalClose = () => {
    props.setIsLoginVisible(false);
    props.setPlayAfterLogin(false);
  }

  return <>
    <Header showLoginModal={() => props.setIsLoginVisible(true)} />
    <Container fluid>
      <Row>
        <Col xs={1} className='sidebar'>
          <NavigationRail />
        </Col>
        <Col xs={10} className='central-ctn'>
          <div className='page-ctn'>
            <Outlet />
          </div>
        </Col>
        <Col xs={1} className='sidebar'>

        </Col>
      </Row>

      <MovingTrain />
    </Container>
    <LoginModal show={props.isLoginVisible} handleClose={handleModalClose} playAfterSubmit={props.playAfterLogin} doLogin={props.doLogin} />
    <Footer />
  </>
}

function HomeLayout(props) {
  const navigate = useNavigate();

  return (
    <>
      <div className='title'>
        <h1>WELCOME TO TURIN UNDERGROUND</h1>
      </div>
      <Logo className='mt-2' />
      <h3 className='section-title mt-4'>NAVIGATE THE HIDDEN VEINS OF TURIN</h3>
      <p className='lead-text'>FIND YOUR PATH BEFORE TIME RUNS OUT!</p>
      <Container className='p-4'>
        <Row className='justify-content-center'>
          <Col xs="auto">
            <RulePlayButton variant="play" text="PLAY NOW" handleClick={props.handlePlay} />
          </Col>
          <Col xs="auto">
            <RulePlayButton variant="instructions" text="HOW TO PLAY" handleClick={() => navigate('/instructions')} />
          </Col>
        </Row>
      </Container>
    </>
  )

}

function InstructionsLayout(props) {
  // little panel with text describing context and phases (screenshots)
  return (
    <>
      <div className='title'>
        <h1>INSTRUCTIONS TO PLAY</h1>
      </div>
      <p>Your goal is simple: travel through the underground network and reach your destination before time runs out. At the beginning of each game you receive <strong>20 coins</strong> and a randomly assigned journey. During the trip, unexpected events may increase or decrease your score. Plan carefully: only a valid route can lead you to victory.</p>

      <h3 className='section-title mt-4'>GAME OVERVIEW</h3>
      <InstructionsAccordion handlePlay={props.handlePlay} />
    </>
  )

}

function GameLayout(props) {
  // mappa (1- con tutto, 2- solo stazioni)
  // frase recap istruzioni per ogni fase
  // 1) bottone inizio
  // 2) lista segmenti + bottone submit
  // 3) 
  const availableTime = 20

  const [phase, setPhase] = useState("setup");
  const [network, setNetwork] = useState({});
  const [game, setGame] = useState({});
  const [timer, setTimer] = useState(availableTime);
  const [timerActive, setTimerActive] = useState(false);
  const [route, setRoute] = useState([]);
  const [routeError, setRouteError] = useState('');


  const [error, setError] = useState('');
  const [waiting, setWaiting] = useState(true);

  const phaseMap = {
    restore: {
      title: 'JOURNEY RESUMED',
      description: 'A previous journey was found. Pick up where you left off and continue your ride through the underground.',
      buttonText: 'RESTORE',
      nextPhase: 'planning'
    },
    setup: {
      title: 'STUDY THE NETWORK',
      description: 'Explore the underground map and familiarize yourself with the stations, lines, and interchanges. When you are ready, begin your mission.',
      buttonText: 'START',
      nextPhase: 'planning'
    },
    planning: {
      title: 'PLAN YOUR ROUTE',
      description: 'The lines have disappeared. Reconstruct the network from memory, examine the available segments, and build a valid route before time runs out.',
      buttonText: 'SUBMIT',
      nextPhase: 'execution'
    },
    execution: {
      title: 'RIDE THE RAILS',
      description: 'Your journey is underway. Travel through each segment, face unexpected events, and watch your coin balance rise or fall.',
      nextPhase: 'result'
    },
    result: {
      title: 'END OF THE LINE',
      description: 'The journey is complete. Check your final score and see whether your ride deserves a place among the best underground explorers.',
      buttonText: 'HOME',
    }
  };

  const nextPhase = () => {
    const newPhase = phaseMap[phase].nextPhase

    if (newPhase === 'execution' && game.status === 'invalid') // if not valid route we skip the events
      newPhase = 'result'
    setPhase(newPhase)

    if (newPhase === 'planning')
      setTimerActive(true)

  }

  const addSegment = (segmentId) => {
    setRoute(current => [...current, segmentId]);
  }

  const removeSegment = (segmentId) => {
    setRoute(current => current.filter(id => id !== segmentId));
  }

  useEffect(() => {

    if (phase !== 'execution')
      return;

    setWaiting(true);
    async function loadResult() {
      try {
        const [gameResult, routeErrorResult] = await submitRoute(route, game)
        setGame(gameResult)
        setRouteError(routeErrorResult)
        nextPhase()
      } catch(ex) {
        setError(ex)
      } finally {
        setWaiting(false)
      }
    }
    loadResult()

  }, [phase])

  useEffect(() => {
    if (!timerActive)
      return;

    if (!game.active) {
      setWaiting(true)
      async function loadGame() {
        try{
          const newGame = await startNewGame()
          setGame(newGame)
        } catch(ex) {
          setError(ex)
        } finally {
          setWaiting(false)
        }
      }
      loadGame()
      return; // avoid the timer value to be computed before loadGame() finishes (so with game.startTime = undefined)
    }

    const interval = setInterval(() => {
      const elapsed = dayjs().diff(dayjs(game.startTime), "second");
      const remaining = Math.max(availableTime - elapsed, 0);

      setTimer(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setTimerActive(false);
        if (phase === 'restore'){
          setPhase('setup')
          setTimer(availableTime)
        }  
        else
          nextPhase()
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, game]);

  useEffect(() => {
    setWaiting(true)

    // check active game + get network
    async function loadData() {
      try {
        const [activeGame, gameNetwork] = await Promise.all([
          getActiveGame(),
          getNetwork()
        ]);

        setNetwork(gameNetwork)

        if (activeGame.active) {
          const elapsed = dayjs().diff(dayjs(activeGame.startTime), "second");
          const remaining = Math.max(availableTime - elapsed, 0);
          setPhase('restore')
          setTimer(remaining)
          setTimerActive(true)
        }
        setGame(activeGame)

      } catch (ex) {
        setError(ex)
      } finally {
        setWaiting(false)
      }
    }
    loadData()
  }, [])

  return (

    <>
      <div className='title'>
        <h1>{ phaseMap[phase].title }</h1>
      </div>
      <p className='lead-text mt-4'>{ phaseMap[phase].description }</p>
      
      {waiting ? (
        <div className='d-flex justify-content-center'>
          <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : error ? (
        <p className="text-center">{error.message}</p>
      ) : (
        <Container>

        { (phase !== "result") && (
          <>    
            <Row className="p-2">
              <Col xs={5} />
              <Col xs={2} className='d-flex justify-content-center align-items-center timer'>
                <Timer seconds={timer} />
              </Col>
              <Col xs={5} className='d-flex justify-content-end align-items-center coins'>
                <Coins amount={game.score} />
              </Col>
            </Row>

            { phase === "setup" && (
              <Row>Mappa
                <NetworkMap showSegments={true} network={network} />
              </Row>
            ) }

            { phase === "planning" && (
              <Row>Opzioni segmenti
                <SegmentsList addSegment={addSegment} removeSegment={removeSegment} segments={network.segments} />
              </Row>
            ) }

            { phase === "execution " && (
              <Row>
                <EventsCarousel />
              </Row>       
            )}

            <Row className="justify-content-center"> 
              <Col xs="auto">
                <Button className="game-btn" onClick={nextPhase}>{ phaseMap[phase].buttonText }</Button>
              </Col>
            </Row>
          </>
        )}

        { phase === "result" && (
          <>
            { /* Route error + score + home button */ }
            { routeError && ( <Row><p className='text-danger text-center'><strong>GAME OVER: { routeError }</strong></p></Row> )}
            <Row>
              <Col xs={8} className='d-flex justify-content-start align-items-center coins'><p className="m-0 me-4">Final score</p><Coins amount={game.score} /> </Col>
              <Col xs={4} className='d-flex justify-content-end align-items-center'> <Link to="/" className="game-btn" onClick={nextPhase}>{ phaseMap[phase].buttonText }</Link> </Col>
            </Row>
          </>
        )}
        </Container>
      )}
    </>
  );

}

function RankingLayout(props) {
  return (
    <>
      <div className='title'>
        <h1>TOP RIDERS OF THE UNDERGROUND</h1>
      </div>
      <Logo className='mt-2' />
      <p className='lead-text mt-4'>Discover the best riders and how many coins they managed to collect along their journeys!</p>
      <RankingList />
    </>
  )
}

function PageNotFoundLayout(props) {
  return (
    <>
      <div className='title'>
        <h1>IT SEEMS A PASSENGER TOOK THE WRONG LINE</h1>
      </div>
      <p>Don't worry, this line will take you home <Link to='/'>link</Link></p>
    </>
  )
}

export default App
