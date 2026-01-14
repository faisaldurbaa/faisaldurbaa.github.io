export type CompetitionProject = {
  title: string;
  focus: string;
  roles: string[];
  competition: string;
  yearTag: string;
  achievement?: string;
  problem: string;
  solution: string;
  links?: { label: string; href: string }[];
  theme: "safety" | "health" | "accessibility" | "environment" | "education";
};

export const competitionProjects: CompetitionProject[] = [
  {
    title: "İRİS — Smart Gas Ventilation",
    focus: "Disaster Management",
    roles: ["Team Lead"],
    competition: "Disaster Management",
    yearTag: "TEKNOFEST 2020",
    achievement: "Türkiye Second Place",
    problem:
      "Blocked residential vents to prevent heat loss create dangerous carbon monoxide/gas buildup; passive, fixed-size vents offer no active safety.",
    solution:
      "Arduino Nano + MQ135-driven iris vent that opens/closes automatically and spins a fan on unsafe readings, running off solar-charged battery for hands-off protection.",
    links: [
      { label: "Detail Report", href: "https://drive.google.com/file/d/12iYV3s9JaDqoctW9LlmiHW_XLMPQo4jl" },
      { label: "News", href: "https://www.afad.gov.tr/teknofestte-turkiye-kazandi" },
    ],
    theme: "safety",
  },
  {
    title: "E-seed — Autonomous Reforestation",
    focus: "Disaster Management",
    roles: ["Co-Lead Developer", "Mechatronics"],
    competition: "Disaster Management",
    yearTag: "TEKNOFEST 2024",
    problem:
      "Erosion and deforestation persist because reforestation is slow, labor-heavy, and often late to high-risk areas.",
    solution:
      "UAV with LIDAR/camera maps terrain, on-board analysis flags erosion hotspots, then drops humidity-triggered self-burying E-seeds into target zones.",
    links: [
      { label: "Project Report", href: "https://drive.google.com/file/d/1e1Ij0TicA8VDuTQ5E568X7snGpoiCh0V" },
      { label: "Presentation", href: "https://drive.google.com/file/d/1czH8fFlw1w7w4qDl7xf1FBFrCjaN5AHT" },
    ],
    theme: "environment",
  },
  {
    title: "AIPTS — AI ICU Patient Monitoring",
    focus: "Health & First Aid",
    roles: ["Team Lead"],
    competition: "Health & First Aid",
    yearTag: "TEKNOFEST 2023",
    problem:
      "ICU staff shortages and alarm fatigue delay responses to critical vitals changes.",
    solution:
      "ESP8266-based tracker ingests vitals, applies shock-index logic, and auto-calls/notifies clinicians with status and suggested actions via mobile app.",
    links: [
      { label: "Project Report", href: "https://drive.google.com/file/d/1xxikFDnDCtWZxiwIbiOombTCniFkALND" },
    ],
    theme: "health",
  },
  {
    title: "AI Earthquake Impact Analysis & Intervention",
    focus: "Disaster Response Simulation",
    roles: ["Researcher"],
    competition: "STREAM It Up!-3",
    yearTag: "STREAM It Up!-3",
    problem:
      "Turkey lacks adequate disaster planning for high-risk seismic zones, leaving evacuation and logistics paths under-modeled.",
    solution:
      "Six-stage AI crisis-management pipeline that aggregates regional population and route data to simulate quake damage, predict blocked corridors, and optimize intervention center placement.",
    links: [
      { label: "Abstract", href: "https://drive.google.com/file/d/1drt2yJatrtvsZhY0TmMY3L5XVnONyjyl" },
      { label: "Slides", href: "https://drive.google.com/file/d/15I4thzZn-IV1vqyuU8I5ij8j8B3BR2kL" },
    ],
    theme: "safety",
  },
  {
    title: "AI-Powered Physics Graph Generator",
    focus: "Educational Technology",
    roles: ["Team Lead"],
    competition: "Educational Technologies",
    yearTag: "TEKNOFEST 2025",
    problem:
      "Students struggle to turn physics word problems into correct motion graphs, hindering comprehension of core concepts.",
    solution:
      "Web app using a Gemini LLM parses uploaded questions and generates position/velocity/energy graphs in real time for immediate visual feedback.",
    links: [
      { label: "Project Report", href: "https://drive.google.com/file/d/1idDOTsm1FqFJu-7V0Wt9Jq7MzCP5KF8R" },
    ],
    theme: "education",
  },
  {
    title: "DURAY — School Nutrition Planner",
    focus: "Data-Driven Health",
    roles: ["Team Lead"],
    competition: "TUBITAK Research Projects",
    yearTag: "TUBITAK 2024",
    problem:
      "School cafeterias use generic menus, causing both obesity and malnutrition across BMI groups.",
    solution:
      "Python tool classifies students by BMI, applies Schofield-based needs, and adjusts weekly menus with substitution suggestions to balance nutrition and reduce waste.",
    links: [
      { label: "Project Report", href: "https://drive.google.com/file/d/1bOFDyKKzwiRGc1ytwlMyKwnX4kvlL9nY" },
    ],
    theme: "health",
  },
  {
    title: "Piezo-Powered Wheelchair Visibility",
    focus: "Barrier-Free Mobility",
    roles: ["Team Lead", "Electronics"],
    competition: "Barrier-Free Living",
    yearTag: "TEKNOFEST 2024",
    problem:
      "Wheelchair users are hard to see at night; battery lights add maintenance or reduce electric range.",
    solution:
      "Seat cushion with piezo disks powers LEDs through a DeneyapKart Mini and regulator, creating a self-sustaining visibility system.",
    links: [
      { label: "Project Report", href: "https://drive.google.com/file/d/1EpgvQpbl66nP3n4RL1_QsBrg8vhzd2tL" },
      { label: "Presentation", href: "https://drive.google.com/file/d/1XxhyoJABorg-mJBl8pzfJ72pcaHaVtGP" },
    ],
    theme: "accessibility",
  },
];

export default competitionProjects;
