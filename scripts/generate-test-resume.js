/* eslint-disable @typescript-eslint/no-require-imports */
// Generate a test resume PDF for the EduPath AI pipeline
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const doc = new PDFDocument({ margin: 50 });
const outputPath = path.join(__dirname, "..", "test-resume.pdf");
doc.pipe(fs.createWriteStream(outputPath));

// Name
doc.fontSize(24).font("Helvetica-Bold").text("Sarah Chen", { align: "center" });
doc.moveDown(0.3);
doc.fontSize(10).font("Helvetica").fillColor("#666666")
  .text("sarah.chen@email.com | San Francisco, CA | github.com/sarahchen", { align: "center" });

doc.moveDown(1);
doc.fillColor("#000000");

// --- SUMMARY ---
doc.fontSize(14).font("Helvetica-Bold").text("PROFESSIONAL SUMMARY");
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown(0.5);
doc.fontSize(10).font("Helvetica")
  .text("Software engineer with 3 years of experience building web applications. Proficient in JavaScript, React, and Node.js. Passionate about creating user-friendly interfaces and scalable backend systems. Looking to transition into a senior frontend engineering role.");

doc.moveDown(1);

// --- EXPERIENCE ---
doc.fontSize(14).font("Helvetica-Bold").text("WORK EXPERIENCE");
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown(0.5);

doc.fontSize(11).font("Helvetica-Bold").text("Software Engineer", { continued: true });
doc.fontSize(10).font("Helvetica").text("  — TechCorp Inc.", { continued: true });
doc.text("  |  Jan 2023 - Present", { align: "right" });
doc.moveDown(0.3);
doc.fontSize(10).font("Helvetica")
  .text("• Built and maintained React-based dashboard used by 50,000+ users")
  .text("• Developed REST APIs using Node.js and Express with PostgreSQL database")
  .text("• Implemented CI/CD pipelines using GitHub Actions and Docker")
  .text("• Collaborated with UX team to improve application accessibility")
  .text("• Technologies: React, TypeScript, Node.js, PostgreSQL, Docker, AWS S3");

doc.moveDown(0.8);

doc.fontSize(11).font("Helvetica-Bold").text("Junior Developer", { continued: true });
doc.fontSize(10).font("Helvetica").text("  — StartupXYZ", { continued: true });
doc.text("  |  Jun 2021 - Dec 2022", { align: "right" });
doc.moveDown(0.3);
doc.fontSize(10).font("Helvetica")
  .text("• Developed full-stack features for an e-commerce platform using React and Node.js")
  .text("• Created responsive landing pages with HTML, CSS, and JavaScript")
  .text("• Wrote unit tests using Jest and React Testing Library")
  .text("• Participated in code reviews and agile sprint planning")
  .text("• Technologies: React, JavaScript, CSS, MongoDB, Jest");

doc.moveDown(1);

// --- EDUCATION ---
doc.fontSize(14).font("Helvetica-Bold").text("EDUCATION");
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown(0.5);

doc.fontSize(11).font("Helvetica-Bold").text("Bachelor of Science in Computer Science", { continued: true });
doc.fontSize(10).font("Helvetica").text("  |  2021", { align: "right" });
doc.text("University of California, Berkeley");

doc.moveDown(1);

// --- PROJECTS ---
doc.fontSize(14).font("Helvetica-Bold").text("PROJECTS");
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown(0.5);

doc.fontSize(11).font("Helvetica-Bold").text("TaskFlow — Project Management App");
doc.fontSize(10).font("Helvetica")
  .text("Full-stack Kanban board with real-time updates using WebSockets. Built with Next.js, TypeScript, Prisma, and PostgreSQL. Features drag-and-drop, team collaboration, and notification system.")
  .text("Technologies: Next.js, TypeScript, Prisma, PostgreSQL, WebSocket, Tailwind CSS");

doc.moveDown(0.5);

doc.fontSize(11).font("Helvetica-Bold").text("WeatherViz — Weather Dashboard");
doc.fontSize(10).font("Helvetica")
  .text("Interactive weather visualization app with charts and maps. Fetches data from OpenWeatherMap API. Built with React, D3.js, and Mapbox GL.")
  .text("Technologies: React, D3.js, Mapbox GL, REST APIs");

doc.moveDown(1);

// --- SKILLS ---
doc.fontSize(14).font("Helvetica-Bold").text("TECHNICAL SKILLS");
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown(0.5);

doc.fontSize(10).font("Helvetica")
  .text("Languages: JavaScript, TypeScript, Python, SQL, HTML, CSS")
  .text("Frontend: React, Next.js, Tailwind CSS, D3.js")
  .text("Backend: Node.js, Express, REST APIs, GraphQL basics")
  .text("Databases: PostgreSQL, MongoDB, Redis")
  .text("Tools: Git, Docker, GitHub Actions, AWS (S3, EC2), Vercel")
  .text("Testing: Jest, React Testing Library")
  .text("Other: Agile/Scrum, Code Reviews, Technical Documentation");

doc.moveDown(1);

// --- CERTIFICATIONS ---
doc.fontSize(14).font("Helvetica-Bold").text("CERTIFICATIONS");
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown(0.5);

doc.fontSize(10).font("Helvetica")
  .text("• AWS Cloud Practitioner (2023)")
  .text("• Meta Frontend Developer Certificate (2022)");

doc.end();

console.log(`✓ Test resume PDF created at: ${outputPath}`);
