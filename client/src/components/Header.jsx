import UserContext from "../contexts/UserContext.js"

import { useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Header(props) {


    return (
        <Container fluid>
            <Row>
                <Col>
                </Col>
                <Col>
                    <Logo />
                </Col>
                <Col>
                    <UserArea />
                </Col>
            </Row>
        </Container>
    )
}

function Logo() {
    return (
        <div className='logo'>
            <img src="images/logo.png" alt="logo" />
        </div>
    );
}

function UserArea(props) {
    const user = useContext(UserContext)

    return (
        <div className="header-right">
            {user.id !== undefined ? (
                <>
                    <span>Welcome {user.username}</span>
                    <button onClick={onLogout}>Logout</button>
                </>
            ) : (
                <button onClick={()=>console.log('TODO')}>
                    <i className="bi bi-person-circle"></i>
                </button>
            )}
        </div>
    );
}

export { Header }