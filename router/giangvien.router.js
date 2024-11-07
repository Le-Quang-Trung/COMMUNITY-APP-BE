const express = require('express');
var bodyParser = require('body-parser');
const GiangVienModel = require('../models/giangvien.model');
const routerGiangVien = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

routerGiangVien.use(bodyParser.urlencoded({ extended: false }));
routerGiangVien.use(bodyParser.json());

// GET /giangvien/:maGV
routerGiangVien.get('/:maGV', async (req, res) => {
    try {
        const { maGV } = req.params;
        const giangvien = await GiangVienModel.findOne({ maGV });
        
        if (!giangvien) {
            return res.status(404).json({ message: 'Not found teacher' });
        }
        res.json(giangvien);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = routerGiangVien;