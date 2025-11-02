// scripts/mindmap/mindmap.js
import { loadExperiences } from './data.js';
import { setupUI, renderContent } from './ui.js';

export function initMindMap() {
    document.addEventListener('DOMContentLoaded', () => {
        loadExperiences();
        setupUI();
        renderContent();
    });
}
