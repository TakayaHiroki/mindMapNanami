export const AIMock = {
    PREDEFINED_SKILLS: ['関係構築','交渉・折衝','リーダーシップ','チームワーク','サポート','フットワーク','スピード対応','変化対応','自律的遂行','プレッシャー耐性','着実遂行','発想・チャレンジ','企画構想','問題分析'],
    PREDEFINED_EMOTIONS: ['喜び','信頼','恐れ','驚き','悲しみ','嫌悪','怒り','期待','安心','誇り','不安','緊張','後悔','感動','興奮','落ち着き'],
    CATEGORY_KEYWORDS: { '部活動':['部活','練習','試合'], 'アルバイト':['バイト','接客'], '学業':['授業','勉強','レポート'], '趣味':['趣味','楽しむ'], 'プロジェクト':['プロジェクト','開発'] },
    SKILL_KEYWORDS: { '関係構築':['人間関係','信頼'], '交渉・折衝':['交渉','調整'], 'リーダーシップ':['リーダー','指導'], 'チームワーク':['チーム','協力'] },
    EMOTION_KEYWORDS: { '喜び':['嬉しい','達成感','楽しい','充実感'], '信頼':['安心','任せた','信頼'], '恐れ':['怖い','恐ろしい','不安'], '驚き':['驚いた','意外','びっくり'], '悲しみ':['悲しい','つらい','落ち込む'], '嫌悪':['嫌だ','うんざり','苦手'], '怒り':['怒った','腹立たしい','苛立ち'], '期待':['楽しみ','期待','待ち遠しい'], '誇り':['誇らしい','自信'], '緊張':['緊張','ドキドキ'], '後悔':['後悔','残念'], '感動':['感動','胸が熱い'], '興奮':['興奮','ワクワク'], '落ち着き':['落ち着く','安心した'] },

    async analyzeExperience(content) {
        await new Promise(r => setTimeout(r,1500));
        let title = "タイトルが自動生成できませんでした";
        let category = 'その他';
        const skills = [], emotions = [];

        for (const [cat,kws] of Object.entries(this.CATEGORY_KEYWORDS)) if(kws.some(kw=>content.includes(kw))) category = cat;
        for (const [s,kws] of Object.entries(this.SKILL_KEYWORDS)) if(kws.some(kw=>content.includes(kw))) skills.push(s);
        for (const [e,kws] of Object.entries(this.EMOTION_KEYWORDS)) if(kws.some(kw=>content.includes(kw))) emotions.push(e);

        return { title, category, skills: skills.slice(0,5), emotions: emotions.slice(0,5), allPredefinedSkills:this.PREDEFINED_SKILLS, allPredefinedEmotions:this.PREDEFINED_EMOTIONS };
    }
};
