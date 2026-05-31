import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('last-race.db');

export default db;