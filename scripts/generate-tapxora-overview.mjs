import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import PptxGenJS from "pptxgenjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const docsDir = path.join(rootDir, "docs");
const assetsDir = path.join(docsDir, "training-assets");

const brand = {
  name: "TAPXORA LIMS APP",
  title: "Detailed Training Guide and Demo Deck",
  accent: rgb(0.1, 0.31, 0.76),
  accentHex: "1D4ED8",
  accentDarkHex: "1E3A8A",
  softHex: "EFF6FF",
  softGrayHex: "F8FAFC",
  borderHex: "BFDBFE",
  textHex: "0F172A",
  mutedHex: "475569"
};

const roleCards = [
  {
    title: "Admin",
    body:
      "Creates tests, assigns roles, reviews audit logs, manages settings, and oversees the whole laboratory workflow."
  },
  {
    title: "Receptionist",
    body:
      "Creates patient records, opens lab orders, confirms patient details, and supports front desk registration."
  },
  {
    title: "Lab Scientist",
    body:
      "Receives samples, updates sample status, enters test results, and supports stock usage logging."
  },
  {
    title: "Verifier",
    body:
      "Checks entered results, confirms they are safe to release, and approves final reports."
  },
  {
    title: "Accountant",
    body:
      "Monitors invoices, records payments, prints receipts, and reviews daily revenue summaries."
  }
];

const quickFlow = [
  "1. User signs in",
  "2. Patient is registered",
  "3. Order is created with one or more tests",
  "4. Sample label is generated and attached",
  "5. Sample is received, stored, and tracked",
  "6. Result is entered by laboratory staff",
  "7. Result is verified by an authorized verifier",
  "8. Report is printed or downloaded",
  "9. Invoice and receipt are handled",
  "10. Dashboard, stock, and audit logs stay updated"
];

const moduleGuides = [
  {
    title: "1. Introduction: What TAPXORA LIMS APP Does",
    why:
      "This app helps a laboratory run its work from beginning to end. It keeps patient records, tracks samples, saves results, prints reports, records payments, and watches inventory in one connected system.",
    steps: [
      "Think of the app as the lab's organized notebook, calculator, tracker, and report printer combined into one safe digital workspace.",
      "Every action in the lab moves through a clear path: patient, order, sample, result, report, and payment.",
      "Because the app is offline first, staff can keep working when the internet is poor and sync later."
    ],
    tips: [
      "Use this guide during staff onboarding, product demonstrations, and refresher training.",
      "The easiest way to teach the app is to follow one sample patient through the full workflow."
    ]
  },
  {
    title: "2. User Registration and Sign In",
    why:
      "Nobody can use the app until they have an account. The entry screens are the first place new users learn how to enter the system.",
    steps: [
      "Open the Register page.",
      "Type the user's full name, email address, and password.",
      "Click Create Account to save the new login.",
      "The user can also request a magic link if passwordless sign in is preferred.",
      "After registration, the user can return to the Login page and sign in."
    ],
    tips: [
      "Use work email addresses so each account is easy to trace.",
      "If a role changes after the user is logged in, ask the user to sign out and sign in again."
    ]
  },
  {
    title: "3. Roles and Access Control",
    why:
      "People in the laboratory do different jobs. The app uses roles so each person sees the tools that match their responsibilities.",
    steps: [
      "Find the user in the profiles table or admin user management area.",
      "Assign one role: Admin, Receptionist, LabScientist, Verifier, or Accountant.",
      "Confirm the user belongs to the correct facility so records stay properly separated.",
      "Test the role by signing in and checking that the correct menu items appear."
    ],
    tips: [
      "Admins should be few because they can control major settings.",
      "Role based screens reduce confusion and lower the risk of accidental changes."
    ]
  },
  {
    title: "4. Patient Registration and Consent",
    why:
      "A clean patient record makes every later step safer. If the patient identity is wrong, the sample and result workflow can also become wrong.",
    steps: [
      "Open the Patients page and click New Patient.",
      "Enter the patient's name, phone number, sex, date of birth, and address.",
      "Add extra details such as emergency contact, notes, and local identifiers when available.",
      "Tick the NDPR consent checkbox before saving.",
      "Save the patient and confirm the patient appears in the search list."
    ],
    tips: [
      "Use the phone number carefully because it helps staff find returning patients quickly.",
      "Do not create duplicate patient records unless you have confirmed the person is truly new."
    ]
  },
  {
    title: "5. Patient Search and History",
    why:
      "When a patient returns, staff should not start from zero. Search and history help the team find old records, repeat orders, and earlier reports.",
    steps: [
      "Open the patient list.",
      "Search by patient name, phone number, or lab ID.",
      "Open the patient profile.",
      "Review previous orders, previous results, and earlier billing records if needed."
    ],
    tips: [
      "History is especially useful for follow up care and repeat investigations.",
      "Use filters when the patient list grows large."
    ]
  },
  {
    title: "6. Test Catalogue Management",
    why:
      "The test catalogue is the master list of tests the lab offers. It controls pricing, result formats, and reference ranges.",
    steps: [
      "Open the Test Catalogue module as an Admin.",
      "Create a test and enter the test name and price.",
      "Choose the result type such as numeric, text, dropdown, or positive or negative.",
      "Enter a reference range using min and max values or plain text when needed.",
      "Set the test to active so it becomes available during order creation."
    ],
    tips: [
      "Inactive tests stay hidden from new orders but remain in history.",
      "Correct pricing here helps billing remain automatic and accurate."
    ]
  },
  {
    title: "7. Creating a Lab Order",
    why:
      "An order connects the patient to one or more requested tests. This is the official start of the laboratory job.",
    steps: [
      "Open the Orders page.",
      "Search for and select the patient.",
      "Choose one or more tests from the active catalogue.",
      "Set priority such as routine, urgent, or stat if your workflow uses it.",
      "Save the order so sample items can be generated."
    ],
    tips: [
      "Double check the patient before saving.",
      "One patient can have multiple tests inside the same order."
    ]
  },
  {
    title: "8. Sample Collection, Barcode Labels, and Storage",
    why:
      "Samples must be labelled correctly and stored correctly. This reduces mistakes and supports chain of custody tracking.",
    steps: [
      "After the order is created, print the generated sample barcode or QR label.",
      "Attach the label to the correct sample container immediately.",
      "Confirm the label matches the patient name, order, and requested test.",
      "Record where the sample is kept, such as bench, fridge, freezer, tray, rack, or shelf.",
      "Add collection notes when necessary, for example if the sample was difficult to collect or delayed."
    ],
    tips: [
      "Never place an unlabeled sample aside to label later.",
      "Good storage notes make it easier to locate the sample during follow up work."
    ]
  },
  {
    title: "9. Sample Reception, Tracking, and Chain of Custody",
    why:
      "The lab should always know where the sample is and who handled it. This is important for trust, traceability, and quality control.",
    steps: [
      "Open Sample Reception.",
      "Scan the barcode or type the sample code.",
      "Confirm the patient, order number, and test.",
      "Move the sample through status stages such as Registered, Collected, In Progress, Results Entered, Verified, and Reported.",
      "Allow the system to log each action in the custody history."
    ],
    tips: [
      "If a sample issue is noticed, record it immediately instead of waiting.",
      "Staff should update status as work happens so the dashboard stays useful."
    ]
  },
  {
    title: "10. Results Entry",
    why:
      "This is where the scientific work is entered into the system. Clean result entry supports good reporting and good verification.",
    steps: [
      "Open the Results Entry workspace.",
      "Choose the correct sample and test.",
      "Use the correct form type based on the test setup: numeric, text, dropdown, or positive or negative.",
      "Review any automatic abnormal flag generated from the reference range.",
      "Save the result for verification."
    ],
    tips: [
      "Always confirm the patient and sample before typing a result.",
      "Use comments when the result needs extra explanation."
    ]
  },
  {
    title: "11. Result Verification and Approval",
    why:
      "Verification is a safety checkpoint. A second authorized person confirms the result before the report is released.",
    steps: [
      "Open the verification queue.",
      "Review the entered value, comments, and abnormal flag.",
      "Compare the result to the correct patient and sample.",
      "Approve the result if everything is correct.",
      "If something is wrong, reject it and return it for correction."
    ],
    tips: [
      "This two step process improves quality and lowers reporting errors.",
      "Verified results become ready for professional report generation."
    ]
  },
  {
    title: "12. Report Printing and Download",
    why:
      "Verified results can be turned into clean medical reports for clinicians and patients.",
    steps: [
      "Open the Reports module.",
      "Choose a verified order.",
      "Review the patient details, test names, values, units, flags, and comments.",
      "Download the PDF report or use the print action.",
      "Release the report only after final review."
    ],
    tips: [
      "Printed reports should be easy to read and professionally formatted.",
      "Use the report view during demos because it helps users see the final value of the system."
    ]
  },
  {
    title: "13. Billing, Invoices, and Receipts",
    why:
      "Billing keeps the business side of the lab connected to the service side. Orders, prices, invoices, and payments stay linked together.",
    steps: [
      "Open the Billing module.",
      "Review the invoice automatically created from the ordered tests.",
      "Check the payment status: unpaid, partial, or paid.",
      "Record the amount received and payment method.",
      "Generate or print a receipt after payment is saved."
    ],
    tips: [
      "Automatic pricing works best when the test catalogue is accurate.",
      "Daily revenue summaries help supervisors review business performance."
    ]
  },
  {
    title: "14. Inventory and Reagent Tracking",
    why:
      "The lab cannot work smoothly when reagents and consumables run out. Inventory makes shortages visible early.",
    steps: [
      "Open Inventory and create items such as reagents, kits, tubes, gloves, and consumables.",
      "Enter quantity, lot number, expiry date, and reorder level.",
      "Record stock in when new items arrive.",
      "Record stock out or usage when staff use items during daily work.",
      "Watch low stock and near expiry alerts on the dashboard."
    ],
    tips: [
      "Lot numbers are useful for traceability during quality review.",
      "Do not wait until stock finishes before updating quantities."
    ]
  },
  {
    title: "15. Dashboards, Audit Logs, and Offline Work",
    why:
      "Managers need a clear summary of operations, and the system needs to remain useful when internet quality is weak.",
    steps: [
      "Use the dashboard to see today's worklist, turnaround time, test volume, revenue, and alerts.",
      "Use the audit logs viewer to see who changed what and when.",
      "When the internet drops, continue working with the offline mode.",
      "Allow queued changes to sync when connectivity returns."
    ],
    tips: [
      "Audit logs help during supervision, investigations, and compliance review.",
      "Offline support is especially important in real Nigerian lab environments."
    ]
  },
  {
    title: "16. Full Training Demo Script",
    why:
      "The best way to teach the app is to act out a complete patient journey from start to finish.",
    steps: [
      "Create one user account and explain what role that user has.",
      "Register one patient and explain the consent checkbox.",
      "Create one order with two tests.",
      "Show the barcode label and explain where the sample is stored.",
      "Move the sample through status updates.",
      "Enter one result, verify it, print the report, and record payment.",
      "End by showing inventory alerts, dashboard summaries, and the audit log."
    ],
    tips: [
      "This simple story based demo is easy for first time users to remember.",
      "Even a child can follow the workflow when each step is shown in order."
    ]
  }
];

async function maybeReadFile(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

function chunk(items, size) {
  const groups = [];
  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }
  return groups;
}

function drawWrappedText(page, text, options) {
  const { x, y, width, font, size, color, lineHeight = size * 1.35 } = options;
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const candidateWidth = font.widthOfTextAtSize(candidate, size);
    if (candidateWidth > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  lines.forEach((line, index) => {
    page.drawText(line, {
      x,
      y: y - index * lineHeight,
      size,
      font,
      color
    });
  });

  return y - lines.length * lineHeight;
}

function drawFooter(page, pageNumber, font) {
  page.drawLine({
    start: { x: 36, y: 32 },
    end: { x: 559, y: 32 },
    thickness: 1,
    color: rgb(0.86, 0.9, 0.95)
  });
  page.drawText("TAPXORA LIMS APP | Training Guide", {
    x: 40,
    y: 18,
    size: 8.5,
    font,
    color: rgb(0.34, 0.39, 0.46)
  });
  page.drawText(`Page ${pageNumber}`, {
    x: 514,
    y: 18,
    size: 8.5,
    font,
    color: rgb(0.34, 0.39, 0.46)
  });
}

function drawSectionHeader(page, title, regular, bold, y) {
  page.drawRectangle({
    x: 40,
    y: y - 14,
    width: 515,
    height: 26,
    color: rgb(0.93, 0.96, 1)
  });
  page.drawText(title, {
    x: 50,
    y,
    size: 14.5,
    font: bold,
    color: brand.accent
  });
  return y - 28;
}

function drawBullet(page, text, x, y, width, regular) {
  page.drawCircle({
    x,
    y: y - 4,
    size: 2.1,
    color: brand.accent
  });
  return drawWrappedText(page, text, {
    x: x + 12,
    y,
    width,
    font: regular,
    size: 10.6,
    color: rgb(0.1, 0.14, 0.2),
    lineHeight: 15
  });
}

function drawStepCard(page, stepText, body, x, y, width, regular, bold) {
  page.drawRectangle({
    x,
    y: y - 64,
    width,
    height: 64,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.75, 0.86, 0.98),
    borderWidth: 1
  });
  page.drawText(stepText, {
    x: x + 10,
    y: y - 18,
    size: 11.5,
    font: bold,
    color: brand.accent
  });
  drawWrappedText(page, body, {
    x: x + 10,
    y: y - 34,
    width: width - 20,
    font: regular,
    size: 9.7,
    color: rgb(0.12, 0.16, 0.22),
    lineHeight: 13
  });
}

function drawPptTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.5,
    y: 0.3,
    w: 11.8,
    h: 0.45,
    fontFace: "Aptos Display",
    fontSize: 23,
    bold: true,
    color: brand.textHex
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5,
      y: 0.78,
      w: 12.0,
      h: 0.3,
      fontFace: "Aptos",
      fontSize: 10.5,
      color: brand.mutedHex
    });
  }
}

function addPptBullets(slide, bullets, options = {}) {
  const {
    x = 0.8,
    y = 1.45,
    w = 11.4,
    h = 4.8,
    fontSize = 16
  } = options;

  slide.addText(
    bullets.map((text) => ({ text })),
    {
      x,
      y,
      w,
      h,
      bullet: { indent: 16 },
      fontFace: "Aptos",
      fontSize,
      color: brand.textHex,
      paraSpaceAfterPt: 12,
      breakLine: false
    }
  );
}

function addPptInfoCard(slide, title, body, options) {
  const { x, y, w, h } = options;
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    rectRadius: 0.05,
    fill: { color: brand.softHex },
    line: { color: brand.borderHex, pt: 1 }
  });
  slide.addText(title, {
    x: x + 0.14,
    y: y + 0.12,
    w: w - 0.28,
    h: 0.24,
    fontFace: "Aptos Display",
    fontSize: 14,
    bold: true,
    color: brand.accentHex
  });
  slide.addText(body, {
    x: x + 0.14,
    y: y + 0.4,
    w: w - 0.28,
    h: h - 0.5,
    fontFace: "Aptos",
    fontSize: 11,
    color: brand.textHex
  });
}

async function generatePdf() {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const loginBytes = await maybeReadFile(path.join(assetsDir, "login.png"));
  const registerBytes = await maybeReadFile(path.join(assetsDir, "register.png"));
  const loginImage = loginBytes ? await pdfDoc.embedPng(loginBytes) : null;
  const registerImage = registerBytes ? await pdfDoc.embedPng(registerBytes) : null;
  const pageSize = { width: 595.28, height: 841.89 };

  let pageNumber = 1;

  const addPage = () => pdfDoc.addPage([pageSize.width, pageSize.height]);

  let page = addPage();
  page.drawRectangle({
    x: 0,
    y: pageSize.height - 170,
    width: pageSize.width,
    height: 170,
    color: brand.accent
  });
  page.drawText(brand.name, {
    x: 40,
    y: pageSize.height - 76,
    size: 29,
    font: bold,
    color: rgb(1, 1, 1)
  });
  page.drawText(brand.title, {
    x: 40,
    y: pageSize.height - 110,
    size: 14,
    font: regular,
    color: rgb(0.9, 0.95, 1)
  });
  drawWrappedText(
    page,
    "This training document explains TAPXORA LIMS APP in simple language. It is written for onboarding, live demonstrations, staff training, and refresher sessions. The aim is to make every major part of the app easy to understand, even for a first time user.",
    {
      x: 40,
      y: pageSize.height - 210,
      width: 500,
      font: regular,
      size: 12,
      color: rgb(0.11, 0.14, 0.2),
      lineHeight: 18
    }
  );
  page.drawRectangle({
    x: 40,
    y: 450,
    width: 515,
    height: 205,
    color: rgb(0.95, 0.97, 1)
  });
  page.drawText("The Whole Journey In One View", {
    x: 54,
    y: 626,
    size: 16,
    font: bold,
    color: brand.accent
  });

  let flowY = 598;
  for (const item of quickFlow) {
    flowY = drawBullet(page, item, 58, flowY, 460, regular) - 8;
  }

  page.drawText("Training Tip", {
    x: 54,
    y: 396,
    size: 13,
    font: bold,
    color: brand.accent
  });
  drawWrappedText(
    page,
    "The easiest demo is to follow one patient from account access, to patient registration, to order creation, to sample tracking, to result entry, to report printing, and finally to billing.",
    {
      x: 54,
      y: 376,
      width: 470,
      font: regular,
      size: 11,
      color: rgb(0.16, 0.2, 0.26),
      lineHeight: 16
    }
  );
  drawFooter(page, pageNumber, regular);

  pageNumber += 1;
  page = addPage();
  page.drawText("Entry Screens For New Users", {
    x: 40,
    y: 790,
    size: 18,
    font: bold,
    color: brand.accent
  });
  drawWrappedText(
    page,
    "These are real screenshots from the live app. They are useful during training because they show the exact first pages staff will see when they open the system.",
    {
      x: 40,
      y: 764,
      width: 510,
      font: regular,
      size: 11,
      color: rgb(0.16, 0.2, 0.26),
      lineHeight: 16
    }
  );
  if (loginImage) {
    const dims = loginImage.scale(0.19);
    page.drawImage(loginImage, {
      x: 40,
      y: 412,
      width: dims.width,
      height: dims.height
    });
    page.drawText("Login page: users can sign in with email and password or request a magic link.", {
      x: 40,
      y: 394,
      size: 10,
      font: regular,
      color: rgb(0.34, 0.39, 0.46)
    });
  }
  if (registerImage) {
    const dims = registerImage.scale(0.19);
    page.drawImage(registerImage, {
      x: 40,
      y: 96,
      width: dims.width,
      height: dims.height
    });
    page.drawText("Register page: new staff enter their name, email, and password to create an account.", {
      x: 40,
      y: 78,
      size: 10,
      font: regular,
      color: rgb(0.34, 0.39, 0.46)
    });
  }
  drawFooter(page, pageNumber, regular);

  pageNumber += 1;
  page = addPage();
  page.drawText("User Roles And What Each Role Does", {
    x: 40,
    y: 790,
    size: 18,
    font: bold,
    color: brand.accent
  });
  drawWrappedText(
    page,
    "A good training session should explain that users do not all see the same tools. The system shows menus based on responsibility.",
    {
      x: 40,
      y: 764,
      width: 510,
      font: regular,
      size: 11,
      color: rgb(0.16, 0.2, 0.26),
      lineHeight: 16
    }
  );
  let roleY = 716;
  for (const role of roleCards) {
    page.drawRectangle({
      x: 40,
      y: roleY - 66,
      width: 515,
      height: 66,
      color: rgb(0.97, 0.98, 1),
      borderColor: rgb(0.75, 0.86, 0.98),
      borderWidth: 1
    });
    page.drawText(role.title, {
      x: 52,
      y: roleY - 18,
      size: 12.5,
      font: bold,
      color: brand.accent
    });
    drawWrappedText(page, role.body, {
      x: 52,
      y: roleY - 36,
      width: 486,
      font: regular,
      size: 10.5,
      color: rgb(0.12, 0.16, 0.22),
      lineHeight: 14
    });
    roleY -= 84;
  }
  drawFooter(page, pageNumber, regular);

  for (const group of chunk(moduleGuides, 2)) {
    pageNumber += 1;
    page = addPage();
    let cursorY = 790;

    for (const section of group) {
      cursorY = drawSectionHeader(page, section.title, regular, bold, cursorY);
      cursorY = drawWrappedText(page, section.why, {
        x: 40,
        y: cursorY,
        width: 510,
        font: regular,
        size: 10.8,
        color: rgb(0.16, 0.2, 0.26),
        lineHeight: 15
      });
      cursorY -= 8;

      page.drawText("Step by step", {
        x: 40,
        y: cursorY,
        size: 11.5,
        font: bold,
        color: brand.accent
      });
      cursorY -= 16;

      for (const step of section.steps) {
        cursorY = drawBullet(page, step, 46, cursorY, 492, regular) - 6;
      }

      page.drawText("Helpful notes", {
        x: 40,
        y: cursorY,
        size: 11.5,
        font: bold,
        color: brand.accent
      });
      cursorY -= 16;

      for (const tip of section.tips) {
        cursorY = drawBullet(page, tip, 46, cursorY, 492, regular) - 6;
      }

      cursorY -= 10;
    }

    drawFooter(page, pageNumber, regular);
  }

  pageNumber += 1;
  page = addPage();
  page.drawText("Simple End To End Demo Walkthrough", {
    x: 40,
    y: 790,
    size: 18,
    font: bold,
    color: brand.accent
  });
  drawWrappedText(
    page,
    "Use this page when you want to show the app quickly during a meeting, training class, or client presentation. Each card represents one simple action in the order people should learn it.",
    {
      x: 40,
      y: 764,
      width: 510,
      font: regular,
      size: 11,
      color: rgb(0.16, 0.2, 0.26),
      lineHeight: 16
    }
  );

  const cards = [
    ["Step 1", "Register a user account or sign in with a prepared account."],
    ["Step 2", "Explain the user's role and which menu items that role can see."],
    ["Step 3", "Register one patient and tick the NDPR consent checkbox."],
    ["Step 4", "Create one lab order with one or two tests."],
    ["Step 5", "Show the barcode label and explain sample storage location."],
    ["Step 6", "Update sample status and explain chain of custody."],
    ["Step 7", "Enter one result and point out abnormal flags."],
    ["Step 8", "Verify the result, print the report, and record payment."]
  ];

  let cardIndex = 0;
  let topY = 690;
  for (let row = 0; row < 4; row += 1) {
    drawStepCard(page, cards[cardIndex][0], cards[cardIndex][1], 40, topY, 245, regular, bold);
    cardIndex += 1;
    drawStepCard(page, cards[cardIndex][0], cards[cardIndex][1], 310, topY, 245, regular, bold);
    cardIndex += 1;
    topY -= 98;
  }
  drawFooter(page, pageNumber, regular);

  const outputPath = path.join(docsDir, "TAPXORA-LIMS-APP-Overview.pdf");
  await fs.writeFile(outputPath, await pdfDoc.save());
  return outputPath;
}

async function generatePptx() {
  const pptx = new PptxGenJS();
  const loginPath = path.join(assetsDir, "login.png");
  const registerPath = path.join(assetsDir, "register.png");
  const hasLogin = Boolean(await maybeReadFile(loginPath));
  const hasRegister = Boolean(await maybeReadFile(registerPath));

  pptx.author = "OpenAI Codex";
  pptx.company = "TAPXORA";
  pptx.subject = "TAPXORA LIMS APP detailed training deck";
  pptx.title = "TAPXORA LIMS APP Training Guide";
  pptx.layout = "LAYOUT_WIDE";
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
    lang: "en-NG"
  };

  const cover = pptx.addSlide();
  cover.background = { color: "F8FBFF" };
  cover.addShape("rect", {
    x: 0,
    y: 0,
    w: 13.333,
    h: 1.2,
    fill: { color: brand.accentHex },
    line: { color: brand.accentHex }
  });
  cover.addText(brand.name, {
    x: 0.58,
    y: 1.72,
    w: 7.6,
    h: 0.72,
    fontFace: "Aptos Display",
    fontSize: 28,
    bold: true,
    color: brand.textHex
  });
  cover.addText(brand.title, {
    x: 0.58,
    y: 2.48,
    w: 7.6,
    h: 0.38,
    fontFace: "Aptos",
    fontSize: 16,
    color: brand.mutedHex
  });
  cover.addText(
    "A step by step guide for onboarding, live demos, product training, and day to day laboratory use.",
    {
      x: 0.58,
      y: 3.06,
      w: 8.7,
      h: 0.7,
      fontFace: "Aptos",
      fontSize: 12.5,
      color: brand.mutedHex
    }
  );
  addPptInfoCard(
    cover,
    "Best Teaching Method",
    "Follow one patient from login to report printing. That single story helps new users understand the full system quickly.",
    { x: 8.6, y: 1.78, w: 3.95, h: 2.0 }
  );

  const overview = pptx.addSlide();
  overview.background = { color: "FFFFFF" };
  drawPptTitle(overview, "What The App Is", "A complete laboratory workflow system.");
  addPptBullets(overview, [
    "TAPXORA LIMS APP helps the laboratory register patients, create orders, track samples, enter results, verify reports, collect payments, and monitor stock.",
    "The app is designed for real daily work, not just record storage.",
    "Its offline first setup is especially important where internet quality may be unstable."
  ]);

  const roles = pptx.addSlide();
  roles.background = { color: "FFFFFF" };
  drawPptTitle(roles, "Who Uses The App", "Each role sees the tools that match the job.");
  addPptInfoCard(roles, "Admin", roleCards[0].body, { x: 0.6, y: 1.35, w: 3.9, h: 1.4 });
  addPptInfoCard(roles, "Receptionist", roleCards[1].body, { x: 4.7, y: 1.35, w: 3.9, h: 1.4 });
  addPptInfoCard(roles, "Lab Scientist", roleCards[2].body, { x: 8.8, y: 1.35, w: 3.9, h: 1.4 });
  addPptInfoCard(roles, "Verifier", roleCards[3].body, { x: 2.65, y: 3.15, w: 3.9, h: 1.4 });
  addPptInfoCard(roles, "Accountant", roleCards[4].body, { x: 6.75, y: 3.15, w: 3.9, h: 1.4 });

  const entry = pptx.addSlide();
  entry.background = { color: "FFFFFF" };
  drawPptTitle(entry, "Login And Registration", "Real screenshots from the live app.");
  if (hasLogin) {
    entry.addImage({ path: loginPath, x: 0.55, y: 1.3, w: 5.85, h: 4.6 });
    entry.addText("Login page", {
      x: 0.75,
      y: 5.98,
      w: 1.7,
      h: 0.2,
      fontFace: "Aptos",
      fontSize: 10,
      color: brand.mutedHex
    });
  }
  if (hasRegister) {
    entry.addImage({ path: registerPath, x: 6.8, y: 1.3, w: 5.85, h: 4.6 });
    entry.addText("Register page", {
      x: 7.0,
      y: 5.98,
      w: 2.0,
      h: 0.2,
      fontFace: "Aptos",
      fontSize: 10,
      color: brand.mutedHex
    });
  }

  const registration = pptx.addSlide();
  registration.background = { color: "FFFFFF" };
  drawPptTitle(registration, "How To Register Users", "Simple steps for new staff access.");
  addPptBullets(registration, [
    "Open the Register page and enter full name, email, and password.",
    "Create the account or use the magic link option.",
    "Open user management or profiles and assign the correct role.",
    "Confirm the user belongs to the correct facility.",
    "Ask the user to sign in again if a role change was made after login."
  ]);
  addPptInfoCard(
    registration,
    "Training Note",
    "Explain that account creation and role assignment are related but not the same. A user can exist before the final role is assigned.",
    { x: 7.9, y: 1.8, w: 4.3, h: 2.0 }
  );

  const patient = pptx.addSlide();
  patient.background = { color: "FFFFFF" };
  drawPptTitle(patient, "How To Register A Patient", "This is the beginning of the care journey.");
  addPptBullets(patient, [
    "Open Patients and click New Patient.",
    "Enter name, phone, sex, date of birth, and address.",
    "Add extra information such as notes or emergency contact when available.",
    "Tick the NDPR consent checkbox.",
    "Save the record and confirm the patient appears in the patient list."
  ]);
  addPptInfoCard(
    patient,
    "Why It Matters",
    "If patient identity is entered correctly here, the later sample and result workflow becomes safer and easier.",
    { x: 7.8, y: 1.8, w: 4.35, h: 2.1 }
  );

  const patientSearch = pptx.addSlide();
  patientSearch.background = { color: "FFFFFF" };
  drawPptTitle(patientSearch, "How To Search Patients And See History", "Useful for returning patients.");
  addPptBullets(patientSearch, [
    "Search by patient name, phone number, or lab ID.",
    "Open the patient profile to see previous orders.",
    "Use patient history to review previous results or repeat investigations.",
    "Apply filters when the list becomes large."
  ]);

  const testsSlide = pptx.addSlide();
  testsSlide.background = { color: "FFFFFF" };
  drawPptTitle(testsSlide, "Test Catalogue", "The master list of services and prices.");
  addPptBullets(testsSlide, [
    "Admins create and edit available tests.",
    "Each test includes name, price, result type, and reference range.",
    "Active tests appear during order creation.",
    "Correct test setup keeps results and billing accurate."
  ]);
  addPptInfoCard(
    testsSlide,
    "Reference Ranges",
    "A range may be numeric, such as a minimum and maximum value, or text when the lab uses a written normal range format.",
    { x: 7.95, y: 1.7, w: 4.2, h: 1.95 }
  );

  const orders = pptx.addSlide();
  orders.background = { color: "FFFFFF" };
  drawPptTitle(orders, "Creating A Lab Order", "This connects the patient to the requested tests.");
  addPptBullets(orders, [
    "Open Orders and select the patient.",
    "Choose one or more tests from the catalogue.",
    "Set priority when needed.",
    "Save the order so the system can generate sample work items."
  ]);
  addPptInfoCard(
    orders,
    "What Happens Next",
    "Once the order is saved, the app can create barcode or QR labels and prepare the sample tracking workflow.",
    { x: 8.0, y: 1.8, w: 4.15, h: 1.85 }
  );

  const samples = pptx.addSlide();
  samples.background = { color: "FFFFFF" };
  drawPptTitle(samples, "Sample Collection, Labeling, And Storage", "One of the most important quality steps.");
  addPptBullets(samples, [
    "Print the sample barcode or QR label immediately after the order is created.",
    "Attach the label to the correct sample container.",
    "Confirm the patient, order, and test match the label.",
    "Store the sample in the right location such as tray, rack, fridge, or freezer.",
    "Record notes if collection was delayed or unusual."
  ]);

  const tracking = pptx.addSlide();
  tracking.background = { color: "FFFFFF" };
  drawPptTitle(tracking, "Sample Reception And Tracking", "Track where the sample is and who handled it.");
  addPptBullets(tracking, [
    "Scan the barcode or type the sample code.",
    "Confirm the patient and test.",
    "Move status through Registered, Collected, In Progress, Results Entered, Verified, and Reported.",
    "Use chain of custody logs to review handling history."
  ]);
  addPptInfoCard(
    tracking,
    "Why Staff Like This",
    "It reduces 'Where is this sample?' confusion and helps the dashboard show real progress.",
    { x: 8.0, y: 1.9, w: 4.1, h: 1.7 }
  );

  const results = pptx.addSlide();
  results.background = { color: "FFFFFF" };
  drawPptTitle(results, "Results Entry", "Different tests can use different result forms.");
  addPptBullets(results, [
    "Open the result queue and choose the right sample.",
    "Enter the result using the test's configured type: numeric, text, dropdown, or positive or negative.",
    "Review abnormal flags created from the reference range.",
    "Save the result for verification."
  ]);
  addPptInfoCard(
    results,
    "Safety Reminder",
    "Always confirm the patient and sample code before typing the result value.",
    { x: 8.1, y: 1.8, w: 4.0, h: 1.6 }
  );

  const verify = pptx.addSlide();
  verify.background = { color: "FFFFFF" };
  drawPptTitle(verify, "Result Verification And Report Printing", "A two step process for safer reporting.");
  addPptBullets(verify, [
    "Open the verification queue and review the entered result.",
    "Check values, comments, patient identity, and flags.",
    "Approve the result if correct, or return it for correction if needed.",
    "Open Reports and print or download the professional PDF report."
  ]);

  const billing = pptx.addSlide();
  billing.background = { color: "FFFFFF" };
  drawPptTitle(billing, "Billing And Receipts", "The business side of the laboratory.");
  addPptBullets(billing, [
    "Invoices are created from the prices of the ordered tests.",
    "Payment status can be unpaid, partial, or paid.",
    "Record payment amount and method.",
    "Print or download the receipt after payment."
  ]);
  addPptInfoCard(
    billing,
    "Manager Benefit",
    "Revenue summaries help the lab see daily financial performance without manual calculation.",
    { x: 8.0, y: 1.9, w: 4.15, h: 1.7 }
  );

  const inventory = pptx.addSlide();
  inventory.background = { color: "FFFFFF" };
  drawPptTitle(inventory, "Inventory Management", "Track reagents, consumables, and expiry risks.");
  addPptBullets(inventory, [
    "Create inventory items and set quantity, lot number, expiry date, and reorder level.",
    "Record stock in and stock out transactions.",
    "Watch low stock and near expiry alerts.",
    "Use this module to reduce interruptions during daily lab work."
  ]);

  const dashboard = pptx.addSlide();
  dashboard.background = { color: "FFFFFF" };
  drawPptTitle(dashboard, "Dashboards, Audit Logs, And Offline Work", "Control, visibility, and continuity.");
  addPptBullets(dashboard, [
    "Dashboards show today's worklist, turnaround time, test trends, revenue, and alerts.",
    "Audit logs let admins review who changed what and when.",
    "Offline support lets staff continue working during weak internet and sync later."
  ]);

  const demo = pptx.addSlide();
  demo.background = { color: "FFFFFF" };
  drawPptTitle(demo, "Recommended Live Demo Flow", "A short script for training sessions.");
  addPptBullets(demo, [
    "Show login and registration.",
    "Explain the user roles.",
    "Register one patient.",
    "Create one order with two tests.",
    "Show the sample label and storage explanation.",
    "Enter one result, verify it, and print the report.",
    "Record a payment and show the dashboard and inventory alerts."
  ]);

  const closing = pptx.addSlide();
  closing.background = { color: "F8FBFF" };
  drawPptTitle(closing, "Simple Summary", "The app helps the lab stay organized.");
  addPptBullets(closing, [
    "It helps the lab know who the patient is.",
    "It helps the lab know what test was requested.",
    "It helps the lab know where the sample is.",
    "It helps the lab know what result was entered and whether it was checked.",
    "It helps the lab know whether payment and stock records are complete."
  ]);
  addPptInfoCard(
    closing,
    "Child Friendly Explanation",
    "A patient comes in. The lab writes the details, takes the sample, checks the result, prints the answer, and keeps the work organized from start to finish.",
    { x: 7.85, y: 1.8, w: 4.2, h: 2.0 }
  );

  const outputPath = path.join(docsDir, "TAPXORA-LIMS-APP-Overview.pptx");
  await pptx.writeFile({ fileName: outputPath });
  return outputPath;
}

async function main() {
  await fs.mkdir(docsDir, { recursive: true });
  await fs.mkdir(assetsDir, { recursive: true });

  const [pdfPath, pptxPath] = await Promise.all([generatePdf(), generatePptx()]);

  console.log(`Created ${pdfPath}`);
  console.log(`Created ${pptxPath}`);
}

main().catch((error) => {
  console.error("Failed to generate TAPXORA training assets.");
  console.error(error);
  process.exitCode = 1;
});
