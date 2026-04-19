import axios from 'axios'

const index = axios.create({
    baseURL: 'http://localhost:8080/api'
})

export const contactsApi = {
    getAll: (params) => index.get('/contacts', { params }),
    getById: (id) => index.get(`/contacts/${id}`),
    create: (params) => index.post('/contacts', null, { params }),
    update: (id, params) => index.put(`/contacts/${id}`, null, { params }),
    updateStatus: (id, status) => index.patch(`/contacts/${id}/status`, null, { params: { status } }),
    delete: (id) => index.delete(`/contacts/${id}`)
}

export const meetingsApi = {
    getAll: (params) => index.get('/meetings', { params }),
    getToday: () => index.get('/meetings/today'),
    getById: (id) => index.get(`/meetings/${id}`),
    create: (params) => index.post('/meetings', null, { params }),
    update: (id, params) => index.put(`/meetings/${id}`, null, { params }),
    start: (id, params) => index.post(`/meetings/${id}/start`, null, { params }),
    end: (id) => index.post(`/meetings/${id}/end`),
    cancel: (id) => index.post(`/meetings/${id}/cancel`),
    delete: (id) => index.delete(`/meetings/${id}`)
}

export const roomsApi = {
    getAll: () => index.get('/rooms'),
    getActive: () => index.get('/rooms/active'),
    getById: (id) => index.get(`/rooms/${id}`),
    create: (params) => index.post('/rooms', null, { params }),
    end: (id) => index.post(`/rooms/${id}/end`),
    delete: (id) => index.delete(`/rooms/${id}`),
    join: (inviteCode, participantId) => index.post(`/rooms/join/${inviteCode}`, null, { params: { participantId } })
}

export const notesApi = {
    getByMeeting: (meetingId) => index.get(`/meetings/${meetingId}/notes`),
    create: (meetingId, params) => index.post(`/meetings/${meetingId}/notes`, null, { params }),
    update: (meetingId, noteId, content) => index.put(`/meetings/${meetingId}/notes/${noteId}`, null, { params: { content } }),
    delete: (meetingId, noteId) => index.delete(`/meetings/${meetingId}/notes/${noteId}`)
}