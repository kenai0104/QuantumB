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

const prompt = `You are an expert in SQL. Based on the user's natural language question and the provided database schema, generate the most relevant SQL query. 
Your job is to understand the user's intent, map it to the correct columns, and write a clean and efficient SQL query.

Schema:
Table: ${table}
Columns: ${columns}

Guidelines:
- Do NOT use SELECT * unless the user explicitly says "all details", "everything", or "all data".
- If the question refers to specific data like product or , include those columns **along with the customer_name** in the SELECT clause.
- If the question refers to specific data like **price (→ revenue)** or **stock (→ quantity)**, include the corresponding columns **along with product** in the SELECT clause.
- If the question asks for a list of unique entities like:
  • "countries" → return DISTINCT country  
  • "products" → return DISTINCT product  

  → Apply LIKE '%keyword%' on the relevant column:
     • Use LIKE on \`product\` if it's a product-related keyword (e.g., "after nines").
  
  → NEVER split keywords across unrelated columns.
- Use '<', '>', or '=' only for numeric comparisons or fully specific values.
- If the question is about **counting** or **aggregating** data, use COUNT() or SUM() as appropriate.
- **STRICT RULE: DO NOT add ANY WHERE, AND, or other filtering conditions unless the user's question clearly and explicitly mentions a filter (such as a Supplier, Category, Warehouse name, or numeric constraint). If not clearly mentioned, leave out the WHERE clause completely.**
- If the user provides a phrase such as "after nines", treat it as a single descriptive term and match it using LIKE '%after nines%' in product only.
- Do not include explanations, assumptions, or comments — return only valid, clean MySQL syntax.

User Question: ${question}`;










  console.log("Prompt:", prompt);

  const response = await together.chat.completions.create({
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content.trim();
}

export default generateSQL;
