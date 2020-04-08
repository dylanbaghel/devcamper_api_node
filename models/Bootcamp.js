const mongoose = require('mongoose');
const { isURL, isEmail } = require('validator');
const slugify = require('slugify');

const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Add a Name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please Add a description'],
        maxlength: [500, 'Description Can Not Be More Than 500 Characters.']
    },
    website: {
        type: String,
        validate: {
            validator: isURL,
            message: props => `${props.value} is not a valid URL`
        }
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone Number Can Not Be Longer Than 20 Characters.']
    },
    email: {
        type: String,
        validate: {
            validator: isEmail,
            message: props => `${props.value} is not a valid email.`
        }
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        // GeoJSON Data
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    // Generated
    averageRating: {
        type: Number,
        min: [1, 'Rating Must be at least 1'],
        max: [10, 'Rating Can not be more than 10']
    },
    // Generated
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});



// Creating bootcamp slug from the name
BootcampSchema.pre('save', function(next) {
    const slug = slugify(this.name, {
        replacement: '-',
        lower:true
    });
    this.slug = slug;
    next();
});

// Geocode & Create Location Field
BootcampSchema.pre('save', async function(next) {
    const response = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [response[0].longitude, response[0].latitude],
        formattedAddress: response[0].formattedAddress,
        street: response[0].streetName,
        city: response[0].city,
        state: response[0].stateCode,
        zipcode: response[0].zipcode,
        country: response[0].countryCode
    }
    next();
});

// Cascade Delete Courses When a Bootcamp is deleted
BootcampSchema.pre('remove', async function(next) {
    await this.model('Course').deleteMany({ bootcamp: this._id });
    next();
});

// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});

const Bootcamp = mongoose.model('Bootcamp', BootcampSchema)

module.exports = Bootcamp