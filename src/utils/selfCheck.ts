/**
 * 可執行自我檢查：npm run self-check
 */
import { letterToNumber, normalizeInput } from './normalizeInput'
import { parseSixCode } from './parseCode'
import { calculatePalace } from './calculatePalace'

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

assert('letter A→1', letterToNumber('A') === '1')
assert('letter j→1', letterToNumber('j') === '1')
assert('letter S→1', letterToNumber('S') === '1')
assert('letter I→9', letterToNumber('I') === '9')
assert('letter R→9', letterToNumber('R') === '9')
assert('letter Z→8', letterToNumber('Z') === '8')

assert(
  'normalize spaces',
  normalizeInput(' 1 9 8 9 0 2 ').ok &&
    normalizeInput(' 1 9 8 9 0 2 ').value === '198902',
)
assert(
  'normalize fullwidth',
  normalizeInput('１９８９０２').ok &&
    normalizeInput('１９８９０２').value === '198902',
)
assert(
  'normalize letters',
  normalizeInput('AIHZAB').ok && normalizeInput('AIHZAB').value === '198812',
)

assert('parse ok 198902', parseSixCode('198902').ok === true)
assert('parse reject palace 0', parseSixCode('098902').ok === false)
assert('parse reject short', parseSixCode('1989').ok === false)
assert('parse reject long', parseSixCode('1989021').ok === false)

const r1 = calculatePalace('198902', '198902')
assert('palace 1 坎', r1.palaceName === '坎')
assert('god 值符(9)', r1.god === '值符')
// 198902 → 宮1 神9 星8 門9 天0 地2
assert('star 天任', r1.star === '天任')
assert('door 景門', r1.door === '景門')
assert('empty void true', r1.isEmptyVoid === true)
assert('heaven blank', r1.heavenStem === null)
assert('earth 乙', r1.earthStem === '乙')

const r2 = calculatePalace('111111', '111111')
assert('needs heaven choice', r2.needsHeavenChoice === true)
assert('needs earth choice', r2.needsEarthChoice === true)

const r3 = calculatePalace('111111', '111111', {
  heavenStemChoice: '甲',
  earthStemChoice: '戊',
})
assert('choice applied', r3.heavenStem === '甲' && r3.earthStem === '戊')
// 第 3 位為 5 → 天芮（非天禽）
assert('star 5 is 天芮 not 天禽', calculatePalace('x', '115111').star === '天芮')

console.log(`\n結果：${passed} 通過，${failed} 失敗`)
if (failed > 0) {
  throw new Error(`self-check failed: ${failed}`)
}
