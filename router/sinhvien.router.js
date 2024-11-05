const express = require('express');
var bodyParser = require('body-parser');
const SinhVienModel = require('../models/sinhvien.model');
const routerSinhVien = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

routerSinhVien.use(bodyParser.urlencoded({ extended: false }));
routerSinhVien.use(bodyParser.json());

// GET /sinhvien/:mssv
routerSinhVien.get('/:mssv', async (req, res) => {
    try {
        const { mssv } = req.params;
        const sinhvien = await SinhVienModel.findOne({ mssv });
        
        if (!sinhvien) {
            return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
        }
        res.json(sinhvien);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = routerSinhVien;