const BASE = '/api/meetings'

// ── DOM refs ──────────────────────────────────────────
const titleInput    = document.getElementById('title-input')
const nameInput     = document.getElementById('name-input')
const createBtn     = document.getElementById('create-btn')
const meetingsList  = document.getElementById('meetings-list')
const errorBox      = document.getElementById('error-box')

// ── Helpers ───────────────────────────────────────────
function showError(msg) {
    errorBox.textContent = msg
    errorBox.classList.remove('hidden')
    setTimeout(() => errorBox.classList.add('hidden'), 4000)
}

async function api(url, method = 'GET', params = {}) {
    const fullUrl = new URL(url, window.location.origin)
    Object.entries(params).forEach(([k, v]) => fullUrl.searchParams.append(k, v))
    const res = await fetch(fullUrl, { method })
    if (!res.ok) throw new Error(await res.text())
    if (res.status === 204) return null
    return res.json()
}

// ── Fetch & render meetings ───────────────────────────
async function fetchMeetings() {
    try {
        const meetings = await api(BASE)
        renderMeetings(meetings)
    } catch (e) {
        showError('Failed to load meetings')
    }
}

function renderMeetings(meetings) {
    if (meetings.length === 0) {
        meetingsList.innerHTML = '<p class="empty">No meetings yet. Create one above!</p>'
        return
    }

    meetingsList.innerHTML = meetings.map(m => `
    <div class="meeting-item">
      <div class="meeting-info">
        <strong>${m.title}</strong>
        <div class="meeting-meta">
          By: ${m.createdBy} &nbsp;|&nbsp;
          Status: <span class="${m.status === 'ACTIVE' ? 'status-active' : 'status-ended'}">
            ${m.status}
          </span>
        </div>
        <div class="meeting-code">Invite code: ${m.inviteCode}</div>
      </div>
      <div class="meeting-actions">
        <button class="btn btn-purple" onclick="copyInvite('${m.inviteCode}')">📋 Invite</button>
        ${m.status === 'ACTIVE'
        ? `<button class="btn btn-orange" onclick="endMeeting(${m.id})">⏹ End</button>`
        : ''}
        <button class="btn btn-red" onclick="deleteMeeting(${m.id})">🗑 Delete</button>
      </div>
    </div>
  `).join('')
}

// ── Actions ───────────────────────────────────────────
createBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim()
    const createdBy = nameInput.value.trim()
    if (!title || !createdBy) {
        showError('Please fill in both fields')
        return
    }
    try {
        await api(BASE, 'POST', { title, createdBy })
        titleInput.value = ''
        nameInput.value = ''
        fetchMeetings()
    } catch (e) {
        showError('Failed to create meeting (check Mux credentials)')
    }
})

async function endMeeting(id) {
    try {
        await api(`${BASE}/${id}/end`, 'POST')
        fetchMeetings()
    } catch (e) {
        showError('Failed to end meeting')
    }
}

async function deleteMeeting(id) {
    if (!confirm('Delete this meeting?')) return
    try {
        await api(`${BASE}/${id}`, 'DELETE')
        fetchMeetings()
    } catch (e) {
        showError('Failed to delete meeting')
    }
}

function copyInvite(code) {
    const link = `${window.location.origin}/join/${code}`
    navigator.clipboard.writeText(link)
    alert('✅ Invite link copied:\n' + link)
}

// ── Init ──────────────────────────────────────────────
fetchMeetings()