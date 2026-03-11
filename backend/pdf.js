import PDFDocument from "pdfkit";

export const generatePDF = (proposal, res) => {
  const doc = new PDFDocument({ margin: 50 });
  const { proposal_json: p } = proposal;

  // Set response headers for download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=proposal_${proposal.id}.pdf`
  );
  doc.pipe(res);

  // ── Header ──
  doc
    .fontSize(20)
    .fillColor("#2d6a4f")
    .text("Rayeva – Sustainable B2B Proposal", { align: "center" });
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .fillColor("#555")
    .text(`Generated on: ${new Date(proposal.created_at).toLocaleDateString("en-IN")}`, { align: "center" });
  doc.moveDown(1);

  // ── Client Info ──
  doc.fontSize(14).fillColor("#1b4332").text("Client Details", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#333")
    .text(`Name: ${proposal.client_name}`)
    .text(`Email: ${proposal.client_email}`)
    .text(`Business Type: ${proposal.business_type}`)
    .text(`Headcount: ${proposal.headcount}`)
    .text(`Budget: Rs.${proposal.budget.toLocaleString("en-IN")}`)
    .text(`Priorities: ${proposal.priorities.join(", ")}`);

  if (proposal.additional_notes) {
    doc.text(`Notes: ${proposal.additional_notes}`);
  }
  doc.moveDown(1);

  // ── Proposal Narrative ──
  doc.fontSize(14).fillColor("#1b4332").text("Our Pitch", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#333").text(p.proposalNarrative, { align: "justify" });
  doc.moveDown(1);

  // ── Product Allocations ──
  doc.fontSize(14).fillColor("#1b4332").text("Recommended Products", { underline: true });
  doc.moveDown(0.5);

  p.allocations.forEach((allocation) => {
    doc.fontSize(12).fillColor("#2d6a4f").text(`${allocation.category} (${allocation.budgetPercent}% of budget)`);
    doc.moveDown(0.3);

    allocation.products.forEach((product) => {
      doc.fontSize(11).fillColor("#333")
        .text(`• ${product.name}`, { continued: false })
        .fontSize(10).fillColor("#555")
        .text(`  Qty: ${product.quantity} × Rs.${product.unitPrice} = Rs.${product.subtotal.toLocaleString("en-IN")}`)
        .text(`  Why: ${product.reason}`);
      doc.moveDown(0.3);
    });

    doc.moveDown(0.5);
  });

  // ── Cost Summary ──
  doc.fontSize(14).fillColor("#1b4332").text("Cost Summary", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#333")
    .text(`Total Budget:  Rs.${p.totalBudget.toLocaleString("en-IN")}`)
    .text(`Total Cost:    Rs.${p.totalCost.toLocaleString("en-IN")}`)
    .text(`Savings:       Rs.${(p.totalBudget - p.totalCost).toLocaleString("en-IN")}`);
  doc.moveDown(1);

  // ── Impact Summary ──
  doc.fontSize(14).fillColor("#1b4332").text("Environmental Impact", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#333").text(p.impactSummary, { align: "justify" });
  doc.moveDown(1);

  // ── Footer ──
  doc.fontSize(10).fillColor("#aaa").text("Powered by Rayeva – India's First Sustainable Marketplace", { align: "center" });

  doc.end();
};