const mongoose = require('mongoose');

const connectDB = async () => {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });
        console.log('Mongo Connected: '.cyan.underline.bold,conn.connection.host.cyan.underline.bold);
};

module.exports = connectDB