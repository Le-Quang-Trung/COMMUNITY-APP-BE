const express = require('express');
var bodyParser = require('body-parser');
const MonHocModel = require('../models/monhoc.model');
const routerMonHoc = express.Router();

routerMonHoc.use(bodyParser.urlencoded({ extended: false }));
routerMonHoc.use(bodyParser.json());

routerMonHoc.get('/', (req, res, next) => {
    MonHocModel.find({})
        .then((monhoc) => {
            res.json(monhoc);
        })
        .catch((err) => {
            res.status(500).json('get monhoc fail');
        })
});



module.exports = routerMonHoc;