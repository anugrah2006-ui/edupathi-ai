import type {
  TargetRole,
  LearnerProfile,
  SkillGap,
  Roadmap,
  Mission,
  MissionEvaluation,
} from "./types";

// ─── Target Roles ───────────────────────────────────────────────

export const TARGET_ROLES: TargetRole[] = [
  {
    id: "ai-engineer",
    title: "AI Engineer",
    description: "Design, build, and deploy artificial intelligence models and scalable AI systems.",
    icon: "🧠",
    category: "AI / ML",
    requiredSkills: [
      { name: "Python", level: 5, category: "technical" },
      { name: "Machine Learning", level: 5, category: "technical" },
      { name: "Deep Learning (PyTorch/TensorFlow)", level: 4, category: "technical" },
      { name: "Natural Language Processing (NLP)", level: 4, category: "technical" },
      { name: "Prompt Engineering", level: 4, category: "technical" },
      { name: "Vector Databases", level: 3, category: "technical" },
      { name: "MLOps", level: 3, category: "technical" },
      { name: "Data Structures & Algorithms", level: 4, category: "technical" },
      { name: "Cloud Platforms (AWS/GCP)", level: 3, category: "technical" },
      { name: "Math & Statistics", level: 4, category: "domain" },
      { name: "Problem Solving", level: 5, category: "soft" },
      { name: "Research", level: 3, category: "domain" },
      { name: "Communication", level: 3, category: "soft" }
    ],
  },
  {
    id: "fullstack-developer",
    title: "Full Stack Developer",
    description: "Work across the entire stack — from frontend user interfaces to backend APIs and databases.",
    icon: "🔗",
    category: "Engineering",
    requiredSkills: [
      { name: "JavaScript/TypeScript", level: 5, category: "technical" },
      { name: "React / Next.js", level: 4, category: "technical" },
      { name: "Node.js", level: 4, category: "technical" },
      { name: "HTML & CSS / Tailwind", level: 4, category: "technical" },
      { name: "SQL & Relational Databases", level: 4, category: "technical" },
      { name: "NoSQL Databases", level: 3, category: "technical" },
      { name: "REST APIs", level: 5, category: "technical" },
      { name: "GraphQL", level: 3, category: "technical" },
      { name: "Git & Version Control", level: 4, category: "technical" },
      { name: "Testing (Jest/Cypress)", level: 3, category: "technical" },
      { name: "CI/CD", level: 3, category: "technical" },
      { name: "Web Security", level: 3, category: "domain" },
      { name: "System Design", level: 3, category: "domain" },
      { name: "Team Collaboration", level: 4, category: "soft" }
    ],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    description: "Turn raw data into actionable insights using analytics, statistical methods, and visualization.",
    icon: "📊",
    category: "Data",
    requiredSkills: [
      { name: "SQL", level: 5, category: "technical" },
      { name: "Data Visualization (Tableau/PowerBI)", level: 5, category: "technical" },
      { name: "Python / R", level: 4, category: "technical" },
      { name: "Excel / Spreadsheets", level: 5, category: "technical" },
      { name: "Statistics", level: 4, category: "domain" },
      { name: "Data Cleaning / Preprocessing", level: 4, category: "technical" },
      { name: "A/B Testing", level: 3, category: "technical" },
      { name: "Storytelling with Data", level: 5, category: "soft" },
      { name: "Business Acumen", level: 4, category: "domain" },
      { name: "Critical Thinking", level: 5, category: "soft" },
      { name: "Dashboard Design", level: 4, category: "technical" },
      { name: "ETL Processes", level: 3, category: "technical" }
    ],
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    description: "Design and build scalable APIs, database schemas, and robust server-side systems.",
    icon: "⚙️",
    category: "Engineering",
    requiredSkills: [
      { name: "Server-side Language (Node/Python/Java/Go)", level: 5, category: "technical" },
      { name: "API Design (REST/GraphQL/gRPC)", level: 5, category: "technical" },
      { name: "Relational Databases (PostgreSQL/MySQL)", level: 5, category: "technical" },
      { name: "NoSQL Databases (MongoDB/Redis)", level: 4, category: "technical" },
      { name: "System Architecture", level: 4, category: "domain" },
      { name: "Docker & Containerization", level: 4, category: "technical" },
      { name: "Caching Strategies", level: 3, category: "technical" },
      { name: "Message Queues (Kafka/RabbitMQ)", level: 3, category: "technical" },
      { name: "Cloud Infrastructure (AWS/Azure)", level: 3, category: "technical" },
      { name: "Security & Authentication (OAuth/JWT)", level: 4, category: "technical" },
      { name: "CI/CD & DevOps basics", level: 3, category: "technical" },
      { name: "Performance Optimization", level: 4, category: "technical" },
      { name: "Unit & Integration Testing", level: 4, category: "technical" },
      { name: "Problem Solving", level: 5, category: "soft" }
    ],
  }
];

// ─── Mock Learner Profile ───────────────────────────────────────

export const MOCK_LEARNER_PROFILE: LearnerProfile = {
  name: "Alex Rivera",
  currentRole: "Junior Developer",
  yearsOfExperience: 2,
  education: [
    {
      degree: "B.S.",
      field: "Computer Science",
      institution: "State University",
      year: 2023,
    },
  ],
  skills: [
    { name: "React", level: 2, source: "resume" },
    { name: "TypeScript", level: 2, source: "resume" },
    { name: "CSS / Tailwind", level: 3, source: "resume" },
    { name: "Next.js", level: 1, source: "resume" },
    { name: "Testing", level: 1, source: "resume" },
    { name: "System Design", level: 1, source: "resume" },
    { name: "Communication", level: 2, source: "resume" },
  ],
  projects: [
    {
      name: "Personal Portfolio",
      description: "Built a responsive portfolio website using React and CSS.",
      technologies: ["React", "CSS", "Vercel"],
    },
    {
      name: "Todo App",
      description: "A task management app with drag-and-drop support.",
      technologies: ["React", "TypeScript", "localStorage"],
    },
  ],
  certifications: ["freeCodeCamp Responsive Web Design"],
};

// ─── Mock Skill Gaps (for Frontend Engineer) ────────────────────

export const MOCK_SKILL_GAPS: SkillGap[] = [
  {
    skillName: "React",
    currentLevel: 2,
    requiredLevel: 4,
    gap: 2,
    priority: "critical",
    category: "technical",
  },
  {
    skillName: "TypeScript",
    currentLevel: 2,
    requiredLevel: 4,
    gap: 2,
    priority: "critical",
    category: "technical",
  },
  {
    skillName: "Next.js",
    currentLevel: 1,
    requiredLevel: 3,
    gap: 2,
    priority: "high",
    category: "technical",
  },
  {
    skillName: "Testing",
    currentLevel: 1,
    requiredLevel: 3,
    gap: 2,
    priority: "high",
    category: "technical",
  },
  {
    skillName: "CSS / Tailwind",
    currentLevel: 3,
    requiredLevel: 4,
    gap: 1,
    priority: "medium",
    category: "technical",
  },
  {
    skillName: "System Design",
    currentLevel: 1,
    requiredLevel: 2,
    gap: 1,
    priority: "medium",
    category: "technical",
  },
  {
    skillName: "Communication",
    currentLevel: 2,
    requiredLevel: 3,
    gap: 1,
    priority: "low",
    category: "soft",
  },
];

// ─── Mock Today's Mission ───────────────────────────────────────

export const MOCK_CURRENT_MISSION: Mission = {
  id: "mission-w1-d1",
  title: "Build a Reusable Button Component",
  description:
    "Create a fully typed, reusable Button component in React with TypeScript. It should support variants (primary, secondary, outline), sizes (sm, md, lg), a loading state, and be accessible.",
  difficulty: "intermediate",
  type: "coding",
  estimatedMinutes: 45,
  skillsFocused: ["React", "TypeScript", "CSS / Tailwind"],
  content: `## Your Mission

Create a \`Button\` component that meets the following requirements:

### Requirements
1. **Variants**: \`primary\`, \`secondary\`, \`outline\`, \`ghost\`
2. **Sizes**: \`sm\`, \`md\`, \`lg\`
3. **States**: default, hover, active, disabled, loading
4. **Accessibility**: proper \`aria\` attributes, keyboard navigation
5. **TypeScript**: fully typed props with proper generics

### Bonus
- Add a \`leftIcon\` and \`rightIcon\` prop
- Support \`asChild\` pattern for composability

### Starter Code
\`\`\`tsx
interface ButtonProps {
  // Define your props here
}

export function Button(props: ButtonProps) {
  // Your implementation
}
\`\`\`

Submit your completed component code below.`,
  weekNumber: 1,
  dayNumber: 1,
};

// ─── Mock Last Evaluation ───────────────────────────────────────

export const MOCK_LAST_EVALUATION: MissionEvaluation = {
  missionId: "mission-w1-d0",
  score: 72,
  strengths: [
    "Good understanding of React component patterns",
    "Clean JSX structure and readability",
  ],
  weaknesses: [
    "TypeScript types were too loose — used `any` in two places",
    "Missing accessibility attributes (aria-label, role)",
    "No loading state handling",
  ],
  feedback:
    "You're showing solid React fundamentals! Your component structure is clean. Focus on strengthening your TypeScript skills — avoid `any` types and use discriminated unions for variant props. Also, always consider accessibility from the start.",
  nextMissionHints: [
    "Next mission will focus on TypeScript generics and strict typing",
    "You'll practice adding ARIA attributes for accessibility",
  ],
};

// ─── Mock Roadmap ───────────────────────────────────────────────

export const MOCK_ROADMAP: Roadmap = {
  targetRoleId: "frontend-engineer",
  createdAt: new Date(),
  totalMissions: 20,
  completedMissions: 1,
  weeks: [
    {
      weekNumber: 1,
      theme: "React & TypeScript Foundations",
      description:
        "Master advanced React patterns and TypeScript for building robust components.",
      isCurrent: true,
      isCompleted: false,
      missions: [
        { ...MOCK_CURRENT_MISSION, id: "m-w1-d1" },
        {
          id: "m-w1-d2",
          title: "TypeScript Generics Deep Dive",
          description: "Build a generic data-fetching hook with proper types.",
          difficulty: "intermediate",
          type: "coding",
          estimatedMinutes: 40,
          skillsFocused: ["TypeScript"],
          content: "",
          weekNumber: 1,
          dayNumber: 2,
        },
        {
          id: "m-w1-d3",
          title: "Accessible Form Components",
          description:
            "Create form inputs with validation and screen-reader support.",
          difficulty: "intermediate",
          type: "coding",
          estimatedMinutes: 50,
          skillsFocused: ["React", "CSS / Tailwind"],
          content: "",
          weekNumber: 1,
          dayNumber: 3,
        },
        {
          id: "m-w1-d4",
          title: "State Management Patterns",
          description:
            "Compare useReducer, Zustand, and Context for a shopping cart.",
          difficulty: "intermediate",
          type: "written",
          estimatedMinutes: 35,
          skillsFocused: ["React", "System Design"],
          content: "",
          weekNumber: 1,
          dayNumber: 4,
        },
        {
          id: "m-w1-d5",
          title: "Week 1 Review Quiz",
          description: "Test your React & TypeScript fundamentals.",
          difficulty: "intermediate",
          type: "quiz",
          estimatedMinutes: 20,
          skillsFocused: ["React", "TypeScript"],
          content: "",
          weekNumber: 1,
          dayNumber: 5,
        },
      ],
    },
    {
      weekNumber: 2,
      theme: "Next.js & Modern Tooling",
      description:
        "Learn server components, routing, data fetching, and the modern Next.js stack.",
      isCurrent: false,
      isCompleted: false,
      missions: [
        {
          id: "m-w2-d1",
          title: "Server vs Client Components",
          description: "Build a page mixing server and client components.",
          difficulty: "intermediate",
          type: "coding",
          estimatedMinutes: 45,
          skillsFocused: ["Next.js", "React"],
          content: "",
          weekNumber: 2,
          dayNumber: 1,
        },
        {
          id: "m-w2-d2",
          title: "Dynamic Routes & Data Fetching",
          description: "Create a blog with dynamic routes and ISR.",
          difficulty: "intermediate",
          type: "coding",
          estimatedMinutes: 50,
          skillsFocused: ["Next.js"],
          content: "",
          weekNumber: 2,
          dayNumber: 2,
        },
        {
          id: "m-w2-d3",
          title: "API Routes & Server Actions",
          description: "Build a CRUD API with form handling.",
          difficulty: "advanced",
          type: "coding",
          estimatedMinutes: 55,
          skillsFocused: ["Next.js", "TypeScript"],
          content: "",
          weekNumber: 2,
          dayNumber: 3,
        },
        {
          id: "m-w2-d4",
          title: "Error Handling Patterns",
          description: "Implement error boundaries and loading states.",
          difficulty: "intermediate",
          type: "coding",
          estimatedMinutes: 40,
          skillsFocused: ["Next.js", "React"],
          content: "",
          weekNumber: 2,
          dayNumber: 4,
        },
        {
          id: "m-w2-d5",
          title: "Week 2 Project Review",
          description: "Analyze a Next.js app for best practices.",
          difficulty: "intermediate",
          type: "written",
          estimatedMinutes: 30,
          skillsFocused: ["Next.js"],
          content: "",
          weekNumber: 2,
          dayNumber: 5,
        },
      ],
    },
    {
      weekNumber: 3,
      theme: "Testing & Quality",
      description:
        "Write unit tests, integration tests, and learn testing best practices.",
      isCurrent: false,
      isCompleted: false,
      missions: [
        {
          id: "m-w3-d1",
          title: "Unit Testing with Vitest",
          description: "Test utility functions and hooks.",
          difficulty: "intermediate",
          type: "coding",
          estimatedMinutes: 45,
          skillsFocused: ["Testing", "TypeScript"],
          content: "",
          weekNumber: 3,
          dayNumber: 1,
        },
        {
          id: "m-w3-d2",
          title: "Component Testing with RTL",
          description: "Test React components with React Testing Library.",
          difficulty: "intermediate",
          type: "coding",
          estimatedMinutes: 50,
          skillsFocused: ["Testing", "React"],
          content: "",
          weekNumber: 3,
          dayNumber: 2,
        },
        {
          id: "m-w3-d3",
          title: "Integration Testing",
          description: "Test a full user flow across multiple components.",
          difficulty: "advanced",
          type: "coding",
          estimatedMinutes: 55,
          skillsFocused: ["Testing"],
          content: "",
          weekNumber: 3,
          dayNumber: 3,
        },
        {
          id: "m-w3-d4",
          title: "Testing Async Code",
          description: "Mock APIs and test data fetching patterns.",
          difficulty: "advanced",
          type: "coding",
          estimatedMinutes: 45,
          skillsFocused: ["Testing", "TypeScript"],
          content: "",
          weekNumber: 3,
          dayNumber: 4,
        },
        {
          id: "m-w3-d5",
          title: "Week 3 Testing Challenge",
          description: "Achieve 80% coverage on a given component.",
          difficulty: "advanced",
          type: "project",
          estimatedMinutes: 60,
          skillsFocused: ["Testing", "React"],
          content: "",
          weekNumber: 3,
          dayNumber: 5,
        },
      ],
    },
    {
      weekNumber: 4,
      theme: "System Design & Architecture",
      description:
        "Design component systems, performance optimization, and architecture decisions.",
      isCurrent: false,
      isCompleted: false,
      missions: [
        {
          id: "m-w4-d1",
          title: "Design System Architecture",
          description: "Plan and build a mini design system.",
          difficulty: "advanced",
          type: "project",
          estimatedMinutes: 60,
          skillsFocused: ["System Design", "CSS / Tailwind"],
          content: "",
          weekNumber: 4,
          dayNumber: 1,
        },
        {
          id: "m-w4-d2",
          title: "Performance Optimization",
          description: "Identify and fix performance bottlenecks.",
          difficulty: "advanced",
          type: "coding",
          estimatedMinutes: 50,
          skillsFocused: ["React", "System Design"],
          content: "",
          weekNumber: 4,
          dayNumber: 2,
        },
        {
          id: "m-w4-d3",
          title: "Code Review Simulation",
          description: "Review a PR and provide structured feedback.",
          difficulty: "intermediate",
          type: "written",
          estimatedMinutes: 35,
          skillsFocused: ["Communication", "React"],
          content: "",
          weekNumber: 4,
          dayNumber: 3,
        },
        {
          id: "m-w4-d4",
          title: "Technical Documentation",
          description: "Write docs for a component library.",
          difficulty: "intermediate",
          type: "written",
          estimatedMinutes: 40,
          skillsFocused: ["Communication"],
          content: "",
          weekNumber: 4,
          dayNumber: 4,
        },
        {
          id: "m-w4-d5",
          title: "Final Capstone Project",
          description: "Build a complete feature end-to-end.",
          difficulty: "advanced",
          type: "project",
          estimatedMinutes: 90,
          skillsFocused: [
            "React",
            "TypeScript",
            "Next.js",
            "Testing",
            "CSS / Tailwind",
          ],
          content: "",
          weekNumber: 4,
          dayNumber: 5,
        },
      ],
    },
  ],
};
