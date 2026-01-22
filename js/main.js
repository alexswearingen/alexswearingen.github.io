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
import { checkStationProximity, createStation } from './entities/station.js';
import { showInteractionPrompt, hideInteractionPrompt } from './systems/ui.js';

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

    // Check if robot is near any station
    const station = checkStationProximity({ x: robot.position.x, z: robot.position.z });

    // Update nearby station reference
    nearbyStation = station;

    // Show/hide interaction prompt based on proximity
    if (station) {
        showInteractionPrompt();

        // Check if E key was pressed to interact (handled in future US-019)
        if (isInteractKeyPressed()) {
            // Will trigger modal in US-019
        }
    } else {
        hideInteractionPrompt();
    }
}

/**
 * Initialize the application
 */
async function init() {
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

    // Create placeholder stations for testing proximity detection
    // These will be replaced with actual station visuals in US-020+
    // Using positions from STATION_POSITIONS in constants.js
    const brokkStation = createStation({
        id: 'brokk-station',
        position: { x: 0, z: -12 },  // STATION_POSITIONS.BROKK
        size: { width: 4, depth: 3 },
        contentData: {
            title: 'Brokk AI',
            subtitle: 'Software Engineer → Technical Product Marketing',
            description: 'AI-powered development tools company.',
            dates: '2025 - Present'
        }
    });
    scene.add(brokkStation);

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
