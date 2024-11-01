const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const ThongBaoGVSchema = new Schema({
  maThongBao: {
    type: String,
    maxlength: 10,
    required: true
  },
  noiDungThongBao: {
    type: String,
    maxlength: 45,
  },
  doiTuongTB: {
    type: String,
    maxlength: 8,
    required: true,
    ref: 'GiangVien' 
  }
});


// Tạo model từ schema
const ThongBaoGV = mongoose.model('ThongBaoGV', ThongBaoGVSchema);

module.exports = ThongBaoGV;
