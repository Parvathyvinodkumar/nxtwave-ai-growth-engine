const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        // ====================================================
        // BASIC STUDENT INFORMATION
        // ====================================================

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        college: {
            type: String,
            required: true,
            trim: true
        },

        branch: {
            type: String,
            required: true,
            trim: true
        },

        year: {
            type: String,
            required: true,
            trim: true
        },

        // ====================================================
        // AI SCORE
        // ====================================================

        aiScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        // ====================================================
        // REFERRAL SYSTEM
        // ====================================================

        referralCode: {
            type: String,
            unique: true,
            sparse: true
        },

        referredBy: {
            type: String,
            default: null
        },

        referralCount: {
            type: Number,
            default: 0,
            min: 0
        },

        // ====================================================
        // PHASE 9 - GROWTH COMPETITION
        // ====================================================

        growthStatus: {
            type: String,
            default: "Participant"
        },

        highestMilestone: {
            type: Number,
            default: 0
        },

        // ====================================================
        // PHASE 7 - ATTRIBUTION
        // ====================================================

        acquisitionSource: {
            type: String,
            default: "direct",
            trim: true
        },

        acquisitionMedium: {
            type: String,
            default: "direct",
            trim: true
        },

        acquisitionCampaign: {
            type: String,
            default: "ai-workshop",
            trim: true
        },

        landingSource: {
            type: String,
            default: "direct",
            trim: true
        },

        // ====================================================
        // PHASE 8 - QUIZ
        // ====================================================

        programmingConfidence: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },

        projectExperience: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },

        aiExposure: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },

        apiExperience: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },

        goalClarity: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },

        quizAnswers: {
            programmingConfidence: {
                type: Number,
                min: 1,
                max: 5,
                default: null
            },

            projectExperience: {
                type: Number,
                min: 1,
                max: 5,
                default: null
            },

            aiExposure: {
                type: Number,
                min: 1,
                max: 5,
                default: null
            },

            apiExperience: {
                type: Number,
                min: 1,
                max: 5,
                default: null
            },

            goalClarity: {
                type: Number,
                min: 1,
                max: 5,
                default: null
            }
        },

        quizCompleted: {
            type: Boolean,
            default: false
        },

        quizCompletedAt: {
            type: Date,
            default: null
        },

        // ====================================================
        // PHASE 8 - PERSONALIZATION
        // ====================================================

        aiLevel: {
            type: String,
            enum: [
                "Beginner",
                "Intermediate",
                "Advanced"
            ],
            default: "Beginner"
        },

        recommendedProject: {
            type: String,
            default: null
        },

        projectDescription: {
            type: String,
            default: null
        },

        learningPath: {
            type: [String],
            default: []
        },

        personalizationReason: {
            type: String,
            default: null
        }
    },

    {
        timestamps: true
    }
);

const Student =
    mongoose.model(
        "Student",
        studentSchema
    );

module.exports = Student;