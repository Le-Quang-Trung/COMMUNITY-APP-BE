const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const chuongTrinhKhungSchema = new Schema({
  maCTK: {
    type: Number,
    required: true
  },
  nganh: {
    type: String,
    maxlength: 45,
    default: null
  },
  tinChiBatBuoc: {
    type: Number,
    default: null
  },
  tinChiTuChon: {
    type: Number,
    default: null
  },
  maHK: {
    type: String,
    required: true,
    maxlength: 10,
    ref: 'HocKy' // Tham chiếu đến bảng HocKy
  }
});

// Tạo chỉ mục cho maHK để tối ưu hóa tìm kiếm
chuongTrinhKhungSchema.index({ maHK: 1 });

// Định nghĩa model ChuongTrinhKhung dựa trên schema
const ChuongTrinhKhung = mongoose.model('ChuongTrinhKhung', chuongTrinhKhungSchema);

module.exports = ChuongTrinhKhung;
