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

// Multiple free models — if one is rate limited, tries the next
const FREE_MODELS = [
  "deepseek/deepseek-v4-flash:free",
  "openrouter/free",
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

async function aiService(code) {
  let lastError;

  for (const model of FREE_MODELS) {
    try {
      console.log(`Trying model: ${model}`);

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Please review the following code:\n\n\`\`\`\n${code}\n\`\`\``,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "CodeLens AI Code Reviewer",
          },
          timeout: 30000,
        }
      );

      console.log(`✅ Success with model: ${model}`);
      return response.data.choices[0].message.content;

    } catch (err) {
      const status = err.response?.data?.error?.code;
      console.warn(`❌ Model ${model} failed (${status}) — trying next...`);
      lastError = err;

      // Only retry on rate limit (429), throw immediately on other errors
      if (status !== 429) throw err;
    }
  }

  throw lastError;
}

module.exports = aiService;
