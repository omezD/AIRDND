const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

router.get("/", (req, res) => {
  res.render("ai.ejs");
});

router.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.json({ answer: "Please ask a travel-related question." });
  }

  const prompt = `
You are a travel assistant for an Airbnb-like app called Wanderlust.
Only answer travel-related questions.
User question: ${question}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    const answer =
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    res.json({
      answer: answer || "Sorry, I couldn’t answer that.",
    });
  } catch (err) {
    console.error(err);
    res.json({ answer: "AI service error. Try again later." });
  }
});

module.exports = router;
