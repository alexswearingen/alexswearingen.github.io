/**
 * Game loop with delta time
 * Handles animation frame timing and update callbacks
 */

import { composer } from './engine.js';

// Update callbacks registry
const updateCallbacks = [];

// Loop state
let running = false;
let animationFrameId = null;
let lastTime = 0;

/**
 * Main animation loop
 * Calculates delta time and calls all registered update callbacks
 * @param {number} currentTime - Current timestamp from requestAnimationFrame
 */
function gameLoop(currentTime) {
    if (!running) return;

    // Calculate delta time in seconds
    const deltaTime = lastTime === 0 ? 0 : (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Call all registered update callbacks with deltaTime
    for (let i = 0; i < updateCallbacks.length; i++) {
        updateCallbacks[i](deltaTime);
    }

    // Render the scene using composer for outline effect
    composer.render();

    // Request next frame
    animationFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Start the game loop
 * @param {Function} [callback] - Optional callback to add before starting
 */
export function startLoop(callback) {
    if (callback) {
        addUpdateCallback(callback);
    }

    if (!running) {
        running = true;
        lastTime = 0;
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

/**
 * Stop the game loop
 */
export function stopLoop() {
    running = false;
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    lastTime = 0;
}

/**
 * Add an update callback to the game loop
 * Callbacks receive deltaTime (in seconds) as their parameter
 * @param {Function} fn - Callback function that receives deltaTime
 */
export function addUpdateCallback(fn) {
    if (typeof fn === 'function' && !updateCallbacks.includes(fn)) {
        updateCallbacks.push(fn);
    }
}

/**
 * Remove an update callback from the game loop
 * @param {Function} fn - Callback function to remove
 */
export function removeUpdateCallback(fn) {
    const index = updateCallbacks.indexOf(fn);
    if (index > -1) {
        updateCallbacks.splice(index, 1);
    }
}

/**
 * Check if the game loop is currently running
 * @returns {boolean} Whether the loop is running
 */
export function isRunning() {
    return running;
}
