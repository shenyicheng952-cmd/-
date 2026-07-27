import * as chrono from 'chrono-node'
import { toLocalDateKey } from './dates'

const CHINESE_DIGITS = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 }
const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"'`]+/giu
const BARE_URL_PATTERN =
  /(?:www\.)?(?:[a-z0-9-]+\.)+(?:com|cn|net|org|io|me|app|co)(?:\/[^\s<>"'`]*)?/giu
const URL_TRAILING_PUNCTUATION = /[，。！？、；：,.!?;:）)\]】}》〉]+$/u
const SHARE_PROMPT_PATTERN =
  /(?:复制(?:此)?链接)?(?:打开|到)\s*(?:抖音|小红书|快手|微博)(?:app)?[，,：:\s]*(?:看看|查看|搜索|观看)?/giu
const SHARE_CODE_PATTERN = /(?:^|\s)[A-Za-z0-9]{2,12}:\/+(?=\s|$)/gu
const DOUYIN_SHARE_PATTERN = /[\d.]*\s*复制打开抖音[，,]\s*看看【[^】]+】[的之]作品[，,]?\s*/u
const XHS_SHARE_PATTERN = /[\d.]*\s*复制(?:本条|打开)小红书[，,]\s*看看【[^】]+】[的之]?笔记[，,]?\s*/u
const SHARE_FRAGMENT_PATTERN = /[\d.]*\s*(?:复制打开|复制本条|打开APP|长按复制)[^。！？\n]*/giu
const BARE_SHARE_CODE = /(?:^|\s)[A-Za-z]{2,6}:\/\S*(?=\s|$)/gu

function trimUrl(url) {
  return url.replace(URL_TRAILING_PUNCTUATION, '')
}

export function extractUrls(text) {
  return [...text.matchAll(URL_PATTERN)].map((match) => trimUrl(match[0])).filter(Boolean)
}

export function stripUrls(text) {
  return text
    .replace(URL_PATTERN, (url) => url.slice(trimUrl(url).length))
    .replace(BARE_URL_PATTERN, (url) => url.slice(trimUrl(url).length))
}

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
  const contentWithoutUrls = stripUrls(text)
  const custom = customChineseDate(contentWithoutUrls, reference)
  const parsed = custom ?? chrono.zh.casual.parseDate(contentWithoutUrls, reference, { forwardDate: true })
  return parsed ? toLocalDateKey(parsed) : null
}

export function cleanTaskContent(text) {
  const original = text.trim()
  const cleaned = stripUrls(original)
    .replace(DOUYIN_SHARE_PATTERN, '')
    .replace(XHS_SHARE_PATTERN, '')
    .replace(SHARE_FRAGMENT_PATTERN, '')
    .replace(/^\s*\d+(?:\.\d+)?\s*(?=(?:复制|打开|到)\s*(?:抖音|小红书|快手|微博))/u, '')
    .replace(SHARE_PROMPT_PATTERN, ' ')
    .replace(SHARE_CODE_PATTERN, ' ')
    .replace(BARE_SHARE_CODE, ' ')
    .replace(/(?:长按复制|复制口令|打开APP查看更多|来抖音发现更多|本内容来自小红书)\s*/giu, ' ')
    .replace(/(?:今天|明天|后天|一周后|下周[一二三四五六日天]|下个月\s*[一二两三四五六七八九十\d]+\s*[号日]|[一二两三四五六七八九十\d]+\s*天后|(?:\d{1,2}月)?\d{1,2}[号日])(?:截止|前|交)?/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[，,。；;：:、\s]+|[，,。；;：:、\s]+$/g, '')
    .trim()

  return cleaned || original
}

export function extractInspoContent(text) {
  const url = detectSource(text).sourceUrl
  const base = url ? text.replace(url, '').trim() : text.trim()
  const cleaned = base
    .replace(DOUYIN_SHARE_PATTERN, '')
    .replace(XHS_SHARE_PATTERN, '')
    .replace(SHARE_FRAGMENT_PATTERN, '')
    .replace(SHARE_CODE_PATTERN, ' ')
    .replace(BARE_SHARE_CODE, ' ')
    .replace(/^[\d.]+\s*/u, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[，,。；;：:、\s]+|[，,。；;：:、\s]+$/g, '')
    .trim()
  return cleaned || base || ''
}

function normalizeStep(step) {
  return step
    .replace(/^\s*(?:第?[一二三四五六七八九十\d]+[.．、):：]|[-*•])\s*/u, '')
    .replace(/^[，,。；;：:、\s]+|[，,。；;：:、\s]+$/g, '')
    .trim()
}

export function splitTaskSteps(text, type = 'todo') {
  if (type !== 'todo') return []

  const content = text.trim()
  if (!content) return []

  const hasNumberedList = /(?:^|[\s；;。])第?[一二三四五六七八九十\d]+[.．、):：]\s*\S/u.test(content)
  const hasEnumeration = content.includes('、')
  const hasLongSentenceList =
    content.length >= 12 && /；|;|。|还有|到/u.test(content)

  if (!hasNumberedList && !hasEnumeration && !hasLongSentenceList) return []

  const parts = content
    .replace(/(?:^|\s+)第?[一二三四五六七八九十\d]+[.．、):：]\s*/gu, '\n')
    .split(/[\n；;。]+|还有|、|到/u)
    .map(normalizeStep)
    .filter((step) => step.length >= 2)

  return [...new Set(parts)].length >= 2 ? [...new Set(parts)] : []
}

export function detectSource(text) {
  const [sourceUrl] = extractUrls(text)
  if (!sourceUrl) return { source: null, sourceUrl: null }

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
