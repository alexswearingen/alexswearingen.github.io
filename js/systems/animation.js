/**
 * Robot animation system
 * Handles idle animations when robot is not moving
 */

import { robot } from '../entities/robot.js';
import { getMovementVector } from './controls.js';

// Animation state
let elapsedTime = 0;

// Store original positions/values for parts we animate
let originalPositions = null;
let originalScales = null;

// Animation constants
const IDLE = {
    BOB_AMPLITUDE: 0.05,     // How much the robot bobs up/down
    BOB_SPEED: 2.5,          // Speed of bobbing (radians/sec)
    BREATHE_AMPLITUDE: 0.02, // Body Y scale variation (1.0 to 1.02)
    BREATHE_SPEED: 2.0,      // Speed of breathing
    ANTENNA_SWAY: 0.15,      // Antenna sway rotation (radians)
    ANTENNA_SPEED: 3.0,      // Speed of antenna sway
    VISOR_PULSE: 0.1,        // Visor opacity pulse amplitude
    VISOR_SPEED: 1.5         // Speed of visor pulse
};

/**
 * Initialize animation by storing original part positions
 */
function initAnimationState() {
    if (!robot || originalPositions !== null) return;

    originalPositions = {};
    originalScales = {};

    // Store original Y positions for parts we'll bob
    const partsToTrack = ['body', 'head', 'antenna', 'antennaTip', 'chestPanel',
                          'visor', 'visorFrame', 'leftEye', 'rightEye',
                          'leftEar', 'rightEar', 'leftArm', 'rightArm',
                          'leftHand', 'rightHand'];

    partsToTrack.forEach(partName => {
        const part = robot.getObjectByName(partName);
        if (part) {
            originalPositions[partName] = part.position.y;
            originalScales[partName] = { x: part.scale.x, y: part.scale.y, z: part.scale.z };
        }
    });

    // Also store outline positions
    partsToTrack.forEach(partName => {
        const outline = robot.getObjectByName(partName + '_outline');
        if (outline) {
            originalPositions[partName + '_outline'] = outline.position.y;
        }
    });
}

/**
 * Check if robot is currently moving
 * @returns {boolean}
 */
function isRobotMoving() {
    const movement = getMovementVector();
    return movement.x !== 0 || movement.z !== 0;
}

/**
 * Apply bobbing motion to a mesh and its outline
 * @param {string} partName - Name of the part
 * @param {number} bobOffset - Vertical offset to apply
 */
function applyBob(partName, bobOffset) {
    const part = robot.getObjectByName(partName);
    const outline = robot.getObjectByName(partName + '_outline');

    if (part && originalPositions[partName] !== undefined) {
        part.position.y = originalPositions[partName] + bobOffset;
    }
    if (outline && originalPositions[partName + '_outline'] !== undefined) {
        outline.position.y = originalPositions[partName + '_outline'] + bobOffset;
    }
}

/**
 * Reset all parts to their original positions
 */
function resetToOriginalPositions() {
    if (!originalPositions) return;

    // Reset positions
    Object.keys(originalPositions).forEach(partName => {
        const part = robot.getObjectByName(partName);
        if (part) {
            part.position.y = originalPositions[partName];
        }
    });

    // Reset scales
    Object.keys(originalScales).forEach(partName => {
        const part = robot.getObjectByName(partName);
        if (part) {
            part.scale.set(
                originalScales[partName].x,
                originalScales[partName].y,
                originalScales[partName].z
            );
        }
    });

    // Reset antenna rotation
    const antenna = robot.getObjectByName('antenna');
    const antennaTip = robot.getObjectByName('antennaTip');
    if (antenna) antenna.rotation.z = 0;
    if (antennaTip) antennaTip.rotation.z = 0;
}

/**
 * Update robot animation each frame
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateRobotAnimation(deltaTime) {
    if (!robot) return;

    // Initialize original positions on first run
    initAnimationState();

    // Accumulate time for smooth animation
    elapsedTime += deltaTime;

    // Check if robot is moving
    const moving = isRobotMoving();

    if (moving) {
        // When moving, reset to original positions
        // (Walk animation will be handled in US-065)
        resetToOriginalPositions();
        return;
    }

    // === IDLE ANIMATION ===

    // 1. Gentle bobbing motion (sine wave)
    const bobOffset = Math.sin(elapsedTime * IDLE.BOB_SPEED) * IDLE.BOB_AMPLITUDE;

    // Apply bob to upper body parts (everything above legs)
    const upperBodyParts = ['body', 'head', 'antenna', 'antennaTip', 'chestPanel',
                           'visor', 'visorFrame', 'leftEye', 'rightEye',
                           'leftEar', 'rightEar', 'leftArm', 'rightArm',
                           'leftHand', 'rightHand'];

    upperBodyParts.forEach(partName => {
        applyBob(partName, bobOffset);
    });

    // 2. Subtle breathing (body Y scale)
    const body = robot.getObjectByName('body');
    const bodyOutline = robot.getObjectByName('body_outline');
    if (body && originalScales.body) {
        const breatheScale = 1.0 + Math.sin(elapsedTime * IDLE.BREATHE_SPEED) * IDLE.BREATHE_AMPLITUDE;
        body.scale.y = originalScales.body.y * breatheScale;
        if (bodyOutline) {
            bodyOutline.scale.y = originalScales.body.y * breatheScale * 1.06; // Match outline scale
        }
    }

    // 3. Antenna sway (side to side rotation)
    const antenna = robot.getObjectByName('antenna');
    const antennaTip = robot.getObjectByName('antennaTip');
    const antennaOutline = robot.getObjectByName('antenna_outline');
    const antennaTipOutline = robot.getObjectByName('antennaTip_outline');

    if (antenna) {
        const swayAngle = Math.sin(elapsedTime * IDLE.ANTENNA_SPEED) * IDLE.ANTENNA_SWAY;
        antenna.rotation.z = swayAngle;
        if (antennaOutline) antennaOutline.rotation.z = swayAngle;
    }
    if (antennaTip) {
        // Antenna tip sways slightly more (follows antenna base)
        const tipSwayAngle = Math.sin(elapsedTime * IDLE.ANTENNA_SPEED) * IDLE.ANTENNA_SWAY * 1.2;
        antennaTip.rotation.z = tipSwayAngle;
        if (antennaTipOutline) antennaTipOutline.rotation.z = tipSwayAngle;
    }

    // 4. Visor glow pulse
    const visor = robot.getObjectByName('visor');
    if (visor && visor.material) {
        const pulseValue = 0.85 + Math.sin(elapsedTime * IDLE.VISOR_SPEED) * IDLE.VISOR_PULSE;
        visor.material.opacity = Math.max(0.7, Math.min(1.0, pulseValue));
    }
}
