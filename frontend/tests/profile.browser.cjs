// Kiểm thử trình duyệt với API fixture; không truy cập Atlas hoặc đăng ký tài khoản.

const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'unimatch-profile-test-'));
const chrome=spawn(process.env.CHROME_BIN || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'chromium'),['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-pipe','--user-data-dir='+profile],{stdio:['ignore','ignore','ignore','pipe','pipe'],windowsHide:true});
let id=0,buffer='',session;const pending=new Map(),network=[],errors=[]; let onPaused;
function send(method,params={},sessionId=session){return new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(new Error('Timeout '+method))},15000);pending.set(n,{resolve,reject,timer});chrome.stdio[3].write(JSON.stringify({id:n,method,params,sessionId})+'\0')})}
chrome.stdio[4].on('data',data=>{buffer+=data.toString();let n;while((n=buffer.indexOf('\0'))>=0){const m=JSON.parse(buffer.slice(0,n));buffer=buffer.slice(n+1);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result)}}else if(m.method==='Fetch.requestPaused')onPaused(m.params).catch(e=>errors.push(e.message));else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);else if(m.method==='Network.responseReceived'&&m.params.response.mimeType.includes('json'))network.push(m.params.response.url)}});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});return r.result.value}

const assert=require('node:assert/strict');
const baseUrl=process.env.PROFILE_TEST_URL || 'http://127.0.0.1:5175';const out=fs.mkdtempSync(path.join(os.tmpdir(),'unimatch-profile-results-'));const report={testDataOnly:true,authenticatedRealAccount:false,cases:[],widths:[],errors};
let mode='empty',meCalls=0,allSchools=[],requests=[];
const testUser={id:'profile-ui-test-only',fullName:'Nguyễn Minh Anh',email:'profile-test@example.org',role:'user',favorites:[]};
onPaused=async p=>{
 const url=new URL(p.request.url);requests.push({method:p.request.method,path:url.pathname});
 if(p.request.method==='OPTIONS'){await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:204,responseHeaders:[{name:'Access-Control-Allow-Origin',value:'*'},{name:'Access-Control-Allow-Methods',value:'GET, OPTIONS'},{name:'Access-Control-Allow-Headers',value:'Authorization, Content-Type'}]});return;}
 let value,status=200;
 if(url.pathname.endsWith('/auth/me')){
  meCalls++;
  if(mode==='slow'&&meCalls>1)await delay(900);
  if(mode==='unauthorized'||(mode==='profile-error'&&meCalls>1)){status=mode==='unauthorized'?401:503;value={message:'Lỗi kết nối kiểm thử'};}
  else {value={user:{...testUser,favorites:['filled','missing','school-error','admin'].includes(mode)?[allSchools[0]._id,allSchools[1]._id,...(mode==='missing'?['missing-test-id']:[])]:[],role:mode==='admin'?'admin':'user'}}}
 }else{
  value=allSchools;
  if(mode==='school-error'){status=503;value={message:'Không tải được danh sách trường (kiểm thử)'}}
 }
 await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:'*'}],body:Buffer.from(JSON.stringify(value)).toString('base64')});
};
async function waitFor(expression){for(let i=0;i<80;i++){if(await evaluate(expression))return;await delay(100)}console.log(JSON.stringify({mode,meCalls,requests,errors,screen:await evaluate('({url:location.href,text:document.body.innerText})')}));throw new Error('Không đạt điều kiện: '+expression)}
async function navigate(next,route='/profile',authenticated=true){
 mode=next;meCalls=0;
 await evaluate(authenticated?"localStorage.setItem('token','isolated-browser-fixture-token')":"localStorage.removeItem('token')");
 await send('Page.navigate',{url:baseUrl+route});
 await waitFor(authenticated&&next!=='unauthorized'?"!!document.querySelector('.up-fields')":"location.pathname==='/dang-nhap'");
}
async function tabFavorites(){await evaluate("document.querySelectorAll('[role=tab]')[1].click()");await delay(150)}
(async()=>{try{
 allSchools=[{_id:'000000000000000000000011',slug:'test-school-a',name:'Trường kiểm thử A',shortName:'TEST A',institutionType:'public',district:'Địa chỉ kiểm thử'},{_id:'000000000000000000000012',slug:'test-school-b',name:'Trường kiểm thử B',institutionType:'private'}];
 const target=await send('Target.createTarget',{url:'about:blank'});session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true})).sessionId;
 await send('Runtime.enable');await send('Page.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:baseUrl+'/dang-nhap'});await waitFor("!!document.querySelector('form')");
 await send('Fetch.enable',{patterns:[{urlPattern:'*/api/auth/me*'},{urlPattern:'*/api/universities'}]});
 await navigate('empty','/profile',false);report.cases.push('Chưa đăng nhập /profile chuyển sang /dang-nhap');
 await navigate('unauthorized');report.cases.push('Token bị từ chối chuyển sang đăng nhập');
 await navigate('empty');
 assert.equal(await evaluate("document.querySelector('.up-identity h2').textContent"),testUser.fullName);
 assert.equal(await evaluate("document.querySelector('.up-avatar').textContent"),'MA');
 assert((await evaluate("document.querySelector('.up-fields').innerText")).includes(testUser.email));
 assert.equal(await evaluate("document.querySelectorAll('.up-edit button:disabled,.up-security button:disabled').length"),2);
 report.cases.push('Tên, email, vai trò, avatar đúng response /auth/me; không giả lập chỉnh sửa/đổi mật khẩu');
 await tabFavorites();assert.equal(await evaluate("document.querySelectorAll('.up-school').length"),0);assert.equal(await evaluate("document.querySelector('.up-empty a')?.getAttribute('href')"),'/truong');
 report.cases.push('Yêu thích rỗng, CTA khám phá đúng');
 await navigate('filled');await tabFavorites();await waitFor("document.querySelectorAll('.up-school').length===2");
 assert.equal(await evaluate("document.querySelector('.up-stat strong').textContent"),'2');
 assert.equal(await evaluate("document.querySelector('.up-school a').getAttribute('href')"),'/truong/'+allSchools[0].slug);
 report.cases.push('Hai ID yêu thích được đối chiếu response API fixture, card và link chi tiết đúng');
 await evaluate("document.querySelectorAll('[role=tab]')[0].focus()");
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
 assert.equal(await evaluate("document.activeElement.getAttribute('aria-selected')"),'true');
 report.cases.push('Tab phím mũi tên: focus và active đúng');
 for(const width of [320,375,768,1024,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1100,deviceScaleFactor:1,mobile:width<500});
  for(const index of [0,1]){
   await evaluate("document.querySelectorAll('[role=tab]')["+index+"].click()");await delay(200);
   const size=await evaluate("({viewport:innerWidth,scroll:document.documentElement.scrollWidth})");assert(size.scroll<=size.viewport+1,JSON.stringify({width,index,...size}));
   report.widths.push({width,tab:index,passed:true,...size});
  }
  if(width===375||width===1440){
   await evaluate("document.querySelectorAll('[role=tab]')[0].click();window.scrollTo(0,0)");await delay(150);
   const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'profile-'+width+'.png'),Buffer.from(shot.data,'base64'));
  }
 }
 mode='slow';await evaluate("document.querySelector('.up-refresh').click()");await waitFor("!!document.querySelector('.up-skeleton-grid')");report.cases.push('Loading skeleton xuất hiện khi tải lại hồ sơ');await waitFor("document.querySelector('.up-stat strong').textContent==='0'");mode='empty';
 await tabFavorites();assert.equal(await evaluate("document.querySelectorAll('.up-school').length"),0);report.cases.push('Tải lại hồ sơ đồng bộ số lượng và danh sách từ 2 về 0');
 await navigate('school-error');await tabFavorites();await waitFor("document.querySelector('.up-empty [class]')&&document.querySelector('.up-empty')?.innerText.includes('Chưa tải')");
 mode='filled';await evaluate("document.querySelector('.up-empty button').click()");await waitFor("document.querySelectorAll('.up-school').length===2");report.cases.push('Lỗi tải danh sách và retry thành công');
 await navigate('missing');await tabFavorites();await waitFor("document.querySelectorAll('.up-school').length===2");assert.equal(await evaluate("document.querySelector('.up-stat strong').textContent"),'3');assert((await evaluate("document.querySelector('[role=tabpanel]:not([hidden])').innerText")).includes('1 trường đã lưu hiện không'));
 report.cases.push('ID không còn công khai: giữ đúng tổng số 3, hiển thị 2 card và thông báo thiếu 1');
 await navigate('profile-error');assert((await evaluate("document.querySelector('.up-error').innerText")).includes('Chưa thể làm mới'));
 mode='empty';await evaluate("document.querySelector('.up-error button').click()");await waitFor("!!document.querySelector('.up-refresh-status')");report.cases.push('Lỗi làm mới hồ sơ giữ dữ liệu phiên, retry báo tải lại thật');
 await navigate('admin','/ca-nhan');assert((await evaluate("document.querySelector('.up-role').innerText")).includes('Quản trị viên'));report.cases.push('/ca-nhan dùng cùng Profile; vai trò admin đúng');
 assert(requests.every(r=>['GET','OPTIONS'].includes(r.method)));assert.equal(errors.length,0,JSON.stringify(errors));
 report.readOnlyRequests=requests.length;report.passed=true;fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({artifactDirectory:out,...report}));
}finally{chrome.kill()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
