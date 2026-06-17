const axios = require("axios");

const SYSTEM_PROMPT = `You are an expert senior software engineer conducting a thorough code review. 
Analyze the provided code and give structured, actionable feedback in Markdown format.

Your review must cover:
1. **Code Quality** – readability, naming conventions, code style
2. **Bugs & Errors** – potential bugs, logic errors, edge cases
3. **Performance** – inefficiencies, unnecessary computations, memory usage
4. **Security** – vulnerabilities, unsafe patterns, input validation
5. **Best Practices** – design patterns, SOLID principles, DRY violations
6. **Suggestions** – concrete improvements with example code snippets where helpful

Be specific and reference line numbers or code snippets when pointing out issues.
Format your response clearly using Markdown with headers, bullet points, and code blocks.`;

async function aiService(code) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Please review the following code:\n\n\`\`\`\n${code}\n\`\`\`` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  return response.data.candidates[0].content.parts[0].text;
}

module.exports = aiService;