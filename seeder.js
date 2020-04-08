const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');

// Load Models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');
// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

// Read JSON Files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));
// Import Data into DB
const importData = async () => {
    try {
        await User.create(users);
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await Review.create(reviews);
        console.log('Data Imported....'.green.inverse);
        process.exit();
    } catch(err) {
        console.error(err);
    }
};

// Delete Data From DB
const deleteData = async () => {
    try {
        await User.deleteMany();
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await Review.deleteMany();
        console.log('Data Destroyed....'.red.inverse);
        process.exit();
    } catch(err) {
        console.error(err);
    }
};

if (!process.argv[2]) {
    console.log('Please Provide Any argument');
    process.exit();
}
else if (process.argv[2] === 'i') {
    importData();
} else if (process.argv[2] === 'd') {
    deleteData();
}