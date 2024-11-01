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
  tinChi: {
    type: Number,
    default: null
  },
  soTien: {
    type: Number,
    default: null
  },
  khauTru: {
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
congNoSchema.index({ maHK: 1 });

// Định nghĩa model CongNo dựa trên schema
const CongNo = mongoose.model('CongNo', congNoSchema);

module.exports = CongNo;
