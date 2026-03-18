const express = require('express');
const {query, handleError} = require('../helpers/query.js');

const auth = require('../middleware/auth.js')

const router = express.Router();

router.get('/', auth, async (req, res)=> {
   try{
    const binder_id = req.query.binder_id;

    const results = await query('SELECT * FROM binder_card WHERE binder_id = ?', [binder_id]);

    res.json(results);
   } catch(err){
    handleError(res, err);
   }
})

router.post('/', auth, async (req, res)=> {
    try{
    const binder_id = req.body.binder_id;
    const card_id = req.body.card_id;
    const quantity = req.body.quantity;
    const condition_of_card = req.body.condition_of_card;
    const status = req.body.status;
    const foil = req.body.foil;

    const results = await query('INSERT INTO binder_card (binder_id, card_id, quantity, condition_of_card, status, foil) VALUES (?, ?, ?, ?, ?, ?)', [binder_id, card_id, quantity, condition_of_card, status, foil]);

    res.json(results);
    }catch(err){
       handleError(res, err);
    }

})

router.delete('/', auth, async (req, res)=> {
    try{
    const id = req.body.id;

    const results = await query('DELETE FROM binder_card WHERE id = ?', [id]);

    res.json(results);
    }catch(err){
        handleError(res, err);
    }
})

router.put('/', auth, async (req, res)=> {
    try{
    const id = req.body.id;
    const condition_of_card = req.body.condition_of_card;
    const status = req.body.status;
    const foil = req.body.foil;

    const results = await query('UPDATE binder_card SET condition_of_card = ?, status = ?, foil = ? WHERE id = ?', [condition_of_card, status, foil, id]);

    res.json(results);
    }catch(err){
        handleError(res, err);
    }
})
module.exports = router;