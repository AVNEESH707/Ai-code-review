const express = require("express");
const cors = require("cors");
require("dotenv").config();

const aiRoutes = require("./routes/ai.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/ai", aiRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Code Review API is running" });
});

module.exports = app;
