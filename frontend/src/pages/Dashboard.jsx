import { useEffect, useState, useCallback } from 'react'
import { meetingsApi, contactsApi, roomsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'

// ─── helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
    if (!dateStr) return '—'
    const diff = new Date() - new Date(dateStr)
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

function buildActivity(meetings, rooms) {
    const items = []
    rooms.forEach(r => items.push({ label: `Room "${r.name}" is active`, time: r.createdAt, accent: '#1D9E75', bg: '#E1F5EE' }))
    meetings.filter(m => m.status === 'ACTIVE'    && m.startedAt).forEach(m => items.push({ label: `"${m.title}" started`,   time: m.startedAt,   accent: '#185FA5', bg: '#E6F1FB' }))
    meetings.filter(m => m.status === 'ENDED'     && m.endedAt  ).forEach(m => items.push({ label: `"${m.title}" ended`,     time: m.endedAt,     accent: '#6b7280', bg: '#F1EFE8' }))
    meetings.filter(m => m.status === 'SCHEDULED' && m.scheduledAt).forEach(m => items.push({ label: `"${m.title}" scheduled`, time: m.scheduledAt, accent: '#378ADD', bg: '#E6F1FB' }))
    return items.filter(i => i.time).sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 7)
}

const MEETING_LABEL = { ACTIVE: 'Active', SCHEDULED: 'Scheduled', ENDED: 'Ended', CANCELLED: 'Cancelled' }
const MEETING_CLASS = { ACTIVE: 'badge-active', SCHEDULED: 'badge-scheduled', ENDED: 'badge-ended', CANCELLED: 'badge-cancelled' }
const CONTACT_LABEL = { ONLINE: 'online', BUSY: 'busy', OFFLINE: 'offline' }
const CONTACT_CLASS = { ONLINE: 'badge-online', BUSY: 'badge-busy', OFFLINE: 'badge-offline' }
const AVATAR_PALETTE = ['#E6F1FB:#0C447C','#EEEDFE:#3C3489','#EAF3DE:#27500A','#FAEEDA:#633806','#FBEAF0:#72243E','#E1F5EE:#085041']

// ─── sub-components ──────────────────────────────────────────────────────────

function Toast({ toasts }) {
    return (
        <div style={{ position:'fixed', bottom:24, right:24, display:'flex', flexDirection:'column', gap:8, zIndex:1000, pointerEvents:'none' }}>
            {toasts.map(t => (
                <div key={t.id} style={{ background:'#1a1a2e', color:'white', padding:'10px 16px', borderRadius:10, fontSize:13, boxShadow:'0 4px 16px rgba(0,0,0,0.18)', animation:'slideIn 0.2s ease' }}>
                    {t.message}
                </div>
            ))}
        </div>
    )
}

function SectionLabel({ children }) {
    return (
        <div style={{ fontSize:10, fontWeight:700, color:'#b0b0b0', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12, marginTop:4 }}>
            {children}
        </div>
    )
}

function CardTitle({ children, accent = '#185FA5', action }) {
    return (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:3, height:14, borderRadius:2, background:accent, flexShrink:0 }} />
                <span style={{ fontSize:13, fontWeight:600, color:'#1a1a2e' }}>{children}</span>
            </div>
            {action}
        </div>
    )
}

function EmptyState({ text }) {
    return <div style={{ fontSize:12, color:'#b0b0b0', padding:'6px 0' }}>{text}</div>
}

function MiniCalendar({ meetings, onDaySelect, selectedDay }) {
    const [view, setView] = useState(new Date())
    const year = view.getFullYear()
    const mo   = view.getMonth()

    const firstDay   = new Date(year, mo, 1).getDay()
    const daysInMo   = new Date(year, mo + 1, 0).getDate()
    const offset     = firstDay === 0 ? 6 : firstDay - 1

    const meetingDays = new Set(
        meetings.filter(m => m.scheduledAt).map(m => {
            const d = new Date(m.scheduledAt)
            return d.getFullYear() === year && d.getMonth() === mo ? d.getDate() : null
        }).filter(Boolean)
    )

    const today      = new Date()
    const isToday    = d => d === today.getDate() && year === today.getFullYear() && mo === today.getMonth()
    const isSelected = d => selectedDay &&
        d === new Date(selectedDay).getDate() &&
        year === new Date(selectedDay).getFullYear() &&
        mo   === new Date(selectedDay).getMonth()

    const cells    = [...Array(offset).fill(null), ...Array.from({ length: daysInMo }, (_, i) => i + 1)]
    const moLabel  = view.toLocaleString('en-US', { month:'long', year:'numeric' })

    return (
        <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <button onClick={() => setView(new Date(year, mo - 1, 1))}
                    style={{ background:'none', border:'0.5px solid rgba(0,0,0,0.12)', cursor:'pointer', padding:'3px 9px', borderRadius:6, color:'#6b7280', fontSize:14 }}>‹</button>
                <span style={{ fontSize:12, fontWeight:600, textTransform:'capitalize', color:'#1a1a2e' }}>{moLabel}</span>
                <button onClick={() => setView(new Date(year, mo + 1, 1))}
                    style={{ background:'none', border:'0.5px solid rgba(0,0,0,0.12)', cursor:'pointer', padding:'3px 9px', borderRadius:6, color:'#6b7280', fontSize:14 }}>›</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
                {['Mo','Tu','We','Th','Fr','Sa','Su'].map((d,i) => (
                    <div key={i} style={{ textAlign:'center', fontSize:9, fontWeight:700, color:'#c0c0c0', padding:'2px 0', letterSpacing:'0.03em' }}>{d}</div>
                ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
                {cells.map((d, i) => (
                    <div key={i} onClick={() => d && onDaySelect(new Date(year, mo, d))}
                        style={{
                            textAlign:'center', padding:'5px 0', borderRadius:6, fontSize:12,
                            cursor: d ? 'pointer' : 'default', position:'relative', transition:'background 0.1s',
                            background: d && isSelected(d) ? '#185FA5' : d && isToday(d) ? '#E6F1FB' : 'transparent',
                            color:      d && isSelected(d) ? 'white'   : d && isToday(d) ? '#185FA5' : d ? '#1a1a2e' : 'transparent',
                            fontWeight: d && (isToday(d) || isSelected(d)) ? 700 : 400,
                        }}>
                        {d || ''}
                        {d && meetingDays.has(d) && (
                            <div style={{ position:'absolute', bottom:1, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background: isSelected(d) ? 'rgba(255,255,255,0.8)' : '#185FA5' }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function useCountdown(targetDate) {
    const [label, setLabel] = useState('')
    useEffect(() => {
        const calc = () => {
            if (!targetDate) return setLabel('')
            const diff = new Date(targetDate) - new Date()
            if (diff < 0)           return setLabel('passed')
            const mins = Math.floor(diff / 60000)
            if (mins === 0)         return setLabel('now')
            if (mins < 60)          return setLabel(`in ${mins}m`)
            const hrs = Math.floor(mins / 60)
            if (hrs < 24)           return setLabel(`in ${hrs}h`)
            const days = Math.floor(hrs / 24)
            return setLabel(`in ${days}d`)
        }
        calc()
        const t = setInterval(calc, 30000)
        return () => clearInterval(t)
    }, [targetDate])
    return label
}

function UpcomingItem({ m }) {
    const countdown = useCountdown(m.scheduledAt)
    const mins      = m.scheduledAt ? Math.floor((new Date(m.scheduledAt) - new Date()) / 60000) : 999
    const urgent    = mins >= 0 && mins < 60
    return (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'0.5px solid rgba(0,0,0,0.05)' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background: urgent ? '#BA7517' : '#185FA5' }} />
            <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</div>
                <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>
                    {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('en-US', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'}
                </div>
            </div>
            <span style={{ fontSize:11, padding:'3px 8px', borderRadius:6, fontWeight:600, whiteSpace:'nowrap', background: urgent ? '#FAEEDA' : '#E6F1FB', color: urgent ? '#633806' : '#0C447C' }}>
                {countdown}
            </span>
        </div>
    )
}

// ─── main ────────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { user }   = useAuth()
    const navigate   = useNavigate()

    const [allMeetings,   setAllMeetings]   = useState([])
    const [contacts,      setContacts]      = useState([])
    const [activeRooms,   setActiveRooms]   = useState([])
    const [selectedDay,   setSelectedDay]   = useState(null)
    const [generatedLink, setGeneratedLink] = useState('')
    const [generatedRoom, setGeneratedRoom] = useState(null)
    const [copiedId,      setCopiedId]      = useState(null)
    const [loading,       setLoading]       = useState(false)
    const [fetchLoading,  setFetchLoading]  = useState(true)
    const [fetchError,    setFetchError]    = useState(null)
    const [toasts,        setToasts]        = useState([])

    const addToast = useCallback((msg) => {
        const id = Date.now()
        setToasts(t => [...t, { id, message: msg }])
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
    }, [])

    const loadData = useCallback(() =>
        Promise.all([meetingsApi.getAll(), contactsApi.getAll(), roomsApi.getActive()])
            .then(([m, c, r]) => { setAllMeetings(m.data); setContacts(c.data); setActiveRooms(r.data) })
            .catch(() => setFetchError('Error loading data'))
    , [])

    useEffect(() => { setFetchLoading(true); loadData().finally(() => setFetchLoading(false)) }, [loadData])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return
        const es = new EventSource(`/api/sse/subscribe?token=${token}`)
        es.addEventListener('room.created', (e) => {
            try { addToast(`New room: ${JSON.parse(e.data).roomName}`) } catch {}
            roomsApi.getActive().then(r => setActiveRooms(r.data)).catch(() => {})
        })
        es.addEventListener('meeting.started', (e) => {
            try { addToast(`"${JSON.parse(e.data).titles?.join(', ') || 'Meeting'}" started`) } catch {}
            Promise.all([meetingsApi.getAll(), roomsApi.getActive()])
                .then(([m, r]) => { setAllMeetings(m.data); setActiveRooms(r.data) }).catch(() => {})
        })
        return () => es.close()
    }, [addToast])

    const generateRoom = async () => {
        setLoading(true)
        try {
            const now = new Date()
            const hh  = String(now.getHours()).padStart(2, '0')
            const mm  = String(now.getMinutes()).padStart(2, '0')
            const res = await roomsApi.create({
                name:         `Huddle ${hh}:${mm}`,
                createdBy:    user ? `${user.firstName} ${user.lastName}` : 'admin',
                hostIdentity: user?.username || 'admin'
            })
            const room = res.data
            const link = `${window.location.origin}/join/${room.inviteCode}`
            setGeneratedLink(link)
            setGeneratedRoom(room)
            roomsApi.getActive().then(r => setActiveRooms(r.data))
            localStorage.setItem(`huddle_host_${room.inviteCode}`, JSON.stringify({
                token: room.token, url: room.url, roomId: room.id,
                name:  user ? `${user.firstName} ${user.lastName}` : 'Host'
            }))
            window.open(link, '_blank')
        } catch {
            addToast('Error creating room. Check if the server is running.')
        } finally {
            setLoading(false)
        }
    }

    const copyLink = (link, id) => {
        navigator.clipboard.writeText(link)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const avatarColor = i => { const [bg, color] = AVATAR_PALETTE[i % AVATAR_PALETTE.length].split(':'); return { background: bg, color } }
    const initials    = c => `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`

    const todayMeetings    = allMeetings.filter(m => m.scheduledAt && new Date(m.scheduledAt).toDateString() === new Date().toDateString())
    const upcomingMeetings = allMeetings.filter(m => m.status === 'SCHEDULED' && m.scheduledAt && new Date(m.scheduledAt) > new Date()).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)).slice(0, 5)
    const selectedDayMtgs  = selectedDay ? allMeetings.filter(m => m.scheduledAt && new Date(m.scheduledAt).toDateString() === selectedDay.toDateString()) : []
    const activity         = buildActivity(allMeetings, activeRooms)

    if (fetchLoading) return (
        <div className="main-content">
            <TopBar title="Dashboard" />
            <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}>
                <div style={{ color:'#9ca3af', fontSize:14 }}>Loading...</div>
            </div>
        </div>
    )

    return (
        <div className="main-content">
            <style>{`
                @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
                @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
                .dash-room-card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.08) !important; transform:translateY(-1px); }
                .dash-act-row:hover   { background:#f7f8fa; border-radius:6px; }
                .dash-cal-day:hover   { background:#f0f4fa !important; }
            `}</style>

            <Toast toasts={toasts} />
            <TopBar title="Dashboard" />

            <div className="page">
                {fetchError && (
                    <div style={{ background:'#FCEBEB', color:'#A32D2D', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 }}>
                        {fetchError}
                    </div>
                )}

                {/* ── Quick actions ─────────────────────────────────── */}
                <div style={{ display:'flex', gap:8, marginBottom:24 }}>
                    <button className="btn btn-primary" onClick={generateRoom} disabled={loading} style={{ fontWeight:500 }}>
                        {loading ? 'Creating...' : '+ New room'}
                    </button>
                    <button className="btn" onClick={() => navigate('/meetings')} style={{ color:'#6b7280' }}>
                        Schedule meeting
                    </button>
                    <button className="btn" onClick={() => navigate('/contacts')} style={{ color:'#6b7280' }}>
                        Add contact
                    </button>
                </div>

                {/* ── Generated link banner ─────────────────────────── */}
                {generatedRoom && (
                    <div style={{ background:'#E1F5EE', border:'0.5px solid #1D9E75', borderRadius:10, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:'#085041', marginBottom:3 }}>Room created — share the link</div>
                            <div style={{ fontSize:12, fontFamily:'monospace', color:'#1a1a2e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{generatedLink}</div>
                        </div>
                        <button className="btn btn-sm" onClick={() => copyLink(generatedLink, 'banner')}>
                            {copiedId === 'banner' ? '✓ Copied' : 'Copy'}
                        </button>
                        <button onClick={() => { setGeneratedRoom(null); setGeneratedLink('') }}
                            style={{ background:'none', border:'none', cursor:'pointer', color:'#085041', fontSize:18, lineHeight:1, padding:'0 2px' }}>×</button>
                    </div>
                )}

                {/* ── OVERVIEW ──────────────────────────────────────── */}
                <SectionLabel>Overview</SectionLabel>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
                    {[
                        { label:'Active Rooms',     val:activeRooms.length,       sub:'in progress',  accent:'#185FA5', bg:'#E6F1FB', live: activeRooms.length > 0 },
                        { label:"Today's Meetings", val:todayMeetings.length,     sub:'scheduled',    accent:'#633806', bg:'#FAEEDA' },
                        { label:'Contacts',         val:contacts.length,          sub:`${contacts.filter(c => c.status === 'ONLINE').length} online`, accent:'#085041', bg:'#E1F5EE' },
                        { label:'Upcoming',         val:upcomingMeetings.length,  sub:'meetings',     accent:'#3C3489', bg:'#EEEDFE' },
                    ].map((s, i) => (
                        <div key={i} style={{ background:'white', borderRadius:10, padding:'14px 16px', border:'0.5px solid rgba(0,0,0,0.07)', borderLeft:`3px solid ${s.accent}`, position:'relative' }}>
                            {s.live && <div style={{ position:'absolute', top:10, right:10, width:8, height:8, borderRadius:'50%', background:'#1D9E75', animation:'pulse 2s infinite' }} />}
                            <div style={{ fontSize:11, color:'#9ca3af', marginBottom:6 }}>{s.label}</div>
                            <div style={{ fontSize:30, fontWeight:700, color:s.accent, lineHeight:1 }}>{s.val}</div>
                            <div style={{ fontSize:11, color:'#b0b0b0', marginTop:4 }}>{s.sub}</div>
                        </div>
                    ))}
                </div>

                {/* ── MEETINGS ──────────────────────────────────────── */}
                <SectionLabel>Meetings</SectionLabel>
                <div style={{ display:'grid', gridTemplateColumns:'5fr 7fr', gap:16, marginBottom:24 }}>

                    {/* Calendar */}
                    <div className="card">
                        <CardTitle accent="#185FA5">Calendar</CardTitle>
                        <MiniCalendar meetings={allMeetings} onDaySelect={setSelectedDay} selectedDay={selectedDay} />

                        {selectedDay && (
                            <div style={{ marginTop:14, paddingTop:14, borderTop:'0.5px solid rgba(0,0,0,0.06)' }}>
                                <div style={{ fontSize:11, fontWeight:600, color:'#9ca3af', textTransform:'capitalize', marginBottom:8 }}>
                                    {selectedDay.toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long' })}
                                </div>
                                {selectedDayMtgs.length === 0
                                    ? <EmptyState text="No meetings on this day" />
                                    : selectedDayMtgs.map(m => (
                                        <div key={m.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'0.5px solid rgba(0,0,0,0.05)' }}>
                                            <div style={{ width:6, height:6, borderRadius:'50%', flexShrink:0, background: m.status === 'ACTIVE' ? '#1D9E75' : '#185FA5' }} />
                                            <div style={{ flex:1, minWidth:0 }}>
                                                <div style={{ fontSize:12, fontWeight:500 }}>{m.title}</div>
                                                {m.scheduledAt && <div style={{ fontSize:11, color:'#9ca3af' }}>{new Date(m.scheduledAt).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}</div>}
                                            </div>
                                            <span className={`badge ${MEETING_CLASS[m.status] || 'badge-scheduled'}`}>{MEETING_LABEL[m.status] || m.status}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                    </div>

                    {/* Upcoming meetings */}
                    <div className="card">
                        <CardTitle accent="#3C3489">Upcoming meetings</CardTitle>
                        {upcomingMeetings.length === 0
                            ? <EmptyState text="No scheduled meetings" />
                            : upcomingMeetings.map(m => <UpcomingItem key={m.id} m={m} />)
                        }
                    </div>
                </div>

                {/* ── ACTIVE ROOMS ──────────────────────────────────── */}
                <SectionLabel>Active Rooms</SectionLabel>
                <div className="card" style={{ marginBottom:24 }}>
                    <CardTitle accent="#1D9E75"
                        action={activeRooms.length > 0 && <div style={{ width:8, height:8, borderRadius:'50%', background:'#1D9E75', animation:'pulse 2s infinite' }} />}>
                        Rooms in progress
                    </CardTitle>
                    {activeRooms.length === 0
                        ? <EmptyState text='No active rooms — click "+ New room" to start' />
                        : (
                            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                {activeRooms.map(r => (
                                    <div key={r.id} className="dash-room-card" style={{ border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:8, padding:'10px 14px', display:'flex', alignItems:'center', gap:12, background:'white', transition:'all 0.15s', cursor:'default' }}>
                                        <div style={{ width:8, height:8, borderRadius:'50%', background:'#1D9E75', animation:'pulse 2s infinite', flexShrink:0 }} />
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.name}</div>
                                            <div style={{ fontSize:11, color:'#9ca3af', fontFamily:'monospace', marginTop:1 }}>{r.inviteCode?.slice(0, 12)}…</div>
                                        </div>
                                        <button className="btn btn-sm" onClick={() => copyLink(`${window.location.origin}/join/${r.inviteCode}`, r.id)}>
                                            {copiedId === r.id ? '✓ Copied' : 'Copy link'}
                                        </button>
                                        <button className="btn btn-sm btn-primary" onClick={() => window.open(`/join/${r.inviteCode}`, '_blank')}>
                                            Join
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div>

                {/* ── TEAM & ACTIVITY ───────────────────────────────── */}
                <SectionLabel>Team & Activity</SectionLabel>
                <div style={{ display:'grid', gridTemplateColumns:'7fr 5fr', gap:16 }}>

                    {/* Activity feed */}
                    <div className="card">
                        <CardTitle accent="#378ADD">Recent activity</CardTitle>
                        {activity.length === 0
                            ? <EmptyState text="No activity yet" />
                            : activity.map((a, i) => (
                                <div key={i} className="dash-act-row" style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 6px', borderBottom:'0.5px solid rgba(0,0,0,0.04)' }}>
                                    <div style={{ width:32, height:32, borderRadius:8, background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                        <div style={{ width:8, height:8, borderRadius:'50%', background:a.accent }} />
                                    </div>
                                    <div style={{ flex:1, fontSize:12, color:'#1a1a2e' }}>{a.label}</div>
                                    <div style={{ fontSize:11, color:'#b0b0b0', whiteSpace:'nowrap' }}>{timeAgo(a.time)}</div>
                                </div>
                            ))
                        }
                    </div>

                    {/* Contacts */}
                    <div className="card">
                        <CardTitle accent="#085041">Contacts</CardTitle>
                        {contacts.length === 0
                            ? <EmptyState text="No contacts" />
                            : contacts.slice(0, 7).map((c, i) => (
                                <div key={c.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:'0.5px solid rgba(0,0,0,0.05)' }}>
                                    <div className="avatar" style={avatarColor(i)}>{initials(c)}</div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:12, fontWeight:500 }}>{c.firstName} {c.lastName}</div>
                                        <div style={{ fontSize:11, color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.email}</div>
                                    </div>
                                    <span className={`badge ${CONTACT_CLASS[c.status] || 'badge-offline'}`}>
                                        {CONTACT_LABEL[c.status] || 'offline'}
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
