import db from './db.js';
import { Game, RankingEntry } from './LastRaceModels.js';

export const createGame = (game) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO games (userId, startStationId, destinationStationId, startTime, status) VALUES (?, ?, ?, ?, ?)'
        
        // Only minimal data sanitization is performed here to ensure safe SQL execution
        // Business logic + validation handled in the Express route
        if ( !game.userId || !game.startStationId || !game.destinationStationId || !game.startTime || !game.status || !game.startTime || !dayjs(game.startTime).isValid() )
            reject(new Error("Missing/wrong required fields"));

        db.run(sql, [game.userId, game.startStationId, game.destinationStationId, dayjs(game.startTime).toISOString(), game.status], function (err) {
            if (err)
                reject(err)
            else
                resolve({ ...game, id: this.lastID })
        })
    })
}


export const endGame = (id, score) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE games SET score = ?, status = 'completed' WHERE id = ?`
        db.run(sql, [score, id], function(err) {
            if(err) 
                reject(err);
            else 
                resolve(this.changes);
        })
    })
}

export const getActiveGame = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM games WHERE userId = ? AND status = active AND startTime >= datetime('now', '-90seconds') LIMIT 1`
        db.get(query, [userId], (err, row) => {
            if(err)
                reject(err)
            else {
                if(!row)
                    resolve(null)
                else
                    resolve(new Game(row.id, row.startStationId, row.destinationStationId, row.startTime, row.status, row.bestScore))
            }

        })
    })
}

export const closeExpiredGames = () => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE games SET status = 'expired' WHERE startTime < datetime('now', '-90 seconds')`
        db.run(sql, [], function (err) {
            if(err) 
                reject(err);
            else
                resolve(this.changes);
        })
    })
}

export const getRanking = () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT username, MAX(score) AS bestScore FROM games JOIN users ON users.id = games.userId WHERE games.score IS NOT NULL AND games.status = 'completed' GROUP BY users.id ORDER BY bestScore DESC LIMIT 20`
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const ranking = rows.map(r => new RankingEntry(r.username, r.bestScore))
                resolve(ranking)
            }    
        })

    })
}
