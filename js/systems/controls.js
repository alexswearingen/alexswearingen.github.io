/**
 * Input handling
 * WASD movement, E interaction, Escape for modal
 */

import { ROBOT } from '../core/constants.js';
import { robot } from '../entities/robot.js';
import { addUpdateCallback } from '../core/loop.js';

// Track which keys are currently pressed
const keysPressed = {
    w: false,
    a: false,
    s: false,
    d: false,
    arrowUp: false,
    arrowDown: false,
    arrowLeft: false,
    arrowRight: false,
    e: false,
    escape: false
};

// Track if E key was just pressed (for one-shot interaction)
let eKeyJustPressed = false;

/**
 * Initialize keyboard event listeners
 */
export function initControls() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Register the movement update callback with the game loop
    addUpdateCallback(updateMovement);
}

/**
 * Handle keydown events
 * @param {KeyboardEvent} e
 */
function handleKeyDown(e) {
    const key = e.key.toLowerCase();

    switch (key) {
        case 'w':
            keysPressed.w = true;
            break;
        case 'a':
            keysPressed.a = true;
            break;
        case 's':
            keysPressed.s = true;
            break;
        case 'd':
            keysPressed.d = true;
            break;
        case 'arrowup':
            keysPressed.arrowUp = true;
            break;
        case 'arrowdown':
            keysPressed.arrowDown = true;
            break;
        case 'arrowleft':
            keysPressed.arrowLeft = true;
            break;
        case 'arrowright':
            keysPressed.arrowRight = true;
            break;
        case 'e':
            if (!keysPressed.e) {
                eKeyJustPressed = true;
            }
            keysPressed.e = true;
            break;
        case 'escape':
            keysPressed.escape = true;
            break;
    }
}

/**
 * Handle keyup events
 * @param {KeyboardEvent} e
 */
function handleKeyUp(e) {
    const key = e.key.toLowerCase();

    switch (key) {
        case 'w':
            keysPressed.w = false;
            break;
        case 'a':
            keysPressed.a = false;
            break;
        case 's':
            keysPressed.s = false;
            break;
        case 'd':
            keysPressed.d = false;
            break;
        case 'arrowup':
            keysPressed.arrowUp = false;
            break;
        case 'arrowdown':
            keysPressed.arrowDown = false;
            break;
        case 'arrowleft':
            keysPressed.arrowLeft = false;
            break;
        case 'arrowright':
            keysPressed.arrowRight = false;
            break;
        case 'e':
            keysPressed.e = false;
            break;
        case 'escape':
            keysPressed.escape = false;
            break;
    }
}

/**
 * Get the current movement vector based on pressed keys
 * Returns normalized vector with x and z components
 * W/Up = -Z, S/Down = +Z, A/Left = -X, D/Right = +X
 * @returns {{x: number, z: number}} Normalized movement vector
 */
export function getMovementVector() {
    let x = 0;
    let z = 0;

    // Calculate raw movement from pressed keys
    // A/Left = -X (left), D/Right = +X (right)
    if (keysPressed.a || keysPressed.arrowLeft) x -= 1;
    if (keysPressed.d || keysPressed.arrowRight) x += 1;

    // W/Up = -Z (forward/into screen), S/Down = +Z (backward/toward camera)
    if (keysPressed.w || keysPressed.arrowUp) z -= 1;
    if (keysPressed.s || keysPressed.arrowDown) z += 1;

    // Normalize diagonal movement so it's not faster
    const length = Math.sqrt(x * x + z * z);
    if (length > 0) {
        x /= length;
        z /= length;
    }

    return { x, z };
}

/**
 * Check if the interact key (E) was just pressed
 * Resets the flag after checking (one-shot behavior)
 * @returns {boolean} True if E was just pressed
 */
export function isInteractKeyPressed() {
    const pressed = eKeyJustPressed;
    eKeyJustPressed = false;
    return pressed;
}

/**
 * Check if the escape key is pressed
 * @returns {boolean} True if Escape is pressed
 */
export function isEscapeKeyPressed() {
    return keysPressed.escape;
}

/**
 * Lerp angle with wrapping for smooth rotation
 * Handles the shortest path between angles (e.g., -PI to PI wrap)
 * @param {number} current - Current angle in radians
 * @param {number} target - Target angle in radians
 * @param {number} factor - Lerp factor (0-1)
 * @returns {number} Interpolated angle
 */
function lerpAngle(current, target, factor) {
    // Calculate the difference
    let diff = target - current;

    // Normalize to [-PI, PI] for shortest path
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    return current + diff * factor;
}

/**
 * Update robot position and rotation based on movement input
 * Called every frame by the game loop
 * @param {number} deltaTime - Time since last frame in seconds
 */
function updateMovement(deltaTime) {
    if (!robot) return;

    const movement = getMovementVector();

    // Only move and rotate if there's input
    if (movement.x !== 0 || movement.z !== 0) {
        // Calculate movement amount using speed constant and deltaTime
        const speed = ROBOT.MOVEMENT_SPEED;
        const moveAmount = speed * deltaTime;

        // Update robot position
        robot.position.x += movement.x * moveAmount;
        robot.position.z += movement.z * moveAmount;

        // Calculate target rotation angle from movement direction
        // Math.atan2(x, z) gives angle from +Z axis toward +X axis
        // This matches Three.js rotation.y where 0 = facing +Z, PI/2 = facing +X
        const targetRotation = Math.atan2(movement.x, movement.z);

        // Smoothly lerp toward target rotation
        robot.rotation.y = lerpAngle(robot.rotation.y, targetRotation, ROBOT.ROTATION_LERP);
    }
}

/**
 * Cleanup controls event listeners
 */
export function disposeControls() {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
}
