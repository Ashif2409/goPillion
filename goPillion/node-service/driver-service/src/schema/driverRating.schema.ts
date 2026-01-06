const mongoose = require("mongoose");

const DriverRatingSchema = new mongoose.Schema({
    driverId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    passengerId: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
    },
    totalRating: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const DriverRating = mongoose.model("DriverRating", DriverRatingSchema);

export default DriverRating;
