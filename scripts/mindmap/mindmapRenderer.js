// scripts/mindmap/mindmapRenderer.js
import { MAP_CONFIG } from './config.js';
import { animateLine, fadeInElement } from './utils.js';
import { showExperienceDetail } from './ui.js';

let isRendering = false; // 描画中フラグ
let cancelRender = false; // 割り込みフラグ

function clearContainer(container) {
    container.innerHTML = '';
    container.className = '';
}

// --- マインドマップ描画 ---
export async function renderMindMap(container, experiencesByCategory, selectedCategory) {
    // 描画中なら既存描画を中断
    if (isRendering) cancelRender = true;
    isRendering = true;
    cancelRender = false;

    clearContainer(container);
    container.classList.add('mindmap-container');
    const svgNS = 'http://www.w3.org/2000/svg';

    // --- 既存オーバーレイ削除 ---
    let overlay = container.querySelector('.mindmap-overlay');
    if (overlay) overlay.remove();

    // --- オーバーレイ作成 ---
    overlay = document.createElement('div');
    overlay.classList.add('mindmap-overlay');
    Object.assign(overlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        zIndex: '1000'
    });
    overlay.textContent = '描画中…';
    container.style.position = 'relative';
    container.appendChild(overlay);

    // --- マップ表示用クラス ---
    container.classList.add('map-view');
    container.classList.remove('list-view');

    // --- SVG 初期化 ---
    let svg = container.querySelector('.mindmap-svg');
    if (svg) svg.remove();
    svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('mindmap-svg');
    container.appendChild(svg);

    const { startX: sx, nodeHeight, nodeMinWidth, nodeSpacingY, categorySpacing, itemSpacingX } = MAP_CONFIG;

    // --- 中心ボタン ---
    let centerBtn = container.querySelector('#centerMapBtn');
    if (!centerBtn) {
        centerBtn = document.createElement('button');
        centerBtn.id = 'centerMapBtn';
        centerBtn.className = 'center-map-btn';
        centerBtn.innerHTML = '<i class="fa fa-crosshairs"></i>';
        container.appendChild(centerBtn);
    }
    centerBtn.addEventListener('click', () => centerMap(true));

    // --- 描画対象カテゴリ ---
    const categories = selectedCategory === 'all'
        ? Object.keys(experiencesByCategory).sort()
        : [selectedCategory];

    let currentY = 100;
    let maxX = sx;
    let maxY = currentY;

    // --- 最大座標計算 ---
    for (const cat of categories) {
        if (cancelRender) break;
        const exps = experiencesByCategory[cat];
        if (!exps?.length) continue;

        for (let idx = 0; idx < exps.length; idx++) {
            if (cancelRender) break;
            const exp = exps[idx];
            const expWidth = Math.max(nodeMinWidth, exp.title.length * 16 + 40);
            const horizontalGap = Math.max(100, expWidth);
            const nodeXExp = selectedCategory === 'all' ? sx + nodeMinWidth + horizontalGap : sx;
            maxX = Math.max(
                maxX,
                nodeXExp + expWidth + itemSpacingX * ((exp.skills?.length || 0) + (exp.emotions?.length || 0)) + 150
            );
        }

        maxY = Math.max(maxY, currentY + exps.length * nodeSpacingY);
        currentY += exps.length * nodeSpacingY + categorySpacing;
    }

    svg.setAttribute('width', maxX + 200);
    svg.setAttribute('height', maxY + 200);
    svg.setAttribute('viewBox', `0 0 ${maxX + 200} ${maxY + 200}`);
    svg.style.overflow = 'visible';

    // --- ノード描画 ---
    currentY = 100;
    let expNodeCount = 0; // 経験ノード描画カウント
    const maxAnimatedNodes = 4; // アニメーションする経験ノード数上限

    for (const cat of categories) {
        if (cancelRender) break;
        const exps = experiencesByCategory[cat];
        if (!exps?.length) continue;

        const nodeX = sx + 50;
        const nodeWidth = nodeMinWidth;
        const totalHeight = (exps.length - 1) * nodeSpacingY;
        const catY = currentY + totalHeight / 2;

        // カテゴリノード
        if (selectedCategory === 'all') {
            const rectCat = document.createElementNS(svgNS, 'rect');
            rectCat.setAttribute('x', nodeX - nodeWidth / 2);
            rectCat.setAttribute('y', catY - nodeHeight / 2);
            rectCat.setAttribute('width', nodeWidth);
            rectCat.setAttribute('height', nodeHeight);
            rectCat.setAttribute('rx', 12);
            rectCat.setAttribute('fill', '#A7F3D0');
            rectCat.setAttribute('opacity', 0);
            rectCat.dataset.category = cat;
            rectCat.dataset.type = 'category';
            svg.appendChild(rectCat);

            const textCat = document.createElementNS(svgNS, 'text');
            textCat.setAttribute('x', nodeX);
            textCat.setAttribute('y', catY);
            textCat.setAttribute('text-anchor', 'middle');
            textCat.setAttribute('dominant-baseline', 'middle');
            textCat.setAttribute('fill', '#065F46');
            textCat.setAttribute('font-size', '18');
            textCat.setAttribute('font-weight', 'bold');
            textCat.setAttribute('opacity', 0);
            textCat.textContent = cat;
            textCat.dataset.category = cat;
            textCat.dataset.type = 'category';
            svg.appendChild(textCat);

            if (!cancelRender && expNodeCount < maxAnimatedNodes) {
                await Promise.all([fadeInElement(rectCat, 100), fadeInElement(textCat, 100)]);
            } else {
                rectCat.style.opacity = 1;
                textCat.style.opacity = 1;
            }
        }

        // 経験ノード描画
        for (let idx = 0; idx < exps.length; idx++) {
            if (cancelRender) break;
            const exp = exps[idx];
            const nodeY = currentY + idx * nodeSpacingY;
            const expWidth = Math.max(nodeMinWidth, exp.title.length * 16 + 40);
            const horizontalGap = Math.max(100, expWidth);
            const nodeXExp = selectedCategory === 'all' ? nodeX + nodeWidth + horizontalGap : sx + 50;

            const rectExp = document.createElementNS(svgNS, 'rect');
            rectExp.setAttribute('x', nodeXExp - expWidth / 2);
            rectExp.setAttribute('y', nodeY - nodeHeight / 2);
            rectExp.setAttribute('width', expWidth);
            rectExp.setAttribute('height', nodeHeight);
            rectExp.setAttribute('rx', 15);
            rectExp.setAttribute('fill', '#DBEAFE');
            rectExp.setAttribute('opacity', 0);
            rectExp.dataset.category = cat;
            rectExp.dataset.type = 'experience';
            svg.appendChild(rectExp);

            const textExp = document.createElementNS(svgNS, 'text');
            textExp.setAttribute('x', nodeXExp);
            textExp.setAttribute('y', nodeY);
            textExp.setAttribute('text-anchor', 'middle');
            textExp.setAttribute('dominant-baseline', 'middle');
            textExp.setAttribute('fill', '#1E3A8A');
            textExp.setAttribute('font-size', '18');
            textExp.setAttribute('font-weight', 'bold');
            textExp.setAttribute('opacity', 0);
            textExp.textContent = exp.title;
            textExp.dataset.category = cat;
            textExp.dataset.type = 'experience';
            svg.appendChild(textExp);

            rectExp.style.cursor = textExp.style.cursor = 'pointer';
            rectExp.addEventListener('click', () => showExperienceDetail(exp));
            textExp.addEventListener('click', () => showExperienceDetail(exp));

            if (!cancelRender && expNodeCount < maxAnimatedNodes) {
                await Promise.all([fadeInElement(rectExp, 100), fadeInElement(textExp, 100)]);
            } else {
                rectExp.style.opacity = 1;
                textExp.style.opacity = 1;
            }

            // カテゴリと経験ノードを結ぶ線
            if (selectedCategory === 'all') {
                const line = document.createElementNS(svgNS, 'line');
                const x1 = nodeX + nodeWidth / 2;
                const y1 = catY;
                const x2 = nodeXExp - expWidth / 2;
                const y2 = nodeY;
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x1);
                line.setAttribute('y2', y1);
                line.setAttribute('stroke', '#065F46');
                line.setAttribute('stroke-width', '3');
                svg.insertBefore(line, svg.firstChild);

                if (!cancelRender && expNodeCount < maxAnimatedNodes) {
                    await animateLine(line, x1, y1, x2, y2, 120);
                } else {
                    line.setAttribute('x2', x2);
                    line.setAttribute('y2', y2);
                }
            }

            // 子ノード描画
            const skillColors = { line: '#065F46', bg: '#DCFCE7', text: '#065F46' };
            const emoColors = { line: '#92400E', bg: '#FEF3C7', text: '#92400E' };
            const promises = [];
            if (exp.skills?.length) promises.push(drawChildNodes(svg, exp.skills, skillColors, nodeXExp + expWidth / 2, nodeY, nodeXExp, nodeY, true, cat, expNodeCount, maxAnimatedNodes));
            if (exp.emotions?.length) promises.push(drawChildNodes(svg, exp.emotions, emoColors, nodeXExp + expWidth / 2, nodeY, nodeXExp, nodeY, false, cat, expNodeCount, maxAnimatedNodes));

            await Promise.all(promises);

            expNodeCount++;
        }

        currentY += exps.length * nodeSpacingY + categorySpacing;
    }

    // --- 手動ズーム＆パン用 g 要素 ---
    const g = document.createElementNS(svgNS, 'g');
    while (svg.firstChild) g.appendChild(svg.firstChild);
    svg.appendChild(g);

    let scale = 1;
    let translateX = 0, translateY = 0;
    const minZoom = 0.6;
    const maxZoom = 4;

    function applyTransform(smooth = true) {
        g.style.transition = smooth ? 'transform 0.15s ease-out' : 'none';
        g.setAttribute('transform', `translate(${translateX}, ${translateY}) scale(${scale})`);
    }

    function centerMap(smooth = true) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const bbox = g.getBBox();
        const gCenterX = bbox.x + bbox.width / 2;
        const gCenterY = bbox.y + bbox.height / 2;
        const containerCenterX = containerWidth / 2;
        const containerCenterY = containerHeight / 2;
        const centerBtn = document.getElementById('centerMapBtn');
        const btnOffset = centerBtn ? centerBtn.offsetHeight : 0;
        translateX = containerCenterX - gCenterX * scale;
        translateY = containerCenterY - gCenterY * scale - btnOffset;
        if (smooth) g.style.transition = 'transform 0.6s ease-in-out';
        applyTransform();
        if (smooth) setTimeout(() => (g.style.transition = 'none'), 600);
    }

    setTimeout(() => centerMap(true), 100);

    // --- マウスホイールズーム ---
    container.addEventListener('wheel', e => {
        if (!container.classList.contains('map-view')) return;
        e.preventDefault();
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const svgX = (mouseX - translateX) / scale;
        const svgY = (mouseY - translateY) / scale;
        const svgWidth = parseFloat(svg.getAttribute('width'));
        const svgHeight = parseFloat(svg.getAttribute('height'));
        const svgAspect = svgWidth / svgHeight;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const containerAspect = containerWidth / containerHeight;
        let fitScale = svgAspect >= containerAspect ? containerWidth / svgWidth : containerHeight / svgHeight;
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        let newScale = scale * zoomFactor;
        newScale = Math.max(fitScale, Math.min(maxZoom, newScale));
        translateX = mouseX - svgX * newScale;
        translateY = mouseY - svgY * newScale;
        scale = newScale;
        applyTransform(true);
    }, { passive: false });

    // --- パン処理 ---
    let isDragging = false, startX = 0, startY = 0, lastTranslateX = 0, lastTranslateY = 0;
    container.addEventListener('mousedown', e => {
        if (e.target.tagName === 'rect' || e.target.tagName === 'text') {
            if (e.target.style.cursor === 'pointer') return;
        }
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        lastTranslateX = translateX;
        lastTranslateY = translateY;
        container.style.cursor = 'grabbing';
    });
    container.addEventListener('mousemove', e => {
        if (!isDragging) return;
        translateX = lastTranslateX + e.clientX - startX;
        translateY = lastTranslateY + e.clientY - startY;
        applyTransform(false);
    });
    container.addEventListener('mouseup', () => { isDragging = false; container.style.cursor = 'grab'; });
    container.addEventListener('mouseleave', () => { isDragging = false; container.style.cursor = 'grab'; });
    container.style.cursor = 'grab';

    // --- 描画完了後オーバーレイ削除 ---
    if (!cancelRender) overlay.remove();
    isRendering = false;
}

// --- 子ノード描画 ---
async function drawChildNodes(svg, items, colorSet, baseX, baseY, nodeX, nodeY, isSkill, category, expNodeCount, maxAnimatedNodes) {
    const { nodeMinWidth, nodeHeight, itemSpacingX } = MAP_CONFIG;
    let prevX = baseX;
    const prevY = isSkill ? baseY - 50 : baseY + 50;
    const svgNS = 'http://www.w3.org/2000/svg';

    for (let i = 0; i < items.length; i++) {
        if (cancelRender) break;
        const txt = items[i];
        const textWidth = txt.length * 12 + 20;
        const cx = prevX + Math.max(itemSpacingX, textWidth);
        const cy = prevY;

        const line = document.createElementNS(svgNS, 'line');
        const x1 = i === 0 ? nodeX : prevX + nodeMinWidth / 2;
        const y1 = i === 0 ? baseY : prevY;
        const x2 = cx - nodeMinWidth / 2;
        const y2 = cy;
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x1);
        line.setAttribute('y2', y1);
        line.setAttribute('stroke', colorSet.line);
        line.setAttribute('stroke-width', '3');
        line.dataset.category = category;
        line.dataset.type = isSkill ? 'skillLine' : 'emotionLine';
        svg.insertBefore(line, svg.firstChild);

        if (expNodeCount < maxAnimatedNodes) {
            await animateLine(line, x1, y1, x2, y2);
        } else {
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
        }

        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', cx - nodeMinWidth / 2);
        rect.setAttribute('y', cy - nodeHeight / 2);
        rect.setAttribute('width', nodeMinWidth);
        rect.setAttribute('height', nodeHeight);
        rect.setAttribute('rx', 10);
        rect.setAttribute('fill', colorSet.bg);
        rect.setAttribute('opacity', 0);
        rect.dataset.category = category;
        rect.dataset.type = isSkill ? 'skill' : 'emotion';
        svg.appendChild(rect);

        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', cx);
        text.setAttribute('y', cy);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', colorSet.text);
        text.setAttribute('font-size', '14');
        text.setAttribute('opacity', 0);
        text.textContent = txt;
        text.dataset.category = category;
        text.dataset.type = isSkill ? 'skill' : 'emotion';
        svg.appendChild(text);

        if (expNodeCount < maxAnimatedNodes) {
            await Promise.all([fadeInElement(rect), fadeInElement(text)]);
        } else {
            rect.style.opacity = 1;
            text.style.opacity = 1;
        }

        prevX += Math.max(itemSpacingX, textWidth);
    }
}

// --- カテゴリ変更時は再描画 ---
export function filterCategory(category, container, experiencesByCategory) {
    cancelRender = true; // 現在描画中なら中断
    renderMindMap(container, experiencesByCategory, category);
}

// --- リスト表示切り替え用割り込み関数 ---
export function switchToListView(container) {
    cancelRender = true;
    container.classList.remove('map-view');
    container.classList.add('list-view');
}
