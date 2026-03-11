import { useLocation, useNavigate } from "react-router-dom";
import { downloadProposal } from "../services/api";

export default function ProposalResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const proposal = state?.proposal;

  if (!proposal) {
    navigate("/");
    return null;
  }

  const p = proposal.proposal_json;

  const handleDownload = async () => {
    try {
      const res = await downloadProposal(proposal.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `rayeva_proposal_${proposal.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download PDF. Please try again.",err);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h1 className="text-3xl font-bold text-green-900">Rayeva</h1>
          <p className="text-green-700 text-sm mt-1">Your Sustainable B2B Proposal is Ready</p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={handleDownload}
              className="bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all"
            >
              Download PDF
            </button>
            <button
              onClick={() => navigate("/")}
              className="border border-green-700 text-green-700 hover:bg-green-50 text-sm font-semibold px-6 py-2.5 rounded-lg transition-all"
            >
              New Proposal
            </button>
          </div>
        </div>

        {/* Client Details */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-4">Client Details</h2>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            {[
              ["Company", proposal.client_name],
              ["Email", proposal.client_email],
              ["Business Type", proposal.business_type],
              ["Headcount", `${proposal.headcount} people`],
              ["Budget", `Rs. ${proposal.budget.toLocaleString("en-IN")}`],
              ["Priorities", proposal.priorities.join(", ")],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
                <p className="text-gray-800 font-medium mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Proposal Narrative */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-3">Our Pitch</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{p.proposalNarrative}</p>
        </div>

        {/* Product Allocations */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-5">Recommended Products</h2>
          <div className="space-y-6">
            {p.allocations.map((allocation) => (
              <div key={allocation.category}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-green-800">{allocation.category}</h3>
                  <span className="text-xs text-gray-400 bg-green-50 px-2 py-1 rounded-full">
                    {allocation.budgetPercent}% of budget
                  </span>
                </div>
                <div className="space-y-3">
                  {allocation.products.map((product) => (
                    <div key={product.productId} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                        <p className="text-sm font-semibold text-green-700">
                          Rs. {product.subtotal.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Qty: {product.quantity} × Rs. {product.unitPrice}
                      </p>
                      <p className="text-xs text-gray-500 mt-1.5 italic">{product.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-4">Cost Summary</h2>
          <div className="space-y-2 text-sm">
            {[
              ["Total Budget", `Rs. ${p.totalBudget.toLocaleString("en-IN")}`, "text-gray-700"],
              ["Total Cost", `Rs. ${p.totalCost.toLocaleString("en-IN")}`, "text-gray-700"],
              ["Savings", `Rs. ${(p.totalBudget - p.totalCost).toLocaleString("en-IN")}`, "text-green-700 font-semibold"],
            ].map(([label, value, cls]) => (
              <div key={label} className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">{label}</span>
                <span className={cls}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Summary */}
        <div className="bg-green-700 rounded-2xl shadow p-6 text-white">
          <h2 className="text-lg font-semibold mb-3">Environmental Impact</h2>
          <p className="text-sm leading-relaxed text-green-100">{p.impactSummary}</p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Powered by Rayeva – India's First Sustainable Marketplace
        </p>

      </div>
    </div>
  );
}