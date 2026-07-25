/** 意識奇門原始宮位固定資料（教材） */

export type BranchSides = {
  top?: string
  left?: string
  right?: string
  bottom?: string
}

export type OriginalPalace = {
  number: number
  name: string
  god: string
  element: string
  body: string
  star: string
  stems: string
  time: string
  person: string
  door: string
  branches: BranchSides
  /** 中宮特殊內容 */
  isCenter?: boolean
}

/** 九宮顯示順序：巽離坤／震中兌／艮坎乾 */
export const ORIGINAL_PALACE_ORDER: number[] = [4, 9, 2, 3, 5, 7, 8, 1, 6]

export const ORIGINAL_PALACES: Record<number, OriginalPalace> = {
  4: {
    number: 4,
    name: '巽',
    god: '螣蛇',
    element: '木',
    body: '肝／膽',
    star: '天輔',
    stems: '乙',
    time: '07–11',
    person: '長女',
    door: '杜門',
    branches: { top: '巳', left: '辰' },
  },
  9: {
    number: 9,
    name: '離',
    god: '值符',
    element: '火',
    body: '頭／心',
    star: '天英',
    stems: '丙、丁',
    time: '11–13',
    person: '中女',
    door: '景門',
    branches: { top: '午' },
  },
  2: {
    number: 2,
    name: '坤',
    god: '九地',
    element: '土',
    body: '脾／胃',
    star: '天芮',
    stems: '己',
    time: '13–17',
    person: '老母',
    door: '死門',
    branches: { top: '未', right: '申' },
  },
  3: {
    number: 3,
    name: '震',
    god: '六合／值符',
    element: '木',
    body: '肝／膽',
    star: '天沖',
    stems: '甲',
    time: '05–07',
    person: '長男',
    door: '傷門',
    branches: { left: '卯' },
  },
  5: {
    number: 5,
    name: '中',
    god: '',
    element: '',
    body: '',
    star: '',
    stems: '',
    time: '',
    person: '',
    door: '',
    branches: {},
    isCenter: true,
  },
  7: {
    number: 7,
    name: '兌',
    god: '太陰',
    element: '金',
    body: '呼吸／食道',
    star: '天柱',
    stems: '辛',
    time: '17–19',
    person: '少女',
    door: '驚門',
    branches: { right: '酉' },
  },
  8: {
    number: 8,
    name: '艮',
    god: '九地',
    element: '土',
    body: '脾／胃',
    star: '天任',
    stems: '戊',
    time: '01–05',
    person: '少男',
    door: '生門',
    branches: { left: '寅', bottom: '丑' },
  },
  1: {
    number: 1,
    name: '坎',
    god: '玄武',
    element: '水',
    body: '腎／子宮',
    star: '天蓬',
    stems: '壬、癸',
    time: '23–01',
    person: '中男',
    door: '休門',
    branches: { bottom: '子' },
  },
  6: {
    number: 6,
    name: '乾',
    god: '白虎／九天',
    element: '金',
    body: '頭／心、肺、大腸',
    star: '天心',
    stems: '庚',
    time: '19–23',
    person: '老父',
    door: '開門',
    branches: { right: '戌', bottom: '亥' },
  },
}
