const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const studentRoutes = require("./routes/studentRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
const allowedOrigins = [
    process.env.CLIENT_URL ||
    "http://localhost:5173"
];

app.use(
    cors({
        origin: allowedOrigins
    })
);
app.use(express.json());

// Routes
app.use("/api/students", studentRoutes);

// MongoDB connection
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully ✅");
    })
    .catch((error) => {
        console.error("MongoDB connection failed ❌");
        console.error(error.message);
    });

// Test route
app.get("/", (req, res) => {
    res.json({
        success: true,
        service: "NxtWave Growth Engine API",
        status: "healthy"
    });
});

app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);

    res.status(500).json({
        success: false,
        message: "Something went wrong on the server."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});