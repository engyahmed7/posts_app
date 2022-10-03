const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed');
const AuthRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const multer = require('multer');
const {
    v4: uuidv4
} = require('uuid');

const app = express();
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const MONGODB_URI =
    'mongodb+srv://engyahmed:l5AHbgJSrm5GyGvc@cluster0.sqxtr78.mongodb.net/API?retryWrites=true&w=majority';

app.use(bodyParser.json());

app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image'));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', AuthRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    });
});

mongoose.connect(MONGODB_URI)
    .then(result => {
        const server = app.listen(8000);
        const io = require("./socket").init(server);
        io.on('connection', socket => {
            console.log('Client connected');
        });
    })
    .catch(err => console.log(err));