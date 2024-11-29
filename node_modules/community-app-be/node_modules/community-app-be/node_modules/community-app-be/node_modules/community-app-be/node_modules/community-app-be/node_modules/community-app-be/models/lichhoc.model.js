const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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
  maMonHoc: {
    type: String,
    maxlength: 45,
    default: null
  },
  lichHoc: [{
    ngayHoc: {
      type: Number, // Sử dụng số để biểu diễn thứ trong tuần (1: Thứ Hai, 7: Chủ Nhật)
      min: 1, // Thứ Hai
      max: 7, // Chủ Nhật
      required: true
    },
    tietHoc: {
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
  }],
  ngayBatDau: {
    type: Date,
    required: true,
    default: null
  },
  ngayKetThuc: {
    type: Date,
    required: true,
    default: null
  },
  GV: {
    type: String,
    maxlength: 45,
    default: null
  },
});

// Tạo chỉ mục cho maLHP để tối ưu hóa tìm kiếm
lichHocSchema.index({ maLHP: 1 });

// Định nghĩa model LichHoc dựa trên schema
const LichHoc = mongoose.model('LichHoc', lichHocSchema);

module.exports = LichHoc;
