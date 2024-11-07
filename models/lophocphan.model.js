const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const lopHocPhanSchema = new Schema({
  maLHP: {
    type: String,
    required: true,
    maxlength: 12
  },
  tenLHP: {
    type: String,
    maxlength: 45,
    default: null
  },
  maMonHoc: {
    type: String,
    maxlength: 45,
    default: null
  },
  nganh: {
    type: String,
    maxlength: 45,
    default: null
  },
  GV: {
    type: String,
    maxlength: 45,
    default: null
  },
  maHK: {
    type: String,
    required: true,
    maxlength: 10,
    ref: 'HocKy'
  },
  sinhVien: [{
    type: String,  // Lưu danh sách MSSV của sinh viên
    ref: 'SinhVien'
  }],
  lichHoc: [{
    type: String,  // Lưu danh sách maLichHoc của các lịch học
    ref: 'LichHoc'
  }]
});

const LopHocPhan = mongoose.model('LopHocPhan', lopHocPhanSchema);
module.exports = LopHocPhan;
