const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socket = require('socket.io');

var app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("Hello World!");
});

const hostName = "192.168.1.15"
const port = process.env.PORT || 8080;
// const uri = process.env.ATLAS_URI;

const server = app.listen(port, hostName, () => {
    console.log(`Example app listening on: http://${hostName}:${port}/`);
})

// mongoose.connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

// const io = socket(server, {
//     cors: {
//         origin: ['http://14.225.206.237', 'http://localhost:3000'],
//         credential: true,
//     }
// });

// let isConnected = false;
// global.onlineUsers = new Map();

module.exports = app;