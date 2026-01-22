/**
 * Collision detection
 * AABB collision for boundaries and objects
 */

import { GARAGE, COLLISION } from '../core/constants.js';

// Store all registered collision boxes
// Each box: { id, x, z, width, depth, minX, maxX, minZ, maxZ }
const collisionBoxes = [];

/**
 * Clamp robot position within garage boundaries
 * @param {{x: number, z: number}} position - Position to clamp
 * @returns {{x: number, z: number}} Clamped position
 */
export function checkBoundaries(position) {
    return {
        x: Math.max(GARAGE.BOUNDARY_MIN, Math.min(GARAGE.BOUNDARY_MAX, position.x)),
        z: Math.max(GARAGE.BOUNDARY_MIN, Math.min(GARAGE.BOUNDARY_MAX, position.z))
    };
}

/**
 * Register a collision box for an object
 * @param {string} id - Unique identifier for the object
 * @param {{x: number, z: number, width: number, depth: number}} box - Box definition
 *        x, z = center position of the box
 *        width = size along X axis
 *        depth = size along Z axis
 */
export function registerCollisionBox(id, box) {
    const halfWidth = box.width / 2;
    const halfDepth = box.depth / 2;

    collisionBoxes.push({
        id,
        x: box.x,
        z: box.z,
        width: box.width,
        depth: box.depth,
        // Pre-calculate min/max bounds for AABB checks
        minX: box.x - halfWidth,
        maxX: box.x + halfWidth,
        minZ: box.z - halfDepth,
        maxZ: box.z + halfDepth
    });
}

/**
 * Remove a collision box by id
 * @param {string} id - The id of the collision box to remove
 */
export function removeCollisionBox(id) {
    const index = collisionBoxes.findIndex(box => box.id === id);
    if (index !== -1) {
        collisionBoxes.splice(index, 1);
    }
}

/**
 * Check if a point (with robot radius) collides with a box
 * @param {number} x - Point X position
 * @param {number} z - Point Z position
 * @param {number} radius - Collision radius of the entity
 * @param {Object} box - Collision box with minX, maxX, minZ, maxZ
 * @returns {boolean} True if collision detected
 */
function pointBoxCollision(x, z, radius, box) {
    // Expand the box by the robot's radius to check collision
    return x + radius > box.minX &&
           x - radius < box.maxX &&
           z + radius > box.minZ &&
           z - radius < box.maxZ;
}

/**
 * Check collisions with all registered objects and adjust position
 * Robot slides along object edges rather than stopping dead
 * @param {{x: number, z: number}} currentPos - Current position before movement
 * @param {{x: number, z: number}} newPos - Desired new position after movement
 * @returns {{x: number, z: number}} Adjusted position after collision resolution
 */
export function checkObjectCollisions(currentPos, newPos) {
    const radius = COLLISION.ROBOT_RADIUS;
    let adjustedX = newPos.x;
    let adjustedZ = newPos.z;

    // Check collision with each box
    for (const box of collisionBoxes) {
        // First, check if the new position would collide
        if (pointBoxCollision(newPos.x, newPos.z, radius, box)) {
            // Collision detected - try to slide along the object

            // Try moving only on X axis (keeping current Z)
            const tryXOnly = pointBoxCollision(newPos.x, currentPos.z, radius, box);

            // Try moving only on Z axis (keeping current X)
            const tryZOnly = pointBoxCollision(currentPos.x, newPos.z, radius, box);

            // Determine which axes to block
            if (tryXOnly && tryZOnly) {
                // Both axes blocked - can't move into this box at all
                adjustedX = currentPos.x;
                adjustedZ = currentPos.z;
            } else if (tryXOnly) {
                // X axis movement is blocked, allow Z movement
                adjustedX = currentPos.x;
            } else if (tryZOnly) {
                // Z axis movement is blocked, allow X movement
                adjustedZ = currentPos.z;
            } else {
                // This case means diagonal movement into corner
                // Try to push out along the shortest axis

                // Calculate overlap on each axis
                const overlapLeft = (newPos.x + radius) - box.minX;
                const overlapRight = box.maxX - (newPos.x - radius);
                const overlapBack = (newPos.z + radius) - box.minZ;
                const overlapFront = box.maxZ - (newPos.z - radius);

                // Find minimum overlap to determine push direction
                const minOverlapX = Math.min(overlapLeft, overlapRight);
                const minOverlapZ = Math.min(overlapBack, overlapFront);

                if (minOverlapX < minOverlapZ) {
                    // Push out on X axis
                    if (overlapLeft < overlapRight) {
                        adjustedX = box.minX - radius;
                    } else {
                        adjustedX = box.maxX + radius;
                    }
                } else {
                    // Push out on Z axis
                    if (overlapBack < overlapFront) {
                        adjustedZ = box.minZ - radius;
                    } else {
                        adjustedZ = box.maxZ + radius;
                    }
                }
            }
        }
    }

    return { x: adjustedX, z: adjustedZ };
}

/**
 * Get all registered collision boxes (for debug/minimap)
 * @returns {Array} Array of collision box objects
 */
export function getCollisionBoxes() {
    return collisionBoxes;
}

/**
 * Clear all collision boxes (for level reset/testing)
 */
export function clearCollisionBoxes() {
    collisionBoxes.length = 0;
}
