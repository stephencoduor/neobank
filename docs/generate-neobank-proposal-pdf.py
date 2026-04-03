#!/usr/bin/env python3
"""Generate NeoBank-Digital-Banking-Proposal.pdf — Gap analysis + implementation plan."""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether
)
from reportlab.platypus.flowables import HRFlowable

# ── Savanna Design System Colors ──────────────────────────────────────────────
PRIMARY = HexColor("#2D6A4F")
PRIMARY_DARK = HexColor("#1B4332")
GOLD = HexColor("#E9B949")
GOLD_DARK = HexColor("#854D0E")
LIGHT_GREEN = HexColor("#D8F3DC")
SURFACE = HexColor("#FAFAF5")
SURFACE_WARM = HexColor("#F5F0E8")
TEXT_HEADING = HexColor("#1A1A1A")
TEXT_BODY = HexColor("#374151")
TEXT_MUTED = HexColor("#6B7280")
WHITE = HexColor("#FFFFFF")
BORDER_GRAY = HexColor("#D1D5DB")
BORDER_WARM = HexColor("#E8E5DE")
SUCCESS = HexColor("#22C55E")
SUCCESS_BG = HexColor("#F0FDF4")
DANGER = HexColor("#EF4444")
DANGER_BG = HexColor("#FEF2F2")
WARNING = HexColor("#EAB308")
WARNING_BG = HexColor("#FEFCE8")

PAGE_W, PAGE_H = A4
MARGIN = 54

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "NeoBank-Digital-Banking-Proposal.pdf")


# ── Styles ────────────────────────────────────────────────────────────────────
def build_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("CoverTitle", fontName="Helvetica-Bold", fontSize=30,
        leading=36, textColor=WHITE, alignment=TA_LEFT))
    styles.add(ParagraphStyle("CoverSubtitle", fontName="Helvetica", fontSize=15,
        leading=22, textColor=LIGHT_GREEN, alignment=TA_LEFT))
    styles.add(ParagraphStyle("CoverDate", fontName="Helvetica", fontSize=12,
        leading=16, textColor=GOLD, alignment=TA_LEFT))
    styles.add(ParagraphStyle("CoverTagline", fontName="Helvetica-Oblique", fontSize=11,
        leading=16, textColor=HexColor("#B7E4C7"), alignment=TA_LEFT))
    styles.add(ParagraphStyle("SectionTitle", fontName="Helvetica-Bold", fontSize=18,
        leading=24, textColor=PRIMARY, spaceBefore=18, spaceAfter=10))
    styles.add(ParagraphStyle("SubHeading", fontName="Helvetica-Bold", fontSize=13,
        leading=18, textColor=TEXT_HEADING, spaceBefore=12, spaceAfter=4))
    styles.add(ParagraphStyle("SubHeading2", fontName="Helvetica-Bold", fontSize=11,
        leading=15, textColor=PRIMARY_DARK, spaceBefore=8, spaceAfter=3))
    styles.add(ParagraphStyle("Body", fontName="Helvetica", fontSize=10,
        leading=14, textColor=TEXT_BODY, spaceBefore=2, spaceAfter=4))
    styles.add(ParagraphStyle("BodyBold", fontName="Helvetica-Bold", fontSize=10,
        leading=14, textColor=TEXT_BODY, spaceBefore=2, spaceAfter=4))
    styles.add(ParagraphStyle("SavannaBullet", fontName="Helvetica", fontSize=10,
        leading=14, textColor=TEXT_BODY, leftIndent=18, bulletIndent=6,
        spaceBefore=1, spaceAfter=1))
    styles.add(ParagraphStyle("SavannaBulletBold", fontName="Helvetica-Bold", fontSize=10,
        leading=14, textColor=TEXT_BODY, leftIndent=18, bulletIndent=6,
        spaceBefore=1, spaceAfter=1))
    styles.add(ParagraphStyle("TOCEntry", fontName="Helvetica", fontSize=11,
        leading=20, textColor=TEXT_BODY, leftIndent=12))
    styles.add(ParagraphStyle("TableCell", fontName="Helvetica", fontSize=9,
        leading=12, textColor=TEXT_BODY))
    styles.add(ParagraphStyle("TableHeader", fontName="Helvetica-Bold", fontSize=9,
        leading=12, textColor=WHITE))
    styles.add(ParagraphStyle("StatLabel", fontName="Helvetica", fontSize=9,
        leading=12, textColor=TEXT_MUTED, alignment=TA_CENTER))
    styles.add(ParagraphStyle("StatValue", fontName="Helvetica-Bold", fontSize=22,
        leading=28, textColor=PRIMARY, alignment=TA_CENTER))
    styles.add(ParagraphStyle("GapCritical", fontName="Helvetica-Bold", fontSize=9,
        leading=12, textColor=DANGER))
    styles.add(ParagraphStyle("GapHigh", fontName="Helvetica-Bold", fontSize=9,
        leading=12, textColor=WARNING))
    styles.add(ParagraphStyle("GapMedium", fontName="Helvetica-Bold", fontSize=9,
        leading=12, textColor=HexColor("#F97316")))
    styles.add(ParagraphStyle("GapLow", fontName="Helvetica-Bold", fontSize=9,
        leading=12, textColor=SUCCESS))
    styles.add(ParagraphStyle("Footer", fontName="Helvetica", fontSize=8,
        leading=10, textColor=TEXT_BODY, alignment=TA_CENTER))
    return styles


# ── Page template callbacks ───────────────────────────────────────────────────
def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(TEXT_BODY)
    canvas.drawCentredString(PAGE_W / 2, 28,
        f"Qsoftwares Ltd  |  NeoBank Digital Banking Proposal  |  Page {doc.page}")
    canvas.setStrokeColor(BORDER_GRAY)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 40, PAGE_W - MARGIN, 40)
    canvas.restoreState()


def _cover_page(canvas, doc):
    canvas.saveState()
    # Full-width dark green header (top 50%)
    bar_h = PAGE_H * 0.52
    canvas.setFillColor(PRIMARY_DARK)
    canvas.rect(0, PAGE_H - bar_h, PAGE_W, bar_h, fill=1, stroke=0)
    # Gradient overlay — lighter green band
    canvas.setFillColor(PRIMARY)
    canvas.rect(0, PAGE_H - bar_h, PAGE_W * 0.35, bar_h, fill=1, stroke=0)
    # Gold accent strip
    canvas.setFillColor(GOLD)
    canvas.rect(0, PAGE_H - bar_h, PAGE_W, 5, fill=1, stroke=0)
    # Decorative circles
    canvas.setFillColor(HexColor("#2D6A4F80"))
    canvas.circle(PAGE_W - 80, PAGE_H - 90, 50, fill=1, stroke=0)
    canvas.setFillColor(HexColor("#E9B94940"))
    canvas.circle(PAGE_W - 40, PAGE_H - 160, 30, fill=1, stroke=0)
    # Logo area
    canvas.setFillColor(GOLD)
    canvas.circle(MARGIN + 18, PAGE_H - 55, 14, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 16)
    canvas.drawString(MARGIN + 40, PAGE_H - 60, "Qsoftwares")
    canvas.setFont("Helvetica", 10)
    canvas.setFillColor(LIGHT_GREEN)
    canvas.drawString(MARGIN + 40, PAGE_H - 76, "Digital Financial Solutions")
    # Bottom half — company info
    canvas.setFillColor(TEXT_MUTED)
    canvas.setFont("Helvetica", 10)
    y_bottom = 120
    canvas.drawString(MARGIN, y_bottom, "Qsoftwares Ltd")
    canvas.drawString(MARGIN, y_bottom - 16, "info@qsoftwares.org  |  +254 710 401 008")
    canvas.drawString(MARGIN, y_bottom - 32, "www.qsoftwares.org")
    # Confidential badge
    canvas.setFillColor(DANGER_BG)
    canvas.roundRect(PAGE_W - MARGIN - 130, y_bottom - 8, 130, 22, 4, fill=1, stroke=0)
    canvas.setFillColor(DANGER)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawCentredString(PAGE_W - MARGIN - 65, y_bottom - 2, "CONFIDENTIAL")
    canvas.restoreState()


# ── Helpers ───────────────────────────────────────────────────────────────────
def bullet(text, styles):
    return Paragraph(f"\u2022  {text}", styles["SavannaBullet"])

def bullet_bold(label, rest, styles):
    return Paragraph(f"\u2022  <b>{label}</b> {rest}", styles["SavannaBullet"])

def section_title(number, title, styles):
    return Paragraph(f"Section {number}: {title}", styles["SectionTitle"])

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=BORDER_GRAY,
                       spaceBefore=6, spaceAfter=6)

def gold_hr():
    return HRFlowable(width="30%", thickness=2, color=GOLD,
                       spaceBefore=4, spaceAfter=8)

def make_table(headers, rows, col_widths=None):
    data = [headers] + rows
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("LEADING", (0, 0), (-1, -1), 13),
        ("ALIGN", (0, 0), (-1, 0), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER_GRAY),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = SURFACE if i % 2 == 0 else WHITE
        style_cmds.append(("BACKGROUND", (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t


def gap_badge(level):
    colors = {
        "CRITICAL": ("#EF4444", "#FEF2F2"),
        "HIGH": ("#EAB308", "#FEFCE8"),
        "MEDIUM": ("#F97316", "#FFF7ED"),
        "LOW": ("#22C55E", "#F0FDF4"),
    }
    fg, bg = colors.get(level, ("#6B7280", "#F9FAFB"))
    return f'<font color="{fg}"><b>{level}</b></font>'


def stat_box(value, label, styles):
    """Create a stat box as a mini-table."""
    data = [
        [Paragraph(str(value), styles["StatValue"])],
        [Paragraph(label, styles["StatLabel"])],
    ]
    t = Table(data, colWidths=[120])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), SURFACE_WARM),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("VALIGN", (0, 0), (0, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (0, 0), 10),
        ("BOTTOMPADDING", (0, -1), (0, -1), 10),
        ("ROUNDEDCORNERS", [8, 8, 8, 8]),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_WARM),
    ]))
    return t


# ── Build PDF ─────────────────────────────────────────────────────────────────
def build_pdf():
    styles = build_styles()
    story = []
    CW = PAGE_W - 2 * MARGIN  # content width

    # ──── COVER PAGE ──────────────────────────────────────────────────────────
    story.append(Spacer(1, PAGE_H * 0.20))
    story.append(Paragraph("Next-Gen Digital Banking", styles["CoverTitle"]))
    story.append(Spacer(1, 4))
    story.append(Paragraph("& Payments Ecosystem", styles["CoverTitle"]))
    story.append(Spacer(1, 16))
    story.append(Paragraph(
        "Technical Proposal  |  Gap Analysis  |  Implementation Plan",
        styles["CoverSubtitle"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Mobile-First Financial Operating System for Emerging Markets",
        styles["CoverTagline"]))
    story.append(Spacer(1, 14))
    story.append(Paragraph("April 2026  |  20-Week Delivery", styles["CoverDate"]))
    story.append(PageBreak())

    # ──── TABLE OF CONTENTS ───────────────────────────────────────────────────
    story.append(Paragraph("Table of Contents", styles["SectionTitle"]))
    story.append(hr())
    toc = [
        ("1", "Executive Summary"),
        ("2", "Platform Readiness Assessment"),
        ("3", "Gap Analysis — Requirements Matrix"),
        ("4", "Critical Gaps & Solutions"),
        ("5", "BaaS & Sponsor Bank Strategy"),
        ("6", "Recommended Technical Stack"),
        ("7", "Implementation Phases (20 Weeks)"),
        ("8", "Budget Breakdown"),
        ("9", "Third-Party Dependencies"),
        ("10", "Risk Assessment"),
        ("11", "Our Competitive Advantage"),
        ("12", "Edge Case Matrix"),
        ("13", "Deliverables & Next Steps"),
    ]
    for num, title in toc:
        story.append(Paragraph(f"<b>{num}.</b>  {title}", styles["TOCEntry"]))
    story.append(PageBreak())

    # ──── SECTION 1: Executive Summary ────────────────────────────────────────
    story.append(section_title(1, "Executive Summary", styles))
    story.append(gold_hr())
    story.append(Paragraph(
        "We propose building a comprehensive digital banking and payments ecosystem "
        "for an emerging market, leveraging our existing Apache Fineract core banking "
        "infrastructure, 9 payment provider integrations, and proven mobile banking "
        "patterns. Our platform already covers ~60% of the required backend "
        "infrastructure, dramatically reducing build time from 12+ months to 20 weeks.",
        styles["Body"]))
    story.append(Spacer(1, 10))

    # Stats row
    stats = Table([
        [stat_box("60%", "Backend Ready", styles),
         stat_box("9", "Payment Providers", styles),
         stat_box("20", "Weeks to Launch", styles),
         stat_box("$60K", "Fixed Budget", styles)],
    ], colWidths=[CW/4]*4)
    stats.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(stats)
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Key Decision:</b> We recommend <b>Flutter</b> for the "
        "cross-platform mobile app (iOS + Android from a single codebase), with "
        "<b>Riverpod</b> state management and <b>Drift</b> for offline-first local storage.",
        styles["Body"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Scope:</b> The platform serves as a high-utility retail "
        "banking app for individuals and a robust payment-acceptance suite for merchants, "
        "replacing cash-heavy legacy systems with a secure, mobile-first Financial "
        "Operating System.", styles["Body"]))
    story.append(PageBreak())

    # ──── SECTION 2: Platform Readiness ───────────────────────────────────────
    story.append(section_title(2, "Platform Readiness Assessment", styles))
    story.append(gold_hr())
    story.append(Paragraph(
        "Our existing platform comprises three production applications with a shared "
        "Apache Fineract backend. The following capabilities transfer directly to the "
        "NeoBank project:", styles["Body"]))
    story.append(Spacer(1, 8))

    ready = [
        ["Core Banking Engine", "Apache Fineract — double-entry GL, loan engine, savings, multi-currency", "Production"],
        ["Payment Integrations", "M-Pesa, Airtel, MTN, Flutterwave, Paystack, Cellulant, AT, Razorpay, Stripe", "Production"],
        ["React Admin Dashboard", "Client CRUD, loan/savings management, mobile money operations, reports", "Production"],
        ["Tax Compliance", "eTIMS/KRA integration — invoice lifecycle, credit notes, tax codes", "Production"],
        ["Credit Scoring", "PataScore integration — bank statement + M-Pesa statement analysis", "Production"],
        ["Client Management", "KYC document storage, client lifecycle, group/center hierarchy", "Production"],
        ["Mobile UX Patterns", "50+ screens: auth, dashboard, loans, savings, payments, QR, biometric", "Proven (Android)"],
        ["Multi-Tenant", "Fineract multi-tenant architecture — isolate data per organization", "Production"],
    ]
    story.append(make_table(
        ["Capability", "Details", "Status"],
        ready,
        col_widths=[120, 280, 80]))
    story.append(PageBreak())

    # ──── SECTION 3: Gap Analysis Matrix ──────────────────────────────────────
    story.append(section_title(3, "Gap Analysis — Requirements Matrix", styles))
    story.append(gold_hr())

    story.append(Paragraph("A. Digital Banking Infrastructure", styles["SubHeading"]))
    gap_a = [
        ["Tiered Accounts (Personal + Business)", "Fineract supports client types + savings products", gap_badge("LOW")],
        ["Automated KYC/AML (ID + liveness)", "Document storage only, no automated verification", gap_badge("HIGH")],
        ["Shadow Ledgering (real-time)", "Full GL accounting exists; pending txn layer needed", gap_badge("MEDIUM")],
        ["Multi-currency reconciliation", "Multi-currency supported; FX feeds needed", gap_badge("LOW")],
    ]
    story.append(make_table(["Requirement", "Current State", "Gap"], gap_a, [180, 230, 70]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("B. Card Management System", styles["SubHeading"]))
    gap_b = [
        ["Physical prepaid debit cards", "No card infrastructure", gap_badge("CRITICAL")],
        ["Virtual instant cards", "None", gap_badge("CRITICAL")],
        ["Freeze/unfreeze, spend limits, alerts", "None", gap_badge("CRITICAL")],
        ["Contactless (NFC) + Chip & PIN", "None — requires card issuing partner", gap_badge("CRITICAL")],
    ]
    story.append(make_table(["Requirement", "Current State", "Gap"], gap_b, [180, 230, 70]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("C. Merchant & POS Solutions", styles["SubHeading"]))
    gap_c = [
        ["Bluetooth POS terminals", "No POS infrastructure", gap_badge("HIGH")],
        ["SoftPOS / Tap-to-Phone", "None", gap_badge("HIGH")],
        ["Instant settlement for micro-merchants", "Mobile money B2C disbursement exists", gap_badge("MEDIUM")],
    ]
    story.append(make_table(["Requirement", "Current State", "Gap"], gap_c, [180, 230, 70]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("D. Peer-to-Peer (P2P) Ecosystem", styles["SubHeading"]))
    gap_d = [
        ["Instant P2P via phone/alias/QR", "QR screen + basic transfers exist", gap_badge("MEDIUM")],
        ["QR for P2P + Merchant payments", "Basic QR in mobile app", gap_badge("MEDIUM")],
    ]
    story.append(make_table(["Requirement", "Current State", "Gap"], gap_d, [180, 230, 70]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("E. Technical & Security Standards", styles["SubHeading"]))
    gap_e = [
        ["SOC2/PCI-DSS compliance", "No compliance framework", gap_badge("CRITICAL")],
        ["OAuth2 + JWT authentication", "Basic auth only", gap_badge("HIGH")],
        ["Data residency compliance", "Not architected for regional deployment", gap_badge("HIGH")],
        ["Mobile security (Secure Enclave, cert pinning)", "Biometric exists; cert pinning missing", gap_badge("MEDIUM")],
        ["High-concurrency backend", "Fineract Spring Boot + modular arch", gap_badge("LOW")],
    ]
    story.append(make_table(["Requirement", "Current State", "Gap"], gap_e, [180, 230, 70]))
    story.append(PageBreak())

    # ──── SECTION 4: Critical Gaps & Solutions ────────────────────────────────
    story.append(section_title(4, "Critical Gaps & Solutions", styles))
    story.append(gold_hr())

    # Gap 1: Card Issuing
    story.append(Paragraph("4.1  Card Issuing & Management", styles["SubHeading"]))
    story.append(Paragraph(
        "This is the most significant gap. Card infrastructure requires a Banking-as-a-Service "
        "(BaaS) partner that is already PCI-DSS certified and connected to card networks.",
        styles["Body"]))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Recommended Partners:</b>", styles["Body"]))
    card_partners = [
        ["Africa", "Union54, Flutterwave (virtual cards), Paystack Issuing"],
        ["Asia", "Stripe Issuing, Rapyd, Nium"],
        ["Global", "Marqeta, Stripe Issuing, Adyen Issuing"],
    ]
    story.append(make_table(["Region", "Card Issuing Partners"], card_partners, [80, 400]))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "<b>Architecture:</b> Flutter App \u2192 Our Backend \u2192 Card Issuing API (Marqeta/Stripe) "
        "\u2192 Webhook receiver for card events \u2192 Fineract GL posting. Our systems never "
        "touch raw card numbers (PCI scope reduction via tokenization).",
        styles["Body"]))
    story.append(Paragraph("<b>Effort:</b> 4\u20135 weeks", styles["BodyBold"]))
    story.append(Spacer(1, 10))

    # Gap 2: KYC/AML
    story.append(Paragraph("4.2  KYC/AML Automated Workflows", styles["SubHeading"]))
    story.append(Paragraph(
        "Automated identity verification is mandatory for account opening. We integrate "
        "with a KYC-as-a-Service provider for ID document verification, liveness detection, "
        "OCR extraction, and AML/sanctions screening.",
        styles["Body"]))
    story.append(Spacer(1, 4))
    kyc_partners = [
        ["Africa (Primary)", "Smile Identity", "20+ African countries, ID + liveness + AML"],
        ["Global (Backup)", "Onfido / Sumsub", "180+ countries, advanced ML verification"],
    ]
    story.append(make_table(["Region", "Provider", "Coverage"], kyc_partners, [100, 110, 270]))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<b>KYC Flow:</b> Capture ID (front+back) \u2192 Liveness check (selfie video) \u2192 "
        "OCR extraction \u2192 AML screening \u2192 Risk score \u2192 Auto-approve or manual queue "
        "\u2192 Fineract account activation.",
        styles["Body"]))
    story.append(Paragraph("<b>Effort:</b> 2\u20133 weeks", styles["BodyBold"]))
    story.append(Spacer(1, 10))

    # Gap 3: PCI-DSS/SOC2
    story.append(Paragraph("4.3  PCI-DSS & SOC2 Compliance", styles["SubHeading"]))
    story.append(Paragraph(
        "By using a BaaS partner for card issuing, we dramatically reduce our PCI-DSS scope. "
        "Our systems handle only tokenized references, never raw card data. SOC2 compliance "
        "requires encryption at rest, access logging, vulnerability scanning, and documented "
        "security policies.",
        styles["Body"]))
    story.append(Spacer(1, 4))
    story.append(bullet_bold("PCI-DSS:", " Use SAQ-A (outsourced card handling) — BaaS partner holds PCI scope", styles))
    story.append(bullet_bold("SOC2:", " AWS/GCP compliant regions, encrypted storage, CloudTrail, automated scanning", styles))
    story.append(bullet_bold("TLS 1.3:", " Enforce on all API endpoints via API gateway / load balancer", styles))
    story.append(bullet_bold("OAuth2:", " Replace basic auth with Keycloak — JWT + refresh tokens + MFA", styles))
    story.append(Paragraph("<b>Effort:</b> 3\u20134 weeks", styles["BodyBold"]))
    story.append(Spacer(1, 10))

    # Gap 4: POS/Merchant
    story.append(Paragraph("4.4  Merchant & POS Solutions", styles["SubHeading"]))
    story.append(Paragraph(
        "Merchant acquiring requires hardware partnerships (POS terminals), SoftPOS "
        "certification (Tap-to-Phone), and settlement engine logic.",
        styles["Body"]))
    story.append(Spacer(1, 4))
    story.append(bullet_bold("Hardware POS:", " PAX A920 / Sunmi V2 Pro — Bluetooth + 4G terminals", styles))
    story.append(bullet_bold("SoftPOS:", " Mastercard Tap on Phone SDK or Visa Tap to Phone", styles))
    story.append(bullet_bold("Settlement:", " Extend existing M-Pesa/Airtel B2C for instant micro-merchant payouts", styles))
    story.append(bullet_bold("QR Standard:", " EMVCo QR specification for interoperable merchant payments", styles))
    story.append(Paragraph("<b>Effort:</b> 4\u20135 weeks", styles["BodyBold"]))
    story.append(PageBreak())

    # ──── SECTION 5: BaaS Strategy ───────────────────────────────────────────
    story.append(section_title(5, "BaaS & Sponsor Bank Strategy", styles))
    story.append(gold_hr())
    story.append(Paragraph(
        "The client's product is a digital bank without a banking license. A licensed "
        "\"sponsor bank\" holds customer deposits, provides banking rails (card networks, "
        "RTGS, ACH), issues cards under the client's brand, and ensures regulatory compliance.",
        styles["Body"]))
    story.append(Spacer(1, 8))

    baas = [
        ["East Africa (Kenya)", "Cellulant, Stanbic API, Equity API", "Deposits, payments", "Via Visa/MC partner"],
        ["West Africa (Nigeria)", "Flutterwave, Paystack, Woven Finance", "Deposits, cards", "Flutterwave virtual"],
        ["Southern Africa", "Stitch, Investec API", "Open banking", "Investec issuing"],
        ["South Asia (India)", "Razorpay X, Setu", "Neo-banking, UPI", "Partner bank cards"],
        ["Southeast Asia", "Brankas, Rapyd", "Open banking, wallets", "Rapyd issuing"],
        ["Global", "Marqeta, Stripe Treasury", "Full stack", "Marqeta/Stripe cards"],
    ]
    story.append(make_table(
        ["Region", "BaaS Partner", "Capabilities", "Card Issuing"],
        baas, [105, 155, 115, 105]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Integration Architecture", styles["SubHeading"]))
    arch_rows = [
        ["Layer 1: Presentation", "Flutter App (iOS + Android) + React Admin Dashboard"],
        ["Layer 2: API Gateway", "Kong / AWS API Gateway — auth, rate limiting, routing"],
        ["Layer 3: Backend", "Spring Boot + Fineract — business logic, GL posting, webhooks"],
        ["Layer 4: External APIs", "BaaS Partner + Card Issuer + KYC Provider + Payment Rails"],
        ["Layer 5: Infrastructure", "AWS/GCP — Kubernetes, PostgreSQL, Redis, S3, CloudWatch"],
    ]
    story.append(make_table(["Layer", "Components"], arch_rows, [120, 360]))
    story.append(PageBreak())

    # ──── SECTION 6: Technical Stack ──────────────────────────────────────────
    story.append(section_title(6, "Recommended Technical Stack", styles))
    story.append(gold_hr())

    story.append(Paragraph("Backend (Extend Existing)", styles["SubHeading"]))
    backend = [
        ["Core Banking", "Apache Fineract (Java 21, Spring Boot)", "Already built, proven"],
        ["API Gateway", "Kong or AWS API Gateway", "Rate limiting, auth, routing"],
        ["Auth Server", "Keycloak", "OAuth2 + JWT + MFA"],
        ["Cache Layer", "Redis", "Shadow ledger, sessions, rate limits"],
        ["Message Queue", "Apache Kafka", "Event sourcing, webhooks"],
        ["Database", "PostgreSQL + Redis", "Fineract-compatible"],
        ["Search", "Elasticsearch", "Client/transaction search"],
        ["File Storage", "AWS S3", "KYC documents, statements"],
        ["Monitoring", "Grafana + Prometheus + Sentry", "Full observability"],
    ]
    story.append(make_table(["Component", "Technology", "Rationale"], backend, [90, 200, 190]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Flutter Mobile App", styles["SubHeading"]))
    flutter = [
        ["Framework", "Flutter 3.x (Dart)", "Cross-platform, client preference"],
        ["State Mgmt", "Riverpod 2.x", "Compile-safe, testable"],
        ["Navigation", "GoRouter", "Declarative + deep links"],
        ["HTTP Client", "Dio + Retrofit", "Type-safe API calls"],
        ["Local DB", "Drift (SQLite)", "Offline-first capable"],
        ["Secure Storage", "flutter_secure_storage", "Keychain / Keystore"],
        ["Biometrics", "local_auth", "Fingerprint + Face"],
        ["NFC", "nfc_manager", "Tap-to-pay, card reading"],
        ["Camera / OCR", "camera + google_mlkit", "KYC document capture"],
        ["Push", "firebase_messaging", "FCM / APNs"],
        ["QR", "qr_flutter + mobile_scanner", "Generate + scan QR codes"],
    ]
    story.append(make_table(["Component", "Package", "Purpose"], flutter, [90, 180, 210]))
    story.append(PageBreak())

    # ──── SECTION 7: Implementation Phases ────────────────────────────────────
    story.append(section_title(7, "Implementation Phases (20 Weeks)", styles))
    story.append(gold_hr())

    story.append(Paragraph("Phase 1: Foundation & Security (Weeks 1\u20134)", styles["SubHeading"]))
    p1 = [
        ["Week 1", "OAuth2 + JWT auth server", "Replace basic auth with Keycloak"],
        ["Week 1\u20132", "Infrastructure hardening", "TLS 1.3, WAF, encryption, VPC"],
        ["Week 2\u20133", "KYC/AML integration", "Smile ID \u2014 ID verification + liveness"],
        ["Week 3\u20134", "BaaS partner vetting", "Evaluate 3\u20135 partners, select primary"],
        ["Week 4", "Security documentation", "SOC2 evidence, PCI-DSS SAQ"],
    ]
    story.append(make_table(["Timeline", "Deliverable", "Details"], p1, [70, 160, 250]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Phase 2: Core Banking Enhancement (Weeks 5\u20138)", styles["SubHeading"]))
    p2 = [
        ["Week 5", "Tiered accounts config", "Basic / Standard / Premium product tiers"],
        ["Week 5\u20136", "Shadow ledger (Redis)", "Real-time pending balance, WebSocket"],
        ["Week 6\u20137", "P2P payment engine", "Phone lookup, alias, QR standard"],
        ["Week 7\u20138", "Multi-currency engine", "FX rate feeds, conversion, reconciliation"],
        ["Week 8", "Notification engine", "Real-time alerts via FCM + WebSocket"],
    ]
    story.append(make_table(["Timeline", "Deliverable", "Details"], p2, [70, 160, 250]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Phase 3: Card Issuing & Management (Weeks 9\u201312)", styles["SubHeading"]))
    p3 = [
        ["Week 9\u201310", "Card issuing API", "Virtual + physical card creation"],
        ["Week 10\u201311", "Card management UI", "Freeze, limits, PIN management"],
        ["Week 11\u201312", "Card transaction processing", "Authorization webhooks, GL posting"],
        ["Week 12", "Card security controls", "Dynamic CVV, 3DS, tokenization"],
    ]
    story.append(make_table(["Timeline", "Deliverable", "Details"], p3, [70, 160, 250]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Phase 4: Flutter Mobile App (Weeks 9\u201316) \u2014 Parallel", styles["SubHeading"]))
    p4 = [
        ["Week 9\u201310", "App shell + auth + onboarding", "Flutter, Riverpod, GoRouter, KYC flow"],
        ["Week 11\u201312", "Banking core screens", "Dashboard, accounts, P2P transfers"],
        ["Week 13\u201314", "Card management screens", "Virtual/physical card UI, NFC"],
        ["Week 14\u201315", "Payment screens", "9 providers, QR payments"],
        ["Week 15\u201316", "Security + polish", "Cert pinning, root detection, testing"],
    ]
    story.append(make_table(["Timeline", "Deliverable", "Details"], p4, [70, 170, 240]))
    story.append(PageBreak())

    story.append(Paragraph("Phase 5: Merchant & POS (Weeks 13\u201316)", styles["SubHeading"]))
    p5 = [
        ["Week 13", "Merchant onboarding", "KYC, business verification, account setup"],
        ["Week 13\u201314", "POS terminal integration", "PAX/Sunmi SDK, Bluetooth pairing"],
        ["Week 14\u201315", "SoftPOS (Tap-to-Phone)", "NFC payment acceptance SDK"],
        ["Week 15\u201316", "Settlement engine", "Instant/T+1, MDR fee calculation"],
    ]
    story.append(make_table(["Timeline", "Deliverable", "Details"], p5, [70, 160, 250]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Phase 6: QA, Compliance & Launch (Weeks 17\u201320)", styles["SubHeading"]))
    p6 = [
        ["Week 17\u201318", "Automated testing", "Unit + integration + E2E tests"],
        ["Week 18\u201319", "Penetration testing", "Third-party security audit"],
        ["Week 19", "Stress testing", "Load testing (k6), ledger reconciliation"],
        ["Week 19\u201320", "Compliance documentation", "SOC2 report, PCI-DSS SAQ, edge case matrix"],
        ["Week 20", "Soft launch", "Beta release to limited users"],
    ]
    story.append(make_table(["Timeline", "Deliverable", "Details"], p6, [70, 160, 250]))
    story.append(Spacer(1, 10))

    # Timeline visual
    story.append(Paragraph("Parallel Execution Timeline", styles["SubHeading2"]))
    timeline = [
        ["Phase 1", "Foundation & Security", "Weeks 1\u20134", "$12,000"],
        ["Phase 2", "Core Banking", "Weeks 5\u20138", "$12,000"],
        ["Phase 3", "Card Issuing", "Weeks 9\u201312", "$12,000"],
        ["Phase 4", "Flutter App (parallel)", "Weeks 9\u201316", "$12,000"],
        ["Phase 5", "Merchant & POS", "Weeks 13\u201316", "$8,000"],
        ["Phase 6", "QA & Launch", "Weeks 17\u201320", "$4,000"],
        ["TOTAL", "", "20 Weeks", "$60,000"],
    ]
    tl_table = make_table(["Phase", "Scope", "Duration", "Cost"], timeline, [70, 180, 100, 80])
    # Bold the total row
    tl_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("BACKGROUND", (0, -1), (-1, -1), LIGHT_GREEN),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("LEADING", (0, 0), (-1, -1), 13),
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER_GRAY),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ] + [("BACKGROUND", (0, i), (-1, i), SURFACE if i % 2 == 0 else WHITE) for i in range(1, 7)]))
    story.append(tl_table)
    story.append(PageBreak())

    # ──── SECTION 8: Budget ───────────────────────────────────────────────────
    story.append(section_title(8, "Budget Breakdown", styles))
    story.append(gold_hr())

    budget = [
        ["Phase 1: Foundation & Security", "4 weeks", "OAuth2, KYC, infra hardening, BaaS vetting", "$12,000"],
        ["Phase 2: Core Banking Enhancement", "4 weeks", "Tiered accounts, shadow ledger, P2P, FX", "$12,000"],
        ["Phase 3: Card Issuing & Management", "4 weeks", "Card API, management UI, transactions", "$12,000"],
        ["Phase 4: Flutter Mobile App", "8 weeks", "Cross-platform app, 50+ screens", "$12,000"],
        ["Phase 5: Merchant & POS", "4 weeks", "POS, SoftPOS, settlement engine", "$8,000"],
        ["Phase 6: QA, Compliance & Launch", "4 weeks", "Testing, pen test, SOC2, beta launch", "$4,000"],
    ]
    story.append(make_table(
        ["Phase", "Duration", "Key Deliverables", "Cost"],
        budget, [150, 60, 200, 70]))
    story.append(Spacer(1, 10))

    # Total
    total_box = Table([
        [Paragraph("<b>TOTAL PROJECT COST</b>", styles["Body"]),
         Paragraph("<b>$60,000</b>", styles["Body"])],
        [Paragraph("Calendar duration: 20 weeks (5 months)", styles["Body"]),
         Paragraph("Phases 3 & 4 run in parallel", styles["Body"])],
    ], colWidths=[CW/2]*2)
    total_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GREEN),
        ("BOX", (0, 0), (-1, -1), 1, PRIMARY),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(total_box)
    story.append(PageBreak())

    # ──── SECTION 9: Third-Party Dependencies ─────────────────────────────────
    story.append(section_title(9, "Third-Party Dependencies", styles))
    story.append(gold_hr())
    story.append(Paragraph(
        "The following third-party services are required and are the client's ongoing "
        "operational cost (not included in the $60K build cost):",
        styles["Body"]))
    story.append(Spacer(1, 8))

    thirdparty = [
        ["KYC/AML", "Smile ID / Onfido", "$200\u2013500/mo + per-check", "$0.10\u20130.50 per verification"],
        ["Card Issuing", "Marqeta / Stripe Issuing", "Variable", "Per-card + per-txn fees"],
        ["Cloud Infrastructure", "AWS / GCP", "$500\u20132,000/mo", "Depends on scale"],
        ["POS Terminals", "PAX / Sunmi", "$100\u2013300/unit", "One-time hardware cost"],
        ["SMS / Notifications", "Africa's Talking / Twilio", "$50\u2013200/mo", "Per-message pricing"],
        ["Sponsor Bank", "Region-dependent", "Negotiated", "Revenue share model typical"],
    ]
    story.append(make_table(
        ["Service", "Provider", "Est. Monthly Cost", "Notes"],
        thirdparty, [90, 130, 110, 150]))
    story.append(Spacer(1, 14))

    # ──── SECTION 10: Risk Assessment ─────────────────────────────────────────
    story.append(section_title(10, "Risk Assessment", styles))
    story.append(gold_hr())

    risks = [
        ["BaaS partner delays", "HIGH", "HIGH", "Start discovery Week 1, have 2 backup options"],
        ["PCI-DSS compliance timeline", "MEDIUM", "HIGH", "Use BaaS partner's PCI scope"],
        ["Sponsor bank approval", "HIGH", "CRITICAL", "Begin conversations immediately"],
        ["Card network certification", "MEDIUM", "MEDIUM", "Use pre-certified BaaS partner"],
        ["Flutter performance (low-end)", "LOW", "MEDIUM", "Performance profiling from Week 10"],
        ["Regional data residency laws", "MEDIUM", "HIGH", "Multi-region K8s from Phase 1"],
    ]
    story.append(make_table(
        ["Risk", "Likelihood", "Impact", "Mitigation"],
        risks, [130, 70, 70, 210]))
    story.append(PageBreak())

    # ──── SECTION 11: Our Competitive Advantage ───────────────────────────────
    story.append(section_title(11, "Our Competitive Advantage", styles))
    story.append(gold_hr())

    story.append(Paragraph("What We Bring (Saves 3\u20134 Months vs. Starting from Scratch)", styles["SubHeading"]))
    story.append(Spacer(1, 6))
    adv = [
        ["Apache Fineract Core Banking", "Full double-entry GL, loan engine, savings, multi-currency, multi-tenant"],
        ["9 Payment Providers", "M-Pesa, Airtel, MTN, Flutterwave, Paystack, Cellulant, AT, Razorpay, Stripe"],
        ["React Admin Dashboard", "Full CRUD: clients, loans, savings, reports, mobile money, tax compliance"],
        ["eTIMS Tax Compliance", "KRA integration \u2014 invoice lifecycle, credit notes (if Kenya is target)"],
        ["Credit Scoring", "PataScore integration \u2014 bank statement + M-Pesa analysis"],
        ["Mobile Banking UX", "50+ proven screens: auth, loans, payments, QR, biometric (translates to Flutter)"],
        ["Multi-Tenant Architecture", "Isolate data per organization from day one"],
    ]
    story.append(make_table(["Asset", "Value"], adv, [150, 330]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Matching Section 4 of Your Brief", styles["SubHeading"]))
    cap = [
        ["BaaS Strategy & Discovery", "Experience with 9 payment providers across Africa + Asia"],
        ["Financial Backend Engineering", "Fineract ledger + 9 payment webhooks + GL posting"],
        ["Secure Mobile Development", "Biometric auth, payment flows, KYC document capture"],
        ["Infrastructure Hardening", "Cloud deployment, multi-tenant, API security"],
        ["Fintech Project Orchestration", "Multi-app ecosystem (web + 2 mobile) with shared backend"],
        ["Financial QA", "Ledger reconciliation, transaction testing, compliance documentation"],
    ]
    story.append(make_table(["Your Requirement", "Our Evidence"], cap, [160, 320]))
    story.append(PageBreak())

    # ──── SECTION 12: Edge Case Matrix ────────────────────────────────────────
    story.append(section_title(12, "Edge Case Matrix", styles))
    story.append(gold_hr())
    story.append(Paragraph(
        "We maintain a comprehensive Edge Case Matrix for all transaction failure states. "
        "Below is a representative sample:",
        styles["Body"]))
    story.append(Spacer(1, 8))

    edges = [
        ["Card auth timeout", "Hold funds, retry once, release after 30min", "Auto-reversal + notification"],
        ["Double STK push", "Idempotency key prevents duplicate", "Return existing txn ID"],
        ["KYC verification fails", "Account in 'Pending' state", "Manual review queue"],
        ["Offline P2P transfer", "Queue locally, sync when online", "Conflict detection + notify"],
        ["POS battery dies mid-txn", "Transaction not completed", "Receipt shows 'Incomplete'"],
        ["FX rate changes mid-transfer", "Lock rate at initiation (60s)", "Rate expiry \u2192 re-quote"],
        ["Sponsor bank downtime", "Degrade to mobile money only", "Auto-switch payment rail"],
        ["Card fraud detected", "Instant freeze + push notification", "User unfreeze or replace"],
    ]
    story.append(make_table(
        ["Scenario", "Expected Behavior", "Recovery"],
        edges, [120, 180, 180]))
    story.append(PageBreak())

    # ──── SECTION 13: Deliverables & Next Steps ──────────────────────────────
    story.append(section_title(13, "Deliverables & Next Steps", styles))
    story.append(gold_hr())

    story.append(Paragraph("Final Deliverables", styles["SubHeading"]))
    story.append(bullet_bold("Flutter Mobile App", " (iOS + Android) \u2014 Full digital banking experience", styles))
    story.append(bullet_bold("React Admin Dashboard", " (enhanced) \u2014 Staff ops, merchant mgmt, compliance", styles))
    story.append(bullet_bold("Backend API Layer", " (extended) \u2014 OAuth2, card issuing, KYC, shadow ledger, P2P", styles))
    story.append(bullet_bold("Infrastructure", " \u2014 PCI-compliant cloud, multi-region ready, CI/CD pipeline", styles))
    story.append(bullet_bold("Documentation", " \u2014 API docs, architecture diagrams, SOC2 evidence, edge case matrix", styles))
    story.append(bullet_bold("Testing", " \u2014 Unit tests, integration tests, pen test report, stress test report", styles))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Recommended Next Steps", styles["SubHeading"]))
    steps = [
        ["1", "NDA Signing", "Before disclosing brand name and full specifications"],
        ["2", "BaaS Discovery Call", "1-week sprint to evaluate 3\u20135 BaaS partners for target market"],
        ["3", "Technical Deep-Dive", "2-hour session with your CTO to align architecture decisions"],
        ["4", "Contract & Kickoff", "Phase 1 begins immediately after agreement"],
    ]
    story.append(make_table(["#", "Step", "Details"], steps, [30, 130, 320]))
    story.append(Spacer(1, 20))

    # Contact box
    contact = Table([
        [Paragraph("<b>Ready to Build the Future of Payments?</b>", styles["SubHeading"])],
        [Spacer(1, 4)],
        [Paragraph("Qsoftwares Ltd", styles["Body"])],
        [Paragraph("info@qsoftwares.org  |  +254 710 401 008", styles["Body"])],
        [Paragraph("www.qsoftwares.org", styles["Body"])],
    ], colWidths=[CW])
    contact.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SURFACE_WARM),
        ("BOX", (0, 0), (-1, -1), 1.5, GOLD),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 16),
    ]))
    story.append(contact)

    # ──── BUILD ───────────────────────────────────────────────────────────────
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN + 10,
    )
    doc.build(story, onFirstPage=_cover_page, onLaterPages=_footer)
    size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print(f"Generated: {OUTPUT_PATH} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    build_pdf()
