const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');
const {
    body
} = require('express-validator')

const User = require('../models/user');

router.put('/signup', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, {
        req
    }) => {
        return User.findOne({
            email: value
        }).then(userDoc => {
            if (userDoc) {
                return Promise.reject('E-Mail address already exists!');
            }
        });
    })
    .normalizeEmail(),
    body('password')
    .trim()
    .isLength({
        min: 5
    }),
    body('name')
    .trim()
    .not()
    .isEmpty()
], AuthController.createUser);

router.post('/login', AuthController.loginUser);

router.get('/status', isAuth, AuthController.getUserStatus);

router.patch('/status', isAuth, [
    body('status')
    .trim()
    .not()
    .isEmpty()
], AuthController.updateUserStatus);

module.exports = router;