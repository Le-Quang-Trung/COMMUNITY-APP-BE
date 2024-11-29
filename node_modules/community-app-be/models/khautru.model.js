const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const khauTruSchema = new Schema({
    maKhauTru: {
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
});

// Định nghĩa model KhauTru dựa trên schema
const KhauTru = mongoose.model('KhauTru', khauTruSchema);

module.exports = KhauTru;