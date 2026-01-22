/**
 * Certifications display entity
 * Two framed certificate displays on the back wall near the whiteboard
 * Interactive element for displaying Alex's professional certifications
 */

import * as THREE from 'three';
import { createToonMaterial, outlineMaterial } from '../core/materials.js';
import { CERTIFICATIONS } from '../data/content.js';
import { INTERACTION } from '../core/constants.js';
import { stations } from './station.js';

// Outline scale factor - matches robot.js for consistent style
const OUTLINE_SCALE = 1.06;

// Certificate colors
const CERTIFICATE_SURFACE = 0xfaf8f0;  // Off-white/cream (parchment look)
const FRAME_DARK_WOOD = 0x3d2817;  // Dark wood for professional look

// Materials
const certificateSurfaceMaterial = createToonMaterial(CERTIFICATE_SURFACE);
const frameMaterial = createToonMaterial(FRAME_DARK_WOOD);

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
    outlineMesh.scale.copy(mesh.scale).multiplyScalar(scale);
    outlineMesh.name = mesh.name + '_outline';
    outlineMesh.castShadow = false;
    outlineMesh.receiveShadow = false;
    group.add(outlineMesh);
}

// Module-level reference for interaction system
export let certificatesGroup = null;

/**
 * Creates a single certificate frame
 * @param {string} name - Name prefix for the frame parts
 * @returns {THREE.Group} - Certificate frame group
 */
function createCertificateFrame(name) {
    const frameGroup = new THREE.Group();
    frameGroup.name = name;

    // === DIMENSIONS ===
    const certWidth = 2;       // Approximately 2x1.5 units as per acceptance criteria
    const certHeight = 1.5;
    const certDepth = 0.05;    // Thickness of the certificate
    const frameWidth = 0.12;   // Width of the frame border
    const frameDepth = 0.08;   // How far frame sticks out

    // === CERTIFICATE SURFACE (off-white/cream) ===
    const surfaceGeometry = new THREE.BoxGeometry(certWidth, certHeight, certDepth);
    const surface = new THREE.Mesh(surfaceGeometry, certificateSurfaceMaterial);
    surface.name = name + '-surface';
    surface.castShadow = true;
    surface.receiveShadow = true;
    frameGroup.add(surface);
    addOutlineToMesh(surface, frameGroup);

    // === FRAME - Four sides ===
    // Frame sits around the certificate, slightly in front

    // Top frame piece
    const topFrameGeometry = new THREE.BoxGeometry(certWidth + frameWidth * 2, frameWidth, frameDepth);
    const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    topFrame.name = name + '-frame-top';
    topFrame.position.set(0, certHeight / 2 + frameWidth / 2, certDepth / 2 + frameDepth / 2 - 0.02);
    topFrame.castShadow = true;
    topFrame.receiveShadow = true;
    frameGroup.add(topFrame);
    addOutlineToMesh(topFrame, frameGroup);

    // Bottom frame piece
    const bottomFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    bottomFrame.name = name + '-frame-bottom';
    bottomFrame.position.set(0, -certHeight / 2 - frameWidth / 2, certDepth / 2 + frameDepth / 2 - 0.02);
    bottomFrame.castShadow = true;
    bottomFrame.receiveShadow = true;
    frameGroup.add(bottomFrame);
    addOutlineToMesh(bottomFrame, frameGroup);

    // Left frame piece (vertical)
    const sideFrameGeometry = new THREE.BoxGeometry(frameWidth, certHeight, frameDepth);
    const leftFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
    leftFrame.name = name + '-frame-left';
    leftFrame.position.set(-certWidth / 2 - frameWidth / 2, 0, certDepth / 2 + frameDepth / 2 - 0.02);
    leftFrame.castShadow = true;
    leftFrame.receiveShadow = true;
    frameGroup.add(leftFrame);
    addOutlineToMesh(leftFrame, frameGroup);

    // Right frame piece (vertical)
    const rightFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
    rightFrame.name = name + '-frame-right';
    rightFrame.position.set(certWidth / 2 + frameWidth / 2, 0, certDepth / 2 + frameDepth / 2 - 0.02);
    rightFrame.castShadow = true;
    rightFrame.receiveShadow = true;
    frameGroup.add(rightFrame);
    addOutlineToMesh(rightFrame, frameGroup);

    return frameGroup;
}

/**
 * Creates the certifications display
 * Two certificate frames positioned on the back wall near the whiteboard
 *
 * Design:
 * - Two certificate frames at positions (-6, 5, -19) and (6, 5, -19)
 * - Each frame: 2x1.5 unit certificate surface with dark wood frame
 * - Mounted on the back wall, just in front to avoid z-fighting
 *
 * @param {THREE.Scene} scene - The scene to add the certifications to
 * @returns {THREE.Group} - Certifications group
 */
export function createCertifications(scene) {
    const group = new THREE.Group();
    group.name = 'certifications';

    // Position for the certifications group (will contain both frames)
    // Individual frames are positioned relative to this group
    group.position.set(0, 0, 0);

    // === LEFT CERTIFICATE (CompTIA A+) ===
    // Position at (-6, 5, -19) as per acceptance criteria
    const leftCert = createCertificateFrame('cert-comptia');
    leftCert.position.set(-6, 5, -19);
    group.add(leftCert);

    // === RIGHT CERTIFICATE (AWS) ===
    // Position at (6, 5, -19) as per acceptance criteria
    const rightCert = createCertificateFrame('cert-aws');
    rightCert.position.set(6, 5, -19);
    group.add(rightCert);

    // Store module-level reference for interaction system
    certificatesGroup = group;

    // === INTERACTION SETUP ===
    // Build certifications content data from CERTIFICATIONS in content.js
    // Format certifications for display in modal
    const certificationsList = CERTIFICATIONS.items.map(cert => {
        return `${cert.name}: ${cert.description}`;
    });

    // Set up userData for interaction system (same pattern as stations)
    group.userData = {
        id: 'certifications-display',
        contentData: {
            title: CERTIFICATIONS.title,
            subtitle: CERTIFICATIONS.subtitle,
            description: 'Professional certifications demonstrating expertise in IT fundamentals and cloud computing.',
            achievements: certificationsList
        },
        isStation: true,  // Treat as station for interaction system
        interactionRadius: INTERACTION.RADIUS
    };

    // Register certifications with the stations array for proximity detection
    // This allows checkStationProximity() to detect it
    // Note: We register the group, but proximity will check against group.position (0,0,0)
    // So we need to register each certificate frame separately for proper proximity
    // OR we create a virtual center position between the two frames

    // For simplicity, we'll register a virtual center station between the two certificates
    // at position (0, 5, -19) which is between the whiteboard and accessible to the robot
    // Actually, we should register the group itself but set its position to the interaction center

    // Create a separate interaction point between the two certificates
    // The robot can approach from below (Z boundary is -18, certificates are at Z=-19)
    // So the interaction zone should be reachable at Z=-18

    // We'll set up the userData on the group and push to stations
    // The checkStationProximity will use the group's center position
    // Since both certs are symmetric around x=0, the center is (0, 5, -19)

    // For interaction, use a point that the robot can actually reach
    // Robot boundary is Z=-18, so we set the interaction point there
    const interactionPoint = new THREE.Group();
    interactionPoint.name = 'certifications-interaction-point';
    interactionPoint.position.set(0, 5, -18.5);  // Center between certs, slightly forward for reachability
    interactionPoint.userData = {
        id: 'certifications-display',
        contentData: {
            title: CERTIFICATIONS.title,
            subtitle: CERTIFICATIONS.subtitle,
            description: 'Professional certifications demonstrating expertise in IT fundamentals and cloud computing.',
            achievements: certificationsList
        },
        isStation: true,
        interactionRadius: INTERACTION.RADIUS
    };

    // Add interaction point to scene (invisible - just for detection)
    scene.add(interactionPoint);

    // Register the interaction point with stations array
    stations.push(interactionPoint);

    // Add visual group to scene
    scene.add(group);

    return group;
}

/**
 * Returns all meshes in the certifications group
 * @returns {THREE.Mesh[]} Array of certification mesh parts
 */
export function getCertificationsMeshes() {
    if (!certificatesGroup) return [];

    const meshes = [];
    certificatesGroup.traverse((child) => {
        if (child.isMesh) {
            meshes.push(child);
        }
    });
    return meshes;
}
