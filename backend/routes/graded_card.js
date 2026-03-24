const {query, handleError} = require('../helpers/query.js');
const express = require('express');
const auth = require('../middleware/auth.js');
const router = express.Router();

router.post('/', auth, async(req, res)=>{
    try{
        const {card_id, binder_id, grading_company_id, grade, cert_number} = req.body;
        const results = await query('INSERT INTO graded_card (card_id, binder_id, grading_company_id, grade, cert_number) VALUES (?, ?, ?, ?, ?)', [card_id, binder_id, grading_company_id, grade, cert_number]);
        res.json(results);
    }
    catch(err){
        handleError(res, err);
    }
})

router.get('/', auth, async(req, res)=> {
    try{
        const binder_id = req.query.binder_id;
        const user_id = req.user.id;

        const results = await query(
            `SELECT gc.*, c.name AS card_name, gco.name AS grading_company_name
             FROM graded_card gc
             JOIN card c ON gc.card_id = c.card_id
             JOIN grading_company gco ON gc.grading_company_id = gco.id
             JOIN binder b ON gc.binder_id = b.id
             WHERE gc.binder_id = ? AND b.user_id = ?`,
            [binder_id, user_id]
        );
        res.json(results);
    }
    catch(err){
        handleError(res, err);
    }
})

router.delete('/:id', auth, async(req, res)=>{
    try{
        const id = req.params.id;
        const user_id = req.user.id;

        const results = await query(
            `DELETE gc FROM graded_card gc
             JOIN binder b ON gc.binder_id = b.id
             WHERE gc.id = ? AND b.user_id = ?`,
            [id, user_id]
        );
        res.json(results);
    }
    catch(err){
        handleError(res, err)
    }
})

router.put('/:id', auth, async(req, res)=>{
    try{
        const id = req.params.id;
        const user_id = req.user.id;
        const {grading_company_id, grade, cert_number} = req.body;

        const results = await query(
            `UPDATE graded_card gc
             JOIN binder b ON gc.binder_id = b.id
             SET gc.grading_company_id = ?, gc.grade = ?, gc.cert_number = ?
             WHERE gc.id = ? AND b.user_id = ?`,
            [grading_company_id, grade, cert_number, id, user_id]
        );
        res.json(results);
    }
    catch(err){
        handleError(res, err);
    }
})

module.exports =router;