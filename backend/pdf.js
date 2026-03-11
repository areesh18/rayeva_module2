import PDFDocument from "pdfkit";

// ── Design Tokens ──
const COLORS = {
  forestGreen:  "#1a3c2e",
  midGreen:     "#2d6a4f",
  lightGreen:   "#52b788",
  cream:        "#f8f4ed",
  warmGray:     "#9e9589",
  darkText:     "#1c1c1c",
  bodyText:     "#3d3d3d",
  mutedText:    "#8a8a8a",
  divider:      "#d9e8df",
  accent:       "#74c69d",
};

const FONTS = {
  // pdfkit built-ins — no external font needed
  heading:  "Helvetica-Bold",
  body:     "Helvetica",
  bold:     "Helvetica-Bold",
  oblique:  "Helvetica-Oblique",
};

// ── Helpers ──
const drawHRule = (doc, { y, x1 = 60, x2 = 535, color = COLORS.divider, width = 0.75 } = {}) => {
  doc.moveTo(x1, y ?? doc.y)
     .lineTo(x2, y ?? doc.y)
     .strokeColor(color)
     .lineWidth(width)
     .stroke();
};

const sectionLabel = (doc, text) => {
  doc.font(FONTS.body)
     .fontSize(7.5)
     .fillColor(COLORS.lightGreen)
     .text(text.toUpperCase(), { characterSpacing: 2.5 });
  doc.moveDown(0.5);
};

const formatINR = (n) => `Rs. ${Number(n).toLocaleString("en-IN")}`;

// ── Main Export ──
export const generatePDF = (proposal, res) => {
  const doc = new PDFDocument({ margin: 60, size: "A4", bufferPages: true });
  const { proposal_json: p } = proposal;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=rayeva_proposal_${proposal.id}.pdf`
  );
  doc.pipe(res);

  // ════════════════════════════════════════
  // HEADER BLOCK
  // ════════════════════════════════════════

  // Top accent bar
  doc.rect(0, 0, 595, 6).fill(COLORS.midGreen);

  doc.moveDown(1.2);

  // Brand name
  doc.font(FONTS.heading)
     .fontSize(28)
     .fillColor(COLORS.forestGreen)
     .text("RAYEVA", { align: "center", characterSpacing: 6 });

  doc.font(FONTS.body)
     .fontSize(9)
     .fillColor(COLORS.warmGray)
     .text("Sustainable B2B Proposal", { align: "center", characterSpacing: 1.5 });

  doc.moveDown(0.5);

  doc.font(FONTS.body)
     .fontSize(8.5)
     .fillColor(COLORS.mutedText)
     .text(
       `Prepared for ${proposal.client_name}  ·  ${new Date(proposal.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
       { align: "center" }
     );

  doc.moveDown(1.2);
  drawHRule(doc, { color: COLORS.midGreen, width: 1 });
  doc.moveDown(1.4);

  // ════════════════════════════════════════
  // CLIENT DETAILS
  // ════════════════════════════════════════

  sectionLabel(doc, "Client Overview");

  const details = [
    ["Company",       proposal.client_name],
    ["Email",         proposal.client_email],
    ["Business Type", proposal.business_type.charAt(0).toUpperCase() + proposal.business_type.slice(1)],
    ["Headcount",     `${proposal.headcount} people`],
    ["Budget",        formatINR(proposal.budget)],
    ["Priorities",    proposal.priorities.join("  ·  ")],
  ];
  if (proposal.additional_notes) {
    details.push(["Notes", proposal.additional_notes]);
  }

  const colLabel = 60;
  const colValue = 200;

  details.forEach(([label, value]) => {
    const startY = doc.y;
    doc.font(FONTS.body)
       .fontSize(8)
       .fillColor(COLORS.warmGray)
       .text(label, colLabel, startY, { width: 130 });
    doc.font(FONTS.body)
       .fontSize(9.5)
       .fillColor(COLORS.darkText)
       .text(value, colValue, startY, { width: 335 });
    doc.moveDown(0.55);
  });

  doc.moveDown(0.8);
  drawHRule(doc);
  doc.moveDown(1.4);

  // ════════════════════════════════════════
  // PROPOSAL NARRATIVE
  // ════════════════════════════════════════

  sectionLabel(doc, "Our Pitch");

  doc.font(FONTS.oblique)
     .fontSize(11)
     .fillColor(COLORS.bodyText)
     .text(`"${p.proposalNarrative}"`, {
       align: "justify",
       lineGap: 5,
       indent: 0,
     });

  doc.moveDown(1.4);
  drawHRule(doc);
  doc.moveDown(1.4);

  // ════════════════════════════════════════
  // RECOMMENDED PRODUCTS
  // ════════════════════════════════════════

  sectionLabel(doc, "Recommended Products");

  p.allocations.forEach((allocation, i) => {
    // Category row
    doc.font(FONTS.bold)
       .fontSize(10)
       .fillColor(COLORS.midGreen)
       .text(allocation.category, { continued: true });

    doc.font(FONTS.body)
       .fontSize(8.5)
       .fillColor(COLORS.warmGray)
       .text(`   ${allocation.budgetPercent}% of budget`);

    doc.moveDown(0.5);

    allocation.products.forEach((product) => {
      // Product name + subtotal on same line
      const rowY = doc.y;

      doc.font(FONTS.bold)
         .fontSize(9.5)
         .fillColor(COLORS.darkText)
         .text(product.name, 60, rowY, { width: 320 });

      doc.font(FONTS.bold)
         .fontSize(9.5)
         .fillColor(COLORS.midGreen)
         .text(formatINR(product.subtotal), 380, rowY, { width: 155, align: "right" });

      doc.moveDown(0.25);

      // Qty line
      doc.font(FONTS.body)
         .fontSize(8.5)
         .fillColor(COLORS.warmGray)
         .text(`Qty ${product.quantity}  ×  Rs. ${product.unitPrice}`);

      doc.moveDown(0.2);

      // Reason
      doc.font(FONTS.oblique)
         .fontSize(8.5)
         .fillColor(COLORS.mutedText)
         .text(product.reason, { lineGap: 2 });

      doc.moveDown(0.6);
    });

    // Thin divider between categories (not after last)
    if (i < p.allocations.length - 1) {
      drawHRule(doc, { color: COLORS.divider, width: 0.4 });
      doc.moveDown(0.8);
    }
  });

  doc.moveDown(0.6);
  drawHRule(doc);
  doc.moveDown(1.4);

  // ════════════════════════════════════════
  // COST SUMMARY
  // ════════════════════════════════════════

  sectionLabel(doc, "Cost Summary");

  const costRows = [
    ["Total Budget",  formatINR(p.totalBudget),                         false],
    ["Total Cost",    formatINR(p.totalCost),                           false],
    ["Savings",       formatINR(p.totalBudget - p.totalCost),           true],
  ];

  costRows.forEach(([label, value, highlight]) => {
    const rowY = doc.y;
    doc.font(highlight ? FONTS.bold : FONTS.body)
       .fontSize(9.5)
       .fillColor(highlight ? COLORS.midGreen : COLORS.bodyText)
       .text(label, 60, rowY, { width: 300 });
    doc.font(highlight ? FONTS.bold : FONTS.body)
       .fontSize(9.5)
       .fillColor(highlight ? COLORS.midGreen : COLORS.darkText)
       .text(value, 380, rowY, { width: 155, align: "right" });
    doc.moveDown(highlight ? 0.5 : 0.45);
  });

  doc.moveDown(0.8);
  drawHRule(doc);
  doc.moveDown(1.4);

  // ════════════════════════════════════════
  // ENVIRONMENTAL IMPACT
  // ════════════════════════════════════════

  sectionLabel(doc, "Environmental Impact");

  // Green tinted background block
  const impactBoxY = doc.y;
  const impactText = p.impactSummary;
  const impactHeight = 70;

  doc.rect(60, impactBoxY, 475, impactHeight)
     .fill("#eaf4ee");

  doc.font(FONTS.body)
     .fontSize(9.5)
     .fillColor(COLORS.forestGreen)
     .text(impactText, 75, impactBoxY + 14, {
       width: 445,
       lineGap: 4,
       align: "justify",
     });

  doc.y = impactBoxY + impactHeight + 16;
  doc.moveDown(1.5);

  // ════════════════════════════════════════
  // FOOTER
  // ════════════════════════════════════════

  drawHRule(doc, { color: COLORS.midGreen, width: 1 });
  doc.moveDown(0.6);

  doc.font(FONTS.body)
     .fontSize(7.5)
     .fillColor(COLORS.warmGray)
     .text("Powered by Rayeva  ·  India's First Sustainable Marketplace  ·  rayeva.com", {
       align: "center",
       characterSpacing: 0.5,
     });

  // Bottom accent bar
  const pageHeight = doc.page.height;
  doc.rect(0, pageHeight - 6, 595, 6).fill(COLORS.midGreen);

  doc.end();
};