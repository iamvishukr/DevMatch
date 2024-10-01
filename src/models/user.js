const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({   ///schemas for user
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 16,
        trim: true, // New
        match: /^[a-zA-Z]+$/,
    },
    lastName: {
        type: String,
        trim: true, // New
        match: /^[a-zA-Z]+$/,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error ("Invalid email address: " + value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error ("Enter a strong password: " + value);
            }
        }
    },
    age: {
        type: Number,
        min: 18,
        validate(value) { 
            if (!Number.isInteger(value)) {
                throw new Error('Invalid Age');
            }
        }
    },
    gender: {
        type: String,
        validate(value){
            if(!["male", "female", "other"].includes(value)){
                throw new Error ("Invalid Gender value");
            }
        }
    }, 
    photoUrl: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        validate(value){
            if(!validator.isURL(value)){
                throw new Error ("Invalid Photo URL: " + value);
            }
        }
    },
    about: {
        type: String,
        default: "Hey there, Let's Connect and code together?",
        maxLength: 200
    },
    skills: {
        type: [String],
    }
}, {
    timestamps: true,
});

const User =  mongoose.model('User', userSchema);  //model for user
module.exports = User;