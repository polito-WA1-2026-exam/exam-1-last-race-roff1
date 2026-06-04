import { Button } from 'react-bootstrap';

function RulePlayButton(props) {
    return (
        <div className={`custom-btn ${props.variant}`}>
            <Button onClick={props.handleClick}>{props.text}</Button>
        </div> 
    )
}

export { RulePlayButton }