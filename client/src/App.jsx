import { useEffect, useState } from "react";
import "./App.css";
import { apiFetch } from "./api";

const CAMPAIGN_END =
    new Date("2026-10-13T23:59:59+05:30");


const questions = [
    {
        id: "programmingConfidence",
        question: "How comfortable are you with programming?",
        subtitle:
            "Think about your ability to build something without following a complete tutorial.",
        options: [
            { value: 1, label: "I'm a complete beginner" },
            { value: 2, label: "I know the basics" },
            { value: 3, label: "I'm comfortable coding" },
            { value: 4, label: "I'm a strong programmer" },
            { value: 5, label: "I can build independently" }
        ]
    },
    {
        id: "projectExperience",
        question: "How much real project experience do you have?",
        subtitle:
            "Consider academic, personal, internship, or deployed projects.",
        options: [
            { value: 1, label: "I haven't built a project yet" },
            { value: 2, label: "I've built small exercises" },
            { value: 3, label: "I've built 1–2 projects" },
            { value: 4, label: "I've built multiple projects" },
            { value: 5, label: "I've built and deployed projects" }
        ]
    },
    {
        id: "aiExposure",
        question: "How familiar are you with AI and GenAI?",
        subtitle:
            "Think about your practical exposure, not just theoretical knowledge.",
        options: [
            { value: 1, label: "I'm completely new to AI" },
            { value: 2, label: "I've explored the basics" },
            { value: 3, label: "I understand common AI concepts" },
            { value: 4, label: "I've used AI tools or APIs" },
            { value: 5, label: "I've built an AI/GenAI project" }
        ]
    },
    {
        id: "apiExperience",
        question: "How comfortable are you with using APIs?",
        subtitle:
            "Think about connecting your applications to external services.",
        options: [
            { value: 1, label: "I've never used an API" },
            { value: 2, label: "I know what APIs are" },
            { value: 3, label: "I've used APIs in a project" },
            { value: 4, label: "I'm comfortable integrating APIs" },
            { value: 5, label: "I've built API-heavy applications" }
        ]
    },
    {
        id: "goalClarity",
        question: "Why do you want to learn AI right now?",
        subtitle:
            "Choose the goal that matters most to you.",
        options: [
            { value: 1, label: "I'm just exploring" },
            { value: 2, label: "I'm curious about AI" },
            { value: 3, label: "I want to improve my skills" },
            { value: 4, label: "I want projects for my resume" },
            { value: 5, label: "I want to prepare for placements" }
        ]
    }
];

function App() {
    // --------------------------------
    // URL ATTRIBUTION
    // --------------------------------

    const urlParams = new URLSearchParams(
        window.location.search
    );

    const referralFromURL =
        urlParams.get("ref") || "";

    const source =
        urlParams.get("utm_source") ||
        (referralFromURL ? "referral" : "direct");

    const medium =
        urlParams.get("utm_medium") ||
        (referralFromURL ? "referral" : "direct");

    const campaign =
        urlParams.get("utm_campaign") ||
        "ai-workshop";

    // --------------------------------
    // MAIN STATE
    // --------------------------------

    const [stage, setStage] =
        useState("registration");

    const [registration, setRegistration] =
        useState({
            name: "",
            email: "",
            college: "",
            branch: "CSE",
            year: "Final Year"
        });

    const [student, setStudent] =
        useState(null);

    const [currentQuestion, setCurrentQuestion] =
        useState(0);

    const [answers, setAnswers] =
        useState({});

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [score, setScore] =
        useState(null);

    // --------------------------------
    // PHASE 8 PERSONALIZATION STATE
    // --------------------------------

    const [personalization, setPersonalization] =
        useState(null);

    const [copied, setCopied] =
        useState(false);

    // --------------------------------
    // LEADERBOARD STATE
    // --------------------------------

    const [leaderboard, setLeaderboard] =
        useState([]);

    const [currentRank, setCurrentRank] =
        useState(null);

    const [totalRegistered, setTotalRegistered] =
        useState(0);

    const [campaignRegistrations, setCampaignRegistrations] =
        useState(0);

    const [leaderboardLoading, setLeaderboardLoading] =
        useState(false);

    const [campusName, setCampusName] =
        useState("");

    const [competition, setCompetition] =
        useState(null);

    const [competitionLoading, setCompetitionLoading] =
        useState(false);
    
    const [timeLeft, setTimeLeft] =
        useState("");

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();

            const difference =
                CAMPAIGN_END.getTime() -
                now.getTime();

            if (difference <= 0) {
                setTimeLeft("Campaign ended");
                return;
            }

            const days =
                Math.floor(
                    difference /
                    (1000 * 60 * 60 * 24)
                );

            const hours =
                Math.floor(
                    (difference /
                        (1000 * 60 * 60)) %
                        24
                );

            const minutes =
                Math.floor(
                    (difference /
                        (1000 * 60)) %
                        60
                );

            setTimeLeft(
                `${days}d ${hours}h ${minutes}m`
            );
        };

        updateCountdown();

        const interval =
            setInterval(
                updateCountdown,
                60000
            );

        return () =>
            clearInterval(interval);

    }, []);

    const fetchCompetition = async () => {
        if (!student?.email) {
            console.log("COMPETITION: No student email");
            return;
        }

        console.log(
            "COMPETITION: Fetching for",
            student.email
        );

        try {
            setCompetitionLoading(true);

            const response = await fetch(
                `/api/students/competition?email=${encodeURIComponent(
                    student.email
                )}`
            );


            
            const data = await response.json();
console.log(
                "COMPETITION API RESPONSE:",
                data
            );

            if (data.success) {
                setCompetition(
                    data.competition
                );

                console.log(
                    "COMPETITION STATE DATA:",
                    data.competition
                );
            }

        } catch (error) {
            console.error(
                "Competition fetch error:",
                error
            );
        } finally {
            setCompetitionLoading(false);
        }
    };

    useEffect(() => {
        if (
            stage !== "dashboard" ||
            !student?.email
        ) {
            return;
        }

        fetchCompetition();

        const interval =
            setInterval(
                fetchCompetition,
                10000
            );

        return () =>
            clearInterval(interval);

    }, [stage, student?.email]);

    // --------------------------------
    // TRACK LANDING VISIT
    // --------------------------------

    useEffect(() => {
        const existingSession =
            localStorage.getItem(
                "launchpad_session_id"
            );

        let sessionId = existingSession;

        if (!sessionId) {
            sessionId =
                "session-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 10);

            localStorage.setItem(
                "launchpad_session_id",
                sessionId
            );
        }

        const trackVisit = async () => {
            try {
                await fetch(
                    `/api/students/analytics/visit`,
                    {
                        method: "POST",
                        
                        body: JSON.stringify({
                            sessionId,
                            source,
                            medium,
                            campaign,
                            referralCode:
                                referralFromURL || null
                        })
                    }
                );
            } catch (error) {
                console.error(
                    "Visit tracking failed:",
                    error
                );
            }
        };

        trackVisit();
    }, []);

    const question =
        questions[currentQuestion];

    const selectedAnswer =
        answers[question.id];

    const progress =
        ((currentQuestion + 1) /
            questions.length) *
        100;

    // --------------------------------
    // ADMIN ROUTE
    // --------------------------------

    if (
        window.location.pathname ===
        "/admin"
    ) {
        return <AdminDashboard />;
    }

    // --------------------------------
    // REGISTRATION
    // --------------------------------

    const handleRegistrationChange = (
        event
    ) => {
        const {
            name,
            value
        } = event.target;

        setRegistration((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
    };

    const handleRegistration = async (
        event
    ) => {
        event.preventDefault();

        setError("");

        if (
            !registration.name ||
            !registration.email ||
            !registration.college ||
            !registration.branch ||
            !registration.year
        ) {
            setError(
                "Please complete all fields."
            );

            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `/api/students/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        ...registration,

                        referredBy:
                            referralFromURL ||
                            undefined,

                        acquisitionSource:
                            source,

                        acquisitionMedium:
                            medium,

                        acquisitionCampaign:
                            campaign,

                        landingSource:
                            source
                    })
                }
            );

            
            const data = await response.json();
// --------------------------------
            // EXISTING EMAIL
            // --------------------------------

            if (response.status === 409) {
                setError(
                    "This email is already registered. You can continue to your dashboard."
                );

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Registration failed."
                );
            }

            setStudent(data.student);

            setScore(
                data.student.aiScore
            );

            // New registration has not
            // completed personalization yet.
            setPersonalization(null);

            setStage("quiz");
        } catch (error) {
            setError(
                error.message ||
                    "Something went wrong during registration."
            );
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------
    // CONTINUE EXISTING STUDENT
    // --------------------------------

    const continueExistingStudent =
        async () => {
            if (
                !registration.email.trim()
            ) {
                setError(
                    "Please enter your email."
                );

                return;
            }

            try {
                setLoading(true);
                setError("");

                const response =
                    await fetch(
                        `/api/students/profile?email=${encodeURIComponent(
                            registration.email.trim()
                        )}`
                    );


                
                const data = await response.json();
if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Unable to find your registration."
                    );
                }

                setStudent(
                    data.student
                );

                setScore(
                    data.student.aiScore
                );

                // --------------------------------
                // LOAD EXISTING PERSONALIZATION
                // --------------------------------

                if (
                    data.student.quizCompleted
                ) {
                    setPersonalization({
                        aiLevel:
                            data.student.aiLevel,
                        recommendedProject:
                            data.student.recommendedProject,
                        projectDescription:
                            data.student.projectDescription,
                        learningPath:
                            data.student.learningPath ||
                            [],
                        personalizationReason:
                            data.student.personalizationReason
                    });

                    setStage(
                        "dashboard"
                    );
                } else {
                    // No completed quiz yet.
                    setPersonalization(null);

                    setCurrentQuestion(
                        0
                    );

                    setAnswers({});

                    setStage("quiz");
                }
            } catch (error) {
                setError(
                    error.message ||
                        "Unable to load your existing registration."
                );
            } finally {
                setLoading(false);
            }
        };

    // --------------------------------
    // QUIZ
    // --------------------------------

    const handleAnswer = (value) => {
        setAnswers((previous) => ({
            ...previous,
            [question.id]: value
        }));

        setError("");
    };

    const handleNext = () => {
        if (!selectedAnswer) {
            setError(
                "Please select an answer before continuing."
            );

            return;
        }

        setError("");

        if (
            currentQuestion <
            questions.length - 1
        ) {
            setCurrentQuestion(
                (previous) =>
                    previous + 1
            );
        } else {
            submitQuiz();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(
                (previous) =>
                    previous - 1
            );

            setError("");
        }
    };

    const submitQuiz = async () => {
        setLoading(true);
        setError("");

        try {
            const response =
                await fetch(
                    `/api/students/quiz`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email:
                                student.email,

                            programmingConfidence:
                                answers.programmingConfidence,

                            projectExperience:
                                answers.projectExperience,

                            aiExposure:
                                answers.aiExposure,

                            apiExperience:
                                answers.apiExperience,

                            goalClarity:
                                answers.goalClarity
                        })
                    }
                );

            
            const data = await response.json();
if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to submit quiz."
                );
            }

            // --------------------------------
            // UPDATE STUDENT
            // --------------------------------

            setStudent(
                data.result
            );

            setScore(
                data.result.aiScore
            );

            // --------------------------------
            // UPDATE PERSONALIZATION
            // --------------------------------

            setPersonalization({
                aiLevel:
                    data.result.aiLevel,

                recommendedProject:
                    data.result.recommendedProject,

                projectDescription:
                    data.result.projectDescription,

                learningPath:
                    data.result.learningPath ||
                    [],

                personalizationReason:
                    data.result.personalizationReason
            });

            setStage("dashboard");
        } catch (error) {
            setError(
                error.message ||
                    "Something went wrong while submitting the quiz."
            );
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------
    // REFERRAL
    // --------------------------------

    const referralLink =
        student?.referralCode
            ? `${window.location.origin}/?ref=${student.referralCode}`
            : "";

    const copyReferralLink =
        async () => {
            try {
                await navigator.clipboard.writeText(
                    referralLink
                );

                setCopied(true);

                setTimeout(() => {
                    setCopied(false);
                }, 2000);
            } catch {
                setError(
                    "Unable to copy referral link."
                );
            }
        };

    const shareReferralLink =
        async () => {
            const shareData = {
                title:
                    "Build Your First AI Project",

                text:
                    "I'm joining a free workshop to build my first AI project in 60 minutes. Join me!",

                url: referralLink
            };

            if (navigator.share) {
                try {
                    await navigator.share(
                        shareData
                    );
                } catch {
                    // User cancelled sharing.
                }
            } else {
                copyReferralLink();
            }
        };

    // --------------------------------
    // CAMPUS LEADERBOARD
    // --------------------------------

    const fetchLeaderboard =
        async () => {
            if (!student?.email) {
                return;
            }

            try {
                setLeaderboardLoading(
                    true
                );

                const response =
                    await fetch(
                        `/api/students/campus-leaderboard?email=${encodeURIComponent(
                            student.email
                        )}`
                    );


                
                const data = await response.json();
if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Unable to load campus leaderboard."
                    );
                }

                setLeaderboard(
                    data.leaderboard ||
                        []
                );

                setTotalRegistered(
                    data.totalCampusRegistered ||
                        0
                );

                setCampusName(
                    data.college ||
                        student.college
                );

                setCurrentRank(
                    data.currentStudent
                        ? data
                              .currentStudent
                              .rank
                        : null
                );

                if (
                    data.currentStudent
                ) {
                    setStudent(
                        (previous) => ({
                            ...previous,

                            referralCount:
                                data
                                    .currentStudent
                                    .referralCount
                        })
                    );
                }
            } catch (error) {
                console.error(
                    "Campus leaderboard loading error:",
                    error
                );
            } finally {
                setLeaderboardLoading(
                    false
                );
            }
        };

    // --------------------------------
    // LIVE LEADERBOARD REFRESH
    // --------------------------------

    useEffect(() => {
        if (
            stage !== "dashboard" ||
            !student?.email
        ) {
            return;
        }

        fetchLeaderboard();

        const interval =
            setInterval(() => {
                fetchLeaderboard();
            }, 10000);

        return () => {
            clearInterval(
                interval
            );
        };
    }, [
        stage,
        student?.email
    ]);

    // --------------------------------
    // SCORE MESSAGE
    // --------------------------------

    const getScoreMessage = () => {
        if (score >= 80) {
            return {
                title:
                    "You're ready to build.",

                description:
                    "You already have a strong foundation. Now turn your skills into a real AI project."
            };
        }

        if (score >= 60) {
            return {
                title:
                    "You're closer than you think.",

                description:
                    "You have a solid foundation. A guided hands-on project can help turn your knowledge into something tangible."
            };
        }

        if (score >= 40) {
            return {
                title:
                    "You have a starting point.",

                description:
                    "You don't need to know everything before starting. Building a practical AI project is one of the fastest ways to learn."
            };
        }

        return {
            title:
                "Everyone starts somewhere.",

            description:
                "You don't need advanced AI knowledge to begin. Start small, build something real, and learn as you go."
        };
    };

    // --------------------------------
    // REGISTRATION SCREEN
    // --------------------------------

    if (stage === "registration") {
        return (
            <main className="app">
                <div className="background-glow glow-one"></div>

                <div className="background-glow glow-two"></div>

                <section className="email-screen">
                    <div className="brand">
                        <span className="brand-mark">
                            AI
                        </span>

                        <span>
                            LaunchPad
                        </span>
                    </div>

                    <div className="registration-card">
                        <div className="eyebrow">
                            FREE AI WORKSHOP
                        </div>

                        <h1>
                            Build your first
                            <span>
                                {" "}
                                AI project.
                            </span>
                        </h1>

                        <p className="intro">
                            Register for the
                            60-minute workshop
                            and discover your
                            AI Builder Score.
                        </p>

                        {referralFromURL && (
                            <div className="referral-banner">
                                <span>✓</span>

                                You were invited
                                by a student
                            </div>
                        )}

                        <form
                            onSubmit={
                                handleRegistration
                            }
                        >
                            <div className="form-grid">
                                <div className="form-field">
                                    <label>
                                        Name
                                    </label>

                                    <input
                                        name="name"
                                        type="text"
                                        placeholder="Your name"
                                        value={
                                            registration.name
                                        }
                                        onChange={
                                            handleRegistrationChange
                                        }
                                    />
                                </div>

                                <div className="form-field">
                                    <label>
                                        Email
                                    </label>

                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={
                                            registration.email
                                        }
                                        onChange={
                                            handleRegistrationChange
                                        }
                                    />
                                </div>
                            </div>

                            <div className="form-field">
                                <label>
                                    College
                                </label>

                                <input
                                    name="college"
                                    type="text"
                                    placeholder="Your college"
                                    value={
                                        registration.college
                                    }
                                    onChange={
                                        handleRegistrationChange
                                    }
                                />
                            </div>

                            <div className="form-grid">
                                <div className="form-field">
                                    <label>
                                        Branch
                                    </label>

                                    <select
                                        name="branch"
                                        value={
                                            registration.branch
                                        }
                                        onChange={
                                            handleRegistrationChange
                                        }
                                    >
                                        <option value="CSE">
                                            Computer Science
                                        </option>

                                        <option value="IT">
                                            Information Technology
                                        </option>

                                        <option value="ECE">
                                            Electronics & Communication
                                        </option>

                                        <option value="EEE">
                                            Electrical & Electronics
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label>
                                        Year
                                    </label>

                                    <select
                                        name="year"
                                        value={
                                            registration.year
                                        }
                                        onChange={
                                            handleRegistrationChange
                                        }
                                    >
                                        <option value="Final Year">
                                            Final Year
                                        </option>

                                        <option value="Pre-Final Year">
                                            Pre-Final Year
                                        </option>

                                        <option value="3rd Year">
                                            3rd Year
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {error && (
                                <div className="error-message">
                                    <div>
                                        {error}
                                    </div>

                                    {error.includes(
                                        "already registered"
                                    ) && (
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={
                                                continueExistingStudent
                                            }
                                            disabled={
                                                loading
                                            }
                                        >
                                            {loading
                                                ? "Loading..."
                                                : "Continue to my dashboard →"}
                                        </button>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={
                                    loading
                                }
                            >
                                {loading
                                    ? "Registering..."
                                    : "Continue to AI assessment"}

                                {!loading && (
                                    <span>
                                        →
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="time-note">
                            <span>✦</span>

                            Free workshop ·
                            60 minutes ·
                            Beginner friendly
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    // --------------------------------
    // QUIZ SCREEN
    // --------------------------------

    if (stage === "quiz") {
        return (
            <main className="app">
                <div className="background-glow glow-one"></div>

                <div className="background-glow glow-two"></div>

                <section className="quiz-screen">
                    <header className="quiz-header">
                        <div className="brand">
                            <span className="brand-mark">
                                AI
                            </span>

                            <span>
                                LaunchPad
                            </span>
                        </div>

                        <div className="question-count">
                            {String(
                                currentQuestion + 1
                            ).padStart(2, "0")}

                            <span>/</span>

                            {String(
                                questions.length
                            ).padStart(2, "0")}
                        </div>
                    </header>

                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${progress}%`
                            }}
                        ></div>
                    </div>

                    <div className="quiz-content">
                        <div className="question-meta">
                            QUESTION{" "}
                            {currentQuestion + 1}
                        </div>

                        <h1>
                            {
                                question.question
                            }
                        </h1>

                        <p className="question-subtitle">
                            {
                                question.subtitle
                            }
                        </p>

                        <div className="options">
                            {question.options.map(
                                (option) => (
                                    <button
                                        key={
                                            option.value
                                        }
                                        className={`option-card ${
                                            selectedAnswer ===
                                            option.value
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleAnswer(
                                                option.value
                                            )
                                        }
                                    >
                                        <span className="option-number">
                                            {
                                                option.value
                                            }
                                        </span>

                                        <span className="option-text">
                                            {
                                                option.label
                                            }
                                        </span>

                                        <span className="option-check">
                                            {selectedAnswer ===
                                            option.value
                                                ? "✓"
                                                : ""}
                                        </span>
                                    </button>
                                )
                            )}
                        </div>

                        {error && (
                            <p className="error-message quiz-error">
                                {error}
                            </p>
                        )}

                        <div className="quiz-actions">
                            <button
                                className="back-button"
                                onClick={
                                    handlePrevious
                                }
                                disabled={
                                    currentQuestion ===
                                    0
                                }
                            >
                                ← Back
                            </button>

                            <button
                                className="primary-button next-button"
                                onClick={
                                    handleNext
                                }
                                disabled={
                                    loading
                                }
                            >
                                {loading
                                    ? "Calculating..."
                                    : currentQuestion ===
                                      questions.length -
                                          1
                                    ? "Reveal my score"
                                    : "Continue"}

                                {!loading && (
                                    <span>
                                        →
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    // --------------------------------
    // DASHBOARD
    // --------------------------------

    const scoreMessage =
        getScoreMessage();

    return (
        <main className="app">
            <div className="background-glow glow-one"></div>

            <div className="background-glow glow-two"></div>

            <section className="dashboard-screen">
                <header className="dashboard-header">
                    <div className="brand">
                        <span className="brand-mark">
                            AI
                        </span>

                        <span>
                            LaunchPad
                        </span>
                    </div>

                    <div className="dashboard-user">
                        {student?.name}
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="dashboard-intro">
                        <div className="eyebrow">
                            YOU'RE IN
                        </div>

                        <h1>
                            Your AI Builder
                            <span>
                                {" "}
                                Dashboard.
                            </span>
                        </h1>

                        <p>
                            Your workshop
                            journey starts
                            here. Invite
                            your friends
                            and climb the
                            campus
                            leaderboard.
                        </p>
                    </div>

                    {/* --------------------------------
                        CAMPAIGN REGISTRATION GOAL
                    -------------------------------- */}

                    <div className="campaign-goal dashboard-card">

                        <div className="campaign-goal-header">
                            <span>
                                WORKSHOP REGISTRATION GOAL
                            </span>

                            <strong>
                                {campaignRegistrations} / 500
                            </strong>
                        </div>

                        <div className="campaign-goal-track">
                            <div
                                className="campaign-goal-fill"
                                style={{
                                    width: `${Math.min(
                                        (campaignRegistrations / 500) * 100,
                                        100
                                    )}%`
                                }}
                            />
                        </div>

                    </div>

                    {/* --------------------------------
                        PHASE 9: GROWTH COMPETITION
                    -------------------------------- */}

                    {competition && (
                        <div className="competition-card dashboard-card">

                            <div className="competition-header">

                                <div>
                                    <div className="card-label">
                                        7-DAY GROWTH CHALLENGE
                                    </div>

                                    <h2>
                                        Turn your network into growth.
                                    </h2>
                                </div>

                                <div className="campaign-countdown">
                                    <span>
                                        CAMPAIGN ENDS IN
                                    </span>

                                    <strong>
                                        {timeLeft}
                                    </strong>
                                </div>

                                <div className="growth-status">
                                    {competition.growthStatus}
                                </div>

                            </div>

                            <div className="competition-stats">

                                <div className="competition-stat">
                                    <span>YOUR RANK</span>
                                    <strong>
                                        #{competition.rank}
                                    </strong>
                                </div>

                                <div className="competition-stat">
                                    <span>REFERRALS</span>
                                    <strong>
                                        {competition.referralCount}
                                    </strong>
                                </div>

                                <div className="competition-stat">
                                    <span>PARTICIPANTS</span>
                                    <strong>
                                        {competition.totalParticipants}
                                    </strong>
                                </div>

                            </div>

                            <div className="milestone-section">

                                <div className="milestone-header">

                                    <div>
                                        <span className="project-label">
                                            CURRENT MILESTONE
                                        </span>

                                        <strong>
                                            {competition.milestone} referrals
                                        </strong>
                                    </div>

                                    {competition.nextMilestone && (
                                        <div className="next-milestone">
                                            {competition.referralsToNext}{" "}
                                            more to{" "}
                                            {competition.nextMilestone}
                                        </div>
                                    )}

                                </div>

                                <div className="milestone-track">

                                    <div
                                        className="milestone-fill"
                                        style={{
                                            width: `${Math.min(
                                                (competition.referralCount /
                                                    (competition.nextMilestone ||
                                                        Math.max(
                                                            competition.referralCount,
                                                            1
                                                        ))) *
                                                    100,
                                                100
                                            )}%`
                                        }}
                                    ></div>

                                </div>

                            </div>

                            <div className="competition-reward">

                                <span className="reward-icon">
                                    ✦
                                </span>

                                <div>
                                    <span className="project-label">
                                        UNLOCKED STATUS
                                    </span>

                                    <strong>
                                        {competition.reward}
                                    </strong>
                                </div>

                            </div>

                            {competition.nextMilestone && (
                                <p className="competition-message">
                                    Keep sharing your referral link to reach{" "}
                                    <strong>
                                        {competition.nextMilestone} referrals
                                    </strong>
                                    {" "}and unlock your next growth milestone.
                                </p>
                            )}

                        </div>
                    )}

                    <div className="dashboard-grid">
                        <div className="score-panel dashboard-card">
                            <div className="card-label">
                                AI BUILDER
                                SCORE
                            </div>

                            <div className="dashboard-score">
                                {score ?? 0}
                                <span>
                                    /100
                                </span>
                            </div>

                            <h2>
                                {
                                    scoreMessage.title
                                }
                            </h2>

                            <p>
                                {
                                    scoreMessage.description
                                }
                            </p>
                        </div>

                        <div className="referral-panel dashboard-card">
                            <div className="card-label">
                                YOUR GROWTH
                                IMPACT
                            </div>

                            <div className="referral-number">
                                {student?.referralCount ||
                                    0}
                            </div>

                            <div className="referral-title">
                                {student?.referralCount ===
                                1
                                    ? "friend registered"
                                    : "friends registered"}
                            </div>

                            <p>
                                Every successful
                                referral
                                increases your
                                position on
                                the leaderboard.
                            </p>
                        </div>
                    </div>

                    <div className="share-card dashboard-card">
                        <div>
                            <div className="card-label">
                                YOUR PERSONAL
                                REFERRAL LINK
                            </div>

                            <div className="referral-link">
                                {
                                    referralLink
                                }
                            </div>
                        </div>

                        <div className="share-actions">
                            <button
                                className="secondary-button"
                                onClick={
                                    copyReferralLink
                                }
                            >
                                {copied
                                    ? "Copied ✓"
                                    : "Copy link"}
                            </button>

                            <button
                                className="primary-button"
                                onClick={
                                    shareReferralLink
                                }
                            >
                                Invite friends
                                <span>
                                    ↗
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* --------------------------------
                        PHASE 8: AI BUILDER PROFILE
                    -------------------------------- */}

                    {personalization && (
                        <div className="personalization-card dashboard-card">
                            <div className="personalization-header">
                                <div>
                                    <div className="card-label">
                                        YOUR AI BUILDER PROFILE
                                    </div>

                                    <h2>
                                        Your next AI project
                                    </h2>
                                </div>

                                <div className="ai-level-badge">
                                    {
                                        personalization.aiLevel
                                    }
                                </div>
                            </div>

                            <div className="personalization-project">
                                <div className="project-icon">
                                    AI
                                </div>

                                <div>
                                    <div className="project-label">
                                        RECOMMENDED PROJECT
                                    </div>

                                    <h3>
                                        {
                                            personalization.recommendedProject
                                        }
                                    </h3>

                                    <p>
                                        {
                                            personalization.projectDescription
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="personalization-reason">
                                <strong>
                                    Why this fits you
                                </strong>

                                <p>
                                    {
                                        personalization.personalizationReason
                                    }
                                </p>
                            </div>

                            <div className="learning-path">
                                <div className="project-label">
                                    YOUR BUILDING PATH
                                </div>

                                <div className="learning-steps">
                                    {(
                                        personalization.learningPath ||
                                        []
                                    ).map(
                                        (
                                            step,
                                            index
                                        ) => (
                                            <div
                                                className="learning-step"
                                                key={
                                                    index
                                                }
                                            >
                                                <div className="step-number">
                                                    {
                                                        index +
                                                            1
                                                    }
                                                </div>

                                                <span>
                                                    {
                                                        step
                                                    }
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --------------------------------
                        CAMPUS LEADERBOARD
                    -------------------------------- */}

                    <div className="leaderboard-card dashboard-card">
                        <div className="leaderboard-header">
                            <div>
                                <div className="card-label">
                                    CAMPUS
                                    LEADERBOARD
                                </div>

                                <h2>
                                    {campusName ||
                                        "Your campus"}{" "}
                                    growth
                                    ranking
                                </h2>
                            </div>

                            <div className="live-indicator">
                                <span></span>
                                LIVE
                            </div>
                        </div>

                        <div className="leaderboard-stats">
                            <div>
                                <strong>
                                    {
                                        totalRegistered
                                    }
                                </strong>

                                <span>
                                    campus
                                    registrations
                                </span>
                            </div>

                            {currentRank && (
                                <div>
                                    <strong>
                                        #
                                        {
                                            currentRank
                                        }
                                    </strong>

                                    <span>
                                        your
                                        rank
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="leaderboard-list">
                            {leaderboardLoading &&
                            leaderboard.length ===
                                0 ? (
                                <div className="leaderboard-empty">
                                    Loading
                                    leaderboard...
                                </div>
                            ) : leaderboard.length ===
                              0 ? (
                                <div className="leaderboard-empty">
                                    No referrals
                                    yet. Be
                                    the first!
                                </div>
                            ) : (
                                leaderboard.map(
                                    (
                                        entry
                                    ) => (
                                        <div
                                            className={`leaderboard-row ${
                                                entry.rank ===
                                                currentRank
                                                    ? "current-user"
                                                    : ""
                                            }`}
                                            key={
                                                entry.rank
                                            }
                                        >
                                            <div className="rank-number">
                                                {entry.rank <=
                                                3
                                                    ? [
                                                          "🥇",
                                                          "🥈",
                                                          "🥉"
                                                      ][
                                                          entry.rank -
                                                              1
                                                      ]
                                                    : `#${entry.rank}`}
                                            </div>

                                            <div className="leaderboard-person">
                                                <strong>
                                                    {
                                                        entry.name
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        entry.college
                                                    }
                                                </span>
                                            </div>

                                            <div className="leaderboard-referrals">
                                                <strong>
                                                    {
                                                        entry.referralCount
                                                    }
                                                </strong>

                                                <span>
                                                    {entry.referralCount ===
                                                    1
                                                        ? "referral"
                                                        : "referrals"}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                )
                            )}
                        </div>

                        {currentRank &&
                            currentRank > 10 && (
                                <div className="your-rank-note">
                                    You're currently{" "}
                                    <strong>
                                        #
                                        {
                                            currentRank
                                        }
                                    </strong>
                                    . Keep
                                    sharing to
                                    enter the
                                    top 10.
                                </div>
                            )}
                    </div>

                    <div className="dashboard-next">
                        <span>
                            Next step
                        </span>

                        <strong>
                            Build your
                            first AI
                            project in 60
                            minutes →
                        </strong>
                    </div>
                </div>
            </section>
        </main>
    );
}

// ================================================
// ADMIN DASHBOARD
// ================================================

function AdminDashboard() {
    const [analytics, setAnalytics] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    

    const fetchAnalytics =
        async () => {
            try {
                setLoading(true);

                const response =
                    await fetch(
                        `/api/students/analytics`
                    );

               
                
                const data = await response.json();
if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Unable to load analytics."
                    );
                }

                setAnalytics(data);
            } catch (error) {
                console.error(
                    "Analytics loading error:",
                    error
                );

                setError(
                    error.message
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        fetchAnalytics();

        const interval =
            setInterval(() => {
                fetchAnalytics();
            }, 10000);

        return () => {
            clearInterval(
                interval
            );
        };
    }, []);

    if (loading) {
        return (
            <div className="admin-screen">
                <div className="admin-loading">
                    Loading growth
                    analytics...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-screen">
                <div className="admin-error">
                    {error}
                </div>
            </div>
        );
    }

    const goalProgress =
        Math.min(
            (analytics.funnel.registrations / 500) * 100,
            100
        );

    return (
        <div className="admin-screen">
            <div className="admin-container">

                {/* ADMIN HEADER */}

                <div className="admin-header">
                    <div>
                        <div className="admin-eyebrow">
                            LAUNCHPAD
                        </div>

                        <h1>
                            Growth
                            Analytics
                        </h1>

                        <p>
                            Monitor campaign
                            acquisition,
                            funnel, and
                            referral
                            performance.
                        </p>
                    </div>

                    <div className="admin-live">
                        <span></span>
                        LIVE
                    </div>
                </div>

                {/* FUNNEL OVERVIEW */}

                <div className="analytics-grid">

                    <div className="analytics-card">
                        <span>
                            TOTAL VISITORS
                        </span>

                        <strong>
                            {
                                analytics
                                    .funnel
                                    .visitors
                            }
                        </strong>

                        <small>
                            unique landing
                            sessions
                        </small>
                    </div>

                    <div className="analytics-card">
                        <span>
                            REGISTRATIONS
                        </span>

                        <strong>
                            {
                                analytics
                                    .funnel
                                    .registrations
                            }
                        </strong>

                        <small>
                            students
                            registered
                        </small>
                    </div>

                    <div className="analytics-card">
                        <span>
                            REGISTRATION
                            CONVERSION
                        </span>

                        <strong>
                            {
                                analytics
                                    .funnel
                                    .registrationConversion
                            }
                            %
                        </strong>

                        <small>
                            visitors →
                            registrations
                        </small>
                    </div>

                    <div className="analytics-card">
                        <span>
                            QUIZ COMPLETION
                        </span>

                        <strong>
                            {
                                analytics
                                    .funnel
                                    .quizCompletionRate
                            }
                            %
                        </strong>

                        <small>
                            registered →
                            completed
                        </small>
                    </div>

                </div>

                {/* ACQUISITION PERFORMANCE */}

                <div className="admin-section">
                    <div className="admin-section-header">
                        <div>
                            <span>
                                ACQUISITION
                                PERFORMANCE
                            </span>

                            <h2>
                                Where
                                registrations
                                came from
                            </h2>
                        </div>
                    </div>

                    <div className="source-table">

                        <div className="source-table-header">
                            <span>
                                Source
                            </span>

                            <span>
                                Visitors
                            </span>

                            <span>
                                Registrations
                            </span>

                            <span>
                                Conversion
                            </span>
                        </div>

                        {analytics.sourcePerformance.map(
                            (item) => (
                                <div
                                    className="source-table-row"
                                    key={
                                        item.source
                                    }
                                >
                                    <strong>
                                        {
                                            item.source
                                        }
                                    </strong>

                                    <span>
                                        {
                                            item.visitors
                                        }
                                    </span>

                                    <span>
                                        {
                                            item.registrations
                                        }
                                    </span>

                                    <span className="source-conversion">
                                        {
                                            item.conversionRate
                                        }
                                        %
                                    </span>
                                </div>
                            )
                        )}

                    </div>
                </div>

                {/* REFERRAL PERFORMANCE */}

                <div className="admin-section">
                    <div className="admin-section-header">
                        <div>
                            <span>
                                REFERRAL
                                PERFORMANCE
                            </span>

                            <h2>
                                Top
                                referrers
                            </h2>
                        </div>
                    </div>

                    <div className="admin-list">

                        {analytics.topReferrers
                            .length ===
                        0 ? (
                            <div className="admin-empty">
                                No referrals
                                yet.
                            </div>
                        ) : (
                            analytics.topReferrers.map(
                                (
                                    student
                                ) => (
                                    <div
                                        className="admin-list-row"
                                        key={
                                            student.rank
                                        }
                                    >
                                        <div className="admin-rank">
                                            #
                                            {
                                                student.rank
                                            }
                                        </div>

                                        <div className="admin-person">
                                            <strong>
                                                {
                                                    student.name
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    student.college
                                                }
                                            </span>
                                        </div>

                                        <div className="admin-referrals">
                                            <strong>
                                                {
                                                    student.referralCount
                                                }
                                            </strong>

                                            <span>
                                                referrals
                                            </span>
                                        </div>
                                    </div>
                                )
                            )
                        )}

                    </div>
                </div>

                {/* CAMPUS PERFORMANCE */}

                <div className="admin-section">
                    <div className="admin-section-header">
                        <div>
                            <span>
                                CAMPUS
                                PERFORMANCE
                            </span>

                            <h2>
                                Registrations
                                by college
                            </h2>
                        </div>
                    </div>

                    <div className="college-list">

                        {analytics.registrationsByCollege.map(
                            (
                                college
                            ) => (
                                <div
                                    className="college-row"
                                    key={
                                        college.college
                                    }
                                >
                                    <div>
                                        <strong>
                                            {
                                                college.college
                                            }
                                        </strong>
                                    </div>

                                    <div className="college-count">
                                        {
                                            college.registrations
                                        }
                                    </div>
                                </div>
                            )
                        )}

                    </div>
                </div>

                {/* DAILY REGISTRATIONS */}

                <div className="admin-section">
                    <div className="admin-section-header">
                        <div>
                            <span>
                                CAMPAIGN
                                MOMENTUM
                            </span>

                            <h2>
                                Daily
                                registrations
                            </h2>
                        </div>
                    </div>



                    <div className="daily-list">

                        {analytics.dailyRegistrations.map(
                            (day) => (
                                <div
                                    className="daily-row"
                                    key={
                                        day.date
                                    }
                                >
                                    <span>
                                        {
                                            day.date
                                        }
                                    </span>

                                    <strong>
                                        {
                                            day.registrations
                                        }
                                    </strong>
                                </div>
                            )
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}

export default App;