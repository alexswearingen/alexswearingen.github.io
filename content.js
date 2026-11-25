/* The site's words. Every word on the page comes from this file: tools/build.mjs writes index.html from it,
   and nothing is typed into the HTML by hand.
   Screens: tools/screens.json lists the captures each disk shows, with the caption under each. A disk with
   no captures gets a typographic screen made from its `figures`.
   tease: a few words for the card the figure on the start screen shows for the disk (a disk without one
   gets its name and picture only).
   "{redacted}" is drawn as a struck-out bar. */
/* A disk's panel is rows of "Key: words" and nothing else, each fact said once (the screens show the rest):
     its post and dates; `about` (what the place is: the words before the colon are set as the key);
     `points` (what was built there); its stack; then its `figures`, each keyed by its number.
   A disk whose screen is its figures (no captures) does not repeat them in the panel.
   `summary` is not shown in a panel; it is kept as the one-line version of each chapter. */
window.SITE = {
  person: {
    name: "Alex Swearingen",
    line: "Austin-based full-stack product engineer who also owns growth and design.",
    greet: "Hi, I'm Alex. Pick a disk.",   // what the figure on the start screen says first
    links: [
      { id: "resume", label: "Résumé", href: "#" },   // primary action
      { id: "email", label: "Email", href: "#" },
      { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/alexswearingen" },
      { id: "github", label: "GitHub", href: "https://github.com/alexswearingen" }
    ]
  },

  disks: [
    {
      id: "start",
      label: "Start here",
      sub: "Alex Swearingen",
      kind: "intro",
      title: "At a glance",                  // the start panel's title (the disk's own label stays "Start here")
      role: "Full-stack product engineer",   // the page's <title> only: the name block beside the machine already says this
      // The start panel is its title and two lists: these three rows, then one row per disk
      // (its title, its post up to any colon or bracket, the years on its label). No dates, no lead-in.
      points: [
        "Full-stack: TypeScript, Python, Java, React, Next.js, FastAPI, Django, PostgreSQL, AWS, GCP",
        "Growth: PostHog, GA4, attribution, paid social, A/B testing",
        "Design: Brand identity, design systems, Figma"
      ],
      figures: [],
      screens: ["start"] // drawn by the page: the figure, and a contact sheet of the other disks
    },
    {
      id: "slopcop",
      label: "Brokk / SlopCop",
      sub: "2025–26",
      tease: "Agentic devtools",
      title: "Brokk / SlopCop",
      role: "Software Engineer: web platform, growth and brand",
      dates: "Mar 2025 – present",
      about: "AI coding startup: that pivoted from Brokk, an AI-native IDE, to SlopCop, an agentic code review tool",
      summary: "Built the web platform from the first commit, ran growth, then rebranded the company through its pivot.",
      points: [
        "Web platform: Site, accounts, admin, docs, usage-based LLM billing and the first VS\u00a0Code extension",
        "Growth: The Power Ranking leaderboard, analytics from scratch, paid ads taken in-house",
        "Brand: Single-handed rebrand; entire frontend, onboarding and Stripe billing rebuilt"
      ],
      figures: [
        { value: "78K", label: "visitors to the Power Ranking, about half of site traffic" },
        { value: "−90%", label: "LinkedIn cost per click" },
        { value: "10×", label: "better-converting offer found through attribution" }
      ],
      stack: ["Next.js", "React", "TypeScript", "PostgreSQL", "Stripe", "PostHog", "GA4"],
      screens: []
    },
    {
      id: "anticlassic",
      label: "Anticlassic Studios",
      sub: "Contract · 2026",
      tease: "Under wraps for now",
      title: "Anticlassic Studios",
      role: "Software Engineer (contract)",
      dates: "Jun 2026 – present",
      about: "Generative artist Tyler Hobbs's studio: The Java engine behind {redacted}, an algorithmic artwork premiering at a top New York art institution",
      summary: "Re-architected the engine's core search to plan one part at a time with backtracking.",
      // (the doubling of 64-part patterns is one of the figures, and the figures are this disk's screen)
      points: [
        "Core search: Re-architected to plan one part at a time with backtracking",
        "Tooling: Print exports for each part, weekly bulk video exports, an inspector for pattern analysis",
        "Preview: Each pattern as it will look at the premiere, on a 1:1 model of the venue"
      ],
      figures: [
        { value: "≈2.4×", label: "faster generation" },
        { value: "8–64", label: "parts planned per pattern" },
        { value: "2×", label: "as many 64-part patterns" }
      ],
      stack: ["Java", "Three.js", "Google Cloud"],
      caption: "Under wraps for now",
      screens: [] // under wraps: its screen is its figures
    },
    {
      id: "revojam",
      label: "Revojam",
      sub: "Founder · 2020–23",
      tease: "A jukebox for livestreams",
      title: "Revojam",
      role: "Founder",
      dates: "Mar 2020 – Dec 2023",
      about: "A live, collaborative jukebox: that lets livestreamers play popular music without copyright strikes",
      summary: "Founded it, led a team of four, and pivoted it from party jukebox to streamer tool.",
      points: [
        "App: Designed and built it; each viewer's Spotify syncs over WebSockets, so no music hits the stream",
        "Extension: Twitch and YouTube Live, on a scalable AWS backend",
        "Pivot: From party jukebox to streamer tool",
        "Pitched: Cloud9 and Team Liquid"
      ],
      figures: [
        { value: "4", label: "person team" },
        { value: "1,000s", label: "of concurrent users on one stream, with Minecraft YouTuber Mogswamp (3M+ subscribers)" }
      ],
      stack: ["Django", "React", "WebSockets", "Spotify\u00a0API", "AWS"],
      screens: []
    },
    {
      id: "loanscout",
      label: "LoanScout",
      sub: "2023",
      tease: "Search over 2M Texas loan filings",
      title: "LoanScout",
      role: "Web Developer",
      dates: "May 2023 – Sep 2023",
      about: "B2B startup: giving financial institutions search over two million Texas loan filings",
      summary: "Turned the filings search into a lead-generation workflow.",
      points: [
        "Lead generation: Lead lists, watchlists, a home dashboard and shareable profiles",
        "AI: The UI for generated company profiles and cold emails",
        "API client: Token-refreshing, for the whole app"
      ],
      figures: [],   // (the two million filings are said in `about`: no fact twice)
      stack: ["React"],
      screens: []
    },
    {
      id: "filestride",
      label: "FileStride",
      sub: "2019–21",
      tease: "Document tracking for commercial lending",
      title: "FileStride",
      role: "Engineering Intern",
      dates: "Apr 2019 – Jun 2021",
      about: "B2B SaaS: for collecting and tracking documents in commercial lending",
      summary: "Learned Django and Vue.js on the job to ship full-stack features and fixes across the web app.",
      points: [
        "Full-stack: Features and fixes across the web app, learning the stack on the job",
        "Customers: Joined meetings with major customers; helped turn their requests into features"
      ],
      figures: [],
      stack: ["Django", "Vue.js"],
      screens: []
    },
    {
      id: "side",
      label: "Projects",         // one word: the smallest labels have one line for it
      sub: "2017–26",
      title: "Side projects",
      role: "Built outside of work",
      dates: "2017 – 2026",
      summary: "A Minecraft bot run by Twitch chat, a 3D watch-party theater, and the logo shop I started in high school.",
      points: [
        "Twitch Plays Minecraft: A bot that lets Twitch chat steer a Minecraft character",
        "squirtle.tv: A 3D theater for watching together, with a virtual casino floor",
        "Atrium Graphics: Logos for Instagram accounts, started in high school with a friend, 2017 to 2018"
      ],
      figures: [],
      stack: ["Node", "Mineflayer", "Three.js"],
      screens: []
    }
  ]
};
