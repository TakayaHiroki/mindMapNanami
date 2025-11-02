import { escapeHtml, formatDate } from './utils.js';
import { Storage } from './storage.js';
import { modal } from './modal.js';

/**
 * ホーム画面で経験をロードして表示
 */
export function loadExperiences() {
    const experiences = Storage.getAllExperiences();
    const container = document.getElementById('experiencesContainer');
    const emptyState = document.getElementById('emptyState');
    const statsSection = document.getElementById('statsSection');

    if (experiences.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        emptyState.style.display = 'block';
        statsSection.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    statsSection.style.display = 'grid';
    container.style.display = 'block';

    const allSkills = new Set(experiences.flatMap(e => e.skills || []));
    const allEmotions = new Set(experiences.flatMap(e => e.emotions || []));

    animateCountUp(document.getElementById('totalExperiences'), experiences.length);
    animateCountUp(document.getElementById('totalSkills'), allSkills.size);
    animateCountUp(document.getElementById('totalEmotions'), allEmotions.size);


    container.innerHTML = '<div class="experiences-grid"></div>';
    const grid = container.querySelector('.experiences-grid');
    experiences.forEach((exp, index) => {
        grid.appendChild(createExperienceCard(exp, index));
    });
}

/**
 * カード生成
 */
export function createExperienceCard(exp, index) {
    const card = document.createElement('div');
    card.className = 'experience-item';
    card.style.animationDelay = `${index * 0.05}s`;

    const skills = exp.skills || [];
    const emotions = exp.emotions || [];

    card.innerHTML = `
        <div class="experience-accent"></div>
        <div class="experience-header">
            <div class="experience-title-row">
                <h3 class="experience-title">${escapeHtml(exp.title || '無題の経験')}</h3>
                <div class="experience-actions">
                    <button class="icon-btn edit-btn" title="編集"><i class="fa fa-pencil-alt"></i></button>
                    <button class="icon-btn delete-btn" title="削除"><i class="fa fa-trash"></i></button>
                </div>
            </div>
            ${exp.date ? `<div class="experience-date"><i class="fa fa-calendar-alt"></i> ${formatDate(exp.date)}</div>` : ''}
            ${exp.category ? `<div class="experience-category"><i class="fa fa-folder"></i> ${escapeHtml(exp.category)}</div>` : ''}
        </div>
        <div class="experience-content">
            <p class="experience-text">${escapeHtml(exp.content)}</p>
            ${emotions.length > 0 ? `<div class="experience-section"><div class="section-header"><i class="fa fa-heart"></i> <span class="section-label">感情</span></div><div class="tags">${renderTagList(emotions, 'emotion')}</div></div>` : ''}
            ${skills.length > 0 ? `<div class="experience-section"><div class="section-header"><i class="fa fa-lightbulb"></i> <span class="section-label">スキル</span></div><div class="tags">${renderTagList(skills, 'skill')}</div></div>` : ''}
        </div>
    `;

    // 編集・削除ボタン
    card.querySelector('.edit-btn').addEventListener('click', () => modal.openModal(exp));
    card.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm('この経験を削除してもよろしいですか？')) {
            Storage.deleteExperience(exp.id);
            loadExperiences();
        }
    });

    return card;
}

/**
 * タグレンダリング（mindmap.html と同じスタイルに統一）
 * @param {Array} tags - タグ文字列配列
 * @param {'skill'|'emotion'} type - タグタイプ
 */
export function renderTagList(tags, type) {
    return tags.map(t => `<span class="tag ${type}">${escapeHtml(t)}</span>`).join('');
}


export function animateCountUp(element, target) {
    let current = 0;
    const step = Math.ceil(target / 50);
    const interval = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(interval);
        } else {
            element.textContent = current;
        }
    }, 30);
}
