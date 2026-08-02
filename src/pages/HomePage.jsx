import { useNavigate } from 'react-router-dom'
import { getUser, getCases, getCurrentCaseId, getCase } from '../utils/storage'

export default function HomePage({ appState }) {
  const navigate = useNavigate()
  const user = getUser()
  const cases = getCases()
  const currentCaseId = getCurrentCaseId()
  const currentCase = currentCaseId ? getCase(currentCaseId) : null
  const hasActiveCase = currentCase && currentCase.case_status !== 'completed' && currentCase.case_status !== 'archived'

  return (
    <div className="page-container page-transition" style={{
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0d0a 50%, #0a0a0a 100%)',
      position: 'relative',
    }}>
      {/* 顶部装饰线 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--red-primary), transparent)' }} />

      {/* 顶部栏 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px',
      }}>
        <div style={{
          fontFamily: 'var(--font-calligraphy)',
          fontSize: '20px', color: '#f0e6d3',
          textShadow: '0 0 10px rgba(192,57,43,0.3)',
        }}>开工侦探社</div>
        <div onClick={() => navigate('/profile')} style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #2c1810, #1a0f0a)',
          border: '2px solid var(--red-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '18px',
          boxShadow: '0 0 10px var(--shadow-red)',
          transition: 'all 0.3s',
        }}>
          {user?.avatar || '🕵️'}
        </div>
      </div>

      {/* 未结案件恢复卡片 */}
      {hasActiveCase && (
        <div onClick={() => navigate(`/case/${currentCase.id}`)} style={{
          margin: '8px 20px 16px',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(192,57,43,0.15), rgba(146,43,33,0.1))',
          border: '1px solid rgba(192,57,43,0.3)',
          borderRadius: '12px',
          cursor: 'pointer',
          animation: 'fadeInDown 0.5s ease',
          transition: 'all 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}></span>
            <div>
              <div style={{ fontSize: '14px', color: '#f0e6d3', fontWeight: 600 }}>案件还在等你，继续？</div>
              <div style={{ fontSize: '12px', color: '#a89880', marginTop: '2px' }}>
                {currentCase.case_name || '未命名案件'} · {currentCase.clues?.filter(c => c.clue_status === 'done').length || 0}/{currentCase.clues?.length || 0} 线索已完成
              </div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#c0392b', fontSize: '18px' }}>→</span>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
        {/* 相机主按钮 */}
        <div onClick={() => navigate('/camera')} style={{
          width: '140px', height: '140px', borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 40%, #e74c3c, #c0392b, #922b21)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 40px var(--shadow-red), 0 8px 32px rgba(0,0,0,0.5)',
          animation: 'glow 3s ease-in-out infinite',
          transition: 'transform 0.3s',
          marginBottom: '32px',
        }}>
          <span style={{ fontSize: '48px', marginBottom: '4px' }}>📷</span>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600, letterSpacing: '2px' }}>相机</span>
        </div>

        {/* 次级按钮 */}
        <div style={{ display: 'flex', gap: '24px', animation: 'fadeInUp 0.6s ease 0.2s both' }}>
          <button onClick={() => navigate('/commission')} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            background: 'rgba(26,26,26,0.8)',
            border: '1px solid var(--border-dark)',
            borderRadius: '12px', padding: '20px 28px',
            cursor: 'pointer', color: '#f0e6d3',
            fontFamily: 'var(--font-serif)',
            transition: 'all 0.3s',
          }}>
            <span style={{ fontSize: '28px' }}>📁</span>
            <span style={{ fontSize: '13px' }}>新建案件</span>
          </button>

          <button onClick={() => navigate('/archive')} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            background: 'rgba(26,26,26,0.8)',
            border: '1px solid var(--border-dark)',
            borderRadius: '12px', padding: '20px 28px',
            cursor: 'pointer', color: '#f0e6d3',
            fontFamily: 'var(--font-serif)',
            transition: 'all 0.3s',
          }}>
            <span style={{ fontSize: '28px' }}>🗂️</span>
            <span style={{ fontSize: '13px' }}>档案库</span>
          </button>
        </div>
      </div>

      {/* 底部装饰 - 绳子 */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '20px', right: '20px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #6b5d4f, transparent)',
      }} />

      {/* 底部导航 */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        padding: '12px 0 20px',
        borderTop: '1px solid rgba(42,42,42,0.5)',
      }}>
        {[
          { icon: '🏠', label: '首页', active: true, path: '/home' },
          { icon: '💬', label: '消息', active: false, path: '/archive' },
          { icon: '👤', label: '我的', active: false, path: '/profile' },
        ].map((item, i) => (
          <div key={i} onClick={() => item.path && navigate(item.path)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            cursor: item.path ? 'pointer' : 'default',
            opacity: item.active ? 1 : 0.5,
          }}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', color: item.active ? '#f0e6d3' : '#6b5d4f' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
