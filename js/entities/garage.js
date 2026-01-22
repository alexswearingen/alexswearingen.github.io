/**
 * Garage environment geometry
 * Floor, walls, ceiling, beams
 */

import * as THREE from 'three';
import { GARAGE } from '../core/constants.js';
import { concreteMaterial } from '../core/materials.js';

/**
 * Creates the garage floor
 * 40x40 unit PlaneGeometry with concrete toon material
 * @param {THREE.Scene} scene - The Three.js scene to add the floor to
 * @returns {THREE.Mesh} - The floor mesh
 */
export function createFloor(scene) {
    // Create 40x40 plane geometry for floor
    const geometry = new THREE.PlaneGeometry(GARAGE.WIDTH, GARAGE.DEPTH);

    // Create floor mesh with concrete material
    const floor = new THREE.Mesh(geometry, concreteMaterial);

    // Rotate to horizontal (planes face +Z by default, rotate to face +Y)
    floor.rotation.x = -Math.PI / 2;

    // Position at Y=0
    floor.position.y = 0;

    // Enable shadow receiving
    floor.receiveShadow = true;

    // Name for debugging
    floor.name = 'garage-floor';

    // Add to scene
    scene.add(floor);

    return floor;
}

export function createWalls() {
    return null;
}

export function createCeiling() {
    return null;
}

export function createGarage() {
    return null;
}
