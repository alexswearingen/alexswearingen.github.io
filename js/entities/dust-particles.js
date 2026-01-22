/**
 * Dust Particles entity
 * Floating dust particles for atmospheric effect
 * US-051: Dust particles visual effect
 */

import * as THREE from 'three';
import { GARAGE, PARTICLES } from '../core/constants.js';

// Module-level reference for animation
let particleSystem = null;
let velocities = null;

// Particle bounds (inside garage walls with some margin)
const BOUNDS = {
    minX: GARAGE.BOUNDARY_MIN + 1,
    maxX: GARAGE.BOUNDARY_MAX - 1,
    minY: 0.5,  // Above floor
    maxY: GARAGE.HEIGHT - 1,  // Below ceiling
    minZ: GARAGE.BOUNDARY_MIN + 1,
    maxZ: GARAGE.BOUNDARY_MAX - 1
};

/**
 * Creates dust particles floating throughout the garage
 * Uses Three.js Points for efficient particle rendering
 *
 * Geometry count:
 * - 60 points = minimal geometry overhead
 *
 * @param {THREE.Scene} scene - The Three.js scene to add the particles to
 * @returns {THREE.Points} The particle system
 */
export function createDustParticles(scene) {
    const particleCount = PARTICLES.DUST_COUNT;

    // Create geometry with positions for each particle
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    // Initialize velocities array for drift animation
    velocities = new Float32Array(particleCount * 3);

    // Distribute particles randomly throughout the garage volume
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Random position within bounds
        positions[i3] = BOUNDS.minX + Math.random() * (BOUNDS.maxX - BOUNDS.minX);     // X
        positions[i3 + 1] = BOUNDS.minY + Math.random() * (BOUNDS.maxY - BOUNDS.minY); // Y
        positions[i3 + 2] = BOUNDS.minZ + Math.random() * (BOUNDS.maxZ - BOUNDS.minZ); // Z

        // Random velocity for each particle (very slow drift)
        // Each particle drifts in a slightly different direction
        const speed = PARTICLES.DUST_SPEED;
        velocities[i3] = (Math.random() - 0.5) * speed * 2;     // X velocity
        velocities[i3 + 1] = (Math.random() - 0.5) * speed * 0.5; // Y velocity (slower vertical)
        velocities[i3 + 2] = (Math.random() - 0.5) * speed * 2; // Z velocity
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create material for dust particles
    // White/light gray, semi-transparent, small size
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: PARTICLES.DUST_SIZE,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true,  // Size varies with distance
        depthWrite: false       // Don't write to depth buffer (prevents z-fighting)
    });

    // Create the Points object
    const points = new THREE.Points(geometry, material);
    points.name = 'dust-particles';

    // Particles don't cast or receive shadows (too small and transparent)
    points.frustumCulled = false; // Always render (particles span entire garage)

    scene.add(points);

    // Store reference for animation
    particleSystem = points;

    return points;
}

/**
 * Updates the dust particles animation (drift and wrap)
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateDustParticles(deltaTime) {
    if (!particleSystem || !velocities) return;

    const positions = particleSystem.geometry.attributes.position.array;
    const particleCount = positions.length / 3;

    // Update each particle position
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Apply velocity (scaled by deltaTime for frame-rate independence)
        // Multiply by 60 to normalize for 60fps baseline (PARTICLES.DUST_SPEED is per-frame at 60fps)
        const dtFactor = deltaTime * 60;
        positions[i3] += velocities[i3] * dtFactor;         // X
        positions[i3 + 1] += velocities[i3 + 1] * dtFactor; // Y
        positions[i3 + 2] += velocities[i3 + 2] * dtFactor; // Z

        // Wrap around when leaving bounds (creates endless particle flow)
        // X wrap
        if (positions[i3] < BOUNDS.minX) {
            positions[i3] = BOUNDS.maxX;
        } else if (positions[i3] > BOUNDS.maxX) {
            positions[i3] = BOUNDS.minX;
        }

        // Y wrap
        if (positions[i3 + 1] < BOUNDS.minY) {
            positions[i3 + 1] = BOUNDS.maxY;
        } else if (positions[i3 + 1] > BOUNDS.maxY) {
            positions[i3 + 1] = BOUNDS.minY;
        }

        // Z wrap
        if (positions[i3 + 2] < BOUNDS.minZ) {
            positions[i3 + 2] = BOUNDS.maxZ;
        } else if (positions[i3 + 2] > BOUNDS.maxZ) {
            positions[i3 + 2] = BOUNDS.minZ;
        }
    }

    // Mark positions as needing update
    particleSystem.geometry.attributes.position.needsUpdate = true;
}

/**
 * Gets the dust particles system reference
 * @returns {THREE.Points|null} The particle system
 */
export function getDustParticles() {
    return particleSystem;
}
