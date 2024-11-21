const express = require('express');
var bodyParser = require('body-parser');
const QuanLyModel = require('../models/quanly.model');
const routerQuanLy = express.Router();
const LopHocPhanModel = require('../models/lophocphan.model');
const SinhVienModel = require('../models/sinhvien.model');
const SinhVienLopHPModel = require('../models/sinhvienlophp.model'); 
const LichHocModel = require('../models/lichhoc.model');

routerQuanLy.use(bodyParser.urlencoded({ extended: false }));
routerQuanLy.use(bodyParser.json());

// GET /quanly/:maQL
routerQuanLy.get('/:maQL', async (req, res) => {
    try {
        const { maQL } = req.params;
        const quanly = await QuanLyModel.findOne({ maQL });
        
        if (!quanly) {
            return res.status(404).json({ message: 'Not found quanly' });
        }
        res.json(quanly);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// Hàm chuyển đổi tên ngành thành mã ngành
const convertNganhToMaNganh = (nganh) => {
    const mapping = {
        'Kỹ Thuật Phần Mềm': 'KTPM',
        'Công Nghệ Thông Tin': 'CNTT',
    };
    return mapping[nganh] || nganh;
};

routerQuanLy.post('/createLopHocPhan', async (req, res) => {
    try {
        const { tenLop, maMonHoc, nganh, HK, Nam, GV } = req.body;
        console.log('Body:', { tenLop, maMonHoc, nganh, HK, Nam, GV });  // Kiểm tra giá trị tham số

        // Chuyển đổi tên ngành thành mã ngành
        const maNganh = convertNganhToMaNganh(nganh);
        console.log('Converted Nganh:', maNganh);

        // Tạo tên lớp học phần theo cú pháp DHKTPM16ATT
        const tenLHPGenerated = `DH${maNganh}${tenLop}`;

        // Kiểm tra xem tên lớp học phần và mã môn học có bị trùng không
        const existingLopHocPhan = await LopHocPhanModel.findOne({ tenLHP: tenLHPGenerated, maMonHoc });
        if (existingLopHocPhan) {
            console.log('Tên lớp học phần và mã môn học bị trùng:', tenLHPGenerated, maMonHoc);
            return res.status(400).json({ message: 'Tên lớp học phần và mã môn học bị trùng' });
        }

        // Tìm mã lớp học phần cuối cùng trong cơ sở dữ liệu
        const lastLopHocPhan = await LopHocPhanModel.findOne().sort({ maLHP: -1 });
        let newMaLHP = 'LHP001';
        if (lastLopHocPhan) {
            const lastMaLHP = lastLopHocPhan.maLHP;
            const numberPart = parseInt(lastMaLHP.substring(3)) + 1;
            newMaLHP = 'LHP' + numberPart.toString().padStart(3, '0');
        }

        // Tạo mã học kỳ theo cú pháp HK + hocky (1,2,3) + năm học (2024) + maNganh (KTPM)
        const maHKGenerated = `HK${HK}${Nam}${maNganh}`;

        // Tạo lớp học phần mới với sinhVien và lichHoc để trống
        const lopHocPhan = new LopHocPhanModel({ maLHP: newMaLHP, tenLHP: tenLHPGenerated, maMonHoc, nganh: nganh, maHK: maHKGenerated, GV, sinhVien: [], lichHoc: [] });
        const doc = await lopHocPhan.save();
        console.log('Created LopHocPhan:', doc);

        res.json(doc);
    } catch (error) {
        console.error('Error creating LopHocPhan:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// thêm sinh viên vào lớp học phần (input là mã lớp học phần và danh sách mã sinh viên, sinh viên được thêm vào danh sách sinh viên của lớp học phần, tạo document cho sinhvienlophp với mã sinh viên và mã lớp học phần)
routerQuanLy.post('/addSinhVienToLopHocPhan', async (req, res) => {
    try {
        const { maLHP, maSinhViens } = req.body;
        console.log('Body:', { maLHP, maSinhViens });  // Kiểm tra giá trị tham số

        // Tìm lớp học phần dựa trên mã lớp học phần
        const lopHocPhan = await LopHocPhanModel.findOne({ maLHP });
        if (!lopHocPhan) {
            console.log('LopHocPhan not found:', maLHP);
            return res.status(404).json({ message: 'LopHocPhan not found' });
        }

        // Danh sách sinh viên hợp lệ để thêm vào lớp học phần
        const validSinhViens = [];

        for (const maSV of maSinhViens) {
            // Kiểm tra xem sinh viên có tồn tại trong hệ thống không
            const sinhVien = await SinhVienModel.findOne({ mssv: maSV });
            if (!sinhVien) {
                console.log('SinhVien not found:', maSV);
                continue; // Bỏ qua sinh viên không tồn tại
            }

            // Kiểm tra xem sinh viên đã có trong lớp học phần chưa
            if (lopHocPhan.sinhVien.includes(maSV)) {
                console.log('SinhVien already in LopHocPhan:', maSV);
                continue; // Bỏ qua sinh viên đã có trong lớp học phần
            }

            // Kiểm tra xem document sinhvienlophp đã tồn tại chưa
            const existingSinhVienLopHP = await SinhVienLopHPModel.findOne({ mssv: maSV, maLHP });
            if (existingSinhVienLopHP) {
                console.log('SinhVienLopHP already exists for:', { mssv: maSV, maLHP });
                continue; // Bỏ qua nếu document đã tồn tại
            }

            // Thêm sinh viên vào danh sách hợp lệ
            validSinhViens.push(maSV);

            // Tạo document cho sinhvienlophp với mã sinh viên và mã lớp học phần
            const sinhVienLopHP = new SinhVienLopHPModel({ mssv: maSV, maLHP });
            await sinhVienLopHP.save();
        }

        // Thêm sinh viên hợp lệ vào danh sách sinh viên của lớp học phần
        lopHocPhan.sinhVien = [...lopHocPhan.sinhVien, ...validSinhViens];
        const doc = await lopHocPhan.save();
        console.log('Updated LopHocPhan:', doc);

        res.json(doc);
    } catch (error) {
        console.error('Error adding SinhViens to LopHocPhan:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

routerQuanLy.post('/createLichHoc', async (req, res) => {
    try {
        const { maLHP, maMonHoc, lichHoc, ngayBatDau, ngayKetThuc, GV, phanLoai } = req.body;
        console.log('Body:', { maLHP, maMonHoc, lichHoc, ngayBatDau, ngayKetThuc, GV, phanLoai });  // Kiểm tra giá trị tham số

        // Kiểm tra xem có lịch học nào trùng ngày, phòng, tiết học và nằm trong khoảng thời gian bắt đầu và kết thúc hay không
        for (const lich of lichHoc) {
            const { ngayHoc, tietHoc, phongHoc } = lich;
            const existingLichHoc = await LichHocModel.findOne({
                'lichHoc.ngayHoc': ngayHoc,
                'lichHoc.tietHoc': tietHoc,
                'lichHoc.phongHoc': phongHoc,
                ngayBatDau: { $lte: new Date(ngayKetThuc) },
                ngayKetThuc: { $gte: new Date(ngayBatDau) }
            });
            if (existingLichHoc) {
                console.log('Lịch học bị trùng:', { ngayHoc, tietHoc, phongHoc });
                return res.status(400).json({ message: 'Lịch học bị trùng' });
            }
        }

        // Tìm mã lịch học cuối cùng trong cơ sở dữ liệu
        const lastLichHoc = await LichHocModel.findOne().sort({ maLichHoc: -1 });
        let newMaLichHoc = 'LH001';
        if (lastLichHoc) {
            const lastMaLichHoc = lastLichHoc.maLichHoc;
            const numberPart = parseInt(lastMaLichHoc.substring(2)) + 1;
            newMaLichHoc = 'LH' + numberPart.toString().padStart(3, '0');
        }

        // Tạo lịch học mới
        const lichHocMoi = new LichHocModel({
            maLichHoc: newMaLichHoc,
            maLHP,
            maMonHoc,
            lichHoc,
            ngayBatDau,
            ngayKetThuc,
            GV,
            phanLoai
        });
        const doc = await lichHocMoi.save();
        console.log('Created LichHoc:', doc);

        // Tìm lớp học phần dựa trên mã lớp học phần
        const lopHocPhan = await LopHocPhanModel.findOne({ maLHP });
        if (!lopHocPhan) {
            console.log('LopHocPhan not found:', maLHP);
            return res.status(404).json({ message: 'LopHocPhan not found' });
        }

        // Thêm mã lịch học mới vào trường lịch học của lớp học phần
        lopHocPhan.lichHoc.push(newMaLichHoc);
        await lopHocPhan.save();
        console.log('Updated LopHocPhan:', lopHocPhan);

        res.json(doc);
    } catch (error) {
        console.error('Error creating LichHoc:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = routerQuanLy;