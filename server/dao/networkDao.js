import { Line, Station, Segment, Network } from '../LastRaceModels.mjs';
import db from '../db.js';

const getLines = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM lines'
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const lines = rows.map(l => new Line(l.id, l.name, l.color))
                resolve(lines)
            }            
        })        
    })
}

const getStations = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM stations'
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const stations = rows.map(s => new Station(s.id, s.name, s.positionX, s.positionY))
                resolve(stations)
            }            
        })        
    })
}

const getSegments = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM segments'
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const segments = rows.map(s => new Segment(s.id, s.stationA, s.stationB, s.lineId))
                resolve(segments)
            }
        })
    })
}

export async function getNetwork() {
    const [lines, stations, segments] = await Promise.all([ // returns the first error if something goes wrong
        getLines(),
        getStations(),
        getSegments()
    ])
    return new Network(lines, stations, segments)
}