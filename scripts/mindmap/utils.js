// scripts/mindmap/utils.js

export function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]));
}

export function fadeInElement(el, duration = 0) {
    el.style.transition = `opacity ${duration}ms ease-out`;
    el.setAttribute('opacity', 1);
    return new Promise(r => setTimeout(r, duration));
}

export function animateLine(line, x1, y1, x2, y2, duration = 85) {
    return new Promise(resolve => {
        const startTime = performance.now();
        function animate(now) {
            const t = Math.min((now - startTime) / duration, 1);
            const currX = x1 + (x2 - x1) * t;
            const currY = y1 + (y2 - y1) * t;
            line.setAttribute('x2', currX);
            line.setAttribute('y2', currY);
            if (t < 1) requestAnimationFrame(animate);
            else resolve();
        }
        requestAnimationFrame(animate);
    });
}
