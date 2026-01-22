/**
 * Robot character
 * Player-controlled robot with toon shading
 * Cel-shaded character with charming, simple geometric design
 */

import * as THREE from 'three';
import { ROBOT, COLORS } from '../core/constants.js';
import { robotPrimaryMaterial, robotSecondaryMaterial } from '../core/materials.js';

// Outline scale factor - how much larger the outline mesh is
// Larger scale = thicker outlines (1.03 = 3% = thin line, 1.08 = 8% = medium line)
const OUTLINE_SCALE = 1.05;  // 5% larger for nice cel-shaded outlines

// Module-level robot reference
export let robot = null;

/**
 * Helper function to add an outline mesh to a mesh
 * Uses the inverted hull technique (backface rendering, slightly scaled up)
 * @param {THREE.Mesh} mesh - The mesh to add an outline to
 * @param {THREE.Group} group - The group to add the outline mesh to
 * @param {number} scale - Scale factor for the outline (default OUTLINE_SCALE)
 */
// Shared outline material - black backface-only for inverted hull technique
const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,  // Black outlines
    side: THREE.BackSide
});

/**
 * Helper function to add an outline mesh to a mesh
 * Uses the inverted hull technique (backface rendering, slightly scaled up)
 * @param {THREE.Mesh} mesh - The mesh to add an outline to
 * @param {THREE.Group} group - The group to add the outline mesh to
 * @param {number} scale - Scale factor for the outline (default OUTLINE_SCALE)
 */
function addOutlineToMesh(mesh, group, scale = OUTLINE_SCALE) {
    const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);
    outlineMesh.position.copy(mesh.position);
    outlineMesh.rotation.copy(mesh.rotation);
    outlineMesh.scale.set(scale, scale, scale);
    outlineMesh.name = mesh.name + '_outline';
    // Outlines don't need shadows
    outlineMesh.castShadow = false;
    outlineMesh.receiveShadow = false;
    group.add(outlineMesh);
}

/**
 * Creates the robot character mesh group
 * Design: Simple, charming robot with box torso, sphere head, cylinder limbs
 * Total geometry target: <500 triangles
 *
 * Geometry breakdown:
 * - Body (box): 12 triangles
 * - Head (sphere 8x6): ~96 triangles
 * - Arms (2 cylinders 8 segments): 2 × 32 = 64 triangles
 * - Legs (2 cylinders 8 segments): 2 × 32 = 64 triangles
 * - Feet (2 boxes): 2 × 12 = 24 triangles
 * - Eyes (2 spheres 6x4): 2 × 48 = 96 triangles
 * Total: ~356 triangles (well under 500)
 *
 * @returns {THREE.Group} - Robot character group with all body parts
 */
export function createRobot() {
    const group = new THREE.Group();
    group.name = 'robot';

    // Get dimensions from constants
    const { BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH, HEAD_RADIUS, LIMB_RADIUS, LIMB_LENGTH } = ROBOT;

    // === TORSO (Box) ===
    const torsoGeometry = new THREE.BoxGeometry(BODY_WIDTH, BODY_HEIGHT, BODY_DEPTH);
    const torso = new THREE.Mesh(torsoGeometry, robotPrimaryMaterial);
    torso.name = 'torso';
    torso.castShadow = true;
    torso.receiveShadow = true;
    // Position torso so bottom is at Y=0 relative to leg position
    torso.position.y = LIMB_LENGTH + BODY_HEIGHT / 2;
    group.add(torso);
    addOutlineToMesh(torso, group);

    // === HEAD (Sphere) ===
    // Using 8 width segments, 6 height segments for low-poly look
    const headGeometry = new THREE.SphereGeometry(HEAD_RADIUS, 8, 6);
    const head = new THREE.Mesh(headGeometry, robotPrimaryMaterial);
    head.name = 'head';
    head.castShadow = true;
    head.receiveShadow = true;
    // Position head on top of torso
    head.position.y = LIMB_LENGTH + BODY_HEIGHT + HEAD_RADIUS * 0.8;
    group.add(head);
    addOutlineToMesh(head, group);

    // === EYES (Small spheres - adds character) ===
    const eyeGeometry = new THREE.SphereGeometry(HEAD_RADIUS * 0.2, 6, 4);
    const eyeOffsetX = HEAD_RADIUS * 0.35;
    const eyeOffsetZ = HEAD_RADIUS * 0.85;

    const leftEye = new THREE.Mesh(eyeGeometry, robotSecondaryMaterial);
    leftEye.name = 'leftEye';
    leftEye.position.set(-eyeOffsetX, head.position.y, eyeOffsetZ);
    leftEye.castShadow = true;
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, robotSecondaryMaterial);
    rightEye.name = 'rightEye';
    rightEye.position.set(eyeOffsetX, head.position.y, eyeOffsetZ);
    rightEye.castShadow = true;
    group.add(rightEye);

    // === ARMS (Cylinders) ===
    // 8 radial segments for clean but efficient look
    const armGeometry = new THREE.CylinderGeometry(LIMB_RADIUS, LIMB_RADIUS, LIMB_LENGTH, 8);
    const armY = LIMB_LENGTH + BODY_HEIGHT - LIMB_LENGTH / 2;
    const armX = BODY_WIDTH / 2 + LIMB_RADIUS;

    const leftArm = new THREE.Mesh(armGeometry, robotSecondaryMaterial);
    leftArm.name = 'leftArm';
    leftArm.position.set(-armX, armY, 0);
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;
    group.add(leftArm);
    addOutlineToMesh(leftArm, group);

    const rightArm = new THREE.Mesh(armGeometry, robotSecondaryMaterial);
    rightArm.name = 'rightArm';
    rightArm.position.set(armX, armY, 0);
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;
    group.add(rightArm);
    addOutlineToMesh(rightArm, group);

    // === LEGS (Cylinders) ===
    const legGeometry = new THREE.CylinderGeometry(LIMB_RADIUS, LIMB_RADIUS, LIMB_LENGTH, 8);
    const legX = BODY_WIDTH / 4;
    const legY = LIMB_LENGTH / 2;

    const leftLeg = new THREE.Mesh(legGeometry, robotSecondaryMaterial);
    leftLeg.name = 'leftLeg';
    leftLeg.position.set(-legX, legY, 0);
    leftLeg.castShadow = true;
    leftLeg.receiveShadow = true;
    group.add(leftLeg);
    addOutlineToMesh(leftLeg, group);

    const rightLeg = new THREE.Mesh(legGeometry, robotSecondaryMaterial);
    rightLeg.name = 'rightLeg';
    rightLeg.position.set(legX, legY, 0);
    rightLeg.castShadow = true;
    rightLeg.receiveShadow = true;
    group.add(rightLeg);
    addOutlineToMesh(rightLeg, group);

    // === FEET (Small boxes for stability/character) ===
    const footGeometry = new THREE.BoxGeometry(LIMB_RADIUS * 2.5, LIMB_RADIUS, LIMB_RADIUS * 3);

    const leftFoot = new THREE.Mesh(footGeometry, robotSecondaryMaterial);
    leftFoot.name = 'leftFoot';
    leftFoot.position.set(-legX, LIMB_RADIUS / 2, LIMB_RADIUS * 0.5);
    leftFoot.castShadow = true;
    leftFoot.receiveShadow = true;
    group.add(leftFoot);
    addOutlineToMesh(leftFoot, group);

    const rightFoot = new THREE.Mesh(footGeometry, robotSecondaryMaterial);
    rightFoot.name = 'rightFoot';
    rightFoot.position.set(legX, LIMB_RADIUS / 2, LIMB_RADIUS * 0.5);
    rightFoot.castShadow = true;
    rightFoot.receiveShadow = true;
    group.add(rightFoot);
    addOutlineToMesh(rightFoot, group);

    // === ANTENNA (Small cylinder on head for extra charm) ===
    const antennaGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 6);
    const antenna = new THREE.Mesh(antennaGeometry, robotSecondaryMaterial);
    antenna.name = 'antenna';
    antenna.position.set(0, head.position.y + HEAD_RADIUS + 0.12, 0);
    antenna.castShadow = true;
    group.add(antenna);

    // Antenna tip (small sphere)
    const antennaTipGeometry = new THREE.SphereGeometry(0.06, 6, 4);
    const antennaTip = new THREE.Mesh(antennaTipGeometry, robotPrimaryMaterial);
    antennaTip.name = 'antennaTip';
    antennaTip.position.set(0, head.position.y + HEAD_RADIUS + 0.25, 0);
    antennaTip.castShadow = true;
    group.add(antennaTip);

    // Store module-level reference
    robot = group;

    return group;
}

/**
 * Returns all meshes in the robot group for outline pass
 * @returns {THREE.Mesh[]} Array of robot mesh parts
 */
export function getRobotMeshes() {
    if (!robot) return [];

    const meshes = [];
    robot.traverse((child) => {
        if (child.isMesh) {
            meshes.push(child);
        }
    });
    return meshes;
}
