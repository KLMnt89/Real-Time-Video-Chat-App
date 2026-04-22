import { useEffect, useState } from 'react'
import { meetingsApi, contactsApi, roomsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'

export default function Dashboard() {
    const { user } = useAuth()
    const [todayMeetings, setTodayMeetings]   = useState([])
    const [contacts, setContacts]             = useState([])
    const [activeRooms, setActiveRooms]       = useState([])
    const [generatedLink, setGeneratedLink]   = useState('')
    const [generatedRoom, setGeneratedRoom]   = useState(null)
    const [copied, setCopied]                 = useState(false)
    const [loading, setLoading]               = useState(false)
    const [fetchLoading, setFetchLoading]     = useState(true)
    const [fetchError, setFetchError]         = useState(null)
    const [genError, setGenError]             = useState(null)

    useEffect(() => {
        setFetchLoading(true)
        Promise.all([
            meetingsApi.getToday(),
            contactsApi.getAll(),
            roomsApi.getActive()
        ]).then(([m, c, r]) => {
            setTodayMeetings(m.data)
            setContacts(c.data)
            setActiveRooms(r.data)
        }).catch(() => setFetchError('Грешка при вчитување на податоците'))
          .finally(() => setFetchLoading(false))
    }, [])

    const generateLink = async () => {
        setLoading(true)
        try {
            const now = new Date()
            const hh = String(now.getHours()).padStart(2, '0')
            const mm = String(now.getMinutes()).padStart(2, '0')
            const res = await roomsApi.create({
                name: `Соба ${hh}:${mm}`,
                createdBy: user ? `${user.firstName} ${user.lastName}` : 'admin'
            })
            const room = res.data
            const link = `${window.location.origin}/join/${room.inviteCode}`
            setGeneratedLink(link)
            setGeneratedRoom(room)
            setCopied(false)
            roomsApi.getActive().then(r => setActiveRooms(r.data))
            window.open(link, '_blank')
        } catch (e) {
            setGenError('Грешка при креирање соба. Проверете дали серверот е активен.')
        } finally {
            setLoading(false)
        }
    }

    const copyLink = () => {
        navigator.clipboard.writeText(generatedLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const statusBadge = (s) => {
        const map   = { ACTIVE: 'badge-active', SCHEDULED: 'badge-scheduled', ENDED: 'badge-ended', CANCELLED: 'badge-cancelled' }
        const label = { ACTIVE: 'Live', SCHEDULED: 'Закажан', ENDED: 'Завршен', CANCELLED: 'Откажан' }
        return <span className={`badge ${map[s]}`}>{label[s]}</span>
    }

    const statusContact = (s) => {
        const map   = { ONLINE: 'badge-online', BUSY: 'badge-busy', OFFLINE: 'badge-offline' }
        const label = { ONLINE: 'онлајн', BUSY: 'зафатен', OFFLINE: 'офлајн' }
        return <span className={`badge ${map[s]}`}>{label[s]}</span>
    }

    const initials     = (c) => `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`
    const avatarColors = ['#E6F1FB:#0C447C','#EEEDFE:#3C3489','#EAF3DE:#27500A','#FAEEDA:#633806','#FBEAF0:#72243E','#E1F5EE:#085041']
    const avatarColor  = (i) => { const [bg, color] = avatarColors[i % avatarColors.length].split(':'); return { background: bg, color } }

    if (fetchLoading) return (
        <div className="main-content">
            <TopBar title="Dashboard" />
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                <div style={{ color: '#9ca3af', fontSize: 14 }}>Вчитување...</div>
            </div>
        </div>
    )

    return (
        <div className="main-content">
            <TopBar title="Dashboard" action={
                <button className="btn btn-primary" onClick={generateLink} disabled={loading}>
                    {loading ? 'Креирање...' : '+ Нов состанок'}
                </button>
            } />
            <div className="page">
            {fetchError && (
                <div style={{ background:'#FCEBEB', color:'#A32D2D', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 }}>
                    {fetchError}
                </div>
            )}
            {genError && (
                <div style={{ background:'#FCEBEB', color:'#A32D2D', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 }}>
                    {genError}
                </div>
            )}

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                        { label: 'Активни соби',  val: activeRooms.length,                                        sub: 'во тек',    color: '#185FA5' },
                        { label: 'Денес',         val: todayMeetings.length,                                       sub: 'состаноци', color: '#1a1a2e' },
                        { label: 'Контакти',      val: contacts.length,                                            sub: `${contacts.filter(c => c.status === 'ONLINE').length} онлајн`, color: '#1a1a2e' },
                        { label: 'Активни',       val: todayMeetings.filter(m => m.status === 'ACTIVE').length,   sub: 'во моментов', color: '#1D9E75' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#f4f6f9', borderRadius: 10, padding: '14px 16px' }}>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{s.label}</div>
                            <div style={{ fontSize: 26, fontWeight: 500, color: s.color, lineHeight: 1 }}>{s.val}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{s.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Generate link */}
                <div className="card" style={{ marginBottom: 20, borderColor: '#B5D4F4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: '#185FA5' }}>Генерирај link за состанок</div>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                                Создај нова LiveKit соба и сподели го линкот со учесниците
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={generateLink} disabled={loading}>
                            {loading ? 'Креирање...' : 'Генерирај'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            flex: 1, background: '#f4f6f9', borderRadius: 8,
                            padding: '8px 12px', fontSize: 12,
                            color: generatedLink ? '#1a1a2e' : '#9ca3af',
                            fontFamily: 'monospace'
                        }}>
                            {generatedLink || 'huddle/join/—'}
                        </div>
                        {generatedLink && (
                            <button className="btn btn-sm" onClick={copyLink}>
                                {copied ? '✓ Копирано' : 'Копирај'}
                            </button>
                        )}
                    </div>

                    {/* Mux Space info */}
                    {generatedRoom && (
                        <div style={{
                            marginTop: 10, padding: '8px 12px',
                            background: '#E1F5EE', borderRadius: 8,
                            fontSize: 12, color: '#085041',
                            display: 'flex', gap: 16
                        }}>
                            <span>✓ LiveKit Room креиран</span>
                            <span style={{ fontFamily: 'monospace', opacity: 0.8 }}>
                ID: {generatedRoom.liveKitRoomName}
              </span>
                            <span style={{ fontFamily: 'monospace', opacity: 0.8 }}>
                Code: {generatedRoom.inviteCode}
              </span>
                        </div>
                    )}
                </div>

                {/* Two col */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>Состаноци денес</div>
                        </div>
                        {todayMeetings.length === 0 && (
                            <div style={{ fontSize: 13, color: '#9ca3af' }}>Нема состаноци денес</div>
                        )}
                        {todayMeetings.map(m => (
                            <div key={m.id} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)'
                            }}>
                                <div style={{
                                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                                    background: m.status === 'ACTIVE' ? '#1D9E75' : m.status === 'SCHEDULED' ? '#378ADD' : '#B4B2A9'
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, fontWeight: 500 }}>{m.title}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{m.participants?.length ?? 0} учесници</div>
                                </div>
                                {statusBadge(m.status)}
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Контакти</div>
                        {contacts.slice(0, 5).map((c, i) => (
                            <div key={c.id} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '7px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)'
                            }}>
                                <div className="avatar" style={avatarColor(i)}>{initials(c)}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 500 }}>{c.firstName} {c.lastName}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {c.email}
                                    </div>
                                </div>
                                {statusContact(c.status)}
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    )
}