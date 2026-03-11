import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProposalForm from "./pages/ProposalForm";
import ProposalResult from "./pages/ProposalResult";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProposalForm />} />
        <Route path="/result" element={<ProposalResult />} />
      </Routes>
    </BrowserRouter>
  );
}