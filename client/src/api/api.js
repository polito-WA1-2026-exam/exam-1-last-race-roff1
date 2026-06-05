import { RankingEntry } from '../models/LastRaceModels.mjs';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function getRankings() {
    try {

        await delay(2000);
        const response = await fetch('http://localhost:3001/api/ranking', {
            credentials: 'include'
        })
        if(response.ok) {
            const rankings = await response.json()
            return rankings.map(r => new RankingEntry(r.username, r.bestScore))
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

export { getRankings }