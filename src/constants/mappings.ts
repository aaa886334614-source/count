/** 宮位對照：數字 → 名稱 */
export const PALACE_MAP: Record<string, string> = {
  '1': '坎',
  '2': '坤',
  '3': '震',
  '4': '巽',
  '5': '中',
  '6': '乾',
  '7': '兌',
  '8': '艮',
  '9': '離',
}

/** 九宮格顯示順序（左上→右下） */
export const NINE_PALACE_ORDER: number[] = [4, 9, 2, 3, 5, 7, 8, 1, 6]

/** 八神對照（可獨立修改） */
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
 * 九星對照（可獨立修改）
 * 注意：此版本不顯示天禽；數字 5 顯示為天芮。
 */
export const STAR_MAP: Record<string, string> = {
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

/** 八門對照（可獨立修改） */
export const DOOR_MAP: Record<string, string> = {
  '1': '休門',
  '2': '死門',
  '3': '傷門',
  '4': '杜門',
  '5': '中',
  '6': '開門',
  '7': '驚門',
  '8': '生門',
  '9': '景門',
}

/**
 * 天干對照（天盤／地盤共用）
 * 0：空亡（位置留白，右上角顯示 ○）
 * 1：特殊選擇（甲／戊／癸）
 * 2–9：乙…壬
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

/** 空亡補法：依宮位 */
export const EMPTY_VOID_REMEDY: Record<
  number,
  { branches: string[]; animals: string[]; note?: string }
> = {
  1: { branches: ['子'], animals: ['鼠'] },
  2: { branches: ['未', '申'], animals: ['羊', '猴'] },
  3: { branches: ['卯'], animals: ['兔'] },
  4: { branches: ['辰', '巳'], animals: ['龍', '蛇'] },
  5: {
    branches: [],
    animals: [],
    note: '中宮無固定地支補法',
  },
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

/** 四害嚴重程度：門迫 > 擊刑 > 入墓 = 空亡 */
export const HARM_SEVERITY: Record<string, number> = {
  門迫: 4,
  擊刑: 3,
  入墓: 2,
  空亡: 2,
}
