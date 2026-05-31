import db from './db.js';
import { Events } from './LastRaceModels.js';

export const getEvents = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM events'
        db.all(query, [], (err) => {
            if (err) {
                reject(err);
            } else {
                const events = rows.map(e => new Event(e.id, e.description, e.effect))
                resolve(events)
            }              
        })
    })
}