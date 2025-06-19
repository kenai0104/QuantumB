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

const prompt = `You are an expert in SQL and natural language understanding. Based on the user's natural language question and the provided database schema, your goal is to generate a clean, efficient SQL query **only if** the user's question is clearly related to the database.

If the question is **generic**, **chit-chat**, **personal**, or **not relevant** to the given table or columns, do NOT return a SQL query. Instead, respond briefly as a helpful human assistant would (e.g., “I'm doing well, thank you!” or “I'm here to help you with database questions.”).

Schema:
Table: ${table}
Columns: ${columns}

Guidelines for SQL generation:
- Do NOT use SELECT * unless the user explicitly says "all details", "everything", or "all data".
- If the question refers to specific data like product or item, include those columns **along with customer_name** in the SELECT clause.
- If the question refers to price (→ revenue) or stock (→ quantity), include those columns **along with product** in the SELECT clause.
- For lists of unique entities like:
  • "countries" → return DISTINCT country  
  • "products" → return DISTINCT product  

- Use LIKE '%keyword%' for product-related keywords such as "after nines".
- For product revenue (e.g., “revenue of Eclairs and After Nines”), return SUM(revenue) grouped by product.
- For total quantity of a product, return SUM(quantity) WHERE product LIKE '%term%'.

**Strict rule**:
- DO NOT include any WHERE/AND or filters unless explicitly mentioned.
- DO NOT add assumptions or filters based on intuition — follow the user input exactly.

ONLY output valid SQL if the question directly relates to the schema. Otherwise, reply as a friendly assistant.
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
