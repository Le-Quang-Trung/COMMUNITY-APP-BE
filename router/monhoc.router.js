const express = require('express');
var bodyParser = require('body-parser');
const MonHocModel = require('../models/monhoc.model');
const routerMonHoc = express.Router();
const SinhVienModel = require('../models/sinhvien.model');
const HocKyModel = require('../models/hocky.model');
const LopHocPhanModel = require('../models/lophocphan.model');
const SinhVienLopHPModel = require('../models/sinhvienlophp.model'); // Đảm bảo đường dẫn đúng

routerMonHoc.use(bodyParser.urlencoded({ extended: false }));
routerMonHoc.use(bodyParser.json());

routerMonHoc.get('/', (req, res, next) => {
    MonHocModel.find({})
        .then((monhoc) => {
            res.json(monhoc);
        })
        .catch((err) => {
            res.status(500).json('get monhoc fail');
        });
});

// tìm nganh theo mssv, sau đó tìm maHK theo nganh và hocky, từ mssv tìm ra danh sách maLHP ở bảng sinhvienlophp, từ maLHP và maHK tìm ra danh sách maMonHoc ở bảng lophocphan, từ danh sách maMonHoc tìm ra danh sách thông tin môn học ở bảng monhoc
routerMonHoc.get('/getMonHoc/:MSSV/:hocky', async (req, res, next) => {
    try {
        const { MSSV, hocky } = req.params;
        console.log('Params:', MSSV, hocky);  // Kiểm tra giá trị tham số

        // Tìm nganh dựa trên MSSV trong collection SinhVien
        const sinhVien = await SinhVienModel.findOne({ mssv: MSSV });
        if (!sinhVien) {
            console.log('SinhVien not found for MSSV:', MSSV);
            return res.status(404).json({ message: 'SinhVien not found' });
        }

        const nganh = sinhVien.nganh;
        console.log('Found SinhVien:', sinhVien);
        console.log('nganh:', nganh);  // Log giá trị nganh

        // Tìm MaHocKy dựa trên nganh và hocky trong collection HocKy
        const hocKy = await HocKyModel.findOne({ nganh: nganh, hocKy: hocky });
        if (!hocKy) {
            console.log('HocKy not found for:', { nganh, hocky });
            return res.status(404).json({ message: 'HocKy not found' });
        }

        console.log('Found HocKy:', hocKy);
        console.log('maHK:', hocKy.maHK);  // Log giá trị maHK

        // Định nghĩa biến maLHPs bên ngoài khối try
        let maLHPs = [];

        // Từ MSSV tìm ra danh sách maLHP ở bảng sinhvienlophp
        try {
            console.log('Searching SinhVienLopHP for MSSV:', MSSV);  // Log giá trị MSSV
            const sinhVienLopHP = await SinhVienLopHPModel.find({ mssv: MSSV });
            if (!sinhVienLopHP || sinhVienLopHP.length === 0) {
                console.log('SinhVienLopHP not found for MSSV:', MSSV);
                return res.status(404).json({ message: 'SinhVienLopHP not found' });
            }
            console.log('Found SinhVienLopHP:', sinhVienLopHP);  // Log chi tiết kết quả truy vấn

            maLHPs = sinhVienLopHP.map(item => item.maLHP);
            console.log('maLHPs:', maLHPs);  // Log giá trị maLHPs
        } catch (error) {
            console.error('Error fetching SinhVienLopHP:', error);
            return res.status(500).json({ message: 'Lỗi server', error: error.message });
        }

        // Từ maLHP và maHK tìm ra danh sách maMonHoc ở bảng lophocphan
        const lopHocPhans = await LopHocPhanModel.find({ maLHP: { $in: maLHPs }, maHK: hocKy.maHK });
        if (!lopHocPhans || lopHocPhans.length === 0) {
            console.log('LopHocPhan not found for:', { maLHPs, maHK: hocKy.maHK });
            return res.status(404).json({ message: 'LopHocPhan not found' });
        }
        console.log('Found LopHocPhans:', lopHocPhans);  // Log chi tiết kết quả truy vấn

        const maMonHocs = lopHocPhans.map(item => item.maMonHoc);
        console.log('maMonHocs:', maMonHocs);  // Log giá trị maMonHocs

        // Từ danh sách maMonHoc tìm ra danh sách thông tin môn học ở bảng monhoc
        const monHocs = await MonHocModel.find({ maMonHoc: { $in: maMonHocs } });
        if (!monHocs || monHocs.length === 0) {
            console.log('MonHocs not found for:', maMonHocs);
            return res.status(404).json({ message: 'MonHocs not found' });
        }
        console.log('Found MonHocs:', monHocs);
        res.json(monHocs);
    } catch (error) {
        console.error('Error fetching MonHocs:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// API để lấy lớp học phần từ MSSV và hocKy
routerMonHoc.get('/getLopHocPhan/:MSSV/:hocky', async (req, res, next) => {
    try {
        const { MSSV, hocky } = req.params;
        console.log('Params:', MSSV, hocky);  // Kiểm tra giá trị tham số

        // Tìm nganh dựa trên MSSV trong collection SinhVien
        const sinhVien = await SinhVienModel.findOne({ mssv: MSSV });
        if (!sinhVien) {
            console.log('SinhVien not found for MSSV:', MSSV);
            return res.status(404).json({ message: 'SinhVien not found' });
        }

        const nganh = sinhVien.nganh;
        console.log('Found SinhVien:', sinhVien);
        console.log('nganh:', nganh);  // Log giá trị nganh

        // Tìm MaHocKy dựa trên nganh và hocky trong collection HocKy
        const hocKy = await HocKyModel.findOne({ nganh: nganh, hocKy: hocky });
        if (!hocKy) {
            console.log('HocKy not found for:', { nganh, hocky });
            return res.status(404).json({ message: 'HocKy not found' });
        }

        console.log('Found HocKy:', hocKy);
        console.log('maHK:', hocKy.maHK);  // Log giá trị maHK

        // Định nghĩa biến maLHPs bên ngoài khối try
        let maLHPs = [];

        // Từ MSSV tìm ra danh sách maLHP ở bảng sinhvienlophp
        try {
            console.log('Searching SinhVienLopHP for MSSV:', MSSV);  // Log giá trị MSSV
            const sinhVienLopHP = await SinhVienLopHPModel.find({ mssv: MSSV });
            if (!sinhVienLopHP || sinhVienLopHP.length === 0) {
                console.log('SinhVienLopHP not found for MSSV:', MSSV);
                return res.status(404).json({ message: 'SinhVienLopHP not found' });
            }
            console.log('Found SinhVienLopHP:', sinhVienLopHP);  // Log chi tiết kết quả truy vấn

            maLHPs = sinhVienLopHP.map(item => item.maLHP);
            console.log('maLHPs:', maLHPs);  // Log giá trị maLHPs
        } catch (error) {
            console.error('Error fetching SinhVienLopHP:', error);
            return res.status(500).json({ message: 'Lỗi server', error: error.message });
        }

        // Từ maLHP và maHK tìm ra danh sách lớp học phần ở bảng lophocphan
        const lopHocPhans = await LopHocPhanModel.find({ maLHP: { $in: maLHPs }, maHK: hocKy.maHK });
        if (!lopHocPhans || lopHocPhans.length === 0) {
            console.log('LopHocPhan not found for:', { maLHPs, maHK: hocKy.maHK });
            return res.status(404).json({ message: 'LopHocPhan not found' });
        }
        console.log('Found LopHocPhans:', lopHocPhans);  // Log chi tiết kết quả truy vấn

        res.json(lopHocPhans);
    } catch (error) {
        console.error('Error fetching LopHocPhans:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// API mới để lấy mã lớp học phần từ MSSV và maMonHoc
routerMonHoc.get('/getMaLopHocPhan/:MSSV/:maMonHoc', async (req, res, next) => {
    try {
        const { MSSV, maMonHoc } = req.params;
        console.log('Params:', MSSV, maMonHoc);  // Kiểm tra giá trị tham số

        // Từ MSSV tìm ra danh sách maLHP ở bảng sinhvienlophp
        let maLHPs = [];
        try {
            console.log('Searching SinhVienLopHP for MSSV:', MSSV);  // Log giá trị MSSV
            const sinhVienLopHP = await SinhVienLopHPModel.find({ mssv: MSSV });
            if (!sinhVienLopHP || sinhVienLopHP.length === 0) {
                console.log('SinhVienLopHP not found for MSSV:', MSSV);
                return res.status(404).json({ message: 'SinhVienLopHP not found' });
            }
            console.log('Found SinhVienLopHP:', sinhVienLopHP);  // Log chi tiết kết quả truy vấn

            maLHPs = sinhVienLopHP.map(item => item.maLHP);
            console.log('maLHPs:', maLHPs);  // Log giá trị maLHPs
        } catch (error) {
            console.error('Error fetching SinhVienLopHP:', error);
            return res.status(500).json({ message: 'Lỗi server', error: error.message });
        }

        // Từ maLHP và maMonHoc tìm ra danh sách lớp học phần ở bảng lophocphan
        const lopHocPhans = await LopHocPhanModel.find({ maLHP: { $in: maLHPs }, maMonHoc: maMonHoc });
        if (!lopHocPhans || lopHocPhans.length === 0) {
            console.log('LopHocPhan not found for:', { maLHPs, maMonHoc });
            return res.status(404).json({ message: 'LopHocPhan not found' });
        }
        console.log('Found LopHocPhans:', lopHocPhans);  // Log chi tiết kết quả truy vấn

        // Chỉ lấy mã lớp học phần
        const maLopHocPhans = lopHocPhans.map(item => item.maLHP);
        console.log('maLopHocPhans:', maLopHocPhans);  // Log giá trị maLopHocPhans

        res.json(maLopHocPhans);
    } catch (error) {
        console.error('Error fetching LopHocPhans:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});


module.exports = routerMonHoc;