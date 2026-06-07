import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { login, logout } from '../api/auth'

import { User } from '../models/LastRaceModels.mjs'

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

function LoginModal(props) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState({});

    const navigate = useNavigate()

    function parseErrorMessage(message) {
        try {
            return JSON.parse(message);
        } catch {
            return {error: message};
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedUsername = username.trim();
        setUsername(trimmedUsername);
        const newUser = new User({ username: trimmedUsername, password: password });

        try{
            const user = await login(newUser);
            props.doLogin(user);

            props.handleClose();
            if(props.playAfterSubmit)
                navigate('/game');

            setError({});
        } catch (ex){
            setError(parseErrorMessage(ex.message));
        }

    }

    return (
        <Modal show={props.show} onHide={props.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title><strong>LOGIN{ props.playAfterSubmit && ' AND START TO PLAY' }</strong></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className='mb-3' controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control className={error.username ? 'wrong-field' : ''} type="text" placeholder="Username" required={true} value={username} onChange={event => setUsername(event.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control className={error.password ? 'wrong-field' : ''} type="password" placeholder="Password" required={true} value={password} onChange={event => setPassword(event.target.value)} />
                    </Form.Group>
                    { Object.keys(error).length > 0 ?
                        <div id="errors" className='pt-1 pb-2'>
                        { /* errors.map((error, index) => (<p  key={index}>{error}</p>)) } */
                        Object.keys(error).map((err, index) => ( <p className='error-message' key={index}><b>{"Error "+(index+1)+": "}</b>{error[err]}</p> )) }
                        </div>
                        : ""
                    }
                    <Button className="mb-3" variant="primary" type="submit" >Login</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}


export { LoginModal }