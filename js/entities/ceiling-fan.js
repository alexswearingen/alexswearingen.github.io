/**
 * Ceiling Fan entity
 * Voxel-style ceiling fan with chunky motor housing and 4 box blades
 * US-045: Ceiling fan visual design
 */

import * as THREE from 'three';
import { woodMaterial, metalMaterial, createToonMaterial } from '../core/materials.js';
import { ANIMATION } from '../core/constants.js';

// Outline scale factor - how much larger the outline mesh is
const OUTLINE_SCALE = 1.06;

// Shared outline material - black backface-only for inverted hull technique
const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide
});

// White toon material for fan blades
const whiteMaterial = createToonMaterial(0xf5f5f0);

// Module-level reference for animation
let fanGroup = null;

/**
 * Helper function to add an outline mesh to a mesh
 * @param {THREE.Mesh} mesh - The mesh to add an outline to
 * @param {THREE.Group} group - The group to add the outline mesh to
 * @param {number} scale - Scale factor for the outline
 */
function addOutlineToMesh(mesh, group, scale = OUTLINE_SCALE) {
    const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);
    outlineMesh.position.copy(mesh.position);
    outlineMesh.rotation.copy(mesh.rotation);
    outlineMesh.scale.copy(mesh.scale).multiplyScalar(scale);
    outlineMesh.name = mesh.name + '_outline';
    outlineMesh.castShadow = false;
    outlineMesh.receiveShadow = false;
    group.add(outlineMesh);
}

/**
 * Creates a ceiling fan at the center of the garage ceiling
 * VOXEL STYLE: All BoxGeometry for consistent blocky aesthetic
 *
 * Geometry count:
 * - Motor housing: 1 box = 12 triangles
 * - Motor cap: 1 box = 12 triangles
 * - Mount rod: 1 box = 12 triangles
 * - Mount plate: 1 box = 12 triangles
 * - 4 blades: 4 boxes = 48 triangles
 * - 4 blade mounts: 4 boxes = 48 triangles
 * Total: ~144 triangles (well under 200 limit)
 *
 * @param {THREE.Scene} scene - The Three.js scene to add the fan to
 * @returns {THREE.Group} The ceiling fan group (for animation)
 */
export function createCeilingFan(scene) {
    // Main group for the entire fan assembly
    const group = new THREE.Group();
    group.name = 'ceiling-fan';
    group.position.set(0, 14.5, 0);

    // Spinning parts group (motor + blades)
    const spinGroup = new THREE.Group();
    spinGroup.name = 'fan-spin-group';

    // === MOTOR HOUSING (Chunky central box) ===
    const motorWidth = 0.6;
    const motorHeight = 0.4;
    const motorDepth = 0.6;
    const motorGeometry = new THREE.BoxGeometry(motorWidth, motorHeight, motorDepth);
    const motor = new THREE.Mesh(motorGeometry, metalMaterial);
    motor.name = 'fan-motor';
    motor.position.y = -motorHeight / 2;
    motor.castShadow = true;
    motor.receiveShadow = true;
    spinGroup.add(motor);
    addOutlineToMesh(motor, spinGroup);

    // === MOTOR CAP (Bottom decorative piece) ===
    const capWidth = 0.5;
    const capHeight = 0.15;
    const capGeometry = new THREE.BoxGeometry(capWidth, capHeight, capWidth);
    const motorCap = new THREE.Mesh(capGeometry, metalMaterial);
    motorCap.name = 'fan-motor-cap';
    motorCap.position.y = -motorHeight - capHeight / 2;
    motorCap.castShadow = true;
    spinGroup.add(motorCap);
    addOutlineToMesh(motorCap, spinGroup);

    // === FAN BLADES (4 flat rectangular boxes) ===
    const bladeLength = 2.5;
    const bladeWidth = 0.5;
    const bladeThickness = 0.08;
    const bladeGeometry = new THREE.BoxGeometry(bladeLength, bladeThickness, bladeWidth);

    // Position blades at 90 degree intervals
    const bladeOffset = motorWidth / 2 + bladeLength / 2 - 0.1; // Slight overlap with motor
    const bladeY = -motorHeight / 2 - 0.05; // Just below motor center

    for (let i = 0; i < 4; i++) {
        const blade = new THREE.Mesh(bladeGeometry, whiteMaterial);
        blade.name = `fan-blade-${i}`;

        // Position blade extending outward from center
        const angle = (i * Math.PI) / 2; // 0, 90, 180, 270 degrees
        blade.position.x = Math.cos(angle) * bladeOffset;
        blade.position.z = Math.sin(angle) * bladeOffset;
        blade.position.y = bladeY;

        // Rotate blade to extend outward from center
        blade.rotation.y = angle;

        // Slight angle for realistic fan blade pitch
        blade.rotation.z = 0.1;

        blade.castShadow = true;
        blade.receiveShadow = true;
        spinGroup.add(blade);
        addOutlineToMesh(blade, spinGroup);
    }

    // === BLADE MOUNTS (Connect blades to motor) ===
    const mountLength = 0.3;
    const mountWidth = 0.15;
    const mountHeight = 0.12;
    const mountGeometry = new THREE.BoxGeometry(mountLength, mountHeight, mountWidth);

    for (let i = 0; i < 4; i++) {
        const mount = new THREE.Mesh(mountGeometry, metalMaterial);
        mount.name = `fan-blade-mount-${i}`;

        const angle = (i * Math.PI) / 2;
        const mountOffset = motorWidth / 2 + mountLength / 2 - 0.05;
        mount.position.x = Math.cos(angle) * mountOffset;
        mount.position.z = Math.sin(angle) * mountOffset;
        mount.position.y = bladeY + 0.02;
        mount.rotation.y = angle;

        mount.castShadow = true;
        spinGroup.add(mount);
        addOutlineToMesh(mount, spinGroup);
    }

    // Add spinning group to main group
    group.add(spinGroup);

    // === MOUNT ROD (Connects to ceiling - doesn't spin) ===
    const rodWidth = 0.12;
    const rodHeight = 0.4;
    const rodGeometry = new THREE.BoxGeometry(rodWidth, rodHeight, rodWidth);
    const mountRod = new THREE.Mesh(rodGeometry, metalMaterial);
    mountRod.name = 'fan-mount-rod';
    mountRod.position.y = rodHeight / 2;
    mountRod.castShadow = true;
    group.add(mountRod);
    addOutlineToMesh(mountRod, group);

    // === CEILING MOUNT PLATE ===
    const plateWidth = 0.35;
    const plateHeight = 0.1;
    const plateGeometry = new THREE.BoxGeometry(plateWidth, plateHeight, plateWidth);
    const mountPlate = new THREE.Mesh(plateGeometry, metalMaterial);
    mountPlate.name = 'fan-mount-plate';
    mountPlate.position.y = rodHeight + plateHeight / 2 - 0.02;
    mountPlate.castShadow = true;
    group.add(mountPlate);
    addOutlineToMesh(mountPlate, group);

    // Add to scene
    scene.add(group);

    // Store reference for animation
    fanGroup = group;

    return group;
}

/**
 * Updates the ceiling fan animation (rotation)
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateCeilingFanAnimation(deltaTime) {
    if (!fanGroup) return;

    // Get the spinning group (motor + blades)
    const spinGroup = fanGroup.getObjectByName('fan-spin-group');
    if (spinGroup) {
        // Rotate on Y axis at constant speed
        spinGroup.rotation.y += ANIMATION.FAN_ROTATION;
    }
}

/**
 * Gets the ceiling fan group reference
 * @returns {THREE.Group|null} The ceiling fan group
 */
export function getCeilingFan() {
    return fanGroup;
}
