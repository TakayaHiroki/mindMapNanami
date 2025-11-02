import { AIMock } from './ai.js';
import { selectedSkills, selectedEmotions, renderTagsForModal } from './tags.js';
import { Storage } from './storage.js';
import { loadExperiences } from './ui.js';

export let currentEditingId = null;
export let extractedData = null;

// AI分析済みフラグ（二重登録防止用）
let aiAnalysisDone = false;

// カテゴリーキーワード辞書（自動推奨用）
const CATEGORY_KEYWORDS = {
    "学業": ["授業", "研究", "プレゼン", "課題", "ゼミ"],
    "アルバイト": ["接客", "バイト", "販売", "配達", "カフェ"],
    "部活動": ["部活", "練習", "試合", "大会", "活動"],
    "趣味": ["ゲーム", "読書", "映画", "音楽", "旅行"],
    "ボランティア": ["ボランティア", "奉仕", "支援", "イベント"]
};

export const modal = {
    openModal(edit = null) {
        const modalEl = document.getElementById('experienceModal');
        const form = document.getElementById('experienceForm');
        if (!modalEl || !form) return;

        form.reset();
        document.getElementById('aiAnalysisSection').style.display = 'none';
        document.getElementById('extractedDataSection').style.display = 'none';
        currentEditingId = null;
        extractedData = null;
        aiAnalysisDone = false;

        if (edit) {
            currentEditingId = edit.id;
            document.getElementById('modalTitle').textContent = '経験を編集';
            document.getElementById('experienceDate').value = edit.date ? new Date(edit.date).toISOString().split('T')[0] : '';
            document.getElementById('experienceContent').value = edit.content || '';
            document.getElementById('submitBtnText').textContent = '更新';

            if (edit.extracted) {
                extractedData = edit;

                selectedSkills.length = 0;
                selectedEmotions.length = 0;
                selectedSkills.push(...(edit.skills || []));
                selectedEmotions.push(...(edit.emotions || []));
                renderTagsForModal({
                    skills: edit.skills || [],
                    emotions: edit.emotions || [],
                    allPredefinedSkills: AIMock.PREDEFINED_SKILLS,
                    allPredefinedEmotions: AIMock.PREDEFINED_EMOTIONS
                });
                document.getElementById('extractedTitle').value = edit.title || '';
                document.getElementById('newCategoryInput').value = '';
                setupCategoryTags(edit.category); // 編集時にカテゴリーセット
                document.getElementById('extractedDataSection').style.display = 'block';
            }
        } else {
            document.getElementById('modalTitle').textContent = '新しい経験を記録';
            document.getElementById('submitBtnText').textContent = '記録';
        }

        modalEl.classList.add('active');
    },

    closeModal() {
        document.getElementById('experienceModal').classList.remove('active');
    },

    async handleSubmit(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');

        // 二重送信防止
        if (submitBtn.disabled) return;
        submitBtn.disabled = true;

        const content = document.getElementById('experienceContent').value.trim();
        const date = document.getElementById('experienceDate').value;
        if (!content) {
            alert('経験の内容を入力してください');
            submitBtn.disabled = false;
            return;
        }

        try {
            // 新規かつまだAI分析していない場合
            if (!currentEditingId && !extractedData && !aiAnalysisDone) {
                document.getElementById('aiAnalysisSection').style.display = 'block';
                extractedData = await AIMock.analyzeExperience(content);
                document.getElementById('aiAnalysisSection').style.display = 'none';

                renderTagsForModal(extractedData);
                document.getElementById('extractedTitle').value = extractedData.title;
                setupCategoryTags(extractedData.category); // 自動推奨
                document.getElementById('extractedDataSection').style.display = 'block';
                aiAnalysisDone = true;
                submitBtn.disabled = false;
                return;
            }

            // 登録処理
            const experienceData = {
                content,
                date,
                title: document.getElementById('extractedTitle').value.trim() || extractedData?.title || '無題',
                category: getSelectedCategory() || 'その他',
                skills: selectedSkills,
                emotions: selectedEmotions,
                extracted: true
            };

            if (currentEditingId) {
                Storage.updateExperience(currentEditingId, experienceData);
            } else {
                Storage.saveExperience(experienceData);
            }

            modal.closeModal();
            loadExperiences();
        } catch (err) {
            console.error(err);
            alert('エラーが発生しました');
        } finally {
            submitBtn.disabled = false;
        }
    }
};

// --- カテゴリータグ機能 ---

function setupCategorySelection() {
    const container = document.getElementById('categorySelection');
    const input = document.getElementById('newCategoryInput');
    const addBtn = document.getElementById('addCategoryBtn');

    // タグクリックで1つだけ選択
    container.addEventListener('click', (e) => {
        if (!e.target.classList.contains('tag')) return;
        [...container.children].forEach(tag => tag.classList.remove('selected'));
        e.target.classList.add('selected');
    });

    // 新規追加
    addBtn.addEventListener('click', () => {
        const val = input.value.trim();
        if (!val) return;
        if (![...container.children].some(t => t.dataset.value === val)) {
            const span = document.createElement('span');
            span.className = 'tag category selected';
            span.dataset.value = val;
            span.textContent = val;
            container.appendChild(span);
            // 追加したタグのみ選択
            [...container.children].forEach(tag => {
                if (tag !== span) tag.classList.remove('selected');
            });
        }
        input.value = '';
    });

    // 入力内容に応じて自動推奨
    const contentEl = document.getElementById('experienceContent');
    contentEl.addEventListener('input', () => {
        const text = contentEl.value.trim();
        if (text) suggestCategory(text);
    });
}

// カテゴリーをタグ化して選択状態にセット（編集時・AI推奨用）
function setupCategoryTags(category) {
    const container = document.getElementById('categorySelection');
    [...container.children].forEach(tag => tag.classList.remove('selected'));
    if (!category) return;
    const categories = category.split(',').map(c => c.trim());
    if (categories.length > 0) {
        const cat = categories[0]; // 1つだけ選択
        let tag = [...container.children].find(t => t.dataset.value === cat);
        if (tag) tag.classList.add('selected');
        else {
            const span = document.createElement('span');
            span.className = 'tag category selected';
            span.dataset.value = cat;
            span.textContent = cat;
            container.appendChild(span);
        }
    }
}

// キーワード自動推奨（1つだけ）
function suggestCategory(content) {
    const lowerContent = content.toLowerCase();
    const container = document.getElementById('categorySelection');
    [...container.children].forEach(tag => tag.classList.remove('selected'));

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => lowerContent.includes(k.toLowerCase()))) {
            const tag = [...container.children].find(t => t.dataset.value === category);
            if (tag) tag.classList.add('selected');
            break; // 1つだけ選択
        }
    }
}

// 選択されたカテゴリーを取得（1つ）
function getSelectedCategory() {
    const selected = document.querySelector('#categorySelection .tag.selected');
    return selected ? selected.dataset.value : null;
}

// --- 初期化 ---
setupCategorySelection();

// モーダル用ボタンイベント
document.getElementById('modalCloseBtn').addEventListener('click', () => modal.closeModal());
document.getElementById('cancelBtn').addEventListener('click', () => modal.closeModal());

// 新規登録ボタン
document.getElementById('addNewBtn').addEventListener('click', () => modal.openModal());
document.getElementById('emptyAddBtn').addEventListener('click', () => modal.openModal());
