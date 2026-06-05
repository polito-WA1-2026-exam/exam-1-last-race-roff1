import { RankingEntry, Network, Station, Line, Segment, Game } from '../models/LastRaceModels.mjs';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function getRankings() {
    try {

        await delay(1000);
        const response = await fetch('http://localhost:3001/api/ranking', {
            credentials: 'include'
        })
        if(response.ok) {
            const rankings = await response.json()
            return rankings.map(r => new RankingEntry({ username: r.username, bestScore: r.bestScore }))
        }
        
        if (response.status === 401)
            throw new Error("Unauthorized");
        
        // 500 Internal Server Error
        throw new Error('HTTP error in getRankings, code=' + response.status)
        
            
    } catch (ex) {
        if (ex.name === "TypeError") // network error in fetch
            throw new Error('Network error', { cause: ex });

        throw ex;
    }

}

async function getNetwork() {
    try {

        await delay(1000);
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
        
        if (response.status === 401)
            throw new Error("Unauthorized");
        
        // 500 Internal Server Error
        throw new Error('HTTP error in getNetwork, code=' + response.status)
        
            
    } catch (ex) {
        if (ex.name === "TypeError") // network error in fetch
            throw new Error('Network error', { cause: ex });

        throw ex;
    } 
}

async function getActiveGame() {

    try {

        await delay(1000);
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
        
        if (response.status === 401)
            throw new Error("Unauthorized");
        
        // 500 Internal Server Error
        throw new Error('getNetwork failed with code ' + response.status)
        
            
    } catch (ex) {
        if (ex.name === "TypeError") // network error in fetch
            throw new Error('Network error', { cause: ex });

        throw ex;
    } 

}

async function startNewGame() {
    try {
        await delay(1000);
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
        } else {
            throw new Error('startNewGame failed with code ' + response.status)
        }
    } catch (ex) { // network error in fetch
        throw new Error("Network error in startNewGame", {cause: ex})
    }    
}

async function submitRoute(route, game) {
    try {
        await delay(1000);
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
                ...game,                      
                score: gameResult.score,
                events: (gameResult.events || []).map(e => new Event({ description: e.description, effect: e.effect })),
                status: gameResult.status,
                active: false
            }), ''];
        }

        if(response.status === 422){
            const gameResult = await response.json()
            return [new Game({
                ...game,                      
                score: gameResult.score,
                events: (gameResult.events || []).map(e => new Event({ description: e.description, effect: e.effect })),
                status: gameResult.status,
                active: false
            }), gameResult.validationErrors.route];
        }
        
        throw new Error('submitRoute failed with code ' + response.status)

    } catch (ex) { // network error in fetch
        throw new Error("Network error in submitRoute", {cause: ex})
    }
}

export { getRankings, getNetwork, getActiveGame, startNewGame, submitRoute }