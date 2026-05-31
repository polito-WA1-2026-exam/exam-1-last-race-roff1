import db from './db.js';
import { Game, RankingEntry } from './LastRaceModels.js';

export const getGame = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM games WHERE id=?'
        db.get(query, [id], (err, row) => {
            if (err) {
                reject(err);
            }
            if (row === undefined) {
                resolve({error: 'Game not found'})
            } else {
                const game = new Game(row.id, row.startStationId, row.destinationStationId, row.startTime, row.status, row.score)
                resolve(game);
            }
        })
    })
}

export const addGame = (userId, startStationId, destinationStationId, startTime, status) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO games (userId, startStationId, destinationStationId, startTime, status) VALUES (?, ?, ?, ?, ?)'
        db.run(sql, [userId, startStationId, destinationStationId, startTime, status], function (err) {
            if (err)
                reject(err)
            else
                resolve(this.lastID)
        })
    })
}

export const endGame = (id, score) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE games SET score = ? WHERE id = ?'
        db.run(sql, [score, id], function(err) {
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
