/**
 * Material factory for toon shading
 * Creates consistent cel-shaded materials using MeshToonMaterial and gradient ramps
 */

import * as THREE from 'three';
import { COLORS } from './constants.js';

/**
 * Creates a 3-step gradient ramp texture for toon shading
 * This creates the characteristic "stepped" shading of cel-shading
 * @returns {THREE.DataTexture} - Gradient map texture for MeshToonMaterial
 */
function createGradientRamp() {
    // 3-step gradient: shadow, mid-tone, highlight
    const colors = new Uint8Array([
        64,   // Shadow (darker)
        128,  // Mid-tone
        255   // Highlight (bright)
    ]);

    const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;

    return gradientMap;
}

// Create a shared gradient ramp for all toon materials
const sharedGradientMap = createGradientRamp();

/**
 * Creates a toon material with cel-shading effect
 * @param {number} color - Hex color value for the material
 * @returns {THREE.MeshToonMaterial} - Configured toon material
 */
export function createToonMaterial(color) {
    return new THREE.MeshToonMaterial({
        color: color,
        gradientMap: sharedGradientMap
    });
}

/**
 * Creates a toon material with emissive properties (for glowing elements)
 * @param {number} color - Hex color value
 * @param {number} emissiveIntensity - Intensity of the glow (0-1)
 * @returns {THREE.MeshToonMaterial} - Toon material with emissive
 */
export function createEmissiveToonMaterial(color, emissiveIntensity = 0.5) {
    return new THREE.MeshToonMaterial({
        color: color,
        gradientMap: sharedGradientMap,
        emissive: color,
        emissiveIntensity: emissiveIntensity
    });
}

// Named material presets using colors from constants
export const concreteMaterial = createToonMaterial(COLORS.FLOOR);
export const metalMaterial = createToonMaterial(COLORS.CEILING);
export const woodMaterial = createToonMaterial(COLORS.BEAM_WOOD);
export const wallMaterial = createToonMaterial(COLORS.WALL);

// Robot materials
export const robotPrimaryMaterial = createToonMaterial(COLORS.ROBOT_PRIMARY);
export const robotSecondaryMaterial = createToonMaterial(COLORS.ROBOT_SECONDARY);

/**
 * Creates an accent material for station color themes
 * @param {number} hue - Can be a hex color or one of the COLORS.ACCENT_* values
 * @returns {THREE.MeshToonMaterial} - Accent colored toon material
 */
export function createAccentMaterial(hue) {
    return createToonMaterial(hue);
}

/**
 * Creates an emissive accent material for glowing station elements
 * @param {number} hue - Hex color value
 * @param {number} intensity - Emissive intensity (default 0.3)
 * @returns {THREE.MeshToonMaterial} - Emissive accent material
 */
export function createEmissiveAccentMaterial(hue, intensity = 0.3) {
    return createEmissiveToonMaterial(hue, intensity);
}

// Pre-made accent materials for stations
export const brokkAccentMaterial = createAccentMaterial(COLORS.ACCENT_BLUE);
export const revojamAccentMaterial = createAccentMaterial(COLORS.ACCENT_ORANGE);
export const loanscoutAccentMaterial = createAccentMaterial(COLORS.ACCENT_GREEN);
export const web3AccentMaterial = createAccentMaterial(COLORS.ACCENT_PURPLE);

// Emissive variants for glowing elements
export const brokkEmissiveMaterial = createEmissiveAccentMaterial(COLORS.ACCENT_BLUE, 0.5);
export const revojamEmissiveMaterial = createEmissiveAccentMaterial(COLORS.ACCENT_ORANGE, 0.3);
export const loanscoutEmissiveMaterial = createEmissiveAccentMaterial(COLORS.ACCENT_GREEN, 0.3);
export const web3EmissiveMaterial = createEmissiveAccentMaterial(COLORS.ACCENT_PURPLE, 0.5);

