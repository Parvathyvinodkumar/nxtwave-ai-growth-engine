const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Visit = require("../models/Visit");

// ============================================================
// PERSONALIZATION ENGINE
// ============================================================

function generatePersonalization({
    programmingConfidence,
    projectExperience,
    aiExposure,
    apiExperience,
    goalClarity,
    aiScore
}) {
    let aiLevel = "Beginner";

    if (aiScore >= 75) {
        aiLevel = "Advanced";
    } else if (aiScore >= 50) {
        aiLevel = "Intermediate";
    }

    let recommendedProject;
    let projectDescription;
    let learningPath;
    let personalizationReason;

    // --------------------------------------------------------
    // BEGINNER
    // --------------------------------------------------------

    if (
        programmingConfidence <= 2 &&
        projectExperience <= 2
    ) {
        recommendedProject = "AI Resume Analyzer";

        projectDescription =
            "Build a beginner-friendly AI application that analyzes a resume and provides structured improvement suggestions.";

        learningPath = [
            "Understand basic AI concepts",
            "Learn how to send data to an AI model",
            "Build a simple AI-powered interface",
            "Turn the project into a portfolio piece"
        ];

        personalizationReason =
            "Your profile shows that you are still building confidence with programming and project development.";
    }

    // --------------------------------------------------------
    // ADVANCED - STRONG AI + API EXPERIENCE
    // --------------------------------------------------------

    else if (
        apiExperience >= 4 &&
        aiExposure >= 4
    ) {
        recommendedProject = "AI Research Assistant";

        projectDescription =
            "Build an AI-powered assistant that processes information, uses APIs, and generates useful research summaries.";

        learningPath = [
            "Work with AI APIs",
            "Design an AI-powered workflow",
            "Connect multiple application components",
            "Build a portfolio-ready AI project"
        ];

        personalizationReason =
            "Your strong AI exposure and API experience indicate that you are ready for a more advanced AI application.";
    }

    // --------------------------------------------------------
    // ADVANCED - STRONG PROGRAMMING + PROJECT EXPERIENCE
    // --------------------------------------------------------

    else if (
        projectExperience >= 4 &&
        programmingConfidence >= 4
    ) {
        recommendedProject = "AI Study Assistant";

        projectDescription =
            "Build an AI assistant that helps students summarize content, answer questions, and organize learning material.";

        learningPath = [
            "Design an AI application workflow",
            "Integrate an AI API",
            "Build the application interface",
            "Add the project to your portfolio"
        ];

        personalizationReason =
            "Your programming confidence and project experience indicate that you can move quickly into building a practical AI application.";
    }

    // --------------------------------------------------------
    // INTERMEDIATE / GENERAL CASE
    // --------------------------------------------------------

    else {
        recommendedProject = "AI Study Assistant";

        projectDescription =
            "Build a practical AI assistant that helps students learn, summarize information, and answer questions.";

        learningPath = [
            "Understand AI application basics",
            "Learn how AI APIs work",
            "Build a simple AI-powered application",
            "Create a portfolio-ready AI project"
        ];

        personalizationReason =
            "Your profile shows a developing technical foundation, making a practical AI application a suitable next project.";
    }

    return {
        aiLevel,
        recommendedProject,
        projectDescription,
        learningPath,
        personalizationReason
    };
}

// ============================================================
// PHASE 9 - GROWTH STATUS
// ============================================================

function getGrowthStatus(referralCount) {
    if (referralCount >= 10) {
        return {
            status: "Growth Champion",
            milestone: 10,
            reward:
                "Growth Champion badge + priority recognition"
        };
    }

    if (referralCount >= 5) {
        return {
            status: "Growth Leader",
            milestone: 5,
            reward: "Growth Leader badge"
        };
    }

    if (referralCount >= 3) {
        return {
            status: "Growth Builder",
            milestone: 3,
            reward: "Growth Builder badge"
        };
    }

    if (referralCount >= 1) {
        return {
            status: "Growth Starter",
            milestone: 1,
            reward: "Growth Starter badge"
        };
    }

    return {
        status: "Participant",
        milestone: 0,
        reward:
            "Start sharing to unlock your first milestone"
    };
}

// ============================================================
// GENERATE RANDOM REFERRAL CODE
// ============================================================

function generateReferralCode() {
    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
}

// ============================================================
// CALCULATE INITIAL AI SCORE
// ============================================================

function calculateInitialAIScore({ branch, year }) {
    let score = 50;

    if (branch.toLowerCase() === "cse") {
        score += 10;
    }

    if (
        year.toLowerCase().includes("final") ||
        year.toLowerCase().includes("4")
    ) {
        score += 10;
    }

    return Math.min(score, 100);
}

// ============================================================
// POST /api/students/register
// ============================================================

router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            college,
            branch,
            year,
            referredBy,
            acquisitionSource,
            acquisitionMedium,
            acquisitionCampaign,
            landingSource
        } = req.body;

        // ----------------------------------------------------
        // 1. Validate required fields
        // ----------------------------------------------------

        if (
            !name ||
            !email ||
            !college ||
            !branch ||
            !year
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email, college, branch and year are required."
            });
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // ----------------------------------------------------
        // 2. Clean input
        // ----------------------------------------------------

        const cleanName = name.trim();
        const cleanEmail =
            email.trim().toLowerCase();
        const cleanCollege = college.trim();
        const cleanBranch = branch.trim();
        const cleanYear = year.trim();

        // ----------------------------------------------------
        // 3. Validate email
        // ----------------------------------------------------

        

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid email address."
            });
        }

        // ----------------------------------------------------
        // 4. Check duplicate email
        // ----------------------------------------------------

        const existingStudent =
            await Student.findOne({
                email: cleanEmail
            });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message:
                    "This email is already registered."
            });
        }

        // ----------------------------------------------------
        // 5. Generate unique referral code
        // ----------------------------------------------------

        let referralCode;
        let codeExists = true;

        while (codeExists) {
            referralCode =
                generateReferralCode();

            const existingCode =
                await Student.findOne({
                    referralCode
                });

            codeExists = !!existingCode;
        }

        // ----------------------------------------------------
        // 6. Calculate initial AI score
        // ----------------------------------------------------

        const aiScore =
            calculateInitialAIScore({
                branch: cleanBranch,
                year: cleanYear
            });

        // ----------------------------------------------------
        // 7. Validate referral code
        // ----------------------------------------------------

        let referrer = null;

        if (referredBy) {
            referrer =
                await Student.findOne({
                    referralCode:
                        referredBy
                            .trim()
                            .toUpperCase()
                });

            if (!referrer) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid referral code."
                });
            }
            // Prevent self-referral
            if (referrer.email === email) {
                return res.status(400).json({
                    success: false,
                    message: "You cannot use your own referral link."
                });
            }
        }

        // ----------------------------------------------------
        // 8. Create student
        // ----------------------------------------------------

        const student =
            await Student.create({
                name: cleanName,
                email: cleanEmail,
                college: cleanCollege,
                branch: cleanBranch,
                year: cleanYear,

                aiScore,

                referralCode,

                referredBy:
                    referrer
                        ? referrer.referralCode
                        : null,

                referralCount: 0,

                // PHASE 7
                acquisitionSource:
                    acquisitionSource ||
                    "direct",

                acquisitionMedium:
                    acquisitionMedium ||
                    "direct",

                acquisitionCampaign:
                    acquisitionCampaign ||
                    "ai-workshop",

                landingSource:
                    landingSource ||
                    "direct",

                // PHASE 9
                growthStatus: "Participant",
                highestMilestone: 0
            });

        // ----------------------------------------------------
        // 9. PHASE 9C
        // Increment referrer count + update status
        // ----------------------------------------------------

        if (referrer) {
            const currentReferralCount =
                referrer.referralCount || 0;

            referrer.referralCount =
                currentReferralCount + 1;

            const growthStatus =
                getGrowthStatus(
                    referrer.referralCount
                );

            referrer.growthStatus =
                growthStatus.status;

            referrer.highestMilestone =
                Math.max(
                    referrer.highestMilestone || 0,
                    growthStatus.milestone
                );

            await referrer.save();
        }

        // ----------------------------------------------------
        // 10. Successful response
        // ----------------------------------------------------

        return res.status(201).json({
            success: true,

            message:
                "Registration successful!",

            student: {
                id: student._id,

                name: student.name,

                email: student.email,

                college: student.college,

                branch: student.branch,

                year: student.year,

                aiScore:
                    student.aiScore,

                referralCode:
                    student.referralCode,

                referredBy:
                    student.referredBy,

                referralCount:
                    student.referralCount,

                growthStatus:
                    student.growthStatus,

                highestMilestone:
                    student.highestMilestone,

                registeredAt:
                    student.createdAt
            }
        });

    } catch (error) {
        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while registering.",
            error: error.message
        });
    }
});

// ============================================================
// POST /api/students/quiz
// PHASE 8 - AI PERSONALIZATION
// ============================================================

router.post("/quiz", async (req, res) => {
    try {
        const {
            email,
            programmingConfidence,
            projectExperience,
            aiExposure,
            apiExperience,
            goalClarity
        } = req.body;

        // ----------------------------------------------------
        // 1. Validate email
        // ----------------------------------------------------

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        // ----------------------------------------------------
        // 2. Validate quiz answers
        // ----------------------------------------------------

        const answers = {
            programmingConfidence,
            projectExperience,
            aiExposure,
            apiExperience,
            goalClarity
        };

        for (
            const [key, value]
            of Object.entries(answers)
        ) {
            if (
                typeof value !== "number" ||
                value < 1 ||
                value > 5
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `${key} must be a number between 1 and 5.`
                });
            }
        }

        // ----------------------------------------------------
        // 3. Find student
        // ----------------------------------------------------

        const student =
            await Student.findOne({
                email:
                    email
                        .trim()
                        .toLowerCase()
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student is not registered."
            });
        }

        // ----------------------------------------------------
        // 4. Calculate AI Builder Score
        // ----------------------------------------------------

        const scorePerQuestion =
            (answer) => {
                return (answer - 1) * 5;
            };

        const aiScore =
            scorePerQuestion(
                programmingConfidence
            ) +
            scorePerQuestion(
                projectExperience
            ) +
            scorePerQuestion(
                aiExposure
            ) +
            scorePerQuestion(
                apiExperience
            ) +
            scorePerQuestion(
                goalClarity
            );

        // ----------------------------------------------------
        // 5. Generate personalization
        // ----------------------------------------------------

        const personalization =
            generatePersonalization({
                programmingConfidence,
                projectExperience,
                aiExposure,
                apiExperience,
                goalClarity,
                aiScore
            });

        // ----------------------------------------------------
        // 6. Save quiz answers
        // ----------------------------------------------------

        student.quizAnswers = {
            programmingConfidence,
            projectExperience,
            aiExposure,
            apiExperience,
            goalClarity
        };

        // ----------------------------------------------------
        // 7. Save individual quiz fields
        // ----------------------------------------------------

        student.programmingConfidence =
            programmingConfidence;

        student.projectExperience =
            projectExperience;

        student.aiExposure =
            aiExposure;

        student.apiExperience =
            apiExperience;

        student.goalClarity =
            goalClarity;

        // ----------------------------------------------------
        // 8. Save AI score
        // ----------------------------------------------------

        student.aiScore = aiScore;

        // ----------------------------------------------------
        // 9. Mark quiz completed
        // ----------------------------------------------------

        student.quizCompleted = true;

        student.quizCompletedAt =
            new Date();

        // ----------------------------------------------------
        // 10. Save personalization
        // ----------------------------------------------------

        student.aiLevel =
            personalization.aiLevel;

        student.recommendedProject =
            personalization.recommendedProject;

        student.projectDescription =
            personalization.projectDescription;

        student.learningPath =
            personalization.learningPath;

        student.personalizationReason =
            personalization.personalizationReason;

        // ----------------------------------------------------
        // 11. Save everything
        // ----------------------------------------------------

        await student.save();

        // ----------------------------------------------------
        // 12. Return result
        // ----------------------------------------------------

        return res.status(200).json({
            success: true,

            message:
                "AI Readiness Quiz completed successfully!",

            result: {
                name:
                    student.name,

                email:
                    student.email,

                college:
                    student.college,

                branch:
                    student.branch,

                year:
                    student.year,

                aiScore:
                    student.aiScore,

                aiLevel:
                    student.aiLevel,

                recommendedProject:
                    student.recommendedProject,

                projectDescription:
                    student.projectDescription,

                learningPath:
                    student.learningPath,

                personalizationReason:
                    student.personalizationReason,

                referralCode:
                    student.referralCode,

                referralCount:
                    student.referralCount,

                referredBy:
                    student.referredBy,

                growthStatus:
                    student.growthStatus,

                highestMilestone:
                    student.highestMilestone,

                quizCompleted:
                    student.quizCompleted,

                quizCompletedAt:
                    student.quizCompletedAt
            }
        });

    } catch (error) {
        console.error(
            "Quiz error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while processing the quiz.",
            error: error.message
        });
    }
});

// ============================================================
// GET /api/students/competition
// PHASE 9
// ============================================================

router.get("/competition", async (req, res) => {
    try {
        const email =
            req.query.email
                ? req.query.email.trim().toLowerCase()
                : "";

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const student =
            await Student.findOne({
                email
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const students =
            await Student.find({})
                .sort({
                    referralCount: -1,
                    createdAt: 1
                })
                .select(
                    "name college referralCount growthStatus createdAt"
                );

        const rank =
            students.findIndex(
                (item) =>
                    item._id.toString() ===
                    student._id.toString()
            ) + 1;

        const growthStatus =
            getGrowthStatus(
                student.referralCount || 0
            );

        let nextMilestone = 10;

        if (
            (student.referralCount || 0) < 1
        ) {
            nextMilestone = 1;
        } else if (
            student.referralCount < 3
        ) {
            nextMilestone = 3;
        } else if (
            student.referralCount < 5
        ) {
            nextMilestone = 5;
        }

        const referralsToNext =
            Math.max(
                nextMilestone -
                    (student.referralCount || 0),
                0
            );

        return res.status(200).json({
            success: true,

            competition: {
                rank,

                referralCount:
                    student.referralCount || 0,

                growthStatus:
                    growthStatus.status,

                milestone:
                    growthStatus.milestone,

                reward:
                    growthStatus.reward,

                nextMilestone,

                referralsToNext,

                totalParticipants:
                    students.length
            }
        });

    } catch (error) {
        console.error(
            "Competition error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load competition data"
        });
    }
});

// ============================================================
// GET /api/students/leaderboard
// ============================================================

router.get("/leaderboard", async (req, res) => {
    try {
        const currentEmail =
            req.query.email
                ? req.query.email
                    .trim()
                    .toLowerCase()
                : null;

        const students =
            await Student.find({})
                .select(
                    "name college referralCount email createdAt"
                )
                .sort({
                    referralCount: -1,
                    createdAt: 1
                });

        const leaderboard =
            students
                .slice(0, 10)
                .map(
                    (student, index) => {
                        const nameParts =
                            student.name
                                .trim()
                                .split(" ");

                        let displayName =
                            nameParts[0];

                        if (
                            nameParts.length > 1
                        ) {
                            displayName +=
                                " " +
                                nameParts[
                                    nameParts.length - 1
                                ].charAt(0) +
                                ".";
                        }

                        return {
                            rank:
                                index + 1,

                            name:
                                displayName,

                            college:
                                student.college,

                            referralCount:
                                student.referralCount
                        };
                    }
                );

        let currentStudent = null;

        if (currentEmail) {
            const currentIndex =
                students.findIndex(
                    (student) =>
                        student.email ===
                        currentEmail
                );

            if (currentIndex !== -1) {
                const student =
                    students[currentIndex];

                currentStudent = {
                    rank:
                        currentIndex + 1,

                    referralCount:
                        student.referralCount
                };
            }
        }

        return res.status(200).json({
            success: true,

            totalRegistered:
                students.length,

            leaderboard,

            currentStudent
        });

    } catch (error) {
        console.error(
            "Leaderboard error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load leaderboard."
        });
    }
});

// ============================================================
// GET /api/students/profile
// PHASE 8
// ============================================================

router.get("/profile", async (req, res) => {
    try {
        const email =
            req.query.email
                ? req.query.email
                    .trim()
                    .toLowerCase()
                : "";

        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                    "Email is required."
            });
        }

        const student =
            await Student.findOne({
                email
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "No student found with this email."
            });
        }

        return res.status(200).json({
            success: true,

            student: {
                id:
                    student._id,

                name:
                    student.name,

                email:
                    student.email,

                college:
                    student.college,

                branch:
                    student.branch,

                year:
                    student.year,

                aiScore:
                    student.aiScore,

                aiLevel:
                    student.aiLevel,

                recommendedProject:
                    student.recommendedProject,

                projectDescription:
                    student.projectDescription,

                learningPath:
                    student.learningPath,

                personalizationReason:
                    student.personalizationReason,

                referralCode:
                    student.referralCode,

                referredBy:
                    student.referredBy,

                referralCount:
                    student.referralCount,

                growthStatus:
                    student.growthStatus,

                highestMilestone:
                    student.highestMilestone,

                quizCompleted:
                    student.quizCompleted ||
                    false,

                quizCompletedAt:
                    student.quizCompletedAt
            }
        });

    } catch (error) {
        console.error(
            "Profile loading error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load student profile."
        });
    }
});

// ============================================================
// GET /api/students/campus-leaderboard
// ============================================================

router.get(
    "/campus-leaderboard",
    async (req, res) => {
        try {
            const email =
                req.query.email
                    ? req.query.email
                        .trim()
                        .toLowerCase()
                    : "";

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Email is required."
                });
            }

            const currentStudent =
                await Student.findOne({
                    email
                });

            if (!currentStudent) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Student not found."
                });
            }

            const students =
                await Student.find({
                    college:
                        currentStudent.college
                })
                    .select(
                        "name college referralCount email createdAt"
                    )
                    .sort({
                        referralCount: -1,
                        createdAt: 1
                    });

            const leaderboard =
                students
                    .slice(0, 10)
                    .map(
                        (student, index) => {
                            const nameParts =
                                student.name
                                    .trim()
                                    .split(" ");

                            let displayName =
                                nameParts[0];

                            if (
                                nameParts.length > 1
                            ) {
                                displayName +=
                                    " " +
                                    nameParts[
                                        nameParts.length - 1
                                    ].charAt(0) +
                                    ".";
                            }

                            return {
                                rank:
                                    index + 1,

                                name:
                                    displayName,

                                college:
                                    student.college,

                                referralCount:
                                    student.referralCount
                            };
                        }
                    );

            const currentIndex =
                students.findIndex(
                    (student) =>
                        student.email ===
                        currentStudent.email
                );

            const currentStudentData = {
                rank:
                    currentIndex + 1,

                referralCount:
                    currentStudent.referralCount
            };

            return res.status(200).json({
                success: true,

                college:
                    currentStudent.college,

                totalCampusRegistered:
                    students.length,

                leaderboard,

                currentStudent:
                    currentStudentData
            });

        } catch (error) {
            console.error(
                "Campus leaderboard error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to load campus leaderboard."
            });
        }
    }
);

// ============================================================
// GET /api/students/analytics
// PHASE 7 - GROWTH ANALYTICS
// ============================================================

router.get("/analytics", async (req, res) => {
    try {
        const totalVisitors =
            await Visit.countDocuments();

        const totalRegistered =
            await Student.countDocuments();

        const quizCompleted =
            await Student.countDocuments({
                quizCompleted: true
            });

        const referralRegistrations =
            await Student.countDocuments({
                referredBy: {
                    $ne: null
                }
            });

        const registrationConversion =
            totalVisitors > 0
                ? Number(
                    (
                        (totalRegistered /
                            totalVisitors) *
                        100
                    ).toFixed(1)
                )
                : 0;

        const quizCompletionRate =
            totalRegistered > 0
                ? Number(
                    (
                        (quizCompleted /
                            totalRegistered) *
                        100
                    ).toFixed(1)
                )
                : 0;

        const referralRate =
            totalRegistered > 0
                ? Number(
                    (
                        (referralRegistrations /
                            totalRegistered) *
                        100
                    ).toFixed(1)
                )
                : 0;

        const totalReferrals =
            await Student.aggregate([
                {
                    $group: {
                        _id: null,

                        total: {
                            $sum:
                                "$referralCount"
                        }
                    }
                }
            ]);

        const topReferrers =
            await Student.find({})
                .select(
                    "name college referralCount"
                )
                .sort({
                    referralCount: -1
                })
                .limit(10);

        // ----------------------------------------------------
        // SOURCE PERFORMANCE
        // ----------------------------------------------------

        const sourcePerformance =
            await Visit.aggregate([
                {
                    $group: {
                        _id: "$source",

                        visitors: {
                            $sum: 1
                        }
                    }
                },

                {
                    $sort: {
                        visitors: -1
                    }
                }
            ]);

        const sourceRegistrations =
            await Student.aggregate([
                {
                    $group: {
                        _id:
                            "$acquisitionSource",

                        registrations: {
                            $sum: 1
                        }
                    }
                },

                {
                    $sort: {
                        registrations: -1
                    }
                }
            ]);

        const sourceMap = {};

        sourcePerformance.forEach(
            (item) => {
                sourceMap[item._id] = {
                    source:
                        item._id,

                    visitors:
                        item.visitors,

                    registrations: 0,

                    conversionRate: 0
                };
            }
        );

        sourceRegistrations.forEach(
            (item) => {
                if (!sourceMap[item._id]) {
                    sourceMap[item._id] = {
                        source:
                            item._id,

                        visitors: 0,

                        registrations: 0,

                        conversionRate: 0
                    };
                }

                sourceMap[
                    item._id
                ].registrations =
                    item.registrations;
            }
        );

        Object.values(
            sourceMap
        ).forEach(
            (item) => {
                if (item.visitors > 0) {
                    item.conversionRate =
                        Number(
                            (
                                (
                                    item.registrations /
                                    item.visitors
                                ) *
                                100
                            ).toFixed(1)
                        );
                }
            }
        );

        // ----------------------------------------------------
        // CAMPAIGN PERFORMANCE
        // ----------------------------------------------------

        const campaignPerformance =
            await Student.aggregate([
                {
                    $group: {
                        _id:
                            "$acquisitionCampaign",

                        registrations: {
                            $sum: 1
                        }
                    }
                },

                {
                    $sort: {
                        registrations: -1
                    }
                }
            ]);

        // ----------------------------------------------------
        // REGISTRATIONS BY COLLEGE
        // ----------------------------------------------------

        const registrationsByCollege =
            await Student.aggregate([
                {
                    $group: {
                        _id: "$college",

                        registrations: {
                            $sum: 1
                        }
                    }
                },

                {
                    $sort: {
                        registrations: -1
                    }
                }
            ]);

        // ----------------------------------------------------
        // DAILY REGISTRATIONS
        // ----------------------------------------------------

        const dailyRegistrations =
            await Student.aggregate([
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format:
                                    "%Y-%m-%d",

                                date:
                                    "$createdAt"
                            }
                        },

                        registrations: {
                            $sum: 1
                        }
                    }
                },

                {
                    $sort: {
                        _id: 1
                    }
                }
            ]);

        // ----------------------------------------------------
        // RETURN ANALYTICS
        // ----------------------------------------------------

        return res.status(200).json({
            success: true,

            funnel: {
                visitors:
                    totalVisitors,

                registrations:
                    totalRegistered,

                quizCompleted:
                    quizCompleted,

                referralRegistrations:
                    referralRegistrations,

                registrationConversion,

                quizCompletionRate,

                referralRate,

                totalReferrals:
                    totalReferrals.length > 0
                        ? totalReferrals[0].total
                        : 0
            },

            sourcePerformance:
                Object.values(
                    sourceMap
                ),

            campaignPerformance:
                campaignPerformance.map(
                    (item) => ({
                        campaign:
                            item._id,

                        registrations:
                            item.registrations
                    })
                ),

            topReferrers:
                topReferrers.map(
                    (student, index) => ({
                        rank:
                            index + 1,

                        name:
                            student.name,

                        college:
                            student.college,

                        referralCount:
                            student.referralCount
                    })
                ),

            registrationsByCollege:
                registrationsByCollege.map(
                    (item) => ({
                        college:
                            item._id,

                        registrations:
                            item.registrations
                    })
                ),

            dailyRegistrations:
                dailyRegistrations.map(
                    (item) => ({
                        date:
                            item._id,

                        registrations:
                            item.registrations
                    })
                )
        });

    } catch (error) {
        console.error(
            "Analytics error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load analytics."
        });
    }
});

// ============================================================
// POST /api/students/analytics/visit
// ============================================================

router.post(
    "/analytics/visit",
    async (req, res) => {
        try {
            const {
                sessionId,
                source,
                medium,
                campaign,
                referralCode
            } = req.body;

            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Session ID is required."
                });
            }

            const existingVisit =
                await Visit.findOne({
                    sessionId
                });

            if (existingVisit) {
                return res.status(200).json({
                    success: true,
                    message:
                        "Visit already tracked.",
                    newVisit: false
                });
            }

            await Visit.create({
                sessionId,

                source:
                    source ||
                    "direct",

                medium:
                    medium ||
                    "direct",

                campaign:
                    campaign ||
                    "ai-workshop",

                referralCode:
                    referralCode ||
                    null
            });

            return res.status(201).json({
                success: true,
                message:
                    "Visit tracked successfully.",
                newVisit: true
            });

        } catch (error) {
            console.error(
                "Visit tracking error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to track visit."
            });
        }
    }
);

module.exports = router;