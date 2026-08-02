// ===== 智谱AI GLM API 调用 =====
const API_KEY = 'c5af9ee3e9244dbcb9fb6dcedfe3515a.PzizKXdDR6rcOL5g';
const BASE_URL = 'https://open.bigmodel.cn/api/paas/v4';
const MODEL = 'glm-4v-flash'; // 免费多模态模型

/**
 * 将图片文件转为 base64 data URL
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 调用 GLM-4V 进行图像识别
 * @param {string} imageBase64 - base64 编码的图片
 * @param {string} prompt - 提示词
 * @returns {Promise<string>} AI 返回的文本
 */
export async function analyzeImage(imageBase64, prompt) {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageBase64 }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('GLM API Error:', error);
    throw error;
  }
}

/**
 * 快速开工模式 - 识别桌面照片并生成2-4个整理线索
 */
export async function analyzeDeskPhoto(imageBase64) {
  const prompt = `你是一个侦探助手。用户拍了一张桌面的照片，请分析照片内容，找出2-4个需要整理的物品/区域，每个对应一个可执行的小任务（线索）。

请严格按以下JSON格式返回（不要返回其他内容）：
{
  "clues": [
    {
      "task_title": "任务标题（简短，如：移走空杯子）",
      "task_desc": "任务详细说明（2-3句话，告诉用户具体怎么做）",
      "estimated_time": "预计时间（如：2分钟）",
      "verification_level": "high|low|none",
      "objects_found": ["照片中识别到的相关物品"]
    }
  ]
}

要求：
1. 生成2-4个线索，从易到难排列
2. 第一个线索必须非常简单（启动线索），5分钟内能完成
3. 每个任务都要具体、可操作、视觉上可验证
4. 优先选择容易拍照验证的任务（移走物品、整理区域）
5. 语气像侦探在派任务，带悬疑感
6. 如果照片不是桌面场景，也要尽量找到可执行的任务`;

  const result = await analyzeImage(imageBase64, prompt);
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.clues && parsed.clues.length > 0) {
        return { clues: parsed.clues };
      }
    }
  } catch (e) {
    console.warn('JSON解析失败，使用默认值', e);
  }
  // 降级返回：2个默认线索
  return {
    clues: [
      {
        task_title: '移走最显眼的杂物',
        task_desc: '侦探发现桌面上有显眼的杂物。先把它移到一边，让桌面清爽一点。',
        estimated_time: '2分钟',
        verification_level: 'high',
        objects_found: ['桌面杂物']
      },
      {
        task_title: '整理桌面左侧区域',
        task_desc: '把左侧的物品归类整理，不需要的放到一边。',
        estimated_time: '3分钟',
        verification_level: 'high',
        objects_found: ['桌面左侧']
      }
    ]
  };
}

/**
 * 委托案件模式 - 根据任务描述进行文字拆解（非视觉）
 */
export async function generateTaskTree(caseName, materials) {
  const prompt = `你是一个侦探助手，擅长将复杂目标拆解为可执行的小步骤。

用户想要完成的目标：「${caseName}」
${materials ? `补充说明：${materials}` : ''}

请对这个目标进行深度分析，将其拆解为 3-6 个具体的、可执行的小任务。每个任务应该是 5-15 分钟内可以完成的行动。

请严格按以下 JSON 格式返回（不要返回其他内容）：
{
  "case_analysis": "对目标的简要分析，说明难点和关键路径（1-2句话）",
  "tasks": [
    {
      "task_title": "任务标题（动词开头，具体明确）",
      "task_desc": "详细说明要做什么、怎么做、做到什么程度算完成（2-3句话）",
      "estimated_time": "预计时间（如：10分钟）",
      "verification_level": "high|low|none"
    }
  ]
}

拆解原则：
1. 从易到难排列，第一个任务必须极其简单，让用户能立即动手（比如“列出3个关键词”、“打开一个空白文档”）
2. 每个任务都是具体行动，不是抽象概念（不要“思考方向”，而是“写下3个你感兴趣的方向”）
3. 任务之间要有逻辑递进关系，前一个任务的输出是后一个任务的输入
4. 如果目标比较抽象，先安排“澄清/调研”类任务，再安排“执行”类任务
5. 最后一个任务应该是“检查/总结”类，确保整体完成
6. 语气像侦探在分析案情，带一点悬疑感和鼓励性`;

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';
    
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('JSON解析失败', e);
    }
  } catch (error) {
    console.error('Task Tree API Error:', error);
  }

  // 降级返回
  return {
    case_analysis: '侦探正在分析你的案件...',
    tasks: [
      { task_title: '第一步行动', task_desc: '从最简单的事情开始', estimated_time: '3分钟', verification_level: 'low' },
      { task_title: '继续推进', task_desc: '完成第一个里程碑', estimated_time: '5分钟', verification_level: 'low' },
      { task_title: '接近目标', task_desc: '案件即将告破', estimated_time: '5分钟', verification_level: 'low' },
    ]
  };
}

/**
 * 验证任务完成 - AI判断前后照片是否有变化
 */
export async function verifyTaskCompletion(beforeImage, afterImage, taskDesc) {
  const prompt = `你是侦探的验证官。用户声称完成了以下任务：「${taskDesc}」

请对比前后两张照片，判断任务是否真正完成。

请严格按以下JSON格式返回：
{
  "verified": true/false,
  "confidence": 0-100,
  "comment": "侦探的评语（简短，带悬疑风格）",
  "stamp_type": "gold|silver"
}

判断标准：
- 如果变化明显且与任务描述一致 → verified=true, stamp_type="gold"
- 如果变化不明显但用户声称完成 → verified=true, stamp_type="silver"（信任制）
- 如果完全没有变化 → verified=false`;

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: beforeImage } },
              { type: 'image_url', image_url: { url: afterImage } },
              { type: 'text', text: prompt }
            ]
          }
        ],
        max_tokens: 512,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';
    
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {}
  } catch (error) {
    console.error('Verify API Error:', error);
  }

  // 降级：信任制通过
  return {
    verified: true,
    confidence: 70,
    comment: '这次信你，侦探。',
    stamp_type: 'silver'
  };
}

/**
 * 缩小任务 - AI生成更简单的版本
 */
export async function simplifyTask(imageBase64, currentTaskTitle, currentTaskDesc) {
  const prompt = `你是侦探助手。用户觉得当前任务太难了，需要更简单的版本。

当前任务：「${currentTaskTitle}」
任务说明：${currentTaskDesc}

请生成一个更简单、更原子化的任务版本，应该是当前任务的子步骤或更小的行动。

请严格按以下JSON格式返回：
{
  "task_title": "更简单的任务标题",
  "task_desc": "更详细的简单说明",
  "estimated_time": "预计时间（比原来更短）"
}

要求：
1. 新任务必须是原任务的子步骤或更小行动
2. 时间应该是原来的50%或更短
3. 更加具体、可立即执行
4. 语气鼓励性，像侦探在引导用户`;

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: imageBase64 ? MODEL : 'glm-4-flash',
        messages: imageBase64 ? [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageBase64 } },
              { type: 'text', text: prompt }
            ]
          }
        ] : [
          { role: 'user', content: prompt }
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`);

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';
    
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {}
  } catch (error) {
    console.error('Simplify API Error:', error);
  }

  // 降级
  return {
    task_title: `先做${currentTaskTitle}的一小部分`,
    task_desc: '不用完成整个任务，先做一点点就好。哪怕只是开始动手，也是进步。',
    estimated_time: '1分钟'
  };
}
