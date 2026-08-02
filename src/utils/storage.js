// ===== LocalStorage 数据管理 =====

const STORAGE_KEYS = {
  USER: 'detective_user',
  CASES: 'detective_cases',
  BADGES: 'detective_badges',
  SETTINGS: 'detective_settings',
  CURRENT_CASE: 'detective_current_case',
  APP_STATE: 'detective_app_state',
};

// ===== 用户管理 =====
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || null;
  } catch { return null; }
}

export function setUser(user) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// ===== 案件管理 =====
export function getCases() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CASES)) || [];
  } catch { return []; }
}

export function saveCases(cases) {
  localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
}

export function getCase(caseId) {
  const cases = getCases();
  return cases.find(c => c.id === caseId) || null;
}

export function saveCase(caseData) {
  const cases = getCases();
  const idx = cases.findIndex(c => c.id === caseData.id);
  if (idx >= 0) {
    cases[idx] = { ...cases[idx], ...caseData, updatedAt: Date.now() };
  } else {
    cases.push({ ...caseData, createdAt: Date.now(), updatedAt: Date.now() });
  }
  saveCases(cases);
  return caseData;
}

export function deleteCase(caseId) {
  const cases = getCases().filter(c => c.id !== caseId);
  saveCases(cases);
}

export function getCurrentCaseId() {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_CASE);
}

export function setCurrentCaseId(caseId) {
  if (caseId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CASE, caseId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CASE);
  }
}

// ===== 徽章管理 =====
export function getBadges() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BADGES)) || [];
  } catch { return []; }
}

export function addBadge(badge) {
  const badges = getBadges();
  if (!badges.find(b => b.id === badge.id)) {
    badges.push({ ...badge, earnedAt: Date.now() });
    localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  }
  return badges;
}

// ===== 设置管理 =====
export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {
      reduceMotion: false,
      darkMode: true,
      oneHandMode: false,
      vacationMode: false,
    };
  } catch { return {}; }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// ===== 应用状态 =====
export function getAppState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.APP_STATE)) || {
      hasLaunched: false,
      isLoggedIn: false,
      isGuest: false,
    };
  } catch { return {}; }
}

export function saveAppState(state) {
  localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(state));
}

// ===== 生成唯一ID =====
export function generateId() {
  return 'case_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===== XP 计算 =====
export function calcXPForLevel(level) {
  return Math.floor(80 * Math.pow(level, 1.5));
}

export function getTotalXP(badges) {
  return badges.reduce((sum, b) => sum + (b.xp || 0), 0);
}

export function getLevelFromXP(totalXP) {
  let level = 1;
  while (calcXPForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
}
