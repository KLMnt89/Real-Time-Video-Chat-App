import { useEffect, useRef } from 'react'

export default function NetworkBackground() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animId
        let dots = []

        const resize = () => {
            canvas.width  = window.innerWidth
            canvas.height = window.innerHeight
            initDots()
        }

        const initDots = () => {
            dots = Array.from({ length: 28 }, () => ({
                x:  Math.random() * canvas.width,
                y:  Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.22,
                vy: (Math.random() - 0.5) * 0.22,
                r:  Math.random() * 1.8 + 0.8,
            }))
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                (!document.documentElement.getAttribute('data-theme') &&
                 window.matchMedia('(prefers-color-scheme: dark)').matches)

            const lineColor = isDark
                ? 'rgba(100, 160, 240, 0.07)'
                : 'rgba(24, 95, 165, 0.05)'
            const dotColor  = isDark
                ? 'rgba(100, 160, 240, 0.12)'
                : 'rgba(24, 95, 165, 0.08)'

            ctx.lineWidth = 0.6
            for (let i = 0; i < dots.length; i++) {
                for (let j = i + 1; j < dots.length; j++) {
                    const dx   = dots[i].x - dots[j].x
                    const dy   = dots[i].y - dots[j].y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 130) {
                        ctx.strokeStyle = lineColor
                        ctx.globalAlpha = 1 - dist / 130
                        ctx.beginPath()
                        ctx.moveTo(dots[i].x, dots[i].y)
                        ctx.lineTo(dots[j].x, dots[j].y)
                        ctx.stroke()
                    }
                }
            }
            ctx.globalAlpha = 1

            dots.forEach(d => {
                ctx.fillStyle = dotColor
                ctx.beginPath()
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
                ctx.fill()

                d.x += d.vx
                d.y += d.vy
                if (d.x < 0 || d.x > canvas.width)  d.vx *= -1
                if (d.y < 0 || d.y > canvas.height)  d.vy *= -1
            })

            animId = requestAnimationFrame(draw)
        }

        resize()
        draw()
        window.addEventListener('resize', resize)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed', top: 0, left: 0,
                width: '100%', height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    )
}
