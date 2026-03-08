const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    id: {
        type: String,
        default: 'global',
        unique: true
    },
    count: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Create a static method to cleanly increment visits
visitorSchema.statics.incrementCount = async function () {
    const doc = await this.findOneAndUpdate(
        { id: 'global' },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
    );
    return doc.count;
};

module.exports = mongoose.model('Visitor', visitorSchema);
