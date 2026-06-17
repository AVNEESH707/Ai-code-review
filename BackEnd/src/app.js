const express = require("express");
const cors = require("cors");
require("dotenv").config();

const aiRoutes = require("./routes/ai.routes");

const app = express();

app.use(cors({
  origin: [
    'https://ai-code-review-psi-two.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

app.use("/ai", aiRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Code Review API is running" });
});

module.exports = app;