const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const phieuThuSchema = new Schema({
    maPhieuThu: {
        type: String,
        required: true,
        maxlength: 10
    },
    mssv: {
        type: String,
        required: true,
        maxlength: 10,
        ref: 'SinhVien' // Tham chiếu đến bảng SinhVien
    },
    soTien: {
        type: Number,
        default: null
    },
    ngayThu: {
        type: Date,
        default: Date.now
    },
    nganHang: {
        type: String,
        default: null
    },
});

// Định nghĩa model PhieuThu dựa trên schema
const PhieuThu = mongoose.model('PhieuThu', phieuThuSchema);

module.exports = PhieuThu;