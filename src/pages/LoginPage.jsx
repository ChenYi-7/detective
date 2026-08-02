import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setUser, saveAppState } from '../utils/storage'

export default function LoginPage({ appState, setAppState }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('main') // main | phone
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [agreed, setAgreed] = useState(false)

  const handleWechatLogin = () => {
    if (!agreed) return alert('请先同意用户协议与隐私政策')
    const user = { id: 'wx_' + Date.now(), name: '侦探' + Math.floor(Math.random() * 9999), avatar: '️', loginType: 'wechat' }
    setUser(user)
    saveAppState({ ...appState, isLoggedIn: true, isGuest: false, hasLaunched: true })
    setAppState({ ...appState, isLoggedIn: true, isGuest: false, hasLaunched: true })
    navigate('/home')
  }

  const handlePhoneLogin = () => {
    if (!agreed) return alert('请先同意用户协议与隐私政策')
    if (!phone) return alert('请输入手机号')
    const user = { id: 'phone_' + Date.now(), name: '侦探' + phone.slice(-4), avatar: '🕵️', loginType: 'phone', phone }
    setUser(user)
    saveAppState({ ...appState, isLoggedIn: true, isGuest: false, hasLaunched: true })
    setAppState({ ...appState, isLoggedIn: true, isGuest: false, hasLaunched: true })
    navigate('/home')
  }

  const handleGuest = () => {
    saveAppState({ ...appState, isLoggedIn: false, isGuest: true, hasLaunched: true })
    setAppState({ ...appState, isLoggedIn: false, isGuest: true, hasLaunched: true })
    navigate('/home')
  }

  return (
    <div className="page-container page-transition" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1008 50%, #0a0a0a 100%)',
      padding: '40px 24px',
    }}>
      {/* 顶部装饰 - 胶片 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, transparent, #333, transparent)' }} />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeInDown 0.6s ease' }}>
        <h1 style={{
          fontFamily: 'var(--font-calligraphy)',
          fontSize: '36px', color: '#f0e6d3',
          textShadow: '0 0 20px rgba(192,57,43,0.3)',
          marginBottom: '4px',
        }}>开工侦探社</h1>
        <p style={{ fontSize: '12px', color: '#6b5d4f', letterSpacing: '4px' }}>DETECTIVE CLUB</p>
      </div>

      {/* 登录卡片 */}
      <div style={{
        width: '100%', maxWidth: '340px',
        background: 'linear-gradient(145deg, #d4c5a9, #c4b599)',
        borderRadius: '4px',
        padding: '32px 24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
        animation: 'fadeInUp 0.6s ease 0.2s both',
        position: 'relative',
      }}>
        {/* 图钉装饰 */}
        <div style={{
          position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)',
          width: '16px', height: '16px', borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 40%, #e74c3c, #922b21)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }} />

        <h2 style={{
          fontFamily: 'var(--font-calligraphy)',
          fontSize: '28px', color: '#2c1810',
          textAlign: 'center', marginBottom: '8px',
        }}>登录</h2>
        <p style={{ fontSize: '13px', color: '#6b5d4f', textAlign: 'center', marginBottom: '28px' }}>
          欢迎加入开工侦探社<br />一起发现线索，破解真相
        </p>

        {mode === 'main' ? (
          <>
            {/* 微信登录 */}
            <button onClick={handleWechatLogin} style={{
              width: '100%', padding: '14px',
              background: '#07c160', color: '#fff',
              border: 'none', borderRadius: '8px',
              fontSize: '15px', fontFamily: 'var(--font-serif)',
              cursor: 'pointer', marginBottom: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.3s',
            }}>
              <span style={{ fontSize: '20px' }}>💬</span> 微信登录
            </button>

            {/* 手机号登录 */}
            <button onClick={() => setMode('phone')} style={{
              width: '100%', padding: '14px',
              background: 'transparent', color: '#2c1810',
              border: '1px solid #8b7d6b', borderRadius: '8px',
              fontSize: '15px', fontFamily: 'var(--font-serif)',
              cursor: 'pointer', marginBottom: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '18px' }}>📱</span> 手机号登录
            </button>
          </>
        ) : (
          <>
            <input className="input-field" placeholder="请输入手机号" value={phone} onChange={e => setPhone(e.target.value)}
              style={{ marginBottom: '12px', background: 'rgba(255,255,255,0.5)', color: '#2c1810', border: '1px solid #8b7d6b' }} />
            <input className="input-field" placeholder="请输入验证码" value={code} onChange={e => setCode(e.target.value)}
              style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.5)', color: '#2c1810', border: '1px solid #8b7d6b' }} />
            <button onClick={handlePhoneLogin} className="btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
              登录
            </button>
            <button onClick={() => setMode('main')} style={{
              width: '100%', padding: '10px', background: 'transparent',
              border: 'none', color: '#6b5d4f', fontSize: '13px',
              cursor: 'pointer', fontFamily: 'var(--font-serif)',
            }}>← 返回</button>
          </>
        )}

        {/* 协议 */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: '#6b5d4f', cursor: 'pointer' }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            style={{ marginTop: '2px', accentColor: 'var(--red-primary)' }} />
          <span>已阅读并同意《用户协议》和《隐私政策》</span>
        </label>
      </div>

      {/* 游客体验 */}
      <button onClick={handleGuest} style={{
        marginTop: '24px', padding: '12px 24px',
        background: 'transparent', color: '#a89880',
        border: '1px dashed #6b5d4f', borderRadius: '8px',
        fontSize: '13px', fontFamily: 'var(--font-serif)',
        cursor: 'pointer', animation: 'fadeIn 0.6s ease 0.5s both',
        transition: 'all 0.3s',
      }}>
        ️ 游客体验 / 稍后登录
      </button>

      <p style={{ marginTop: '16px', fontSize: '11px', color: '#4a3f35', animation: 'fadeIn 0.6s ease 0.7s both' }}>
        游客模式功能正常，但档案/徽章不持久化
      </p>
    </div>
  )
}
