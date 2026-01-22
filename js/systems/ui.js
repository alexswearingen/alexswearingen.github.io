/**
 * UI management
 * Modals, prompts, minimap
 */

// Track modal state for disabling robot movement
export let isModalOpen = false;

// Cached DOM elements for performance
let modalOverlay = null;
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
                li.textContent = achievement;
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
}

/**
 * Hide the modal and reset state
 */
export function hideModal() {
    isModalOpen = false;

    if (modalOverlay) {
        modalOverlay.classList.add('hidden');
    }
}

export function updateMinimap(robotPosition) {
    // Placeholder
}
