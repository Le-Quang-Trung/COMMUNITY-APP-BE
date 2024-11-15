const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const GiangVienSchema = new Schema({
  tenGV: {
    type: String,
    maxlength: 45,
    required: true
  },
  maGV: {
    type: String,
    maxlength: 8,
    required: true,
    unique: false,
  },
  khoa: {
    type: String,
    maxlength: 45,
  },
  nganh: [
    {
      type: String,
      maxlength: 45,
    }
  ],
  diaChi: {
    type: String,
    maxlength: 45,
  }
});


// Tạo model từ schema
const GiangVien = mongoose.model('GiangVien', GiangVienSchema);

module.exports = GiangVien;
