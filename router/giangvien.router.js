const express = require('express');
var bodyParser = require('body-parser');
const GiangVienModel = require('../models/giangvien.model');
const HocKyModel = require('../models/hocky.model');
const LopHocPhanModel = require('../models/lophocphan.model');
const ThongBaoSV = require('../models/thongbaosv.model');

const routerGiangVien = express.Router();

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

// từ nganh và hocKy tìm ra mã học kỳ, từ mã học kỳ và GV tìm ra danh sách lớp học phần mà giảng viên đó dạy trong học kỳ đó
routerGiangVien.get('/getLopHocPhan/:maGV/:nganh/:hocKy', async (req, res) => {
    try {
        const { maGV, nganh, hocKy } = req.params;
        console.log('Params:', maGV, nganh, hocKy);  // Kiểm tra giá trị tham số

        // Tìm mã học kỳ dựa trên nganh và hocKy trong collection HocKy
        const hocKyDoc = await HocKyModel.findOne({ nganh, hocKy });
        if (!hocKyDoc) {
            console.log('HocKy not found for:', { nganh, hocKy });
            return res.status(404).json({ message: 'HocKy not found' });
        }

        const maHK = hocKyDoc.maHK;
        console.log('Found HocKy:', hocKyDoc);

        // Tìm danh sách lớp học phần dựa trên mã học kỳ và GV trong collection LopHocPhan
        const lopHocPhans = await LopHocPhanModel.find({ maHK, GV: maGV });
        if (!lopHocPhans || lopHocPhans.length === 0) {
            console.log('LopHocPhan not found for:', { maHK, GV: maGV });
            return res.status(404).json({ message: 'LopHocPhan not found' });
        }

        console.log('Found LopHocPhans:', lopHocPhans);
        res.json(lopHocPhans);
    } catch (error) {
        console.error('Error fetching LopHocPhans:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// API đánh giá học tập sinh viên
routerGiangVien.post('/danhGiaHocTap', async (req, res) => {
    try {
        const { tieuDeThongBao, noiDungThongBao, doiTuongThongBao, taoThongBao } = req.body;
        console.log('Body:', { tieuDeThongBao, noiDungThongBao, doiTuongThongBao, taoThongBao });  // Kiểm tra giá trị tham số

        // Kiểm tra các trường bắt buộc
        if (!tieuDeThongBao || !noiDungThongBao || !doiTuongThongBao || !taoThongBao) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Tạo thông báo mới
        const thongBao = new ThongBaoSV({
            tieuDeThongBao,
            noiDungThongBao,
            doiTuongThongBao,
            taoThongBao,
            ngayGioThongBao: new Date() // Ngày giờ hiện tại
        });
        const doc = await thongBao.save();
        console.log('Created ThongBaoSV:', doc);

        res.json(doc);
    } catch (error) {
        console.error('Error creating ThongBaoSV:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// API để tạo thông báo cho lớp học phần
routerGiangVien.post('/thongBaoLopHP', async (req, res) => {
    try {
        const { tieuDeThongBao, noiDungThongBao, taoThongBao, maLHP } = req.body;
        console.log('Body:', { tieuDeThongBao, noiDungThongBao, taoThongBao, maLHP });  // Kiểm tra giá trị tham số

        // Kiểm tra các trường bắt buộc
        if (!tieuDeThongBao || !noiDungThongBao || !taoThongBao || !maLHP) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Tìm lớp học phần dựa trên mã lớp học phần
        const lopHocPhan = await LopHocPhanModel.findOne({ maLHP });
        if (!lopHocPhan) {
            console.log('LopHocPhan not found:', maLHP);
            return res.status(404).json({ message: 'LopHocPhan not found' });
        }

        // Lấy danh sách sinh viên từ lớp học phần
        const danhSachSinhVien = lopHocPhan.sinhVien;
        console.log('Danh sách sinh viên:', danhSachSinhVien);

        // Tạo thông báo cho từng sinh viên
        const thongBaoList = [];
        for (const mssv of danhSachSinhVien) {
            const thongBao = new ThongBaoSV({
                tieuDeThongBao,
                noiDungThongBao,
                doiTuongThongBao: mssv,
                taoThongBao,
                ngayGioThongBao: new Date() // Ngày giờ hiện tại
            });
            const savedThongBao = await thongBao.save();
            thongBaoList.push(savedThongBao);
        }

        console.log('Created ThongBaoSV:', thongBaoList);
        res.json(thongBaoList);
    } catch (error) {
        console.error('Error creating ThongBaoSV:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = routerGiangVien;