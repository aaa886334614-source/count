/** 對宮映射（教材規則） */
export const OPPOSITE_PALACE: Record<number, number> = {
  1: 9,
  9: 1,
  2: 8,
  8: 2,
  3: 7,
  7: 3,
  4: 6,
  6: 4,
}

export function oppositePalaceNumber(palace: number): number | null {
  return OPPOSITE_PALACE[palace] ?? null
}

/** 各宮地支／動物（雙支宮位需現場或教材細則才能選用） */
export const PALACE_BRANCH_ANIMALS: Record<
  number,
  { branch: string; animal: string }[]
> = {
  1: [{ branch: '子', animal: '鼠' }],
  2: [
    { branch: '未', animal: '羊' },
    { branch: '申', animal: '猴' },
  ],
  3: [{ branch: '卯', animal: '兔' }],
  4: [
    { branch: '辰', animal: '龍' },
    { branch: '巳', animal: '蛇' },
  ],
  6: [
    { branch: '戌', animal: '狗' },
    { branch: '亥', animal: '豬' },
  ],
  7: [{ branch: '酉', animal: '雞' }],
  8: [
    { branch: '丑', animal: '牛' },
    { branch: '寅', animal: '虎' },
  ],
  9: [{ branch: '午', animal: '馬' }],
}
