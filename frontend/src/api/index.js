import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    res => res,
    async err => {
        const original = err.config
        if (err.response?.status === 401 && !original._retry) {
            original._retry = true
            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) {
                // Only force-logout if the user actually had a session
                if (localStorage.getItem('user')) {
                    localStorage.clear()
                    window.location.href = '/login'
                }
                return Promise.reject(err)
            }
            try {
                const res = await axios.post('/api/auth/refresh', { refreshToken })
                const newToken = res.data.token
                localStorage.setItem('token', newToken)
                original.headers['Authorization'] = `Bearer ${newToken}`
                return api(original)
            } catch {
                localStorage.clear()
                window.location.href = '/login'
                return Promise.reject(err)
            }
        }
        return Promise.reject(err)
    }
)

export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login:    (data) => api.post('/auth/login', data),
    logout:   ()     => api.post('/auth/logout', { refreshToken: localStorage.getItem('refreshToken') }),
}

export const usersApi = {
    getMe:    ()     => api.get('/users/me'),
    updateMe: (data) => api.put('/users/me', data),
}

export const contactsApi = {
    getAll:       (params) => api.get('/contacts', { params }),
    getById:      (id)     => api.get(`/contacts/${id}`),
    create:       (params) => api.post('/contacts', null, { params }),
    update:       (id, params) => api.put(`/contacts/${id}`, null, { params }),
    updateStatus: (id, status) => api.patch(`/contacts/${id}/status`, null, { params: { status } }),
    delete:       (id)     => api.delete(`/contacts/${id}`)
}

export const meetingsApi = {
    getAll:  (params) => api.get('/meetings', { params }),
    getToday: ()      => api.get('/meetings/today'),
    getById: (id)     => api.get(`/meetings/${id}`),
    create:  (params) => api.post('/meetings', null, { params }),
    update:  (id, params) => api.put(`/meetings/${id}`, null, { params }),
    start:   (id, params) => api.post(`/meetings/${id}/start`, null, { params }),
    end:     (id)     => api.post(`/meetings/${id}/end`),
    cancel:  (id)     => api.post(`/meetings/${id}/cancel`),
    delete:  (id)     => api.delete(`/meetings/${id}`)
}

export const roomsApi = {
    getAll:    ()     => api.get('/rooms'),
    getActive: ()     => api.get('/rooms/active'),
    getById:   (id)   => api.get(`/rooms/${id}`),
    create:    (params) => api.post('/rooms', null, { params }),
    end:       (id)   => api.post(`/rooms/${id}/end`),
    delete:    (id)   => api.delete(`/rooms/${id}`),
    join:      (inviteCode, participantId, displayName) =>
        api.post(`/rooms/join/${inviteCode}`, null, { params: { participantId, displayName } }),
    getParticipantLogs:  (roomId) => api.get(`/rooms/${roomId}/participant-log`),
    logParticipantLeave: (roomId, participantName) =>
        api.post(`/rooms/${roomId}/participant-log/${encodeURIComponent(participantName)}/leave`),
}

export const chatApi = {
    getMessages: (roomId) => api.get(`/rooms/${roomId}/chat`),
    sendMessage: (roomId, sender, content) =>
        api.post(`/rooms/${roomId}/chat`, null, { params: { sender, content } }),
}

export const roomNoteApi = {
    getNote:  (roomId)                      => api.get(`/rooms/${roomId}/note`),
    saveNote: (roomId, content, updatedBy)  =>
        api.put(`/rooms/${roomId}/note`, null, { params: { content, updatedBy } }),
}

export const groupsApi = {
    getAll:  ()            => api.get('/groups'),
    create:  (data)        => api.post('/groups', data),
    update:  (id, data)    => api.put(`/groups/${id}`, data),
    delete:  (id)          => api.delete(`/groups/${id}`),
}

export const notesApi = {
    getByMeeting: (meetingId)             => api.get(`/meetings/${meetingId}/notes`),
    create:       (meetingId, params)     => api.post(`/meetings/${meetingId}/notes`, null, { params }),
    update:       (meetingId, noteId, content) =>
        api.put(`/meetings/${meetingId}/notes/${noteId}`, null, { params: { content } }),
    delete:       (meetingId, noteId)     => api.delete(`/meetings/${meetingId}/notes/${noteId}`)
}
