const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const MongoDbConnection = () => {
    try {
        mongoose.connect(MONGO_URI)
            .then(() => console.log('MongoDB connected successfully'))
            .catch((err) => console.log('MongoDB connection error:', err));
    } catch (error) {
        console.log('MongoDB connection error:', error);
    }
}

module.exports = {
    MongoDbConnection
};

