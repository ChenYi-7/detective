import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCase, saveCase, addBadge } from '../utils/storage'
import { fileToBase64, simplifyTask } from '../utils/api'

export default function TaskPage() {
  const { caseId, clueIndex } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState(null)
  const [clue, setClue] = useState(null)
  const [showComplete, setShowComplete] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [uploadImage, setUploadImage] = useState(null)
  const [showStamp, setShowStamp] = useState(false)
  const [caseBonusXP, setCaseBonusXP] = useState(0)
  const [simplifying, setSimplifying] = useState(false)

  useEffect(() => {
    const data = getCase(caseId)
    if (data && data.clues) {
      const idx = parseInt(clueIndex)
      const currentClue = data.clues[idx]
      setCaseData(data)
      setClue(currentClue)
    }
  }, [caseId, clueIndex])

  const handleComplete = async () => {
    if (!caseData || !clue) return
    setCompleting(true)

    const isActivation = clue.is_activation_clue

    if (isActivation) {
      // 轻量完成确认
      await new Promise(r => setTimeout(r, 800))
      const updated = { ...caseData }
      updated.clues[parseInt(clueIndex)].clue_status = 'done'
      updated.completedClues = (updated.completedClues || 0) + 1
      // 检查是否全部完成
      const allDone = updated.clues.every(c => c.clue_status === 'done')
      if (allDone) {
        updated.case_status = 'completed'
      } else {
        const nextIdx = updated.clues.findIndex(c => c.clue_status === 'blank')
        if (nextIdx >= 0) {
          updated.clues[nextIdx].clue_status = 'pending'
          updated.currentClueIndex = nextIdx
        }
      }
      saveCase(updated)
      setCaseData(updated)
      setShowStamp(true)
      addBadge({
        id: 'badge_start_' + Date.now(),
        name: '启动徽章',
        icon: '',
        xp: 20,
        type: 'start',
      })
      setTimeout(() => {
        setCompleting(false)
        setShowStamp(false)
        if (allDone) {
          navigate(`/case/${caseId}`)
        } else {
          const nextIdx = updated.clues.findIndex(c => c.clue_status === 'pending')
          if (nextIdx >= 0) {
            navigate(`/task/${caseId}/${nextIdx}`)
          } else {
            navigate(`/case/${caseId}`)
          }
        }
      }, 2500)
    } else {
      // 需要验证
      if (!uploadImage) {
        // 信任制完成
        const updated = { ...caseData }
        updated.clues[parseInt(clueIndex)].clue_status = 'done'
        updated.completedClues = (updated.completedClues || 0) + 1
        // 检查是否全部完成
        const allDone = updated.clues.every(c => c.clue_status === 'done')
        if (allDone) {
          updated.case_status = 'completed'
        } else {
          const nextIdx = updated.clues.findIndex(c => c.clue_status === 'blank')
          if (nextIdx >= 0) {
            updated.clues[nextIdx].clue_status = 'pending'
            updated.currentClueIndex = nextIdx
          }
        }
        saveCase(updated)
        addBadge({
          id: 'badge_silver_' + Date.now(),
          name: '银质证物章',
          icon: '',
          xp: 8,
          type: 'silver',
        })
        // 案件全部完成奖励
        if (allDone) {
          const bonusXP = 30
          setCaseBonusXP(bonusXP)
          addBadge({
            id: 'badge_case_done_' + Date.now(),
            name: '案件告破',
            icon: '',
            xp: bonusXP,
            type: 'gold',
          })
        } else {
          setCaseBonusXP(0)
        }
        setShowStamp(true)
        setTimeout(() => {
          setCompleting(false)
          setShowStamp(false)
          if (allDone) {
            navigate(`/case/${caseId}`)
          } else {
            const nextIdx = updated.clues.findIndex(c => c.clue_status === 'pending')
            if (nextIdx >= 0) {
              navigate(`/task/${caseId}/${nextIdx}`)
            } else {
              navigate(`/case/${caseId}`)
            }
          }
        }, 2500)
      } else {
        // 有图片验证 - 信任制通过
        const updated = { ...caseData }
        updated.clues[parseInt(clueIndex)].clue_status = 'done'
        updated.clues[parseInt(clueIndex)].evidence_photo = uploadImage
        updated.completedClues = (updated.completedClues || 0) + 1
        const allDone = updated.clues.every(c => c.clue_status === 'done')
        if (allDone) {
          updated.case_status = 'completed'
        } else {
          const nextIdx = updated.clues.findIndex(c => c.clue_status === 'blank')
          if (nextIdx >= 0) {
            updated.clues[nextIdx].clue_status = 'pending'
            updated.currentClueIndex = nextIdx
          }
        }
        saveCase(updated)
        addBadge({
          id: 'badge_gold_' + Date.now(),
          name: '金质证物章',
          icon: '',
          xp: 15,
          type: 'gold',
        })
        // 案件全部完成 + 全照片奖励
        if (allDone) {
          const hasPhoto = updated.clues.every(c => c.evidence_photo)
          const bonusXP = hasPhoto ? 50 : 30
          setCaseBonusXP(bonusXP)
          addBadge({
            id: 'badge_case_done_' + Date.now(),
            name: hasPhoto ? '完美结案' : '案件告破',
            icon: '',
            xp: bonusXP,
            type: 'gold',
          })
        } else {
          setCaseBonusXP(0)
        }
        setShowStamp(true)
        setTimeout(() => {
          setCompleting(false)
          setShowStamp(false)
          if (allDone) {
            navigate(`/case/${caseId}`)
          } else {
            const nextIdx = updated.clues.findIndex(c => c.clue_status === 'pending')
            if (nextIdx >= 0) {
              navigate(`/task/${caseId}/${nextIdx}`)
            } else {
              navigate(`/case/${caseId}`)
            }
          }
        }, 2500)
      }
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToBase64(file)
    setUploadImage(dataUrl)
  }

  const handleSimplify = async () => {
    if (!caseData || !clue || simplifying) return
    setSimplifying(true)
    try {
      const result = await simplifyTask(caseData.photo, clue.task_title, clue.task_desc)
      const updated = { ...caseData }
      updated.clues[parseInt(clueIndex)] = {
        ...updated.clues[parseInt(clueIndex)],
        task_title: result.task_title,
        task_desc: result.task_desc,
        estimated_time: result.estimated_time || '1分钟',
      }
      saveCase(updated)
      setCaseData(updated)
      setClue(updated.clues[parseInt(clueIndex)])
    } catch {
      const updated = { ...caseData }
      updated.clues[parseInt(clueIndex)] = {
        ...updated.clues[parseInt(clueIndex)],
        task_title: `先做${clue.task_title}的一小部分`,
        task_desc: '不用完成整个任务，先做一点点就好。哪怕只是开始动手，也是进步。',
        estimated_time: '1分钟',
      }
      saveCase(updated)
      setCaseData(updated)
      setClue(updated.clues[parseInt(clueIndex)])
    }
    setSimplifying(false)
  }

  if (!caseData || !clue) {
    return (
      <div className="page-container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0a',
      }}>
        <p style={{ color: '#a89880' }}>任务未找到</p>
      </div>
    )
  }

  return (
    <div className="page-container page-transition" style={{
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111010 50%, #0a0a0a 100%)',
    }}>
      {/* 顶部栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '16px 20px',
        borderBottom: '1px solid var(--border-dark)',
      }}>
        <div onClick={() => navigate(`/case/${caseId}`)} style={{
          color: '#a89880', fontSize: '20px', cursor: 'pointer', marginRight: '16px',
        }}>←</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', color: '#6b5d4f' }}>
            {caseData.case_name}
          </div>
          <div style={{ fontSize: '14px', color: '#f0e6d3', fontWeight: 600 }}>
            {clue.is_activation_clue ? '启动线索' : `任务 ${parseInt(clueIndex) + 1}`}
          </div>
        </div>
        <div style={{
          background: clue.verification_level === 'high' ? 'rgba(212,160,23,0.2)' : 'rgba(189,195,199,0.2)',
          color: clue.verification_level === 'high' ? 'var(--gold)' : 'var(--silver)',
          fontSize: '10px', padding: '3px 8px', borderRadius: '8px',
        }}>
          {clue.verification_level === 'high' ? '高可验证' : '低可验证'}
        </div>
      </div>

      {/* 内容区 */}
      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
        {/* 侦探动画 */}
        <div style={{
          textAlign: 'center', marginBottom: '24px',
          animation: 'detectiveBounce 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: '64px', display: 'block' }}>🕵️</span>
          <div style={{
            display: 'inline-block',
            animation: 'magnify 2s ease-in-out infinite',
            fontSize: '24px', marginTop: '-10px',
          }}>🔍</div>
        </div>

        {/* 任务信息 */}
        <div style={{
          background: 'rgba(26,26,26,0.8)',
          border: '1px solid var(--border-dark)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          animation: 'fadeInUp 0.5s ease',
        }}>
          <h3 style={{
            color: '#f0e6d3', fontSize: '20px',
            marginBottom: '12px',
            fontFamily: 'var(--font-serif)',
          }}>{clue.task_title}</h3>
          <p style={{
            color: '#a89880', fontSize: '14px',
            lineHeight: 1.7, marginBottom: '16px',
          }}>{clue.task_desc}</p>
          <div style={{
            display: 'flex', gap: '12px', fontSize: '12px',
          }}>
            <span style={{ color: '#6b5d4f' }}>⏱ {clue.estimated_time}</span>
            {clue.objects_found && clue.objects_found.length > 0 && (
              <span style={{ color: '#6b5d4f' }}>
                发现: {clue.objects_found.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* 证据上传（非启动线索） */}
        {!clue.is_activation_clue && (
          <div style={{
            background: 'rgba(26,26,26,0.5)',
            border: '1px dashed var(--border-dark)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px',
            animation: 'fadeInUp 0.5s ease 0.1s both',
          }}>
            {uploadImage ? (
              <div>
                <img src={uploadImage} style={{
                  maxWidth: '100%', maxHeight: '200px',
                  borderRadius: '8px', marginBottom: '12px',
                }} />
                <p style={{ fontSize: '12px', color: '#07c160' }}>证据已上传</p>
              </div>
            ) : (
              <>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></span>
                <p style={{ fontSize: '13px', color: '#a89880', marginBottom: '12px' }}>
                  拍照或上传证据完成验证
                </p>
                <button onClick={() => document.getElementById('evidence-upload').click()}
                  className="btn-secondary" style={{ fontSize: '13px' }}>
                  上传证据
                </button>
                <input id="evidence-upload" type="file" accept="image/*"
                  onChange={handleImageUpload} style={{ display: 'none' }} />
              </>
            )}
          </div>
        )}

        {/* 求救入口 */}
        <div style={{
          textAlign: 'center', marginBottom: '20px',
          animation: 'fadeIn 0.5s ease 0.2s both',
        }}>
          <button onClick={handleSimplify} disabled={simplifying} style={{
            background: 'transparent', border: 'none',
            color: simplifying ? '#c0392b' : '#6b5d4f', fontSize: '13px',
            cursor: simplifying ? 'default' : 'pointer', fontFamily: 'var(--font-serif)',
            textDecoration: 'underline',
            opacity: simplifying ? 0.7 : 1,
          }}>
            {simplifying ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{
                  width: '12px', height: '12px',
                  border: '2px solid rgba(192,57,43,0.3)',
                  borderTopColor: 'var(--red-primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                侦探正在重新分析...
              </span>
            ) : '太难了，缩小任务'}
          </button>
        </div>
      </div>

      {/* 完成任务按钮 */}
      <div style={{
        padding: '16px 20px 24px',
        borderTop: '1px solid var(--border-dark)',
      }}>
        <button onClick={handleComplete} className="btn-primary"
          style={{ width: '100%', fontSize: '16px' }}
          disabled={completing}>
          {completing ? '处理中...' : '完成任务'}
        </button>
      </div>

      {/* 完成确认弹窗 */}
      {showComplete && !showStamp && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #d4c5a9, #c4b599)',
            borderRadius: '8px', padding: '28px 24px',
            maxWidth: '320px', width: '100%',
            animation: 'scaleIn 0.3s ease',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-calligraphy)',
              fontSize: '20px', color: '#2c1810',
              textAlign: 'center', marginBottom: '12px',
            }}>确认完成任务？</h3>
            <p style={{
              fontSize: '13px', color: '#6b5d4f',
              textAlign: 'center', marginBottom: '20px',
            }}>
              {clue.is_activation_clue
                ? '启动线索采用轻量确认，无需严格验证'
                : uploadImage ? '证据已上传，确认提交验证' : '未上传证据，将以信任制完成（银章）'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowComplete(false)} className="btn-secondary"
                style={{ flex: 1, color: '#2c1810', borderColor: '#8b7d6b' }}>
                再想想
              </button>
              <button onClick={handleComplete} className="btn-primary" style={{ flex: 1 }}>
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 盖章动画 */}
      {showStamp && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ animation: 'stamp 0.6s ease-out' }}>
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
                fontSize: '24px', fontWeight: 'bold',
              }}>
                {clue.is_activation_clue ? '启动' : clue.verification_level === 'high' ? '金章' : '银章'}
              </span>
            </div>
          </div>
          <p style={{
            color: '#f0e6d3', fontSize: '16px',
            marginTop: '20px',
            animation: 'fadeInUp 0.5s ease 0.5s both',
          }}>
            {clue.is_activation_clue ? '线索一完成！' : '任务完成！'}
          </p>
          <p style={{
            color: '#a89880', fontSize: '13px',
            marginTop: '8px',
            animation: 'fadeIn 0.5s ease 0.8s both',
          }}>
            {clue.is_activation_clue
              ? '获得启动徽章 +20 XP'
              : uploadImage
                ? `获得金质证物章 +15 XP${caseBonusXP > 0 ? ` | 结案奖励 +${caseBonusXP} XP` : ''}`
                : `获得银质证物章 +8 XP${caseBonusXP > 0 ? ` | 结案奖励 +${caseBonusXP} XP` : ''}`}
          </p>
        </div>
      )}
    </div>
  )
}
