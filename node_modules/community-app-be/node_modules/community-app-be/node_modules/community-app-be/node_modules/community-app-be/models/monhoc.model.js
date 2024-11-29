const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const monHocSchema = new Schema({
  maMonHoc: {
    type: String,
    required: true,
    maxlength: 10
  },
  tenMonHoc: {
    type: String,
    maxlength: 45,
    default: null
  },
  nganh: {
    type: String,
    maxlength: 45,
    default: null
  },
  tinChi: {
    type: Number,
    default: null
  },
  phanLoai: {
    type: String,
    maxlength: 45,
    default: null
  },
  tienQuyet: {
    type: String,
    maxlength: 45,
    default: null
  },
  soTietLT: {
    type: Number,
    default: null
  },
  soTietTH: {
    type: Number,
    default: null
  }
});

// Định nghĩa model MonHoc dựa trên schema
const MonHoc = mongoose.model('MonHoc', monHocSchema);

module.exports = MonHoc;
