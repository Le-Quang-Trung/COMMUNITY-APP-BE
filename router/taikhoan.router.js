const express = require('express');
var bodyParser = require('body-parser');
const TaiKhoanModel = require('../models/taikhoan.model');
const routerTaiKhoan = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

routerTaiKhoan.use(bodyParser.urlencoded({ extended: false }));
routerTaiKhoan.use(bodyParser.json());

routerTaiKhoan.get('/', (req, res, next) => {
    TaiKhoanModel.find({})
        .then((taikhoans) => {
            res.json(taikhoans);
        })
        .catch((err) => {
            res.status(500).json('get taikhoan fail');
        })
})

//get taikhoan by id
routerTaiKhoan.get('/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const taikhoan = await TaiKhoanModel.findById(id);
        res.status(200).json(taikhoan);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
});

// API tạo tài khoản cho sinh viên (Quản lý)
routerTaiKhoan.post('/taotaikhoan', async (req, res) => {
    try {
        const { tenTaiKhoan, matKhau } = req.body;

        // Kiểm tra nếu tài khoản đã tồn tại
        const existingAccount = await TaiKhoanModel.findOne({ tenTaiKhoan: tenTaiKhoan });
        if (existingAccount) {
            return res.status(400).json({ message: "Tài khoản đã tồn tại." });
        }

        // Tạo tài khoản mới
        const newTaiKhoan = await TaiKhoanModel.create({
            tenTaiKhoan: tenTaiKhoan,
            matKhau: matKhau,
            quyen: 'SV' // Đặt quyền là 'SV' cho sinh viên
        });

        res.status(201).json(newTaiKhoan);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Không thể tạo tài khoản sinh viên." });
    }
});

//Đăng nhập
//SINHVIEN
routerTaiKhoan.post('/loginsv', async (req, res, next) => {
    try {
        const { tenTaiKhoan, matKhau } = req.body;
        const taikhoan = await TaiKhoanModel.findOne({ tenTaiKhoan: tenTaiKhoan });
        if (!taikhoan) {
            return res.status(405).json({ "Can't find user with this tenTaiKhoan": tenTaiKhoan });
        }
        if (taikhoan.matKhau !== matKhau) {
            return res.status(404).json({ "Password is incorrect": matKhau });
        }
        if (taikhoan.quyen !== 'SV') {
            return res.status(403).json({ "Insufficient access permissions": true });
        }
        delete taikhoan.matKhau;
        res.status(200).json(taikhoan);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
})

//GIANGVIEN
routerTaiKhoan.post('/logingv', async (req, res, next) => {
    try {
        const { tenTaiKhoan, matKhau } = req.body;
        const taikhoan = await TaiKhoanModel.findOne({ tenTaiKhoan: tenTaiKhoan });
        if (!taikhoan) {
            return res.status(405).json({ "Can't find user with this tenTaiKhoan": tenTaiKhoan });
        }
        if (taikhoan.matKhau !== matKhau) {
            return res.status(404).json({ "Password is incorrect": matKhau });
        }
        // const isMatKhauValid = await bcrypt.compare(matKhau, taikhoan.matKhau);
        // if (!isMatKhauValid) {
        //     return res.status(404).json({"Password is incorrect": matKhau});
        // }

        // Check if the role is either 'GV' or 'QL'
        if (!['GV', 'QL'].includes(taikhoan.quyen)) {
            return res.status(403).json({ "Insufficient access permissions": true });
        }

        
        delete taikhoan.matKhau;
        res.status(200).json(taikhoan);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
})

//DANGXUAT
routerTaiKhoan.post('/logout', async (req, res, next) => {
    try {
        const { tenTaiKhoan } = req.body;

        const taikhoan = await TaiKhoanModel.findOne({ tenTaiKhoan });

        if (!taikhoan) {
            return res.status(404).json({ message: "tenTaiKhoan is not correct" });
        }
        res.status(200).json({ message: 'logged out successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

//DOI MAT KHAU
routerTaiKhoan.put('/changePassword/:id', async (req, res) => {
    try {
        const { id } = req.params;
        var lastpassword = req.body.lastpassword;
        var newpassword = req.body.newpassword;

        const taikhoan = await TaiKhoanModel.findById(id);
        if (!taikhoan) {
            return res.status(404).json({ "can't find account with this id": id });
        }

        // Check if the provided last password matches (without bcrypt)
        if (taikhoan.matKhau !== lastpassword) {
            return res.status(404).json({ "password is incorrect": lastpassword });
        }

        // Update password without bcrypt
        const updateTaiKhoan = await TaiKhoanModel.findByIdAndUpdate(id, {
            matKhau: newpassword
        }, { new: true });

        res.status(200).json(updateTaiKhoan);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
});


module.exports = routerTaiKhoan;