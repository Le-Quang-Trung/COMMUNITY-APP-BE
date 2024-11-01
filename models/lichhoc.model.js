const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const lichHocSchema = new Schema({
  maLichHoc: {
    type: String,
    required: true,
    maxlength: 10
  },
  maLHP: {
    type: String,
    required: true,
    maxlength: 12,
    //ref: 'LopHocPhan' // Tham chiếu đến bảng LopHocPhan
  },
  mon: {
    type: String,
    maxlength: 45,
    default: null
  },
  ngayHoc: {
    type: Date,
    default: null
  },
  tietHoc: {
    type: String,
    maxlength: 45,
    default: null
  },
  GV: {
    type: String,
    maxlength: 45,
    default: null
  },
  phongHoc: {
    type: String,
    maxlength: 45,
    default: null
  },
  phanLoai: {
    type: String,
    maxlength: 45,
    default: null
  }
});

// Tạo chỉ mục cho maLHP để tối ưu hóa tìm kiếm
lichHocSchema.index({ maLHP: 1 });

// Định nghĩa model LichHoc dựa trên schema
const LichHoc = mongoose.model('LichHoc', lichHocSchema);

module.exports = LichHoc;
