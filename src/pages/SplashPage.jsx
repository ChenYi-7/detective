import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAppState, saveAppState } from '../utils/storage'

export default function SplashPage({ appState, setAppState }) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState(0)
  const [skipped, setSkipped] = useState(false)

  useEffect(() => {
    if (skipped) return
    const timers = [
      setTimeout(() => setPhase(1), 300),   // 微弱灯光
      setTimeout(() => setPhase(2), 800),   // 胶片移动
      setTimeout(() => setPhase(3), 1300),  // 放大镜
      setTimeout(() => setPhase(4), 1800),  // Logo显现
      setTimeout(() => setPhase(5), 2300),  // 印章落下
      setTimeout(() => {
        const state = getAppState()
        if (state.isLoggedIn || state.isGuest) {
          navigate('/home')
        } else {
          navigate('/login')
        }
      }, 2800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [skipped, navigate])

  const handleSkip = () => {
    setSkipped(true)
    const state = getAppState()
    if (state.isLoggedIn || state.isGuest) {
      navigate('/home')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="page-container" style={{
      background: '#050505',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    }} onClick={handleSkip}>
      {/* 背景 - 黑暗环境 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, #1a1008 0%, #050505 70%)',
        opacity: phase >= 1 ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }} />

      {/* 微弱灯光 */}
      {phase >= 1 && (
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '200px',
          background: 'linear-gradient(180deg, rgba(255,200,100,0.15) 0%, transparent 100%)',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
          animation: 'flicker 3s infinite',
          transition: 'opacity 0.5s',
        }} />
      )}

      {/* 胶片条 */}
      {phase >= 2 && (
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '10%',
          right: '10%',
          height: '60px',
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          animation: 'fadeInDown 0.6s ease',
        }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              width: '40px', height: '50px',
              background: '#1a1a1a',
              border: '2px solid #333',
              borderRadius: '2px',
              animation: `fadeIn 0.3s ease ${i * 0.1}s both`,
            }} />
          ))}
        </div>
      )}

      {/* 放大镜扫过 */}
      {phase >= 3 && (
        <div style={{
          position: 'absolute',
          top: '30%',
          animation: 'magnify 1.5s ease-in-out',
          fontSize: '48px',
          filter: 'drop-shadow(0 0 10px rgba(255,200,100,0.5))',
        }}>🔍</div>
      )}

      {/* Logo */}
      {phase >= 4 && (
        <div style={{
          textAlign: 'center',
          animation: 'fadeInUp 0.8s ease',
          zIndex: 10,
        }}>
          <h1 style={{
            fontFamily: 'var(--font-calligraphy)',
            fontSize: '52px',
            color: '#f0e6d3',
            textShadow: '0 0 30px rgba(192,57,43,0.5), 0 2px 4px rgba(0,0,0,0.8)',
            letterSpacing: '8px',
            marginBottom: '8px',
          }}>开工侦探社</h1>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
            color: '#a89880',
            letterSpacing: '6px',
            textTransform: 'uppercase',
          }}>DETECTIVE CLUB</p>
        </div>
      )}

      {/* 印章落下 */}
      {phase >= 5 && (
        <div style={{
          position: 'absolute',
          bottom: '25%',
          animation: 'stamp 0.6s ease-out',
          zIndex: 10,
        }}>
          <div style={{
            width: '80px', height: '80px',
            border: '3px solid var(--red-primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-15deg)',
            background: 'rgba(192,57,43,0.1)',
          }}>
            <span style={{
              color: 'var(--red-primary)',
              fontFamily: 'var(--font-calligraphy)',
              fontSize: '20px',
              fontWeight: 'bold',
            }}>探</span>
          </div>
        </div>
      )}

      {/* 跳过提示 */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        color: '#6b5d4f',
        fontSize: '13px',
        animation: 'pulse 2s infinite',
      }}>点击跳过</div>
    </div>
  )
}
