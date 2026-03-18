const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const auth = (req, res, next) => {
    try{
        const token = req.headers.authorization?.split(' ')[1];

        if(!token) {
            return res.status(401).json({ message: "No Token"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(err){
        return res.status(401).json({ message: "Invalid Token"});
    }
};

module.exports = auth;