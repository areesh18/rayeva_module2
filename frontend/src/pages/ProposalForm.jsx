import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateProposal } from "../services/api";

const CATEGORIES = [
  "Office Supplies",
  "Kitchen & Pantry",
  "Hygiene & Personal Care",
  "Packaging & Shipping Materials",
];

const BUSINESS_TYPES = ["office", "hotel", "school", "restaurant", "other"];

export default function ProposalForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    businessType: "office",
    headcount: "",
    budget: "",
    priorities: [],
    additionalNotes: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePriority = (category) => {
    setForm((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(category)
        ? prev.priorities.filter((p) => p !== category)
        : [...prev.priorities, category],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.priorities.length === 0) {
      setError("Please select at least one priority category.");
      return;
    }

    setLoading(true);
    try {
      const res = await generateProposal({
        ...form,
        headcount: parseInt(form.headcount),
        budget: parseFloat(form.budget),
      });
      navigate("/result", { state: { proposal: res.data.proposal } });
    } catch (err) {
      setError("Something went wrong. Please try again.",err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-green-900">Rayeva</h1>
          <p className="text-green-700 mt-1 text-sm">B2B Sustainable Proposal Generator</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              required
              placeholder="e.g. GreenDesk Co"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="clientEmail"
              value={form.clientEmail}
              onChange={handleChange}
              required
              placeholder="e.g. hello@company.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
            <select
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Headcount + Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Headcount</label>
              <input
                type="number"
                name="headcount"
                value={form.headcount}
                onChange={handleChange}
                required
                min="1"
                placeholder="e.g. 25"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (Rs.)</label>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                required
                min="1"
                placeholder="e.g. 15000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Priorities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority Categories</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handlePriority(cat)}
                  className={`text-sm px-3 py-2 rounded-lg border transition-all ${
                    form.priorities.includes(cat)
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes <span className="text-gray-400">(optional)</span></label>
            <textarea
              name="additionalNotes"
              value={form.additionalNotes}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. We want to eliminate all single-use plastic..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            />
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-60"
          >
            {loading ? "Generating Proposal..." : "Generate Proposal"}
          </button>

        </form>
      </div>
    </div>
  );
}