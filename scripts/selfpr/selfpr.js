// scripts/selfpr/selfpr.js
import { Storage } from './storage.js';
import { PRGenerator } from './generator.js';
import { renderInsights, renderSkillBars, renderUsedExperiences } from './ui.js';

let experiences = [];
let selectedSkill = '';
let selectedLength = 'medium';
let selectedTone = 'formal';
let generatedPRData = null;

export function initSelfPR() {
    experiences = Storage.getAllExperiences();

    // 経験が0件の場合
    if (experiences.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('settingsSection').style.display = 'none';
        return;
    }

    // 初期化
    populateSkillSelect();
    renderInsights(experiences);
    renderSkillBars(experiences);
    setupEventListeners();
}

function populateSkillSelect() {
    const select = document.getElementById('targetSkill');
    const skillCounts = {};

    // スキルの出現回数をカウント
    experiences.forEach(exp => {
        (exp.skills || []).forEach(skill => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
    });

    // 出現回数順にソート
    const sortedSkills = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([skill]) => skill);

    // オプションを追加
    sortedSkills.forEach(skill => {
        const option = document.createElement('option');
        option.value = skill;
        option.textContent = `${skill} (${skillCounts[skill]}回)`;
        select.appendChild(option);
    });

    // デフォルトで最も多いスキルを選択
    if (sortedSkills.length > 0) {
        select.value = sortedSkills[0];
        selectedSkill = sortedSkills[0];
    }
}

function setupEventListeners() {
    document.getElementById('targetSkill').addEventListener('change', (e) => {
        selectedSkill = e.target.value;
    });

    document.getElementById('prLength').addEventListener('change', (e) => {
        selectedLength = e.target.value;
    });

    document.getElementById('prTone').addEventListener('change', (e) => {
        selectedTone = e.target.value;
    });

    document.getElementById('generateBtn').addEventListener('click', generatePR);
    document.getElementById('regenerateBtn').addEventListener('click', generatePR);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('downloadBtn').addEventListener('click', downloadText);
}

async function generatePR() {
    if (!selectedSkill) {
        alert('スキルを選択してください');
        return;
    }

    // ローディング表示
    document.getElementById('loadingOverlay').style.display = 'flex';

    // 疑似的な待機時間
    await new Promise(resolve => setTimeout(resolve, 1800));

    // 自己PR生成
    const generator = new PRGenerator(experiences);
    generatedPRData = generator.generate(selectedSkill, selectedLength, selectedTone);

    // 結果表示
    document.getElementById('generatedPR').textContent = generatedPRData.text;
    document.getElementById('charCount').textContent = generatedPRData.charCount;

    // 使用した経験を表示
    renderUsedExperiences(generatedPRData.usedExperiences);

    // 結果セクションを表示
    document.getElementById('loadingOverlay').style.display = 'none';
    document.getElementById('resultSection').style.display = 'block';
    
    // スムーズスクロール
    document.getElementById('resultSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function copyToClipboard() {
    const text = generatedPRData.text;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa fa-check"></i> コピーしました！';
        btn.style.background = '#10B981';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
        }, 2000);
    });
}

function downloadText() {
    const text = generatedPRData.text;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `自己PR_${selectedSkill}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}