/**
 * Audio system
 * Procedural sounds using Web Audio API
 * Audio is OFF by default to respect user preference
 */

// Audio state
let audioContext = null;
let isMuted = true; // Audio OFF by default
let isInitialized = false;

// Master gain node for volume control
let masterGain = null;

// Ambient hum state
let ambientOscillator = null;
let ambientGain = null;

// Footstep throttling
let lastFootstepTime = 0;
const FOOTSTEP_INTERVAL = 250; // ms between footsteps

/**
 * Initialize the audio system
 * Creates AudioContext on first user interaction (required by browsers)
 * Audio remains muted until user explicitly enables it
 */
export function initAudio() {
    if (isInitialized) return;

    // Create AudioContext on user gesture (click/keypress)
    // This is required by modern browsers for audio autoplay policy
    const initOnInteraction = () => {
        if (audioContext) return;

        try {
            // Create the audio context
            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain node for volume control
            masterGain = audioContext.createGain();
            masterGain.connect(audioContext.destination);

            // Start muted
            masterGain.gain.value = 0;

            isInitialized = true;

            // Start ambient hum (will be silent until unmuted)
            startAmbientHum();

            // Remove the initialization listeners after first interaction
            document.removeEventListener('click', initOnInteraction);
            document.removeEventListener('keydown', initOnInteraction);
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    };

    // Add listeners for user interaction to initialize AudioContext
    document.addEventListener('click', initOnInteraction);
    document.addEventListener('keydown', initOnInteraction);
}

/**
 * Resume audio context if suspended (browsers suspend after tab switch)
 */
function ensureAudioContextRunning() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

/**
 * Play a footstep sound (procedurally generated)
 * Short noise burst for robot movement
 * Throttled to prevent overlapping sounds
 */
export function playFootstep() {
    if (isMuted || !audioContext || !isInitialized) return;

    // Throttle footsteps to prevent overlapping
    const now = performance.now();
    if (now - lastFootstepTime < FOOTSTEP_INTERVAL) return;
    lastFootstepTime = now;

    ensureAudioContextRunning();

    try {
        const audioNow = audioContext.currentTime;

        // Create a short noise burst for footstep
        const bufferSize = audioContext.sampleRate * 0.05; // 50ms
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Fill with filtered noise
        for (let i = 0; i < bufferSize; i++) {
            // Random noise with decay envelope
            const envelope = 1 - (i / bufferSize);
            data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
        }

        // Create buffer source
        const source = audioContext.createBufferSource();
        source.buffer = buffer;

        // Create lowpass filter for softer sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        // Create gain for this sound
        const gain = audioContext.createGain();
        gain.gain.value = 0.08; // Very quiet - subtle background level

        // Connect: source -> filter -> gain -> master
        source.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        // Play the sound
        source.start(audioNow);
        source.stop(audioNow + 0.05);
    } catch (e) {
        // Silently fail - audio is not critical
    }
}

/**
 * Play a UI click sound (procedurally generated)
 * Short blip for modal open/close
 */
export function playUIClick() {
    if (isMuted || !audioContext || !isInitialized) return;

    ensureAudioContextRunning();

    try {
        const now = audioContext.currentTime;

        // Create oscillator for click tone
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = 880; // A5 note

        // Create gain envelope
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        // Connect: oscillator -> gain -> master
        oscillator.connect(gain);
        gain.connect(masterGain);

        // Play the sound
        oscillator.start(now);
        oscillator.stop(now + 0.08);
    } catch (e) {
        // Silently fail - audio is not critical
    }
}

/**
 * Toggle mute state
 * @returns {boolean} - New muted state (true = muted, false = playing)
 */
export function toggleMute() {
    isMuted = !isMuted;

    // Update master gain
    if (masterGain) {
        masterGain.gain.value = isMuted ? 0 : 1;
    }

    // Resume context if enabling audio
    if (!isMuted) {
        ensureAudioContextRunning();
    }

    return isMuted;
}

/**
 * Get current muted state
 * @returns {boolean} - True if muted
 */
export function isMutedState() {
    return isMuted;
}

/**
 * Start ambient hum - low oscillator drone (very quiet)
 * Creates a continuous background atmosphere
 */
function startAmbientHum() {
    if (!audioContext || ambientOscillator) return;

    try {
        // Create low frequency oscillator for ambient hum
        ambientOscillator = audioContext.createOscillator();
        ambientOscillator.type = 'sine';
        ambientOscillator.frequency.value = 60; // Low hum (60Hz - electrical hum frequency)

        // Create second oscillator for slight detuning (richer sound)
        const ambientOsc2 = audioContext.createOscillator();
        ambientOsc2.type = 'sine';
        ambientOsc2.frequency.value = 62; // Slightly detuned for warmth

        // Create gain node for ambient volume
        ambientGain = audioContext.createGain();
        ambientGain.gain.value = 0.015; // Very quiet - barely perceptible

        // Create lowpass filter to soften the sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        // Connect both oscillators through filter and gain to master
        ambientOscillator.connect(filter);
        ambientOsc2.connect(filter);
        filter.connect(ambientGain);
        ambientGain.connect(masterGain);

        // Start the oscillators
        ambientOscillator.start();
        ambientOsc2.start();
    } catch (e) {
        // Silently fail - audio is not critical
    }
}
