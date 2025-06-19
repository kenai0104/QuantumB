import express from "express";
import generateSQL from "../openai/helper.js";
import db from "../config/db.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  const { question } = req.body;
  console.log("question", question);

  if (!question || typeof question !== "string") {
    return res
      .status(400)
      .json({ error: "Question is required and must be a string." });
  }

  try {
    const sqlOrReply = await generateSQL(question);
    console.log("Generated SQL Query:", sqlOrReply);

     const isSQL = /^\s*(SELECT|INSERT|UPDATE|DELETE)\b/i.test(sqlOrReply.trim());


    if (!isSQL) {
      // It's a generic natural language response
      return res.json({ response: sqlOrReply });
    }

    const [queryResult] = await db.query(sqlOrReply);


    return res.json({ result: queryResult });
  } catch (error) {
    console.error("Error processing request:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the query." });
  }
});

export default router;
