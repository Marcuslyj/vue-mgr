/* global process */

/**
 * arg1 targets the module to translate, if not provided, translate all modules. 
 * by default, translate from zh to en,fr. if there is no en.js or fr.js, then generate it,
 * otherwise read the file and translate the vacancies
 */

import fg from 'fast-glob'
import fs from 'fs'
import lodash from 'lodash'
import minimist from 'minimist'
import path from 'path'

import { remoteTranslate } from './utils.js'

const { get, set } = lodash

const langs = { "zh": "zh", "en": "en", "fr": "fr" }
const remoteLangDict = {
  [langs.zh]: "zh-Hans",
  [langs.en]: "en",
  [langs.fr]: "fr"
}
const argv = minimist(process.argv.slice(2));
const [targetFolder] = argv._; // 指定需要翻译的子模块
const { from = "zh" } = argv
const root = process.cwd()
const moduleRoot = 'src/lang/modules'
const moduleRootPath = path.join(root, moduleRoot)

const hasLangJs = (lang, files) => files.includes(`${lang}.js`)
const formatChainKey = (key, prekey) => prekey ? `${prekey}.${key}` : key

/**
 * 获取需要翻译字段 & 复用已翻译（且翻译from文件存在）字段
 * @param {逐层遍历的当前遍历对象} curFrom 
 * @param {完整的toData} toData 
 * @param {keychain} preKey 
 * @returns {需要翻译字段数组} fieldsToTrans
 */
const loopAndGetNeedTrans = (curFrom = {}, toData = {}, existData = {}, fieldsToTrans = [], preKey = '') => {
  for (const [curkey, value] of Object.entries(curFrom)) {
    const chainKey = formatChainKey(curkey, preKey)
    if (!value) {
      set(toData, chainKey, value)
      continue
    }
    if (typeof value === 'string') {
      const existVal = get(existData, chainKey, '')
      if (typeof get(existData, chainKey) !== 'string') set(toData, chainKey, '')
      // 空值才需要翻译，否则沿用
      if (!value.trim()) {
        set(toData, chainKey, '')
      } else if (existVal.trim()) {
        set(toData, chainKey, existVal) // 复用
      } else {
        fieldsToTrans.push(chainKey)
      }
      continue
    }
    if (typeof value === 'object') {
      set(toData, chainKey, get(toData, chainKey, {}))
      loopAndGetNeedTrans(value, toData, existData, fieldsToTrans, chainKey)
    }
  }
  return fieldsToTrans
}

/**
 * 遍历重设一遍，保证字段顺序一致
 * @param {fromData逐层遍历对象} curFrom 
 * @param {完整的result对象} toData 
 * @param {chainKey} preKey 
 */
const loopAndSet = (curFrom, toData, preKey) => {
  for (const [curkey, value] of Object.entries(curFrom)) {
    const chainKey = formatChainKey(curkey, preKey)
    set(toData, chainKey, get(toData, chainKey, ''))
    if (typeof value === 'object')
      loopAndSet(value, toData, chainKey)
  }
}

/**
 * 子模块根据中文翻译成目标语言
 * @param {*} lang 翻译的目标语言
 * @param {*} folderPath 模块路径
 */
const transLang = async (lang, folderPath) => {
  const files = fg.sync([`${folderPath}/*.js`]).map(path => path.split('/').pop())
  if (!hasLangJs(langs[from], files)) return // 翻译from文件不存在，停止执行

  const moduleName = folderPath.split('/').pop()
  const fromData = (await import(`../modules/${moduleName}/${from}.js`)).default // 读取翻译from文件

  const result = {} // 结果对象
  const hasTargetLangFile = hasLangJs(lang, files)
  const existTargetLang = hasTargetLangFile ? ((await import(`../modules/${moduleName}/${lang}.js`)).default || {}) : {}// 读取目标语言翻译

  // 获取需要翻译的字段 & 复用已翻译字段
  const fieldsToTrans = loopAndGetNeedTrans(fromData, result, existTargetLang)
  // 创建翻译请求参数
  const reqData = fieldsToTrans.map(field => ({ text: get(fromData, field) }))

  if (reqData.length) {
    const translations = (await remoteTranslate(reqData, lang, remoteLangDict[from])).data || []
    translations.forEach((t, i) =>
      set(result, fieldsToTrans[i], get(t, "translations[0].text", ''))
    )
  }

  // 不翻译也重新生成，保证字段顺序同步一致。
  loopAndSet(fromData, result)

  const objString = `export default ${JSON.stringify(result, null, 2)};\n`; // 指定字段输出顺序
  fs.writeFile(path.join(moduleRootPath, `/${moduleName}/${lang}.js`), objString, () => { })
}

/**
 * 执行翻译子模块
 */
const excutor = () => {
  const folderPaths = targetFolder
    ? [`${moduleRoot}/${targetFolder}`] // 有指定目标模块
    : fg.sync([`${moduleRoot}/*`], { onlyDirectories: true, ignore: `${moduleRoot}/.*` }) // 所有模块

  const targetLangs = Object.values(langs).filter(l => l !== from)
  folderPaths.forEach(folderPath =>
    targetLangs.forEach(lang => transLang(lang, folderPath))
  )
}

excutor()
