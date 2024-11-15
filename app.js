var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

var app = express();

// Kết nối MongoDB
mongoose.connect('mongodb+srv://admin:202112@cluster0.vqxti.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Kết nối thành công đến MongoDB'))
    .catch(err => console.error('Lỗi kết nối đến MongoDB', err));

// Cấu hình middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Định nghĩa schema cho oto
const carSchema = new mongoose.Schema({
  MaXe: String,
  Name: String,
  Price: Number,
  Year: Number,
  Brand: String,
});

const Car = mongoose.model('Car', carSchema);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Route để hiển thị form nhập liệu
app.get('/', (req, res) => {
  res.render('form');
});

// Route để xử lý việc tạo Ô tô mới
app.post('/cars', async (req, res) => {
  try {
    const { MaXe, Name, Price, Year, Brand } = req.body;

    // Kiểm tra trường trống
    if (!MaXe || !Name || !Price || !Year || !Brand) {
      return res.status(400).send('Vui lòng điền đầy đủ thông tin');
    }

    // Kiểm tra tên chỉ chứa chữ cái và khoảng trắng
    if (!/^[a-zA-Z\s]+$/.test(Name)) {
      return res.status(400).send('Tên phải là chữ cái và khoảng trắng');
    }

    // Kiểm tra giá là số dương
    if (isNaN(Price) || Price <= 0) {
      return res.status(400).send('Giá phải là số dương');
    }

    // Kiểm tra năm trong khoảng 1980-2024
    if (isNaN(Year) || Year < 1980 || Year > 2024) {
      return res.status(400).send('Năm sản xuất phải từ 1980 đến 2024');
    }

    // Tạo xe mới
    const newCar = new Car({ MaXe, Name, Price, Year, Brand });
    await newCar.save();

    res.redirect('/');
  } catch (error) {
    res.status(500).send('Có lỗi xảy ra khi tạo xe mới');
  }
});


// Route để lấy danh sách Ô tô dạng JSON
app.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    res.status(500).send('Có lỗi xảy ra khi lấy danh sách xe');
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));

module.exports = app;