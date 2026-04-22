import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { roomsApi } from '../api'
import { Room, RoomEvent, Track } from 'livekit-client'

export default function JoinRoom() {
    const { inviteCode } = useParams()
    const [name, setName]         = useState('')
    const [session, setSession]   = useState(null)
    const [loading, setLoading]   = useState(false)
    const [error, setError]       = useState(null)

    const handleJoin = async () => {
        if (!name.trim()) return
        setLoading(true)
        setError(null)
        try {
            const res = await roomsApi.join(inviteCode, name)
            setSession({ token: res.data.token, url: res.data.url })
        } catch (e) {
            setError('Не може да се приклучи — собата можеби не постои или е завршена.')
        } finally {
            setLoading(false)
        }
    }

    if (session) {
        return <VideoRoom token={session.token} url={session.url} name={name} inviteCode={inviteCode} />
    }

    return (
        <div style={{
            minHeight: '100vh', background: '#f4f6f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: 'white', borderRadius: 16, padding: 36,
                width: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}>
                <div style={{ marginBottom: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>
                        <span style={{ color: '#185FA5' }}>meet</span>flow
                    </div>
                    <div style={{ fontSize: 14, color: '#9ca3af' }}>Приклучи се на состанокот</div>
                </div>

                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, fontFamily: 'monospace' }}>
                    {inviteCode}
                </div>

                <input
                    placeholder="Твоето име"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    autoFocus
                />

                {error && (
                    <div style={{
                        background: '#FCEBEB', color: '#A32D2D',
                        borderRadius: 8, padding: '10px 14px',
                        fontSize: 13, marginBottom: 12
                    }}>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleJoin}
                    disabled={loading || !name.trim()}
                    style={{
                        width: '100%', padding: 11,
                        background: loading || !name.trim() ? '#9ca3af' : '#185FA5',
                        color: 'white', border: 'none', borderRadius: 8,
                        fontSize: 14, cursor: loading || !name.trim() ? 'not-allowed' : 'pointer'
                    }}>
                    {loading ? 'Поврзување...' : 'Приклучи се'}
                </button>
            </div>
        </div>
    )
}

function VideoRoom({ token, url, name, inviteCode }) {
    const localVideoRef  = useRef(null)
    const remotesDivRef  = useRef(null)
    const roomRef        = useRef(null)
    const [muted, setMuted]   = useState(false)
    const [camOff, setCamOff] = useState(false)
    const [left, setLeft]     = useState(false)
    const [joined, setJoined] = useState(false)
    const [error, setError]   = useState(null)

    useEffect(() => {
        const lkRoom = new Room()
        roomRef.current = lkRoom

        lkRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
            if (track.kind === Track.Kind.Video) {
                const videoEl = document.createElement('video')
                videoEl.autoplay = true
                videoEl.playsInline = true
                videoEl.style.cssText = 'width:100%;border-radius:12px;background:#1f2937'
                track.attach(videoEl)

                const wrapper = document.createElement('div')
                wrapper.id = `participant-${participant.identity}`
                wrapper.style.cssText = 'position:relative;background:#1f2937;border-radius:12px;overflow:hidden'

                const label = document.createElement('div')
                label.textContent = participant.identity
                label.style.cssText = 'position:absolute;bottom:8px;left:10px;font-size:12px;color:white;background:rgba(0,0,0,0.5);padding:2px 8px;border-radius:4px'

                wrapper.appendChild(videoEl)
                wrapper.appendChild(label)
                remotesDivRef.current?.appendChild(wrapper)
            } else if (track.kind === Track.Kind.Audio) {
                const audioEl = document.createElement('audio')
                audioEl.autoplay = true
                track.attach(audioEl)
                audioEl.id = `audio-${participant.identity}`
                document.body.appendChild(audioEl)
            }
        })

        lkRoom.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
            if (track.kind === Track.Kind.Video) {
                document.getElementById(`participant-${participant.identity}`)?.remove()
            } else if (track.kind === Track.Kind.Audio) {
                document.getElementById(`audio-${participant.identity}`)?.remove()
            }
        })

        lkRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
            document.getElementById(`participant-${participant.identity}`)?.remove()
            document.getElementById(`audio-${participant.identity}`)?.remove()
        })

        lkRoom.on(RoomEvent.Disconnected, () => {
            setError('Врската со собата е прекината.')
            setJoined(false)
        })

        const connect = async () => {
            try {
                await lkRoom.connect(url, token)
                setJoined(true)

                await lkRoom.localParticipant.enableCameraAndMicrophone()

                const cameraPub = lkRoom.localParticipant.getTrackPublication(Track.Source.Camera)
                if (cameraPub?.track && localVideoRef.current) {
                    cameraPub.track.attach(localVideoRef.current)
                }
            } catch (e) {
                console.error('LiveKit connect error:', e)
                setError('Не може да се поврзе на видео собата: ' + e.message)
            }
        }

        connect()

        return () => {
            lkRoom.disconnect()
        }
    }, [token, url])

    const toggleMute = async () => {
        await roomRef.current?.localParticipant.setMicrophoneEnabled(muted)
        setMuted(!muted)
    }

    const toggleCam = async () => {
        await roomRef.current?.localParticipant.setCameraEnabled(camOff)
        setCamOff(!camOff)
    }

    const leaveRoom = async () => {
        await roomRef.current?.disconnect()
        setLeft(true)
    }

    if (left) {
        return (
            <div style={{
                minHeight: '100vh', background: '#f4f6f9',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 16
            }}>
                <div style={{ fontSize: 22, fontWeight: 500 }}>
                    <span style={{ color: '#185FA5' }}>meet</span>flow
                </div>
                <div style={{ fontSize: 16, color: '#6b7280' }}>Го напуштивте состанокот.</div>
                <button onClick={() => window.location.reload()} style={{
                    padding: '10px 24px', background: '#185FA5',
                    color: 'white', border: 'none', borderRadius: 8,
                    fontSize: 14, cursor: 'pointer'
                }}>
                    Врати се
                </button>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: '#111827', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 24px',
                background: 'rgba(255,255,255,0.05)',
                borderBottom: '0.5px solid rgba(255,255,255,0.08)'
            }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'white' }}>
                    <span style={{ color: '#378ADD' }}>meet</span>flow
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                    {inviteCode}
                </div>
                <div style={{
                    fontSize: 13, color: 'rgba(255,255,255,0.7)',
                    background: joined ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.08)',
                    padding: '5px 12px', borderRadius: 20,
                    border: joined ? '0.5px solid rgba(29,158,117,0.4)' : 'none'
                }}>
                    {joined ? '● Поврзан' : 'Поврзување...'} · {name}
                </div>
            </div>

            {error && (
                <div style={{ background: '#7F1D1D', color: '#FCA5A5', padding: '12px 24px', fontSize: 13 }}>
                    {error}
                </div>
            )}

            {/* Video grid */}
            <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Local video */}
                <div style={{ position: 'relative', maxWidth: 480, borderRadius: 12, overflow: 'hidden', background: '#1f2937' }}>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{ width: '100%', display: 'block', borderRadius: 12 }}
                    />
                    <div style={{
                        position: 'absolute', bottom: 8, left: 10,
                        fontSize: 12, color: 'white',
                        background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 4
                    }}>
                        {name} (ти)
                    </div>
                </div>

                {/* Remote participants */}
                <div
                    ref={remotesDivRef}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}
                />

            </div>

            {/* Controls */}
            <div style={{
                padding: '20px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                background: 'rgba(255,255,255,0.03)',
                borderTop: '0.5px solid rgba(255,255,255,0.06)'
            }}>
                <button onClick={toggleMute} style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: muted ? '#7F1D1D' : 'rgba(255,255,255,0.1)',
                    border: 'none', cursor: 'pointer', fontSize: 20
                }}>
                    {muted ? '🔇' : '🎤'}
                </button>

                <button onClick={toggleCam} style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: camOff ? '#7F1D1D' : 'rgba(255,255,255,0.1)',
                    border: 'none', cursor: 'pointer', fontSize: 20
                }}>
                    {camOff ? '📵' : '📹'}
                </button>

                <button onClick={leaveRoom} style={{
                    padding: '14px 28px', borderRadius: 26,
                    background: '#991B1B', color: 'white',
                    border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 500
                }}>
                    Напушти
                </button>
            </div>
        </div>
    )
}
