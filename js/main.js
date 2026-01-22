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
import { initUI, showInteractionPrompt, hideInteractionPrompt, showModal, isModalOpen } from './systems/ui.js';

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

    // Hide loading text, show start button
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
 * Show the resume/fallback view
 */
function showResume() {
    const loadingScreen = document.getElementById('loading-screen');
    const resumeSection = document.getElementById('resume-section');
    const canvasContainer = document.getElementById('canvas-container');

    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }

    if (canvasContainer) {
        canvasContainer.style.display = 'none';
    }

    if (resumeSection) {
        resumeSection.classList.remove('hidden');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
