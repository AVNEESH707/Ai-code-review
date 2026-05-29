const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string" || code.trim() === "") {
      return res.status(400).json({ error: "Code is required." });
    }

    const review = await aiService(code);
    res.status(200).json({ review });

  } catch (err) {
    console.error("FULL ERROR:", err.response?.data || err.message);
    res.status(500).json({ 
      error: err.response?.data?.error?.message || err.message 
    });
  }
};