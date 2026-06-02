import db from '../db.js';
import { Event } from '../LastRaceModels.mjs';

export const getEvents = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM events'
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                console.log(rows)
                const events = rows.map(e => new Event(e.id, e.description, e.effect))
                resolve(events)
            }              
        })
    })
}