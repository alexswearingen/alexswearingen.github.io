/**
 * Minimap system for the 3D Portfolio
 * Displays a top-down view of the garage with robot position
 */

import { GARAGE, COLORS, STATION_POSITIONS } from '../core/constants.js';
import { getStations } from '../entities/station.js';
import { robot } from '../entities/robot.js';

// Canvas and context references
let canvas = null;
let ctx = null;

// Minimap dimensions and scaling
const MINIMAP_SIZE = 150;
const PADDING = 10;  // Inner padding from canvas edge
const DRAW_SIZE = MINIMAP_SIZE - (PADDING * 2);  // Actual drawable area

// Calculate scale factor: garage coords -> canvas pixels
// Garage is 40x40 units, drawable area is 130x130 pixels
const SCALE = DRAW_SIZE / GARAGE.WIDTH;

// Station colors - match their accent colors
const STATION_COLORS = {
    'brokk-ai': '#0984e3',      // Blue
    'revojam': '#e17055',       // Orange
    'loanscout': '#00b894',     // Green
    'web3': '#6c5ce7',          // Purple
    'whiteboard': '#f5f5f0',    // Off-white (skills)
    'certifications': '#f5f5f0', // Off-white
    'music-corner': '#e17055',  // Orange (music themed)
    'entertainment': '#ff6b35', // Bright orange
    'hobbies': '#27ae60',       // Green
    'contact': '#00b8d4'        // Teal
};

// Default color for unknown stations
const DEFAULT_STATION_COLOR = '#808080';

/**
 * Convert world coordinates to minimap coordinates
 * @param {number} worldX - World X coordinate (-20 to 20)
 * @param {number} worldZ - World Z coordinate (-20 to 20)
 * @returns {{x: number, y: number}} Minimap canvas coordinates
 */
function worldToMinimap(worldX, worldZ) {
    // Center the garage at canvas center
    // World X: -20 to 20 -> Canvas X: PADDING to PADDING + DRAW_SIZE
    // World Z: -20 to 20 -> Canvas Y: PADDING to PADDING + DRAW_SIZE
    // Note: Canvas Y is inverted (0 is top), so -Z (back of garage) maps to top
    const x = PADDING + ((worldX + GARAGE.WIDTH / 2) * SCALE);
    const y = PADDING + ((worldZ + GARAGE.DEPTH / 2) * SCALE);
    return { x, y };
}

/**
 * Draw the garage outline (floor boundary)
 */
function drawGarageOutline() {
    // Garage boundaries from constants: -18 to 18 (inner walkable area)
    const minPos = worldToMinimap(GARAGE.BOUNDARY_MIN, GARAGE.BOUNDARY_MIN);
    const maxPos = worldToMinimap(GARAGE.BOUNDARY_MAX, GARAGE.BOUNDARY_MAX);

    // Calculate rectangle dimensions
    const width = maxPos.x - minPos.x;
    const height = maxPos.y - minPos.y;

    // Draw filled background for walkable area
    ctx.fillStyle = 'rgba(60, 60, 80, 0.5)';
    ctx.fillRect(minPos.x, minPos.y, width, height);

    // Draw garage outline border
    ctx.strokeStyle = 'rgba(100, 100, 140, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(minPos.x, minPos.y, width, height);

    // Draw door opening indicator on front wall (Z = 18)
    // Door is 14 units wide centered at X = 0
    const doorLeft = worldToMinimap(-7, GARAGE.BOUNDARY_MAX);
    const doorRight = worldToMinimap(7, GARAGE.BOUNDARY_MAX);

    ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(doorLeft.x, doorLeft.y);
    ctx.lineTo(doorRight.x, doorRight.y);
    ctx.stroke();
}

/**
 * Draw stations as colored dots
 */
function drawStations() {
    const stations = getStations();

    for (const station of stations) {
        if (!station.userData) continue;

        const id = station.userData.id;
        const pos = worldToMinimap(station.position.x, station.position.z);

        // Get station color from mapping or use default
        const color = STATION_COLORS[id] || DEFAULT_STATION_COLOR;

        // Draw station dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Add subtle glow/outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

/**
 * Draw the robot marker
 */
function drawRobot() {
    if (!robot) return;

    const pos = worldToMinimap(robot.position.x, robot.position.z);

    // Robot marker size
    const size = 6;

    // Draw robot as a bright white/cyan marker (stands out)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();

    // Add a bright cyan inner dot
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw direction indicator (small line showing which way robot faces)
    const rotation = robot.rotation.y;
    // Robot's Y rotation: 0 = facing -Z, so we convert to minimap space
    // In minimap: +Y is down (world +Z), -Y is up (world -Z)
    const indicatorLength = 8;
    const endX = pos.x + Math.sin(rotation) * indicatorLength;
    const endY = pos.y - Math.cos(rotation) * indicatorLength;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

/**
 * Initialize the minimap system
 */
export function initMinimap() {
    canvas = document.getElementById('minimap');
    if (!canvas) {
        console.warn('Minimap canvas not found');
        return;
    }

    ctx = canvas.getContext('2d');

    // Initial draw
    drawMinimap();
}

/**
 * Draw the complete minimap
 * Called each frame via game loop
 */
export function drawMinimap() {
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Draw layers in order (back to front)
    drawGarageOutline();
    drawStations();
    drawRobot();
}

/**
 * Update minimap (called from game loop)
 * @param {number} deltaTime - Time since last frame in seconds
 */
export function updateMinimap(deltaTime) {
    drawMinimap();
}
