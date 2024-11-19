const express = require('express');
var bodyParser = require('body-parser');
const SinhVienModel = require('../models/sinhvien.model');
const routerSinhVien = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

routerSinhVien.use(bodyParser.urlencoded({ extended: false }));
routerSinhVien.use(bodyParser.json());

routerSinhVien.get('/', (req, res, next) => {
    SinhVienModel.find({})
        .then((sinhviens) => {
            res.json(sinhviens);
        })
        .catch((err) => {
            res.status(500).json('get sinhvien fail');
        })
})

// GET /sinhvien/:mssv
routerSinhVien.get('/:mssv', async (req, res) => {
    try {
        const { mssv } = req.params;
        const sinhvien = await SinhVienModel.findOne({ mssv });

        if (!sinhvien) {
            return res.status(404).json({ message: 'Not found student' });
        }
        res.json(sinhvien);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

//add sinhvien (QuanLy)
routerSinhVien.post('/', async (req, res) => {
    try {
        const hinhAnh = req.body.hinhAnh || 'https://example.com/default-avatar.png';
        const hoTen = req.body.hoTen;
        const trangThai = req.body.trangThai;
        const gioiTinh = req.body.gioiTinh;
        let ngaySinh = req.body.ngaySinh;
        const mssv = req.body.mssv;
        const lop = req.body.lop;
        const bacDaoTao = req.body.bacDaoTao;
        const khoa = req.body.khoa;
        const nganh = req.body.nganh;
        const diaChi = req.body.diaChi;
        const soDT = req.body.soDT;

        // Xử lý ngày sinh
        if (ngaySinh) {
            const [day, month, year] = ngaySinh.split('-');
            if (day && month && year && !isNaN(day) && !isNaN(month) && !isNaN(year)) {
                ngaySinh = new Date(`${year}-${month}-${day}T17:00:00.000Z`).toISOString();
            } else {
                return res.status(400).json({ message: 'Ngày sinh không hợp lệ. Vui lòng nhập theo định dạng dd-MM-yyyy' });
            }
        }


        const existingSinhVien = await SinhVienModel.findOne({ mssv: mssv });
        if (existingSinhVien) {
            return res.status(500).json('mssv already exists');
        }

        const newSinhVien = await SinhVienModel.create({
            hinhAnh: hinhAnh,
            hoTen: hoTen,
            trangThai: trangThai,
            gioiTinh: gioiTinh,
            ngaySinh: ngaySinh,
            mssv: mssv,
            lop: lop,
            bacDaoTao: bacDaoTao,
            khoa: khoa,
            nganh: nganh,
            diaChi: diaChi,
            soDT: soDT
        });

        res.status(201).json(newSinhVien);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi thêm sinh viên', error: err.message });
    }
}
);

//delete sinhvien (QuanLy)
routerSinhVien.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sinhvien = await SinhVienModel.findByIdAndDelete(id);
        if (!sinhvien) {
            return res.status(404).json({ "can't find sinhvien with this id": id });
        }
        res.status(200).json(sinhvien);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
}
);

//update sinhvien (QuanLy)
routerSinhVien.put('/mssv/:mssv', async (req, res) => {
    try {
        const { mssv } = req.params;
        const sinhvien = await SinhVienModel.findOneAndUpdate({ mssv: mssv }, req.body, { new: true });
        if (!sinhvien) {
            return res.status(404).json({ "message": "Không tìm thấy sinh viên với mã số sinh viên này" });
        }
        res.status(200).json(sinhvien);
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
});

// get thông tin sinh viên theo mssv, hoTen,ngaySinh, soDienThoai
routerSinhVien.get('/getSinhVien/:mssv/:hoTen/:ngaySinh/:soDienThoai', async (req, res) => {
    try {
        const { mssv, hoTen, ngaySinh, soDienThoai } = req.params;
        console.log('Params:', mssv, hoTen, ngaySinh, soDienThoai);  // Kiểm tra giá trị tham số

         // Chuyển đổi ngày sinh từ định dạng dd-MM-yyyy sang Date
         let ngaySinhDate = null;
         if (ngaySinh) {
             const [day, month, year] = ngaySinh.split('-');
             if (day && month && year && !isNaN(day) && !isNaN(month) && !isNaN(year)) {
                 ngaySinhDate = new Date(`${year}-${month}-${day}`);
             } else {
                 return res.status(400).json({ message: 'Ngày sinh không hợp lệ. Vui lòng nhập theo định dạng dd-MM-yyyy' });
             }
         }

        // Tạo đối tượng truy vấn
        const query = { mssv, hoTen, ngaySinh: ngaySinhDate, soDT: soDienThoai };
        console.log('Query:', query);

        // Tìm thông tin sinh viên dựa trên các thuộc tính trong collection SinhVien
        const sinhvien = await SinhVienModel.findOne(query);
        if (!sinhvien) {
            console.log('SinhVien not found for query:', query);
            return res.status(404).json({ message: 'SinhVien not found' });
        }

        console.log('Found SinhVien:', sinhvien);
        res.json(sinhvien);
    } catch (error) {
        console.error('Error fetching SinhVien:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = routerSinhVien;
