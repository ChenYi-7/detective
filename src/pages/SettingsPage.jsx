import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSettings, saveSettings, saveAppState } from '../utils/storage'

export default function SettingsPage({ appState, setAppState }) {
  const navigate = useNavigate()
  const [settings, setSettingsState] = useState(getSettings())

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettingsState(newSettings)
    saveSettings(newSettings)
  }

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      localStorage.clear()
      saveAppState({ hasLaunched: false, isLoggedIn: false, isGuest: false })
      setAppState({ hasLaunched: false, isLoggedIn: false, isGuest: false })
      navigate('/login')
    }
  }

  const handleVacationMode = () => {
    updateSetting('vacationMode', !settings.vacationMode)
  }

  const SettingItem = ({ icon, label, children, onClick }) => (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center',
      padding: '16px',
      borderBottom: '1px solid rgba(42,42,42,0.3)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background 0.3s',
    }}>
      <span style={{ fontSize: '18px', marginRight: '12px', width: '24px', textAlign: 'center' }}>{icon}</span>
      <span style={{ flex: 1, color: '#f0e6d3', fontSize: '14px' }}>{label}</span>
      {children}
    </div>
  )

  const Toggle = ({ checked, onChange }) => (
    <div onClick={(e) => { e.stopPropagation(); onChange(!checked) }} style={{
      width: '44px', height: '24px',
      background: checked ? 'var(--red-primary)' : 'rgba(42,42,42,0.8)',
      borderRadius: '12px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.3s',
    }}>
      <div style={{
        width: '20px', height: '20px',
        background: '#fff',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: checked ? '22px' : '2px',
        transition: 'left 0.3s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </div>
  )

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
        }}>设置</h2>
      </div>

      {/* 设置列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
        {/* 账号与安全 */}
        <div style={{
          background: 'rgba(26,26,26,0.6)',
          border: '1px solid var(--border-dark)',
          borderRadius: '12px', overflow: 'hidden',
          marginBottom: '16px',
          animation: 'fadeInUp 0.4s ease',
        }}>
          <SettingItem icon="" label="账号与安全" >
            <span style={{ color: '#6b5d4f', fontSize: '14px' }}>→</span>
          </SettingItem>
          <SettingItem icon="" label="隐私设置">
            <span style={{ color: '#6b5d4f', fontSize: '14px' }}>→</span>
          </SettingItem>
        </div>

        {/* 通知与显示 */}
        <div style={{
          background: 'rgba(26,26,26,0.6)',
          border: '1px solid var(--border-dark)',
          borderRadius: '12px', overflow: 'hidden',
          marginBottom: '16px',
          animation: 'fadeInUp 0.4s ease 0.05s both',
        }}>
          <SettingItem icon="" label="通知设置">
            <Toggle checked={true} onChange={() => {}} />
          </SettingItem>
          <SettingItem icon="" label="减弱动效">
            <Toggle checked={settings.reduceMotion} onChange={v => updateSetting('reduceMotion', v)} />
          </SettingItem>
          <SettingItem icon="" label="深色模式">
            <Toggle checked={true} onChange={() => {}} />
          </SettingItem>
          <SettingItem icon="" label="单手模式">
            <Toggle checked={settings.oneHandMode} onChange={v => updateSetting('oneHandMode', v)} />
          </SettingItem>
        </div>

        {/* 休假模式 */}
        <div style={{
          background: settings.vacationMode
            ? 'rgba(192,57,43,0.1)'
            : 'rgba(26,26,26,0.6)',
          border: `1px solid ${settings.vacationMode ? 'rgba(192,57,43,0.3)' : 'var(--border-dark)'}`,
          borderRadius: '12px', overflow: 'hidden',
          marginBottom: '16px',
          animation: 'fadeInUp 0.4s ease 0.1s both',
        }}>
          <SettingItem icon="" label="休假模式" onClick={handleVacationMode}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                color: settings.vacationMode ? 'var(--red-primary)' : '#6b5d4f',
              }}>
                {settings.vacationMode ? '已开启（7天）' : '一键静音7天'}
              </span>
              <Toggle checked={settings.vacationMode} onChange={handleVacationMode} />
            </div>
          </SettingItem>
        </div>

        {/* 数据管理 */}
        <div style={{
          background: 'rgba(26,26,26,0.6)',
          border: '1px solid var(--border-dark)',
          borderRadius: '12px', overflow: 'hidden',
          marginBottom: '16px',
          animation: 'fadeInUp 0.4s ease 0.15s both',
        }}>
          <SettingItem icon="" label="数据管理">
            <span style={{ color: '#6b5d4f', fontSize: '14px' }}>→</span>
          </SettingItem>
          <SettingItem icon="" label="清除数据" onClick={handleClearData}>
            <span style={{ color: 'var(--red-primary)', fontSize: '13px' }}>清除</span>
          </SettingItem>
        </div>

        {/* 关于 */}
        <div style={{
          background: 'rgba(26,26,26,0.6)',
          border: '1px solid var(--border-dark)',
          borderRadius: '12px', overflow: 'hidden',
          animation: 'fadeInUp 0.4s ease 0.2s both',
        }}>
          <SettingItem icon="" label="关于开工侦探社">
            <span style={{ color: '#6b5d4f', fontSize: '12px' }}>v1.0.0</span>
          </SettingItem>
        </div>

        {/* 版本信息 */}
        <div style={{
          textAlign: 'center', padding: '20px',
          color: '#4a3f35', fontSize: '11px',
        }}>
          开工侦探社 v1.0.0 · Detective Club
        </div>
      </div>
    </div>
  )
}
