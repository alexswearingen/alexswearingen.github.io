/**
 * UI management
 * Modals, prompts, minimap, audio toggle
 */

import { toggleMute, isMutedState, playUIClick } from './audio.js';

// Track modal state for disabling robot movement
export let isModalOpen = false;

// Cached DOM elements for performance
let modalOverlay = null;
let audioToggleBtn = null;

/**
 * Convert URLs and email addresses in text to clickable links
 * @param {string} text - Text that may contain URLs or email addresses
 * @returns {string} - HTML string with URLs converted to <a> tags
 */
function convertTextToLinks(text) {
    if (!text) return '';

    // Escape HTML first to prevent XSS
    let safeText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    // Convert URLs (http/https)
    // Match URLs that start with http:// or https://
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    safeText = safeText.replace(urlRegex, (url) => {
        // Remove trailing punctuation that's likely not part of the URL
        let cleanUrl = url.replace(/[.,;:!?)]+$/, '');
        let trailing = url.substring(cleanUrl.length);
        // Create a display-friendly version (remove protocol, truncate if too long)
        let displayUrl = cleanUrl.replace(/^https?:\/\//, '');
        if (displayUrl.length > 40) {
            displayUrl = displayUrl.substring(0, 37) + '...';
        }
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${displayUrl}</a>${trailing}`;
    });

    // Convert email addresses
    // Match common email patterns
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    safeText = safeText.replace(emailRegex, (email) => {
        return `<a href="mailto:${email}" target="_blank" rel="noopener noreferrer">${email}</a>`;
    });

    return safeText;
}
let modalTitle = null;
let modalSubtitle = null;
let modalDates = null;
let modalDescription = null;
let modalAchievements = null;
let modalCloseBtn = null;

/**
 * Initialize UI event listeners
 * Call this once after DOM is ready
 */
export function initUI() {
    // Cache modal elements
    modalOverlay = document.getElementById('modal-overlay');
    modalTitle = document.getElementById('modal-title');
    modalSubtitle = document.getElementById('modal-subtitle');
    modalDates = document.getElementById('modal-dates');
    modalDescription = document.getElementById('modal-description');
    modalAchievements = document.getElementById('modal-achievements');
    modalCloseBtn = document.getElementById('modal-close');

    // Set up close button click handler
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', hideModal);
    }

    // Set up overlay click handler (clicking outside modal closes it)
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            // Only close if clicking the overlay itself, not the modal content
            if (e.target === modalOverlay) {
                hideModal();
            }
        });
    }

    // Set up Escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
            hideModal();
        }
    });

    // Set up audio toggle button
    audioToggleBtn = document.getElementById('audio-toggle');
    if (audioToggleBtn) {
        // Update button state to match initial audio state
        updateAudioToggleUI();

        // Add click handler to toggle audio
        audioToggleBtn.addEventListener('click', () => {
            toggleMute();
            updateAudioToggleUI();
        });
    }
}

export function showInteractionPrompt() {
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) prompt.classList.remove('hidden');
}

export function hideInteractionPrompt() {
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) prompt.classList.add('hidden');
}

/**
 * Show modal with content from station data
 * @param {Object} content - Content object with title, subtitle, description, dates, achievements
 */
export function showModal(content) {
    if (!content) return;

    isModalOpen = true;

    // Populate modal content
    if (modalTitle) {
        modalTitle.textContent = content.title || '';
    }

    if (modalSubtitle) {
        modalSubtitle.textContent = content.subtitle || '';
    }

    if (modalDates) {
        modalDates.textContent = content.dates || '';
    }

    if (modalDescription) {
        modalDescription.textContent = content.description || '';
    }

    // Populate achievements list
    if (modalAchievements) {
        modalAchievements.innerHTML = '';
        if (content.achievements && Array.isArray(content.achievements)) {
            content.achievements.forEach(achievement => {
                const li = document.createElement('li');
                // Convert URLs and email addresses to clickable links
                li.innerHTML = convertTextToLinks(achievement);
                modalAchievements.appendChild(li);
            });
        }
    }

    // Show the modal overlay
    if (modalOverlay) {
        modalOverlay.classList.remove('hidden');
    }

    // Hide interaction prompt while modal is open
    hideInteractionPrompt();

    // Play UI click sound on modal open
    playUIClick();
}

/**
 * Hide the modal and reset state
 */
export function hideModal() {
    isModalOpen = false;

    if (modalOverlay) {
        modalOverlay.classList.add('hidden');
    }

    // Play UI click sound on modal close
    playUIClick();
}

export function updateMinimap(robotPosition) {
    // Placeholder
}

/**
 * Update audio toggle button visual state
 * Adds/removes 'audio-muted' class based on current audio state
 */
function updateAudioToggleUI() {
    if (!audioToggleBtn) return;

    if (isMutedState()) {
        audioToggleBtn.classList.add('audio-muted');
    } else {
        audioToggleBtn.classList.remove('audio-muted');
    }
}

/**
 * Hide audio toggle button (used when showing resume view)
 */
export function hideAudioToggle() {
    if (audioToggleBtn) {
        audioToggleBtn.classList.add('hidden');
    }
}

/**
 * Show audio toggle button (used when returning to 3D view)
 */
export function showAudioToggle() {
    if (audioToggleBtn) {
        audioToggleBtn.classList.remove('hidden');
    }
}
