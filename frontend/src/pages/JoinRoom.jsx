import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { roomsApi, chatApi, roomNoteApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { Room, RoomEvent, Track } from 'livekit-client'

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ toasts }) {
    return (
        <div style={{
            position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 100,
            pointerEvents: 'none'
        }}>
            {toasts.map(t => (
                <div key={t.id} style={{
                    background: 'rgba(30,30,40,0.92)', color: 'white',
                    padding: '9px 18px', borderRadius: 20,
                    fontSize: 13, backdropFilter: 'blur(8px)',
                    border: '0.5px solid rgba(255,255,255,0.12)',
                    animation: 'fadeInUp 0.2s ease'
                }}>
                    {t.message}
                </div>
            ))}
        </div>
    )
}


/* ─── Post-call screen ───────────────────────────────────── */
function PostCallScreen({ inviteCode, onRejoin }) {
    const navigate = useNavigate()
    return (
        <div style={{
            minHeight: '100vh', background: '#f4f6f9',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16
        }}>
            <div style={{ fontSize: 22, fontWeight: 500 }}>
                <span style={{ color: '#185FA5' }}>hud</span>dle
            </div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Го напуштивте повикот</div>
            <div style={{ fontSize: 14, color: '#9ca3af' }}>Надеваме се дека состанокот беше продуктивен!</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => navigate('/')} style={{
                    padding: '11px 24px', background: '#185FA5',
                    color: 'white', border: 'none', borderRadius: 8,
                    fontSize: 14, cursor: 'pointer', fontWeight: 500
                }}>
                    Кон Dashboard
                </button>
                <button onClick={onRejoin} style={{
                    padding: '11px 24px', background: 'white',
                    color: '#185FA5', border: '1.5px solid #185FA5', borderRadius: 8,
                    fontSize: 14, cursor: 'pointer', fontWeight: 500
                }}>
                    Повторно приклучи се
                </button>
            </div>
        </div>
    )
}

/* ─── Confirm dialog ─────────────────────────────────────── */
function ConfirmLeave({ onConfirm, onCancel }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
        }}>
            <div style={{
                background: 'white', borderRadius: 16, padding: 28,
                width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Напушти повик?</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                    Дали сте сигурни дека сакате да го напуштите состанокот?
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={onCancel} style={{
                        padding: '9px 20px', background: '#f4f6f9',
                        border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer'
                    }}>Откажи</button>
                    <button onClick={onConfirm} style={{
                        padding: '9px 20px', background: '#991B1B',
                        color: 'white', border: 'none', borderRadius: 8,
                        fontSize: 13, cursor: 'pointer', fontWeight: 500
                    }}>Напушти</button>
                </div>
            </div>
        </div>
    )
}

/* ─── Main export ────────────────────────────────────────── */
export default function JoinRoom() {
    const { inviteCode } = useParams()
    const { user } = useAuth()
    const [session, setSession] = useState(null)
    const [error, setError]     = useState(null)
    const [left, setLeft]       = useState(false)

    const displayName = user ? `${user.firstName} ${user.lastName}` : null
    const identity    = user?.username || displayName

    const doJoin = useCallback(async (name) => {
        if (!name?.trim()) return
        setError(null)
        try {
            const res = await roomsApi.join(inviteCode, identity, name)
            setSession({ token: res.data.token, url: res.data.url, name, roomId: res.data.roomId })
        } catch {
            setError('Не може да се приклучи — собата можеби не постои или е завршена.')
        }
    }, [inviteCode, identity])

    useEffect(() => {
        if (!user) return
        // If this tab was opened by the host, use the pre-stored token directly
        const hostKey = `huddle_host_${inviteCode}`
        const raw = localStorage.getItem(hostKey)
        if (raw) {
            try {
                const { token, url, roomId, name } = JSON.parse(raw)
                localStorage.removeItem(hostKey)
                setSession({ token, url, name, roomId })
                return
            } catch {}
        }
        doJoin(displayName)
    }, [user])

    // Redirect unauthenticated users to login, then back here
    if (!user) {
        return <Navigate to={`/login?redirect=/join/${inviteCode}`} replace />
    }

    if (left) return <PostCallScreen inviteCode={inviteCode} onRejoin={() => {
        setLeft(false)
        setSession(null)
        doJoin(displayName)
    }} />

    if (session) return (
        <VideoRoom
            token={session.token}
            url={session.url}
            name={session.name}
            roomId={session.roomId}
            inviteCode={inviteCode}
            onLeave={() => setLeft(true)}
        />
    )

    return (
        <div style={{
            minHeight: '100vh', background: '#f4f6f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {error ? (
                <div style={{
                    background: 'white', borderRadius: 16, padding: 32,
                    width: 380, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>
                        <span style={{ color: '#185FA5' }}>hud</span>dle
                    </div>
                    <div style={{ color: '#A32D2D', marginBottom: 16 }}>{error}</div>
                    <button onClick={() => doJoin(displayName)} className="btn btn-primary">
                        Обиди се повторно
                    </button>
                </div>
            ) : (
                <div style={{ color: '#6b7280', fontSize: 14 }}>Поврзување...</div>
            )}
        </div>
    )
}

/* ─── VideoRoom ──────────────────────────────────────────── */
function VideoRoom({ token, url, name, roomId, inviteCode, onLeave }) {
    const localVideoRef = useRef(null)
    const roomRef       = useRef(null)
    const chatEndRef    = useRef(null)

    const [muted, setMuted]           = useState(false)
    const [camOff, setCamOff]         = useState(false)
    const [screenSharing, setScreenSharing] = useState(false)
    const [joined, setJoined]         = useState(false)
    const [error, setError]           = useState(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const [toasts, setToasts]         = useState([])
    const [participants, setParticipants] = useState([])
    const [remoteParticipants, setRemoteParticipants] = useState([])
    const [rightTab, setRightTab]     = useState('participants')
    const [chatMessages, setChatMessages] = useState([])
    const [chatInput, setChatInput]   = useState('')
    const [noteText, setNoteText]     = useState('')
    const [noteSaved, setNoteSaved]   = useState(false)
    const remotesDivRef = useRef(null)
    const noteDebounceRef = useRef(null)

    const addToast = useCallback((message) => {
        const id = Date.now()
        setToasts(t => [...t, { id, message }])
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
    }, [])

    const syncParticipants = useCallback((room) => {
        const list = []
        room.remoteParticipants.forEach(p => {
            list.push({ identity: p.identity, connected: true })
        })
        setRemoteParticipants([...list])
        setParticipants([{ identity: name, self: true }, ...list])
    }, [name])

    useEffect(() => {
        const lkRoom = new Room({
            audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true },
            videoCaptureDefaults: { resolution: { width: 1280, height: 720 } }
        })
        roomRef.current = lkRoom

        lkRoom.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
            if (track.kind === Track.Kind.Video) {
                const existing = document.getElementById(`video-${participant.identity}`)
                if (existing) { track.attach(existing); return }

                const videoEl = document.createElement('video')
                videoEl.id = `video-${participant.identity}`
                videoEl.autoplay = true
                videoEl.playsInline = true
                videoEl.style.cssText = 'width:100%;height:100%;object-fit:cover;'
                track.attach(videoEl)

                const wrapper = document.createElement('div')
                wrapper.id = `tile-${participant.identity}`
                wrapper.style.cssText = 'position:relative;background:#1f2937;border-radius:12px;overflow:hidden;aspect-ratio:16/9;'

                const label = document.createElement('div')
                label.textContent = participant.identity
                label.style.cssText = 'position:absolute;bottom:8px;left:10px;font-size:12px;color:white;background:rgba(0,0,0,0.55);padding:3px 10px;border-radius:20px;'

                wrapper.appendChild(videoEl)
                wrapper.appendChild(label)
                remotesDivRef.current?.appendChild(wrapper)
            } else if (track.kind === Track.Kind.Audio) {
                const audioEl = document.createElement('audio')
                audioEl.autoplay = true
                audioEl.id = `audio-${participant.identity}`
                track.attach(audioEl)
                document.body.appendChild(audioEl)
            }
        })

        lkRoom.on(RoomEvent.TrackUnsubscribed, (track, _pub, participant) => {
            if (track.kind === Track.Kind.Video) {
                document.getElementById(`tile-${participant.identity}`)?.remove()
            } else if (track.kind === Track.Kind.Audio) {
                document.getElementById(`audio-${participant.identity}`)?.remove()
            }
        })

        lkRoom.on(RoomEvent.ParticipantConnected, (participant) => {
            addToast(`${participant.identity} се приклучи`)
            syncParticipants(lkRoom)
        })

        lkRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
            document.getElementById(`tile-${participant.identity}`)?.remove()
            document.getElementById(`audio-${participant.identity}`)?.remove()
            addToast(`${participant.identity} ја напушти собата`)
            syncParticipants(lkRoom)
        })

        lkRoom.on(RoomEvent.Disconnected, () => {
            setError('Врската со собата е прекината.')
            setJoined(false)
        })

        lkRoom.on(RoomEvent.DataReceived, (payload) => {
            try {
                const msg = JSON.parse(new TextDecoder().decode(payload))
                if (msg.type === 'chat') {
                    setChatMessages(prev => [...prev, msg])
                } else if (msg.type === 'note') {
                    setNoteText(msg.content)
                }
            } catch {}
        })

        const connect = async () => {
            // Step 1: connect to LiveKit signal server — fatal if this fails
            try {
                await lkRoom.connect(url, token)
            } catch (e) {
                setError('Could not connect to the room: ' + e.message)
                return
            }
            setJoined(true)
            syncParticipants(lkRoom)

            // Step 2: acquire camera + mic — non-fatal (permission may be denied in incognito)
            try {
                await lkRoom.localParticipant.enableCameraAndMicrophone()
                const camPub = lkRoom.localParticipant.getTrackPublication(Track.Source.Camera)
                if (camPub?.track && localVideoRef.current) {
                    camPub.track.attach(localVideoRef.current)
                }
            } catch {
                addToast('Camera / microphone not available — joined in listen-only mode')
                setCamOff(true)
                setMuted(true)
            }

            // Step 3: load persisted chat + notes
            if (roomId) {
                chatApi.getMessages(roomId).then(r => setChatMessages(
                    r.data.map(m => ({ type: 'chat', sender: m.sender, content: m.content, sentAt: m.sentAt }))
                )).catch(() => {})
                roomNoteApi.getNote(roomId).then(r => {
                    if (r.data?.content) setNoteText(r.data.content)
                }).catch(() => {})
            }
        }

        connect()

        return () => { lkRoom.disconnect() }
    }, [token, url])

    const toggleMute = async () => {
        const enabled = muted
        await roomRef.current?.localParticipant.setMicrophoneEnabled(enabled)
        setMuted(!enabled)
    }

    const toggleCam = async () => {
        const room = roomRef.current
        if (!room) return
        if (camOff) {
            const pub = await room.localParticipant.setCameraEnabled(true)
            if (pub?.track && localVideoRef.current) {
                pub.track.attach(localVideoRef.current)
            }
            setCamOff(false)
        } else {
            await room.localParticipant.setCameraEnabled(false)
            setCamOff(true)
        }
    }

    const sendChat = async () => {
        const content = chatInput.trim()
        if (!content || !roomRef.current) return
        const msg = { type: 'chat', sender: name, content, sentAt: new Date().toISOString() }
        const data = new TextEncoder().encode(JSON.stringify(msg))
        await roomRef.current.localParticipant.publishData(data, { reliable: true })
        setChatMessages(prev => [...prev, msg])
        setChatInput('')
        if (roomId) chatApi.sendMessage(roomId, name, content).catch(() => {})
    }

    const broadcastNote = (content) => {
        if (!roomRef.current) return
        const msg = { type: 'note', content, updatedBy: name }
        const data = new TextEncoder().encode(JSON.stringify(msg))
        roomRef.current.localParticipant.publishData(data, { reliable: true }).catch(() => {})
    }

    const handleNoteChange = (val) => {
        setNoteText(val)
        clearTimeout(noteDebounceRef.current)
        noteDebounceRef.current = setTimeout(() => broadcastNote(val), 500)
    }

    const saveNote = async () => {
        if (!roomId) return
        await roomNoteApi.saveNote(roomId, noteText, name).catch(() => {})
        setNoteSaved(true)
        setTimeout(() => setNoteSaved(false), 2000)
    }

    const toggleScreen = async () => {
        if (!screenSharing) {
            await roomRef.current?.localParticipant.setScreenShareEnabled(true)
            setScreenSharing(true)
        } else {
            await roomRef.current?.localParticipant.setScreenShareEnabled(false)
            setScreenSharing(false)
        }
    }

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatMessages])

    const remoteCount = remoteParticipants.length
    const gridStyle = remoteCount === 1
        ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }
        : remoteCount >= 2
        ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, flex: 1 }
        : { display: 'grid', gap: 12, flex: 1 }

    return (
        <div style={{
            width: '100vw', height: '100vh', background: '#111827',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px', flexShrink: 0,
                background: 'rgba(255,255,255,0.04)',
                borderBottom: '0.5px solid rgba(255,255,255,0.07)'
            }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>
                    <span style={{ color: '#378ADD' }}>hud</span>dle
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
                    {inviteCode}
                </div>
                <div style={{
                    fontSize: 12, color: joined ? '#34d399' : 'rgba(255,255,255,0.5)',
                    background: joined ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.06)',
                    padding: '4px 12px', borderRadius: 20,
                    border: joined ? '0.5px solid rgba(52,211,153,0.3)' : 'none'
                }}>
                    {joined ? '● Поврзан' : 'Поврзување...'} · {name}
                </div>
            </div>

            {error && (
                <div style={{ background: '#7F1D1D', color: '#FCA5A5', padding: '10px 20px', fontSize: 13, flexShrink: 0 }}>
                    {error}
                </div>
            )}

            {/* Body */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Video area */}
                <div style={{ flex: 1, position: 'relative', padding: 16, display: 'flex', flexDirection: 'column' }}>

                    {/* Remote grid */}
                    <div ref={remotesDivRef} style={gridStyle} />

                    {/* Local PiP */}
                    <div style={{
                        position: 'absolute', bottom: 24, right: 24,
                        width: 180, borderRadius: 12, overflow: 'hidden',
                        background: '#1f2937', border: '2px solid rgba(255,255,255,0.15)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                    }}>
                        <video
                            ref={localVideoRef}
                            autoPlay muted playsInline
                            style={{ width: '100%', display: 'block' }}
                        />
                        <div style={{
                            position: 'absolute', bottom: 6, left: 8,
                            fontSize: 11, color: 'white',
                            background: 'rgba(0,0,0,0.55)', padding: '2px 8px', borderRadius: 20
                        }}>
                            {name} (ти)
                        </div>
                    </div>
                </div>

                {/* Right panel */}
                <div style={{
                    width: 280, background: 'rgba(255,255,255,0.04)',
                    borderLeft: '0.5px solid rgba(255,255,255,0.07)',
                    display: 'flex', flexDirection: 'column', flexShrink: 0
                }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
                        {['chat', 'participants', 'notes'].map(tab => (
                            <button key={tab} onClick={() => setRightTab(tab)} style={{
                                flex: 1, padding: '10px 0', background: 'transparent', border: 'none',
                                color: rightTab === tab ? '#378ADD' : 'rgba(255,255,255,0.4)',
                                fontSize: 11, fontWeight: rightTab === tab ? 600 : 400,
                                cursor: 'pointer', borderBottom: rightTab === tab ? '2px solid #378ADD' : '2px solid transparent'
                            }}>
                                {tab === 'chat' ? 'Чет' : tab === 'participants' ? 'Учесници' : 'Белешки'}
                            </button>
                        ))}
                    </div>

                    {/* Chat tab */}
                    {rightTab === 'chat' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {chatMessages.length === 0 && (
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 20 }}>
                                        Нема пораки уште
                                    </div>
                                )}
                                {chatMessages.map((m, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === name ? 'flex-end' : 'flex-start' }}>
                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>
                                            {m.sender === name ? 'Ти' : m.sender}
                                        </div>
                                        <div style={{
                                            background: m.sender === name ? '#185FA5' : 'rgba(255,255,255,0.1)',
                                            color: 'white', borderRadius: m.sender === name ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                            padding: '7px 10px', fontSize: 12, maxWidth: '85%', wordBreak: 'break-word'
                                        }}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <div style={{ padding: '8px 10px', borderTop: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', gap: 6 }}>
                                <input
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                                    placeholder="Напиши порака..."
                                    style={{
                                        flex: 1, background: 'rgba(255,255,255,0.08)',
                                        border: '0.5px solid rgba(255,255,255,0.12)',
                                        borderRadius: 8, color: 'white', fontSize: 12, padding: '7px 10px',
                                        outline: 'none'
                                    }}
                                />
                                <button onClick={sendChat} disabled={!chatInput.trim()} style={{
                                    padding: '7px 12px', background: chatInput.trim() ? '#185FA5' : 'rgba(255,255,255,0.06)',
                                    border: 'none', borderRadius: 8, color: 'white', fontSize: 12,
                                    cursor: chatInput.trim() ? 'pointer' : 'not-allowed'
                                }}>→</button>
                            </div>
                        </div>
                    )}

                    {/* Participants tab */}
                    {rightTab === 'participants' && (
                        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                                {participants.length} учесник(и)
                            </div>
                            {participants.map(p => (
                                <div key={p.identity} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '8px 4px', borderBottom: '0.5px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: '#185FA5', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 600, flexShrink: 0
                                    }}>
                                        {p.identity?.[0]?.toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, color: 'white' }}>
                                            {p.identity} {p.self ? '(ти)' : ''}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#34d399' }}>● Поврзан</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Notes tab (collaborative) */}
                    {rightTab === 'notes' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 12, gap: 8 }}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                                Заеднички белешки · синхронизирани во живо
                            </div>
                            <textarea
                                value={noteText}
                                onChange={e => handleNoteChange(e.target.value)}
                                placeholder="Запишете белешки тука — сите учесници ги гледаат во живо..."
                                style={{
                                    flex: 1, background: 'rgba(255,255,255,0.06)',
                                    border: '0.5px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8, color: 'white', fontSize: 13,
                                    padding: 10, resize: 'none', outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <button
                                onClick={saveNote}
                                style={{
                                    padding: '8px 0', background: '#185FA5',
                                    color: 'white', border: 'none', borderRadius: 8,
                                    fontSize: 12, cursor: 'pointer'
                                }}>
                                {noteSaved ? '✓ Зачувано' : 'Зачувај белешки'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div style={{
                padding: '14px 24px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: 'rgba(0,0,0,0.4)', borderTop: '0.5px solid rgba(255,255,255,0.06)'
            }}>
                <CtrlBtn active={muted} onClick={toggleMute} danger={muted} title={muted ? 'Вклучи микрофон' : 'Исклучи микрофон'}>
                    {muted ? <MicOffIcon /> : <MicIcon />}
                </CtrlBtn>
                <CtrlBtn active={camOff} onClick={toggleCam} danger={camOff} title={camOff ? 'Вклучи камера' : 'Исклучи камера'}>
                    {camOff ? <CamOffIcon /> : <CamIcon />}
                </CtrlBtn>
                <CtrlBtn active={screenSharing} onClick={toggleScreen} title="Сподели екран">
                    <ScreenIcon />
                </CtrlBtn>
                <button
                    onClick={() => setShowConfirm(true)}
                    title="Напушти повик"
                    style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: '#991B1B', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white'
                    }}>
                    <PhoneOffIcon />
                </button>
            </div>

            {showConfirm && (
                <ConfirmLeave
                    onConfirm={async () => {
                        await roomRef.current?.disconnect()
                        setShowConfirm(false)
                        onLeave()
                    }}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            <Toast toasts={toasts} />
        </div>
    )
}

/* ─── Control button ─────────────────────────────────────── */
function CtrlBtn({ children, onClick, danger, active, title }) {
    return (
        <button onClick={onClick} title={title} style={{
            width: 52, height: 52, borderRadius: '50%',
            background: danger ? '#7F1D1D' : active ? 'rgba(56,130,221,0.2)' : 'rgba(255,255,255,0.1)',
            border: active && !danger ? '1.5px solid #378ADD' : 'none',
            cursor: 'pointer', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s'
        }}>
            {children}
        </button>
    )
}

/* ─── SVG Icons ──────────────────────────────────────────── */
const MicIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 9v-2.07A7.001 7.001 0 0019 11h-2a5 5 0 01-10 0H5a7.001 7.001 0 007 6.93V20H9v2h6v-2h-3z"/></svg>
const MicOffIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/></svg>
const CamIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
const CamOffIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/></svg>
const ScreenIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v2h12v-2l-1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z"/></svg>
const PhoneOffIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.76 14.37l-4.72-4.72c-.28-.28-.67-.37-1.03-.25l-4.01 1.34c-.32.11-.56.37-.65.69l-.72 2.59c-2.33-.62-5.07-2.41-6.3-4.94l2.52-.84c.32-.11.56-.38.64-.71l1-4.11c.08-.34-.03-.69-.29-.92L5.52.24C5.24-.02 4.84-.07 4.5.1L.58 2.29C.23 2.48 0 2.84 0 3.24c.28 10.32 8.99 18.87 19.27 18.76.41 0 .77-.25.94-.62l2.18-4.01c.17-.33.13-.74-.13-1z"/></svg>
