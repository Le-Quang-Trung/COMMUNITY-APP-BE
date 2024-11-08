const express = require('express');
const routerThongTinLopHoc = express.Router();
const LopHocPhanModel = require('../models/lophocphan.model');
const GiangVienModel = require('../models/giangvien.model');

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

module.exports = routerThongTinLopHoc;
