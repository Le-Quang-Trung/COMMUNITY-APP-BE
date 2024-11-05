const express = require('express');
var bodyParser = require('body-parser');
const ChuongTrinhKhungModel = require('../models/chuongtrinhkhung.model');
const HocKyModel = require('../models/hocky.model');
const MonHocModel = require('../models/monhoc.model');
const SinhVienModel = require('../models/sinhvien.model');
const routerChuongTrinhKhung = express.Router();

routerChuongTrinhKhung.use(bodyParser.urlencoded({ extended: false }));
routerChuongTrinhKhung.use(bodyParser.json());

routerChuongTrinhKhung.get('/', (req, res, next) => {
    ChuongTrinhKhungModel.find({})
        .then((chuongtrinhkhung) => {
            res.json(chuongtrinhkhung);
        })
        .catch((err) => {
            res.status(500).json('get chuongtrinhkhung fail');
        })
});

// Lấy chương trình khung theo MSSV và hocky
routerChuongTrinhKhung.get('/getChuongTrinhKhung/:MSSV/:hocky', async (req, res, next) => {
    try {
        const { MSSV, hocky } = req.params;
        console.log('Params:', MSSV, hocky);  // Kiểm tra giá trị tham số

        // Tìm ngành dựa trên MSSV trong collection SinhVien
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
            console.log('HocKy not found for:', { nganh, hocKy });
            return res.status(404).json({ message: 'HocKy not found' });
        }

        console.log('Found HocKy:', hocKy);
        console.log('maHK:', hocKy.maHK);  // Log giá trị maHK

        // Sử dụng MaHocKy để tìm chương trình khung
        const chuongtrinhkhung = await ChuongTrinhKhungModel.findOne({ maHK: hocKy.maHK });
        if (!chuongtrinhkhung) {
            console.log('ChuongTrinhKhung not found for maHK:', hocKy.maHK);
            return res.status(404).json({ message: 'ChuongTrinhKhung not found' });
        }

        console.log('Found ChuongTrinhKhung:', chuongtrinhkhung);

        // Tìm thông tin môn học dựa trên các mã môn học trong chương trình khung
        const maMonHocs = chuongtrinhkhung.monHoc; // Giả sử monHoc là một mảng chứa các mã môn học
        console.log('maMonHocs:', maMonHocs);  // Log giá trị maMonHocs

        const monHocs = await MonHocModel.find({ maMonHoc: { $in: maMonHocs } });
        if (!monHocs || monHocs.length === 0) {
            console.log('MonHocs not found for:', maMonHocs);
            return res.status(404).json({ message: 'MonHocs not found' });
        }

        console.log('Found MonHocs:', monHocs);

        res.json({ chuongtrinhkhung, monHocs });
    } catch (err) {
        console.error('Error fetching ChuongTrinhKhung:', err);
        res.status(500).json({ message: 'Get ChuongTrinhKhung failed' });
    }
});



module.exports = routerChuongTrinhKhung;