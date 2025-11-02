export let selectedSkills = [];
export let selectedEmotions = [];

export function createSelectableTag(text, type, isSelected) {
    const tag = document.createElement('div');
    tag.className = `tag-selectable ${type} ${isSelected?'selected':''}`;
    tag.textContent = text;
    tag.dataset.value = text;
    tag.addEventListener('click', () => {
        tag.classList.toggle('selected');
        updateSelectedTags(type);
    });
    return tag;
}

export function updateSelectedTags(type){
    if(type==='skill') selectedSkills = Array.from(document.querySelectorAll('#skillsSelection .tag-selectable.selected')).map(t=>t.dataset.value);
    else selectedEmotions = Array.from(document.querySelectorAll('#emotionsSelection .tag-selectable.selected')).map(t=>t.dataset.value);
}

export function renderTagList(tags){
    return tags.join('、');
}

export function renderTagsForModal(data){
    // スキル
    const skillsContainer = document.getElementById('skillsSelection');
    skillsContainer.innerHTML='';
    if(data.skills.length===0){
        const msg = document.createElement('p');
        msg.className='no-tag-message';
        msg.textContent='該当するスキルは見つかりませんでした';
        skillsContainer.appendChild(msg);
    } else {
        const selectedDiv = document.createElement('div');
        selectedDiv.className='selected-tags';
        const label = document.createElement('p'); label.textContent='抽出されたスキル：';
        selectedDiv.appendChild(label);
        data.skills.forEach(skill => selectedDiv.appendChild(createSelectableTag(skill,'skill',true)));
        skillsContainer.appendChild(selectedDiv);
    }
    const unselectedSkills = data.allPredefinedSkills.filter(s=>!data.skills.includes(s));
    if(unselectedSkills.length>0){
        const unselectedDiv = document.createElement('div'); unselectedDiv.className='unselected-tags';
        const label = document.createElement('p'); label.textContent='追加できるスキル：';
        unselectedDiv.appendChild(label);
        unselectedSkills.forEach(skill => unselectedDiv.appendChild(createSelectableTag(skill,'skill',false)));
        skillsContainer.appendChild(unselectedDiv);
    }

    // 感情
    const emotionsContainer = document.getElementById('emotionsSelection');
    emotionsContainer.innerHTML='';
    if(data.emotions.length===0){
        const msg = document.createElement('p');
        msg.className='no-tag-message';
        msg.textContent='該当する感情は見つかりませんでした';
        emotionsContainer.appendChild(msg);
    } else {
        const selectedDiv = document.createElement('div');
        selectedDiv.className='selected-tags';
        const label = document.createElement('p'); label.textContent='抽出された感情：';
        selectedDiv.appendChild(label);
        data.emotions.forEach(em => selectedDiv.appendChild(createSelectableTag(em,'emotion',true)));
        emotionsContainer.appendChild(selectedDiv);
    }
    const unselectedEmotions = data.allPredefinedEmotions.filter(e=>!data.emotions.includes(e));
    if(unselectedEmotions.length>0){
        const unselectedDiv = document.createElement('div'); unselectedDiv.className='unselected-tags';
        const label = document.createElement('p'); label.textContent='追加できる感情：';
        unselectedDiv.appendChild(label);
        unselectedEmotions.forEach(em => unselectedDiv.appendChild(createSelectableTag(em,'emotion',false)));
        emotionsContainer.appendChild(unselectedDiv);
    }
}
