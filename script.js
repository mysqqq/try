const $ = id => document.getElementById(id);
const els = {
    cookie: $('cookieInput'),
    link: $('linkInput'),
    amount: $('amountInput'),
    delay: $('delayInput'),
    startBtn: $('startBtn'),
    cookieError: $('cookieError'),
    linkError: $('linkError'),
    amountError: $('amountError'),
    statusDot: $('statusDot'),
    statusText: $('statusText'),
    shareCount: $('shareCount'),
    shareTotal: $('shareTotal'),
    postPreview: $('postPreview'),
    postLink: $('postLink'),
    progressSection: $('progressSection'),
    progressBar: $('progressBar'),
    progressPercent: $('progressPercent'),
    activityLog: $('activityLog')
};

let isSharing = false;
let sharesDone = 0;
let totalShares = 0;

function showError(el, msg) {
    el.textContent = msg;
    el.className = 'error-msg show';
    setTimeout(() => el.className = 'error-msg', 4000);
}

function setStatus(status, active = false) {
    els.statusText.textContent = status;
    els.statusText.className = active ? 'status-text active' : 'status-text';
    els.statusDot.className = active ? 'status-dot active' : 'status-dot';
}

function updateCounter(current, total) {
    els.shareCount.textContent = current;
    els.shareTotal.textContent = total;

    const percent = Math.round((current / total) * 100);
    els.progressPercent.textContent = percent + '%';
    els.progressBar.style.width = percent + '%';
}

function addLog(message, type = 'success') {
    if (els.activityLog.querySelector('.log-empty')) {
        els.activityLog.innerHTML = '';
    }

    const log = document.createElement('div');
    log.className = 'log-item';

    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });

    log.innerHTML = `
        <div class="log-icon ${type}">
            ${type === 'success' ? '✓' : '✗'}
        </div>
        <div class="log-content">
            <div class="log-title">${message}</div>
            <div class="log-time">${time}</div>
        </div>
    `;

    els.activityLog.insertBefore(log, els.activityLog.firstChild);

    if (els.activityLog.children.length > 50) {
        els.activityLog.removeChild(els.activityLog.lastChild);
    }
}

function validate() {
    let valid = true;

    if (!els.cookie.value.trim()) {
        showError(els.cookieError, 'Cookie is required');
        valid = false;
    }

    if (!els.link.value.trim()) {
        showError(els.linkError, 'Post URL is required');
        valid = false;
    }

    const amount = parseInt(els.amount.value);
    if (!amount || amount < 1 || amount > 1000) {
        showError(els.amountError, 'Amount must be between 1 and 1000');
        valid = false;
    }

    return valid;
}

els.startBtn.addEventListener('click', async () => {
    if (isSharing) return;
    if (!validate()) return;

    const cookie = els.cookie.value.trim();
    const link = els.link.value.trim();
    const amount = parseInt(els.amount.value);
    const delay = parseInt(els.delay.value) * 1000;

    isSharing = true;
    sharesDone = 0;
    totalShares = amount;

    els.startBtn.disabled = true;
    els.startBtn.textContent = 'Sharing...';

    setStatus('Active', true);
    els.postPreview.className = 'post-preview show';
    els.postLink.href = link;
    els.postLink.textContent = link;
    els.progressSection.className = 'progress-section show';

    updateCounter(0, totalShares);
    addLog(`Started sharing session — Target: ${totalShares} shares`, 'success');

    for (let i = 1; i <= amount; i++) {
        if (!isSharing) break;

        const apiUrl = `https://vern-rest-api.vercel.app/api/share?key=&cookie=${encodeURIComponent(cookie)}&link=${encodeURIComponent(link)}&limit=1`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            sharesDone++;
            updateCounter(sharesDone, totalShares);
            addLog(`Share #${sharesDone} completed successfully`, 'success');

        } catch (error) {
            addLog(`Share #${i} failed — ${error.message}`, 'error');
        }

        if (i < amount) await new Promise(r => setTimeout(r, delay));
    }

    isSharing = false;
    setStatus('Completed', false);
    els.startBtn.disabled = false;
    els.startBtn.textContent = 'Start Sharing';
    addLog(`Session completed — Total shares: ${sharesDone}/${totalShares}`, 'success');
});
