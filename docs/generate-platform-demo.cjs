const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaWallet, FaGlobe, FaServer, FaShieldAlt, FaRocket, FaChartLine,
  FaUsers, FaStore, FaCreditCard, FaMobileAlt, FaLock, FaCode,
  FaCheckCircle, FaArrowRight, FaDatabase, FaDocker, FaCogs,
  FaMoneyBillWave, FaFileAlt, FaHandshake
} = require("react-icons/fa");

function renderIconSvg(IconComponent, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// Colors
const GREEN = "2D6A4F";
const DARK_GREEN = "1B4332";
const GOLD = "E9B949";
const WHITE = "FFFFFF";
const OFF_WHITE = "F8F9FA";
const LIGHT_GREEN = "D8F3DC";
const CHARCOAL = "2D3436";
const GRAY = "6C757D";
const LIGHT_GRAY = "E9ECEF";

// Fonts
const HEADER_FONT = "Georgia";
const BODY_FONT = "Calibri";

// Helpers
const makeShadow = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.12 });

async function main() {
  // Pre-render icons
  const icons = {
    wallet: await iconToBase64Png(FaWallet, "#FFFFFF"),
    globe: await iconToBase64Png(FaGlobe, "#2D6A4F"),
    server: await iconToBase64Png(FaServer, "#2D6A4F"),
    shield: await iconToBase64Png(FaShieldAlt, "#2D6A4F"),
    rocket: await iconToBase64Png(FaRocket, "#E9B949"),
    chart: await iconToBase64Png(FaChartLine, "#2D6A4F"),
    users: await iconToBase64Png(FaUsers, "#FFFFFF"),
    store: await iconToBase64Png(FaStore, "#FFFFFF"),
    card: await iconToBase64Png(FaCreditCard, "#FFFFFF"),
    mobile: await iconToBase64Png(FaMobileAlt, "#FFFFFF"),
    lock: await iconToBase64Png(FaLock, "#2D6A4F"),
    code: await iconToBase64Png(FaCode, "#2D6A4F"),
    check: await iconToBase64Png(FaCheckCircle, "#2D6A4F"),
    arrow: await iconToBase64Png(FaArrowRight, "#E9B949"),
    db: await iconToBase64Png(FaDatabase, "#2D6A4F"),
    docker: await iconToBase64Png(FaDocker, "#2D6A4F"),
    cogs: await iconToBase64Png(FaCogs, "#FFFFFF"),
    money: await iconToBase64Png(FaMoneyBillWave, "#2D6A4F"),
    file: await iconToBase64Png(FaFileAlt, "#2D6A4F"),
    handshake: await iconToBase64Png(FaHandshake, "#E9B949"),
    walletGreen: await iconToBase64Png(FaWallet, "#2D6A4F"),
    globeWhite: await iconToBase64Png(FaGlobe, "#FFFFFF"),
    shieldWhite: await iconToBase64Png(FaShieldAlt, "#FFFFFF"),
    rocketWhite: await iconToBase64Png(FaRocket, "#FFFFFF"),
    checkGold: await iconToBase64Png(FaCheckCircle, "#E9B949"),
  };

  let pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "NeoBank / Qsoftwares Ltd";
  pres.title = "NeoBank Digital Banking Platform — Live Demo";

  // ========== SLIDE 1: TITLE ==========
  let s1 = pres.addSlide();
  s1.background = { color: DARK_GREEN };
  // Gold accent bar at top
  s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
  // Wallet icon
  s1.addImage({ data: icons.wallet, x: 0.8, y: 1.2, w: 0.7, h: 0.7 });
  s1.addText("NeoBank", { x: 1.6, y: 1.2, w: 4, h: 0.7, fontSize: 28, fontFace: HEADER_FONT, color: WHITE, bold: true, valign: "middle", margin: 0 });
  // Main title
  s1.addText("Digital Banking Platform", { x: 0.8, y: 2.2, w: 8, h: 1.0, fontSize: 40, fontFace: HEADER_FONT, color: WHITE, bold: true, margin: 0 });
  s1.addText("Live Demo", { x: 0.8, y: 3.1, w: 4, h: 0.7, fontSize: 36, fontFace: HEADER_FONT, color: GOLD, bold: true, margin: 0 });
  // Subtitle
  s1.addText("Prepared for Qsoftwares Ltd", { x: 0.8, y: 4.0, w: 6, h: 0.5, fontSize: 18, fontFace: BODY_FONT, color: WHITE, margin: 0 });
  s1.addText("April 2026", { x: 0.8, y: 4.5, w: 3, h: 0.4, fontSize: 14, fontFace: BODY_FONT, color: GOLD, margin: 0 });
  // Bottom gold bar
  s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });

  // ========== SLIDE 2: PLATFORM OVERVIEW ==========
  let s2 = pres.addSlide();
  s2.background = { color: OFF_WHITE };
  // Green header bar
  s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: GREEN } });
  s2.addText("Platform Overview", { x: 0.8, y: 0.15, w: 8, h: 0.7, fontSize: 28, fontFace: HEADER_FONT, color: WHITE, bold: true, margin: 0 });

  // Stat cards row
  const stats = [
    { num: "76", label: "Pages Built", color: GREEN },
    { num: "30", label: "Wired to API", color: DARK_GREEN },
    { num: "3", label: "Live URLs", color: GREEN },
    { num: "9", label: "Payment Providers", color: DARK_GREEN },
  ];
  stats.forEach((st, i) => {
    const cx = 0.5 + i * 2.35;
    s2.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.3, w: 2.1, h: 1.1, fill: { color: WHITE }, shadow: makeShadow() });
    s2.addText(st.num, { x: cx, y: 1.35, w: 2.1, h: 0.6, fontSize: 32, fontFace: HEADER_FONT, color: st.color, bold: true, align: "center", valign: "middle", margin: 0 });
    s2.addText(st.label, { x: cx, y: 1.9, w: 2.1, h: 0.4, fontSize: 11, fontFace: BODY_FONT, color: GRAY, align: "center", valign: "middle", margin: 0 });
  });

  // Bullet points
  const overviewItems = [
    "Next-gen digital banking for Kenya & East Africa",
    "Built on Apache Fineract core banking engine (Java 21 + Spring Boot)",
    "76-page consumer + admin + merchant prototype (Savanna design system)",
    "30-page app wired to live Fineract API with Live/Demo badges",
    "Deep forest green + warm gold design language",
  ];
  s2.addText(overviewItems.map((t, i) => ({
    text: t,
    options: { bullet: true, breakLine: i < overviewItems.length - 1, fontSize: 14, fontFace: BODY_FONT, color: CHARCOAL, paraSpaceAfter: 6 }
  })), { x: 0.8, y: 2.7, w: 8.4, h: 2.7 });

  // ========== SLIDE 3: LIVE URLs ==========
  let s3 = pres.addSlide();
  s3.background = { color: DARK_GREEN };
  s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
  s3.addImage({ data: icons.globeWhite, x: 0.8, y: 0.4, w: 0.4, h: 0.4 });
  s3.addText("Live URLs", { x: 1.35, y: 0.35, w: 5, h: 0.5, fontSize: 28, fontFace: HEADER_FONT, color: WHITE, bold: true, margin: 0 });

  const urls = [
    { url: "https://pro.fineract.us", desc: "Full 76-page prototype (Savanna design system)", badge: "PROTOTYPE" },
    { url: "https://neo.fineract.us", desc: "30-page app wired to Fineract API (Live/Demo badges)", badge: "WIRED APP" },
    { url: "https://api.fineract.us", desc: "Apache Fineract REST API (PostgreSQL backend)", badge: "API" },
  ];
  urls.forEach((u, i) => {
    const cy = 1.2 + i * 1.3;
    s3.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: cy, w: 8.4, h: 1.05, fill: { color: "1B4332" } });
    // Badge
    s3.addShape(pres.shapes.RECTANGLE, { x: 1.1, y: cy + 0.15, w: 1.3, h: 0.3, fill: { color: GOLD } });
    s3.addText(u.badge, { x: 1.1, y: cy + 0.15, w: 1.3, h: 0.3, fontSize: 9, fontFace: BODY_FONT, color: DARK_GREEN, bold: true, align: "center", valign: "middle", margin: 0 });
    // URL
    s3.addText(u.url, { x: 2.6, y: cy + 0.1, w: 6, h: 0.35, fontSize: 16, fontFace: BODY_FONT, color: GOLD, bold: true, margin: 0 });
    // Description
    s3.addText(u.desc, { x: 2.6, y: cy + 0.5, w: 6, h: 0.35, fontSize: 12, fontFace: BODY_FONT, color: "B7E4C7", margin: 0 });
  });

  // Footer note
  s3.addText("All sites: HTTPS/SSL, nginx reverse proxy, Docker deployment on Hostinger VPS", {
    x: 0.8, y: 4.8, w: 8.4, h: 0.4, fontSize: 11, fontFace: BODY_FONT, color: "95D5B2", italic: true, margin: 0
  });
  s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });

  // ========== SLIDE 4: CONSUMER FEATURES ==========
  let s4 = pres.addSlide();
  s4.background = { color: OFF_WHITE };
  s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: GREEN } });
  s4.addText("Feature Modules — Consumer", { x: 0.8, y: 0.15, w: 8, h: 0.7, fontSize: 28, fontFace: HEADER_FONT, color: WHITE, bold: true, margin: 0 });

  const consumerFeatures = [
    { title: "Auth & KYC", items: "Phone login (+254), 4-step registration, 5-step KYC verification", icon: icons.lock },
    { title: "Accounts", items: "Multi-currency (KES/USD), transaction history, statements, search", icon: icons.walletGreen },
    { title: "Cards", items: "Virtual Visa + Physical Mastercard, freeze/limits/PIN, issuance pipeline", icon: icons.money },
    { title: "Payments", items: "P2P send, M-Pesa, cross-border EAC, bill pay, QR, RTGS/EFT, reversals", icon: icons.globe },
    { title: "Loans", items: "Apply flow, amortization schedule, active loan tracking", icon: icons.chart },
    { title: "Savings", items: "Goals with progress rings, fixed deposits, chama groups, budgets", icon: icons.db },
  ];
  consumerFeatures.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.5 + col * 4.7;
    const cy = 1.25 + row * 1.35;
    s4.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 4.4, h: 1.15, fill: { color: WHITE }, shadow: makeShadow() });
    // Green left accent
    s4.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 0.06, h: 1.15, fill: { color: GREEN } });
    s4.addImage({ data: f.icon, x: cx + 0.25, y: cy + 0.15, w: 0.35, h: 0.35 });
    s4.addText(f.title, { x: cx + 0.7, y: cy + 0.1, w: 3.4, h: 0.35, fontSize: 13, fontFace: BODY_FONT, color: GREEN, bold: true, margin: 0 });
    s4.addText(f.items, { x: cx + 0.7, y: cy + 0.5, w: 3.4, h: 0.55, fontSize: 10, fontFace: BODY_FONT, color: GRAY, margin: 0 });
  });

  // ========== SLIDE 5: MERCHANT + ADMIN ==========
  let s5 = pres.addSlide();
  s5.background = { color: OFF_WHITE };
  s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: GREEN } });
  s5.addText("Feature Modules — Merchant & Admin", { x: 0.8, y: 0.15, w: 8, h: 0.7, fontSize: 28, fontFace: HEADER_FONT, color: WHITE, bold: true, margin: 0 });

  // Left column: Merchant
  s5.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.25, w: 4.3, h: 4.0, fill: { color: WHITE }, shadow: makeShadow() });
  s5.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.25, w: 4.3, h: 0.5, fill: { color: DARK_GREEN } });
  s5.addImage({ data: icons.store, x: 0.7, y: 1.3, w: 0.35, h: 0.35 });
  s5.addText("Merchant Portal", { x: 1.15, y: 1.25, w: 3, h: 0.5, fontSize: 15, fontFace: BODY_FONT, color: WHITE, bold: true, valign: "middle", margin: 0 });

  const merchantItems = [
    "Dashboard with revenue stats & hourly chart",
    "POS terminal management & fleet tracking",
    "SoftPOS / Tap-to-Phone (key differentiator)",
    "Bluetooth POS (PAX/Sunmi/Ingenico)",
    "Settlements & instant settlement engine",
    "Merchant onboarding (5-step flow)",
    "Payment links & invoice generation",
  ];
  s5.addText(merchantItems.map((t, i) => ({
    text: t,
    options: { bullet: true, breakLine: i < merchantItems.length - 1, fontSize: 10.5, fontFace: BODY_FONT, color: CHARCOAL, paraSpaceAfter: 4 }
  })), { x: 0.8, y: 1.9, w: 3.7, h: 3.2 });

  // Right column: Admin
  s5.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.25, w: 4.3, h: 4.0, fill: { color: WHITE }, shadow: makeShadow() });
  s5.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.25, w: 4.3, h: 0.5, fill: { color: DARK_GREEN } });
  s5.addImage({ data: icons.cogs, x: 5.4, y: 1.3, w: 0.35, h: 0.35 });
  s5.addText("Admin Console", { x: 5.85, y: 1.25, w: 3, h: 0.5, fontSize: 15, fontFace: BODY_FONT, color: WHITE, bold: true, valign: "middle", margin: 0 });

  const adminItems = [
    "KPIs, user management, KYC review queue",
    "Transaction monitoring & fraud detection (ML)",
    "AML/CFT screening, regulatory reporting",
    "Shadow ledger & event sourcing",
    "EOD balancing, multi-currency reconciliation",
    "Payment orchestration & circuit breakers",
    "Incident response, audit log, API security",
  ];
  s5.addText(adminItems.map((t, i) => ({
    text: t,
    options: { bullet: true, breakLine: i < adminItems.length - 1, fontSize: 10.5, fontFace: BODY_FONT, color: CHARCOAL, paraSpaceAfter: 4 }
  })), { x: 5.5, y: 1.9, w: 3.7, h: 3.2 });

  // ========== SLIDE 6: BACKEND ARCHITECTURE ==========
  let s6 = pres.addSlide();
  s6.background = { color: DARK_GREEN };
  s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
  s6.addImage({ data: icons.shieldWhite, x: 0.8, y: 0.4, w: 0.4, h: 0.4 });
  s6.addText("Backend Architecture", { x: 1.35, y: 0.35, w: 5, h: 0.5, fontSize: 28, fontFace: HEADER_FONT, color: WHITE, bold: true, margin: 0 });

  // Architecture boxes
  const archBoxes = [
    { title: "Core Engine", desc: "Apache Fineract\nJava 21 + Spring Boot", x: 0.5, y: 1.2 },
    { title: "Database", desc: "PostgreSQL 16\nLiquibase migrations", x: 3.5, y: 1.2 },
    { title: "Deployment", desc: "Docker Compose\nHostinger VPS", x: 6.5, y: 1.2 },
  ];
  archBoxes.forEach(b => {
    s6.addShape(pres.shapes.RECTANGLE, { x: b.x, y: b.y, w: 2.7, h: 1.1, fill: { color: "1B4332" } });
    s6.addShape(pres.shapes.RECTANGLE, { x: b.x, y: b.y, w: 2.7, h: 0.04, fill: { color: GOLD } });
    s6.addText(b.title, { x: b.x, y: b.y + 0.1, w: 2.7, h: 0.35, fontSize: 13, fontFace: BODY_FONT, color: GOLD, bold: true, align: "center", margin: 0 });
    s6.addText(b.desc, { x: b.x, y: b.y + 0.45, w: 2.7, h: 0.55, fontSize: 10, fontFace: BODY_FONT, color: "B7E4C7", align: "center", margin: 0 });
  });

  // Custom module section
  s6.addText("Custom NeoBank Module", { x: 0.8, y: 2.6, w: 5, h: 0.4, fontSize: 16, fontFace: BODY_FONT, color: GOLD, bold: true, margin: 0 });

  const modules = [
    "M-Pesa Integration", "KYC / Smile ID", "Card Management",
    "Merchant Services", "AML Screening", "Auth & OTP",
    "Bill Payments", "Savings Goals", "Notifications"
  ];
  modules.forEach((m, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const mx = 0.5 + col * 3.15;
    const my = 3.15 + row * 0.55;
    s6.addShape(pres.shapes.RECTANGLE, { x: mx, y: my, w: 2.9, h: 0.42, fill: { color: "1B4332" } });
    s6.addImage({ data: icons.checkGold, x: mx + 0.1, y: my + 0.08, w: 0.25, h: 0.25 });
    s6.addText(m, { x: mx + 0.4, y: my, w: 2.4, h: 0.42, fontSize: 10, fontFace: BODY_FONT, color: WHITE, valign: "middle", margin: 0 });
  });

  s6.addText("12 unused Fineract modules stripped for lean deployment", {
    x: 0.8, y: 4.95, w: 8, h: 0.35, fontSize: 11, fontFace: BODY_FONT, color: "95D5B2", italic: true, margin: 0
  });
  s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });

  // ========== SLIDE 7: TECHNICAL HIGHLIGHTS ==========
  let s7 = pres.addSlide();
  s7.background = { color: OFF_WHITE };
  s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: GREEN } });
  s7.addText("Technical Highlights", { x: 0.8, y: 0.15, w: 8, h: 0.7, fontSize: 28, fontFace: HEADER_FONT, color: WHITE, bold: true, margin: 0 });

  const techItems = [
    { title: "React 19 + TypeScript 5", desc: "Vite 8 build, Tailwind v4, shadcn/ui components" },
    { title: "useApiQuery Hooks", desc: "Graceful fallback to mock data when API unavailable" },
    { title: "Live/Demo Badges", desc: "Every page shows real-time API connectivity status" },
    { title: "Dark Mode", desc: "Full dark mode with system preference detection" },
    { title: "Mobile Responsive", desc: "Collapsible sidebar, adaptive layouts for all screens" },
    { title: "57+ Screenshots", desc: "Light & dark variants for all pages documented" },
  ];
  techItems.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.5 + col * 4.7;
    const cy = 1.25 + row * 1.35;
    s7.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 4.4, h: 1.15, fill: { color: WHITE }, shadow: makeShadow() });
    s7.addImage({ data: icons.check, x: cx + 0.2, y: cy + 0.15, w: 0.3, h: 0.3 });
    s7.addText(t.title, { x: cx + 0.6, y: cy + 0.1, w: 3.5, h: 0.35, fontSize: 13, fontFace: BODY_FONT, color: GREEN, bold: true, margin: 0 });
    s7.addText(t.desc, { x: cx + 0.6, y: cy + 0.5, w: 3.5, h: 0.5, fontSize: 10.5, fontFace: BODY_FONT, color: GRAY, margin: 0 });
  });

  // ========== SLIDE 8: SECURITY & COMPLIANCE ==========
  let s8 = pres.addSlide();
  s8.background = { color: DARK_GREEN };
  s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
  s8.addImage({ data: icons.shieldWhite, x: 0.8, y: 0.4, w: 0.4, h: 0.4 });
  s8.addText("Security & Compliance", { x: 1.35, y: 0.35, w: 5, h: 0.5, fontSize: 28, fontFace: HEADER_FONT, color: WHITE, bold: true, margin: 0 });

  const secItems = [
    "HTTPS/SSL on all endpoints (Let's Encrypt)",
    "Basic auth to Fineract API (OAuth2 upgrade planned)",
    "CORS properly configured for all frontends",
    "KYC/AML screening stubs ready for Smile ID / Onfido",
    "CBK regulatory compliance framework built in",
    "Data residency considerations for Kenya (ODPC Act)",
    "Consumer protection guidelines (CBK compliance)",
    "Incident response playbooks & notification workflows",
  ];
  secItems.forEach((t, i) => {
    const cy = 1.1 + i * 0.52;
    s8.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: cy, w: 9.0, h: 0.42, fill: { color: "1B4332" } });
    s8.addImage({ data: icons.checkGold, x: 0.7, y: cy + 0.08, w: 0.25, h: 0.25 });
    s8.addText(t, { x: 1.1, y: cy, w: 8, h: 0.42, fontSize: 12, fontFace: BODY_FONT, color: WHITE, valign: "middle", margin: 0 });
  });

  s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });

  // ========== SLIDE 9: ROADMAP & BUDGET ==========
  let s9 = pres.addSlide();
  s9.background = { color: OFF_WHITE };
  s9.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 1.0, fill: { color: GREEN } });
  s9.addText("Roadmap & Budget", { x: 0.8, y: 0.15, w: 8, h: 0.7, fontSize: 28, fontFace: HEADER_FONT, color: WHITE, bold: true, margin: 0 });

  // Budget tiers
  const tiers = [
    { label: "Prototype", amount: "$60K", status: "COMPLETE", barW: 2.0, color: GREEN },
    { label: "MVP Critical Path", amount: "~$180K", status: "NEXT", barW: 5.0, color: GOLD },
    { label: "Full Platform", amount: "~$400K", status: "FUTURE", barW: 8.5, color: LIGHT_GRAY },
  ];
  tiers.forEach((t, i) => {
    const cy = 1.3 + i * 0.9;
    // Bar background
    s9.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: cy, w: 8.5, h: 0.35, fill: { color: LIGHT_GRAY } });
    // Bar fill
    s9.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: cy, w: t.barW, h: 0.35, fill: { color: t.color } });
    // Label
    s9.addText(t.label, { x: 0.8, y: cy + 0.4, w: 2.5, h: 0.3, fontSize: 11, fontFace: BODY_FONT, color: CHARCOAL, bold: true, margin: 0 });
    s9.addText(t.amount, { x: 3.3, y: cy + 0.4, w: 1.5, h: 0.3, fontSize: 11, fontFace: BODY_FONT, color: GREEN, bold: true, margin: 0 });
    // Status badge
    const badgeColor = t.status === "COMPLETE" ? GREEN : t.status === "NEXT" ? "D4A017" : GRAY;
    s9.addShape(pres.shapes.RECTANGLE, { x: 5.0, y: cy + 0.42, w: 1.2, h: 0.25, fill: { color: badgeColor } });
    s9.addText(t.status, { x: 5.0, y: cy + 0.42, w: 1.2, h: 0.25, fontSize: 8, fontFace: BODY_FONT, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  });

  // Key gaps
  s9.addText("Key Gaps for MVP", { x: 0.8, y: 4.0, w: 4, h: 0.35, fontSize: 14, fontFace: BODY_FONT, color: GREEN, bold: true, margin: 0 });
  const gaps = [
    "BaaS partner (Marqeta/Stripe) for card issuance",
    "Flutter mobile app for iOS/Android",
    "PCI-DSS certification",
    "100 features identified in gap analysis",
  ];
  s9.addText(gaps.map((t, i) => ({
    text: t,
    options: { bullet: true, breakLine: i < gaps.length - 1, fontSize: 11, fontFace: BODY_FONT, color: CHARCOAL, paraSpaceAfter: 3 }
  })), { x: 0.8, y: 4.35, w: 8.4, h: 1.2 });

  // ========== SLIDE 10: NEXT STEPS ==========
  let s10 = pres.addSlide();
  s10.background = { color: DARK_GREEN };
  s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GOLD } });
  s10.addImage({ data: icons.rocketWhite, x: 0.8, y: 0.4, w: 0.4, h: 0.4 });
  s10.addText("Next Steps", { x: 1.35, y: 0.35, w: 5, h: 0.5, fontSize: 28, fontFace: HEADER_FONT, color: WHITE, bold: true, margin: 0 });

  const steps = [
    { num: "1", text: "Client review of live URLs", sub: "pro.fineract.us  |  neo.fineract.us  |  api.fineract.us" },
    { num: "2", text: "Flutter mobile app development", sub: "iOS + Android with shared Dart codebase" },
    { num: "3", text: "BaaS partner selection for card issuance", sub: "Marqeta, Stripe Issuing, or local partner" },
    { num: "4", text: "KYC/AML provider integration", sub: "Smile ID for identity verification" },
    { num: "5", text: "M-Pesa API production credentials", sub: "Safaricom Daraja API go-live" },
    { num: "6", text: "CBK licensing preparation", sub: "Regulatory submission & compliance audit" },
  ];
  steps.forEach((s, i) => {
    const cy = 1.1 + i * 0.7;
    // Number circle
    s10.addShape(pres.shapes.OVAL, { x: 0.8, y: cy + 0.05, w: 0.45, h: 0.45, fill: { color: GOLD } });
    s10.addText(s.num, { x: 0.8, y: cy + 0.05, w: 0.45, h: 0.45, fontSize: 16, fontFace: HEADER_FONT, color: DARK_GREEN, bold: true, align: "center", valign: "middle", margin: 0 });
    // Text
    s10.addText(s.text, { x: 1.5, y: cy, w: 7, h: 0.35, fontSize: 14, fontFace: BODY_FONT, color: WHITE, bold: true, margin: 0 });
    s10.addText(s.sub, { x: 1.5, y: cy + 0.33, w: 7, h: 0.3, fontSize: 10, fontFace: BODY_FONT, color: "95D5B2", margin: 0 });
  });

  // Footer
  s10.addText("NeoBank  —  Qsoftwares Ltd  —  April 2026", {
    x: 0.8, y: 5.1, w: 8.4, h: 0.3, fontSize: 10, fontFace: BODY_FONT, color: "95D5B2", align: "center", margin: 0
  });
  s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: GOLD } });

  // Save
  await pres.writeFile({ fileName: "D:/neobank/docs/NeoBank-Platform-Demo.pptx" });
  console.log("Created: D:/neobank/docs/NeoBank-Platform-Demo.pptx");
}

main().catch(err => { console.error(err); process.exit(1); });
