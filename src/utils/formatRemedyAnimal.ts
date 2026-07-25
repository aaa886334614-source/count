/** 動物 → 地支（四害化解提示顯示用） */
export const ANIMAL_BRANCH_MAP: Record<string, string> = {
  鼠: '子',
  牛: '丑',
  虎: '寅',
  兔: '卯',
  龍: '辰',
  蛇: '巳',
  馬: '午',
  羊: '未',
  猴: '申',
  雞: '酉',
  狗: '戌',
  豬: '亥',
}

/**
 * 將四害化解動物格式化為「地支（動物）」。
 * 儲存仍用動物名稱；顯示時再呼叫此函式。
 * 無法辨識時回傳原字串，不拋錯。
 */
export function formatRemedyAnimal(animal: string): string {
  if (!animal) return animal
  const branch = ANIMAL_BRANCH_MAP[animal]
  if (!branch) return animal
  return `${branch}（${animal}）`
}
