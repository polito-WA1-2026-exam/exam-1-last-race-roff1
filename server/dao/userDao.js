import { User } from './LastRaceModels.js';
import db from './db.js';
import crypto from "crypto";


export const getUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE username = ?";
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (row === undefined) {
                resolve(false);
            }
            else {
                const user = { id: row.id, username: row.username };

                crypto.scrypt(password, row.salt, 16, function (err, hashedPassword) {
                    if (err) 
                        reject(err);
                    if (!crypto.timingSafeEqual(Buffer.from(row.hashedPassword, "hex"), hashedPassword))
                        resolve(false);
                    else
                        resolve(user);
                });
            }
        });
    });
};
