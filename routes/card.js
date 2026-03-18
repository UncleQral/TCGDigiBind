const express = require('express');
const {query, handleError} = require('../helpers/query.js');
const auth = require('../middleware/auth.js')

const router = express.Router();

router.get('/', auth, async (req, res)=> {
    try{
    const card_id = req.query.card_id;

    const results = await query('SELECT * FROM card WHERE card_id = ?',[card_id]);

    res.json(results);
    }
    catch(err){
        handleError(res, err);
    }
})

router.post('/', auth, async (req, res)=> {
    try{
    const name = req.body.name;
    const game_set = req.body.game_set;
    const rarity = req.body.rarity;
    const cardmarket_id = req.body.cardmarket_id

    const results = await query('INSERT INTO card (name, game_set, rarity, cardmarket_id) VALUES (?, ?, ?, ?)',[name, game_set, rarity, cardmarket_id]);

    res.json(results);
    }
    catch(err){
        handleError(res, err)
    }
})

router.delete('/', auth, async (req, res)=> {
    try{
    const card_id = req.body.card_id;

    const results = await query('DELETE FROM card WHERE card_id = ?', [card_id]);

    res.json(results);
    }
    catch(err){
        handleError(res, err);
    }
})

module.exports = router;
