/**
 * Main application entry point
 * Initializes all modules and starts the game loop
 */

import { initEngine, scene } from './core/engine.js';
import { startLoop } from './core/loop.js';
import { createFloor, createWalls } from './entities/garage.js';

/**
 * Initialize the application
 */
async function init() {
    // Initialize the Three.js engine
    initEngine();

    // Create the garage environment
    createFloor(scene);
    createWalls(scene);

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
