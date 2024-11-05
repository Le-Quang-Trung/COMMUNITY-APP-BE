const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const ThongBaoSVSchema = new Schema({
  maThongBao: {
    type: String,
    maxlength: 10,
    required: true
  },
  noiDungThongBao: {
    type: String,
    maxlength: 45,
    default: null
  },
  doiTuongThongBao: {
    type: String,
    maxlength: 8,
    required: true,
    ref: 'SinhVien' // Tạo liên kết với model SinhVien thông qua MSSV
  },
  taoThongBao: {
    type: String,
    maxlength: 45,
  },
});


// Tạo model từ schema
const ThongBaoSV = mongoose.model('ThongBaoSV', ThongBaoSVSchema);

module.exports = ThongBaoSV;
