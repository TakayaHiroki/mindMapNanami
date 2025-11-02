import { modal } from './modal.js';
import { loadExperiences } from './ui.js';

export function setupEventListeners(){
    document.getElementById('addNewBtn')?.addEventListener('click', ()=>modal.openModal());
    document.getElementById('emptyAddBtn')?.addEventListener('click', ()=>modal.openModal());
    document.getElementById('modalCloseBtn')?.addEventListener('click', ()=>modal.closeModal());
    document.getElementById('cancelBtn')?.addEventListener('click', ()=>modal.closeModal());
    document.getElementById('experienceForm')?.addEventListener('submit', e=>modal.handleSubmit(e));

    const modalElement = document.getElementById('experienceModal');
    modalElement?.addEventListener('click', (e)=>{
        if(e.target.classList.contains('modal-overlay')) modal.closeModal();
    });

    window.addEventListener('load', ()=>loadExperiences());
}

