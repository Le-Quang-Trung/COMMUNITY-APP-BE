const express = require('express');
const routerThongTinLopHoc = express.Router();
const LopHocPhanModel = require('../models/lophocphan.model');
const GiangVienModel = require('../models/giangvien.model');
const SinhVienModel = require('../models/sinhvien.model');

// API lấy thông tin lớp học phần dựa trên maGV
routerThongTinLopHoc.get('/getTTLopHocPhan/:maGV', async (req, res, next) => {
    try {
        const { maGV } = req.params;
        console.log('Params:', maGV);  // Kiểm tra giá trị tham số

        // Tìm lớp học phần dựa trên maGV trong collection LopHocPhan
        const lopHocPhans = await LopHocPhanModel.find({ GV: maGV });
        if (!lopHocPhans || lopHocPhans.length === 0) {
            console.log('LopHocPhan not found for maGV:', maGV);
            return res.status(404).json({ message: 'LopHocPhan not found' });
        }

        console.log('Found LopHocPhan:', lopHocPhans);

        res.json(lopHocPhans);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// API lấy thông tin danh sách sinh viên dựa trên maLHP
routerThongTinLopHoc.get('/getDanhSachSinhVien/:maLHP', async (req, res, next) => {
    try {
        const { maLHP } = req.params;
        console.log('Params:', maLHP);  // Kiểm tra giá trị tham số

        // Tìm lớp học phần dựa trên maLHP
        const lopHocPhan = await LopHocPhanModel.findOne({ maLHP });
        if (!lopHocPhan) {
            console.log('LopHocPhan not found:', maLHP);
            return res.status(404).json({ message: 'LopHocPhan not found' });
        }

        // Lấy danh sách sinh viên từ lớp học phần
        const danhSachSinhVien = lopHocPhan.sinhVien;
        console.log('Danh sách sinh viên:', danhSachSinhVien);

        // Tìm thông tin chi tiết của từng sinh viên
        const sinhVienDetails = await SinhVienModel.find({ mssv: { $in: danhSachSinhVien } });
        if (!sinhVienDetails || sinhVienDetails.length === 0) {
            console.log('SinhVien not found for maLHP:', maLHP);
            return res.status(404).json({ message: 'SinhVien not found' });
        }

        console.log('Found SinhVien:', sinhVienDetails);
        res.json(sinhVienDetails);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = routerThongTinLopHoc;
