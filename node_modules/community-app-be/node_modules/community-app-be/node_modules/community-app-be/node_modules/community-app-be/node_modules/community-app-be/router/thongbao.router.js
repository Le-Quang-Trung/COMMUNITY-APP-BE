const express = require('express');
const routerThongBao = express.Router();
const ThongBaoSV = require('../models/thongbaosv.model'); // Đảm bảo đường dẫn đúng
const GiangVien = require('../models/giangvien.model'); // Đảm bảo đường dẫn đúng
const SinhVien = require('../models/sinhvien.model') // Đảm bảo đường dẫn đúng
const ThongBaoGV = require('../models/thongbaogv.model'); // Đảm bảo đường dẫn đúng

// API để lấy thông báo dựa trên MSSV
routerThongBao.get('/getThongBaoSV/:MSSV', async (req, res, next) => {
    try {
        const { MSSV } = req.params;
        console.log('Params:', MSSV);  // Kiểm tra giá trị tham số

        // Tìm thông báo dựa trên MSSV trong collection ThongBaoSV
        const thongBaoList = await ThongBaoSV.find({ doiTuongThongBao: MSSV });
        if (!thongBaoList || thongBaoList.length === 0) {
            console.log('ThongBao not found for MSSV:', MSSV);
            return res.status(404).json({ message: 'ThongBao not found' });
        }

        console.log('Found ThongBao:', thongBaoList);

        // Tìm tên người thông báo dựa trên taoThongBao trong collection GiangVien
        const thongBaoWithTenNguoiThongBao = await Promise.all(thongBaoList.map(async (thongBao) => {
            const giangVien = await GiangVien.findOne({ maGV: thongBao.taoThongBao });
            console.log('Found GiangVien for taoThongBao:', thongBao.taoThongBao, giangVien);
            return {
                ...thongBao._doc,
                tenNguoiThongBao: giangVien ? giangVien.tenGV : 'Unknown'
            };
        }));

        console.log('ThongBao with tenNguoiThongBao:', thongBaoWithTenNguoiThongBao);

        res.json(thongBaoWithTenNguoiThongBao);
    } catch (error) {
        console.error('Error fetching ThongBao:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// API để lấy thông báo dựa trên maGV
routerThongBao.get('/getThongBaoGV/:maGV', async (req, res) => {
    try {
        const { maGV } = req.params;
        console.log('Params:', maGV);  // Kiểm tra giá trị tham số

        // Tìm thông báo dựa trên doiTuongThongBao trong collection ThongBaoGV
        const thongBaoList = await ThongBaoGV.find({ doiTuongThongBao: maGV });
        if (!thongBaoList || thongBaoList.length === 0) {
            console.log('ThongBao not found for maGV:', maGV);
            return res.status(404).json({ message: 'ThongBao not found' });
        }

        console.log('Found ThongBao:', thongBaoList);

         // Tìm tên người thông báo dựa trên taoThongBao trong collection SinhVien
         const thongBaoWithTenNguoiThongBao = await Promise.all(thongBaoList.map(async (thongBao) => {
            const sinhVien = await SinhVien.findOne({ mssv: thongBao.taoThongBao });
            console.log('Found SinhVien for taoThongBao:', thongBao.taoThongBao, sinhVien);
            return {
                ...thongBao._doc,
                tenNguoiThongBao: sinhVien ? sinhVien.hoTen : 'Unknown'
            };
        }));

        console.log('ThongBao with tenNguoiThongBao:', thongBaoWithTenNguoiThongBao);

        res.json(thongBaoWithTenNguoiThongBao);
    } catch (error) {
        console.error('Error fetching ThongBao:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = routerThongBao;