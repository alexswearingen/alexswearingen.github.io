/**
 * Audio system
 * Procedural sounds using Web Audio API
 */

// Placeholder - will be implemented in US-061, US-062, US-063
let audioContext = null;
let isMuted = true;

export function initAudio() {
    // Audio off by default
}

export function playFootstep() {
    if (isMuted) return;
}

export function playUIClick() {
    if (isMuted) return;
}

export function toggleMute() {
    isMuted = !isMuted;
    return isMuted;
}
