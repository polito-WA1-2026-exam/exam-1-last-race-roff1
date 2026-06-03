import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useState, useEffect } from 'react';
import UserContext from './contexts/UserContext.js';

import { Container, Row, Col } from 'react-bootstrap';
import { Header } from './components/Header.jsx'
import { NavigationRail } from './components/NavigationRail.jsx'
import { Footer } from './components/Footer.jsx'
import { Outlet, Route, Routes } from 'react-router';
import { Login, Logout } from './components/Login.jsx'
import { MovingTrain } from './components/MovingTrain.jsx'

import { getCurrentUser } from './api/auth.js'

function App() {
  const [user, setUser] = useState({ id: undefined, username: undefined })

  // at application launch > check session
  useEffect(() => {
    getCurrentUser().then(result => {
      if (result) {
        setUser({ id: result.id, username: result.username })
      }
    })
  }, [])

  const doLogin = (newUser) => {
    setUser({ id: newUser.id, email: newUser.username, name: newUser.name })
    navigate('/home')
  }

  return (
    <UserContext.Provider value={user}>
      <Container>
        <Routes>

          <Route path='/' element={<BaseLayout doLogin={doLogin} />}>
            <Route index element={<HomeLayout />} />
            <Route path='instructions' element={<InstructionsLayout />} />
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
    <Header />
    <Container>
      <Row>
        <Col xs={1} className='sidebar'>
          <NavigationRail />
        </Col>
        <Col xs={10}>
          <Outlet />
        </Col>
        <Col xs={1} className='sidebar'>

        </Col>
      </Row>

      <MovingTrain />
    </Container>
    <Footer />
  </>
}

function HomeLayout(props) {
  // welcome + 2 buttons
}

function InstructionsLayout(props) {
  // little panel with text describing context and phases (screenshots)
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
