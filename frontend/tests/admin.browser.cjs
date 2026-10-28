// API fixture chỉ trong test, không truy cập Atlas.

const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'unimatch-admin-test-'));
const chrome=spawn(process.env.CHROME_BIN || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'chromium'),['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-pipe','--user-data-dir='+profile],{stdio:['ignore','ignore','ignore','pipe','pipe'],windowsHide:true});
let id=0,buffer='',session;const pending=new Map(),network=[],errors=[];let onPaused;
function send(method,params={},sessionId=session){return new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(new Error('Timeout '+method))},15000);pending.set(n,{resolve,reject,timer});chrome.stdio[3].write(JSON.stringify({id:n,method,params,sessionId})+'\0')})}
chrome.stdio[4].on('data',data=>{buffer+=data.toString();let n;while((n=buffer.indexOf('\0'))>=0){const m=JSON.parse(buffer.slice(0,n));buffer=buffer.slice(n+1);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result)}}else if(m.method==='Fetch.requestPaused')onPaused(m.params).catch(e=>{if(!/Invalid InterceptionId|Invalid requestId/.test(e.message))errors.push(e.message)});else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails?.text);else if(m.method==='Network.responseReceived'&&m.params.response.mimeType.includes('json'))network.push(m.params.response.url)}});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});return r.result.value}

const assert=require('node:assert/strict'),baseUrl=process.env.ADMIN_TEST_URL||'http://127.0.0.1:5176',artifactDirectory=fs.mkdtempSync(path.join(os.tmpdir(),'unimatch-admin-results-')),report={testFixturesOnly:true,atlasAccess:false,widths:[],sections:[],errors};

// Dữ liệu chỉ dùng trong test; không phải thống kê hoặc tài khoản thật.
const fixtureUser={id:'admin-browser-fixture',fullName:'Admin kiểm thử',email:'admin-test@example.org',role:'admin',favorites:[]};
const metadata=require('../../backend/src/modules/admin/aiSources');
const fixture={
 universities:Array.from({length:18},(_,i)=>({_id:'school-'+i,slug:'test-school-'+(i+1),name:'Trường kiểm thử '+(i+1),institutionType:'public',address:{district:'Địa chỉ kiểm thử'}})),
 majors:Array.from({length:23},(_,i)=>({_id:'major-'+i,code:'test-'+i,name:'Ngành kiểm thử '+i})),
 tuition:Array.from({length:4},(_,i)=>({_id:'tuition-'+i,universityName:'Trường kiểm thử 1',universitySlug:'test-school-1',program:'Chương trình kiểm thử '+i,academicYear:'2026-2027',amountMin:1000000*(i+1),unit:'year',sourceUrl:'https://example.org/test-only'})),
 admissions:Array.from({length:3},(_,i)=>({_id:'admission-'+i,universityName:'Trường kiểm thử 1',universitySlug:'test-school-1',majorCode:'test-'+i,method:'other',year:2026,score:50+i,scale:100,sourceUrl:'https://example.org/test-only'})),
 users:[fixtureUser,{_id:'test-user',fullName:'User kiểm thử',email:'user-test@example.org',role:'user'}],
 'ai-data':Object.keys(metadata.SOURCES).map(slug=>({slug,domains:metadata.SOURCES[slug],admission:metadata.ADMISSION_SOURCES[slug]||null,uncertainMajors:metadata.UNCERTAIN_MAJORS[slug]||[]}))
};
onPaused=async p=>{
 const url=new URL(p.request.url);const headers=[{name:'Access-Control-Allow-Origin',value:'*'},{name:'Access-Control-Allow-Methods',value:'GET,OPTIONS'},{name:'Access-Control-Allow-Headers',value:'Authorization,Content-Type'},{name:'Content-Type',value:'application/json'}];
 if(p.request.method==='OPTIONS'){await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:204,responseHeaders:headers});return;}
 assert.equal(p.request.method,'GET');await delay(220);let data;
 if(url.pathname.endsWith('/auth/me'))data={user:fixtureUser};
 else if(url.pathname.endsWith('/overview'))data={universities:18,majors:23,users:2,tuition:4,admissions:3};
 else {const rows=fixture[url.pathname.split('/').at(-1)]||[],q=(url.searchParams.get('q')||'').toLowerCase(),all=rows.filter(row=>JSON.stringify(row).toLowerCase().includes(q)),page=Number(url.searchParams.get('page')||1),limit=Number(url.searchParams.get('limit')||15);data={items:all.slice((page-1)*limit,page*limit),total:all.length,page,limit,totalPages:Math.ceil(all.length/limit),academicYear:metadata.ACADEMIC_YEAR,provenance:'Metadata fixture kiểm thử cách ly'};}
 await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:200,responseHeaders:headers,body:Buffer.from(JSON.stringify(data)).toString('base64')});
};
async function waitFor(expression){for(let n=0;n<120;n++){if(await evaluate(expression))return;await delay(100)}throw Error('Không đạt: '+expression)}
(async()=>{try{
const t=await send('Target.createTarget',{url:baseUrl+'/login'});session=(await send('Target.attachToTarget',{targetId:t.targetId,flatten:true})).sessionId;
await send('Runtime.enable');await send('Network.enable');await send('Page.enable');
await waitFor("!!document.querySelector('form')");
await send('Fetch.enable',{patterns:[{urlPattern:'*/api/auth/me*'},{urlPattern:'*/api/admin/*'}]});
const token='test-only-admin-fixture-token';
await evaluate('localStorage.setItem("token",'+JSON.stringify(token)+')');
await send('Page.navigate',{url:baseUrl+'/admin'});
await waitFor("document.querySelectorAll('.ad-stats article').length===5");
assert.equal(await evaluate("document.querySelector('.ad-stats strong').textContent"),'18');
for(const section of ['universities','majors','tuition','admissions','users','ai-data']){
 await evaluate("document.querySelector('.ad-sidebar a[href=\"/admin/"+section+"\"]').click()");
 await delay(180);
 await waitFor("location.pathname==='/admin/"+section+"'&&!!document.querySelector('.ad-data-card')&&!document.querySelector('.ad-loading')&&document.querySelectorAll('tbody tr').length>0");
 const rows=await evaluate("document.querySelectorAll('tbody tr').length");assert(rows>0&&rows<=15,section+': '+rows);report.sections.push({section,rows});
 for(const width of [320,375,768,1024,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});await delay(100);
  const m=await evaluate("({viewport:innerWidth,scroll:document.documentElement.scrollWidth})");assert(m.scroll<=m.viewport+1,JSON.stringify({section,width,...m}));report.widths.push({section,width,passed:true});
 }
 if(section==='universities'){
  await evaluate("document.querySelector('[aria-label=\"Trang sau\"]').click()");await waitFor("document.querySelector('.ad-pagination').innerText.includes('Trang 2')");report.pagination=true;
 }
 if(section==='tuition'){
  await evaluate("(()=>{const input=document.querySelector('#ad-query');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'test-school-1');input.dispatchEvent(new Event('input',{bubbles:true}))})()");await delay(100);await evaluate("document.querySelector('.ad-search button').click()");await waitFor("document.querySelectorAll('tbody tr').length===4");report.tuitionSearchRecords=4;
 }
}
await evaluate("document.querySelector('.ad-sidebar a[href=\"/admin/majors\"]').click()");await waitFor("!!document.querySelector('tbody')");
await evaluate("(()=>{const i=document.querySelector('#ad-query');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,'no-results-admin-test-987');i.dispatchEvent(new Event('input',{bubbles:true}))})()");await delay(100);await evaluate("document.querySelector('.ad-search button').click()");await waitFor("document.querySelector('.ad-state')?.innerText.includes('Chưa có kết quả')");report.empty=true;
await send('Network.setBlockedURLs',{urls:['*://localhost:5000/api/admin/users*']});await evaluate("document.querySelector('.ad-sidebar a[href=\"/admin/users\"]').click()");await waitFor("document.querySelector('.ad-state')?.innerText.includes('Chưa tải')");report.error=true;
await send('Network.setBlockedURLs',{urls:[]});await evaluate("document.querySelector('.ad-state button').click()");await waitFor("document.querySelectorAll('tbody tr').length===2");report.retry=true;
await send('Network.emulateNetworkConditions',{offline:false,latency:800,downloadThroughput:-1,uploadThroughput:-1});await evaluate("document.querySelector('.ad-sidebar a[href=\"/admin\"]').click()");await waitFor("!!document.querySelector('.ad-loading')");report.loading=true;await waitFor("document.querySelectorAll('.ad-stats article').length===5");await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
for(const width of [320,1440]){await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});await delay(200);const m=await evaluate("({viewport:innerWidth,scroll:document.documentElement.scrollWidth})");assert(m.scroll<=m.viewport+1);const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(artifactDirectory,'admin-'+width+'.png'),Buffer.from(shot.data,'base64'))}
await evaluate("document.querySelector('.ad-header button').click()");await waitFor("['/login','/dang-nhap'].includes(location.pathname)&&!localStorage.getItem('token')");report.logout=true;
await send('Page.navigate',{url:baseUrl+'/signup'});await waitFor("!!document.querySelector('#confirmPassword')");report.signupAlias=true;
assert.equal(errors.length,0,JSON.stringify(errors));report.passed=true;fs.writeFileSync(path.join(artifactDirectory,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({artifactDirectory,...report}));
}finally{chrome.kill()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
