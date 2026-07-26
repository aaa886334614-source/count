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
import { formatRemedyAnimal } from './formatRemedyAnimal'
import {
  formatHistoryHarmSummary,
  formatHistoryRemedySummary,
  recalculateHistoryRecord,
} from './recalculateHistory'
import { HISTORY_STORAGE_KEY } from '../constants/mappings'
import type {
  DetectedHarm,
  HarmType,
  HistoryRecord,
  PalaceResult,
} from '../types/qimen'

/** Node 環境補 localStorage，供遷移測試 */
function ensureLocalStorage() {
  if (typeof globalThis.localStorage !== 'undefined') return
  const store = new Map<string, string>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, String(v))
    },
    removeItem: (k: string) => {
      store.delete(k)
    },
    clear: () => store.clear(),
  }
}
ensureLocalStorage()

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
    const tip = h.remedyAnimal
      ? formatRemedyAnimal(h.remedyAnimal)
      : '—'
    console.log(
      `  ${h.type} ${h.targetValue} → 存=${h.remedyAnimal ?? '—'} 顯=${tip} | ${h.reason}`,
    )
  }
}

function assertRemedyDisplay(
  label: string,
  harms: DetectedHarm[],
  type: HarmType,
  animal: string,
  expectedLabel: string,
) {
  const hit = harms.find(
    (h) => h.type === type && h.remedyAnimal === animal,
  )
  assert(
    `${label} 顯示${expectedLabel}`,
    Boolean(hit) && formatRemedyAnimal(hit!.remedyAnimal!) === expectedLabel,
  )
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

// ── 化解提示顯示：地支（動物）──
assert('format 龍', formatRemedyAnimal('龍') === '辰（龍）')
assert('format 虎', formatRemedyAnimal('虎') === '寅（虎）')
assert('format 牛', formatRemedyAnimal('牛') === '丑（牛）')
assert('format 未知不崩', formatRemedyAnimal('未知') === '未知')

assertRemedyDisplay(
  '震驚門',
  calculatePalace('371755', '371755').harms,
  '門迫',
  '龍',
  '辰（龍）',
)
assertRemedyDisplay(
  '震開門',
  calculatePalace('371655', '371655').harms,
  '門迫',
  '虎',
  '寅（虎）',
)
assertRemedyDisplay('坎生門', t1.harms, '門迫', '豬', '亥（豬）')
assertRemedyDisplay(
  '坎死門',
  calculatePalace('182239', '182239').harms,
  '門迫',
  '蛇',
  '巳（蛇）',
)
assertRemedyDisplay(
  '坤己擊刑',
  calculatePalace('211165', '211165').harms,
  '擊刑',
  '兔',
  '卯（兔）',
)
assertRemedyDisplay('艮庚擊刑', t11.harms, '擊刑', '蛇', '巳（蛇）')
assertRemedyDisplay('艮庚入墓', t11.harms, '入墓', '羊', '未（羊）')
assertRemedyDisplay('巽壬擊刑', t13.harms, '擊刑', '雞', '酉（雞）')
assertRemedyDisplay('巽壬入墓', t13.harms, '入墓', '狗', '戌（狗）')
assertRemedyDisplay(
  '乾乙入墓',
  calculatePalace('611122', '611122').harms,
  '入墓',
  '龍',
  '辰（龍）',
)
// 舊資料只存動物名
assert('舊存龍→顯示辰（龍）', formatRemedyAnimal('龍') === '辰（龍）')

// ── 歷史紀錄重新計算／遷移 ──
function makeStaleRecord(
  code: string,
  patch: Partial<HistoryRecord> = {},
): HistoryRecord {
  const now = '2020-01-01T00:00:00.000Z'
  return {
    id: `stale-${code}`,
    createdAt: now,
    updatedAt: now,
    rawInput: code,
    normalizedCode: code,
    palaceInputDigit: code[0],
    palaceNumber: Number(code[0]) === 0 || Number(code[0]) === 5 ? 2 : Number(code[0]),
    palaceName: '舊',
    god: '舊',
    star: '舊',
    door: '舊',
    heavenStem: null,
    earthStem: null,
    isEmptyVoid: false,
    emptyVoidRemedy: null,
    harms: [],
    note: '保留備註',
    favorite: true,
    ...patch,
  }
}

const stale358796 = makeStaleRecord('358796')
const fixed358796 = recalculateHistoryRecord(stale358796)
dump('遷移後 358796', calculatePalace('358796', '358796'))
assert(
  '358796 舊 harms[] → 門迫驚門龍',
  hasHarm(fixed358796.harms, '門迫', { target: '驚門', animal: '龍' }),
)
assert(
  '358796 摘要 門迫：驚門',
  formatHistoryHarmSummary(fixed358796.harms) === '門迫：驚門',
)
assert(
  '358796 化解 辰（龍）',
  formatHistoryRemedySummary(fixed358796.harms) === '辰（龍）',
)
assert('358796 保留 id', fixed358796.id === stale358796.id)
assert('358796 保留 createdAt', fixed358796.createdAt === stale358796.createdAt)
assert('358796 保留 note', fixed358796.note === '保留備註')
assert('358796 保留 favorite', fixed358796.favorite === true)
assert(
  '358796 實際變動才更新 updatedAt',
  fixed358796.updatedAt !== stale358796.updatedAt,
)

const stale182839 = makeStaleRecord('182839')
const fixed182839 = recalculateHistoryRecord(stale182839)
assert(
  '182839 舊 harms[] → 門迫生門豬',
  hasHarm(fixed182839.harms, '門迫', { target: '生門', animal: '豬' }),
)
assert(
  '182839 摘要',
  formatHistoryHarmSummary(fixed182839.harms) === '門迫：生門' &&
    formatHistoryRemedySummary(fixed182839.harms) === '亥（豬）',
)

const staleGenGeng = makeStaleRecord('811172', {
  palaceNumber: 8,
  palaceName: '艮',
})
const fixedGenGeng = recalculateHistoryRecord(staleGenGeng)
assert(
  '艮庚 舊 harms[] → 擊刑蛇',
  hasHarm(fixedGenGeng.harms, '擊刑', { target: '庚', animal: '蛇' }),
)
assert(
  '艮庚 舊 harms[] → 入墓羊',
  hasHarm(fixedGenGeng.harms, '入墓', { target: '庚', animal: '羊' }),
)
assert(
  '艮庚 摘要含雙害',
  formatHistoryHarmSummary(fixedGenGeng.harms).includes('擊刑：庚') &&
    formatHistoryHarmSummary(fixedGenGeng.harms).includes('入墓：庚'),
)
assert(
  '艮庚 化解雙動物',
  formatHistoryRemedySummary(fixedGenGeng.harms) === '巳（蛇）、未（羊）',
)

// localStorage 遷移：不建立重複筆
const migBackup = localStorage.getItem(HISTORY_STORAGE_KEY)
try {
  localStorage.removeItem(HISTORY_STORAGE_KEY)
  saveHistory([stale358796])
  const loaded = loadHistory()
  assert('遷移後仍一筆', loaded.length === 1)
  assert('遷移後同 id', loaded[0]?.id === stale358796.id)
  assert(
    'loadHistory 自動修正 358796',
    hasHarm(loaded[0]?.harms ?? [], '門迫', {
      target: '驚門',
      animal: '龍',
    }),
  )
  assert('遷移後保留 note', loaded[0]?.note === '保留備註')
  assert('遷移後保留 favorite', loaded[0]?.favorite === true)
  // 再讀一次不應複製
  const loaded2 = loadHistory()
  assert('二次讀取不重複', loaded2.length === 1 && loaded2[0]?.id === stale358796.id)

  // createHistoryRecord 必須寫入最新 harms
  const freshSave = createHistoryRecord(
    calculatePalace('358796', '358796'),
    '新存',
  )
  assert(
    '新建 358796 含門迫龍',
    hasHarm(freshSave.harms, '門迫', { target: '驚門', animal: '龍' }) &&
      freshSave.palaceName === '震',
  )
} finally {
  if (migBackup == null) localStorage.removeItem(HISTORY_STORAGE_KEY)
  else localStorage.setItem(HISTORY_STORAGE_KEY, migBackup)
}

console.log(`\n結果：${passed} 通過，${failed} 失敗`)
if (failed > 0) throw new Error(`self-check failed: ${failed}`)
