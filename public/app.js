// ═══════════════════════════════════════
// WhatsApp AI Bot Dashboard — Frontend
// ═══════════════════════════════════════

const API = '';
let pollInterval = null;

// ── Navigation ──────────────────────────
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('page-title');

const tabTitles = {
    'status': 'Status Koneksi',
    'ai-settings': 'Pengaturan AI',
    'contacts': 'Aturan Kontak',
    'replies': 'Auto Reply',
    'logs': 'Log Pesan'
};

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        switchTab(tab);
    });
});

function switchTab(tab) {
    navItems.forEach(n => n.classList.remove('active'));
    tabContents.forEach(t => t.classList.remove('active'));

    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
    pageTitle.textContent = tabTitles[tab] || 'Dashboard';

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Refresh data for specific tabs
    if (tab === 'logs') refreshLogs();
    if (tab === 'contacts') refreshContacts();
    if (tab === 'replies') refreshReplies();
    if (tab === 'ai-settings') loadAISettings();
}

// Mobile menu toggle
document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// ── Status Polling ──────────────────────
async function checkStatus() {
    try {
        const res = await fetch(`${API}/api/status`);
        const data = await res.json();

        const dot = document.querySelector('.status-dot');
        const text = document.getElementById('connection-text');
        const qrSection = document.getElementById('qr-section');
        const connSection = document.getElementById('connected-section');
        const qrContainer = document.getElementById('qr-container');

        if (data.connected) {
            dot.className = 'status-dot connected';
            text.textContent = 'Terhubung';

            qrSection.style.display = 'none';
            connSection.style.display = 'block';

            if (data.botInfo) {
                document.getElementById('bot-name').textContent = data.botInfo.name || '—';
                document.getElementById('bot-number').textContent = '+' + data.botInfo.number;
                document.getElementById('bot-platform').textContent = data.botInfo.platform || 'WhatsApp';
            }
        } else {
            dot.className = 'status-dot disconnected';
            text.textContent = 'Disconnected';

            connSection.style.display = 'none';
            qrSection.style.display = 'block';

            if (data.qrCode) {
                qrContainer.innerHTML = `<img src="${data.qrCode}" alt="QR Code" id="qr-image">`;
            } else {
                qrContainer.innerHTML = `
                    <div class="qr-loading">
                        <div class="spinner"></div>
                        <p>Menunggu QR Code...</p>
                    </div>`;
            }
        }
    } catch (err) {
        console.error('Status check error:', err);
    }
}

// ── AI Settings ─────────────────────────
async function loadAISettings() {
    try {
        const res = await fetch(`${API}/api/config`);
        const cfg = await res.json();

        document.getElementById('bot-name-input').value = cfg.botName || '';
        document.getElementById('system-prompt').value = cfg.systemPrompt || '';
        document.getElementById('max-tokens').value = cfg.maxTokens || 500;
        document.getElementById('auto-reply-toggle').checked = cfg.autoReplyEnabled !== false;
        document.getElementById('mention-only-toggle').checked = cfg.replyOnlyWhenMentioned !== false;
    } catch (err) {
        showToast('Gagal memuat pengaturan', 'error');
    }
}

async function saveAISettings() {
    const data = {
        botName: document.getElementById('bot-name-input').value,
        systemPrompt: document.getElementById('system-prompt').value,
        maxTokens: parseInt(document.getElementById('max-tokens').value) || 500,
        autoReplyEnabled: document.getElementById('auto-reply-toggle').checked,
        replyOnlyWhenMentioned: document.getElementById('mention-only-toggle').checked
    };

    try {
        const res = await fetch(`${API}/api/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showToast('✅ Pengaturan AI disimpan!', 'success');
        }
    } catch (err) {
        showToast('Gagal menyimpan pengaturan', 'error');
    }
}

function useTemplate(el) {
    const text = el.querySelector('p').textContent;
    document.getElementById('system-prompt').value = text;
    showToast('Template diterapkan! Jangan lupa simpan.', 'info');
}

// ── Contact Rules ───────────────────────
async function refreshContacts() {
    try {
        const res = await fetch(`${API}/api/contacts`);
        const contacts = await res.json();
        renderContacts(contacts);
    } catch (err) {
        console.error('Contacts error:', err);
    }
}

function renderContacts(contacts) {
    const list = document.getElementById('contacts-list');

    if (!contacts || contacts.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/><line x1="17" y1="11" x2="23" y2="11"/>
                </svg>
                <p>Belum ada aturan kontak</p>
            </div>`;
        return;
    }

    const modeEmojis = { agree: '✅', disagree: '❌', custom: '✏️', ai_persona: '🤖', ignore: '🚫' };
    const modeLabels = { agree: 'Selalu Setuju', disagree: 'Selalu Tidak Setuju', custom: 'Jawaban Custom', ai_persona: 'AI Persona Khusus', ignore: 'Abaikan' };

    list.innerHTML = contacts.map(c => `
        <div class="rule-item" data-id="${c.id}">
            <div class="rule-icon ${c.mode}">${modeEmojis[c.mode] || '❓'}</div>
            <div class="rule-info">
                <div class="rule-name">${escapeHtml(c.name || c.number)}</div>
                <div class="rule-detail">${c.number} · ${modeLabels[c.mode] || c.mode}${!c.enabled ? ' · <span style="color:var(--danger)">Nonaktif</span>' : ''}</div>
                ${c.customResponse ? `<div class="rule-response">"${escapeHtml(c.customResponse)}"</div>` : ''}
            </div>
            <div class="rule-actions">
                <button class="rule-toggle" onclick="deleteContact('${c.id}')" title="Hapus">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

async function addContact() {
    const name = document.getElementById('contact-name').value.trim();
    const number = document.getElementById('contact-number').value.trim();
    const mode = document.getElementById('contact-mode').value;
    const customResponse = document.getElementById('contact-custom-response').value.trim();

    if (!number) {
        showToast('Nomor WhatsApp harus diisi!', 'error');
        return;
    }

    try {
        const res = await fetch(`${API}/api/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, number, mode, customResponse })
        });
        const result = await res.json();
        if (result.success) {
            showToast('✅ Aturan kontak ditambahkan!', 'success');
            document.getElementById('contact-name').value = '';
            document.getElementById('contact-number').value = '';
            document.getElementById('contact-custom-response').value = '';
            refreshContacts();
        }
    } catch (err) {
        showToast('Gagal menambah aturan', 'error');
    }
}

async function deleteContact(id) {
    if (!confirm('Hapus aturan ini?')) return;
    try {
        await fetch(`${API}/api/contacts/${id}`, { method: 'DELETE' });
        showToast('Aturan dihapus', 'info');
        refreshContacts();
    } catch (err) {
        showToast('Gagal menghapus', 'error');
    }
}

function toggleCustomField() {
    const mode = document.getElementById('contact-mode').value;
    const group = document.getElementById('custom-response-group');
    group.style.display = (mode === 'custom' || mode === 'agree' || mode === 'disagree' || mode === 'ai_persona') ? 'block' : 'none';
}

// ── Auto Replies ────────────────────────
async function refreshReplies() {
    try {
        const res = await fetch(`${API}/api/replies`);
        const replies = await res.json();
        renderReplies(replies);
    } catch (err) {
        console.error('Replies error:', err);
    }
}

function renderReplies(replies) {
    const list = document.getElementById('replies-list');

    if (!replies || replies.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <p>Belum ada keyword</p>
            </div>`;
        return;
    }

    list.innerHTML = replies.map(r => `
        <div class="rule-item" data-id="${r.id}">
            <div class="rule-icon custom">💬</div>
            <div class="rule-info">
                <div class="rule-name">Keyword: "${escapeHtml(r.keyword)}"</div>
                <div class="rule-detail">${r.enabled ? '🟢 Aktif' : '🔴 Nonaktif'}</div>
                <div class="rule-response">"${escapeHtml(r.response)}"</div>
            </div>
            <div class="rule-actions">
                <button class="rule-toggle" onclick="toggleReply('${r.id}', ${!r.enabled})" title="${r.enabled ? 'Nonaktifkan' : 'Aktifkan'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${r.enabled
                            ? '<path d="M18.36 6.64a9 9 0 11-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>'
                            : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
                        }
                    </svg>
                </button>
                <button class="rule-toggle" onclick="deleteReply('${r.id}')" title="Hapus">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

async function addReply() {
    const keyword = document.getElementById('reply-keyword').value.trim();
    const response = document.getElementById('reply-response').value.trim();

    if (!keyword || !response) {
        showToast('Keyword dan jawaban harus diisi!', 'error');
        return;
    }

    try {
        const res = await fetch(`${API}/api/replies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword, response })
        });
        const result = await res.json();
        if (result.success) {
            showToast('✅ Keyword ditambahkan!', 'success');
            document.getElementById('reply-keyword').value = '';
            document.getElementById('reply-response').value = '';
            refreshReplies();
        }
    } catch (err) {
        showToast('Gagal menambah keyword', 'error');
    }
}

async function toggleReply(id, enabled) {
    try {
        await fetch(`${API}/api/replies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled })
        });
        refreshReplies();
    } catch (err) {
        showToast('Gagal mengubah status', 'error');
    }
}

async function deleteReply(id) {
    if (!confirm('Hapus keyword ini?')) return;
    try {
        await fetch(`${API}/api/replies/${id}`, { method: 'DELETE' });
        showToast('Keyword dihapus', 'info');
        refreshReplies();
    } catch (err) {
        showToast('Gagal menghapus', 'error');
    }
}

// ── Logs ────────────────────────────────
async function refreshLogs() {
    try {
        const res = await fetch(`${API}/api/logs`);
        const logs = await res.json();
        renderLogs(logs);
        updateStats(logs);
    } catch (err) {
        console.error('Logs error:', err);
    }
}

function renderLogs(logs) {
    const list = document.getElementById('log-list');

    if (!logs || logs.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p>Belum ada pesan</p>
            </div>`;
        return;
    }

    list.innerHTML = logs.map(log => {
        const time = new Date(log.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const date = new Date(log.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

        return `
            <div class="log-item">
                <div class="log-header">
                    <span class="log-sender">${escapeHtml(log.from)} <small>(${log.number || ''})</small></span>
                    ${log.isGroup ? `<span class="log-group">${escapeHtml(log.group)}</span>` : ''}
                    ${log.ruleApplied ? `<span class="log-rule-badge">${log.ruleApplied}</span>` : ''}
                    <span class="log-time">${date} ${time}</span>
                </div>
                <div class="log-message">${escapeHtml(log.message)}</div>
                ${log.replied ? `<div class="log-reply">${escapeHtml(log.replyText)}</div>` : ''}
            </div>`;
    }).join('');
}

function updateStats(logs) {
    const today = new Date().toDateString();
    const todayLogs = logs.filter(l => new Date(l.time).toDateString() === today);

    document.getElementById('stat-messages').textContent = todayLogs.length;
    document.getElementById('stat-replied').textContent = todayLogs.filter(l => l.replied).length;
    document.getElementById('stat-groups').textContent = todayLogs.filter(l => l.isGroup).length;
}

// ── Bot Controls ────────────────────────
async function restartBot() {
    if (!confirm('Restart bot WhatsApp?')) return;
    try {
        await fetch(`${API}/api/restart`, { method: 'POST' });
        showToast('🔄 Bot sedang restart...', 'info');
    } catch (err) {
        showToast('Gagal restart', 'error');
    }
}

async function logoutBot() {
    if (!confirm('Logout dari WhatsApp? Anda perlu scan QR lagi.')) return;
    try {
        await fetch(`${API}/api/logout`, { method: 'POST' });
        showToast('👋 Berhasil logout', 'info');
    } catch (err) {
        showToast('Gagal logout', 'error');
    }
}

// ── Toast Notification ──────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ── Utility ─────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Init ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    loadAISettings();
    refreshContacts();
    refreshReplies();

    // Poll status every 3 seconds
    pollInterval = setInterval(checkStatus, 3000);

    // Refresh logs every 10 seconds if on logs tab
    setInterval(() => {
        if (document.getElementById('tab-logs').classList.contains('active')) {
            refreshLogs();
        }
    }, 10000);
});
