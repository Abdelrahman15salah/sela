const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    amazonAssociateTag: {
        type: String,
        required: true,
    },
    siteName: {
        type: String,
        default: 'Sela Store',
    },
    disclaimerText: {
        type: String,
        default: 'As an Amazon Associate I earn from qualifying purchases.',
    },
}, {
    timestamps: true,
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
