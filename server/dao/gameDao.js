import db from '../db.js';
import { Game, RankingEntry } from '../LastRaceModels.mjs';
import dayjs from 'dayjs'

export const createGame = (game) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO games (userId, startStationId, destinationStationId, startTime, status) VALUES (?, ?, ?, ?, ?)'
        
        // Only minimal data sanitization is performed here to ensure safe SQL execution
        // Business logic + validation handled in the Express route
        if ( !game.userId || !game.startStationId || !game.destinationStationId || !game.status || !game.startTime || !dayjs(game.startTime).isValid() )
            return reject(new Error("Missing/wrong required fields"));

        db.run(sql, [game.userId, game.startStationId, game.destinationStationId, dayjs(game.startTime).format('YYYY-MM-DD HH:mm:ss'), game.status], function (err) {
            if (err)
                reject(err)
            else
                resolve({ ...game, id: this.lastID })
        })
    })
}


export const endGame = (id, score, status='completed') => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE games SET score = ?, status = ? WHERE id = ?`
        db.run(sql, [score, status, id], function(err) {
            if(err) 
                reject(err);
            else 
                resolve(this.changes);
        })
    })
}

export const getActiveGame = (userId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM games WHERE userId = ? AND status = 'active' AND startTime > datetime('now', 'localtime', '-95 seconds') ORDER BY startTime DESC LIMIT 1`
        db.get(query, [userId], (err, row) => {
            if(err)
                reject(err)
            else {
                if(!row)
                    resolve(null)
                else
                    resolve(new Game(row.id, row.userId, row.startStationId, row.destinationStationId, row.startTime, row.status, row.score))
            }

        })
    })
}

export const closeExpiredGames = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE games SET status = 'expired' WHERE status = 'active' AND startTime < datetime('now', 'localtime', '-95 seconds') AND userId = ?`
        db.run(sql, [userId], function (err) {
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
