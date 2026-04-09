// API Configuration
const API_BASE = 'http://localhost:5000/api';
let authToken = null;
let currentUser = null;

console.log('[DEBUG] API Base:', API_BASE);
console.log('[DEBUG] Script loaded successfully');

// ==================== AUTH FUNCTIONS ====================

let isLogin = true;

function toggleForm() {
    isLogin = !isLogin;
    document.getElementById('formTitle').innerText = isLogin ? 'Login' : 'Signup';
    document.getElementById('toggleText').innerHTML =
        isLogin
            ? `Don't have an account? <span onclick="toggleForm()" class="toggle-link">Signup</span>`
            : `Already have an account? <span onclick="toggleForm()" class="toggle-link">Login</span>`;
}

function showAuthError(message) {
    console.error('[ERROR]', message);
    const errorDiv = document.getElementById('authError');
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
    setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
}

function handleAuth() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    console.log('[DEBUG] Auth attempt:', { username, mode: isLogin ? 'login' : 'signup' });

    if (!username || !password) {
        showAuthError('Please enter username and password');
        return;
    }

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    const method = 'POST';

    showLoading(true);

    fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(res => {
            console.log('[DEBUG] Auth response status:', res.status);
            return res.json();
        })
        .then(data => {
            showLoading(false);
            console.log('[DEBUG] Auth response:', data);
            if (data.error) {
                showAuthError(data.error);
            } else {
                if (data.token) {
                    authToken = data.token;
                    currentUser = data.user;
                    console.log('[SUCCESS] Authenticated as:', currentUser.username);
                    loadApp();
                } else {
                    showAuthError('Signup successful! Please login.');
                    toggleForm();
                }
            }
        })
        .catch(err => {
            showLoading(false);
            console.error('[ERROR] Auth failed:', err);
            showAuthError('Connection error: ' + err.message);
        });
}

function loadApp() {
    document.getElementById('authPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userDisplay').innerText = `Welcome, ${currentUser.username}!`;
    loadDocuments();
    loadHistory();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        }).then(() => {
            authToken = null;
            currentUser = null;
            location.reload();
        });
    }
}

// ==================== DOCUMENT FUNCTIONS ====================

function loadDocuments() {
    fetch(`${API_BASE}/documents/list`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
        .then(res => res.json())
        .then(data => {
            if (data.documents) {
                displayDocuments(data.documents);
                updateDocumentSelect(data.documents);
            }
        })
        .catch(err => console.error('Error loading documents:', err));
}

function displayDocuments(documents) {
    const list = document.getElementById('documentsList');
    if (documents.length === 0) {
        list.innerHTML = '<p class="placeholder">No documents uploaded yet</p>';
        return;
    }

    list.innerHTML = documents.map(doc => `
        <div class="doc-item">
            <div class="doc-info">
                <strong>${doc.filename}</strong>
                <small>${new Date(doc.upload_date).toLocaleDateString()}</small>
                <p class="doc-preview">${doc.preview || 'No preview'}</p>
            </div>
            <button onclick="deleteDocument(${doc.id})" class="btn-delete">🗑️</button>
        </div>
    `).join('');
}

function updateDocumentSelect(documents) {
    const select = document.getElementById('documentSelect');
    const html = '<option value="">General Knowledge</option>' +
        documents.map(doc => `<option value="${doc.id}">${doc.filename}</option>`).join('');
    select.innerHTML = html;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    showLoading(true);

    fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            showLoading(false);
            if (data.error) {
                showError('uploadError', data.error);
            } else {
                showSuccess('uploadSuccess', `✓ ${data.document.filename} uploaded successfully`);
                document.getElementById('fileInput').value = '';
                loadDocuments();
            }
        })
        .catch(err => {
            showLoading(false);
            showError('uploadError', 'Upload failed: ' + err.message);
        });
}

function deleteDocument(docId) {
    if (!confirm('Delete this document?')) return;

    fetch(`${API_BASE}/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                loadDocuments();
            }
        });
}

// ==================== QUESTION & AI FUNCTIONS ====================

function askAI() {
    const question = document.getElementById('question').value.trim();
    const language = document.getElementById('language').value;
    const difficulty_marks = parseInt(document.getElementById('difficulty').value);
    const document_id = document.getElementById('documentSelect').value || null;

    console.log('[DEBUG] Asking AI:', { question, language, difficulty_marks, document_id });

    if (!question) {
        showError('aiError', 'Please enter a question');
        return;
    }

    if (!authToken) {
        showError('aiError', 'Not authenticated. Please login first.');
        console.error('[ERROR] No auth token available');
        return;
    }

    showLoading(true);

    fetch(`${API_BASE}/questions/ask`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question,
            language,
            difficulty_marks,
            document_id: document_id ? parseInt(document_id) : null
        })
    })
        .then(res => {
            console.log('[DEBUG] AI response status:', res.status);
            return res.json();
        })
        .then(data => {
            showLoading(false);
            console.log('[DEBUG] AI response:', data);
            if (data.error) {
                showError('aiError', 'Error: ' + data.error);
            } else {
                console.log('[SUCCESS] Answer received');
                displayChatMessage('user', question);
                displayChatMessage('ai', data.question.answer);
                document.getElementById('question').value = '';
                loadHistory();
            }
        })
        .catch(err => {
            showLoading(false);
            console.error('[ERROR] AI request failed:', err);
            showError('aiError', 'Error: ' + err.message);
        });
}

function displayChatMessage(sender, data) {
    const chatBox = document.getElementById('chatBox');
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;

    if (sender === 'user') {
        div.innerHTML = `<div class="message-content">${escapeHtml(data)}</div>`;
    } else {
        // data is the answer object
        const tags = data.answer?.tags || [];
        div.innerHTML = `
            <div class="message-content">
                <div class="ai-response">${escapeHtml(data.answer?.response || '')}</div>
                ${tags.length > 0 ? `<div class="tags">${tags.map(tag => `<span>${tag}</span>`).join('')}</div>` : ''}
            </div>
        `;
    }

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ==================== HISTORY FUNCTIONS ====================

function loadHistory() {
    fetch(`${API_BASE}/history/outputs`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
        .then(res => res.json())
        .then(data => {
            if (data.outputs) {
                displayHistory(data.outputs);
            }
        })
        .catch(err => console.error('Error loading history:', err));
}

function displayHistory(outputs) {
    const list = document.getElementById('historyList');
    if (outputs.length === 0) {
        list.innerHTML = '<p class="placeholder">No exam outputs yet</p>';
        return;
    }

    list.innerHTML = outputs.slice(0, 5).map(output => `
        <div class="history-item">
            <div class="history-info">
                <strong>${output.question.substring(0, 50)}...</strong>
                <small>${output.language} • ${output.difficulty_marks} marks • ${new Date(output.created_at).toLocaleDateString()}</small>
            </div>
            <button onclick="viewHistory(${output.id})" class="btn-view">👁️</button>
            <button onclick="deleteHistory(${output.id})" class="btn-delete">🗑️</button>
        </div>
    `).join('');
}

function viewHistory(outputId) {
    fetch(`${API_BASE}/history/${outputId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
        .then(res => res.json())
        .then(data => {
            alert(`Q: ${data.question}\n\nA: ${data.answer.response}`);
        })
        .catch(err => alert('Error loading output: ' + err.message));
}

function deleteHistory(outputId) {
    if (!confirm('Delete this output?')) return;

    fetch(`${API_BASE}/history/${outputId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                loadHistory();
            }
        });
}

// ==================== UTILITY FUNCTIONS ====================

function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

function showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
    setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
}

function showSuccess(elementId, message) {
    const successDiv = document.getElementById(elementId);
    successDiv.innerText = message;
    successDiv.style.display = 'block';
    setTimeout(() => { successDiv.style.display = 'none'; }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== FILE UPLOAD DRAG & DROP ====================

const uploadBox = document.getElementById('uploadBox');
if (uploadBox) {
    uploadBox.addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            document.getElementById('fileInput').files = e.dataTransfer.files;
            handleFileUpload({ target: { files: e.dataTransfer.files } });
        }
    });
}
