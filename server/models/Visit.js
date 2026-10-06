const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true
        },

        source: {
            type: String,
            default: "direct",
            trim: true
        },

        medium: {
            type: String,
            default: "direct",
            trim: true
        },

        campaign: {
            type: String,
            default: "ai-workshop",
            trim: true
        },

        referralCode: {
            type: String,
            default: null,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Visit = mongoose.model("Visit", visitSchema);

module.exports = Visit;