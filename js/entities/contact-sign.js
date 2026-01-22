/**
 * Contact sign entity
 * A noticeable sign near the garage entrance with contact information
 * Interactive element for displaying Alex's contact details
 */

import * as THREE from 'three';
import { createToonMaterial } from '../core/materials.js';
import { CONTACT } from '../data/content.js';
import { INTERACTION, COLORS } from '../core/constants.js';
import { stations } from './station.js';

// Outline scale factor - matches robot.js for consistent style
const OUTLINE_SCALE = 1.06;

// Shared outline material - black backface-only for inverted hull technique
const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide
});

// Contact sign colors
const SIGN_SURFACE = 0x1a1a2e;  // Dark surface for contrast
const SIGN_FRAME = 0x2d3436;  // Dark gray frame
const TEAL_ACCENT = 0x00b8d4;  // Bright teal accent (draws attention)

// Materials
const signSurfaceMaterial = createToonMaterial(SIGN_SURFACE);
const frameMaterial = createToonMaterial(SIGN_FRAME);
const tealAccentMaterial = createToonMaterial(TEAL_ACCENT);

// Emissive teal for glow effect (makes sign noticeable)
const tealGlowMaterial = new THREE.MeshBasicMaterial({
    color: TEAL_ACCENT,
    transparent: true,
    opacity: 0.9
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
    outlineMesh.scale.copy(mesh.scale).multiplyScalar(scale);
    outlineMesh.name = mesh.name + '_outline';
    outlineMesh.castShadow = false;
    outlineMesh.receiveShadow = false;
    group.add(outlineMesh);
}

// Module-level reference for interaction system
export let contactSign = null;

/**
 * Creates the contact sign
 * Positioned near the garage entrance to be easily discoverable
 *
 * Design:
 * - 3x2 unit sign surface with dark background
 * - Teal accent frame to draw attention
 * - Mounted at position (8, 5, 16) - near front right of garage entrance
 *
 * @param {THREE.Scene} scene - The scene to add the contact sign to
 * @returns {THREE.Group} - Contact sign group
 */
export function createContactSign(scene) {
    const group = new THREE.Group();
    group.name = 'contact-sign';

    // Position near garage entrance - facing into the garage
    // Garage door opening is at Z = 20 (front wall), so this is just inside
    group.position.set(8, 5, 16);

    // === DIMENSIONS ===
    const signWidth = 3;
    const signHeight = 2;
    const signDepth = 0.1;  // Thickness of the sign
    const frameWidth = 0.15;  // Width of the frame border
    const frameDepth = 0.12;  // How far frame sticks out
    const accentStripHeight = 0.08;  // Thin accent strip

    // === SIGN SURFACE (dark background) ===
    const surfaceGeometry = new THREE.BoxGeometry(signWidth, signHeight, signDepth);
    const surface = new THREE.Mesh(surfaceGeometry, signSurfaceMaterial);
    surface.name = 'contact-sign-surface';
    surface.castShadow = true;
    surface.receiveShadow = true;
    group.add(surface);
    addOutlineToMesh(surface, group);

    // === FRAME - Four sides with teal accent ===

    // Top frame piece (teal accent - most visible)
    const topFrameGeometry = new THREE.BoxGeometry(signWidth + frameWidth * 2, frameWidth, frameDepth);
    const topFrame = new THREE.Mesh(topFrameGeometry, tealAccentMaterial);
    topFrame.name = 'contact-sign-frame-top';
    topFrame.position.set(0, signHeight / 2 + frameWidth / 2, signDepth / 2 + frameDepth / 2 - 0.02);
    topFrame.castShadow = true;
    topFrame.receiveShadow = true;
    group.add(topFrame);
    addOutlineToMesh(topFrame, group);

    // Bottom frame piece (teal accent)
    const bottomFrame = new THREE.Mesh(topFrameGeometry, tealAccentMaterial);
    bottomFrame.name = 'contact-sign-frame-bottom';
    bottomFrame.position.set(0, -signHeight / 2 - frameWidth / 2, signDepth / 2 + frameDepth / 2 - 0.02);
    bottomFrame.castShadow = true;
    bottomFrame.receiveShadow = true;
    group.add(bottomFrame);
    addOutlineToMesh(bottomFrame, group);

    // Left frame piece (teal accent)
    const sideFrameGeometry = new THREE.BoxGeometry(frameWidth, signHeight, frameDepth);
    const leftFrame = new THREE.Mesh(sideFrameGeometry, tealAccentMaterial);
    leftFrame.name = 'contact-sign-frame-left';
    leftFrame.position.set(-signWidth / 2 - frameWidth / 2, 0, signDepth / 2 + frameDepth / 2 - 0.02);
    leftFrame.castShadow = true;
    leftFrame.receiveShadow = true;
    group.add(leftFrame);
    addOutlineToMesh(leftFrame, group);

    // Right frame piece (teal accent)
    const rightFrame = new THREE.Mesh(sideFrameGeometry, tealAccentMaterial);
    rightFrame.name = 'contact-sign-frame-right';
    rightFrame.position.set(signWidth / 2 + frameWidth / 2, 0, signDepth / 2 + frameDepth / 2 - 0.02);
    rightFrame.castShadow = true;
    rightFrame.receiveShadow = true;
    group.add(rightFrame);
    addOutlineToMesh(rightFrame, group);

    // === DECORATIVE ELEMENTS - Make it look like a contact/info sign ===

    // Envelope icon representation (blocky voxel style)
    // Main envelope body
    const envelopeWidth = 0.6;
    const envelopeHeight = 0.4;
    const envelopeDepth = 0.05;
    const envelopeGeometry = new THREE.BoxGeometry(envelopeWidth, envelopeHeight, envelopeDepth);
    const envelope = new THREE.Mesh(envelopeGeometry, tealGlowMaterial);
    envelope.name = 'contact-envelope';
    envelope.position.set(-0.8, 0.4, signDepth / 2 + 0.03);
    group.add(envelope);

    // Envelope flap (triangle approximation with boxes)
    const flapGeometry = new THREE.BoxGeometry(envelopeWidth * 0.8, 0.08, envelopeDepth);
    const flap = new THREE.Mesh(flapGeometry, tealGlowMaterial);
    flap.name = 'contact-envelope-flap';
    flap.position.set(-0.8, 0.55, signDepth / 2 + 0.035);
    flap.rotation.z = -0.2;
    group.add(flap);

    // @ symbol representation (blocky - circle approximation with small boxes)
    // Center dot
    const atCenterGeometry = new THREE.BoxGeometry(0.12, 0.12, envelopeDepth);
    const atCenter = new THREE.Mesh(atCenterGeometry, tealGlowMaterial);
    atCenter.name = 'contact-at-center';
    atCenter.position.set(0.8, 0.4, signDepth / 2 + 0.03);
    group.add(atCenter);

    // @ ring (4 small boxes in cardinal directions)
    const atRingGeometry = new THREE.BoxGeometry(0.08, 0.08, envelopeDepth);
    const atRingPositions = [
        { x: 0.8, y: 0.55 },  // top
        { x: 0.8, y: 0.25 },  // bottom
        { x: 0.65, y: 0.4 },  // left
        { x: 0.95, y: 0.4 },  // right
    ];
    atRingPositions.forEach((pos, i) => {
        const ringPart = new THREE.Mesh(atRingGeometry, tealGlowMaterial);
        ringPart.name = `contact-at-ring-${i}`;
        ringPart.position.set(pos.x, pos.y, signDepth / 2 + 0.03);
        group.add(ringPart);
    });

    // Horizontal line decoration below icons
    const lineGeometry = new THREE.BoxGeometry(signWidth * 0.8, accentStripHeight, envelopeDepth);
    const decorLine = new THREE.Mesh(lineGeometry, tealGlowMaterial);
    decorLine.name = 'contact-decor-line';
    decorLine.position.set(0, 0, signDepth / 2 + 0.03);
    group.add(decorLine);

    // Small location marker icon (pin shape with boxes)
    const pinBodyGeometry = new THREE.BoxGeometry(0.15, 0.25, envelopeDepth);
    const pinBody = new THREE.Mesh(pinBodyGeometry, tealGlowMaterial);
    pinBody.name = 'contact-pin-body';
    pinBody.position.set(0, -0.5, signDepth / 2 + 0.03);
    group.add(pinBody);

    const pinPointGeometry = new THREE.BoxGeometry(0.08, 0.1, envelopeDepth);
    const pinPoint = new THREE.Mesh(pinPointGeometry, tealGlowMaterial);
    pinPoint.name = 'contact-pin-point';
    pinPoint.position.set(0, -0.7, signDepth / 2 + 0.03);
    group.add(pinPoint);

    // Store module-level reference for interaction system
    contactSign = group;

    // === INTERACTION SETUP ===
    // Build contact content data from CONTACT in content.js
    const contactInfo = [
        `Email: ${CONTACT.email}`,
        `LinkedIn: ${CONTACT.linkedin}`,
        `GitHub: ${CONTACT.github}`,
        `Location: ${CONTACT.location}`
    ];

    // Set up userData for interaction system (same pattern as stations)
    group.userData = {
        id: 'contact-sign',
        contentData: {
            title: CONTACT.title,
            subtitle: CONTACT.subtitle,
            description: 'Feel free to reach out through any of these channels!',
            achievements: contactInfo
        },
        isStation: true,  // Treat as station for interaction system
        interactionRadius: INTERACTION.RADIUS
    };

    // Register contact sign with the stations array for proximity detection
    stations.push(group);

    // Add to scene
    scene.add(group);

    return group;
}

/**
 * Returns all meshes in the contact sign group
 * @returns {THREE.Mesh[]} Array of contact sign mesh parts
 */
export function getContactSignMeshes() {
    if (!contactSign) return [];

    const meshes = [];
    contactSign.traverse((child) => {
        if (child.isMesh) {
            meshes.push(child);
        }
    });
    return meshes;
}
