const express = require('express');
const bodyParser = require('body-parser');
const routerCongNo = express.Router();
const CongNoModel = require('../models/congno.model');
const SinhVienModel = require('../models/sinhvien.model');
const HocKyModel = require('../models/hocky.model');
const KhauTruModel = require('../models/khautru.model');

routerCongNo.use(bodyParser.urlencoded({ extended: false }));
routerCongNo.use(bodyParser.json());


// Get danh sách công nợ dựa trên MSSV và hocKy
routerCongNo.get('/getCongNo/:MSSV/:nganh/:hocKy', async (req, res, next) => {
    try {
        const { MSSV, nganh, hocKy } = req.params;
        console.log('Params:', MSSV, nganh, hocKy);  // Kiểm tra giá trị tham số

        // Tìm mã học kỳ dựa trên nganh và hocKy trong collection HocKy
        const hocKyDoc = await HocKyModel.findOne({ nganh, hocKy });
        if (!hocKyDoc) {
            console.log('HocKy not found for:', { nganh, hocKy });
            return res.status(404).json({ message: 'HocKy not found' });
        }

        const maHK = hocKyDoc.maHK;
        console.log('Found HocKy:', hocKyDoc);

        // Tìm danh sách công nợ dựa trên MSSV và mã học kỳ
        const congNo = await CongNoModel.find({ mssv: MSSV, maHK: maHK });
        if (!congNo || congNo.length === 0) {
            console.log('CongNo not found for MSSV:', MSSV);
            return res.status(404).json({ message: 'CongNo not found' });
        }

        console.log('Found CongNo:', congNo);

        // Tìm tên sinh viên
        const sinhVien = await SinhVienModel.findOne({ mssv: MSSV });

        // Kết hợp kết quả
        const result = congNo.map(cn => {
            return {
                ...cn._doc,
                tenSV: sinhVien.hoTen,
                maHK: maHK
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get danh sách khấu trừ dựa trên MSSV
routerCongNo.get('/getKhauTru/:MSSV', async (req, res, next) => {
    try {
        const { MSSV } = req.params;
        console.log('Params:', MSSV);  // Kiểm tra giá trị tham số

        // Tìm danh sách khấu trừ dựa trên MSSV
        const khauTruList = await KhauTruModel.find({ mssv: MSSV });
        if (!khauTruList || khauTruList.length === 0) {
            console.log('KhauTru not found for MSSV:', MSSV);
            return res.status(404).json({ message: 'KhauTru not found' });
        }

        console.log('Found KhauTru:', khauTruList);
        res.json(khauTruList);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = routerCongNo;