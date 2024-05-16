import axios from "axios";
import { v4 as uuidv4 } from 'uuid'

// https://api.cognitive.microsofttranslator.com/languages?api-version=3.0

export const remoteTranslate = (data, to, from = 'zh-Hans') => {
  const key = ""; // 填入azure 服务的密钥
  const endpoint = "https://api.cognitive.microsofttranslator.com";
  const location = "eastasia"; // azure服务的位置区域

  return axios({
    baseURL: endpoint,
    url: '/translate',
    method: 'post',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Ocp-Apim-Subscription-Region': location,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuidv4().toString()
    },
    params: {
      'api-version': '3.0',
      from,
      to,
    },
    responseType: 'json',
    data,
  })
}

export const combineLang = (lang) => {
  if (!lang) return
  const langFiles = import.meta.glob('@/lang/modules/**/*.js', { eager: false })

  const filterPaths = Object.keys(langFiles).filter(key => key.includes(`/${lang}.js`))

  // const out 

  console.log(filterPaths)
}
