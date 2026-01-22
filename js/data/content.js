/**
 * Content data for the portfolio
 * All text content for stations, skills, certifications, etc.
 */

// Work History
export const WORK_HISTORY = {
    brokkAi: {
        id: 'brokk-ai',
        title: 'Brokk AI',
        subtitle: 'Software Engineer → Technical Product Marketing',
        dates: '2025 - Present',
        description: 'AI-powered development tools. Transitioned from engineering to Technical Product Marketing role, bridging technical capabilities with customer needs.',
        achievements: [
            'Developed AI-powered coding assistance features',
            'Created technical documentation and developer guides',
            'Led product demonstrations for enterprise clients',
            'Collaborated with engineering on feature prioritization'
        ]
    },
    revojam: {
        id: 'revojam',
        title: 'Revojam',
        subtitle: 'Founder',
        dates: 'Spring 2020 - Winter 2023',
        description: 'Music streaming platform for content creators. Built from the ground up to help streamers engage with their audience through interactive jukebox functionality.',
        achievements: [
            'Built full-stack application with Django backend and React frontend',
            'Integrated Spotify API for music streaming and playlist management',
            'Deployed and scaled on AWS infrastructure',
            'Implemented DMCA-compliant content filtering system'
        ]
    },
    loanScout: {
        id: 'loanscout',
        title: 'LoanScout',
        subtitle: 'Web Developer',
        dates: 'Spring 2023 - Fall 2023',
        description: 'Financial data platform for loan professionals. Worked on improving user experience and integrating AI capabilities.',
        achievements: [
            'Redesigned user interface for improved usability',
            'Built loan filing search system with advanced filtering',
            'Integrated OpenAI API for intelligent data analysis',
            'Created interactive data visualization dashboards'
        ]
    },
    web3: {
        id: 'web3',
        title: 'Cookbook.dev / Web3 Projects',
        subtitle: 'Developer',
        dates: 'Spring 2022 - Fall 2022',
        description: 'NFT platforms and blockchain development. Worked on various Web3 projects building decentralized applications.',
        achievements: [
            'Built applications using MERN stack (MongoDB, Express, React, Node)',
            'Developed Fanfare NFT platform for digital collectibles',
            'Created smart contract interfaces for DeFi applications',
            'Implemented Web3 wallet integration (MetaMask, WalletConnect)'
        ]
    }
};

// Skills organized by category
export const SKILLS = {
    title: 'Technical Skills',
    subtitle: 'What I Work With',
    categories: {
        languages: {
            name: 'Languages',
            items: ['JavaScript', 'Python', 'TypeScript', 'Java']
        },
        frontend: {
            name: 'Frontend',
            items: ['React', 'Vue.js', 'Three.js', 'HTML/CSS', 'Tailwind']
        },
        backend: {
            name: 'Backend',
            items: ['Node.js', 'Django', 'Flask', 'Express']
        },
        cloud: {
            name: 'Cloud',
            items: ['AWS (Certified Cloud Practitioner)']
        },
        database: {
            name: 'Database',
            items: ['MongoDB', 'PostgreSQL', 'MySQL']
        },
        tools: {
            name: 'Tools',
            items: ['Git', 'Docker', 'CI/CD']
        }
    }
};

// Certifications
export const CERTIFICATIONS = {
    title: 'Certifications',
    subtitle: 'Professional Credentials',
    items: [
        {
            name: 'CompTIA A+ Certified',
            description: 'Hardware and software troubleshooting, networking, security'
        },
        {
            name: 'AWS Certified Cloud Practitioner',
            description: 'Cloud concepts, AWS services, security, architecture'
        }
    ]
};

// Contact Information
export const CONTACT = {
    title: 'Contact',
    subtitle: 'Get in Touch',
    email: 'alexswearingen26@gmail.com',
    linkedin: 'https://www.linkedin.com/in/alex-swearingen-2b3017153/',
    github: 'https://github.com/alexswearingen',
    location: 'Austin, Texas'
};

// Personal Interests - Music
export const MUSIC = {
    title: 'Music',
    subtitle: 'Favorite Artists',
    description: 'Classic rock enthusiast with a love for synthwave and eclectic sounds.',
    items: ['Talking Heads', 'TWRP', 'Queen', 'Fleetwood Mac']
};

// Personal Interests - Entertainment
export const ENTERTAINMENT = {
    title: 'Entertainment',
    subtitle: 'Movies & TV',
    movies: ['Kill Bill', 'Paul Blart Mall Cop 2', 'The Batman'],
    tv: ["It's Always Sunny in Philadelphia", 'Silicon Valley', 'BattleBots']
};

// Personal Interests - Hobbies
export const HOBBIES = {
    title: 'Hobbies',
    subtitle: 'Outside of Code',
    description: 'When not coding, you can find me on the golf course or around a board game table.',
    items: ['Golf', 'Board Games (especially Catan)']
};

// About/Summary for resume view
export const ABOUT = {
    name: 'Alex Swearingen',
    title: 'Software Engineer',
    summary: 'Full-stack developer with experience in web applications, AI integration, and startup environments. Passionate about creating engaging user experiences and solving complex technical challenges.',
    location: 'Austin, Texas'
};
