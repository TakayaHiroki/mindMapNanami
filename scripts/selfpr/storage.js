// scripts/selfpr/storage.js

export const Storage = {
    KEYS: { EXPERIENCES: 'self_analysis_experiences' },

    getAllExperiences() {
        const data = localStorage.getItem(this.KEYS.EXPERIENCES);
        return data ? JSON.parse(data) : [];
    }
};