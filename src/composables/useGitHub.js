import { computed } from 'vue'

const GH_API = 'https://api.github.com'

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function base64ToUtf8(b64) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export function useGitHub(gh) {
  function ghHeaders() {
    return {
      Authorization: 'Bearer ' + gh.value.token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
  }

  async function ghGetFile() {
    const url = GH_API + '/repos/' + gh.value.owner + '/' + gh.value.repo + '/contents/records.json?ref=' + gh.value.branch
    const r = await fetch(url, { headers: ghHeaders() })
    if (!r.ok) throw new Error('GET -> ' + r.status)
    const d = await r.json()
    return { content: JSON.parse(base64ToUtf8(d.content)), sha: d.sha }
  }

  async function ghPutFile(content, sha, msg) {
    const url = GH_API + '/repos/' + gh.value.owner + '/' + gh.value.repo + '/contents/records.json'
    const body = {
      message: msg || '新增炸鱼记录',
      content: utf8ToBase64(JSON.stringify(content, null, 2) + '\n'),
      sha,
      branch: gh.value.branch,
    }
    const r = await fetch(url, { method: 'PUT', headers: ghHeaders(), body: JSON.stringify(body) })
    if (!r.ok) throw new Error('PUT -> ' + r.status)
    return r.json()
  }

  async function ghTestConnection() {
    const url = GH_API + '/repos/' + gh.value.owner + '/' + gh.value.repo
    const r = await fetch(url, { headers: ghHeaders() })
    return r.ok
  }

  return { ghHeaders, ghGetFile, ghPutFile, ghTestConnection }
}
