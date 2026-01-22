/**
 * Main application entry point
 * Initializes all modules and starts the game loop
 */

import { initEngine, scene, outlinePass } from './core/engine.js';
import { startLoop } from './core/loop.js';
import { createFloor, createWalls, createCeiling } from './entities/garage.js';
import { createRobot, getRobotMeshes } from './entities/robot.js';
import { ROBOT } from './core/constants.js';
import { initControls } from './systems/controls.js';

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
    const robotGroup = createRobot();
    // Position robot at center of garage, toward front
    // Robot's internal geometry already has feet at Y=0, so group Y stays at 0
    robotGroup.position.set(
        ROBOT.START_POSITION.x,
        ROBOT.START_POSITION.y,
        ROBOT.START_POSITION.z
    );
    scene.add(robotGroup);

    // Add robot meshes to outline pass for cel-shading outline effect
    const robotMeshes = getRobotMeshes();
    outlinePass.selectedObjects = robotMeshes;

    // Initialize controls system (registers keyboard listeners and update callback)
    initControls();

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

    console.log('Showing resume view');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
