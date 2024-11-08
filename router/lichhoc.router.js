const express = require('express');
const routerLichHoc = express.Router();
const LichHocModel = require('../models/lichhoc.model');
const LopHocPhanModel = require('../models/lophocphan.model');
const MonHocModel = require('../models/monhoc.model');
const SinhVienLopHPModel = require('../models/sinhvienlophp.model');

// API để lấy lịch học dựa trên MSSV
routerLichHoc.get('/getLichHoc/:MSSV', async (req, res, next) => {
    try {
        const { MSSV } = req.params;
        console.log('Params:', MSSV);  // Kiểm tra giá trị tham số

        // Tìm danh sách mã lớp học phần (maLHP) dựa trên MSSV
        const sinhVienLopHP = await SinhVienLopHPModel.find({ mssv: MSSV });
        if (!sinhVienLopHP || sinhVienLopHP.length === 0) {
            console.log('SinhVienLopHP not found for MSSV:', MSSV);
            return res.status(404).json({ message: 'SinhVienLopHP not found' });
        }

        const maLHPs = sinhVienLopHP.map(item => item.maLHP);
        console.log('maLHPs:', maLHPs);  // Log giá trị maLHPs

        // Tìm lịch học dựa trên maLHP trong collection LichHoc
        const lichHoc = await LichHocModel.find({ maLHP: { $in: maLHPs } });
        if (!lichHoc || lichHoc.length === 0) {
            console.log('LichHoc not found for maLHPs:', maLHPs);
            return res.status(404).json({ message: 'LichHoc not found' });
        }

        console.log('Found LichHoc:', lichHoc);

        // Tìm tên lớp học phần và tên môn học
        const lopHocPhans = await LopHocPhanModel.find({ maLHP: { $in: maLHPs } });
        const maMonHocs = lopHocPhans.map(item => item.maMonHoc);
        const monHocs = await MonHocModel.find({ maMonHoc: { $in: maMonHocs } });

        // Kết hợp kết quả
        const result = lichHoc.map(lich => {
            const lopHocPhan = lopHocPhans.find(lhp => lhp.maLHP === lich.maLHP);
            const monHoc = monHocs.find(mh => mh.maMonHoc === lopHocPhan.maMonHoc);
            return {
                ...lich._doc,
                tenLopHocPhan: lopHocPhan.tenLopHocPhan,
                tenMonHoc: monHoc.tenMonHoc
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = routerLichHoc;