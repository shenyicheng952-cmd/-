import * as chrono from 'chrono-node'
import { toLocalDateKey } from './dates'

const CHINESE_DIGITS = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 }

function chineseNumber(value) {
  if (/^\d+$/.test(value)) return Number(value)
  if (value === '十') return 10
  if (value.startsWith('十')) return 10 + (CHINESE_DIGITS[value[1]] ?? 0)
  if (value.endsWith('十')) return (CHINESE_DIGITS[value[0]] ?? 1) * 10
  if (value.includes('十')) {
    const [tens, ones] = value.split('十')
    return (CHINESE_DIGITS[tens] ?? 1) * 10 + (CHINESE_DIGITS[ones] ?? 0)
  }
  return CHINESE_DIGITS[value] ?? Number(value)
}

function customChineseDate(text, reference) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate())
  if (text.includes('后天')) {
    start.setDate(start.getDate() + 2)
    return start
  }
  if (text.includes('明天')) {
    start.setDate(start.getDate() + 1)
    return start
  }
  const daysLater = text.match(/([一二两三四五六七八九十\d]+)\s*天后/)
  if (daysLater) {
    start.setDate(start.getDate() + chineseNumber(daysLater[1]))
    return start
  }
  if (/一周后|下周同一天/.test(text)) {
    start.setDate(start.getDate() + 7)
    return start
  }
  const nextMonth = text.match(/下个月\s*([一二两三四五六七八九十\d]+)\s*[号日]/)
  if (nextMonth) return new Date(start.getFullYear(), start.getMonth() + 1, chineseNumber(nextMonth[1]))
  return null
}

export function parseNaturalDate(text, reference = new Date()) {
  const custom = customChineseDate(text, reference)
  const parsed = custom ?? chrono.zh.casual.parseDate(text, reference, { forwardDate: true })
  return parsed ? toLocalDateKey(parsed) : null
}

export function cleanTaskContent(text) {
  return text
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/(?:今天|明天|后天|一周后|下周[一二三四五六日天]|下个月\s*[一二两三四五六七八九十\d]+\s*[号日]|[一二两三四五六七八九十\d]+\s*天后|(?:\d{1,2}月)?\d{1,2}[号日])(?:截止|前|交)?/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[，,、\s]+|[，,、\s]+$/g, '')
    .trim()
}

export function detectSource(text) {
  const match = text.match(/https?:\/\/[^\s]+/i)
  if (!match) return { source: null, sourceUrl: null }

  const sourceUrl = match[0].replace(/[，。！？、),\]]+$/g, '')
  try {
    const hostname = new URL(sourceUrl).hostname.toLowerCase()
    if (hostname === 'mp.weixin.qq.com' || hostname.endsWith('.weixin.qq.com')) {
      return { source: 'wechat', sourceUrl }
    }
    if (hostname === 'douyin.com' || hostname.endsWith('.douyin.com')) {
      return { source: 'douyin', sourceUrl }
    }
    if (
      hostname === 'xiaohongshu.com' ||
      hostname.endsWith('.xiaohongshu.com') ||
      hostname === 'xhslink.com' ||
      hostname.endsWith('.xhslink.com')
    ) {
      return { source: 'xhs', sourceUrl }
    }
    return { source: 'web', sourceUrl }
  } catch {
    return { source: 'web', sourceUrl }
  }
}
