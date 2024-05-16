/* global process */

/**
 * arg1 targets the module to translate, if not provided, translate all modules. 
 * by default, translate from zh to en,fr. if there is no en.js or fr.js, then generate it,
 * otherwise read the file and translate the vacancies
 */

import minimist from 'minimist'
import fg from 'fast-glob'
import path from 'path'
import fs from 'fs'
import lodash from 'lodash'
import { remoteTranslate } from './utils.js'

const { get } = lodash

const langs = {
  "zh": "zh", "en": "en", "fr": "fr"
}

const argv = minimist(process.argv.slice(2));
const [targetFolder] = argv._;

const root = process.cwd()
const moduleRoot = 'src/common/lang/modules'
const moduleRootPath = path.join(root, moduleRoot)


const hasLangJs = (lang, files) => files.includes(`${lang}.js`)


const transLang = async (lang, folderPath) => {
  const files = fg.sync([`${folderPath}/*.js`]).map(path => path.split('/').pop())
  if (!hasLangJs(langs.zh, files)) return

  const filePath = folderPath.replace(moduleRoot + '/', '')
  const [folder] = filePath.split('/')
  const zh = (await import('../modules/' + folder + '/zh.js')).default

  let target = {}
  const hasTargetLangFile = hasLangJs(lang, files)
  if (hasTargetLangFile)
    target = (await import(`../modules/${folder}/${lang}.js`)).default

  const fieldsToTrans = []
  for (const [k, txt] of Object.entries(zh)) {
    if ((!get(target, k, '').trim()) && txt.trim()) {
      fieldsToTrans.push(k)
    }
  }

  const reqData = fieldsToTrans.map(field => ({ text: zh[field] }))

  if (reqData.length) {
    const res = await remoteTranslate(reqData, lang)
    const translations = res.data;
    translations.forEach((t, i) => {
      target[fieldsToTrans[i]] = get(t, "translations[0].text", '')
    })

    const objString = `export default ${JSON.stringify(target, null, 2)};\n`;
    fs.writeFile(path.join(moduleRootPath, `/${folder}/${lang}.js`), objString,
      (err) => {
        if (err) {
          // console.error('Error:', err);
        } else {
          // console.log('Object has been written to output.js');
        }
      });
  }
}

const excutor = () => {
  let files
  if (targetFolder) {
    files = [`${moduleRoot}/${targetFolder}`]
  } else {
    files = fg.sync([`${moduleRoot}/*`], { onlyDirectories: true, ignore: `${moduleRoot}/.*` })
  }


  files.forEach(async folderPath => {
    transLang('en', folderPath)
    transLang('fr', folderPath)
  })
}


excutor()

