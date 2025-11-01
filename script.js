// script.js - Case Tracker volledig met interactief formulier

const STORAGE_KEY = 'case-tracker:v1';
let cases = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
const COMPANY_CODE = '1913';

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

const searchInput = document.getElementById('searchInput');
const addBtn = document.getElementById('addBtn');
const listContainer = document.getElementById('listContainer');

const formContainer = document.getElementById('formContainer');
const formName = document.getElementById('formName');
const formDesc = document.getElementById('formDesc');
const formReason = document.getElementById('formReason');
const saveBtn = document.getElementById('saveBtn');

let editingCaseId = null;

// Login functie
loginBtn.addEventListener('click', () => {
    const code = document.getElementById('companyCode').value.trim();
    if(code === COMPANY_CODE){
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        renderCases();
    } else {
        loginError.classList.remove('hidden');
    }
});

// LocalStorage opslaan
function saveCases() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    renderCases();
}

function nextCaseNumber() {
    if (!cases.length) return 1;
    return Math.max(...cases.map(c=>c.number)) + 1;
}

// Nieuw dossier of bewerk functie
function openForm(c=null){
    formContainer.classList.remove('hidden');
    if(c){
        editingCaseId = c.id;
        formName.value = c.title;
        formDesc.value = c.description;
        formReason.value = c.tags.join(', ');
        saveBtn.textContent = 'Bewerk dossier';
    } else {
        editingCaseId = null;
        formName.value = '';
        formDesc.value = '';
        formReason.value = '';
        saveBtn.textContent = 'Nieuw dossier';
    }
}

// Opslaan knop
saveBtn.addEventListener('click', () => {
    const name = formName.value.trim();
    const desc = formDesc.value.trim();
    const reason = formReason.value.trim();

    if(!name || !desc || !reason){
        alert('Vul alle velden in!');
        return;
    }

    if(editingCaseId){
        editCase(editingCaseId, name, desc, reason);
    } else {
        addCase(name, desc, reason);
    }

    formContainer.classList.add('hidden');
    formName.value = '';
    formDesc.value = '';
    formReason.value = '';
    editingCaseId = null;
});

addBtn.addEventListener('click', ()=>openForm());

// Dossier functies
function addCase(title, description, tags){
    const now = Date.now();
    const newCase = {
        id: `c${now}${Math.floor(Math.random()*9000)}`,
        number: nextCaseNumber(),
        title,
        description,
        tags: tags.split(',').map(t=>t.trim()).filter(Boolean),
        status: 'open',
        createdAt: now,
        updatedAt: now
    };
    cases.unshift(newCase);
    saveCases();
}

function editCase(id, title, description, tags){
    cases = cases.map(c => c.id === id ? {...c, title, description, tags: tags.split(',').map(t=>t.trim()).filter(Boolean), updatedAt: Date.now()} : c);
    saveCases();
}

function toggleStatus(id){
    cases = cases.map(c => c.id === id ? {...c, status: c.status==='open'?'closed':'open', updatedAt: Date.now()} : c);
    saveCases();
}

function removeCase(id){
    if(confirm('Weet je zeker dat je dit wilt verwijderen?')){
        cases = cases.filter(c=>c.id!==id);
        saveCases();
    }
}

// Render lijst
function renderCases(){
    listContainer.innerHTML = '';
    const query = searchInput.value.trim().toLowerCase();
    const filtered = query ? cases.filter(c => c.title.toLowerCase().includes(query) || String(c.number).includes(query)) : cases;

    filtered.forEach(c => {
        const div = document.createElement('div');
        div.className = 'case-card';
        div.innerHTML = `
            <strong>#${c.number} ${c.title}</strong> <span class="${c.status==='open'?'text-green-600':'text-red-600'}">(${c.status})</span>
            <p>${c.description}</p>
            <p>Reden / Tags: ${c.tags.join(', ')}</p>
        `;

        const btns = document.createElement('div');
        btns.className = 'buttons';

        const editBtn = document.createElement('button');
        editBtn.textContent='Bewerk'; editBtn.onclick=()=>openForm(c);

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent=c.status==='open'?'Sluit':'Heropen'; toggleBtn.className='status';
        if(c.status==='closed') toggleBtn.classList.add('closed');
        toggleBtn.onclick=()=>toggleStatus(c.id);

        const delBtn = document.createElement('button');
        delBtn.textContent='Verwijder'; delBtn.className='delete'; delBtn.onclick=()=>removeCase(c.id);

        btns.appendChild(editBtn); btns.appendChild(toggleBtn); btns.appendChild(delBtn);
        div.appendChild(btns);

        listContainer.appendChild(div);
    });
}

searchInput.addEventListener('input', renderCases);