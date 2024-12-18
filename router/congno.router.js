const express = require('express');
const bodyParser = require('body-parser');
const routerCongNo = express.Router();
const CongNoModel = require('../models/congno.model');
const SinhVienModel = require('../models/sinhvien.model');
const HocKyModel = require('../models/hocky.model');
const KhauTruModel = require('../models/khautru.model');
const PhieuThuModel = require('../models/phieuthu.model');
const moment = require('moment');
const crypto = require('crypto');
const request = require('request');


routerCongNo.use(bodyParser.urlencoded({ extended: false }));
routerCongNo.use(bodyParser.json());

function sortObject(obj) {
    let sorted = {};
    let str = [];
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (let i = 0; i < str.length; i++) {
        sorted[str[i]] = encodeURIComponent(obj[decodeURIComponent(str[i])]).replace(/%20/g, "+");
    }
    return sorted;
}


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

        // Tính tổng số tiền cần thanh toán chỉ bao gồm các công nợ chưa đóng
        let totalSoTien = 0;
        for (const congNo of congNoList) {
            if (congNo.trangThai === 'Chưa đóng') {
                totalSoTien += congNo.soTien * congNo.tinChi;
            }
        }

        console.log('Total So Tien:', totalSoTien);

        // Tính số tiền thanh toán sau khi trừ khấu trừ
        let finalSoTien = totalSoTien - totalKhauTru;
        if (finalSoTien < 0) {
            finalSoTien = 0;
        }

        console.log('Final So Tien:', finalSoTien);

        // Tạo phiên thanh toán với VNPAY
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        let tmnCode = process.env.VNP_TMN_CODE;
        let secretKey = process.env.VNP_HASH_SECRET;
        let vnpUrl = process.env.VNP_URL;
        let returnUrl = `${process.env.VNP_RETURN_URL}?MSSV=${MSSV}&nganh=${nganh}&hocKy=${hocKy}`;
        let orderId = moment(date).format('DDHHmmss');
        let amount = finalSoTien * 100;
        let bankCode = req.body.bankCode;

        let locale = req.body.language;
        if (locale === null || locale === '') {
            locale = 'vn';
        }
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cong no hoc ky';
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        res.json({ vnpUrl });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Xử lý phản hồi từ VNPAY
routerCongNo.get('/vnpay_return', async (req, res) => {
    try {
        let vnp_Params = req.query;

        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        let tmnCode = process.env.VNP_TMN_CODE;
        let secretKey = process.env.VNP_HASH_SECRET;

        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        console.log("VNP Params before signing:", vnp_Params);
        console.log("VNP SecureHash received:", secureHash);
        console.log("Signed data:", signed);

        // if (secureHash === signed) {
        //     // Thanh toán thành công
        let orderId = vnp_Params['vnp_TxnRef'];
        let responseCode = vnp_Params['vnp_ResponseCode'];

            if (responseCode === '00') {
                // Cập nhật công nợ, xóa khấu trừ và tạo phiếu thu
                const { MSSV, nganh, hocKy } = req.query;
                const hocKyDoc = await HocKyModel.findOne({ nganh, hocKy });
                if (!hocKyDoc) {
                    console.log('HocKy not found for:', { nganh, hocKy });
                    return res.status(404).json({ message: 'HocKy not found' });
                }
                const maHK = hocKyDoc.maHK;

                const congNoList = await CongNoModel.find({ mssv: MSSV, maHK: maHK });
                const khauTruList = await KhauTruModel.find({ mssv: MSSV });

                const updatedCongNoList = [];
                let totalSoTien = 0;

                for (const congNo of congNoList) {
                    if (congNo.trangThai === 'Chưa đóng') {
                        congNo.trangThai = 'Đã đóng';
                        const updatedCongNo = await congNo.save();
                        updatedCongNoList.push(updatedCongNo);
                        totalSoTien += congNo.soTien * congNo.tinChi;
                    }
                }

                let totalKhauTru = 0;
                for (const khauTru of khauTruList) {
                    totalKhauTru += khauTru.soTien;
                }

                let finalSoTien = totalSoTien - totalKhauTru;
                if (finalSoTien < 0) {
                    finalSoTien = 0;
                }

                const lastPhieuThu = await PhieuThuModel.findOne().sort({ maPhieuThu: -1 });
                let newMaPhieuThu = 'PT001';
                if (lastPhieuThu) {
                    const lastMaPhieuThu = lastPhieuThu.maPhieuThu;
                    const numberPart = parseInt(lastMaPhieuThu.substring(2)) + 1;
                    newMaPhieuThu = 'PT' + numberPart.toString().padStart(3, '0');
                }

                const phieuThu = new PhieuThuModel({
                    maPhieuThu: newMaPhieuThu,
                    mssv: MSSV,
                    soTien: finalSoTien,
                    ngayThu: new Date(),
                    nganHang: req.query.bankCode || 'NCB'
                });

                const savedPhieuThu = await phieuThu.save();

                let remainingKhauTru = totalKhauTru - totalSoTien;
                for (const khauTru of khauTruList) {
                    if (remainingKhauTru > 0) {
                        khauTru.soTien = remainingKhauTru;
                        remainingKhauTru = 0;
                    } else {
                        khauTru.soTien = 0;
                    }
                    await khauTru.save();
                }

                res.json({ message: 'Thanh toán thành công', updatedCongNoList, savedPhieuThu });
            } else {
                res.json({ message: 'Thanh toán không thành công' });
            }
        // } else {
        //     res.json({ message: 'Chữ ký không hợp lệ' });
        // }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = routerCongNo;