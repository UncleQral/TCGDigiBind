const express = require('express');
const {query, handleError} = require('../helpers/query.js');
const auth = require ('../middleware/auth.js')

const router = express.Router();

router.get('/', auth, async (req, res) =>{
    try{
    const user_id = req.user.id;

    const results = await query('SELECT * FROM binder WHERE user_id = ?', [user_id]);

    res.json(results);

    }catch(err){
        handleError(res, err);
    }
})

router.post('/', auth, async (req, res)=>{
    try{
    const user_id = req.user.id;
    const name = req.body.name;
    const game = req.body.game;

    const results = await query('INSERT INTO binder (user_id, name, game) VALUES (?, ?, ?)',[user_id, name,game]);

    res.json(results);

    }catch(err){
         handleError(res, err);
    }
})

router.delete('/', auth, async (req, res) =>{
    try{
    const id = req.body.id;
    const user_id = req.user.id;

    const results = await query('DELETE FROM binder WHERE id = ? AND user_id = ?', [id, user_id])

    res.json(results);

    }catch(err){
         handleError(res, err);
    }
})

router.put('/', auth, async (req, res) =>{
    try{
    const id = req.body.id;
    const user_id = req.user.id;
    const name = req.body.name;
    const game = req.body.game;

    const results = await query('UPDATE binder SET name = ?, game = ? WHERE id = ? AND user_id = ?', [name, game, id, user_id]);

    res.json(results);

    }catch(err){
        handleError(res, err);
    }
})

module.exports = router;