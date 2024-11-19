const express = require('express');
var bodyParser = require('body-parser');
const QuanLyModel = require('../models/quanly.model');
const routerQuanLy = express.Router();

routerQuanLy.use(bodyParser.urlencoded({ extended: false }));
routerQuanLy.use(bodyParser.json());

// GET /quanly/:maQL
routerQuanLy.get('/:maQL', async (req, res) => {
    try {
        const { maQL } = req.params;
        const quanly = await QuanLyModel.findOne({ maQL });
        
        if (!quanly) {
            return res.status(404).json({ message: 'Not found quanly' });
        }
        res.json(quanly);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = routerQuanLy;