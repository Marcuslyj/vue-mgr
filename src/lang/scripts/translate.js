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

const { get } = lodash

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

/**
 * 子模块根据中文翻译成目标语言
 * @param {*} lang 翻译的目标语言
 * @param {*} folderPath 模块路径
 */
const transLang = async (lang, folderPath) => {
  const files = fg.sync([`${folderPath}/*.js`]).map(path => path.split('/').pop())
  if (!hasLangJs(langs[from], files)) return

  const moduleName = folderPath.split('/').pop()
  const fromData = (await import(`../modules/${moduleName}/${from}.js`)).default // 读取中文翻译

  let result = {} // 结果对象
  const hasTargetLangFile = hasLangJs(lang, files)
  let existTargetLang = {}
  if (hasTargetLangFile) {
    existTargetLang = (await import(`../modules/${moduleName}/${lang}.js`)).default || {} // 读取目标语言翻译
  }

  const fieldsToTrans = []
  const allFields = []
  for (const [k, txt = ''] of Object.entries(fromData)) {
    result[k] = Reflect.has(existTargetLang, k) ? existTargetLang[k] : ''
    // 空值才需要翻译，否则沿用
    if ((!get(result, k, '').trim()) && txt.trim()) fieldsToTrans.push(k)
    allFields.push(k)
  }
  // 创建翻译请求参数
  const reqData = fieldsToTrans.map(field => ({ text: fromData[field] }))

  if (reqData.length) {
    const translations = (await remoteTranslate(reqData, lang, remoteLangDict[from])).data || []
    translations.forEach((t, i) => {
      result[fieldsToTrans[i]] = get(t, "translations[0].text", '')
    })

    // // 重新设置一遍，保证字段顺序一致，否则新设置的翻译的字段会追加在最后
    // allFields.forEach(field => {
    //   // eslint-disable-next-line
    //   result[field] = result[field]
    // })


    const objString = `export default ${JSON.stringify(result, allFields, 2)};\n`; // 指定字段输出顺序
    fs.writeFile(path.join(moduleRootPath, `/${moduleName}/${lang}.js`), objString, () => { });
  }
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
