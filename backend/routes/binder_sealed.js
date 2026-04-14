const express = require("express");
const { query, handleError } = require("../helpers/query.js");

const auth = require("../middleware/auth.js");

const router = express.Router();

router.post("/", auth, async (req,res) => {
    try{
        const binder_id=req.body.binder_id;
        const sealed_id = req.body.sealed_id;
        const quantity = req.body.quantity;

        const results = await query(
            'INSERT INTO binder_sealed (binder_id, sealed_id, quantity) VALUES (?,?,?)', [binder_id,sealed_id,quantity]
        );
        
        res.json(results);
    }
    catch(err){
        handleError(res,err);
    }
});

module.exports = router;