const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const Schema = mongoose.Schema;

const TaiKhoanSchema = new Schema({
    matKhau: {
        type: String,
        maxlength: 45,
    },
    quyen: {
        type: String,
        maxlength: 45,
    },
    tenTaiKhoan: {
        type: String,
        maxlength: 8,
        unique: false,
    }
});


// Tạo model từ schema
const TaiKhoan = mongoose.model('TaiKhoan', TaiKhoanSchema);

module.exports = TaiKhoan;
