import path from 'path'; // Xử lý đường dẫn tệp
import express from 'express'; // Web framework cho Node.js
import morgan from 'morgan'; // Module ghi log
import session from 'express-session';
import bodyParser from 'body-parser'; // Xử lý dữ liệu từ các yêu cầu HTTP
import cors from 'cors'; // Middleware CORS

// Load biến môi trường từ file .env
import dotenv from 'dotenv';
dotenv.config({ path: './app/config/.env' });

const app = express();
const port = process.env.PORT || 6868; // Sử dụng PORT từ .env hoặc mặc định là 8888

// Middleware log request
app.use(morgan('dev'));

app.use(cors({
  origin: [process.env.FRONTEND_URL], // Thêm các domain bạn muốn
  methods: ['GET', 'POST'], // Chỉ cho phép GET và POST
  allowedHeaders: ['Content-Type'], // Chỉ cho phép header Content-Type
}));

// Middleware session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Middleware để parse dữ liệu JSON
app.use(bodyParser.json());

import route from './app/routes/index.js'; // Thay đổi đường dẫn nếu cần

app.use(morgan('combined')); // Cấu hình ghi log HTTP requests
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Kiểm tra xem .env có được load thành công không
console.log('Environment variables loaded:');
console.log(`PORT: ${process.env.PORT}`);

// Route init
route(app);

// Lắng nghe trên cổng
app.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
