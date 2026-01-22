/**
 * Interactive station factory
 * Creates career/project stations with collision and interaction
 */

import * as THREE from 'three';
import { registerCollisionBox } from '../systems/collision.js';
import { INTERACTION } from '../core/constants.js';

// Store all created stations for interaction system
const stations = [];

/**
 * Create a station with collision and content data
 * @param {Object} config - Station configuration
 * @param {string} config.id - Unique identifier for the station
 * @param {{x: number, z: number}} config.position - Position in world space
 * @param {{width: number, depth: number}} config.size - Size for collision box
 * @param {Object} config.contentData - Content to display in modal (title, subtitle, description, achievements, etc.)
 * @returns {THREE.Group} Station group to add meshes to
 */
export function createStation(config) {
    const { id, position, size, contentData } = config;

    // Create a group to hold all station meshes
    const group = new THREE.Group();
    group.position.set(position.x, 0, position.z);

    // Store content data and station info in userData for interaction system
    group.userData = {
        id: id,
        contentData: contentData,
        isStation: true,
        interactionRadius: INTERACTION.RADIUS
    };

    // Register collision box with collision system
    registerCollisionBox(id, {
        x: position.x,
        z: position.z,
        width: size.width,
        depth: size.depth
    });

    // Add to stations list for interaction system
    stations.push(group);

    return group;
}

/**
 * Get all created stations
 * @returns {THREE.Group[]} Array of station groups
 */
export function getStations() {
    return stations;
}

/**
 * Check if robot is near any station and return the closest one
 * @param {{x: number, z: number}} robotPosition - Robot's current position
 * @returns {THREE.Group|null} Nearest station within interaction radius, or null
 */
export function checkStationProximity(robotPosition) {
    let nearestStation = null;
    let nearestDistance = Infinity;

    for (const station of stations) {
        // Calculate distance from robot to station center
        const dx = robotPosition.x - station.position.x;
        const dz = robotPosition.z - station.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Get interaction radius from station (default to global INTERACTION.RADIUS)
        const radius = station.userData.interactionRadius || INTERACTION.RADIUS;

        // Check if within interaction radius and closer than previous nearest
        if (distance < radius && distance < nearestDistance) {
            nearestStation = station;
            nearestDistance = distance;
        }
    }

    return nearestStation;
}

/**
 * Clear all stations (for reset/testing)
 */
export function clearStations() {
    stations.length = 0;
}

// Re-export stations array for direct access if needed
export { stations };
