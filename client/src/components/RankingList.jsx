import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { getRankings } from '../api/api.js'

import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';

function RankingList(props) {
    const [rankings, setRankings] = useState([]);
    const [error, setError] = useState('');
    const [waiting, setWaiting] = useState(true)

    useEffect(() => {
        setWaiting(true)
        async function getRankingList() {
            try {
                const rankingList = await getRankings()
                setRankings(rankingList)
            } catch(ex) {
                setError(ex)
            } finally {
                setWaiting(false)
            }
        }
        getRankingList()
    }, [])

    return (
        <ListGroup variant="flush">
            {waiting && (
                <div className='d-flex justify-content-center'>
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}
            
            {error && <p className="text-center">{error.message}</p>}
            
            {rankings.map((r, i) => (
                <RankingItem key={r.username} ranking={r} position={i+1} />
            ))}
        </ListGroup>
    )
}

function RankingItem(props) {
    return (
        <ListGroup.Item className='d-flex justify-content-center'>
            <div className="rank-ctn">
                <img src="images/ranking.png" alt="Ranking image"></img>
                <p className="score"><span>{props.ranking.bestScore}</span><br/>Coins</p>
                <p className="position">{props.position}<sup className="text-decoration-underline">a</sup> CLASSE</p>
                <p className="username">{props.ranking.username}</p>

            </div>
        </ListGroup.Item>
    )
}

export { RankingList }