const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const QuanLySchema = new Schema({
  maQL: {
    type: String,
    maxlength: 8,
    required: true,
    unique: false,
  }
});

// Tạo model từ schema
const QuanLy = mongoose.model('QuanLy', QuanLySchema);

module.exports = QuanLy;
