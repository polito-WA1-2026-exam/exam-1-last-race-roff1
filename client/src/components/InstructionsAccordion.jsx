import Accordion from 'react-bootstrap/Accordion';
import ListGroup from 'react-bootstrap/ListGroup';

import { RulePlayButton } from './RulePlayButton.jsx'

function InstructionsAccordion(props) {
    return (
        <Accordion defaultActiveKey="0" className="instructions">
            <Accordion.Item eventKey="0">
                <Accordion.Header>1. SETUP</Accordion.Header>
                <Accordion.Body>
                    <SetupPhase />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
                <Accordion.Header>2. PLANNING</Accordion.Header>
                <Accordion.Body>
                    <PlanningPhase />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
                <Accordion.Header>3. EXECUTION</Accordion.Header>
                <Accordion.Body>
                    <ExecutionPhase />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
                <Accordion.Header>4. RESULT</Accordion.Header>
                <Accordion.Body>
                    <ResultPhase handlePlay={props.handlePlay} />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="4">
                <Accordion.Header>5. RANKING</Accordion.Header>
                <Accordion.Body>
                    <RankingInstructions />
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    )

}

function SetupPhase(props) {
    return (
        <>
            <h3 className='section-title mt-4'>SETUP PHASE</h3>
            <p className='text-center'>Before starting, you can explore the complete underground map.</p>
            <p className="text-info text-decoration-underline text-center"><strong>The map shows:</strong></p>
            <ListGroup variant="flush" className='text-center'>
                <ListGroup.Item>All stations</ListGroup.Item>
                <ListGroup.Item>Metro lines</ListGroup.Item>
                <ListGroup.Item>Interchange stations</ListGroup.Item>
                <ListGroup.Item>Connections between stations</ListGroup.Item>
            </ListGroup>
        </>
    )
}

function PlanningPhase(props){
    return (
        <>
            <h3 className='section-title mt-4'>PLANNING PHASE</h3>
            <p>The planning phase is the core of the game. You are given:</p>
            <ListGroup variant="flush" className='text-center'>
                <ListGroup.Item>A starting station</ListGroup.Item>
                <ListGroup.Item>A destination station</ListGroup.Item>
                <ListGroup.Item>A list of all available segments</ListGroup.Item>
            </ListGroup>
            <p>The map now shows only station names. <span className="text-danger">The line connections are hidden.</span></p>
            <p>You have <span className="text-warning"><strong>90 seconds</strong></span> to reconstruct the network mentally and build a route from the starting station to the destination station.</p>

            <p className="text-info text-decoration-underline text-center"><strong>ROUTE RULES:</strong></p>
            <ListGroup variant="flush" className='text-center'>
                <ListGroup.Item>The route must start from the assigned starting station.</ListGroup.Item>
                <ListGroup.Item>The route must end at the assigned destination station.</ListGroup.Item>
                <ListGroup.Item>A segment can be used only once.</ListGroup.Item>
                <ListGroup.Item>Line changes are allowed only at interchange stations.</ListGroup.Item>
                <ListGroup.Item>Stations may be visited more than once if necessary.</ListGroup.Item>
            </ListGroup>
            <p className="mt-4">When you are satisfied, submit your route before the timer expires.</p>
            <img src="images/planning-screen.jpg" alt="Planning phase with timer and selected route screenshot"></img>       
        </>
    )
}

function ExecutionPhase(props){
    return (
        <>
            <h3 className='section-title mt-4'>EXECUTION PHASE</h3>
            <p>Once the route is submitted, the journey begins.</p>
            <p>For each segment of your route, a <span className="text-warning">random event occurs</span> and immediately affects your coin balance.</p>
            <p>Examples of events:</p>
            <ListGroup variant="flush" className='text-center'>
                <ListGroup.Item>Smooth ride (+0 coins)</ListGroup.Item>
                <ListGroup.Item>Friendly passenger (+2 coins)</ListGroup.Item>
                <ListGroup.Item>Free coffee (+1 coin)</ListGroup.Item>
                <ListGroup.Item>...</ListGroup.Item>
            </ListGroup>

            <p>The result of each event is displayed step by step together with your updated coin total.</p>

            <img src="images/event-card-screen.jpg" alt="Event card and updated score screenshot"></img>

            <p>If your route is <strong>invalid or incomplete</strong>, the journey fails and your <span className="text-danger">final score becomes 0.</span></p>  
        </>
    )
}

function ResultPhase(props){
    return (
        <>
            <h3 className='section-title mt-4'>RESULT PHASE</h3>
            <p>At the end of the game, your <span className="text-info">remaining coins determine your score</span>. A higher score means a better performance. Negative scores are recorded as zero. From this screen you can immediately start a new game and try to improve your result.</p>
            <div className="d-flex justify-content-center">
                <RulePlayButton variant="play" text="PLAY NOW" handleClick={props.handlePlay} /> 
            </div>
        </>
    )
}

function RankingInstructions(props){
    return (
        <>
            <h3 className='section-title mt-4'>RANKING</h3>
            <p>Registered users compete in a global ranking. The leaderboard displays the <strong className="text-warning">best score achieved by each player</strong>. Challenge yourself and try to reach the top position.</p>
            <img src="images/ranking-screen.jpg" alt="Ranking page screenshot"></img>
            <p className="lead-text mt-4">Good luck, and enjoy your Turin Underground!</p>          
        </>
    )
}

export { InstructionsAccordion }