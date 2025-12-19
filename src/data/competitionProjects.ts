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
      { label: "Detail Report", href: "https://pdfhost.io/v/jpTnZDh8qA_mezurobo-iris-teknofest-2020" },
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
      { label: "Project Report", href: "https://pdfhost.io/v/HvCKNaAZb7_eseed-project-teknofest-2024" },
      { label: "Presentation", href: "https://pdfhost.io/v/eu9KPjnYaB_eseed-presentation-teknofest-2024" },
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
      { label: "Project Report", href: "https://pdfhost.io/v/XD5FDLSUjJ_aipts-project-teknofest-2023" },
    ],
    theme: "health",
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
      { label: "Project Report", href: "https://pdfhost.io/v/BTZe5pjbs6_physics-teknofest-2025" },
    ],
    theme: "education",
  },
  {
    title: "Dynamic Truck Underride Guard",
    focus: "Smart Transportation",
    roles: ["Co-Lead Developer"],
    competition: "Smart Transportation",
    yearTag: "TEKNOFEST 2023",
    problem:
      "Rear-end underride crashes are fatal when trucks lack effective guards; fixed bars hinder reversing to docks so they're often unusable or absent.",
    solution:
      "Hydraulic rear guard controlled by Arduino: stays low during driving for underride protection, auto-raises only in reverse for dock access.",
    links: [
      { label: "Project Report", href: "https://pdfhost.io/v/qJdG3th3XJ_truck-project-teknofest-2023" },
    ],
    theme: "safety",
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
      { label: "Project Report", href: "https://pdfhost.io/v/Y93fYtywb5_DURAYPROJERAPORU" },
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
      { label: "Project Report", href: "https://pdfhost.io/v/f6qhNszGzB_pizeo-project-teknofest-2024" },
      { label: "Presentation", href: "https://pdfhost.io/v/z9LSjDMZKp_pioze-presentation-teknofest-2024" },
    ],
    theme: "accessibility",
  },
];

export default competitionProjects;
