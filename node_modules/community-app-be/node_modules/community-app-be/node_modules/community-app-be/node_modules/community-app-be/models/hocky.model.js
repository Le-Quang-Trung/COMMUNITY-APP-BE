const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const hocKySchema = new Schema({
  maHK: {
    type: String,
    required: true,
    maxlength: 10
  },
  hocKy: {
    type: String,
    maxlength: 45,
    default: null
  },
  nganh: {
    type: String,
    maxlength: 45,
    default: null
  }
});

// Định nghĩa model HocKy dựa trên schema
const HocKy = mongoose.model('HocKy', hocKySchema);

module.exports = HocKy;
