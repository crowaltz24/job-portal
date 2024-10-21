const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, 'secretKey');
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(404).json({ message: 'User not found' });
        }
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};