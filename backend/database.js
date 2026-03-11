import { supabase } from "./supabase.js";

export const saveProposal = async (clientInputs, proposalJson) => {
  const { data, error } = await supabase
    .from("proposals")
    .insert([
      {
        client_name: clientInputs.clientName,
        client_email: clientInputs.clientEmail,
        business_type: clientInputs.businessType,
        headcount: clientInputs.headcount,
        budget: clientInputs.budget,
        priorities: clientInputs.priorities,
        additional_notes: clientInputs.additionalNotes || null,
        proposal_json: proposalJson,
        status: "draft",
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Failed to save proposal: ${error.message}`);
  return data;
};

export const getMockProducts = async () => {
  const { data, error } = await supabase
    .from("mock_products")
    .select("*")
    .eq("in_stock", true);

  if (error) throw new Error(`Failed to fetch products: ${error.message}`);
  return data;
};