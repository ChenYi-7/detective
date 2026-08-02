import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, getBadges, getCases, getTotalXP, getLevelFromXP, clearUser, saveAppState } from '../utils/storage'

export default function UserProfilePage({ appState, setAppState }) {
  const navigate = useNavigate()
  const user = getUser()
  const badges = getBadges()
  const cases = getCases()
  const totalXP = getTotalXP(badges)
  const level = getLevelFromXP(totalXP)
  const completedCases = cases.filter(c => c.case_status === 'completed').length
  const [showAchievements, setShowAchievements] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2000)
  }

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path)
    } else if (item.action) {
      item.action()
    } else {
      showToast('功能开发中，敬请期待')
    }
  }

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      clearUser()
      saveAppState({ hasLaunched: true, isLoggedIn: false, isGuest: false })
      setAppState({ hasLaunched: true, isLoggedIn: false, isGuest: false })
      navigate('/login')
    }
  }

  return (
    <div className="page-container page-transition" style={{
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0d0a 50%, #0a0a0a 100%)',
    }}>
      {/* 顶部栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '16px 20px',
        borderBottom: '1px solid var(--border-dark)',
      }}>
        <div onClick={() => navigate(-1)} style={{
          color: '#a89880', fontSize: '20px', cursor: 'pointer', marginRight: '16px',
        }}>←</div>
        <h2 style={{
          fontFamily: 'var(--font-calligraphy)',
          fontSize: '22px', color: '#f0e6d3',
        }}>侦探档案</h2>
      </div>

      {/* 用户信息卡片 */}
      <div style={{
        margin: '20px', padding: '24px',
        background: 'linear-gradient(135deg, rgba(192,57,43,0.1), rgba(26,26,26,0.8))',
        border: '1px solid rgba(192,57,43,0.2)',
        borderRadius: '16px',
        textAlign: 'center',
        animation: 'fadeInUp 0.5s ease',
      }}>
        {/* 头像 */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #2c1810, #1a0f0a)',
          border: '3px solid var(--red-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
          fontSize: '36px',
          boxShadow: '0 0 20px var(--shadow-red)',
        }}>{user?.avatar || '🕵️'}</div>

        <h3 style={{ color: '#f0e6d3', fontSize: '20px', marginBottom: '4px' }}>
          {user?.name || '匿名侦探'}
        </h3>
        <p style={{ color: '#6b5d4f', fontSize: '12px', marginBottom: '16px' }}>
          ID: {user?.id?.slice(0, 12) || 'guest'}
        </p>

        {/* 等级 */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(212,160,23,0.15)',
          border: '1px solid rgba(212,160,23,0.3)',
          borderRadius: '20px', padding: '6px 16px',
        }}>
          <span style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: 700 }}>
            Lv.{level}
          </span>
          <span style={{ color: '#a89880', fontSize: '12px' }}>
            {totalXP} XP
          </span>
        </div>
      </div>

      {/* 统计数据 */}
      <div style={{
        display: 'flex', margin: '0 20px 20px',
        background: 'rgba(26,26,26,0.6)',
        border: '1px solid var(--border-dark)',
        borderRadius: '12px', overflow: 'hidden',
        animation: 'fadeInUp 0.5s ease 0.1s both',
      }}>
        {[
          { label: '完成案件', value: completedCases, icon: '' },
          { label: '获得徽章', value: badges.length, icon: '' },
          { label: '案件热度', value: Math.min(completedCases, 7), icon: '' },
        ].map((item, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center', padding: '16px 8px',
            borderRight: i < 2 ? '1px solid var(--border-dark)' : 'none',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
            <div style={{ fontSize: '22px', color: '#f0e6d3', fontWeight: 700 }}>{item.value}</div>
            <div style={{ fontSize: '11px', color: '#6b5d4f' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* 菜单列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
        <div style={{
          background: 'rgba(26,26,26,0.6)',
          border: '1px solid var(--border-dark)',
          borderRadius: '12px', overflow: 'hidden',
          animation: 'fadeInUp 0.5s ease 0.2s both',
        }}>
          {[
            { icon: '👤', label: '个人信息', path: null, action: () => showToast('功能开发中，敬请期待') },
            { icon: '', label: '成就徽章', path: null, badge: badges.length, action: () => setShowAchievements(true) },
            { icon: '', label: '我的收藏', path: null, action: () => showToast('功能开发中，敬请期待') },
            { icon: '', label: '消息通知', path: null, action: () => showToast('功能开发中，敬请期待') },
            { icon: '', label: '帮助与反馈', path: null, action: () => showToast('功能开发中，敬请期待') },
            { icon: '', label: '设置', path: '/settings' },
          ].map((item, i) => (
            <div key={i} onClick={() => handleMenuClick(item)} style={{
              display: 'flex', alignItems: 'center',
              padding: '16px',
              borderBottom: i < 5 ? '1px solid rgba(42,42,42,0.3)' : 'none',
              cursor: 'pointer',
              transition: 'background 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,57,43,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: '18px', marginRight: '12px' }}>{item.icon}</span>
              <span style={{ flex: 1, color: '#f0e6d3', fontSize: '14px' }}>{item.label}</span>
              {item.badge !== undefined && (
                <span style={{
                  background: 'var(--red-primary)',
                  color: '#fff', fontSize: '11px',
                  padding: '2px 8px', borderRadius: '10px',
                  marginRight: '8px',
                }}>{item.badge}</span>
              )}
              <span style={{ color: '#6b5d4f', fontSize: '14px' }}>→</span>
            </div>
          ))}
        </div>

        {/* 退出登录 */}
        {(appState.isLoggedIn || appState.isGuest) && (
          <button onClick={handleLogout} style={{
            width: '100%', marginTop: '16px',
            padding: '14px',
            background: 'transparent',
            border: '1px solid rgba(192,57,43,0.3)',
            borderRadius: '12px',
            color: 'var(--red-primary)',
            fontSize: '14px',
            fontFamily: 'var(--font-serif)',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}>
            退出登录
          </button>
        )}
      </div>

      {/* Toast 提示 */}
      {toastMsg && (
        <div style={{
          position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(26,26,26,0.95)', border: '1px solid var(--border-dark)',
          borderRadius: '8px', padding: '10px 20px', zIndex: 30,
          color: '#a89880', fontSize: '13px', fontFamily: 'var(--font-serif)',
          animation: 'fadeInUp 0.3s ease', whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        }}>{toastMsg}</div>
      )}

      {/* 成就徽章弹窗 */}
      {showAchievements && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.3s ease',
        }} onClick={() => setShowAchievements(false)}>
          <div style={{
            background: 'linear-gradient(145deg, #1a1815, #0f0e0c)',
            border: '1px solid var(--border-dark)',
            borderRadius: '12px', padding: '24px',
            maxWidth: '340px', width: '100%',
            maxHeight: '70vh', overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            animation: 'scaleIn 0.3s ease',
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '20px',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-calligraphy)',
                fontSize: '20px', color: '#f0e6d3',
              }}>成就徽章</h3>
              <span onClick={() => setShowAchievements(false)} style={{
                color: '#6b5d4f', fontSize: '20px', cursor: 'pointer',
                padding: '4px 8px',
              }}></span>
            </div>

            {badges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px', opacity: 0.4 }}></span>
                <p style={{ color: '#6b5d4f', fontSize: '13px', fontFamily: 'var(--font-serif)' }}>
                  还没有获得徽章<br />完成任务来收集吧
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {badges.map((b, i) => {
                  const typeColors = {
                    start: { bg: 'rgba(192,57,43,0.15)', border: 'rgba(192,57,43,0.3)', label: '启动' },
                    silver: { bg: 'rgba(189,195,199,0.1)', border: 'rgba(189,195,199,0.3)', label: '银质' },
                    gold: { bg: 'rgba(212,160,23,0.15)', border: 'rgba(212,160,23,0.3)', label: '金质' },
                  }
                  const tc = typeColors[b.type] || typeColors.silver
                  return (
                    <div key={b.id || i} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: tc.bg,
                      border: `1px solid ${tc.border}`,
                      borderRadius: '10px', padding: '12px 14px',
                      animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
                    }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: tc.bg,
                        border: `2px solid ${tc.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', flexShrink: 0,
                      }}>{b.icon || '🏅'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#f0e6d3', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                          {b.name}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                          <span style={{
                            fontSize: '10px', color: tc.label === '金质' ? 'var(--gold)' : tc.label === '启动' ? 'var(--red-primary)' : 'var(--silver)',
                            background: `${tc.border}30`,
                            padding: '1px 6px', borderRadius: '6px',
                          }}>{tc.label}</span>
                          <span style={{ fontSize: '10px', color: '#6b5d4f' }}>+{b.xp || 0} XP</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', color: '#4a3f35' }}>
                        {b.earnedAt ? new Date(b.earnedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* XP 汇总 */}
            {badges.length > 0 && (
              <div style={{
                marginTop: '16px', paddingTop: '14px',
                borderTop: '1px solid var(--border-dark)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ color: '#6b5d4f', fontSize: '12px', fontFamily: 'var(--font-serif)' }}>累计获得</span>
                <span style={{ color: 'var(--gold)', fontSize: '16px', fontWeight: 700 }}>{totalXP} XP</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
