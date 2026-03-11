import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

export const generateProposal = async (clientInputs, products) => {
  const prompt = `
    You are a B2B sales AI for Rayeva, India's first sustainable marketplace.

    A business client wants a customized sustainable product proposal.

    Client Details:
    - Name: ${clientInputs.clientName}
    - Business Type: ${clientInputs.businessType}
    - Number of People: ${clientInputs.headcount}
    - Total Budget: ₹${clientInputs.budget}
    - Priority Categories: ${clientInputs.priorities.join(", ")}
    - Additional Notes: ${clientInputs.additionalNotes || "None"}

    Available Products (choose from ONLY these):
    ${JSON.stringify(products, null, 2)}

    Instructions:
    - Select the most suitable products based on business type, headcount, and priorities
    - Allocate budget wisely across categories, do not exceed total budget
    - For each product, suggest a realistic quantity based on headcount
    - Write a compelling impactSummary (2-3 sentences) about environmental impact
    - Write a proposalNarrative (3-4 sentences) as a personalized pitch to the client

    Return ONLY a JSON object with exactly this structure:
    {
      "clientName": "string",
      "businessType": "string",
      "headcount": number,
      "totalBudget": number,
      "allocations": [
        {
          "category": "string",
          "budgetPercent": number,
          "products": [
            {
              "productId": "string",
              "name": "string",
              "quantity": number,
              "unitPrice": number,
              "subtotal": number,
              "reason": "string"
            }
          ]
        }
      ],
      "totalCost": number,
      "impactSummary": "string",
      "proposalNarrative": "string"
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const parsed = JSON.parse(response.text());

  return { result: parsed, prompt };
};