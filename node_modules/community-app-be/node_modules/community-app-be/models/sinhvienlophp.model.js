const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const SinhVienLopHP = new Schema({
    mssv: {
        type: String,
        required: true,
        maxlength: 8,
        ref: 'SinhVien'
    },
    maLHP: {
        type: String,
        required: true,
        maxlength: 12,
        ref: 'LopHocPhan'
    }
});

const SinhVienLopHPModel = mongoose.model('SinhVienLopHP', SinhVienLopHP);
module.exports = SinhVienLopHPModel;