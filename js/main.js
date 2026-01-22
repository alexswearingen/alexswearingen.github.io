/**
 * Main application entry point
 * Initializes all modules and starts the game loop
 */

import { initEngine, scene } from './core/engine.js';
import { startLoop, addUpdateCallback } from './core/loop.js';
import { createFloor, createWalls, createCeiling } from './entities/garage.js';
import { createRobot, robot } from './entities/robot.js';
import { ROBOT } from './core/constants.js';
import { initControls, isInteractKeyPressed } from './systems/controls.js';
import { checkStationProximity } from './entities/station.js';
import { createBrokkStation, updateBrokkAnimation } from './entities/brokk-station.js';
import { createRevojamStation, updateRevojamAnimation } from './entities/revojam-station.js';
import { createLoanscoutStation, updateLoanscoutAnimation } from './entities/loanscout-station.js';
import { createWeb3Station, updateWeb3Animation } from './entities/web3-station.js';
import { createWhiteboard } from './entities/whiteboard.js';
import { createCertifications } from './entities/certifications.js';
import { createMusicPosters } from './entities/music-posters.js';
import { createEntertainmentShelf } from './entities/entertainment-shelf.js';
import { createGolfBag } from './entities/golf-bag.js';
import { createCatanTiles } from './entities/catan-tiles.js';
import { createContactSign } from './entities/contact-sign.js';
import { createCeilingFan, updateCeilingFanAnimation } from './entities/ceiling-fan.js';
import { createToolbox } from './entities/toolbox.js';
import { createWorkbench } from './entities/workbench.js';
import { createShelvingUnit } from './entities/shelving-unit.js';
import { createDustParticles, updateDustParticles } from './entities/dust-particles.js';
import { initUI, showInteractionPrompt, hideInteractionPrompt, showModal, isModalOpen } from './systems/ui.js';
import { isDevMode, initDebugControls, setCamera, getFloorPlan } from './systems/debug.js';
import { initMinimap, updateMinimap } from './systems/minimap.js';
import { WORK_HISTORY, SKILLS, CERTIFICATIONS, CONTACT, ABOUT } from './data/content.js';

// Track the currently nearby station for interaction
let nearbyStation = null;

/**
 * Initialize the interaction system
 * Registers proximity check callback with game loop
 */
function initInteraction() {
    addUpdateCallback(updateInteraction);
}

/**
 * Check station proximity each frame and manage interaction prompt
 * @param {number} deltaTime - Time since last frame in seconds
 */
function updateInteraction(deltaTime) {
    if (!robot) return;

    // Don't check proximity while modal is open
    if (isModalOpen) return;

    // Check if robot is near any station
    const station = checkStationProximity({ x: robot.position.x, z: robot.position.z });

    // Update nearby station reference
    nearbyStation = station;

    // Show/hide interaction prompt based on proximity
    if (station) {
        showInteractionPrompt();

        // Check if E key was pressed to interact - show modal with station content
        if (isInteractKeyPressed()) {
            const contentData = station.userData.contentData;
            if (contentData) {
                showModal(contentData);
            }
        }
    } else {
        hideInteractionPrompt();
    }
}

/**
 * Initialize the application
 */
async function init() {
    // Initialize UI event listeners (modal close button, overlay click, escape key)
    initUI();

    // Initialize the Three.js engine
    initEngine();

    // Create the garage environment
    createFloor(scene);
    createWalls(scene);
    createCeiling(scene);

    // Create and position the robot
    // Note: Robot includes inverted hull outlines for cel-shading effect
    const robotGroup = createRobot();
    // Position robot at center of garage, toward front
    // Robot's internal geometry already has feet at Y=0, so group Y stays at 0
    robotGroup.position.set(
        ROBOT.START_POSITION.x,
        ROBOT.START_POSITION.y,
        ROBOT.START_POSITION.z
    );
    scene.add(robotGroup);

    // Initialize controls system (registers keyboard listeners and update callback)
    initControls();

    // Initialize interaction system (proximity check for stations)
    initInteraction();

    // Create Brokk AI station with visual design
    const brokkStation = createBrokkStation();
    scene.add(brokkStation);

    // Register Brokk station animation with game loop
    addUpdateCallback(updateBrokkAnimation);

    // Create Revojam station with visual design
    const revojamStation = createRevojamStation();
    scene.add(revojamStation);

    // Register Revojam station animation with game loop
    addUpdateCallback(updateRevojamAnimation);

    // Create LoanScout station with visual design
    const loanscoutStationGroup = createLoanscoutStation();
    scene.add(loanscoutStationGroup);

    // Register LoanScout station animation with game loop
    addUpdateCallback(updateLoanscoutAnimation);

    // Create Web3 station with visual design
    const web3StationGroup = createWeb3Station();
    scene.add(web3StationGroup);

    // Register Web3 station animation with game loop
    addUpdateCallback(updateWeb3Animation);

    // Create whiteboard on back wall (skills display - US-032)
    createWhiteboard(scene);

    // Create certifications display on back wall (US-034)
    createCertifications(scene);

    // Create music posters on left wall (US-036)
    createMusicPosters(scene);

    // Create entertainment shelf on right wall (US-038)
    createEntertainmentShelf(scene);

    // Create golf bag prop (US-040)
    createGolfBag(scene);

    // Create Catan tiles prop (US-041)
    createCatanTiles(scene);

    // Create contact sign near garage entrance (US-043)
    createContactSign(scene);

    // Create ceiling fan (US-045)
    createCeilingFan(scene);

    // Register ceiling fan animation with game loop
    addUpdateCallback(updateCeilingFanAnimation);

    // Create toolbox prop (US-047)
    createToolbox(scene);

    // Create workbench prop (US-048)
    createWorkbench(scene);

    // Create shelving unit prop (US-049)
    createShelvingUnit(scene);

    // Create dust particles for atmosphere (US-051)
    createDustParticles(scene);

    // Register dust particles animation with game loop
    addUpdateCallback(updateDustParticles);

    // Initialize debug controls (keyboard shortcuts for camera views)
    initDebugControls();

    // Initialize minimap (US-054)
    initMinimap();

    // Register minimap update with game loop
    addUpdateCallback(updateMinimap);

    // Dev mode: skip loading screen entirely
    if (isDevMode) {
        console.log('[Dev Mode] Auto-starting experience...');
        console.log('[Dev Mode] Camera shortcuts: 1=follow, 2=topdown, 3=corner, 4=front, 5=side');
        console.log('[Dev Mode] Use window.debug.help() for full API');

        // Hide loading screen immediately
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }

        // Start game loop immediately
        startLoop();

        // Set to top-down view by default for dev mode
        setTimeout(() => {
            setCamera('topdown');
            console.log(getFloorPlan());
        }, 100);

        return;
    }

    // Normal mode: show loading screen with start button
    const loadingText = document.getElementById('loading-text');
    const startButton = document.getElementById('start-button');
    const progressBar = document.getElementById('progress-bar');

    if (progressBar) {
        progressBar.style.width = '100%';
    }

    if (loadingText) {
        loadingText.textContent = 'Ready!';
    }

    if (startButton) {
        startButton.classList.remove('hidden');
        startButton.addEventListener('click', startExperience);
    }

    // Also allow any key to start
    document.addEventListener('keydown', function onFirstKey(e) {
        if (e.key !== 'Escape') {
            document.removeEventListener('keydown', onFirstKey);
            startExperience();
        }
    }, { once: false });

    // Skip to resume functionality
    const skipButton = document.getElementById('skip-to-resume');
    if (skipButton) {
        skipButton.addEventListener('click', showResume);
    }

    // Back to 3D button in resume section
    const backTo3DButton = document.getElementById('back-to-3d');
    if (backTo3DButton) {
        backTo3DButton.addEventListener('click', hideResume);
    }
}

/**
 * Start the 3D experience
 */
function startExperience() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }

    // Start the game loop
    startLoop();
}

/**
 * Populate the resume section with data from content.js
 */
function populateResume() {
    // Header info (ABOUT data)
    const nameEl = document.getElementById('resume-name');
    const titleEl = document.getElementById('resume-title');
    const locationEl = document.getElementById('resume-location');
    const summaryEl = document.getElementById('resume-summary');

    if (nameEl) nameEl.textContent = ABOUT.name;
    if (titleEl) titleEl.textContent = ABOUT.title;
    if (locationEl) locationEl.textContent = ABOUT.location;
    if (summaryEl) summaryEl.textContent = ABOUT.summary;

    // Experience section (WORK_HISTORY data)
    const experienceContainer = document.getElementById('resume-experience');
    if (experienceContainer) {
        experienceContainer.innerHTML = '';

        // Order: Brokk AI first (current), then by date (reverse chronological)
        const workOrder = ['brokkAi', 'loanScout', 'revojam', 'web3'];

        workOrder.forEach(key => {
            const job = WORK_HISTORY[key];
            if (!job) return;

            const entry = document.createElement('div');
            entry.className = 'experience-entry';

            entry.innerHTML = `
                <div class="experience-header">
                    <span class="experience-company">${job.title}</span>
                    <span class="experience-dates">${job.dates}</span>
                </div>
                <div class="experience-role">${job.subtitle}</div>
                <p class="experience-description">${job.description}</p>
                <ul class="experience-achievements">
                    ${job.achievements.map(a => `<li>${a}</li>`).join('')}
                </ul>
            `;

            experienceContainer.appendChild(entry);
        });
    }

    // Skills section
    const skillsContainer = document.getElementById('resume-skills');
    if (skillsContainer) {
        skillsContainer.innerHTML = '';

        const skillsGrid = document.createElement('div');
        skillsGrid.className = 'skills-grid';

        Object.values(SKILLS.categories).forEach(category => {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'skill-category';
            skillDiv.innerHTML = `
                <div class="skill-category-name">${category.name}</div>
                <div class="skill-items">${category.items.join(', ')}</div>
            `;
            skillsGrid.appendChild(skillDiv);
        });

        skillsContainer.appendChild(skillsGrid);
    }

    // Certifications section
    const certsContainer = document.getElementById('resume-certifications');
    if (certsContainer) {
        certsContainer.innerHTML = '';

        CERTIFICATIONS.items.forEach(cert => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="cert-name">${cert.name}</span>
                <span class="cert-description"> — ${cert.description}</span>
            `;
            certsContainer.appendChild(li);
        });
    }

    // Contact section
    const contactContainer = document.getElementById('resume-contact');
    if (contactContainer) {
        contactContainer.innerHTML = '';

        const contactGrid = document.createElement('div');
        contactGrid.className = 'contact-grid';

        // Email
        contactGrid.innerHTML += `
            <div class="contact-item">
                <span class="contact-label">Email: </span>
                <span class="contact-value"><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></span>
            </div>
        `;

        // LinkedIn
        contactGrid.innerHTML += `
            <div class="contact-item">
                <span class="contact-label">LinkedIn: </span>
                <span class="contact-value"><a href="${CONTACT.linkedin}" target="_blank" rel="noopener noreferrer">linkedin.com/in/alex-swearingen</a></span>
            </div>
        `;

        // GitHub
        contactGrid.innerHTML += `
            <div class="contact-item">
                <span class="contact-label">GitHub: </span>
                <span class="contact-value"><a href="${CONTACT.github}" target="_blank" rel="noopener noreferrer">github.com/alexswearingen</a></span>
            </div>
        `;

        // Location
        contactGrid.innerHTML += `
            <div class="contact-item">
                <span class="contact-label">Location: </span>
                <span class="contact-value">${CONTACT.location}</span>
            </div>
        `;

        contactContainer.appendChild(contactGrid);
    }
}

/**
 * Show the resume/fallback view
 */
function showResume() {
    const loadingScreen = document.getElementById('loading-screen');
    const resumeSection = document.getElementById('resume-section');
    const canvasContainer = document.getElementById('canvas-container');
    const minimap = document.getElementById('minimap');

    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }

    if (canvasContainer) {
        canvasContainer.style.display = 'none';
    }

    if (minimap) {
        minimap.style.display = 'none';
    }

    // Populate resume content from content.js data
    populateResume();

    if (resumeSection) {
        resumeSection.classList.remove('hidden');
    }
}

/**
 * Hide the resume and return to 3D experience
 */
function hideResume() {
    const resumeSection = document.getElementById('resume-section');
    const canvasContainer = document.getElementById('canvas-container');
    const minimap = document.getElementById('minimap');

    if (resumeSection) {
        resumeSection.classList.add('hidden');
    }

    if (canvasContainer) {
        canvasContainer.style.display = 'block';
    }

    if (minimap) {
        minimap.style.display = 'block';
    }

    // Start the game loop if not already running
    startLoop();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
