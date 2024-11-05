const express = require('express');
var bodyParser = require('body-parser');
const DiemSoModel = require('../models/diemso.model');
const routerDiemSo = express.Router();

routerDiemSo.use(bodyParser.urlencoded({ extended: false }));
routerDiemSo.use(bodyParser.json());

routerDiemSo.get('/', (req, res, next) => {
    DiemSoModel.find({})
        .then((diemso) => {
            res.json(diemso);
        })
        .catch((err) => {
            res.status(500).json('get diemso fail');
        })
})

// Lấy điểm số theo MSSV, MaMonHoc, MaLopHoc
routerDiemSo.get('/getDiem/:MSSV/:MaMonHoc/:MaLopHoc', (req, res, next) => {
    const { MSSV, MaMonHoc, MaLopHoc } = req.params;
    console.log('Params:', MSSV, MaMonHoc, MaLopHoc);  // Kiểm tra giá trị tham số
    DiemSoModel.findOne({ MSSV: MSSV, maMonHoc: MaMonHoc, lopHoc: MaLopHoc })
        .then((diemso) => {
            if (!diemso) {
                return res.status(404).json({ message: 'DiemSo not found' });
            }
            res.json(diemso);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ message: 'Get DiemSo failed' });
        });
});

// tạo điểm số mới, các trường không có thì để null, mã điểm tự tạo tăng dần theo mẫu MD0001, MD0002, ...
routerDiemSo.post('/taoDiem', async (req, res, next) => {
    try {
        const { lopHoc, monHoc, diemTK1, diemTK2, diemTK3, diemGK, diemCK, MSSV, maMonHoc } = req.body;

        // Tạo maDiem tự động
        const lastDiemSo = await DiemSoModel.findOne().sort({ maDiem: -1 });
        let newMaDiem = 'MD001';
        if (lastDiemSo) {
            const lastMaDiem = lastDiemSo.maDiem;
            const numberPart = parseInt(lastMaDiem.substring(2)) + 1;
            newMaDiem = 'MD' + numberPart.toString().padStart(3, '0');
        }

        const diemso = new DiemSoModel({
            maDiem: newMaDiem,
            lopHoc,
            monHoc,
            diemTK1,
            diemTK2,
            diemTK3,
            diemGK,
            diemCK,
            MSSV,
            maMonHoc
        });

        await diemso.save();
        res.status(200).json(diemso);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

// Cập nhật điểm số, các trường không cập nhật thì giữ nguyên
routerDiemSo.post('/capNhatDiem', async (req, res, next) => {
    try {
        const { maDiem, lopHoc, monHoc, diemTK1, diemTK2, diemTK3, diemGK, diemCK, MSSV, maMonHoc } = req.body;

        const diemso = await DiemSoModel.findOne({ maDiem: maDiem });
        if (!diemso) {
            return res.status(404).json({ message: 'DiemSo not found' });
        }

        diemso.lopHoc = lopHoc !== undefined ? lopHoc : diemso.lopHoc;
        diemso.monHoc = monHoc !== undefined ? monHoc : diemso.monHoc;
        diemso.diemTK1 = diemTK1 !== undefined ? diemTK1 : diemso.diemTK1;
        diemso.diemTK2 = diemTK2 !== undefined ? diemTK2 : diemso.diemTK2;
        diemso.diemTK3 = diemTK3 !== undefined ? diemTK3 : diemso.diemTK3;
        diemso.diemGK = diemGK !== undefined ? diemGK : diemso.diemGK;
        diemso.diemCK = diemCK !== undefined ? diemCK : diemso.diemCK;
        diemso.MSSV = MSSV !== undefined ? MSSV : diemso.MSSV;
        diemso.maMonHoc = maMonHoc !== undefined ? maMonHoc : diemso.maMonHoc;

        await diemso.save();
        res.status(200).json(diemso);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = routerDiemSo;