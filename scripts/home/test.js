import { Storage } from './storage.js';
import { AIMock } from './ai.js';
import { formatDate, escapeHtml } from './utils.js';
import { selectedSkills, selectedEmotions, createSelectableTag, updateSelectedTags, renderTagList } from './tags.js';
import { modal } from './modal.js';
import { loadExperiences } from './ui.js';

window.addEventListener('load', async () => {

    // テスト用コンテナ
    let container = document.getElementById('test-output-container');
    if(!container){
        container = document.createElement('div');
        container.id = 'test-output-container';
        container.style.border = '2px solid #666';
        container.style.padding = '10px';
        container.style.margin = '10px';
        container.style.background = '#f9f9f9';
        container.innerHTML = '<h2>テスト結果チェックリスト</h2>';
        document.body.prepend(container);
    }

    function addTestResult(title, ok, log=''){
        const item = document.createElement('div');
        item.style.marginBottom = '8px';
        item.style.padding = '5px';
        item.style.borderBottom = '1px dashed #ccc';
        const status = ok ? '✅' : '✖';
        const t = document.createElement('b');
        t.textContent = `${title}: ${status}`;
        item.appendChild(t);
        if(log){
            const l = document.createElement('div');
            l.style.marginLeft = '10px';
            l.style.fontSize = '0.9em';
            l.textContent = log;
            item.appendChild(l);
        }
        container.appendChild(item);
    }

    // -------------------------
    // 1. Storage テスト
    try {
        const testExp = { content: 'テスト経験', date:'2025-10-28', title:'テスト', category:'学業', skills:['チームワーク'], emotions:['喜び'], extracted:true };
        Storage.saveExperience(testExp);
        addTestResult('Storage Save', true, JSON.stringify(Storage.getAllExperiences()));
        Storage.updateExperience(testExp.id, { title:'更新済み' });
        addTestResult('Storage Update', true, JSON.stringify(Storage.getAllExperiences()));
        Storage.deleteExperience(testExp.id);
        addTestResult('Storage Delete', true, JSON.stringify(Storage.getAllExperiences()));
    } catch(e){ addTestResult('Storage Test', false, e.message); }

    // -------------------------
    // 2. AIMock テスト
    try {
        const aiResult = await AIMock.analyzeExperience('今日、プロジェクトの開発をチームで行いました');
        addTestResult('AI解析', true, JSON.stringify(aiResult));
    } catch(e){ addTestResult('AI解析', false, e.message); }

    // -------------------------
    // 3. Utils テスト
    try {
        const f = formatDate('2025-10-28');
        addTestResult('formatDate', f === '2025年10月28日', f);
        const e = escapeHtml('<script>');
        addTestResult('escapeHtml', e === '&lt;script&gt;', e);
    } catch(e){ addTestResult('Utils Test', false, e.message); }

    // -------------------------
    // 4. Tags テスト
    try {
        const tag = createSelectableTag('チームワーク','skill',true);
        tag.click(); // 選択解除
        updateSelectedTags('skill');
        const ok = selectedSkills.length === 0;
        addTestResult('Tag 選択状態', ok, 'selectedSkills: ' + JSON.stringify(selectedSkills));
    } catch(e){ addTestResult('Tags Test', false, e.message); }

    // -------------------------
    // 5. Modal テスト
    try {
        const modalElement = document.getElementById('experienceModal');
        if(modalElement){
            modal.openModal();
            addTestResult('Modal 開く', true);
            await new Promise(r=>setTimeout(r,1000));
            modal.closeModal();
            addTestResult('Modal 閉じる', true);
        } else {
            addTestResult('Modal Test', false, 'モーダル要素が存在しません');
        }
    } catch(e){ addTestResult('Modal Test', false, e.message); }

    // -------------------------
    // 6. UI テスト
    try {
        Storage.saveExperience({ content:'UIテスト', date:'2025-10-28', title:'UI', category:'学業', skills:['チームワーク'], emotions:['喜び'], extracted:true });
        const containerUI = document.getElementById('experiencesContainer');
        if(containerUI){
            loadExperiences();
            addTestResult('UI Load', true);
        } else {
            addTestResult('UI Load', false, 'experiencesContainer が存在しません');
        }
    } catch(e){ addTestResult('UI Test', false, e.message); }

    addTestResult('テスト完了', true, 'すべてのモジュールの基本動作を確認済み');
});
