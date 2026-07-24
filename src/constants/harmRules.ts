import type { HarmRule } from '../types/qimen'

/**
 * 四害規則設定表
 *
 * 目前僅放可驗證的範例／空殼架構。
 * 門迫、擊刑、入墓必須依教材明確補入後才會被判定。
 * 沒有規則時不會亂標紅。
 *
 * 新增規則範例：
 * {
 *   type: '門迫',
 *   palace: 2,
 *   targetType: 'door',
 *   targetValue: '死門',
 *   remedyBranches: ['巳'],
 *   remedyAnimals: ['蛇'],
 *   description: '死門落坤宮構成門迫（範例）',
 * }
 */
export const HARM_RULES: HarmRule[] = [
  // ── 以下為架構示範，預設不啟用真實判定 ──
  // 若教材確認某條件成立，取消註解並依實際規則修改：
  //
  // {
  //   type: '門迫',
  //   palace: 9,
  //   targetType: 'door',
  //   targetValue: '死門',
  //   remedyBranches: ['巳'],
  //   remedyAnimals: ['蛇'],
  //   description: '死門與離宮條件符合時構成門迫（待教材確認）',
  // },
  // {
  //   type: '擊刑',
  //   palace: 3,
  //   targetType: 'star',
  //   targetValue: '天蓬',
  //   remedyBranches: [],
  //   remedyAnimals: [],
  //   description: '天蓬落震宮構成擊刑（待教材確認）',
  // },
  // {
  //   type: '入墓',
  //   palace: 2,
  //   targetType: 'heavenStem',
  //   targetValue: '甲',
  //   remedyBranches: ['未'],
  //   remedyAnimals: ['羊'],
  //   description: '天盤甲入墓於坤（待教材確認）',
  // },
]
