// Cloudflare Worker. Secrets belong in Cloudflare, never in this file.
const SITE = 'https://graphcrackers.github.io';
const HOME = SITE + '/arete-cardnews/';
const REPO = '/repos/GraphCrackers/arete-cardnews';
const enc = new TextEncoder();
const dec = new TextDecoder();
const validId = id => typeof id === 'string' && /^[\w-]{1,60}$/.test(id) && id !== 'index';
const fail = (status, message) => { throw Object.assign(new Error(message), {status}); };
const b64 = bytes => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const un64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const url64 = bytes => b64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const random = () => url64(crypto.getRandomValues(new Uint8Array(32)));
async function key(env) {
  if (!env.GITHUB_CLIENT_SECRET || !env.GITHUB_CLIENT_ID) fail(503, 'GitHub 연결 설정이 필요합니다.');
  const hash = await crypto.subtle.digest('SHA-256', enc.encode('arete-session-v1:' + env.GITHUB_CLIENT_SECRET));
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
async function seal(data, env) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({name:'AES-GCM', iv}, await key(env), enc.encode(JSON.stringify(data)));
  return b64(iv) + '.' + b64(new Uint8Array(encrypted));
}
async function unseal(value, env, kind) {
  try {
    const [iv, body] = value.split('.');
    const plain = await crypto.subtle.decrypt({name:'AES-GCM', iv:un64(iv)}, await key(env), un64(body));
    const data = JSON.parse(dec.decode(plain));
    if (data.kind !== kind || data.exp < Date.now()) throw Error();
    return data;
  } catch { fail(401, '로그인이 만료됐습니다. 다시 로그인해주세요.'); }
}
async function github(path, token, method = 'GET', body) {
  const r = await fetch('https://api.github.com' + path, {
    method, headers:{Authorization:'Bearer ' + token, Accept:'application/vnd.github+json',
      'User-Agent':'arete-cardnews', 'X-GitHub-Api-Version':'2026-03-10', 'Content-Type':'application/json'},
    ...(body === undefined ? {} : {body:JSON.stringify(body)})
  });
  if (!r.ok) fail(r.status, r.status === 401 ? '다시 로그인해주세요.' :
    r.status === 403 ? '저장소 쓰기 권한 또는 GitHub 요청 한도를 확인해주세요.' :
    r.status === 409 || r.status === 422 ? '저장소가 변경됐거나 게시가 제한됐습니다. 최신 버전을 확인해주세요.' : 'GitHub 요청에 실패했습니다. (' + r.status + ')');
  return r.json();
}
async function access(token) {
  const repo = await github(REPO, token);
  if (!repo.permissions?.push) fail(403, 'arete-cardnews 저장소의 쓰기 권한이 필요합니다.');
  return repo;
}
async function file(path, ref, token) {
  try { return await github(REPO + '/contents/' + path + '?ref=' + encodeURIComponent(ref), token); }
  catch (e) { if (e.status === 404) return null; throw e; }
}
function jsonFile(f) {
  if (!f || f.encoding !== 'base64') fail(422, '파일을 읽을 수 없습니다.');
  return JSON.parse(dec.decode(un64(f.content.replace(/\s/g, ''))));
}
async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) fail(400, '게시할 내용이 없습니다.');
  let total = 0; const chunks = [];
  while (true) {
    const {done, value} = await reader.read(); if (done) break;
    total += value.length;
    if (total > 8 * 1024 * 1024) { await reader.cancel(); fail(413, '사진 크기를 줄여주세요. 게시 한도는 8MB입니다.'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(dec.decode(bytes)); } catch { fail(400, '올바른 JSON이 아닙니다.'); }
}
function response(data, status = 200) {
  return new Response(JSON.stringify(data), {status, headers:{'Content-Type':'application/json; charset=utf-8'}});
}
async function route(request, env) {
  const url = new URL(request.url);
  if (request.method === 'GET' && url.pathname === '/') return response({service:'ARETE Cardnews API', version:1});
  if (request.method === 'GET' && url.pathname === '/auth/login') {
    const state = random(), verifier = random();
    const challenge = url64(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(verifier))));
    const cookie = await seal({kind:'oauth', state, verifier, exp:Date.now()+600000}, env);
    const target = new URL('https://github.com/login/oauth/authorize');
    target.search = new URLSearchParams({client_id:env.GITHUB_CLIENT_ID, redirect_uri:url.origin+'/auth/callback',
      state, code_challenge:challenge, code_challenge_method:'S256', allow_signup:'false'});
    return new Response(null, {status:302, headers:{Location:target.href,
      'Set-Cookie':'__Host-arete-oauth='+encodeURIComponent(cookie)+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=600'}});
  }
  if (request.method === 'GET' && url.pathname === '/auth/callback') {
    const cookie = (request.headers.get('Cookie') || '').split('; ').find(x => x.startsWith('__Host-arete-oauth='));
    const flow = await unseal(decodeURIComponent(cookie?.split('=').slice(1).join('=') || ''), env, 'oauth');
    if (!url.searchParams.get('state') || flow.state !== url.searchParams.get('state')) fail(401, '로그인 요청이 일치하지 않습니다. 다시 시도해주세요.');
    if (!url.searchParams.get('code')) fail(401, 'GitHub 로그인이 취소됐습니다.');
    const r = await fetch('https://github.com/login/oauth/access_token', {method:'POST',
      headers:{Accept:'application/json', 'Content-Type':'application/json'},
      body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID, client_secret:env.GITHUB_CLIENT_SECRET,
        code:url.searchParams.get('code'), code_verifier:flow.verifier, redirect_uri:url.origin+'/auth/callback'})});
    const data = await r.json();
    if (!r.ok || !data.access_token) fail(401, 'GitHub 로그인에 실패했습니다. 다시 시도해주세요.');
    await access(data.access_token);
    const session = await seal({kind:'session', token:data.access_token,
      exp:Date.now()+Math.min(data.expires_in || 28800, 28800)*1000}, env);
    const nonce = random();
    // The GitHub token is encrypted; the browser keeps only this short-lived session in memory.
    const script = `if(window.opener){window.opener.postMessage(${JSON.stringify({type:'arete-auth', session})},${JSON.stringify(SITE)});window.close();}`;
    return new Response('<!doctype html><meta charset="utf-8"><title>ARETE 로그인</title><p>로그인됐습니다. 카드뉴스 편집기로 돌아가세요.</p><a href="'+HOME+'">편집기 열기</a><script nonce="'+nonce+'">'+script+'</script>',
      {headers:{'Content-Type':'text/html; charset=utf-8', 'Content-Security-Policy':`default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`,
        'Set-Cookie':'__Host-arete-oauth=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0'}});
  }
  if (!url.pathname.startsWith('/api/')) fail(404, '주소를 찾을 수 없습니다.');
  if (request.headers.get('Origin') !== SITE) fail(403, '카드뉴스 편집기에서 요청해주세요.');
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) fail(401, '먼저 GitHub에 로그인해주세요.');
  const {token} = await unseal(auth.slice(7), env, 'session');
  const repo = await access(token);
  if (request.method === 'GET' && url.pathname === '/api/me') {
    const user = await github('/user', token);
    return response({login:user.login, branch:repo.default_branch});
  }
  if (request.method === 'GET' && url.pathname.startsWith('/api/projects/')) {
    const id = url.pathname.slice('/api/projects/'.length);
    if (!validId(id)) fail(400, '올바른 편 이름이 아닙니다.');
    const f = await file('projects/'+id+'.json', repo.default_branch, token);
    return response({sha:f?.sha || null, project:f ? jsonFile(f) : null});
  }
  if (request.method === 'POST' && url.pathname === '/api/publish') {
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) fail(415, 'JSON 형식이 필요합니다.');
    const {id, project, expectedSha} = await readBody(request);
    if (!validId(id) || !project || !Array.isArray(project.cards) || !project.cards.length ||
        typeof project.name !== 'string' || project.name.length > 200 ||
        !(expectedSha === null || typeof expectedSha === 'string' && /^[a-f0-9]{40}$/.test(expectedSha))) fail(400, '편 이름과 카드 내용을 확인해주세요.');
    const branch = encodeURIComponent(repo.default_branch);
    const head = await github(REPO+'/git/ref/heads/'+branch, token);
    const parent = await github(REPO+'/git/commits/'+head.object.sha, token);
    const path = 'projects/'+id+'.json';
    const current = await file(path, head.object.sha, token);
    if ((current?.sha || null) !== expectedSha) fail(409, '다른 팀원이 먼저 수정했습니다. JSON을 백업하고 최신 버전을 확인해주세요.');
    const indexFile = await file('projects/index.json', head.object.sha, token);
    const existing = indexFile ? jsonFile(indexFile) : [];
    if (!Array.isArray(existing)) fail(422, '편 목록 형식을 확인해주세요.');
    const index = existing.map(x => typeof x === 'string' ? {id:x, title:x} : x);
    const entry = index.find(x => x.id === id);
    if (entry) entry.title = project.name; else index.push({id, title:project.name});
    const blob = await github(REPO+'/git/blobs', token, 'POST', {content:JSON.stringify(project,null,2), encoding:'utf-8'});
    const tree = await github(REPO+'/git/trees', token, 'POST', {base_tree:parent.tree.sha, tree:[
      {path, mode:'100644', type:'blob', sha:blob.sha},
      {path:'projects/index.json', mode:'100644', type:'blob', content:JSON.stringify(index,null,2)}]});
    const commit = await github(REPO+'/git/commits', token, 'POST', {
      message:'카드뉴스: '+project.name, tree:tree.sha, parents:[head.object.sha]});
    // A competing commit makes this non-fast-forward update fail; never force push.
    await github(REPO+'/git/refs/heads/'+branch, token, 'PATCH', {sha:commit.sha, force:false});
    return response({sha:blob.sha, commit:commit.sha, url:HOME+'?p='+encodeURIComponent(id)});
  }
  fail(404, '지원하지 않는 요청입니다.');
}
export default {
  async fetch(request, env) {
    let result;
    try {
      if (request.method === 'OPTIONS') {
        if (request.headers.get('Origin') !== SITE) fail(403, '허용되지 않은 요청입니다.');
        result = new Response(null, {status:204});
      } else result = await route(request, env);
    } catch (e) { result = response({error:e.status ? e.message : '처리 중 오류가 발생했습니다. 다시 시도해주세요.'}, e.status || 500); }
    const headers = new Headers(result.headers);
    headers.set('Cache-Control', 'no-store');
    headers.set('Referrer-Policy', 'no-referrer');
    headers.set('X-Content-Type-Options', 'nosniff');
    if (request.headers.get('Origin') === SITE) {
      headers.set('Access-Control-Allow-Origin', SITE);
      headers.set('Vary', 'Origin');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    }
    return new Response(result.body, {status:result.status, headers});
  }
};
