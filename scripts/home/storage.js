export const Storage = {
    KEYS: { EXPERIENCES: 'self_analysis_experiences' },

    getAllExperiences() {
        const data = localStorage.getItem(this.KEYS.EXPERIENCES);
        return data ? JSON.parse(data) : [];
    },

    saveExperience(exp) {
        const all = this.getAllExperiences();
        exp.id = Date.now().toString();
        exp.createdAt = new Date().toISOString();
        all.unshift(exp);
        localStorage.setItem(this.KEYS.EXPERIENCES, JSON.stringify(all));
        return exp;
    },

    updateExperience(id, updates) {
        const all = this.getAllExperiences();
        const i = all.findIndex(e => e.id === id);
        if (i !== -1) {
            all[i] = { ...all[i], ...updates };
            localStorage.setItem(this.KEYS.EXPERIENCES, JSON.stringify(all));
            return all[i];
        }
        return null;
    },

    deleteExperience(id) {
        const all = this.getAllExperiences();
        localStorage.setItem(this.KEYS.EXPERIENCES, JSON.stringify(all.filter(e => e.id !== id)));
        return true;
    }
};
