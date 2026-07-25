/**
 * 教材四害規則與化解動物（勿混用其他流派）
 */

import type { HarmType } from '../types/qimen'

/** 八門五行 */
export const DOOR_ELEMENT: Record<string, string> = {
  休門: '水',
  生門: '土',
  傷門: '木',
  杜門: '木',
  景門: '火',
  死門: '土',
  驚門: '金',
  開門: '金',
}

/** 宮位五行（標準宮號） */
export const PALACE_ELEMENT: Record<number, string> = {
  1: '水',
  2: '土',
  3: '木',
  4: '木',
  6: '金',
  7: '金',
  8: '土',
  9: '火',
}

export const PALACE_NAME: Record<number, string> = {
  1: '坎',
  2: '坤',
  3: '震',
  4: '巽',
  6: '乾',
  7: '兌',
  8: '艮',
  9: '離',
}

/** 門迫：宮位 → 會構成門迫的八門 */
export const MEN_PO_BY_PALACE: Record<number, readonly string[]> = {
  1: ['生門', '死門'], // 坎
  8: ['傷門', '杜門'], // 艮
  3: ['驚門', '開門'], // 震
  4: ['驚門', '開門'], // 巽
  9: ['休門'], // 離
  2: ['傷門', '杜門'], // 坤
  7: ['景門'], // 兌
  6: ['景門'], // 乾
}

/** 門迫化解動物（一門一動物） */
export const DOOR_REMEDY_ANIMALS: Record<string, string> = {
  驚門: '龍',
  開門: '虎',
  休門: '牛',
  傷門: '狗',
  杜門: '猴',
  景門: '羊',
  生門: '豬',
  死門: '蛇',
}

export type StemHarmRule = {
  type: '擊刑' | '入墓'
  palace: number
  stem: string
  remedyAnimal: string
  description: string
}

/** 擊刑／入墓：依 類型＋宮位＋天干 查化解 */
export const STEM_HARM_RULES: StemHarmRule[] = [
  // 擊刑
  { type: '擊刑', palace: 3, stem: '戊', remedyAnimal: '牛', description: '戊落震宮構成擊刑' },
  { type: '擊刑', palace: 2, stem: '己', remedyAnimal: '兔', description: '己落坤宮構成擊刑' },
  { type: '擊刑', palace: 8, stem: '庚', remedyAnimal: '蛇', description: '庚落艮宮構成擊刑' },
  { type: '擊刑', palace: 9, stem: '辛', remedyAnimal: '羊', description: '辛落離宮構成擊刑' },
  { type: '擊刑', palace: 4, stem: '壬', remedyAnimal: '雞', description: '壬落巽宮構成擊刑' },
  { type: '擊刑', palace: 4, stem: '癸', remedyAnimal: '豬', description: '癸落巽宮構成擊刑' },
  // 入墓
  { type: '入墓', palace: 4, stem: '辛', remedyAnimal: '狗', description: '辛落入墓於巽宮' },
  { type: '入墓', palace: 4, stem: '壬', remedyAnimal: '狗', description: '壬落入墓於巽宮' },
  { type: '入墓', palace: 2, stem: '甲', remedyAnimal: '牛', description: '甲落入墓於坤宮' },
  { type: '入墓', palace: 2, stem: '癸', remedyAnimal: '牛', description: '癸落入墓於坤宮' },
  { type: '入墓', palace: 8, stem: '丁', remedyAnimal: '羊', description: '丁落入墓於艮宮' },
  { type: '入墓', palace: 8, stem: '己', remedyAnimal: '羊', description: '己落入墓於艮宮' },
  { type: '入墓', palace: 8, stem: '庚', remedyAnimal: '羊', description: '庚落入墓於艮宮' },
  { type: '入墓', palace: 6, stem: '乙', remedyAnimal: '龍', description: '乙落入墓於乾宮' },
  { type: '入墓', palace: 6, stem: '丙', remedyAnimal: '龍', description: '丙落入墓於乾宮' },
  { type: '入墓', palace: 6, stem: '戊', remedyAnimal: '龍', description: '戊落入墓於乾宮' },
]

export const HARM_SEVERITY: Record<HarmType, number> = {
  門迫: 4,
  擊刑: 3,
  入墓: 2,
  空無: 2,
}
