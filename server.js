require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, system } = req.body;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: system,
      messages: messages
    });

    res.json({
      content: [{ text: response.content[0].text }]
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: "Server failed" });
  }
});

app.listen(3001, () => {
  console.log("✅ Backend running on http://localhost:3001");
});