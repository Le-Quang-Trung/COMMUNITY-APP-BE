const express = require('express');
const bodyParser = require('body-parser');
const routerCongNo = express.Router();
const CongNoModel = require('../models/congno.model');
const SinhVienModel = require('../models/sinhvien.model');
const HocKyModel = require('../models/hocky.model');
const KhauTruModel = require('../models/khautru.model');
const PhieuThuModel = require('../models/phieuthu.model');

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

// api get all PhieuThu by MSSV
routerCongNo.get('/getPhieuThu/:MSSV', async (req, res, next) => {
    try {
        const { MSSV } = req.params;
        console.log('Params:', MSSV);  // Kiểm tra giá trị tham số

        // Tìm danh sách phiếu thu dựa trên MSSV
        const phieuThuList = await PhieuThuModel.find({ mssv: MSSV });
        if (!phieuThuList || phieuThuList.length === 0) {
            console.log('PhieuThu not found for MSSV:', MSSV);
            return res.status(404).json({ message: 'PhieuThu not found' });
        }

        console.log('Found PhieuThu:', phieuThuList);
        res.json(phieuThuList);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// API để cập nhật toàn bộ công nợ trong học kỳ thành "đã đóng" và tạo phiếu thu tương ứng
routerCongNo.post('/thanhToan/:MSSV/:nganh/:hocKy', async (req, res) => {
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
        const congNoList = await CongNoModel.find({ mssv: MSSV, maHK: maHK });
        if (!congNoList || congNoList.length === 0) {
            console.log('CongNo not found for MSSV:', MSSV);
            return res.status(404).json({ message: 'CongNo not found' });
        }

        console.log('Found CongNo:', congNoList);

        // Tìm tổng số tiền khấu trừ của sinh viên
        const khauTruList = await KhauTruModel.find({ mssv: MSSV });
        let totalKhauTru = 0;
        for (const khauTru of khauTruList) {
            totalKhauTru += khauTru.soTien;
        }

        console.log('Total Khau Tru:', totalKhauTru);

        // Cập nhật trạng thái công nợ thành "đã đóng" và tạo phiếu thu
        const updatedCongNoList = [];
        let totalSoTien = 0;

        for (const congNo of congNoList) {
            // Bỏ qua công nợ đã đóng
            if (congNo.trangThai === 'Đã đóng') {
                continue;
            }

            // Cập nhật trạng thái công nợ
            congNo.trangThai = 'Đã đóng';
            const updatedCongNo = await congNo.save();
            updatedCongNoList.push(updatedCongNo);

            // Tính tổng số tiền
            totalSoTien += congNo.soTien * congNo.tinChi;
        }

        console.log('Total So Tien:', totalSoTien);

        // Tính số tiền thanh toán sau khi trừ khấu trừ
        let finalSoTien = totalSoTien - totalKhauTru;
        if (finalSoTien < 0) {
            finalSoTien = 0;
        }

        console.log('Final So Tien:', finalSoTien);

        // Tạo mã phiếu thu tự động
        const lastPhieuThu = await PhieuThuModel.findOne().sort({ maPhieuThu: -1 });
        let newMaPhieuThu = 'PT001';
        if (lastPhieuThu) {
            const lastMaPhieuThu = lastPhieuThu.maPhieuThu;
            const numberPart = parseInt(lastMaPhieuThu.substring(2)) + 1;
            newMaPhieuThu = 'PT' + numberPart.toString().padStart(3, '0');
        }

        console.log('New Ma Phieu Thu:', newMaPhieuThu);

        // Tạo phiếu thu mới
        const phieuThu = new PhieuThuModel({
            maPhieuThu: newMaPhieuThu,
            mssv: MSSV,
            soTien: finalSoTien,
            ngayThu: new Date(),
            nganHang: req.body.nganHang || 'Unknown' // Ngân hàng có thể được gửi từ body hoặc mặc định là 'Unknown'
        });

        const savedPhieuThu = await phieuThu.save();
        console.log('Created PhieuThu:', savedPhieuThu);

        // Cập nhật lại khấu trừ của sinh viên
        for (const khauTru of khauTruList) {
            khauTru.soTien = 0;
            await khauTru.save();
        }

        console.log('Updated CongNo:', updatedCongNoList);
        res.json({ updatedCongNoList, savedPhieuThu });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = routerCongNo;