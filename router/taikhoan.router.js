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

routerTaiKhoan.post('/login', async (req,res,next) => {
    try{
        const {tenTaiKhoan, matKhau} = req.body;
        const taikhoan = await TaiKhoanModel.findOne({tenTaiKhoan: tenTaiKhoan});
        if (!taikhoan) {
            return res.status(405).json({"Can't find user with this tenTaiKhoan": tenTaiKhoan});
        }
        const isMatKhauValid = await bcrypt.compare(matKhau, taikhoan.matKhau);
        if (!isMatKhauValid) {
            return res.status(404).json({"Password is incorrect": matKhau});
        }
        delete taikhoan.matKhau;
        res.status(200).json(taikhoan);
    }
    catch (err){
        console.error(err.message);
        res.status(500).json({message: err.message});
    }
})


module.exports = routerTaiKhoan;