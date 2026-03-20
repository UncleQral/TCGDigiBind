const {query, handleError} = require('../helpers/query.js');
const express = require('express');
const router = express.Router();

router.post('/', async(req, res)=>{
    try{
        const {card_id, binder_id, grading_company_id, grade, cert_number} = req.body;
        const results = await query('INSERT INTO graded_card (card_id, binder_id, grading_company_id, grade, cert_number) VALUES (?, ?, ?, ?, ?)', [card_id, binder_id, grading_company_id, grade, cert_number]);
        res.json(results);
    }
    catch(err){
        handleError(res, err);
    }
})

router.get('/', async(req, res)=> {
    try{
    const binder_id = req.query.binder_id;
    const results = await query('SELECT * FROM graded_card WHERE binder_id = ?', [binder_id])
    res.json(results);  
    }
    catch(err){
        handleError(res, err);
    }
})

router.delete('/:id', async(req, res)=>{
    try{
        const id = req.params.id;
        const results = await query('DELETE FROM graded_card WHERE id = ?', [id]);
        res.json(results);
    }
    catch(err){
        handleError(res, err)
    }
})

router.put('/:id', async(req, res)=>{
    try{
        const id = req.params.id;
        const {grading_company_id, grade, cert_number} = req.body;
        const results = await query('UPDATE graded_card SET grading_company_id = ?, grade = ?, cert_number = ? WHERE id = ?', [grading_company_id, grade, cert_number, id]);
        res.json(results)
    }
    catch(err){
        handleError(res, err);
    }
})

module.exports =router;