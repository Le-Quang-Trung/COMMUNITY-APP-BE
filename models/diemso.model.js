const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}); 

const Schema = mongoose.Schema;

const diemSoSchema = new Schema({
  maDiem: {
    type: String,
    required: true,
    maxlength: 10
  },
  lopHoc: {
    type: String,
    maxlength: 45
  },
  monHoc: {
    type: String,
    maxlength: 45
  },
  diemTK1: {
    type: Number,
    default: null
  },
  diemTK2: {
    type: Number,
    default: null
  },
  diemTK3: {
    type: Number,
    default: null
  },
  diemGK: {
    type: Number,
    default: null
  },
  diemCK: {
    type: Number,
    default: null
  },
  MSSV: {
    type: String,
    required: true,
    maxlength: 8,
    ref: 'SinhVien' // Tham chiếu đến bảng SinhVien
  },
  maMonHoc: {
    type: String,
    required: true,
    maxlength: 10,
    ref: 'MonHoc' // Tham chiếu đến bảng MonHoc
  }
});

// Tạo chỉ mục để tối ưu hóa tìm kiếm theo MSSV và MaMonHoc
diemSoSchema.index({ MSSV: 1 });
diemSoSchema.index({ MaMonHoc: 1 });

// Định nghĩa model DiemSo dựa trên schema
const DiemSo = mongoose.model('DiemSo', diemSoSchema);

module.exports = DiemSo;
