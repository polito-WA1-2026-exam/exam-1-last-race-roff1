import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useState, useEffect } from 'react';
import UserContext from './contexts/UserContext.js';
import { useNavigate, Link, Outlet, Route, Routes } from 'react-router'

import { getNetwork, getActiveGame, startNewGame, submitRoute } from './api/api.js'

import { Container, Row, Col } from 'react-bootstrap';

import { Header } from './components/Header.jsx'
import { NavigationRail } from './components/NavigationRail.jsx'
import { Footer } from './components/Footer.jsx'
import { LoginModal } from './components/Login.jsx'
import { Logo } from './components/Logo.jsx'
import { RulePlayButton } from './components/RulePlayButton.jsx'
import { InstructionsAccordion } from './components/InstructionsAccordion.jsx'
import { RankingList } from './components/RankingList.jsx'
import { SetupView, PlanningView, ExecutionView, ResultView } from './components/GameViews.jsx'

import { getCurrentUser, logout } from './api/auth.js'

import { User } from './models/LastRaceModels.mjs'
import { CustomSpinner } from './components/CustomSpinner.jsx';

function App() {
  const [user, setUser] = useState(new User({}));
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [playAfterLogin, setPlayAfterLogin] = useState(false)
  const navigate = useNavigate()

  // at application launch > check session
  useEffect(() => {
    getCurrentUser().then(result => {
      if (result) {
        setUser(new User({ id: result.id, username: result.username }));
      }
    })
  }, [])

  const doLogin = (newUser) => {
    setUser(new User({ id: newUser.id, username: newUser.username }))
    navigate('/')
  }

  const handleLogout = async () => {
    try {
      await logout();
      setUser(new User({}));
      navigate('/');
    } catch (err) {
      console.error("Error during logout process.", err)
    }
  }

  const handlePlay = () => {
    if (!user?.id) {
      setPlayAfterLogin(true);
      return setIsLoginVisible(true);
    }
    navigate('/game');
  };

  return (
    <UserContext.Provider value={user}>
      <Container fluid className='p-0'>
        <Routes>

          <Route path='/' element={
            <BaseLayout 
              doLogin={doLogin} 
              onLogout={handleLogout}
              isLoginVisible={isLoginVisible} 
              setIsLoginVisible={setIsLoginVisible} 
              playAfterLogin={playAfterLogin} 
              setPlayAfterLogin={setPlayAfterLogin} 
            />
          }>
            <Route index element={<HomeLayout handlePlay={handlePlay} />} />
            <Route path='instructions' element={<InstructionsLayout handlePlay={handlePlay} />} />
            <Route path='game' element={<GameLayout />} />
            <Route path='ranking' element={<RankingLayout />} />
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
    <Header showLoginModal={() => props.setIsLoginVisible(true)} onLogout={props.onLogout} />
    <Container fluid>
      <Row>
        <Col xs={1} className='sidebar'>
          <NavigationRail onLogout={props.onLogout}/>
        </Col>
        <Col xs={10} className='central-ctn'>
          <div className='page-ctn'>
            <Outlet />
          </div>
        </Col>
        <Col xs={1} className='sidebar'>

        </Col>
      </Row>

    </Container>
    <LoginModal 
      show={props.isLoginVisible} 
      handleClose={handleModalClose} 
      playAfterSubmit={props.playAfterLogin} 
      doLogin={props.doLogin} 
    />
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
  const availableTime = 90;

  const [phase, setPhase] = useState("setup");
  const [network, setNetwork] = useState({});
  const [game, setGame] = useState({});
  const [restored, setRestored] = useState(false);
  const [route, setRoute] = useState([]);
  const [routeError, setRouteError] = useState('');
  const [error, setError] = useState('');
  const [waiting, setWaiting] = useState(false);

  const idStationMap = new Map((network?.stations || []).map(s => [Number(s.id), s]));
  const idLineMap = new Map((network?.lines || []).map(l => [Number(l.id), l]));
  const idSegmentMap = new Map((network?.segments || []).map(s => [Number(s.id), s]));

  const restoreGame = (activeGame) => {
    setGame(activeGame);
    setRestored(true);
    setPhase('planning');
  }

  useEffect(() => {

    switch (phase) {
      case "setup": 
        setWaiting(true)

        async function loadData() {
          try {
            const [activeGame, gameNetwork] = await Promise.all([
              getActiveGame(),
              getNetwork()
            ]);

            setNetwork(gameNetwork)

            if (activeGame.active)
              restoreGame(activeGame)

          } catch (ex) {
            setError(ex)
          } finally {
            setWaiting(false)
          }
        }
        loadData()
        break;
      case "planning": 
        if (restored)
          return;

        setWaiting(true)
        async function loadGame() {
          try {
            const newGame = await startNewGame()
            setGame(newGame)
          } catch (ex) {
            setError(ex)
          } finally {
            setWaiting(false)
          }
        }
        loadGame();
        break;
      case 'execution': 
        setWaiting(true);
        async function loadResult() {
          try {
            const [gameResult, routeErrorResult] = await submitRoute(route)
            setGame({ ...game, ...gameResult })
            setRouteError(routeErrorResult)
            if (routeErrorResult)
              setPhase('result')
          } catch (ex) {
            setError(ex)
          } finally {
            setWaiting(false)
          }
        }
        loadResult()
        break;
      default:
        break;
    }

  }, [phase, restored])

  if (waiting) {
    return (
      <>
        <div className='title mb-2'>
          <h1>Loading {phase} phase...</h1>
        </div>
        <CustomSpinner />
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className='title'>
          <h1>ERROR at {phase} phase</h1>
        </div>
        <p className="text-center">{error.message}</p>
      </>
    )
  }

  switch (phase) {
    case "setup":
      /* fetch and show the network and check if active game */
      return <SetupView
        nextPhase={() => setPhase('planning')}
        // for the network svg
        idStationMap={idStationMap}
        idLineMap={idLineMap}
        segments={network?.segments ?? []} />

    case "planning":
      /* build the route of an active game */
      return <PlanningView
        // game info
        startStation={idStationMap.get(game?.startStationId)?.name ?? ''}
        destinationStation={idStationMap.get(game?.destinationStationId)?.name ?? ''}
        // timer + time expired action
        startTime={game?.startTime}
        nextPhase={() => setPhase('execution')}
        // for route building
        route={route}
        addSegment={(sId) => { setRoute(oldRoute => [...oldRoute, sId]) }}
        removeSegment={(sId) => { setRoute(oldRoute => oldRoute.filter(id => id !== sId)) }}
        // for the network svg
        idStationMap={idStationMap}
        idLineMap={idLineMap}
        segments={network?.segments ?? []} />;

    /* send the route and see the events */
    case "execution":

      // if the server has not yet responded with events, stay loading
      if (!game?.events || game.events.length === 0) {
        return (
          <>
            <div className='title mb-2'>
              <h1>Calculating route events...</h1>
            </div>
            <CustomSpinner />
          </>
        );
      }
      return <ExecutionView
        // events
        events={game?.events ?? []}
        stationNamesSteps={route.map(sId => (idSegmentMap.get(sId)?.stationIds ?? []).map(stId => idStationMap.get(Number(stId))?.name ?? ''))}
        nextPhase={() => setPhase('result')} />;

    /* see the final score */
    case "result":
      return <ResultView
        routeError={routeError}
        score={game?.score} />;
  }

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
