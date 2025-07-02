const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const path = require('path');
const app = express();
const port = 3000;
const route = require('./routes');
const db = require('./config/db');

// Tạo hàm khởi động server
async function startServer() {
    // Kết nối database trước khi start Express
    await db.connect();

    // Static Files
    app.use(express.static(path.join(__dirname, 'public')));

    // Middleware
    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());

    // HTTP Logger
    app.use(morgan('combined'));

    // Template Engine
    app.engine('hbs', handlebars.engine({
        extname: '.hbs',
        layoutsDir: path.join(__dirname, 'resources', 'views', 'layouts'),
        partialsDir: path.join(__dirname, 'resources', 'views', 'partials'),
        defaultLayout: 'main'
    }));
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'resources', 'views'));

    // Routes init
    route(app);

    // Start server sau khi DB đã kết nối thành công
    app.listen(port, () => {
        console.log(`Sever is running in http://localhost:${port}`);
    });
}

// Gọi hàm startServer()
startServer();
