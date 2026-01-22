/**
 * Debug System for Development
 * Provides camera views, teleportation, and inspection tools for the bot
 *
 * URL Parameters:
 *   ?dev=true - Skip loading screen, auto-start game
 *
 * Keyboard Shortcuts (in dev mode):
 *   1 - Normal follow camera
 *   2 - Top-down bird's eye view (see entire floor plan)
 *   3 - High corner view (see everything)
 *   4 - Front view (see back wall)
 *   5 - Side view (see layout from side)
 *
 * Console API (window.debug):
 *   debug.setCamera('topdown' | 'corner' | 'front' | 'side' | 'follow')
 *   debug.teleport(x, z) - Move robot to position
 *   debug.listObjects() - Get all objects with positions
 *   debug.getFloorPlan() - Get ASCII floor plan
 *   debug.getRobotPosition() - Get current robot position
 */

import { camera, renderer, scene } from '../core/engine.js';
import { robot } from '../entities/robot.js';
import { GARAGE } from '../core/constants.js';
import { getStations } from '../entities/station.js';
import { getCollisionBoxes } from './collision.js';

// Check if dev mode is enabled
export const isDevMode = new URLSearchParams(window.location.search).get('dev') === 'true';

// Current camera mode
let currentCameraMode = 'follow';
let debugCameraActive = false;

// Camera presets
const CAMERA_PRESETS = {
    follow: null, // Let normal camera follow handle this
    topdown: {
        position: { x: 0, y: 35, z: 0 },
        lookAt: { x: 0, y: 0, z: 0 },
        description: 'Top-down bird\'s eye view - see entire floor plan'
    },
    corner: {
        position: { x: -25, y: 25, z: 25 },
        lookAt: { x: 0, y: 0, z: 0 },
        description: 'High corner view - see everything at once'
    },
    front: {
        position: { x: 0, y: 8, z: 25 },
        lookAt: { x: 0, y: 4, z: -10 },
        description: 'Front view - see back wall (whiteboard, certs)'
    },
    side: {
        position: { x: -30, y: 10, z: 0 },
        lookAt: { x: 0, y: 4, z: 0 },
        description: 'Side view - see layout from left'
    },
    rightside: {
        position: { x: 30, y: 10, z: 0 },
        lookAt: { x: 0, y: 4, z: 0 },
        description: 'Right side view - see layout from right'
    }
};

/**
 * Set camera to a specific view
 * @param {string} mode - Camera mode name
 */
export function setCamera(mode) {
    if (mode === 'follow') {
        debugCameraActive = false;
        currentCameraMode = 'follow';
        console.log('[Debug] Camera: follow mode (normal gameplay)');
        return { success: true, mode: 'follow' };
    }

    const preset = CAMERA_PRESETS[mode];
    if (!preset) {
        console.error(`[Debug] Unknown camera mode: ${mode}. Available: ${Object.keys(CAMERA_PRESETS).join(', ')}`);
        return { success: false, error: `Unknown mode. Available: ${Object.keys(CAMERA_PRESETS).join(', ')}` };
    }

    debugCameraActive = true;
    currentCameraMode = mode;

    camera.position.set(preset.position.x, preset.position.y, preset.position.z);
    camera.lookAt(preset.lookAt.x, preset.lookAt.y, preset.lookAt.z);

    console.log(`[Debug] Camera: ${mode} - ${preset.description}`);
    return { success: true, mode, description: preset.description };
}

/**
 * Check if debug camera is active (prevents normal camera follow)
 */
export function isDebugCameraActive() {
    return debugCameraActive;
}

/**
 * Teleport robot to position
 * @param {number} x - X position
 * @param {number} z - Z position
 */
export function teleport(x, z) {
    if (!robot) {
        console.error('[Debug] Robot not initialized');
        return { success: false, error: 'Robot not initialized' };
    }

    // Clamp to boundaries
    const clampedX = Math.max(GARAGE.BOUNDARY_MIN, Math.min(GARAGE.BOUNDARY_MAX, x));
    const clampedZ = Math.max(GARAGE.BOUNDARY_MIN, Math.min(GARAGE.BOUNDARY_MAX, z));

    robot.position.x = clampedX;
    robot.position.z = clampedZ;

    console.log(`[Debug] Teleported robot to (${clampedX}, ${clampedZ})`);
    return { success: true, position: { x: clampedX, z: clampedZ } };
}

/**
 * Get robot's current position
 */
export function getRobotPosition() {
    if (!robot) return { error: 'Robot not initialized' };
    return { x: robot.position.x, y: robot.position.y, z: robot.position.z };
}

/**
 * List all objects with positions
 */
export function listObjects() {
    const objects = [];

    // Add stations
    const stations = getStations();
    stations.forEach(station => {
        objects.push({
            type: 'station',
            id: station.userData.id || 'unknown',
            name: station.userData.contentData?.title || 'Unknown Station',
            position: { x: station.position.x, z: station.position.z },
            interactionRadius: station.userData.interactionRadius
        });
    });

    // Add collision boxes
    const collisionBoxes = getCollisionBoxes();
    collisionBoxes.forEach(box => {
        objects.push({
            type: 'collision',
            id: box.id,
            bounds: { minX: box.minX, maxX: box.maxX, minZ: box.minZ, maxZ: box.maxZ }
        });
    });

    // Add robot position
    if (robot) {
        objects.push({
            type: 'robot',
            id: 'player',
            position: { x: robot.position.x, z: robot.position.z }
        });
    }

    return objects;
}

/**
 * Get ASCII floor plan representation
 */
export function getFloorPlan() {
    const width = 40;
    const height = 40;
    const scale = 2; // 2 units per character
    const gridWidth = Math.ceil(width / scale);
    const gridHeight = Math.ceil(height / scale);

    // Initialize grid
    const grid = [];
    for (let z = 0; z < gridHeight; z++) {
        grid[z] = [];
        for (let x = 0; x < gridWidth; x++) {
            grid[z][x] = '.';
        }
    }

    // Helper to convert world coords to grid coords
    const toGrid = (x, z) => ({
        gx: Math.floor((x + 20) / scale),
        gz: Math.floor((z + 20) / scale)
    });

    // Mark walls
    for (let i = 0; i < gridWidth; i++) {
        grid[0][i] = '#'; // Back wall
        grid[gridHeight - 1][i] = i >= 6 && i <= 13 ? ' ' : '#'; // Front wall with door
        if (i < gridHeight) {
            grid[i][0] = '#'; // Left wall
            grid[i][gridWidth - 1] = '#'; // Right wall
        }
    }

    // Mark stations
    const stations = getStations();
    const stationMarkers = {
        'brokk': 'B',
        'revojam': 'R',
        'loanscout': 'L',
        'web3': 'W',
        'whiteboard': 'S', // Skills
        'certifications': 'C',
        'music': 'M',
        'entertainment': 'E',
        'golf': 'G',
        'catan': 'T',
        'contact': '@',
        'hobby': 'H'
    };

    stations.forEach(station => {
        const id = (station.userData.id || '').toLowerCase();
        const marker = Object.entries(stationMarkers).find(([key]) => id.includes(key))?.[1] || '?';
        const { gx, gz } = toGrid(station.position.x, station.position.z);
        if (gz >= 0 && gz < gridHeight && gx >= 0 && gx < gridWidth) {
            grid[gz][gx] = marker;
        }
    });

    // Mark robot
    if (robot) {
        const { gx, gz } = toGrid(robot.position.x, robot.position.z);
        if (gz >= 0 && gz < gridHeight && gx >= 0 && gx < gridWidth) {
            grid[gz][gx] = '@';
        }
    }

    // Build output string
    let output = '\n=== FLOOR PLAN (Top-down, North=back wall) ===\n';
    output += 'Legend: B=Brokk R=Revojam L=LoanScout W=Web3 S=Skills C=Certs M=Music E=Entertainment G=Golf T=Catan @=Robot/Contact #=Wall\n\n';

    // Add coordinate labels
    output += '     -20        -10         0         10        20\n';
    output += '      |          |          |          |          |\n';

    for (let z = 0; z < gridHeight; z++) {
        const worldZ = -20 + z * scale;
        const zLabel = worldZ.toString().padStart(3);
        output += `${zLabel} ${grid[z].join('')}\n`;
    }

    output += '\n';
    return output;
}

/**
 * Get renderer performance stats
 * Shows draw calls, triangles, textures, geometries
 */
export function getRendererStats() {
    if (!renderer) return { error: 'Renderer not initialized' };

    const info = renderer.info;
    return {
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        points: info.render.points,
        lines: info.render.lines,
        memory: {
            geometries: info.memory.geometries,
            textures: info.memory.textures
        }
    };
}

/**
 * Get scene info summary
 */
export function getSceneInfo() {
    const stations = getStations();
    const collisionBoxes = getCollisionBoxes();

    return {
        robotPosition: getRobotPosition(),
        stationCount: stations.length,
        stations: stations.map(s => ({
            id: s.userData.id,
            title: s.userData.contentData?.title,
            position: { x: s.position.x, z: s.position.z }
        })),
        collisionBoxCount: collisionBoxes.length,
        garageBounds: {
            min: GARAGE.BOUNDARY_MIN,
            max: GARAGE.BOUNDARY_MAX
        },
        cameraMode: currentCameraMode,
        availableCameraModes: Object.keys(CAMERA_PRESETS)
    };
}

/**
 * Initialize debug keyboard shortcuts
 */
export function initDebugControls() {
    if (!isDevMode) return;

    console.log('[Debug] Dev mode enabled. Camera shortcuts: 1=follow, 2=topdown, 3=corner, 4=front, 5=side');

    document.addEventListener('keydown', (e) => {
        // Only handle number keys 1-5
        if (e.key === '1') setCamera('follow');
        else if (e.key === '2') setCamera('topdown');
        else if (e.key === '3') setCamera('corner');
        else if (e.key === '4') setCamera('front');
        else if (e.key === '5') setCamera('side');
    });
}

// Expose debug API to window for bot/console access
if (typeof window !== 'undefined') {
    window.debug = {
        setCamera,
        teleport,
        listObjects,
        getFloorPlan,
        getRobotPosition,
        getSceneInfo,
        getRendererStats,
        // Expose renderer and scene for advanced debugging
        get _renderer() { return renderer; },
        get _scene() { return scene; },
        isDevMode,
        help: () => {
            console.log(`
=== Debug API ===
debug.setCamera(mode)  - Set camera view
  Modes: 'follow', 'topdown', 'corner', 'front', 'side', 'rightside'

debug.teleport(x, z)   - Teleport robot to position
  Range: -18 to 18 for both x and z

debug.getRendererStats() - Get draw calls, triangles, memory info

debug.listObjects()    - List all stations and objects
debug.getFloorPlan()   - ASCII floor plan of garage
debug.getRobotPosition() - Get robot's current position
debug.getSceneInfo()   - Get full scene summary

Keyboard Shortcuts (dev mode only):
  1 = Follow camera (normal)
  2 = Top-down view
  3 = Corner view
  4 = Front view
  5 = Side view
`);
        }
    };
}
