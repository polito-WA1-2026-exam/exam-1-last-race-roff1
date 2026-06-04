import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useState, useEffect } from 'react';
import UserContext from './contexts/UserContext.js';
import { useNavigate } from 'react-router'

import { Container, Row, Col } from 'react-bootstrap';

import { Header } from './components/Header.jsx'
import { NavigationRail } from './components/NavigationRail.jsx'
import { Footer } from './components/Footer.jsx'
import { Outlet, Route, Routes } from 'react-router';
import { LoginModal, Logout } from './components/Login.jsx'
import { MovingTrain } from './components/MovingTrain.jsx'
import { Logo } from './components/Logo.jsx'
import { RulePlayButton } from './components/RulePlayButton.jsx'
import { InstructionsAccordion } from './components/InstructionsAccordion.jsx'

import { getCurrentUser } from './api/auth.js'

function App() {
  const [user, setUser] = useState({ id: undefined, username: undefined });
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const navigate = useNavigate()

  // at application launch > check session
  useEffect(() => {
    getCurrentUser().then(result => {
      if (result) {
        setUser({ id: result.id, username: result.username })
      }
    })
  }, [])

  const doLogin = (newUser) => {
    setUser({ id: newUser.id, email: newUser.username })
    navigate('/')
  }

  const handlePlay = () => {
    if (!user?.id) 
      return setIsLoginVisible(true);
    navigate('/game');
  };

  return (
    <UserContext.Provider value={user}>
      <Container fluid className='p-0'>
        <Routes>

          <Route path='/' element={<BaseLayout doLogin={doLogin} isLoginVisible={isLoginVisible} setIsLoginVisible={setIsLoginVisible} />}>
            <Route index element={<HomeLayout handlePlay={handlePlay} />} />
            <Route path='instructions' element={<InstructionsLayout handlePlay={handlePlay} />} />
            <Route path='game' element={<GameLayout />} />
            <Route path='ranking' element={<RankingLayout />} />
            <Route path='logout' element={<Logout doLogin={doLogin} />} />
            <Route path='page-not-found' element={<NotFoundLayout />} />
          </Route>

        </Routes>
      </Container>

    </UserContext.Provider>
  )
}

function BaseLayout(props) {

  return <>
    <Header showLoginModal={()=>props.setIsLoginVisible(true)} />
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
    <LoginModal show={props.isLoginVisible} handleClose={()=>props.setIsLoginVisible(false)}/>
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
            <RulePlayButton variant="instructions" text="HOW TO PLAY" handleClick={()=>navigate('/instructions')} /> 
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
      <p className='justify-text'>Your goal is simple: travel through the underground network and reach your destination before time runs out. At the beginning of each game you receive <strong>20 coins</strong> and a randomly assigned journey. During the trip, unexpected events may increase or decrease your score. Plan carefully: only a valid route can lead you to victory.</p>
      
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
}

function RankingLayout(props) {

}

function NotFoundLayout(props) {


}

export default App
