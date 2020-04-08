const crypto = require('crypto');
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ErrorResponse = require('../utils/errorResponse');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        validate: {
            validator: isEmail,
            message: props => `${props.value} is not a valid email.`
        }
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.methods.toJSON = function () {
    const userObj = this.toObject();
    delete userObj['password'];
    return userObj;
}

// Generate Auth Token
UserSchema.methods.generateAuthToken = function () {
    const payload = {
        _id: this._id,
        role: this.role
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

// Find By Email and Password
UserSchema.statics.findByEmailAndPassword = async function (email, password) {
    // Check For User
    const foundUser = await this.findOne({ email });

    if (!foundUser) {
        throw new Error('User With This Email is not registered With Us');
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, foundUser.password);

    if (!isMatch) {
        throw new ErrorResponse('Incorrect Password', 401);
    } else {
        return foundUser;
    }
}

// Compare Password
UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

// Generate and Hash Reset Password Token
UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash Token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set Expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

// Middleware To Hash password
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);

        this.password = hashedPassword;
    }
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;