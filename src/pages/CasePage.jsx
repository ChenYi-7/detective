import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCase, saveCase, setCurrentCaseId, addBadge } from '../utils/storage'

export default function CasePage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showClue, setShowClue] = useState(false)
  const [stampAnim, setStampAnim] = useState(false)
  const [showCaseComplete, setShowCaseComplete] = useState(false)

  useEffect(() => {
    const data = getCase(caseId)
    if (data) {
      setCaseData(data)
      setCurrentCaseId(caseId)
      setShowClue(false)
      // 如果有待确认的线索，延迟显示
      const hasPending = data.clues?.some(c => c.clue_status === 'pending')
      if (hasPending) {
        setTimeout(() => setShowClue(true), 1500)
      }
    }
    setLoading(false)
  }, [caseId])

  const handleConfirmClue = () => {
    if (!caseData) return
    const updated = { ...caseData }
    const clue = updated.clues[updated.currentClueIndex]
    if (clue) {
      clue.clue_status = 'in_progress'
    }
    saveCase(updated)
    setCaseData(updated)
    navigate(`/task/${caseId}/${updated.currentClueIndex}`)
  }

  const handleStampComplete = () => {
    setStampAnim(true)
    // 添加启动徽章
    addBadge({
      id: 'badge_start_' + Date.now(),
      name: '启动徽章',
      icon: '',
      xp: 20,
      type: 'start',
    })
    setTimeout(() => {
      setStampAnim(false)
      // 首个案件（快速开工）完成后，跳转到委托案件页
      const allDone = caseData.clues?.every(c => c.clue_status === 'done')
      const isFirstCase = caseData.creation_mode === 'quick_capture'
      if (allDone && isFirstCase && !caseData.has_formal_goal) {
        setShowCaseComplete(true)
      }
    }, 2000)
  }

  if (loading) {
    return (
      <div className="page-container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0a',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid rgba(192,57,43,0.3)',
            borderTopColor: 'var(--red-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#a89880', fontSize: '14px' }}>正在进入案发现场...</p>
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="page-container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0a',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#a89880', marginBottom: '16px' }}>案件未找到</p>
          <button onClick={() => navigate('/home')} className="btn-primary">返回首页</button>
        </div>
      </div>
    )
  }

  const currentClue = caseData.clues?.[caseData.currentClueIndex]
  const completedCount = caseData.clues?.filter(c => c.clue_status === 'done').length || 0
  const totalCount = caseData.clues?.length || 0
  const isCompleted = caseData.case_status === 'completed'

  return (
    <div className="page-container page-transition" style={{
      background: '#0a0a0a',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 推理墙背景 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 50% 20%, rgba(255,200,100,${0.05 + completedCount * 0.03}) 0%, transparent 50%),
          linear-gradient(180deg, #0a0a0a 0%, #111010 50%, #0a0a0a 100%)
        `,
      }} />

      {/* 黑雾效果 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 30%, transparent ${20 + completedCount * 15}%, rgba(0,0,0,0.7) 70%)`,
        animation: 'fogDrift 8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* 吊灯 */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        animation: 'lampSway 4s ease-in-out infinite',
        zIndex: 5,
      }}>
        <div style={{
          width: '2px', height: '30px',
          background: '#6b5d4f',
          margin: '0 auto',
        }} />
        <div style={{
          width: '40px', height: '20px',
          background: 'linear-gradient(180deg, #3a3a3a, #1a1a1a)',
          borderRadius: '0 0 50% 50%',
          margin: '0 auto',
          boxShadow: `0 10px 40px rgba(255,200,100,${0.1 + completedCount * 0.05})`,
        }} />
        <div style={{
          width: '8px', height: '8px',
          background: `rgba(255,200,100,${0.6 + completedCount * 0.1})`,
          borderRadius: '50%',
          margin: '2px auto 0',
          boxShadow: `0 0 20px rgba(255,200,100,${0.3 + completedCount * 0.1})`,
          animation: 'flicker 3s infinite',
        }} />
      </div>

      {/* 顶部栏 */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '48px 16px 12px',
      }}>
        <div style={{
          background: 'rgba(26,26,26,0.8)',
          border: '1px solid var(--border-dark)',
          borderRadius: '8px',
          padding: '8px 14px',
          fontSize: '12px', color: '#a89880',
        }}>
          案件面板 · {completedCount}/{totalCount}
        </div>
        <div onClick={() => navigate('/home')} style={{
          color: '#a89880', fontSize: '14px', cursor: 'pointer',
          padding: '8px 12px',
        }}>返回</div>
      </div>

      {/* 线索展示区 - 两行排布 */}
      <div style={{
        position: 'relative', zIndex: 4,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 16px 16px',
        gap: '12px',
      }}>
        {[0, 1].map(row => {
          const rowClues = caseData.clues?.filter((_, i) => {
            const half = Math.ceil((caseData.clues?.length || 0) / 2)
            return row === 0 ? i < half : i >= half
          }) || []
          const rowStartIndex = row === 0 ? 0 : Math.ceil((caseData.clues?.length || 0) / 2)
          return (
            <div key={row} style={{
              position: 'relative',
              width: '100%',
              animation: 'ropeSway 4s ease-in-out infinite',
              animationDelay: `${row * 0.5}s`,
            }}>
              {/* 绳子 */}
              <div style={{
                position: 'absolute',
                top: '10px', left: '10%', right: '10%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #6b5d4f 10%, #8b7d6b 50%, #6b5d4f 90%, transparent)',
              }} />
              {/* 线索卡片 */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px 8px 8px',
                flexWrap: 'wrap',
              }}>
                {rowClues.map((c) => {
                  const globalIndex = caseData.clues.indexOf(c)
                  const rotation = (globalIndex % 2 === 0 ? -1 : 1) * (1.5 + (globalIndex % 3))
                  const isCurrent = globalIndex === caseData.currentClueIndex
                  const isDone = c.clue_status === 'done'
                  const isBlank = c.clue_status === 'blank'
                  const isPending = c.clue_status === 'pending' || c.clue_status === 'in_progress'
                  return (
                    <div key={c.id || globalIndex} onClick={() => {
                      if (isPending) navigate(`/task/${caseId}/${globalIndex}`)
                    }} style={{
                      background: '#f5f0e8',
                      padding: '8px 8px 28px',
                      boxShadow: isDone
                        ? '0 2px 12px rgba(212,160,23,0.3)'
                        : isCurrent
                          ? '0 4px 20px rgba(192,57,43,0.4)'
                          : '0 2px 8px rgba(0,0,0,0.4)',
                      transform: `rotate(${rotation}deg)`,
                      animation: isBlank
                        ? undefined
                        : isCurrent
                          ? 'redPulse 2s ease-in-out infinite'
                          : isDone
                            ? 'goldGlow 3s ease-in-out infinite'
                            : `cardReveal 0.6s ease ${globalIndex * 0.15}s both`,
                      position: 'relative',
                      width: '100px',
                      borderRadius: '3px',
                      cursor: isPending ? 'pointer' : 'default',
                      transition: 'transform 0.3s ease',
                      ['--card-rotate']: `${rotation}deg`,
                    }}>
                      {/* 夹子 */}
                      <div style={{
                        position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                        width: '18px', height: '14px',
                        background: 'linear-gradient(180deg, #a08060, #7a5c3a)',
                        borderRadius: '2px 2px 4px 4px',
                        zIndex: 5,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }} />
                      {/* 相纸内容 */}
                      {isDone ? (
                        <div style={{
                          width: '84px', height: '72px',
                          background: 'linear-gradient(135deg, rgba(192,57,43,0.06), rgba(212,160,23,0.08))',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          position: 'relative',
                          borderRadius: '2px',
                        }}>
                          <span style={{ fontSize: '10px', color: '#6b5d4f', fontFamily: 'var(--font-serif)' }}>已完成</span>
                          {/* 盖章 */}
                          <div style={{
                            position: 'absolute', bottom: '4px', right: '4px',
                            width: '28px', height: '28px',
                            border: '2px solid var(--red-primary)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transform: 'rotate(-15deg)',
                            background: 'rgba(192,57,43,0.08)',
                          }}>
                            <span style={{ color: 'var(--red-primary)', fontSize: '8px', fontWeight: 'bold', fontFamily: 'var(--font-calligraphy)' }}>
                              {c.is_activation_clue ? '启动' : '完成'}
                            </span>
                          </div>
                        </div>
                      ) : isBlank ? (
                        <div style={{
                          width: '84px', height: '72px',
                          background: 'rgba(30,28,25,0.9)',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '2px',
                          border: '1px dashed rgba(107,93,79,0.3)',
                        }}>
                          {/* 黑雾遮罩 */}
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(10,10,10,0.95) 100%)',
                            animation: 'fogDisperse 1.5s ease forwards',
                            animationDelay: `${globalIndex * 0.3}s`,
                            zIndex: 2,
                          }} />
                          {/* 锁图标 */}
                          <span style={{ fontSize: '16px', opacity: 0.4, position: 'relative', zIndex: 1 }}>🔒</span>
                          <span style={{ color: '#5a4e42', fontSize: '8px', marginTop: '4px', position: 'relative', zIndex: 1, fontFamily: 'var(--font-serif)' }}>待解锁</span>
                        </div>
                      ) : (
                        <div style={{
                          width: '84px', height: '72px',
                          background: isCurrent ? 'linear-gradient(135deg, #1a1210, #2a1a15)' : 'rgba(26,26,26,0.9)',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          padding: '6px',
                          borderRadius: '2px',
                          border: isCurrent ? '1px solid rgba(192,57,43,0.4)' : 'none',
                        }}>
                          <span style={{ color: '#f0e6d3', fontSize: '9px', fontWeight: 600, textAlign: 'center', lineHeight: 1.4, pointerEvents: 'none', fontFamily: 'var(--font-serif)' }}>
                            {c.task_title}
                          </span>
                          <span style={{ color: '#8b7d6b', fontSize: '8px', marginTop: '4px', pointerEvents: 'none' }}>⏱ {c.estimated_time}</span>
                        </div>
                      )}
                      {/* 线索编号 */}
                      <div style={{
                        position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)',
                        fontSize: '8px', color: '#8b7d6b', fontFamily: 'var(--font-serif)',
                        whiteSpace: 'nowrap',
                      }}>
                        {c.is_activation_clue ? '🔍 启动' : `线索 ${globalIndex + 1}`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* AI识别状态 */}
      {currentClue?.clue_status === 'pending' && !showClue && (
        <div style={{
          position: 'relative', zIndex: 10,
          textAlign: 'center', padding: '20px',
          animation: 'fadeIn 0.5s ease',
        }}>
          <div style={{
            fontSize: '32px', marginBottom: '8px',
            animation: 'magnify 2s ease-in-out infinite',
          }}>🔍</div>
          <p style={{ color: '#a89880', fontSize: '14px' }}>侦探正在寻找突破口...</p>
        </div>
      )}

      {/* 线索卡 */}
      {currentClue && showClue && currentClue.clue_status === 'pending' && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          zIndex: 10,
          background: 'linear-gradient(180deg, transparent, rgba(10,10,10,0.95) 20%)',
          padding: '40px 20px 24px',
          animation: 'fadeInUp 0.5s ease',
        }}>
          <div style={{
            background: 'rgba(26,26,26,0.9)',
            border: '1px solid var(--border-dark)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '12px',
            }}>
              <span style={{
                background: 'var(--red-primary)',
                color: '#fff', fontSize: '11px',
                padding: '3px 10px', borderRadius: '10px',
                fontWeight: 600,
              }}>
                {currentClue.is_activation_clue ? '启动线索' : `任务${caseData.currentClueIndex + 1}`}
              </span>
              <span style={{ fontSize: '12px', color: '#6b5d4f' }}>
                ⏱ {currentClue.estimated_time}
              </span>
            </div>
            <h3 style={{
              color: '#f0e6d3', fontSize: '18px',
              marginBottom: '8px',
              fontFamily: 'var(--font-serif)',
            }}>{currentClue.task_title}</h3>
            <p style={{
              color: '#a89880', fontSize: '13px',
              lineHeight: 1.6, marginBottom: '16px',
            }}>{currentClue.task_desc}</p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleConfirmClue} className="btn-primary" style={{ flex: 1 }}>
                确认线索
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 案件完成状态 */}
      {isCompleted && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          zIndex: 10, textAlign: 'center',
          padding: '40px 20px',
          background: 'linear-gradient(180deg, transparent, rgba(10,10,10,0.95))',
          animation: 'fadeInUp 0.8s ease',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
          <h2 style={{ color: '#f0e6d3', fontSize: '22px', marginBottom: '8px' }}>案件告破！</h2>
          <p style={{ color: '#a89880', fontSize: '14px', marginBottom: '20px' }}>
            所有线索已完成，推理墙全亮
          </p>
          <button onClick={() => navigate('/archive')} className="btn-primary">
            查看结案报告
          </button>
        </div>
      )}

      {/* 首个案件完成 - 跳转委托页 */}
      {showCaseComplete && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.5s ease',
        }}>
          <div style={{ animation: 'stamp 0.6s ease-out', marginBottom: '24px' }}>
            <div style={{
              width: '100px', height: '100px',
              border: '3px solid var(--red-primary)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'rotate(-15deg)',
              background: 'rgba(192,57,43,0.15)',
            }}>
              <span style={{
                color: 'var(--red-primary)',
                fontFamily: 'var(--font-calligraphy)',
                fontSize: '28px', fontWeight: 'bold',
              }}>结案</span>
            </div>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-calligraphy)',
            fontSize: '24px', color: '#f0e6d3',
            textAlign: 'center', marginBottom: '12px',
            animation: 'fadeInUp 0.5s ease 0.3s both',
          }}>桌面已整理完毕！</h2>
          <p style={{
            fontSize: '14px', color: '#a89880',
            textAlign: 'center', marginBottom: '32px', lineHeight: 1.6,
            animation: 'fadeInUp 0.5s ease 0.5s both',
            maxWidth: '280px',
          }}>
            侦探已清除障碍。<br />现在，告诉我你真正想完成的目标是什么？
          </p>
          <div style={{
            display: 'flex', gap: '12px', width: '100%', maxWidth: '300px',
            animation: 'fadeInUp 0.5s ease 0.7s both',
          }}>
            <button onClick={() => navigate('/commission')}
              className="btn-primary" style={{ flex: 2, fontSize: '15px' }}>
              委托新案件
            </button>
            <button onClick={() => navigate('/home')} className="btn-secondary"
              style={{ flex: 1, fontSize: '13px' }}>
              稍后
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
