const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const ThongBaoGVSchema = new Schema({
  tieuDeThongBao: {
    type: String,
    maxlength: 255,
    required: true,
  },
  noiDungThongBao: {
    type: String,
    required: true,
  },
  doiTuongThongBao: {
    type: String,
    maxlength: 8,
    required: true,
    ref: 'GiangVien',
  },
  taoThongBao:{
    type: String,
    maxlength: 45,
  },
  ngayGioThongBao: {
    type: Date,
  },
  lyDo: {
    type: String,
    maxlength: 255,
  },
});


// Tạo model từ schema
const ThongBaoGV = mongoose.model('ThongBaoGV', ThongBaoGVSchema);

module.exports = ThongBaoGV;
