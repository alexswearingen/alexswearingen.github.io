/**
 * Wall clock and bulletin board entity (US-078)
 * Typical garage wall decorations for lived-in feel
 *
 * Design features:
 * - Wall clock at (10, 7, -19) on back wall - circular face with box frame
 * - Calendar/bulletin board at (14, 6, -19) - rectangular with pushpins/notes
 * - Decorative only (not interactable)
 * - ALL BoxGeometry for voxel aesthetic
 * - Black inverted hull outlines on all parts
 */

import * as THREE from 'three';
import { createToonMaterial, outlineMaterial } from '../core/materials.js';

// Outline scale factor for inverted hull technique
const OUTLINE_SCALE = 1.05;

// Materials
const clockFrameMaterial = createToonMaterial(0x2c3e50);      // Dark blue-gray frame
const clockFaceMaterial = createToonMaterial(0xecf0f1);       // Off-white clock face
const clockHandMaterial = createToonMaterial(0x1a1a1a);       // Black for hands
const clockCenterMaterial = createToonMaterial(0xc0392b);     // Red center dot
const bulletinBoardMaterial = createToonMaterial(0x8b6914);   // Cork brown
const bulletinFrameMaterial = createToonMaterial(0x5d4e37);   // Dark wood frame
const pushpinRedMaterial = createToonMaterial(0xe74c3c);      // Red pushpin
const pushpinYellowMaterial = createToonMaterial(0xf1c40f);   // Yellow pushpin
const pushpinBlueMaterial = createToonMaterial(0x3498db);     // Blue pushpin
const noteWhiteMaterial = createToonMaterial(0xffffff);       // White paper
const noteYellowMaterial = createToonMaterial(0xf9e79f);      // Yellow sticky note
const notePinkMaterial = createToonMaterial(0xfadbd8);        // Pink sticky note
const noteGreenMaterial = createToonMaterial(0xd5f5e3);       // Green sticky note
const noteBlueMaterial = createToonMaterial(0xd4e6f1);        // Blue sticky note

// Module-level references
export let wallClock = null;
export let bulletinBoard = null;

/**
 * Helper function to add an outline mesh using inverted hull technique
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

/**
 * Creates a wall-mounted clock
 * Using box geometry to approximate circular shape (voxel aesthetic)
 *
 * @param {THREE.Scene} scene - The scene to add the clock to
 * @returns {THREE.Group} Clock group with all meshes
 */
export function createWallClock(scene) {
    const group = new THREE.Group();
    group.name = 'wall-clock';

    // Position on back wall, right side
    // Back wall is at Z = -20, so position slightly in front
    group.position.set(10, 7, -19.5);

    // === CLOCK FRAME (octagonal approximation using overlapping boxes) ===
    const frameThickness = 0.15;
    const frameDepth = 0.2;
    const clockRadius = 0.8;

    // Main square frame
    const frameGeometry = new THREE.BoxGeometry(clockRadius * 2, clockRadius * 2, frameDepth);
    const frame = new THREE.Mesh(frameGeometry, clockFrameMaterial);
    frame.name = 'clock-frame';
    frame.castShadow = true;
    frame.receiveShadow = true;
    group.add(frame);
    addOutlineToMesh(frame, group);

    // === CLOCK FACE ===
    const faceGeometry = new THREE.BoxGeometry(clockRadius * 1.7, clockRadius * 1.7, 0.05);
    const face = new THREE.Mesh(faceGeometry, clockFaceMaterial);
    face.name = 'clock-face';
    face.position.z = frameDepth / 2 - 0.02;
    face.castShadow = true;
    group.add(face);
    addOutlineToMesh(face, group);

    // === HOUR MARKERS (12 small boxes around the face) ===
    const markerGeometry = new THREE.BoxGeometry(0.08, 0.03, 0.02);
    const hourPositions = [
        { angle: 0, long: true },      // 12 o'clock
        { angle: 30, long: false },
        { angle: 60, long: false },
        { angle: 90, long: true },     // 3 o'clock
        { angle: 120, long: false },
        { angle: 150, long: false },
        { angle: 180, long: true },    // 6 o'clock
        { angle: 210, long: false },
        { angle: 240, long: false },
        { angle: 270, long: true },    // 9 o'clock
        { angle: 300, long: false },
        { angle: 330, long: false },
    ];

    hourPositions.forEach((pos, i) => {
        const angleRad = (pos.angle - 90) * Math.PI / 180; // Start from 12 o'clock
        const radius = clockRadius * 0.7;
        const markerSize = pos.long ? 0.12 : 0.08;

        const markerGeo = new THREE.BoxGeometry(markerSize, 0.04, 0.02);
        const marker = new THREE.Mesh(markerGeo, clockHandMaterial);
        marker.name = `clock-marker-${i}`;
        marker.position.x = Math.cos(angleRad) * radius;
        marker.position.y = Math.sin(angleRad) * radius;
        marker.position.z = frameDepth / 2;
        marker.rotation.z = angleRad; // Rotate to point toward center
        marker.castShadow = true;
        group.add(marker);
    });

    // === CLOCK HANDS ===
    // Hour hand (short, wide)
    const hourHandGeometry = new THREE.BoxGeometry(0.35, 0.06, 0.03);
    const hourHand = new THREE.Mesh(hourHandGeometry, clockHandMaterial);
    hourHand.name = 'clock-hour-hand';
    // Position so one end is at center (pivot point)
    hourHand.position.set(0.15, 0.08, frameDepth / 2 + 0.01);
    hourHand.rotation.z = Math.PI / 6; // ~2 o'clock position
    hourHand.castShadow = true;
    group.add(hourHand);
    addOutlineToMesh(hourHand, group, 1.08);

    // Minute hand (longer, thinner)
    const minuteHandGeometry = new THREE.BoxGeometry(0.5, 0.04, 0.025);
    const minuteHand = new THREE.Mesh(minuteHandGeometry, clockHandMaterial);
    minuteHand.name = 'clock-minute-hand';
    minuteHand.position.set(0.08, 0.2, frameDepth / 2 + 0.02);
    minuteHand.rotation.z = Math.PI / 3; // ~10 minute position
    minuteHand.castShadow = true;
    group.add(minuteHand);
    addOutlineToMesh(minuteHand, group, 1.08);

    // Center cap (covers hand pivot)
    const centerCapGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.04);
    const centerCap = new THREE.Mesh(centerCapGeometry, clockCenterMaterial);
    centerCap.name = 'clock-center';
    centerCap.position.z = frameDepth / 2 + 0.02;
    centerCap.castShadow = true;
    group.add(centerCap);
    addOutlineToMesh(centerCap, group);

    // Store module-level reference
    wallClock = group;

    // Add to scene
    scene.add(group);

    return group;
}

/**
 * Creates a bulletin board / calendar with pinned notes
 *
 * @param {THREE.Scene} scene - The scene to add the bulletin board to
 * @returns {THREE.Group} Bulletin board group with all meshes
 */
export function createBulletinBoard(scene) {
    const group = new THREE.Group();
    group.name = 'bulletin-board';

    // Position on back wall, right of clock
    group.position.set(14, 6, -19.5);

    // === BULLETIN BOARD FRAME ===
    const boardWidth = 2.5;
    const boardHeight = 2.0;
    const boardDepth = 0.15;
    const frameWidth = 0.12;

    // Cork board surface
    const corkGeometry = new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth);
    const cork = new THREE.Mesh(corkGeometry, bulletinBoardMaterial);
    cork.name = 'bulletin-cork';
    cork.castShadow = true;
    cork.receiveShadow = true;
    group.add(cork);
    addOutlineToMesh(cork, group);

    // Frame pieces (top, bottom, left, right)
    const frameHorizontalGeo = new THREE.BoxGeometry(boardWidth + frameWidth * 2, frameWidth, boardDepth + 0.02);
    const frameVerticalGeo = new THREE.BoxGeometry(frameWidth, boardHeight, boardDepth + 0.02);

    // Top frame
    const frameTop = new THREE.Mesh(frameHorizontalGeo, bulletinFrameMaterial);
    frameTop.name = 'bulletin-frame-top';
    frameTop.position.set(0, boardHeight / 2 + frameWidth / 2, 0.01);
    frameTop.castShadow = true;
    group.add(frameTop);
    addOutlineToMesh(frameTop, group);

    // Bottom frame
    const frameBottom = new THREE.Mesh(frameHorizontalGeo, bulletinFrameMaterial);
    frameBottom.name = 'bulletin-frame-bottom';
    frameBottom.position.set(0, -boardHeight / 2 - frameWidth / 2, 0.01);
    frameBottom.castShadow = true;
    group.add(frameBottom);
    addOutlineToMesh(frameBottom, group);

    // Left frame
    const frameLeft = new THREE.Mesh(frameVerticalGeo, bulletinFrameMaterial);
    frameLeft.name = 'bulletin-frame-left';
    frameLeft.position.set(-boardWidth / 2 - frameWidth / 2, 0, 0.01);
    frameLeft.castShadow = true;
    group.add(frameLeft);
    addOutlineToMesh(frameLeft, group);

    // Right frame
    const frameRight = new THREE.Mesh(frameVerticalGeo, bulletinFrameMaterial);
    frameRight.name = 'bulletin-frame-right';
    frameRight.position.set(boardWidth / 2 + frameWidth / 2, 0, 0.01);
    frameRight.castShadow = true;
    group.add(frameRight);
    addOutlineToMesh(frameRight, group);

    // === PINNED NOTES AND ITEMS ===
    // Create various notes in different colors and sizes

    // Note configurations: { x, y, width, height, rotation, material, hasPushpin, pushpinColor }
    const notes = [
        // Large white note (calendar/list) - top left
        { x: -0.7, y: 0.5, w: 0.6, h: 0.8, rot: 0.02, mat: noteWhiteMaterial, pin: true, pinMat: pushpinRedMaterial },

        // Yellow sticky note - top center
        { x: 0.2, y: 0.6, w: 0.4, h: 0.4, rot: -0.05, mat: noteYellowMaterial, pin: true, pinMat: pushpinYellowMaterial },

        // Pink sticky note - top right
        { x: 0.8, y: 0.45, w: 0.35, h: 0.35, rot: 0.08, mat: notePinkMaterial, pin: true, pinMat: pushpinRedMaterial },

        // Green note - middle left
        { x: -0.85, y: -0.15, w: 0.45, h: 0.5, rot: -0.03, mat: noteGreenMaterial, pin: true, pinMat: pushpinBlueMaterial },

        // Blue note - middle center
        { x: 0.1, y: -0.1, w: 0.5, h: 0.45, rot: 0.04, mat: noteBlueMaterial, pin: true, pinMat: pushpinYellowMaterial },

        // Small white note - middle right
        { x: 0.75, y: -0.2, w: 0.3, h: 0.4, rot: -0.06, mat: noteWhiteMaterial, pin: true, pinMat: pushpinRedMaterial },

        // Yellow note - bottom left
        { x: -0.6, y: -0.7, w: 0.4, h: 0.35, rot: 0.1, mat: noteYellowMaterial, pin: true, pinMat: pushpinBlueMaterial },

        // Pink note - bottom center
        { x: 0.25, y: -0.65, w: 0.38, h: 0.3, rot: -0.08, mat: notePinkMaterial, pin: true, pinMat: pushpinYellowMaterial },

        // Small green note - bottom right
        { x: 0.85, y: -0.7, w: 0.32, h: 0.32, rot: 0.05, mat: noteGreenMaterial, pin: true, pinMat: pushpinRedMaterial },
    ];

    notes.forEach((note, i) => {
        // Paper/note
        const noteGeometry = new THREE.BoxGeometry(note.w, note.h, 0.02);
        const noteMesh = new THREE.Mesh(noteGeometry, note.mat);
        noteMesh.name = `bulletin-note-${i}`;
        noteMesh.position.set(note.x, note.y, boardDepth / 2 + 0.02);
        noteMesh.rotation.z = note.rot;
        noteMesh.castShadow = true;
        group.add(noteMesh);
        addOutlineToMesh(noteMesh, group);

        // Pushpin (if present)
        if (note.pin) {
            // Pin head (small box)
            const pinHeadGeometry = new THREE.BoxGeometry(0.06, 0.06, 0.04);
            const pinHead = new THREE.Mesh(pinHeadGeometry, note.pinMat);
            pinHead.name = `bulletin-pin-${i}`;
            // Position at top-center of note
            pinHead.position.set(
                note.x + Math.sin(note.rot) * note.h * 0.35,
                note.y + Math.cos(note.rot) * note.h * 0.35,
                boardDepth / 2 + 0.05
            );
            pinHead.castShadow = true;
            group.add(pinHead);
            addOutlineToMesh(pinHead, group, 1.1);
        }
    });

    // === EXTRA DECORATIVE ITEMS ===

    // Small photo/picture (overlapping one note)
    const photoGeometry = new THREE.BoxGeometry(0.35, 0.28, 0.015);
    const photo = new THREE.Mesh(photoGeometry, noteWhiteMaterial);
    photo.name = 'bulletin-photo';
    photo.position.set(-0.15, 0.15, boardDepth / 2 + 0.03);
    photo.rotation.z = -0.12;
    photo.castShadow = true;
    group.add(photo);
    addOutlineToMesh(photo, group);

    // Photo "image" area (darker rectangle inside)
    const photoImageMaterial = createToonMaterial(0x7f8c8d);
    const photoImageGeometry = new THREE.BoxGeometry(0.28, 0.2, 0.01);
    const photoImage = new THREE.Mesh(photoImageGeometry, photoImageMaterial);
    photoImage.name = 'bulletin-photo-image';
    photoImage.position.set(-0.15, 0.13, boardDepth / 2 + 0.04);
    photoImage.rotation.z = -0.12;
    group.add(photoImage);

    // Photo pushpin
    const photoPinGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.035);
    const photoPin = new THREE.Mesh(photoPinGeometry, pushpinBlueMaterial);
    photoPin.name = 'bulletin-photo-pin';
    photoPin.position.set(-0.08, 0.28, boardDepth / 2 + 0.05);
    photoPin.castShadow = true;
    group.add(photoPin);
    addOutlineToMesh(photoPin, group, 1.1);

    // Store module-level reference
    bulletinBoard = group;

    // Add to scene
    scene.add(group);

    return group;
}

/**
 * Creates both wall clock and bulletin board
 *
 * @param {THREE.Scene} scene - The scene to add decorations to
 * @returns {{ clock: THREE.Group, board: THREE.Group }} Both groups
 */
export function createWallDecorations(scene) {
    const clock = createWallClock(scene);
    const board = createBulletinBoard(scene);

    return { clock, board };
}
