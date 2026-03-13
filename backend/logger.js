import { supabase } from "./supabase.js";

export const logInteraction = async (proposalId, prompt, response) => {
  const { error } = await supabase.from("proposal_logs").insert([
    {
      proposal_id: proposalId,
      prompt_sent: prompt,
      raw_response: JSON.stringify(response),
      model_used: "gemini-1.5-flash",
    },
  ]);

  if (error) throw new Error(`Log insert failed: ${error.message}`);
};