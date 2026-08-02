import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { generateTaskTree } from '../utils/api'
import { getCase, saveCase, generateId } from '../utils/storage'

export default function CommissionPage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [caseName, setCaseName] = useState('')
  const [materials, setMaterials] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [existingCase, setExistingCase] = useState(null)

  useEffect(() => {
    if (caseId) {
      const data = getCase(caseId)
      if (data) setExistingCase(data)
    }
  }, [caseId])

  const handleSubmit = async () => {
    if (!caseName.trim()) return alert('请输入案件名称')
    setAnalyzing(true)

    try {
      const result = await generateTaskTree(caseName, materials)

      if (existingCase) {
        // 更新已有案件
        const updated = {
          ...existingCase,
          case_name: caseName,
          case_status: 'active',
          has_formal_goal: true,
          clues: result.tasks.map((t, i) => ({
            id: `clue_${i + 1}`,
            task_title: t.task_title,
            task_desc: t.task_desc,
            estimated_time: t.estimated_time,
            verification_level: t.verification_level || 'low',
            clue_status: i === 0 ? 'pending' : 'blank',
            is_activation_clue: false,
          })),
          currentClueIndex: 0,
          completedClues: 0,
          updatedAt: Date.now(),
        }
        saveCase(updated)
        navigate(`/case/${existingCase.id}`)
      } else {
        // 创建新案件
        const newId = generateId()
        const newCase = {
          id: newId,
          case_name: caseName,
          creation_mode: 'commissioned',
          case_status: 'active',
          has_formal_goal: true,
          photo: null,
          clues: result.tasks.map((t, i) => ({
            id: `clue_${i + 1}`,
            task_title: t.task_title,
            task_desc: t.task_desc,
            estimated_time: t.estimated_time,
            verification_level: t.verification_level || 'low',
            clue_status: i === 0 ? 'pending' : 'blank',
            is_activation_clue: false,
          })),
          currentClueIndex: 0,
          completedClues: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        saveCase(newCase)
        localStorage.setItem('detective_current_case', newId)
        navigate(`/case/${newId}`)
      }
    } catch (err) {
      console.error('任务树生成失败:', err)
      alert('侦探迷路了，请重试')
    }
    setAnalyzing(false)
  }

  const handleArchive = () => {
    if (existingCase) {
      saveCase({ ...existingCase, case_status: 'archived' })
    }
    navigate('/archive')
  }

  return (
    <div className="page-container page-transition" style={{
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1008 50%, #0a0a0a 100%)',
      padding: '0',
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
        }}>委托案件</h2>
      </div>

      {/* 表单内容 */}
      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
        {/* 侦探动画 */}
        <div style={{
          textAlign: 'center', marginBottom: '20px',
          animation: 'detectiveBounce 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: '48px', display: 'block' }}>🕵️</span>
        </div>

        {/* 案件名称 */}
        <div style={{ marginBottom: '24px', animation: 'fadeInUp 0.5s ease' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#a89880', marginBottom: '8px' }}>
            案件名称
          </label>
          <input className="input-field"
            placeholder="例如：完成保研作品集信息架构"
            value={caseName}
            onChange={e => setCaseName(e.target.value)}
            style={{ fontSize: '16px' }}
          />
          <p style={{ fontSize: '11px', color: '#6b5d4f', marginTop: '6px' }}>
            代表你真正希望解决的目标
          </p>
        </div>

        {/* 任务描述 */}
        <div style={{ marginBottom: '24px', animation: 'fadeInUp 0.5s ease 0.1s both' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#a89880', marginBottom: '8px' }}>
            任务描述
          </label>
          <textarea className="input-field"
            placeholder="描述你想完成的事情。越具体，侦探拆解得越准确。\n\n例如：\n· 创建作品集选题，需要包含3个方向\n· 准备下周的汇报PPT，约15页\n· 学习React基础，能做出一个小项目"
            value={materials}
            onChange={e => setMaterials(e.target.value)}
            rows={5}
            style={{ fontSize: '14px', lineHeight: 1.7 }}
          />
          <p style={{ fontSize: '11px', color: '#6b5d4f', marginTop: '6px' }}>
            侦探会根据描述，将任务拆解为可执行的小步骤
          </p>
        </div>
      </div>

      {/* 底部按钮 */}
      <div style={{
        padding: '16px 20px 24px',
        borderTop: '1px solid var(--border-dark)',
        display: 'flex', gap: '12px',
      }}>
        {existingCase && (
          <button onClick={handleArchive} className="btn-secondary" style={{ flex: 1 }}>
            归档
          </button>
        )}
        <button onClick={handleSubmit} className="btn-primary" style={{ flex: existingCase ? 2 : 1 }}
          disabled={analyzing}>
          {analyzing ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{
                width: '16px', height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                display: 'inline-block',
              }} />
              正在拆解案件...
            </span>
          ) : '确认委托'}
        </button>
      </div>
    </div>
  )
}
