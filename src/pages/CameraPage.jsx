import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeDeskPhoto, fileToBase64 } from '../utils/api'
import { generateId, saveCase, setCurrentCaseId } from '../utils/storage'

export default function CameraPage() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [phase, setPhase] = useState(0) // 0=取景, 1=定格, 2=缩小, 3=相纸, 4=跳转
  const [error, setError] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setError('相机权限被拒绝。请允许相机访问，或使用相册上传。')
    }
  }

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const startTime = Date.now()
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setCapturedImage(dataUrl)
    setFlash(true)
    setTimeout(() => setFlash(false), 200)

    // 转场动画
    setPhase(1)
    setTimeout(() => setPhase(2), 600)
    setTimeout(() => setPhase(3), 1200)
    setTimeout(() => setPhase(4), 1800)

    // AI 分析
    setAnalyzing(true)
    let createdCaseId = null
    try {
      const result = await analyzeDeskPhoto(dataUrl)
      const cluesList = result.clues || [result]
      // 创建案件
      const caseId = generateId()
      const newCase = {
        id: caseId,
        case_name: '快速开工 - ' + new Date().toLocaleDateString(),
        creation_mode: 'quick_capture',
        case_status: 'active',
        has_formal_goal: false,
        photo: dataUrl,
        clues: cluesList.map((c, i) => ({
          id: 'clue_' + (i + 1),
          task_title: c.task_title,
          task_desc: c.task_desc,
          estimated_time: c.estimated_time,
          verification_level: c.verification_level || 'high',
          clue_status: i === 0 ? 'pending' : 'blank',
          is_activation_clue: i === 0,
          objects_found: c.objects_found || [],
        })),
        currentClueIndex: 0,
        completedClues: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      saveCase(newCase)
      setCurrentCaseId(caseId)
      createdCaseId = caseId
    } catch (err) {
      console.error('AI分析失败:', err)
      // 降级：创建默认案件
      const caseId = generateId()
      const newCase = {
        id: caseId,
        case_name: '快速开工 - ' + new Date().toLocaleDateString(),
        creation_mode: 'quick_capture',
        case_status: 'active',
        has_formal_goal: false,
        photo: dataUrl,
        clues: [
          { id: 'clue_1', task_title: '移走最显眼的杂物', task_desc: '侦探发现桌面上有显眼的杂物。先把它移到一边。', estimated_time: '2分钟', verification_level: 'high', clue_status: 'pending', is_activation_clue: true, objects_found: ['桌面杂物'] },
          { id: 'clue_2', task_title: '整理桌面左侧', task_desc: '把左侧物品归类整理。', estimated_time: '3分钟', verification_level: 'high', clue_status: 'blank', is_activation_clue: false, objects_found: ['桌面左侧'] },
        ],
        currentClueIndex: 0,
        completedClues: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      saveCase(newCase)
      setCurrentCaseId(caseId)
      createdCaseId = caseId
    }
    setAnalyzing(false)

    // 等待转场动画完成后跳转（确保案件已创建）
    const minDelay = 2500
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, minDelay - elapsed)
    setTimeout(() => {
      if (createdCaseId) {
        navigate(`/case/${createdCaseId}`)
      }
    }, remaining)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const startTime = Date.now()
    const dataUrl = await fileToBase64(file)
    setCapturedImage(dataUrl)
    setPhase(1)
    setTimeout(() => setPhase(2), 600)
    setTimeout(() => setPhase(3), 1200)
    setTimeout(() => setPhase(4), 1800)

    setAnalyzing(true)
    let createdCaseId = null
    try {
      const result = await analyzeDeskPhoto(dataUrl)
      const cluesList = result.clues || [result]
      const caseId = generateId()
      const newCase = {
        id: caseId,
        case_name: '快速开工 - ' + new Date().toLocaleDateString(),
        creation_mode: 'quick_capture',
        case_status: 'active',
        has_formal_goal: false,
        photo: dataUrl,
        clues: cluesList.map((c, i) => ({
          id: 'clue_' + (i + 1),
          task_title: c.task_title,
          task_desc: c.task_desc,
          estimated_time: c.estimated_time,
          verification_level: c.verification_level || 'high',
          clue_status: i === 0 ? 'pending' : 'blank',
          is_activation_clue: i === 0,
          objects_found: c.objects_found || [],
        })),
        currentClueIndex: 0,
        completedClues: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      saveCase(newCase)
      setCurrentCaseId(caseId)
      createdCaseId = caseId
    } catch {
      const caseId = generateId()
      saveCase({
        id: caseId, case_name: '快速开工', creation_mode: 'quick_capture',
        case_status: 'active', has_formal_goal: false, photo: dataUrl,
        clues: [
          { id: 'clue_1', task_title: '移走最显眼的杂物', task_desc: '先把它移到一边。', estimated_time: '2分钟', verification_level: 'high', clue_status: 'pending', is_activation_clue: true },
          { id: 'clue_2', task_title: '整理桌面左侧', task_desc: '把左侧物品归类。', estimated_time: '3分钟', verification_level: 'high', clue_status: 'blank', is_activation_clue: false },
        ],
        currentClueIndex: 0, completedClues: 0, createdAt: Date.now(), updatedAt: Date.now(),
      })
      setCurrentCaseId(caseId)
      createdCaseId = caseId
    }
    setAnalyzing(false)
    const minDelay = 2500
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, minDelay - elapsed)
    setTimeout(() => {
      if (createdCaseId) {
        navigate(`/case/${createdCaseId}`)
      }
    }, remaining)
  }

  return (
    <div className="page-container page-transition" style={{
      background: '#000', position: 'relative', overflow: 'hidden',
    }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 闪光灯效果 */}
      {flash && <div style={{
        position: 'absolute', inset: 0, background: '#fff',
        animation: 'fadeIn 0.1s ease', zIndex: 100,
      }} />}

      {/* 取景框 */}
      {phase === 0 && !error && (
        <>
          <video ref={videoRef} autoPlay playsInline muted style={{
            width: '100%', height: '100%', objectFit: 'cover',
          }} />

          {/* 四角取景框 */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos, i) => {
            const isTop = pos.includes('top')
            const isLeft = pos.includes('left')
            return (
              <div key={i} style={{
                position: 'absolute',
                [isTop ? 'top' : 'bottom']: '60px',
                [isLeft ? 'left' : 'right']: '30px',
                width: '40px', height: '40px',
                borderTop: isTop ? '3px solid #f0e6d3' : 'none',
                borderBottom: !isTop ? '3px solid #f0e6d3' : 'none',
                borderLeft: isLeft ? '3px solid #f0e6d3' : 'none',
                borderRight: !isLeft ? '3px solid #f0e6d3' : 'none',
              }} />
            )
          })}

          {/* 顶部返回 */}
          <div onClick={() => navigate(-1)} style={{
            position: 'absolute', top: '16px', left: '16px',
            color: '#fff', fontSize: '24px', cursor: 'pointer',
            zIndex: 10, padding: '8px',
          }}>←</div>

          {/* 底部控制栏 */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '20px', display: 'flex',
            justifyContent: 'space-around', alignItems: 'center',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          }}>
            {/* 相册 */}
            <div onClick={() => fileInputRef.current?.click()} style={{
              width: '50px', height: '50px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '24px',
            }}>🖼️</div>

            {/* 拍照按钮 */}
            <div onClick={handleCapture} style={{
              width: '72px', height: '72px', borderRadius: '50%',
              border: '4px solid #fff',
              background: 'radial-gradient(circle, #fff 40%, transparent 40%)',
              cursor: 'pointer', transition: 'transform 0.1s',
            }} />

            {/* 切换摄像头 */}
            <div style={{
              width: '50px', height: '50px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '20px',
            }}>🔄</div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload}
            style={{ display: 'none' }} />
        </>
      )}

      {/* 错误状态 */}
      {error && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100%', padding: '40px',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '48px', marginBottom: '16px' }}></span>
          <p style={{ color: '#a89880', marginBottom: '24px', lineHeight: 1.6 }}>{error}</p>
          <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
            从相册选择
          </button>
          <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginTop: '12px' }}>
            返回
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload}
            style={{ display: 'none' }} />
        </div>
      )}

      {/* 转场动画 */}
      {phase >= 1 && capturedImage && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0a0a0a',
        }}>
          <div style={{
            transition: 'all 0.6s ease',
            transform: phase >= 2 ? 'scale(0.5)' : 'scale(1)',
            opacity: phase >= 3 ? 1 : 1,
          }}>
            {/* 相纸效果 */}
            <div style={{
              background: '#f5f0e8',
              padding: phase >= 3 ? '12px 12px 40px' : '0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              transform: phase >= 3 ? 'rotate(-2deg)' : 'none',
              transition: 'all 0.6s ease',
            }}>
              <img src={capturedImage} style={{
                width: phase >= 2 ? '200px' : '100vw',
                height: phase >= 2 ? '200px' : 'auto',
                objectFit: 'cover',
                transition: 'all 0.6s ease',
              }} />
            </div>
          </div>

          {/* AI分析中 */}
          {analyzing && (
            <div style={{
              position: 'absolute', bottom: '80px',
              textAlign: 'center',
              animation: 'fadeIn 0.5s ease',
            }}>
              <div style={{
                width: '32px', height: '32px',
                border: '3px solid rgba(192,57,43,0.3)',
                borderTopColor: 'var(--red-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px',
              }} />
              <p style={{ color: '#a89880', fontSize: '14px' }}>侦探正在寻找突破口...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
