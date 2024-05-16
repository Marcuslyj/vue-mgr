/**
 * 组合modules里边的模块，生成lang/{zh|en|fr}.js
 */

/* global process */

import fg from 'fast-glob'
import path from 'path'
import fs from 'fs'

const root = process.cwd()
const outputRoot = 'src/common/lang'
const outputRootPath = path.join(root, outputRoot)

const output = async (lang, files = []) => {
  const targets = files.filter(file => file.includes(`${lang}.js`))
  if (!targets.length) return

  const result = {}

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const [moduleName] = target.split('/').slice(-2)
    const content = (await import(`../modules/${moduleName}/${lang}.js`)).default
    result[moduleName] = content
  }

  onfillFinish(result, lang)
}

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

const excutor = async () => {
  const moduleRoot = 'src/common/lang/modules'
  const files = fg.sync([`${moduleRoot}/**/*.js`], { ignore: ['*.js'] })
  const langs = ['zh', 'en', 'fr']
  langs.forEach(lang => output(lang, files))
}

excutor()