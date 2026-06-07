import { RankingEntry, Network, Station, Line, Segment, Game, Event } from '../models/LastRaceModels.mjs';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function getRankings() {
    try {

        await delay(500);
        const response = await fetch('http://localhost:3001/api/ranking', {
            credentials: 'include'
        })
        if(response.ok) {
            const rankings = await response.json()
            return rankings.map(r => new RankingEntry({ username: r.username, bestScore: r.bestScore }))
        }
        
        const errorData = await response.json()
        const serverErrorMessage = errorData?.error || 'No error message provided'

        const httpError = new Error(`HTTP error in getRankings, failed with code ${response.status}: ${serverErrorMessage}`);
        httpError.status = response.status;
        throw httpError;
            
    } catch (ex) {
        if (ex.status) // HTTP error
            throw ex;
        throw ex;
    }

}

async function getNetwork() {
    try {

        await delay(500);
        const response = await fetch('http://localhost:3001/api/network', {
            credentials: 'include'
        })
        if(response.ok) {
            const network = await response.json()
            return new Network({ 
                lines: (network.lines || []).map(l => new Line({ id: l.id, name: l.name, color: l.color })),
                stations: (network.stations || []).map(s => new Station({ id: s.id, name: s.name, positionX: s.positionX, positionY: s.positionY })),
                segments: (network.segments || []).map(s => new Segment({ id: s.id, firstStationId: s.stationIds[0], secondStationId: s.stationIds[1], lineId: s.lineId }))
            })
        }
        
        const errorData = await response.json()
        const serverErrorMessage = errorData?.error || 'No error message provided'

        const httpError = new Error(`HTTP error in getNetwork, failed with code ${response.status}: ${serverErrorMessage}`);
        httpError.status = response.status;
        throw httpError;
            
            
    } catch (ex) {
        if (ex.status) // HTTP error
            throw ex;
        throw ex;
    } 
}

async function getActiveGame() {

    try {

        await delay(500);
        const response = await fetch('http://localhost:3001/api/games/current', {
            credentials: 'include'
        })
        if(response.ok) {
            const game = await response.json()
            return new Game({ 
                startStationId: game.startStationId, 
                destinationStationId: game.destinationStationId, 
                startTime: game.startTime, 
                score: game.score, 
                events: (game.events || []).map(e => new Event({ description: e.description, effect: e.effect })),
                active: game.active
            })
        }
        
        const errorData = await response.json()
        const serverErrorMessage = errorData?.error || 'No error message provided'

        const httpError = new Error(`HTTP error in getActiveGame, failed with code ${response.status}: ${serverErrorMessage}`);
        httpError.status = response.status;
        throw httpError;
            
    } catch (ex) {
        if (ex.status) // HTTP error
            throw ex;
        throw ex;
    } 

}

async function startNewGame() {
    try {
        await delay(500);
        const response = await fetch(`http://localhost:3001/api/games`, {
            method: 'POST',
            credentials: 'include'
        })

        if(response.ok) {
            const game = await response.json()
            return new Game({ 
                startStationId: game.startStationId, 
                destinationStationId: game.destinationStationId, 
                startTime: game.startTime, 
                active: game.active
            })
        } 

        const errorData = await response.json()
        const serverErrorMessage = errorData?.error || 'No error message provided'

        const httpError = new Error(`HTTP error in startNewGame, failed with code ${response.status}: ${serverErrorMessage}`);
        httpError.status = response.status;
        throw httpError;


    } catch (ex) { // network error in fetch
        if (ex.status) // HTTP error
            throw ex;
        throw new Error("Network error in startNewGame", {cause: ex})
    }    
}

async function submitRoute(route) {
    try {
        await delay(500);
        const response = await fetch(`http://localhost:3001/api/games/route`, {
            method: 'POST',
            body: JSON.stringify({route: route}),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })

        if(response.ok) {
            const gameResult = await response.json()
            return [new Game({                 
                score: gameResult.score,
                events: (gameResult.events || []).map(e => new Event({ description: e.description, effect: e.effect })),
                status: gameResult.status,
                active: false
            }), ''];
        }

        if(response.status === 422){
            const gameResult = await response.json()
            return [new Game({                  
                score: gameResult.score,
                events: (gameResult.events || []).map(e => new Event({ description: e.description, effect: e.effect })),
                status: gameResult.status,
                active: false
            }), gameResult.validationErrors.route];
        }
        
        const errorData = await response.json()
        const serverErrorMessage = errorData?.error || 'No error message provided'

        const httpError = new Error(`HTTP error in submitRoute, failed with code ${response.status}: ${serverErrorMessage}`);
        httpError.status = response.status;
        throw httpError;

    } catch (ex) {
        if (ex.status) // HTTP error
            throw ex;
        throw new Error("Network error in submitRoute", {cause: ex}) // network error
    }
}

export { getRankings, getNetwork, getActiveGame, startNewGame, submitRoute }