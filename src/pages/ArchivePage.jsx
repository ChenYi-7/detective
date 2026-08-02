import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCases, saveCase } from '../utils/storage'

export default function ArchivePage() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [filter, setFilter] = useState('all') // all | active | completed | cold

  useEffect(() => {
    setCases(getCases())
  }, [])

  const filteredCases = cases.filter(c => {
    if (filter === 'all') return true
    if (filter === 'active') return c.case_status === 'active' || c.case_status === 'waiting_evidence'
    if (filter === 'completed') return c.case_status === 'completed'
    if (filter === 'cold') return c.case_status === 'cold_case'
    return true
  }).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active': return { label: '进行中', color: '#e74c3c', icon: '' }
      case 'completed': return { label: '已结案', color: '#27ae60', icon: '' }
      case 'cold_case': return { label: '冷案', color: '#7f8c8d', icon: '' }
      case 'archived': return { label: '已归档', color: '#6b5d4f', icon: '' }
      case 'draft': return { label: '草稿', color: '#f39c12', icon: '' }
      default: return { label: status, color: '#a89880', icon: '' }
    }
  }

  const handleCaseClick = (caseData) => {
    if (caseData.case_status === 'cold_case') {
      // 重启案件
      if (confirm('重启此案？恢复原任务树和推理墙进度。')) {
        saveCase({ ...caseData, case_status: 'active' })
        setCases(getCases())
        navigate(`/case/${caseData.id}`)
      }
    } else {
      navigate(`/case/${caseData.id}`)
    }
  }

  const formatDate = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
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
        }}>档案库</h2>
      </div>

      {/* 筛选标签 */}
      <div style={{
        display: 'flex', gap: '8px', padding: '12px 20px',
        overflowX: 'auto', borderBottom: '1px solid rgba(42,42,42,0.3)',
      }}>
        {[
          { key: 'all', label: '全部' },
          { key: 'active', label: '进行中' },
          { key: 'completed', label: '已结案' },
          { key: 'cold', label: '冷案' },
        ].map(item => (
          <button key={item.key} onClick={() => setFilter(item.key)} style={{
            padding: '6px 16px', borderRadius: '16px',
            background: filter === item.key ? 'var(--red-primary)' : 'rgba(26,26,26,0.8)',
            color: filter === item.key ? '#fff' : '#a89880',
            border: 'none', fontSize: '12px',
            fontFamily: 'var(--font-serif)',
            cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'all 0.3s',
          }}>{item.label}</button>
        ))}
      </div>

      {/* 案件列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {filteredCases.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            color: '#6b5d4f',
          }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🗂️</span>
            <p style={{ fontSize: '14px' }}>还没有案件档案</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>拍张照片或新建案件开始吧</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredCases.map((c, i) => {
              const statusInfo = getStatusInfo(c.case_status)
              const completedClues = c.clues?.filter(cl => cl.clue_status === 'done').length || 0
              const totalClues = c.clues?.length || 0
              return (
                <div key={c.id} onClick={() => handleCaseClick(c)} style={{
                  background: 'rgba(26,26,26,0.6)',
                  border: '1px solid var(--border-dark)',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  animation: `fadeInUp 0.4s ease ${i * 0.05}s both`,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* 文件夹标签 */}
                  <div style={{
                    position: 'absolute', top: 0, right: '20px',
                    width: '60px', height: '16px',
                    background: statusInfo.color,
                    borderRadius: '0 0 4px 4px',
                    opacity: 0.8,
                  }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {/* 文件夹图标 */}
                    <div style={{
                      width: '48px', height: '48px',
                      background: 'linear-gradient(135deg, #2c1810, #1a0f0a)',
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '24px', flexShrink: 0,
                      border: '1px solid rgba(192,57,43,0.2)',
                    }}>📁</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '15px', color: '#f0e6d3',
                        fontWeight: 600, marginBottom: '4px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{c.case_name || '未命名案件'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '11px', color: statusInfo.color,
                          background: `${statusInfo.color}15`,
                          padding: '2px 8px', borderRadius: '8px',
                        }}>{statusInfo.icon} {statusInfo.label}</span>
                        <span style={{ fontSize: '11px', color: '#6b5d4f' }}>
                          {completedClues}/{totalClues} 线索
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#4a3f35', marginTop: '4px' }}>
                        {formatDate(c.updatedAt)}
                      </div>
                    </div>

                    <div style={{ color: '#6b5d4f', fontSize: '16px' }}>→</div>
                  </div>

                  {/* 进度条 */}
                  {totalClues > 0 && (
                    <div style={{
                      marginTop: '12px', height: '3px',
                      background: 'rgba(42,42,42,0.5)',
                      borderRadius: '2px', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(completedClues / totalClues) * 100}%`,
                        background: c.case_status === 'completed'
                          ? 'linear-gradient(90deg, #27ae60, #2ecc71)'
                          : 'linear-gradient(90deg, var(--red-primary), var(--red-light))',
                        borderRadius: '2px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 统计 */}
      {cases.length > 0 && (
        <div style={{
          padding: '12px 20px 20px',
          borderTop: '1px solid var(--border-dark)',
          display: 'flex', justifyContent: 'space-around',
        }}>
          {[
            { label: '总案件', value: cases.length },
            { label: '进行中', value: cases.filter(c => c.case_status === 'active').length },
            { label: '已结案', value: cases.filter(c => c.case_status === 'completed').length },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', color: '#f0e6d3', fontWeight: 700 }}>{item.value}</div>
              <div style={{ fontSize: '11px', color: '#6b5d4f' }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
