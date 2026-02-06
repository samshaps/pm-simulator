const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber, PageBreak
} = require("docx");

// Colors
const DARK_BG = "1A1A2E";
const ACCENT_TEAL = "16A085";
const ACCENT_AMBER = "E67E22";
const ACCENT_RED = "C0392B";
const LIGHT_GRAY = "F5F5F5";
const MID_GRAY = "E0E0E0";
const DARK_TEXT = "2C2C2C";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };
const headerShading = { fill: DARK_BG, type: ShadingType.CLEAR };
const altRowShading = { fill: LIGHT_GRAY, type: ShadingType.CLEAR };

// Helpers
function heading(text, level) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 200 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: level === HeadingLevel.HEADING_1 ? 36 : level === HeadingLevel.HEADING_2 ? 30 : 26 })]
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.afterSpacing || 160 },
    children: [new TextRun({ text, font: "Arial", size: opts.size || 22, bold: opts.bold || false, italics: opts.italic || false, color: opts.color || DARK_TEXT })]
  });
}

function richPara(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.afterSpacing || 160 },
    children: runs.map(r => new TextRun({ font: "Arial", size: r.size || 22, bold: r.bold || false, italics: r.italic || false, color: r.color || DARK_TEXT, text: r.text }))
  });
}

function bulletItem(text, ref = "bullets", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}

function richBulletItem(runs, ref = "bullets", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 80 },
    children: runs.map(r => new TextRun({ font: "Arial", size: r.size || 22, bold: r.bold || false, italics: r.italic || false, color: r.color || DARK_TEXT, text: r.text }))
  });
}

function spacer(height = 120) {
  return new Paragraph({ spacing: { after: height }, children: [] });
}

function makeTableRow(cells, isHeader = false, isAlt = false) {
  return new TableRow({
    children: cells.map((cell, i) => new TableCell({
      borders,
      width: { size: cell.width, type: WidthType.DXA },
      margins: cellMargins,
      shading: isHeader ? headerShading : isAlt ? altRowShading : { fill: WHITE, type: ShadingType.CLEAR },
      verticalAlign: "center",
      children: [new Paragraph({
        children: [new TextRun({
          text: cell.text,
          font: "Arial",
          size: isHeader ? 20 : 22,
          bold: isHeader || cell.bold || false,
          color: isHeader ? WHITE : DARK_TEXT
        })]
      })]
    }))
  });
}

function simpleTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      makeTableRow(headers.map((h, i) => ({ text: h, width: colWidths[i] })), true),
      ...rows.map((row, ri) =>
        makeTableRow(row.map((cell, i) => ({
          text: typeof cell === "string" ? cell : cell.text,
          width: colWidths[i],
          bold: typeof cell === "object" ? cell.bold : false
        })), false, ri % 2 === 1)
      )
    ]
  });
}

// Build document
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: DARK_TEXT },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: DARK_TEXT },
        paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: DARK_TEXT },
        paragraph: { spacing: { before: 200, after: 160 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } } }
        ] },
      { reference: "numbers",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }
        ] },
    ]
  },
  sections: [
    // COVER PAGE
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        spacer(3000),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
          new TextRun({ text: "PM SIMULATOR", font: "Arial", size: 56, bold: true, color: DARK_TEXT })
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [
          new TextRun({ text: "Design Brief for UI Prototyping", font: "Arial", size: 30, color: "666666" })
        ]}),
        spacer(400),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [
          new TextRun({ text: "Prepared for: Visily", font: "Arial", size: 22, color: "888888" })
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [
          new TextRun({ text: "February 2026", font: "Arial", size: 22, color: "888888" })
        ]}),
        spacer(2000),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "A single-player strategy game about being evaluated.", font: "Arial", size: 24, italics: true, color: "999999" })
        ]}),
      ]
    },
    // OVERVIEW + STYLE
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
          new TextRun({ text: "PM Simulator \u2014 Design Brief", font: "Arial", size: 18, color: "AAAAAA" })
        ]})] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "Page ", font: "Arial", size: 18, color: "AAAAAA" }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "AAAAAA" })
        ]})] })
      },
      children: [
        // 1. OVERVIEW
        heading("1. Product Overview", HeadingLevel.HEADING_1),
        para("PM Simulator is a single-player strategy game where the player acts as a Product Manager at a SaaS company. They prioritize work across sprints, navigate shifting stakeholder priorities, and receive a year-end performance review that is only loosely correlated with their actual decisions."),
        para("The game is not about building the best product. It is about being evaluated."),
        spacer(80),
        heading("Core Loop", HeadingLevel.HEADING_3),
        richBulletItem([{ text: "One game = 1 year = 4 quarters = 12 sprints", bold: false }]),
        bulletItem("Each sprint: review a backlog of tickets, select within capacity, commit, see results"),
        bulletItem("Each quarter: receive a Product Pulse (customer health) and a Quarterly Review"),
        bulletItem("Year-end: receive a final Performance Review on a bell curve"),
        spacer(80),
        heading("Screens to Design", HeadingLevel.HEADING_3),
        richBulletItem([{ text: "Screen 1: ", bold: true }, { text: "Start Menu / Home" }]),
        richBulletItem([{ text: "Screen 2: ", bold: true }, { text: "Kanban Board (main gameplay)" }]),
        richBulletItem([{ text: "Screen 3: ", bold: true }, { text: "Sprint Retro (results overlay/modal)" }]),
        richBulletItem([{ text: "Screen 4: ", bold: true }, { text: "Product Pulse (quarterly, overlay/modal)" }]),
        richBulletItem([{ text: "Screen 5: ", bold: true }, { text: "Quarterly Review (overlay/modal)" }]),
        richBulletItem([{ text: "Screen 6: ", bold: true }, { text: "Year-End Review (full screen)" }]),

        // VISUAL STYLE
        new Paragraph({ children: [new PageBreak()] }),
        heading("2. Visual Style Direction", HeadingLevel.HEADING_1),

        heading("Mood", HeadingLevel.HEADING_3),
        para("Dark, muted, slightly ominous. Think: a project management tool designed by someone who has seen too much. Not playful or cartoonish. Not grim either. The aesthetic of a well-designed corporate dashboard that quietly judges you."),
        spacer(80),

        heading("Color Palette", HeadingLevel.HEADING_3),
        simpleTable(
          ["Role", "Color", "Hex", "Usage"],
          [
            ["Background (primary)", "Deep navy/charcoal", "#1A1A2E", "Main background, panels"],
            ["Background (surface)", "Dark slate", "#16213E", "Cards, ticket containers, modals"],
            ["Background (elevated)", "Muted blue-gray", "#0F3460", "Hover states, selected tickets"],
            ["Text (primary)", "Off-white", "#E8E8E8", "All body text, labels"],
            ["Text (secondary)", "Muted gray", "#8899AA", "Descriptions, secondary info"],
            ["Accent (positive)", "Teal/green", "#16A085", "Success states, positive trends"],
            ["Accent (warning)", "Amber", "#E67E22", "Caution states, mixed signals"],
            ["Accent (negative)", "Muted red", "#C0392B", "Failures, declining trends, debt"],
            ["Accent (neutral)", "Soft blue", "#3498DB", "Interactive elements, links, capacity bar"],
            ["Highlight", "Gold/cream", "#F1C40F", "CEO-aligned ticket indicators, star icons"],
          ],
          [2400, 2200, 1600, 3160]
        ),
        spacer(120),

        heading("Typography", HeadingLevel.HEADING_3),
        richBulletItem([{ text: "Primary: ", bold: true }, { text: "Inter or IBM Plex Sans. Clean, modern, slightly industrial." }]),
        richBulletItem([{ text: "Monospace accent: ", bold: true }, { text: "JetBrains Mono or IBM Plex Mono for metrics values, effort points, and capacity numbers." }]),
        richBulletItem([{ text: "No serif fonts. ", bold: true }, { text: "Nothing warm. This is a corporate tool that happens to be a game." }]),
        bulletItem("Ticket titles: 14px semibold. Descriptions: 12px regular, secondary text color. Metric labels: 11px uppercase, letter-spaced."),
        spacer(80),

        heading("Visual References", HeadingLevel.HEADING_3),
        richBulletItem([{ text: "Linear (linear.app): ", bold: true }, { text: "Dark mode, clean card layout, subtle hierarchy. The primary reference for the Kanban board." }]),
        richBulletItem([{ text: "Balatro: ", bold: true }, { text: "The card game. Dark background, expressive card states, satisfying selection UI. Reference for ticket interaction feel." }]),
        richBulletItem([{ text: "Notion (dark mode): ", bold: true }, { text: "Information density without clutter. Reference for metric displays and review screens." }]),
        richBulletItem([{ text: "Bitburner / Hacknet: ", bold: true }, { text: "Hacker-aesthetic strategy games. Reference for the dry, terminal-adjacent tone." }]),

        heading("Iconography", HeadingLevel.HEADING_3),
        richBulletItem([{ text: "Sentiment faces: ", bold: true }, { text: "5-tier emoji-style faces ranging from Very Unhappy to Very Happy. Flat/geometric style, single color (teal for happy, amber for neutral, red for unhappy). Not cartoonish, not realistic. Think: if a design system had opinions." }]),
        richBulletItem([{ text: "Trend arrows: ", bold: true }, { text: "Simple directional indicators. Single arrow (up/down) or double arrow (surging/declining). Color-coded: teal for positive trends, red for negative, gray for flat." }]),
        richBulletItem([{ text: "CEO star: ", bold: true }, { text: "Small gold star icon on CEO-aligned tickets. Subtle but unmissable." }]),
        bulletItem("Category icons: minimal line icons per ticket category (gear for tech debt, users for self-serve, briefcase for enterprise, palette for UX, rocket for moonshot, etc.)"),

        // SCREEN SPECS
        new Paragraph({ children: [new PageBreak()] }),
        heading("3. Screen Specifications", HeadingLevel.HEADING_1),

        // SCREEN 1: START MENU
        heading("Screen 1: Start Menu / Home", HeadingLevel.HEADING_2),
        para("Purpose: Establish tone, set stakes, get into the game fast."),
        spacer(80),

        heading("Layout", HeadingLevel.HEADING_3),
        richBulletItem([{ text: "Full-screen dark background ", bold: false }, { text: "(#1A1A2E)" }]),
        richBulletItem([{ text: "Centered content block, ", bold: false }, { text: "vertically middle-aligned, max-width ~600px" }]),
        bulletItem("No sidebar, no nav. Single focused column."),
        spacer(80),

        heading("Components (top to bottom)", HeadingLevel.HEADING_3),

        richPara([{ text: "Game Title: ", bold: true }, { text: "\"PM SIMULATOR\" in large, bold, off-white type. Below it, a one-line tagline in muted gray italic: \"A game about being evaluated.\"" }]),

        richPara([{ text: "Primary Actions (vertically stacked buttons):", bold: true }]),
        richBulletItem([{ text: "\"New Game\" ", bold: true }, { text: "button \u2014 solid accent blue (#3498DB), full-width within the content block. Always visible." }]),
        richBulletItem([{ text: "\"Continue\" ", bold: true }, { text: "button \u2014 outlined/secondary style. Only visible if a saved game exists. Shows subtle context: \"Q2 Sprint 1 \u2014 Normal\"" }]),
        spacer(40),

        richPara([{ text: "Difficulty Selector: ", bold: true }, { text: "Appears after clicking \"New Game\". Three horizontally arranged cards or a toggle group:" }]),
        simpleTable(
          ["Difficulty", "Label", "Subtext"],
          [
            ["Easy", "\"Startup Culture\"", "\"Forgiving stakeholders, manageable scope.\""],
            ["Normal", "\"Series B\"", "\"The real thing. No safety net.\""],
            ["Hard", "\"Public Company\"", "\"The board has opinions. Good luck.\""],
          ],
          [1800, 3000, 4560]
        ),
        spacer(120),

        richPara([{ text: "Game History (below actions): ", bold: true }, { text: "If completed games exist, show a compact list of past runs:" }]),
        para("Format per row: [Difficulty icon] [Final Rating] [Date]. Example: \"\u25CF Normal \u2014 Meets Expectations \u2014 Jan 2026\". Muted text, small font. Clicking does nothing in v1.", { size: 20, italic: true }),
        spacer(80),

        richPara([{ text: "Narrative Setup (on selecting difficulty): ", bold: true }, { text: "Brief 2-3 sentence intro before the game begins. Displayed as a modal or interstitial over the start screen. Example:" }]),
        para("\"Q1. Fresh year, clean slate, cautiously optimistic OKRs that will age like milk. You're the new PM. The CEO kicked off the quarter with an all-hands about 'enterprise growth,' accompanied by a slide deck with the word 'leverage' on it four times.\"", { italic: true, size: 20 }),
        spacer(80),

        richPara([{ text: "Interaction: ", bold: true }, { text: "Player clicks \"Let's go\" or similar CTA to enter the Kanban Board." }]),

        // SCREEN 2: KANBAN BOARD
        new Paragraph({ children: [new PageBreak()] }),
        heading("Screen 2: Kanban Board (Main Gameplay)", HeadingLevel.HEADING_2),
        para("Purpose: This is where the player lives for 90% of the game. Every decision happens here. It must be scannable, interactive, and never feel like actual project management software."),
        spacer(80),

        heading("Layout: Three-Zone Structure", HeadingLevel.HEADING_3),
        para("The screen is divided into three persistent zones:"),
        spacer(40),

        simpleTable(
          ["Zone", "Position", "Content"],
          [
            ["Header Bar", "Fixed top, full width", "Quarter/Sprint indicator, CEO focus, capacity bar, Commit button"],
            ["Metrics Sidebar", "Fixed left, ~220px wide", "All 7 visible metrics with face/arrow indicators"],
            ["Kanban Area", "Remaining space, scrollable", "Three swim lanes: Backlog, Committed, Done"],
          ],
          [2000, 2800, 4560]
        ),
        spacer(160),

        heading("Zone A: Header Bar", HeadingLevel.HEADING_3),
        para("Fixed to top. Dark surface background (#16213E). Single horizontal row of elements:"),
        spacer(40),

        richPara([{ text: "Left cluster:", bold: true }]),
        richBulletItem([{ text: "Quarter/Sprint badge: ", bold: true }, { text: "\"Q1 \u2022 Sprint 2\" in monospace, pill-shaped container" }]),
        richBulletItem([{ text: "CEO Focus indicator: ", bold: true }, { text: "Gold star icon + label. Example: \"\u2605 CEO Focus: Enterprise Growth\". This changes quarterly (and sometimes mid-quarter via events)." }]),
        spacer(40),

        richPara([{ text: "Center:", bold: true }]),
        richBulletItem([{ text: "Capacity bar: ", bold: true }, { text: "Horizontal progress bar showing used/total sprint points. Format: \"12 / 21 pts\". Bar fills left-to-right in accent blue. Turns amber at 80%+. Turns red when overbooked (>100%). Overbook zone (100%-125%) shown as a subtle dashed extension of the bar." }]),
        spacer(40),

        richPara([{ text: "Right cluster:", bold: true }]),
        richBulletItem([{ text: "\"Commit Sprint\" button: ", bold: true }, { text: "Solid accent blue. Disabled (grayed) until at least one ticket is committed. Shows confirmation tooltip on hover if overbooked: \"You're overbooked by 4 pts. The team will notice.\"" }]),
        spacer(120),

        heading("Zone B: Metrics Sidebar", HeadingLevel.HEADING_3),
        para("Fixed left column. Dark background. Displays all 7 player-visible metrics vertically stacked. Each metric is a compact card:"),
        spacer(40),

        simpleTable(
          ["Element", "Specification"],
          [
            ["Label", "Metric name in 11px uppercase, letter-spaced, secondary text color"],
            ["Indicator (sentiments)", "Face icon (5 tiers) + tier label (\"Happy\", \"Neutral\", etc.)"],
            ["Indicator (growth/debt)", "Trend arrow icon (5 tiers) + tier label (\"Growing\", \"Declining\", etc.)"],
            ["Color coding", "Teal for positive, amber for neutral, red for negative tiers"],
            ["Trend micro-indicator", "Small up/down/flat arrow next to the face/arrow showing direction of change since last sprint. Gray if first sprint."],
          ],
          [3200, 6160]
        ),
        spacer(80),

        para("Metric display order (top to bottom):"),
        richBulletItem([{ text: "Sentiments: ", bold: true }, { text: "Team, CEO, Sales, CTO \u2014 displayed as faces" }]),
        richBulletItem([{ text: "Divider line", bold: false }]),
        richBulletItem([{ text: "Growth: ", bold: true }, { text: "Self-Serve, Enterprise \u2014 displayed as trend arrows" }]),
        richBulletItem([{ text: "Divider line", bold: false }]),
        richBulletItem([{ text: "Debt: ", bold: true }, { text: "Tech Debt \u2014 displayed as inverted trend arrow (high = bad)" }]),
        spacer(120),

        heading("Zone C: Kanban Area", HeadingLevel.HEADING_3),
        para("Three vertical swim lanes occupying the main content area:"),
        spacer(40),

        simpleTable(
          ["Lane", "Contents", "Interaction"],
          [
            ["Backlog (leftmost)", "7-10 ticket cards generated for this sprint", "Click or drag to move to Committed"],
            ["Committed (center)", "Tickets the player has selected for this sprint", "Click or drag to move back to Backlog"],
            ["Done (rightmost)", "Tickets completed in previous sprints this quarter", "Read-only. Shows outcome badges."],
          ],
          [2400, 3800, 3160]
        ),
        spacer(120),

        heading("Ticket Card Design", HeadingLevel.HEADING_3),
        para("Each ticket is a card in the Kanban lanes. Cards must be scannable in under 3 seconds."),
        spacer(40),

        simpleTable(
          ["Element", "Position", "Specification"],
          [
            ["Title", "Top of card", "14px semibold, off-white. 2-5 words. Example: \"SSO for Meridian Health\""],
            ["Effort badge", "Top-right corner", "Monospace number in a small pill. Example: \"7 pts\". Color: accent blue."],
            ["CEO star", "Next to title (if aligned)", "Small gold star icon. Tooltip: \"Aligned with CEO focus\""],
            ["Category icon", "Left of title or as a subtle tag", "Tiny line icon indicating type (gear, users, briefcase, etc.)"],
            ["Description", "Below title", "12px, secondary text color. 1-2 sentences including tradeoff. Example: \"Should boost enterprise growth. The team is unenthused about another enterprise checkbox.\""],
            ["Card background", "Full card", "Dark surface (#16213E) in Backlog. Slightly lighter (#0F3460) when in Committed."],
            ["Hover state", "On mouse hover", "Subtle border glow in accent blue. Card slightly elevates (shadow)."],
            ["Mandatory tag", "Top-left, if hijack ticket", "Red \"MANDATORY\" badge. Card has subtle red left-border."],
          ],
          [2000, 2400, 4960]
        ),
        spacer(80),

        para("Done lane tickets show an outcome badge overlaid on the card:"),
        simpleTable(
          ["Outcome", "Badge Color", "Badge Text"],
          [
            ["Clear success", "Teal (#16A085)", "\"Shipped\""],
            ["Partial success", "Teal, muted (#1ABC9C80)", "\"Partial\""],
            ["Unexpected impact", "Amber (#E67E22)", "\"Unexpected\""],
            ["Soft failure", "Muted red (#C0392B80)", "\"Stalled\""],
            ["Catastrophe", "Bright red (#E74C3C)", "\"Failed\""],
          ],
          [2800, 3200, 3360]
        ),

        // SCREEN 3: SPRINT RETRO
        new Paragraph({ children: [new PageBreak()] }),
        heading("Screen 3: Sprint Retro", HeadingLevel.HEADING_2),
        para("Purpose: Reveal consequences. This appears as a modal or full overlay after the player commits a sprint and the game resolves outcomes."),
        spacer(80),

        heading("Layout", HeadingLevel.HEADING_3),
        richBulletItem([{ text: "Full-screen overlay ", bold: false }, { text: "with dark semi-transparent backdrop" }]),
        richBulletItem([{ text: "Centered content panel, ", bold: false }, { text: "max-width ~700px, scrollable" }]),
        bulletItem("\"Sprint Retro\" header at top with quarter/sprint label"),
        spacer(80),

        heading("Components (top to bottom)", HeadingLevel.HEADING_3),

        richPara([{ text: "1. Ticket Outcomes Section:", bold: true }]),
        para("Each committed ticket displayed as a compact row:"),
        simpleTable(
          ["Element", "Specification"],
          [
            ["Ticket title", "Left-aligned, 14px semibold"],
            ["Outcome badge", "Right of title. Colored pill: \"Shipped\" / \"Partial\" / \"Unexpected\" / \"Stalled\" / \"Failed\""],
            ["Outcome narrative", "Below title. 1-2 sentences in secondary text, italic. The dry, corporate retro commentary."],
          ],
          [2400, 6960]
        ),
        spacer(80),

        richPara([{ text: "2. Metric Changes Section:", bold: true }]),
        para("Compact grid showing directional changes to each metric this sprint:"),
        simpleTable(
          ["Element", "Specification"],
          [
            ["Metric name", "Small label, uppercase"],
            ["Direction indicator", "Colored arrow: green up, red down, gray flat"],
            ["Before/After tiers", "\"Neutral \u2192 Happy\" or \"Manageable \u2192 Mounting\""],
          ],
          [2400, 6960]
        ),
        para("Only show metrics that changed. If all metrics held steady, show: \"No significant metric changes this sprint.\" (This should be rare.)", { italic: true, size: 20 }),
        spacer(80),

        richPara([{ text: "3. Events Section (conditional):", bold: true }]),
        para("If any events triggered between this sprint and the next, show them here:"),
        bulletItem("Event title in bold, description below in secondary text"),
        bulletItem("Visual treatment: slightly different background (subtle amber tint) to distinguish from ticket outcomes"),
        bulletItem("Example: \"CEO Attended a Conference\" \u2014 followed by the dry narrative"),
        spacer(80),

        richPara([{ text: "4. Summary Narrative:", bold: true }]),
        para("A 3-5 sentence paragraph summarizing the sprint. Dry, corporate retro tone. Pulled from the sprint retro template system. Displayed in a slightly elevated card with left border accent."),
        spacer(80),

        richPara([{ text: "5. Continue Button:", bold: true }]),
        para("\"Next Sprint\" button at the bottom. If this was the last sprint of a quarter, button reads \"View Product Pulse\" instead."),

        // SCREEN 4: PRODUCT PULSE
        new Paragraph({ children: [new PageBreak()] }),
        heading("Screen 4: Product Pulse (Quarterly)", HeadingLevel.HEADING_2),
        para("Purpose: Give the player indirect reads on hidden metrics (NPS, system health) through qualitative customer signals. Appears at the end of each quarter before the Quarterly Review."),
        spacer(80),

        heading("Layout", HeadingLevel.HEADING_3),
        bulletItem("Modal overlay, same treatment as Sprint Retro"),
        bulletItem("\"Product Pulse \u2014 Q[n]\" header"),
        bulletItem("Centered content panel, max-width ~600px"),
        spacer(80),

        heading("Components", HeadingLevel.HEADING_3),
        richPara([{ text: "Three signal cards, vertically stacked:", bold: true }]),
        spacer(40),

        simpleTable(
          ["Signal", "States", "Visual Treatment"],
          [
            ["Churn", "Positive / Mixed / Concerning", "Card with colored left border (teal / amber / red)"],
            ["Support Load", "Positive / Mixed / Concerning", "Same card treatment"],
            ["Customer Sentiment", "Positive / Mixed / Concerning", "Same card treatment"],
          ],
          [2400, 3200, 3760]
        ),
        spacer(80),
        para("Each card shows:"),
        richBulletItem([{ text: "Signal name ", bold: true }, { text: "(label, uppercase, small)" }]),
        richBulletItem([{ text: "Status badge ", bold: true }, { text: "in colored pill (\"Positive\" in teal, \"Mixed\" in amber, \"Concerning\" in red)" }]),
        richBulletItem([{ text: "No further detail per card. ", bold: true }, { text: "The status is the signal. Keep it fast." }]),
        spacer(80),

        richPara([{ text: "Below the cards: Pulse narrative.", bold: true }, { text: " A 3-4 sentence paragraph contextualizing all three signals together. Tone: analytical, slightly ominous when things are mixed/concerning. Pulled from the product pulse template system." }]),
        spacer(80),
        para("Continue button: \"View Quarterly Review\""),

        // SCREEN 5: QUARTERLY REVIEW
        heading("Screen 5: Quarterly Review", HeadingLevel.HEADING_2),
        para("Purpose: The player's report card for the quarter. Narrative feedback that references what happened."),
        spacer(80),

        heading("Layout", HeadingLevel.HEADING_3),
        bulletItem("Modal overlay or dedicated panel, same treatment"),
        bulletItem("\"Quarterly Review \u2014 Q[n]\" header"),
        spacer(80),

        heading("Components", HeadingLevel.HEADING_3),

        richPara([{ text: "1. Rating Badge:", bold: true }, { text: " Large, centered. One of four ratings:" }]),
        simpleTable(
          ["Rating", "Color", "Tone"],
          [
            ["Strong", "Teal", "\"Complimentary, but still hedged\""],
            ["Solid", "Soft blue", "\"Good work, some areas for growth\""],
            ["Mixed", "Amber", "\"Showed promise, but inconsistent\""],
            ["Below Expectations", "Muted red", "\"Politely devastating\""],
          ],
          [2800, 2400, 4160]
        ),
        spacer(80),

        richPara([{ text: "2. Review Narrative:", bold: true }, { text: " 3-5 sentences of corporate review-speak below the rating. References CEO focus, metric trends, notable events, and pulse health. Pulled from the quarterly review template system." }]),
        spacer(80),
        richPara([{ text: "3. Factor Breakdown (optional, compact):", bold: true }, { text: " A small, muted section showing what contributed:" }]),
        bulletItem("CEO Alignment: [indicator]"),
        bulletItem("Growth Trajectory: [indicator]"),
        bulletItem("Stability: [indicator]"),
        bulletItem("Customer Health: [indicator]"),
        para("Each factor shown as a simple colored dot (teal/amber/red) or mini bar. No numbers. Directional only.", { italic: true, size: 20 }),
        spacer(80),
        para("Continue button: \"Next Quarter\" (or \"View Year-End Review\" after Q4)"),

        // SCREEN 6: YEAR-END REVIEW
        new Paragraph({ children: [new PageBreak()] }),
        heading("Screen 6: Year-End Review", HeadingLevel.HEADING_2),
        para("Purpose: The big reveal. The game's climax. This is where the bell curve lives and the player's year of decisions gets a single, reductive label."),
        spacer(80),

        heading("Layout", HeadingLevel.HEADING_3),
        richBulletItem([{ text: "Full screen. ", bold: true }, { text: "Not a modal. This deserves the whole viewport." }]),
        bulletItem("Dark background, single centered column, max-width ~650px"),
        bulletItem("Slow reveal / staggered animation (rating appears first, then narrative fades in)"),
        spacer(80),

        heading("Components (top to bottom)", HeadingLevel.HEADING_3),

        richPara([{ text: "1. Year Label:", bold: true }, { text: " \"Year-End Performance Review\" in uppercase, letter-spaced, muted text. Small. Understated." }]),
        spacer(40),

        richPara([{ text: "2. Final Rating (the centerpiece):", bold: true }]),
        para("Large text, centered. Color-coded. This is the single most important piece of text in the entire game."),
        spacer(40),
        simpleTable(
          ["Rating", "Color", "Font Size"],
          [
            ["Exceeds Expectations", "Gold (#F1C40F)", "36-42px, bold"],
            ["Meets Expectations (Strong)", "Teal (#16A085)", "36-42px, bold"],
            ["Meets Expectations", "Muted gray (#8899AA)", "36-42px, bold"],
            ["Needs Improvement", "Amber (#E67E22)", "36-42px, bold"],
            ["Does Not Meet Expectations", "Muted red (#C0392B)", "36-42px, bold"],
          ],
          [3800, 2800, 2760]
        ),
        spacer(80),

        richPara([{ text: "3. Calibration Note:", bold: true }, { text: " A single line below the rating in small, italic, muted text. Example: \"Calibrated against peer cohort.\" This is the game telling you the bell curve was applied. No further explanation." }]),
        spacer(40),

        richPara([{ text: "4. Review Narrative:", bold: true }, { text: " 4-6 sentences of year-end review prose. The tone peaks here: dry, corporate, devastating if mediocre, grudgingly complimentary if excellent. This is the writing showcase of the game." }]),
        spacer(40),

        richPara([{ text: "5. Quarter-by-Quarter Mini Summary:", bold: true }, { text: " A compact horizontal row of four cards, one per quarter:" }]),
        bulletItem("Each card shows: \"Q[n]\" label + quarterly rating badge (Strong/Solid/Mixed/Below)"),
        bulletItem("Provides a visual trajectory. Four teal cards tell a different story than teal-amber-red-teal."),
        spacer(40),

        richPara([{ text: "6. Actions:", bold: true }]),
        richBulletItem([{ text: "\"Play Again\" ", bold: true }, { text: "button \u2014 primary, accent blue" }]),
        richBulletItem([{ text: "\"Back to Menu\" ", bold: true }, { text: "button \u2014 secondary, outlined" }]),
        spacer(120),

        // INTERACTION NOTES
        heading("4. Interaction & Animation Notes", HeadingLevel.HEADING_1),
        spacer(40),

        heading("Kanban Board Interactions", HeadingLevel.HEADING_3),
        richBulletItem([{ text: "Ticket selection: ", bold: true }, { text: "Click to toggle between Backlog and Committed lanes. Optionally support drag-and-drop." }]),
        richBulletItem([{ text: "Capacity feedback: ", bold: true }, { text: "Capacity bar updates instantly on ticket selection. Color shifts at thresholds (blue \u2192 amber \u2192 red)." }]),
        richBulletItem([{ text: "Overbook warning: ", bold: true }, { text: "When capacity exceeds 100%, the capacity bar extends into a dashed \"danger zone\" with a subtle pulse animation. Tooltip: \"The team will notice.\"" }]),
        richBulletItem([{ text: "Mandatory tickets: ", bold: true }, { text: "Pre-placed in Committed lane. Red left-border. Cannot be dragged back to Backlog. Tooltip: \"This is non-negotiable.\"" }]),
        richBulletItem([{ text: "CEO star: ", bold: true }, { text: "Tickets aligned with CEO focus have a persistent gold star. No explanation needed \u2014 players learn what it means." }]),
        spacer(80),

        heading("Sprint Resolution", HeadingLevel.HEADING_3),
        richBulletItem([{ text: "On commit: ", bold: true }, { text: "Brief loading/processing state (1-2 seconds). Not instant \u2014 the pause builds tension. A subtle progress bar or \"resolving outcomes...\" text." }]),
        richBulletItem([{ text: "Retro reveal: ", bold: true }, { text: "Ticket outcomes appear one at a time with a short stagger delay (~300ms each). Color-coded badges animate in. The player watches their decisions resolve sequentially." }]),
        spacer(80),

        heading("Year-End Reveal", HeadingLevel.HEADING_3),
        richBulletItem([{ text: "Staggered reveal: ", bold: true }, { text: "\"Year-End Performance Review\" label fades in first. Pause (1s). Rating text types out letter by letter or fades in. Pause (1s). Calibration note fades in. Pause (1s). Narrative fades in paragraph by paragraph." }]),
        richBulletItem([{ text: "This is the game's punchline. ", bold: true }, { text: "Give it room to land." }]),
        spacer(120),

        // RESPONSIVE
        heading("5. Responsive Considerations", HeadingLevel.HEADING_1),
        spacer(40),
        richBulletItem([{ text: "Primary target: ", bold: true }, { text: "Desktop (1280px+ viewport). This is a decision-making game that benefits from screen real estate." }]),
        richBulletItem([{ text: "Minimum viable: ", bold: true }, { text: "1024px wide. Metrics sidebar collapses to a horizontal bar at top on narrow viewports." }]),
        richBulletItem([{ text: "Mobile: ", bold: true }, { text: "Not a v1 priority, but if attempted: stack Kanban lanes vertically (tabbed), collapse metrics to an expandable drawer." }]),
        spacer(120),

        // WHAT NOT TO DO
        heading("6. What This Is Not", HeadingLevel.HEADING_1),
        spacer(40),
        para("A few specific anti-patterns to avoid:"),
        spacer(40),
        richBulletItem([{ text: "Not a real Kanban tool. ", bold: true }, { text: "Don't add filters, sorting, search, or columns for assignees. The simplicity is the point." }]),
        richBulletItem([{ text: "Not a dashboard. ", bold: true }, { text: "No charts, no graphs, no sparklines. Metrics are faces and arrows. That's it." }]),
        richBulletItem([{ text: "Not colorful. ", bold: true }, { text: "The dark palette is essential. Accent colors are used sparingly. If a screenshot looks vibrant, something's wrong." }]),
        richBulletItem([{ text: "Not cute. ", bold: true }, { text: "The tone is dry corporate, not playful indie game. No illustrated characters, no confetti, no achievement popups." }]),
        richBulletItem([{ text: "Not information-dense. ", bold: true }, { text: "A player should be able to scan the board and make a decision in under 10 seconds. If they're reading, we've failed." }]),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/practical-jolly-mendel/mnt/outputs/pm-simulator-visily-brief.docx", buffer);
  console.log("Done: pm-simulator-visily-brief.docx");
});
