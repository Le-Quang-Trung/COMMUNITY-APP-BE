const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const SinhVienSchema = new Schema({
  hinhAnh: {
    type: String,
  },
  hoTen: {
    type: String,
    maxlength: 45,
  },
  trangThai: {
    type: String,  
  },
  gioiTinh: {
    type: String,  
  },
  ngaySinh: {
    type: Date,
  },
  mssv: {
    type: String,
    maxlength: 8,
    required: true
  },
  lop: {
    type: String,
    maxlength: 45,
  },
  bacDaoTao: {
    type: String,
    maxlength: 45,
  },
  khoa: {
    type: String,
    maxlength: 45,
  },
  nganh: {
    type: String,
    maxlength: 45,
  },
  diaChi: {
    type: String,
    maxlength: 45,
  },
  soDT: {
    type: String,
    require: true,
    unique: true,
    validate: {
        validator: function (v) {
            return /\d{10}/.test(v); // kiểm tra xem chuỗi có đúng 10 ký tự số không
        },
        message: props => `${props.value} không phải là một số điện thoại hợp lệ!`
    }
  },
});


// Tạo model từ schema
const SinhVien = mongoose.model('SinhVien', SinhVienSchema);

module.exports = SinhVien;