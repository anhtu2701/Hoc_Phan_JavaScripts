const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express();
const port = 3000;
const route = require('./routes');
const db = require('./config/db');
const { addUserToViews } = require('./app/middleware/auth');
const handlebarsHelpers = require('./utils/handlebars-helpers');
const { initializeScheduledJobs } = require('./utils/scheduledJobs');

async function startServer() {
 
    await db.connect();

    // Static Files
    app.use(express.static(path.join(__dirname, 'public')));

    // Middleware
    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());

    // Session Configuration
    const sessionStore = new MySQLStore({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'Htu0404@',
        database: 'RentalManagement',
        clearExpired: true,
        checkExpirationInterval: 900000,
        expiration: 86400000,
        createDatabaseTable: true,
        schema: {
            tableName: 'sessions',
            columnNames: {
                session_id: 'session_id',
                expires: 'expires',
                data: 'data'
            }
        }
    });

    app.use(session({
        key: 'session_cookie_name',
        secret: 'your_secret_key_here_change_in_production',
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 
            secure: false, 
            httpOnly: true // 
        }
    }));

    // Middleware để thêm thông tin user vào tất cả views
    app.use(addUserToViews);

    // HTTP Logger
    app.use(morgan('combined'));

    // Template Engine
    app.engine('hbs', handlebars.engine({
        extname: '.hbs',
        layoutsDir: path.join(__dirname, 'resources', 'views', 'layouts'),
        partialsDir: path.join(__dirname, 'resources', 'views', 'partials'),
        defaultLayout: 'main',
        helpers: handlebarsHelpers
    }));
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'resources', 'views'));

    // Routes init
    route(app);

    // Khởi động các job định kỳ
    initializeScheduledJobs();

    // Start server sau khi DB đã kết nối thành công
    app.listen(port, () => {
        console.log(`Sever is running in http://localhost:${port}`);
    });
}

// Graceful shutdown
process.on('SIGINT', () => {
    process.exit(0);
});

process.on('SIGTERM', () => {
    process.exit(0);
});

// Gọi hàm startServer()
startServer();
