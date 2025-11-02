// scripts/selfpr/ui.js

export function renderInsights(experiences) {
    // 基本統計
    document.getElementById('totalExperiences').textContent = experiences.length;

    // 全スキルを集計
    const allSkills = new Set();
    experiences.forEach(exp => {
        (exp.skills || []).forEach(skill => allSkills.add(skill));
    });
    document.getElementById('totalSkills').textContent = allSkills.size;

    // トップスキルを計算
    const skillCounts = {};
    experiences.forEach(exp => {
        (exp.skills || []).forEach(skill => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
    });

    const topSkill = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])[0];
    
    if (topSkill) {
        document.getElementById('topSkill').textContent = `${topSkill[0]} (${topSkill[1]}回)`;
    } else {
        document.getElementById('topSkill').textContent = '-';
    }
}

export function renderSkillBars(experiences) {
    const container = document.getElementById('skillBars');
    container.innerHTML = '';

    // スキル出現回数を集計
    const skillCounts = {};
    experiences.forEach(exp => {
        (exp.skills || []).forEach(skill => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
    });

    // 上位5件を取得
    const topSkills = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (topSkills.length === 0) {
        container.innerHTML = '<p style="opacity: 0.7;">スキルが記録されていません</p>';
        return;
    }

    const maxCount = topSkills[0][1];

    topSkills.forEach(([skill, count]) => {
        const percentage = (count / maxCount) * 100;
        
        const bar = document.createElement('div');
        bar.className = 'skill-bar';
        
        bar.innerHTML = `
            <div class="skill-bar-label">${escapeHtml(skill)}</div>
            <div class="skill-bar-track">
                <div class="skill-bar-fill" style="width: 0%">
                    <span class="skill-bar-count">${count}</span>
                </div>
            </div>
        `;
        
        container.appendChild(bar);

        // アニメーション効果
        setTimeout(() => {
            const fill = bar.querySelector('.skill-bar-fill');
            fill.style.width = `${percentage}%`;
        }, 100);
    });
}

export function renderUsedExperiences(experiences) {
    const container = document.getElementById('usedExperiencesList');
    container.innerHTML = '';

    if (experiences.length === 0) {
        container.innerHTML = '<p style="opacity: 0.7;">使用された経験はありません</p>';
        return;
    }

    experiences.forEach((exp, index) => {
        const badge = document.createElement('div');
        badge.className = 'experience-badge';
        badge.style.animationDelay = `${index * 0.1}s`;
        
        const icons = ['fa-star', 'fa-certificate', 'fa-award', 'fa-medal', 'fa-gem'];
        const icon = icons[index % icons.length];
        
        badge.innerHTML = `
            <div class="experience-badge-icon">
                <i class="fa ${icon}"></i>
            </div>
            <div class="experience-badge-content">
                <div class="experience-badge-title">${escapeHtml(exp.title || '無題の経験')}</div>
                <div class="experience-badge-category">${escapeHtml(exp.category || 'その他')} | ${formatDate(exp.date)}</div>
            </div>
        `;
        
        container.appendChild(badge);
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}