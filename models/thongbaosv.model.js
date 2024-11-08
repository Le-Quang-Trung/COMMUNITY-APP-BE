const mongoose = require('mongoose');

const ThongBaoSVSchema = new mongoose.Schema({
  tieuDe: {
    type: String,
    maxlength: 255,
    required: true
  },
  noiDung: {
    type: String,
    required: true
  },
  doiTuongThongBao: {
    type: String,
    maxlength: 8,
    required: true,
  },
  taoThongBao: {
    type: String,
    maxlength: 45,
  },
  ngayGioThongBao: { 
    type: Date
  }
});

// Tạo model từ schema
const ThongBaoSV = mongoose.model('ThongBaoSV', ThongBaoSVSchema);

module.exports = ThongBaoSV;