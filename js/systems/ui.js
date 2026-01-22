/**
 * UI management
 * Modals, prompts, minimap
 */

// Placeholder - will be implemented in US-016, US-018, US-019
export let isModalOpen = false;

export function showInteractionPrompt() {
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) prompt.classList.remove('hidden');
}

export function hideInteractionPrompt() {
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) prompt.classList.add('hidden');
}

export function showModal(content) {
    isModalOpen = true;
    // Placeholder
}

export function hideModal() {
    isModalOpen = false;
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.add('hidden');
}

export function updateMinimap(robotPosition) {
    // Placeholder
}
