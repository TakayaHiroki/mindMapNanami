// scripts/mindmap/ui.js
import { experiences, experiencesByCategory } from './data.js';
import { renderMindMap } from './mindmapRenderer.js';
import { escapeHtml } from './utils.js';

export let currentView = 'map';
export let selectedCategory = 'all';

// scripts/mindmap/ui.js
export function setupUI() {
    document.getElementById('mapViewBtn')?.addEventListener('click', () => switchView('map'));
    document.getElementById('listViewBtn')?.addEventListener('click', () => switchView('list'));
    
    // カテゴリフィルター表示
    const filterContainer = document.getElementById('categoryFilter');
    if(filterContainer) filterContainer.style.display = 'block';

    renderCategoryFilter();
}


export function switchView(view) {
    currentView = view;
    document.getElementById('mapViewBtn').className = view==='map' ? 'btn btn-primary':'btn btn-outline';
    document.getElementById('listViewBtn').className = view==='list' ? 'btn btn-primary':'btn btn-outline';
    renderContent();
}

export function renderCategoryFilter() {
    const filterContainer = document.getElementById('filterTags');
    if (!filterContainer) return;
    filterContainer.innerHTML = '';

    const allTag = document.createElement('div');
    allTag.className = 'filter-tag active';
    allTag.textContent = `すべて (${experiences.length})`;
    allTag.addEventListener('click', () => selectCategory('all'));
    filterContainer.appendChild(allTag);

    Object.keys(experiencesByCategory).sort().forEach(cat => {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.textContent = `${cat} (${experiencesByCategory[cat].length})`;
        tag.dataset.category = cat;
        tag.addEventListener('click', () => selectCategory(cat));
        filterContainer.appendChild(tag);
    });
}

export function selectCategory(category) {
    selectedCategory = category;
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    if (category === 'all') document.querySelector('.filter-tag')?.classList.add('active');
    else document.querySelector(`.filter-tag[data-category="${category}"]`)?.classList.add('active');
    renderContent();
}

export function renderContent() {
    const area = document.getElementById('contentArea');
    if (!area) return;

    if (!experiences.length) {
        area.innerHTML = `<div class="empty-state">まだ経験が記録されていません</div>`;
        return;
    }

    if (currentView === 'map') {
        renderMindMap(area, experiencesByCategory, selectedCategory);
    } else if (currentView === 'list') {
        renderListView(area);
    }
}

function renderListView(area) {
    // リスト表示用のクラスを追加
    area.classList.add('list-view');
    area.classList.remove('map-view');
    
    // マップ表示時のイベントリスナーをクリーンアップ
    const oldSvg = area.querySelector('.mindmap-svg');
    if (oldSvg) {
        // SVGを削除することで、すべてのイベントリスナーも削除される
        oldSvg.remove();
    }
    
    const exps = selectedCategory === 'all' ? experiences : experiencesByCategory[selectedCategory] || [];

    if (!exps.length) {
        area.innerHTML = `<div class="empty-state">該当する経験はありません</div>`;
        return;
    }

    // スキル集計
    const skillCounts = {};
    exps.forEach(exp => (exp.skills || []).forEach(s => skillCounts[s] = (skillCounts[s]||0)+1));
    const topSkills = Object.entries(skillCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

    // 感情集計
    const emotionCounts = {};
    exps.forEach(exp => (exp.emotions || []).forEach(e => emotionCounts[e] = (emotionCounts[e]||0)+1));
    const topEmotions = Object.entries(emotionCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);

    let rankingHtml = '<div class="ranking-container">';
    
    // スキルランキング
    if (topSkills.length) {
        rankingHtml += `<div class="skill-ranking"><h3>スキルランキング</h3><ol>` +
            topSkills.map(([skill,count])=>`<li>${escapeHtml(skill)} <span class="count">(${count}回)</span></li>`).join('') +
            `</ol></div>`;
    }

    // 感情ランキング
    if (topEmotions.length) {
        rankingHtml += `<div class="emotion-ranking"><h3>感情ランキング</h3><ol>` +
            topEmotions.map(([emotion,count])=>`<li>${escapeHtml(emotion)} <span class="count">(${count}回)</span></li>`).join('') +
            `</ol></div>`;
    }

    rankingHtml += '</div>';

    area.innerHTML = rankingHtml + exps.map(exp=>`
        <div class="mindmap-list-card">
            <h3>${escapeHtml(exp.title)}</h3>
            <div class="card-category">カテゴリ: ${escapeHtml(exp.category)}</div>
            <div class="card-content">${escapeHtml(exp.content)}</div>
            <div class="card-tags">
                ${(exp.skills||[]).map(s=>`<span class="tag skill">${escapeHtml(s)}</span>`).join('')}
                ${(exp.emotions||[]).map(e=>`<span class="tag emotion">${escapeHtml(e)}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// 経験詳細モーダル
export function showExperienceDetail(exp) {
    // オーバーレイ
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9998,
        padding: '1rem',
    });
    document.body.appendChild(overlay);

    // モーダル本体
    const modal = document.createElement('div');
    modal.className = 'experience-modal';
    Object.assign(modal.style, {
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 9999,
        fontFamily: 'sans-serif',
        opacity: 0,
        transform: 'translateY(-20px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease'
    });
    overlay.appendChild(modal);

    // 閉じるボタン
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    Object.assign(closeBtn.style, {
        position: 'absolute', top: '12px', right: '12px',
        background: 'transparent', border: 'none', fontSize: '1.5rem',
        cursor: 'pointer', color: '#555'
    });
    closeBtn.addEventListener('click', () => overlay.remove());
    modal.appendChild(closeBtn);

    // タイトル
    const title = document.createElement('h2');
    title.textContent = exp.title;
    Object.assign(title.style, {
        fontSize: '1.8rem',
        fontWeight: '700',
        margin: '0',
        padding: '1rem',
        background: '#f0f0f0',
        borderRadius: '12px 12px 0 0',
        textAlign: 'center',
        color: '#333'
    });
    modal.appendChild(title);

    // 内容コンテナ
    const content = document.createElement('div');
    Object.assign(content.style, {
        padding: '1rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
    });

// カテゴリ（経験に近い扱い）
const category = document.createElement('div');
category.innerHTML = `<strong>カテゴリ:</strong> `;
const catSpan = document.createElement('span');
catSpan.textContent = exp.category;
Object.assign(catSpan.style, {
    display: 'inline-block',
    background: '#E8F0FE', // 知的な青
    color: '#1E3A8A',
    padding: '0.3rem 0.6rem',
    borderRadius: '8px',
    marginLeft: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '500'
});
category.appendChild(catSpan);
content.appendChild(category);

    // 本文
    const text = document.createElement('p');
    text.textContent = exp.content;
    text.style.whiteSpace = 'pre-wrap';
    content.appendChild(text);

// スキルタグ
const skills = document.createElement('div');
skills.innerHTML = `<strong>スキル:</strong> `;
(exp.skills || []).forEach(s => {
    const span = document.createElement('span');
    span.textContent = s;
    Object.assign(span.style, {
        display: 'inline-block',
        background: '#DCFCE7', // 柔らかい緑
        color: '#065F46',
        padding: '0.3rem 0.6rem',
        borderRadius: '8px',
        marginRight: '0.4rem',
        marginTop: '0.25rem',
        fontSize: '0.9rem',
        fontWeight: '500'
    });
    skills.appendChild(span);
});
content.appendChild(skills);

// 感情タグ
const emotions = document.createElement('div');
emotions.innerHTML = `<strong>感情:</strong> `;
(exp.emotions || []).forEach(e => {
    const span = document.createElement('span');
    span.textContent = e;
    Object.assign(span.style, {
        display: 'inline-block',
        background: '#FEF3C7', // 温かみのある黄橙
        color: '#92400E',
        padding: '0.3rem 0.6rem',
        borderRadius: '8px',
        marginRight: '0.4rem',
        marginTop: '0.25rem',
        fontSize: '0.9rem',
        fontWeight: '500'
    });
    emotions.appendChild(span);
});
content.appendChild(emotions);



    // 補足メッセージ
    const hint = document.createElement('p');
    hint.className = 'modal-hint';
    hint.textContent = 'クリックまたはボタンで閉じる';
    hint.style.fontSize = '0.8rem';
    hint.style.color = '#888';
    hint.style.textAlign = 'right';
    content.appendChild(hint);

    modal.appendChild(content);

    // アニメーション表示
    requestAnimationFrame(() => {
        modal.style.opacity = 1;
        modal.style.transform = 'translateY(0)';
    });

    // オーバーレイクリックで閉じる（モーダル内は無効）
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.remove();
    });
}

export function enableMindMapZoomPan() {
    const svg = document.querySelector('.mindmap-svg');
    if (!svg) return;

    let scale = 1;
    let offsetX = 0, offsetY = 0;
    let isDragging = false;
    let startX, startY;

    svg.addEventListener('wheel', e => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        scale = Math.min(Math.max(0.2, scale + delta), 3); // 0.2倍～3倍
        svg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    });

    svg.addEventListener('mousedown', e => {
        isDragging = true;
        svg.classList.add('dragging');
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
    });

    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        svg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            svg.classList.remove('dragging');
        }
    });
}