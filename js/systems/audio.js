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
 */
export function playFootstep() {
    if (isMuted || !audioContext || !isInitialized) return;

    ensureAudioContextRunning();

    try {
        const now = audioContext.currentTime;

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
        gain.gain.value = 0.15; // Quiet

        // Connect: source -> filter -> gain -> master
        source.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        // Play the sound
        source.start(now);
        source.stop(now + 0.05);
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
