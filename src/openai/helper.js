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
- For quantity:
  • If input mentions a product (e.g., "after nines") → use:
    SELECT SUM(quantity) AS total_quantity FROM chocolate_sales WHERE product LIKE '%term%';
  • If input asks for stock or quantity without any product → use:
    SELECT product, SUM(quantity) AS total_quantity FROM chocolate_sales GROUP BY product ORDER BY product;
- If the question asks for **monthly comparison**, use:
    SELECT DATE_FORMAT(sale_date, '%Y-%m') AS month, SUM(...) GROUP BY month ORDER BY month
- Strict: Never add WHERE/AND filters unless explicitly mentioned.
 -To compare two or more products (e.g., Eclairs vs After Nines), use:  
  WHERE product LIKE '%eclairs%' OR product LIKE '%after nines%' GROUP BY product
User Question: ${question}`;

  const response = await together.chat.completions.create({
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    messages: [{ role: "user", content: prompt }],
  });

 let content = response.choices[0].message.content.trim();

  // 🧹 Clean up common wrappers like Query:, code blocks, etc.
  content = content
    .replace(/^.*?(select|with)/is, (_, sqlStart) => sqlStart) // remove leading non-SQL words
    .replace(/```/g, '')                                       // remove markdown code block
    .replace(/sql\s*:/i, '')                                   // remove "SQL:" or "sql:"
    .trim();

  if (/^\s*(select|with|insert|update|delete)\b/i.test(content)) {
    return content;
  }

  return { response: content };
}

export default generateSQL;

