/**
 * Game loop with delta time
 */

// Placeholder - will be implemented in US-004
const updateCallbacks = [];
let running = false;

export function startLoop(callback) {
    // Placeholder
}

export function stopLoop() {
    running = false;
}

export function addUpdateCallback(fn) {
    updateCallbacks.push(fn);
}

export function removeUpdateCallback(fn) {
    const index = updateCallbacks.indexOf(fn);
    if (index > -1) {
        updateCallbacks.splice(index, 1);
    }
}
