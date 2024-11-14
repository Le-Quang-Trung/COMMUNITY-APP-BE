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

// get thông tin sinh viên theo mssv, hoTen,ngaySinh, soDienThoai

routerSinhVien.get('/getSinhVien/:mssv/:hoTen/:ngaySinh/:soDienThoai', async (req, res) => {
    try {
        const { mssv, hoTen, ngaySinh, soDienThoai } = req.params;
        console.log('Params:', mssv, hoTen, ngaySinh, soDienThoai);  // Kiểm tra giá trị tham số

        // Chuyển đổi ngày sinh sang định dạng Date
        const ngaySinhDate = new Date(ngaySinh);
        console.log('Converted ngaySinh:', ngaySinhDate);

        // Tạo đối tượng truy vấn
        const query = { mssv, hoTen, ngaySinh: ngaySinhDate, soDT: soDienThoai };
        console.log('Query:', query);

        // Tìm thông tin sinh viên dựa trên các thuộc tính trong collection SinhVien
        const sinhvien = await SinhVienModel.findOne(query);
        if (!sinhvien) {
            console.log('SinhVien not found for query:', query);
            return res.status(404).json({ message: 'SinhVien not found' });
        }

        console.log('Found SinhVien:', sinhvien);
        res.json(sinhvien);
    } catch (error) {
        console.error('Error fetching SinhVien:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = routerSinhVien;