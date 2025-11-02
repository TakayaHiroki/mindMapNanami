// scripts/selfpr/generator.js

export class PRGenerator {
    constructor(experiences) {
        this.experiences = experiences;
        this.templates = {
            formal: {
                intro: [
                    '私の強みは{skill}です。',
                    '私は{skill}に自信があります。',
                    '{skill}が私の最大の強みです。'
                ],
                body: [
                    '{experience}では、{context}。{action}した結果、{outcome}。この経験を通じて、{learning}。',
                    '{experience}において、{context}という状況でした。私は{action}し、{outcome}という成果を上げました。',
                    '{experience}の際、{context}。そこで{action}することで、{outcome}を実現しました。'
                ],
                conclusion: [
                    'この{skill}を活かし、貴社でも積極的に貢献したいと考えています。',
                    '今後も{skill}を磨き続け、チームの成果向上に寄与したいと思います。',
                    '培った{skill}で、貴社の発展に貢献できると確信しています。'
                ]
            },
            casual: {
                intro: [
                    '私の得意なことは{skill}です。',
                    '{skill}には自信があります。',
                    '私が一番得意としているのは{skill}です。'
                ],
                body: [
                    '{experience}のとき、{context}という場面がありました。{action}してみたところ、{outcome}という結果になりました。',
                    '{experience}では、{context}。そこで{action}したら、{outcome}できました。',
                    '{experience}で{context}があって、{action}したんです。そうしたら{outcome}という形になりました。'
                ],
                conclusion: [
                    'この経験で身につけた{skill}を、今後も活かしていきたいです。',
                    '{skill}をもっと伸ばして、いろんな場面で役立てたいと思っています。',
                    'これからも{skill}を磨いて、成長していきたいです。'
                ]
            },
            confident: {
                intro: [
                    '私の最大の武器は{skill}です。',
                    '{skill}において、他の誰にも負けません。',
                    '私は{skill}のスペシャリストです。'
                ],
                body: [
                    '{experience}において、{context}という困難な状況に直面しました。しかし、{action}することで、{outcome}を達成しました。',
                    '{experience}では、{context}。私は即座に{action}し、{outcome}という優れた結果を導きました。',
                    '{experience}の場面で、{context}。迷わず{action}した結果、{outcome}を実現させました。'
                ],
                conclusion: [
                    'この{skill}を武器に、必ず期待以上の成果を出します。',
                    '私の{skill}は、どんな困難な課題でも解決できる力です。',
                    '{skill}を最大限に発揮し、組織の成長を加速させます。'
                ]
            }
        };
    }

    generate(targetSkill, length, tone) {
        // ターゲットスキルを含む経験を抽出
        const relevantExps = this.experiences.filter(exp => 
            (exp.skills || []).includes(targetSkill)
        );

        if (relevantExps.length === 0) {
            return {
                text: '選択したスキルに関連する経験が見つかりませんでした。',
                charCount: 0,
                usedExperiences: []
            };
        }

        // 最も詳細な経験を2-3件選択
        const selectedExps = this.selectBestExperiences(relevantExps, targetSkill, length);

        // 自己PRの各パートを生成
        const template = this.templates[tone];
        const intro = this.randomPick(template.intro).replace('{skill}', targetSkill);
        
        const bodies = selectedExps.map(exp => this.generateBody(exp, targetSkill, template.body));
        const bodyText = bodies.join('');
        
        const conclusion = this.randomPick(template.conclusion).replace(/{skill}/g, targetSkill);

        // 組み合わせて完成
        let prText = intro + '\n\n' + bodyText + '\n\n' + conclusion;

        // 長さ調整
        prText = this.adjustLength(prText, length);

        return {
            text: prText,
            charCount: prText.replace(/\n/g, '').length,
            usedExperiences: selectedExps
        };
    }

    selectBestExperiences(experiences, targetSkill, length) {
        // スコアリング: スキル数、感情数、コンテンツ長さで評価
        const scored = experiences.map(exp => {
            let score = 0;
            
            // ターゲットスキルが含まれている
            score += 10;
            
            // 他のスキルも多い
            score += (exp.skills || []).length * 2;
            
            // 感情が記録されている
            score += (exp.emotions || []).length * 1.5;
            
            // コンテンツが詳細
            score += Math.min(exp.content.length / 50, 5);
            
            return { exp, score };
        });

        // スコア順にソート
        scored.sort((a, b) => b.score - a.score);

        // 長さに応じて選択数を決定
        const count = length === 'short' ? 1 : length === 'medium' ? 2 : 3;
        return scored.slice(0, Math.min(count, scored.length)).map(s => s.exp);
    }

    generateBody(exp, targetSkill, templates) {
        const template = this.randomPick(templates);
        
        // コンテキスト生成
        const context = this.extractContext(exp);
        
        // アクション生成
        const action = this.extractAction(exp, targetSkill);
        
        // 成果生成
        const outcome = this.extractOutcome(exp);
        
        // 学び生成
        const learning = this.extractLearning(exp, targetSkill);

        return template
            .replace('{experience}', exp.title || exp.category || '経験')
            .replace('{context}', context)
            .replace('{action}', action)
            .replace('{outcome}', outcome)
            .replace('{learning}', learning);
    }

    extractContext(exp) {
        // 経験の背景を抽出（最初の1-2文）
        const sentences = exp.content.split(/[。.]/);
        return sentences[0] || '様々な課題がありました';
    }

    extractAction(exp, targetSkill) {
        // スキルに基づいたアクションを生成
        const actionWords = {
            'チームワーク': ['メンバーと連携', 'チームで協力', '役割分担を明確化'],
            'リーダーシップ': ['チームを率い', '方向性を示し', 'メンバーを導き'],
            '問題分析': ['課題を分析し', '原因を特定し', '解決策を検討し'],
            '企画構想': ['新しい企画を立案し', 'アイデアを提案し', '計画を策定し'],
            'コミュニケーション': ['積極的に対話し', '意見を調整し', '合意形成を図り'],
            '発想・チャレンジ': ['新しい試みに挑戦し', '創意工夫を重ね', '革新的な方法を実践し'],
            'プレッシャー耐性': ['困難な状況でも冷静に対処し', 'ストレスに負けず', '粘り強く取り組み']
        };

        const actions = actionWords[targetSkill] || ['全力で取り組み', '最善を尽くし', '努力を重ね'];
        return this.randomPick(actions);
    }

    extractOutcome(exp) {
        // ポジティブな感情から成果を推測
        const positiveEmotions = ['喜び', '達成感', '誇り', '満足', '充実'];
        const hasPositive = (exp.emotions || []).some(e => positiveEmotions.some(p => e.includes(p)));

        if (hasPositive) {
            return this.randomPick([
                '期待以上の成果を達成',
                '目標を達成',
                '大きな成功を収める',
                'チーム全体で良い結果を得る'
            ]);
        }

        return this.randomPick([
            '良い結果を得る',
            '一定の成果を上げる',
            '目標に近づく',
            '前進する'
        ]);
    }

    extractLearning(exp, targetSkill) {
        return `${targetSkill}の重要性を深く理解しました`;
    }

    adjustLength(text, targetLength) {
        const current = text.replace(/\n/g, '').length;
        const targets = { short: 250, medium: 350, long: 450 };
        const target = targets[targetLength];

        // 目標文字数に近ければそのまま
        if (Math.abs(current - target) < 50) {
            return text;
        }

        // 長すぎる場合は後半を削る（簡易的な処理）
        if (current > target + 50) {
            const parts = text.split('\n\n');
            if (parts.length > 2) {
                // 中間部分を短縮
                const intro = parts[0];
                const body = parts.slice(1, -1).join('\n\n');
                const conclusion = parts[parts.length - 1];
                
                const shortened = body.substring(0, Math.floor(body.length * 0.7));
                return intro + '\n\n' + shortened + '\n\n' + conclusion;
            }
        }

        return text;
    }

    randomPick(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}