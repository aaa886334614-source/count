/**
 * 六位數教材對照表
 * 注意：0 依「所在位置」解讀，不可全域當成空無。
 */

/**
 * 六位碼第1位宮位數字 → 顯示名與標準宮號（供四害／補空）
 * 5、0 皆為坤宮（標準宮號 2）。六位碼單宮法不使用「中宮」。
 */
export const PALACE_DIGIT_MAP: Record<
  string,
  { name: string; number: number }
> = {
  '0': { name: '坤', number: 2 },
  '1': { name: '坎', number: 1 },
  '2': { name: '坤', number: 2 },
  '3': { name: '震', number: 3 },
  '4': { name: '巽', number: 4 },
  '5': { name: '坤', number: 2 },
  '6': { name: '乾', number: 6 },
  '7': { name: '兌', number: 7 },
  '8': { name: '艮', number: 8 },
  '9': { name: '離', number: 9 },
}

/** 八神：1–9；數字 0 須沿用第1位（見 calculatePalace） */
export const GOD_MAP: Record<string, string> = {
  '1': '值符',
  '2': '螣蛇',
  '3': '太陰',
  '4': '六合',
  '5': '白虎',
  '6': '玄武',
  '7': '九地',
  '8': '九天',
  '9': '值符',
}

/**
 * 九星：不可顯示天禽；5 與 0 皆為天芮。
 */
export const STAR_MAP: Record<string, string> = {
  '0': '天芮',
  '1': '天蓬',
  '2': '天芮',
  '3': '天沖',
  '4': '天輔',
  '5': '天芮',
  '6': '天心',
  '7': '天柱',
  '8': '天任',
  '9': '天英',
}

/**
 * 八門：5 與 0 皆為死門（第4位 0 不是空無）
 */
export const DOOR_MAP: Record<string, string> = {
  '0': '死門',
  '1': '休門',
  '2': '死門',
  '3': '傷門',
  '4': '杜門',
  '5': '死門',
  '6': '開門',
  '7': '驚門',
  '8': '生門',
  '9': '景門',
}

/**
 * 天干（僅第5／6位）：0＝空無，1＝甲戊癸選擇，2–9＝乙…壬
 */
export const STEM_DIGIT_MAP: Record<string, string | null | 'CHOICE'> = {
  '0': null,
  '1': 'CHOICE',
  '2': '乙',
  '3': '丙',
  '4': '丁',
  '5': '戊',
  '6': '己',
  '7': '庚',
  '8': '辛',
  '9': '壬',
}

export const STEM_CHOICES = ['甲', '戊', '癸'] as const

/** 補空資料：依標準宮號（坤＝2）；空無時顯示 */
export const EMPTY_VOID_REMEDY: Record<
  number,
  { branches: string[]; animals: string[]; note?: string }
> = {
  1: { branches: ['子'], animals: ['鼠'] },
  2: { branches: ['未', '申'], animals: ['羊', '猴'] },
  3: { branches: ['卯'], animals: ['兔'] },
  4: { branches: ['辰', '巳'], animals: ['龍', '蛇'] },
  6: { branches: ['戌', '亥'], animals: ['狗', '豬'] },
  7: { branches: ['酉'], animals: ['雞'] },
  8: { branches: ['丑', '寅'], animals: ['牛', '虎'] },
  9: { branches: ['午'], animals: ['馬'] },
}

/** 英文字母 → 數字（不分大小寫） */
export const LETTER_TO_NUMBER: Record<string, string> = {
  A: '1',
  J: '1',
  S: '1',
  B: '2',
  K: '2',
  T: '2',
  C: '3',
  L: '3',
  U: '3',
  D: '4',
  M: '4',
  V: '4',
  E: '5',
  N: '5',
  W: '5',
  F: '6',
  O: '6',
  X: '6',
  G: '7',
  P: '7',
  Y: '7',
  H: '8',
  Q: '8',
  Z: '8',
  I: '9',
  R: '9',
}

/** 全形數字 → 半形 */
export const FULLWIDTH_DIGIT_MAP: Record<string, string> = {
  '０': '0',
  '１': '1',
  '２': '2',
  '３': '3',
  '４': '4',
  '５': '5',
  '６': '6',
  '７': '7',
  '８': '8',
  '９': '9',
}

export const HISTORY_STORAGE_KEY = 'consciousness-qimen-history-v1'
export const MAX_HISTORY = 100
