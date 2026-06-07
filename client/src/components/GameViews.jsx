import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router'

import dayjs from 'dayjs'

import { Container, Row, Col, Button } from "react-bootstrap";
import { CustomSpinner } from "./CustomSpinner.jsx"

function SetupView(props) {

    return (
        <>
            <div className='title'>
                <h1>STUDY THE NETWORK</h1>
            </div>
            <p className='lead-text mt-4'>Explore the underground map and familiarize yourself with the stations, lines, and interchanges. When you are ready, begin your mission.</p>
            <Container>
                <Row className="p-4">

                    <Col xs={3} className='d-flex flex-column justify-content-center align-items-start'></Col>
                    <Col xs={6}>
                        <NetworkMap showSegments={true} idStationMap={props.idStationMap} idLineMap={props.idLineMap} segments={props.segments} />
                    </Col>
                    <Col xs={3} className='d-flex flex-column justify-content-center align-items-end'>
                        <Timer startTime={null} duration={90} />
                        <Coins amount={20} />
                    </Col>

                </Row >

                <Row className="justify-content-center">
                    <Col xs="auto">
                        <Button className="game-btn mb-4" onClick={props.nextPhase}>START</Button>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

function PlanningView(props) {

    /* for segment options */
    let segmentNameIdMap = new Map(); // to obtain a set of different names (some segments are shared by multiple lines)
    for (const segment of props.segments) {
        const [aId, bId] = segment.stationIds.map(Number);
        const name = [props.idStationMap.get(aId)?.name ?? '', props.idStationMap.get(bId)?.name ?? ''].sort().join(" - ");
        if (!segmentNameIdMap.has(name))
            segmentNameIdMap.set(name, segment.id);
    }
    segmentNameIdMap = new Map([...segmentNameIdMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))); // sort for easier search
    const segmentIdNameMap = new Map([...segmentNameIdMap.entries()].map(([name, id]) => [id, name])); // from route segment ids to button names

    return (
        <>
            <div className='title'>
                <h1>{props.restored ?
                    "JOURNEY RESUMED" :
                    "PLAN YOUR ROUTE"}
                </h1>
            </div>
            <p className='lead-text mt-4'>{props.restored ?
                "A previous journey was found. Pick up where you left off and continue your ride through the underground." :
                "The lines have disappeared. Reconstruct the network from memory, examine the available segments, and build a valid route before time runs out."}
            </p>

            <Container>
                { /* map + game details */}
                <Row className="p-4">
                    <Col xs={3} className='d-flex flex-column justify-content-center align-items-start'>
                        <p>DEPARTURE<br /><strong>{props.startStation}</strong></p>
                        <p>DESTINATION<br /><strong>{props.destinationStation}</strong></p>
                    </Col>
                    <Col xs={6}>
                        <NetworkMap showSegments={false} idStationMap={props.idStationMap} idLineMap={props.idLineMap} segments={props.segments} />
                    </Col>
                    <Col xs={3} className='d-flex flex-column justify-content-center align-items-end'>
                        <Timer startTime={props.startTime} duration={90} onTimeExpired={props.nextPhase} />
                        <Coins amount={20} />
                    </Col>
                </Row>

                { /* buttons for route building and visualization */}
                <Row>
                    <SegmentOptions nameIdMap={segmentNameIdMap} addSegment={props.addSegment} selectedSegments={props.route} />
                </Row>
                <Row>
                    <Col xs={12}><p className='route-title'>Selected route</p></Col>
                    {props.route.length === 0 && <Col xs={12}><p className='text-center text-secondary'>Empty route</p></Col>}
                    <SelectedSegments idNameMap={segmentIdNameMap} selectedSegments={props.route} removeSegment={props.removeSegment} />
                </Row>

                <Row className="justify-content-center">
                    <Col xs="auto">
                        <Button className="game-btn mb-4" onClick={props.nextPhase}>SUBMIT</Button>
                    </Col>
                </Row>

            </Container>
        </>
    )
}

function ExecutionView(props) {
    console.log(props.events)
    console.log(props.stationNamesSteps)
    const pathFormatter = (path) => { // extract a meaningful sequence of segments: [B, A] [C, B] > [A, B] [B, C]
        if (path.length === 1)
            return path;
        if (path[1].includes(path[0][0]))
            path[0] = path[0].reverse()
        if (path[path.length - 2].includes(path[path.length - 1][1]))
            path[path.length - 1] = path[path.length - 1].reverse()
        for (let i = 1; i < path.length - 1; i++)
            if (path[i + 1].includes(path[i][0]))
                path[i] = path[i].reverse()
        return path
    }

    return (
        <>
            <div className='title'>
                <h1>RIDE THE RAILS</h1>
            </div>
            <p className='lead-text mt-4'>Your journey is underway. Travel through each segment, face unexpected events, and watch your coin balance rise or fall.</p>

            <Container>
                <Row>
                    <EventsSlider events={props.events} stationNamesSteps={pathFormatter(props.stationNamesSteps)} onLastView={props.nextPhase} />
                </Row>
            </Container>
        </>
    )
}

function ResultView(props) {
    const navigate = useNavigate()

    return (
        <>
            <div className='title'>
                <h1>END OF THE LINE</h1>
            </div>
            <p className='lead-text mt-4'>The journey is complete. Check your final score and see whether your ride deserves a place among the best underground explorers.</p>
            {props.routeError && (<Row><p className='text-danger text-center'><strong>GAME OVER: {props.routeError}</strong></p></Row>)}
            <Row>
                <Col xs={8} className='d-flex justify-content-start align-items-center coins'><p className="final-score">Final score</p><Coins amount={props.score} /> </Col>
                <Col xs={4} className='d-flex justify-content-end align-items-center'> <Link to="/" className="game-btn">HOME</Link> </Col>
            </Row>
        </>
    )
}


function NetworkMap(props) {

    const width = 1000;
    const height = 700;
    const padding = 60;

    // normalize and rescale coordinates
    const stations = Array.from(props.idStationMap.values());
    const minX = stations.length ? Math.min(...stations.map(s => s.positionX)) : 0;
    const maxX = stations.length ? Math.max(...stations.map(s => s.positionX)) : 0;
    const minY = stations.length ? Math.min(...stations.map(s => s.positionY)) : 0;
    const maxY = stations.length ? Math.max(...stations.map(s => s.positionY)) : 0;

    const mapX = (x) => padding + ((x - minX) / (maxX - minX)) * (width - 2 * padding);
    const mapY = (y) => padding + ((y - minY) / (maxY - minY)) * (height - 2 * padding);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="map">

            {/* segments */}
            {props.showSegments && props.segments.map(segment => {
                const [firstStationId, secondStationId] = segment.stationIds.map(Number).sort((x, y) => x - y); // sort to avoid normal unit vector to be in the opposite direction
                const [stationA, stationB] = [props.idStationMap.get(firstStationId), props.idStationMap.get(secondStationId)];

                if (!stationA || !stationB) return;

                const [xA, yA] = [mapX(stationA.positionX), mapY(stationA.positionY)];
                const [xB, yB] = [mapX(stationB.positionX), mapY(stationB.positionY)];

                const [dx, dy] = [xB - xA, yB - yA];
                const length = Math.sqrt(dx * dx + dy * dy);

                if (length === 0) return;

                const [nx, ny] = [-dy / length, dx / length]; // perpendicular unit vector

                // find how many station pairs share the same segment

                // string id for segment (alphabetic order) > 'id1-id2'
                const key = `${Math.min(firstStationId, secondStationId)}-${Math.max(firstStationId, secondStationId)}`;

                const sameSegments = props.segments.filter(s => {
                    const [a, b] = s.stationIds.map(Number);
                    return `${Math.min(a, b)}-${Math.max(a, b)}` === key;
                });

                const index = sameSegments.findIndex(s => s.id === segment.id);

                const totalWidth = 10;
                const segmentWidth = totalWidth / sameSegments.length;

                const offset = (index - (sameSegments.length - 1) / 2) * segmentWidth; // for distribution around the central line

                const line = props.idLineMap.get(Number(segment.lineId));

                return (
                    <line
                        key={segment.id}
                        x1={xA + nx * offset}
                        y1={yA + ny * offset}
                        x2={xB + nx * offset}
                        y2={yB + ny * offset}
                        stroke={line?.color || "black"}
                        strokeWidth={segmentWidth}
                        strokeLinecap="round"
                    />
                );
            })}

            {/* stations */}
            {[...props.idStationMap.entries()].map(([id, station]) => {

                const x = mapX(station.positionX);
                const y = mapY(station.positionY);

                return (
                    <g key={id}>

                        {/* label background */}
                        <rect
                            x={x + 10}
                            y={y - 20}
                            width={station.name.length * 8}
                            height={18}
                            fill="white"
                            rx={4}
                            opacity={0.9}
                        />

                        <text
                            x={x + 12}
                            y={y - 7}
                            fontSize="15"
                        >
                            {station.name}
                        </text>

                        <circle
                            cx={x}
                            cy={y}
                            r={9}
                            fill="white"
                            stroke="black"
                            strokeWidth={2}
                        />

                    </g>
                );
            })}

        </svg>
    );
}

function SegmentOptions(props) {
    return (
        <>
            {Array.from(props.nameIdMap.entries()).map(([name, id]) => (
                <SegmentOption key={id} onClick={() => props.addSegment(id)} disabled={props.selectedSegments.includes(id)} name={name} />
            ))}
        </>
    )
}

function SelectedSegments(props) {
    return (
        <>
            {props.selectedSegments.map(id => (
                <SegmentOption key={id} onClick={() => props.removeSegment(id)} disabled={false} name={props.idNameMap.get(id)} />
            ))}
        </>
    )
}

function SegmentOption(props) {
    return (
        <Col xs="auto" className="segment-option">
            <Button onClick={props.onClick} disabled={props.disabled}>{props.name}</Button>
        </Col>
    )
}

function Timer(props) {
    const [remainingTime, setRemainingTime] = useState(props.duration)
    const startTime = dayjs(props.startTime)

    useEffect(() => {
        if (startTime.isValid()) {
            const interval = setInterval(() => {
                const elapsed = dayjs().diff(startTime, "second");
                const remaining = Math.max(props.duration - elapsed, 0);

                setRemainingTime(remaining);

                if (remaining <= 0) {
                    clearInterval(interval);
                    props.onTimeExpired()
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, []);

    return (
        <div className="d-flex align-items-center timer">
            <p className={`m-0 me-2 ${props.seconds <= 10 && 'text-danger'}`}><strong>{remainingTime}</strong>s</p>
            <i className="bi bi-stopwatch-fill"></i>
        </div>
    )
}

function Coins(props) {
    return (
        <div className="d-flex align-items-center coins">
            <p className="m-0 me-2"><strong>{props.amount}</strong></p>
            <i className="bi bi-coin"></i>
        </div>
    )
}

function EventsSlider(props) {
    // <EventsSlider stationNamesSteps={pathFormatter(props.stationNamesSteps)} onLastView={props.nextPhase} />
    const [idx, setIdx] = useState(0)

    const next = () => setIdx(oldIdx => Math.min(oldIdx + 1, props.events.length - 1))
    const prev = () => setIdx(oldIdx => Math.max(oldIdx - 1, 0))

    const scores = [20]
    for (const effect of props.events.map(e => e.effect))
        scores.push(scores[scores.length - 1] + effect)

    const [fromStation, toStation] = [props.stationNamesSteps[idx][0], props.stationNamesSteps[idx][1]]
    const description = props.events[idx].description

    return (
        <Container className="events-slider">
            <Row>
                <Col>
                    <h4 className="section-title">{description}</h4>
                </Col>
            </Row>
            <Row>
                <Col>
                    <p className='event-from-to'>FROM <strong>{fromStation}</strong> TO <strong>{toStation}</strong></p>
                </Col>
            </Row>
            <Row>
                <Col>
                    <p className={`event-effect ${props.events[idx].effect < 0 ? 'text-danger' : (props.events[idx].effect > 0 ? 'text-success' : 'text-secondary')}`} >{props.events[idx].effect >= 0 && '+'}{props.events[idx].effect}</p>
                </Col>
            </Row>
            <Row className='event-score-change-ctn'>
                <Col className='d-flex justify-content-center align-items-center'>
                    <Coins amount={scores[idx]}/><i className="bi bi-caret-right-fill mx-4"></i><Coins amount={scores[idx+1]}/>
                </Col>
                
            </Row>
            <Row>
                <Col className={`d-flex ${(props.events.length > 1 && idx ===0) ? 'justify-content-center' : 'justify-content-between'} align-items-center`}>
                    {idx > 0 && <Button onClick={prev} className="event-btn"><i className="bi bi-arrow-left-short"></i></Button>}
                    {idx < props.events.length - 1 && <Button onClick={next} className="event-btn"><i class="bi bi-arrow-right-short"></i></Button>}
                    {idx === props.events.length - 1 && <Button className="event-btn" onClick={props.onLastView}>RESULT</Button>}
                </Col>
            </Row>
        </Container>
    )
}


export { SetupView, PlanningView, ExecutionView, ResultView }
