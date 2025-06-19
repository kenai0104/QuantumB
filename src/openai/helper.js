import { Together } from "together-ai";
import dotenv from "dotenv";
dotenv.config();

const together = new Together();

async function generateSQL(question) {
  const data = {
    tables: ["chocolate_sales"],
    columns: [
      "id",
      "cutomer_name",
      "country",
      "product",
      "sale_date",
      "revenue",
      "quantity",
    ],
  };

  const table = data.tables.join(", ");
  const columns = data.columns.join(", ");

  const prompt = `You are an expert in SQL and natural language understanding.

Your task is to:
- Output ONLY a clean and valid SQL query if the user's question is clearly and directly related to the database schema.
- If the user's input is generic, chit-chat, or unrelated to the database (e.g., "hello", "how are you", "what's up"), respond as a helpful assistant with a short, friendly reply.

⚠️ Important:
- If the input is SQL-related, return ONLY the SQL query. Do NOT add explanations, markdown code blocks, or any additional text. Just the raw SQL.
- If the input is not SQL-related, reply naturally as a friendly assistant.

Database Schema:
Table: ${table}
Columns: ${columns}

SQL Guidelines:
- Do NOT use SELECT * unless the user says "all details", "everything", or "all data".
- For questions involving product or item, include those columns WITH customer_name.
- For price-related queries (→ revenue) or stock (→ quantity), include those columns WITH product.
- Use LIKE '%term%' for fuzzy product name matches (e.g., "after nines").
- For revenue of multiple products → use SUM(revenue), GROUP BY product.
- For quantity → use SUM(quantity), WHERE product LIKE '%term%'.
- Strict: Never add WHERE/AND filters unless explicitly mentioned.

User Question: ${question}`;

  const response = await together.chat.completions.create({
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    messages: [{ role: "user", content: prompt }],
  });

  let content = response.choices[0].message.content.trim();

  // 🧹 Clean markdown (e.g., remove "SQL:", code blocks)
  content = content
    .replace(/^sql\s*[:\-]*/i, '')
    .replace(/^```sql/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();

  // ✅ Check if it's a valid SQL query
  if (content.toLowerCase().startsWith("select") || content.toLowerCase().startsWith("with")) {
    return content;
  }

  // 🗣 Return non-SQL response
  return { response: content };
}

export default generateSQL;
