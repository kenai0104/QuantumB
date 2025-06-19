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
Your job is to generate a clean, efficient SQL query **only if** the user's question is clearly and directly related to the database schema.
If the user's input is **generic**, **chit-chat**, **personal**, or **not relevant** to the schema (like "hello", "how are you", etc), respond like a helpful assistant and give proper,polite answer based on the question like .
If the question **is relevant**, output only the SQL query — no explanations, comments, or extra words.
Schema:
Table: ${table}
Columns: ${columns}
SQL Guidelines:
- Do **NOT** use SELECT * unless the user says "all details", "everything", or "all data".
- If the question involves product/item, include those columns **with customer_name**.
- If the question refers to price (→ revenue) or stock (→ quantity), include those columns **with product**.
- For unique values:
  • "countries" → SELECT DISTINCT country
  • "products" → SELECT DISTINCT product
- Use LIKE '%term%' for fuzzy matches on product names (e.g., "after nines").
- For multiple product revenues → SUM(revenue), GROUP BY product.
- For total quantity of a product → SUM(quantity), WHERE product LIKE '%term%'.
- **Strict Rule**: Never add WHERE/AND filters unless explicitly mentioned in the question.
- No assumptions — follow input exactly.
ONLY output valid SQL if the question clearly maps to the schema. Otherwise, respond as a friendly assistant.

User Question: ${question}
`;










  console.log("Prompt:", prompt);

  const response = await together.chat.completions.create({
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content.trim();
}

export default generateSQL;
