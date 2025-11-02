// scripts/mindmap/data.js
import { Storage } from './storage.js';

export let experiences = [];
export let experiencesByCategory = {};

export function loadExperiences() {
    experiences = Storage.getAllExperiences();
    experiencesByCategory = {};

    experiences.forEach(exp => {
        const cat = exp.category || 'その他';
        if (!experiencesByCategory[cat]) experiencesByCategory[cat] = [];
        experiencesByCategory[cat].push(exp);
    });

    return { experiences, experiencesByCategory };
}
