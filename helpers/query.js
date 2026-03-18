const db = require('../db.js');

const query = (sql, params)=> {
    return new Promise((resolve, reject)=> {
        db.query(sql, params, (err, results)=> {
            if(err) reject(err);
            else resolve(results);
        })
    })
}

const handleError = (res, err)=> {
    res.status(500).json({error: err});
};

module.exports = {query, handleError};