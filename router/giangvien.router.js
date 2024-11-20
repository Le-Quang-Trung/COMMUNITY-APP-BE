const express = require('express');
var bodyParser = require('body-parser');
const GiangVienModel = require('../models/giangvien.model');
const HocKyModel = require('../models/hocky.model');
const LopHocPhanModel = require('../models/lophocphan.model');
const ThongBaoSV = require('../models/thongbaosv.model');

const routerGiangVien = express.Router();

routerGiangVien.use(bodyParser.urlencoded({ extended: false }));
routerGiangVien.use(bodyParser.json());

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

// API lấy thông tin giảng viên dựa trên mã giảng viên
routerGiangVien.get('/getThongTinGiangVien/:maGV', async (req, res) => {
    try {
        const { maGV } = req.params;
        console.log('Params:', maGV);  // Kiểm tra giá trị tham số

        // Tìm giảng viên dựa trên mã giảng viên trong collection GiangVien
        const giangVien = await GiangVienModel.findOne({ maGV });
        if (!giangVien) {
            console.log('GiangVien not found:', maGV);
            return res.status(404).json({ message: 'GiangVien not found' });
        }

        console.log('Found GiangVien:', giangVien);
        res.json(giangVien);
    } catch (error) {
        console.error('Error fetching GiangVien:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});


// API đánh giá học tập sinh viên
routerGiangVien.post('/danhGiaHocTap', async (req, res) => {
    try {
        const { tieuDe, noiDung, doiTuongThongBao, taoThongBao } = req.body;
        console.log('Body:', { tieuDe, noiDung, doiTuongThongBao, taoThongBao });  // Kiểm tra giá trị tham số

        // Kiểm tra các trường bắt buộc
        if (!tieuDe || !noiDung || !doiTuongThongBao || !taoThongBao) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Tạo thông báo mới
        const thongBao = new ThongBaoSV({
            tieuDe,
            noiDung,
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
module.exports = routerGiangVien;