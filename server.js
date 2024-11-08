const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socket = require('socket.io');

var app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors());


const routerTaiKhoan = require('./router/taikhoan.router');
const routerDiemSo = require('./router/diemso.router');
const routerChuongTrinhKhung = require('./router/chuongtrinhkhung.router');
const monhoc = require('./router/monhoc.router');
const lichhoc = require('./router/lichhoc.router');

app.use('/sinhvien/', require('./router/sinhvien.router'));
app.use('/taikhoan/', routerTaiKhoan);
app.use('/diemso', routerDiemSo);
app.use('/chuongtrinhkhung', routerChuongTrinhKhung);
app.use('/monhoc', monhoc);
app.use('/lichhoc', lichhoc);

app.get('/', (req, res) => {
    res.send("Hello World!");
});

const hostName = "192.168.137.16"
const port = process.env.PORT || 8080;
const uri = process.env.ATLAS_URI;

console.log("MongoDB URI:", uri);  // Thêm dòng này để in URI và kiểm tra


const server = app.listen(port, hostName, () => {
    console.log(`Example app listening on: http://${hostName}:${port}/`);
})

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected...');

    // Khởi tạo các model để tạo collection
    require('./models/chuongtrinhkhung.model');
    require('./models/congno.model');
    require('./models/diemso.model');
    require('./models/hocky.model');
    require('./models/lichhoc.model');
    require('./models/lophocphan.model');
    require('./models/monhoc.model');
    require('./models/taikhoan.model');
    require('./models/quanly.model');
    require('./models/giangvien.model');
    require('./models/sinhvien.model');
    require('./models/thongbaogv.model');
    require('./models/thongbaosv.model');
    require('./models/sinhvienlophp.model');
}).catch(err => console.log(err));

// const io = socket(server, {
//     cors: {
//         origin: ['http://14.225.206.237', 'http://localhost:3000'],
//         credential: true,
//     }
// });

// let isConnected = false;
// global.onlineUsers = new Map();

module.exports = app;