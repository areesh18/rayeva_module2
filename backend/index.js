import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateProposal } from "./gemini.js";
import { saveProposal, getMockProducts } from "./database.js";
import { logInteraction } from "./logger.js";
import { generatePDF } from "./pdf.js";
import { supabase } from "./supabase.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", module: "AI B2B Proposal Generator" });
});

// Generate proposal
app.post("/generate", async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      businessType,
      headcount,
      budget,
      priorities,
      additionalNotes,
    } = req.body;

    // Basic validation
    if (
      !clientName ||
      !clientEmail ||
      !businessType ||
      !headcount ||
      !budget ||
      !priorities
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Fetch mock products from DB
    const products = await getMockProducts();
    if (!products.length) {
      return res
        .status(500)
        .json({ error: "No products available in catalog." });
    }

    // Generate proposal via Gemini
    const { result: proposalJson, prompt } = await generateProposal(
      req.body,
      products,
    );

    // Save proposal to DB
    const saved = await saveProposal(req.body, proposalJson);

    // Log the interaction
    await logInteraction(saved.id, prompt, proposalJson);

    res.json({ success: true, proposal: saved });
  } catch (error) {
    console.error("Error in /generate:", error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// Download proposal as PDF
app.get("/proposal/:id/pdf", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Proposal not found." });
    }

    generatePDF(data, res);
  } catch (error) {
    console.error("Error in /proposal/:id/pdf:", error.message);
    res.status(500).json({ error: "Failed to generate PDF." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
