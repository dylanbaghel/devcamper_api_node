require('./db/db')();
// Built-in Modules
const path = require('path');
// Third Party Modules
const express = require('express');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
// Custom Module Files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/error');
// App Initialize
const app = express();

// Middlewares
app.use(express.json());
app.use(fileUpload());
app.use(cookieParser());
// Dev Logging Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.get('/', (req, res) => {
    return res.status(200).json({ data: 'OK' });
});

// Route Assigner
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);
app.use(errorHandler)
// Server Listen
const server = app.listen(process.env.PORT, console.log(`Server Running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`.yellow.bold));


// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close Server & exit process
    server.close(() => process.exit(1));
});