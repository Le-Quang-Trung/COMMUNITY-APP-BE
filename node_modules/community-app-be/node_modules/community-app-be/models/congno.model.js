const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const congNoSchema = new Schema({
  maCongNo: {
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
  maMonHoc: {
    type: String,
    required: true,
    maxlength: 10,
    ref: 'MonHoc' // Tham chiếu đến bảng MonHoc
  },

  tinChi: {
    type: Number,
    default: null
  },
  soTien: {
    type: Number,
    default: null // số tiền mỗi tín chỉ
  },
  trangThai: {
    type: String,
    default: 'Chưa đóng'
  },
  maHK: {
    type: String,
    required: true,
    maxlength: 11,
    ref: 'HocKy' // Tham chiếu đến bảng HocKy
  }
});

// Tạo chỉ mục cho maHK để tối ưu hóa tìm kiếm
congNoSchema.index({ maHK: 1 });

// Định nghĩa model CongNo dựa trên schema
const CongNo = mongoose.model('CongNo', congNoSchema);

module.exports = CongNo;
