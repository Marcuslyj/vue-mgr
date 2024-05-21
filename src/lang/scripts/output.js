/**
 * 组合modules里边的模块，生成lang/{zh|en|fr}.js
 */

/* global process */

import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const outputRoot = 'src/lang'
const outputRootPath = path.join(root, outputRoot)

/**
 * 组合特定语言的所有模块，输出
 * @param {*} lang 
 * @param {*} files 
 */
const output = async (lang, files = []) => {
  const filePaths = files.filter(file => file.includes(`${lang}.js`))
  if (!filePaths.length) return

  const result = {}

  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i]
    const [moduleName] = filePath.split('/').slice(-2)
    const content = (await import(`../modules/${moduleName}/${lang}.js`)).default
    result[moduleName] = content
  }

  onfillFinish(result, lang)
}

/**
 * 填充完成，生成lang/{zh|en|fr}.js
 * @param {*} result 
 * @param {*} lang 
 */
const onfillFinish = (result, lang) => {
  const objString = `export default ${JSON.stringify(result, null, 2)};\n`;
  fs.writeFile(path.join(outputRootPath, `/${lang}.js`), objString,
    (err) => {
      if (err) {
        // console.error('Error:', err);
      } else {
        // console.log('Object has been written to output.js');
      }
    });
}

/**
 * 执行
 */
const excutor = async () => {
  const moduleRoot = 'src/lang/modules'
  const files = fg.sync([`${moduleRoot}/**/*.js`], { ignore: ['*.js'] })
  const langs = ['zh', 'en', 'fr']
  langs.forEach(lang => output(lang, files))
}

excutor()