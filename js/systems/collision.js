/**
 * Collision detection
 * AABB collision for boundaries and objects
 */

import { GARAGE } from '../core/constants.js';

// Placeholder - will be implemented in US-013, US-014
const collisionBoxes = [];

export function checkBoundaries(position) {
    return {
        x: Math.max(GARAGE.BOUNDARY_MIN, Math.min(GARAGE.BOUNDARY_MAX, position.x)),
        z: Math.max(GARAGE.BOUNDARY_MIN, Math.min(GARAGE.BOUNDARY_MAX, position.z))
    };
}

export function registerCollisionBox(id, box) {
    collisionBoxes.push({ id, ...box });
}

export function checkObjectCollisions(currentPos, newPos) {
    return newPos;
}

export function getCollisionBoxes() {
    return collisionBoxes;
}
