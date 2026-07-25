/**
 * 可執行自我檢查：npm run self-check
 */
import { parseSixCode } from './parseCode'
import {
  calculatePalace,
  isReadyToCalculate,
  stemChoiceRequirements,
} from './calculatePalace'
import { createHistoryRecord, loadHistory, saveHistory } from './storage'
import { HISTORY_STORAGE_KEY } from '../constants/mappings'
import type { DetectedHarm, HarmType, PalaceResult } from '../types/qimen'

let passed = 0
let failed = 0

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) {
    passed += 1
    console.log(`✓ ${name}`)
  } else {
    failed += 1
    console.error(`✗ ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

function hasHarm(
  harms: DetectedHarm[],
  type: HarmType,
  opts?: { target?: string; animal?: string },
): boolean {
  return harms.some(
    (h) =>
      h.type === type &&
      (opts?.target === undefined || h.targetValue === opts.target) &&
      (opts?.animal === undefined || h.remedyAnimal === opts.animal),
  )
}

function dump(label: string, r: PalaceResult) {
  console.log(`\n[${label}]`)
  console.log(
    `  顯示=${r.palaceInputDigit}${r.palaceName} 標準=${r.palaceNumber} ${r.god}/${r.star}/${r.door} 天${r.heavenStem ?? '○'}地${r.earthStem ?? '○'}`,
  )
  for (const h of r.harms) {
    console.log(
      `  ${h.type} ${h.targetValue} → ${h.remedyAnimal ?? '—'} | ${h.reason}`,
    )
  }
}

function doorCase(code: string, door: string, animal: string, label: string) {
  const r = calculatePalace(code, code)
  assert(`${label} 門=${door}`, r.door === door)
  assert(
    `${label} 門迫+${animal}`,
    hasHarm(r.harms, '門迫', { target: door, animal }),
  )
}

// ── 既有四害案例（地盤末碼避免為1，以免需選擇）──
const t1 = calculatePalace('182839', '182839')
dump('182839', t1)
assert('182839 坎', t1.palaceName === '坎' && t1.palaceInputDigit === '1')
assert('182839 生門', t1.door === '生門')
assert('182839 門迫豬', hasHarm(t1.harms, '門迫', { target: '生門', animal: '豬' }))
assert('182839 無擊刑', !hasHarm(t1.harms, '擊刑'))
assert('182839 無入墓', !hasHarm(t1.harms, '入墓'))
assert('182839 無空無', !hasHarm(t1.harms, '空無') && !t1.isEmptyVoid)

doorCase('182239', '死門', '蛇', '坎死門')
doorCase('371755', '驚門', '龍', '震驚門')
doorCase('371655', '開門', '虎', '震開門')
doorCase('251335', '傷門', '狗', '坤傷門')
doorCase('251435', '杜門', '猴', '坤杜門')
doorCase('611935', '景門', '羊', '乾景門')
doorCase('911135', '休門', '牛', '離休門')

assert(
  '震戊 擊刑牛',
  hasHarm(calculatePalace('311155', '311155').harms, '擊刑', {
    target: '戊',
    animal: '牛',
  }),
)
assert(
  '坤己 擊刑兔',
  hasHarm(calculatePalace('211165', '211165').harms, '擊刑', {
    target: '己',
    animal: '兔',
  }),
)

const t11 = calculatePalace('811172', '811172')
dump('艮庚', t11)
assert('艮庚 擊刑蛇', hasHarm(t11.harms, '擊刑', { target: '庚', animal: '蛇' }))
assert('艮庚 入墓羊', hasHarm(t11.harms, '入墓', { target: '庚', animal: '羊' }))

assert(
  '離辛 擊刑羊',
  hasHarm(calculatePalace('911182', '911182').harms, '擊刑', {
    target: '辛',
    animal: '羊',
  }),
)

const t13 = calculatePalace('411192', '411192')
dump('巽壬', t13)
assert('巽壬 擊刑雞', hasHarm(t13.harms, '擊刑', { target: '壬', animal: '雞' }))
assert('巽壬 入墓狗', hasHarm(t13.harms, '入墓', { target: '壬', animal: '狗' }))

assert(
  '巽癸 擊刑豬',
  hasHarm(
    calculatePalace('411112', '411112', { heavenStemChoice: '癸' }).harms,
    '擊刑',
    { target: '癸', animal: '豬' },
  ),
)
assert(
  '巽辛 入墓狗',
  hasHarm(calculatePalace('411182', '411182').harms, '入墓', {
    target: '辛',
    animal: '狗',
  }),
)
assert(
  '坤甲 入墓牛',
  hasHarm(
    calculatePalace('211112', '211112', { heavenStemChoice: '甲' }).harms,
    '入墓',
    { target: '甲', animal: '牛' },
  ),
)
assert(
  '艮丁 入墓羊',
  hasHarm(calculatePalace('811142', '811142').harms, '入墓', {
    target: '丁',
    animal: '羊',
  }),
)
assert(
  '乾乙 入墓龍',
  hasHarm(calculatePalace('611122', '611122').harms, '入墓', {
    target: '乙',
    animal: '龍',
  }),
)

// ── 新增：宮位 0／5 顯示原始數字 ──
const p0 = calculatePalace('082839', '082839')
dump('082839', p0)
assert('0坤 原始digit', p0.palaceInputDigit === '0')
assert('0坤 標準號2', p0.palaceNumber === 2 && p0.palaceName === '坤')

const p5 = calculatePalace('582839', '582839')
dump('582839', p5)
assert('5坤 原始digit', p5.palaceInputDigit === '5')
assert('5坤 標準號2', p5.palaceNumber === 2 && p5.palaceName === '坤')

// ── 第2位0 → 玄武 ──
const g0 = calculatePalace('602504', '602504')
assert('602504 玄武', g0.god === '玄武' && g0.palaceName === '乾')

// ── 第3位0 天芮、非空無 ──
const s0 = calculatePalace('110822', '110822')
assert('星0 天芮', s0.star === '天芮' && !s0.isEmptyVoid)

// ── 第4位0 死門、非空無 ──
const d0 = calculatePalace('111012', '111012', {
  heavenStemChoice: '甲',
})
assert('門0 死門', d0.door === '死門' && !d0.isEmptyVoid)

// ── 空無：天盤／地盤／雙 ──
const h0 = calculatePalace('182803', '182803')
assert('僅天盤0', h0.heavenStem === null && h0.earthStem === '丙')
assert('僅天盤0 一○一筆', h0.isEmptyVoid && h0.harms.filter((x) => x.type === '空無').length === 1)
assert('僅天盤0 補空', h0.emptyVoidRemedy != null)
assert(
  '僅天盤0 target',
  h0.harms.some((x) => x.type === '空無' && x.targetValue === '天盤干'),
)

const e0 = calculatePalace('182830', '182830')
assert('僅地盤0', e0.earthStem === null && e0.heavenStem === '丙')
assert(
  '僅地盤0 target',
  e0.harms.some((x) => x.type === '空無' && x.targetValue === '地盤干'),
)
assert('僅地盤0 一筆補空', e0.harms.filter((x) => x.type === '空無').length === 1 && e0.emptyVoidRemedy != null)

const both0 = calculatePalace('182800', '182800')
assert('雙0 皆留白', both0.heavenStem === null && both0.earthStem === null)
assert('雙0 一筆空無', both0.harms.filter((x) => x.type === '空無').length === 1)
assert(
  '雙0 target含天地',
  both0.harms.some(
    (x) => x.type === '空無' && x.targetValue === '天盤干、地盤干',
  ),
)
assert('雙0 一張補空', both0.emptyVoidRemedy != null)

// ── 00 錯誤訊息 ──
const bad00 = parseSixCode('001234')
assert('00 拒絕', bad00.ok === false)
assert(
  '00 錯誤文案',
  !bad00.ok &&
    bad00.error.includes('八神為0時需沿用宮位數字') &&
    bad00.error.includes('無法取得八神'),
)

// ── 未選甲戊癸禁止計算 ──
assert('111111 未選不可算', !isReadyToCalculate('111111'))
assert(
  '111111 只選天仍不可',
  !isReadyToCalculate('111111', '甲', undefined),
)
assert('111111 雙選可算', isReadyToCalculate('111111', '甲', '戊'))
assert('needs 雙1', (() => {
  const r = stemChoiceRequirements('111111')
  return r.needsHeaven && r.needsEarth
})())

let threw = false
try {
  calculatePalace('111111', '111111')
} catch {
  threw = true
}
assert('未選時 calculate 拋錯', threw)

// ── 儲存 ──
const rec = createHistoryRecord(t1, '老師上課案例')
assert('palaceInputDigit 入庫', rec.palaceInputDigit === '1')
assert('備註100內', rec.note === '老師上課案例')
assert('未勾選概念：未 save 前可另建物件', rec.id !== createHistoryRecord(t1).id)

const backup =
  typeof localStorage !== 'undefined'
    ? localStorage.getItem(HISTORY_STORAGE_KEY)
    : null
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(HISTORY_STORAGE_KEY)
    saveHistory([rec])
    const after = loadHistory()
    assert(
      '讀回含 digit 與備註',
      after[0]?.palaceInputDigit === '1' && after[0]?.note === '老師上課案例',
    )
    // 舊資料補 digit
    const legacy = {
      ...rec,
      palaceInputDigit: undefined as unknown as string,
    }
    saveHistory([legacy as typeof rec])
    const migrated = loadHistory()[0]
    assert(
      '舊紀錄補 digit',
      migrated?.palaceInputDigit === migrated?.normalizedCode[0],
    )
  }
} finally {
  if (typeof localStorage !== 'undefined') {
    if (backup == null) localStorage.removeItem(HISTORY_STORAGE_KEY)
    else localStorage.setItem(HISTORY_STORAGE_KEY, backup)
  }
}

console.log(`\n結果：${passed} 通過，${failed} 失敗`)
if (failed > 0) throw new Error(`self-check failed: ${failed}`)
