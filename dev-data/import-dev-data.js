const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');

dotenv.config({path: './config.env'}); 

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

//mongoose.connect(process.env.DATABASE_LOCAL, {
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
    console.log('DB coneection successful');
})

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const bookings = JSON.parse(fs.readFileSync(`${__dirname}/bookings.json`, 'utf-8'));

// IMPORT DATA INTO DB
const  importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        await Booking.create(bookings);
        
        console.log('Data successfullly loaded!');
    } catch(err) {
        console.log(err);
    }
    process.exit();
}

// DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        await Booking.deleteMany();

        console.log('Data successfullly deleted!');
    } catch(err) {
        console.log(err);
    }
    process.exit();
}

/* 
argv stands for 'arguments vector.' (process.argv) is an array that contains the command-line arguments passed to the script.

The term "vector" in programming often refers to an array or a data structure that holds elements in a specific orderSo, argv is a common 
abbreviation for "argument vector" in various programming languages. In the context of Node.js, process.argv specifically refers to the 
array that holds the command-line arguments passed to the Node.js script.

process.argv[0]: The absolute path of the executable that started the Node.js 
process.argv[1]: The absolute path of the script being executed.
process.argv[2] and onwards: The command-line arguments passed to the script.
*/

if(process.argv[2] === '--import') {
    importData()
} else if(process.argv[2] === '--delete') {
    deleteData();
}
