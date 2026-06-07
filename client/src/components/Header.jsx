import UserContext from "../contexts/UserContext.js"

import { useContext } from 'react';

import { Container, Row, Col, Button } from 'react-bootstrap';

import { Logo } from './Logo.jsx'
import { Link } from 'react-router'

function Header(props) {

    return (
        <Container fluid className='header p-4 '>
            <Row>
                <Col xs={5}></Col>
                <Col xs={2}>
                    <Link to="/"><Logo /></Link>
                </Col>
                <Col xs={5} className='d-flex justify-content-end align-items-center'>
                    <UserArea showLoginModal={props.showLoginModal} onLogout={props.onLogout} />
                </Col>
            </Row>
        </Container>
    )
}

function UserArea(props) {
    const user = useContext(UserContext)

    return (
        <>
            {user.id !== undefined ? (
                <>
                    <span className="me-2">Welcome <strong>{user.username}</strong></span>
                    <Button onClick={props.onLogout} title='Logout' className='log-btn'>
                        <span className="material-symbols-outlined">logout</span>
                    </Button>
                </>
            ) : (
                <>
                    <span className="me-2">Login</span>
                    <Button onClick={props.showLoginModal} title='Login' className='log-btn'>
                        <span class="material-symbols-outlined">account_circle</span>
                    </Button>                
                </>
            )}
        </>
    );
}

export { Header }