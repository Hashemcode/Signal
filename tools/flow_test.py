import json
from playwright.sync_api import sync_playwright
URL='file:///home/claude/signal/dist/index.html'
errs=[]
def shot(pg,n): pg.screenshot(path=f'/tmp/shots/{n}.png',full_page=True)
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844},color_scheme='dark'); pg=ctx.new_page()
    pg.on('console', lambda m: errs.append((m.type,m.text)) if m.type=='error' and 'TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append(('pageerror',str(e))))
    pg.goto(URL); pg.fill('#nm','Dana'); pg.click('button[type=submit]'); pg.wait_for_timeout(300)
    # practice session real flow: answer 8 via helper that clicks first option / completes
    pg.evaluate("go('practice',{t:null})"); pg.wait_for_timeout(300)
    for i in range(10):
        t=pg.evaluate("(document.querySelector('.qtype span:last-child')||{}).textContent")
        print('practice',i,t)
        if t is None: shot(pg,'run_fail'); break
        if t in('Multiple choice','True or false'): pg.click('.opt >> nth=0')
        elif t=='Tap the diagram': pg.evaluate("document.querySelector('.part').dispatchEvent(new MouseEvent('click',{bubbles:true}))")
        elif t=='Put in order':
            n=pg.locator('#qh [data-i]').count()
            while pg.locator('#qh [data-i]').count()>0: pg.click('#qh [data-i] >> nth=0')
            pg.click('#act button')
        elif t=='Match up':
            for k in range(4): pg.click('#qh [data-l] >> nth=%d'%k); pg.click('#qh [data-r] >> nth=%d'%k)
            pg.click('#act button')
        elif t=='Sort into groups':
            for k in range(pg.locator('#qh .sortrow').count()): pg.click('#qh .sortrow >> nth=%d >> button >> nth=0'%k)
            pg.click('#act button')
        elif t=='Written answer':
            pg.fill('#ans','The tip detects light and auxin moves to the shaded side so cells elongate and the shoot bends towards the light'); pg.click('#act button'); pg.click('#act button')
        pg.wait_for_timeout(150)
        if pg.locator('#act button').count()==0: shot(pg,'run_fail2'); print('NO BUTTON at',i,t, errs); print(pg.evaluate('document.querySelector("#fbh").innerHTML')); break
        pg.click('#act button'); pg.wait_for_timeout(150)
    shot(pg,'run_summary')
    pg.evaluate("go('cases')"); pg.wait_for_timeout(200); shot(pg,'cases_hub')
    pg.evaluate("go('case',{id:'c4'})"); pg.wait_for_timeout(300); shot(pg,'case_c4')
    # exam
    pg.evaluate("go('exam')"); pg.wait_for_timeout(200); shot(pg,'exam_home')
    pg.click('[data-k=full]'); pg.wait_for_timeout(300); shot(pg,'exam_q1')
    n=pg.evaluate("EXAM.qs.length"); print('exam qs',n, [q['type'] for q in json.loads(pg.evaluate("JSON.stringify(EXAM.qs.map(q=>({type:q.type})))"))])
    for i in range(n):
        t=pg.evaluate("(document.querySelector('.qtype span:last-child')||{}).textContent")
        print('exam',i,t)
        if t is None: shot(pg,'exam_fail'); break
        if t in('Multiple choice','True or false'): pg.click('.opt >> nth=0')
        elif t=='Tap the diagram': pg.evaluate("document.querySelector('.part').dispatchEvent(new MouseEvent('click',{bubbles:true}))")
        elif t=='Put in order':
            while pg.locator('#qh [data-i]').count()>0: pg.click('#qh [data-i] >> nth=0')
        elif t=='Match up':
            for k in range(4): pg.click('#qh [data-l] >> nth=%d'%k); pg.click('#qh [data-r] >> nth=%d'%k)
        elif t=='Sort into groups':
            for k in range(pg.locator('#qh .sortrow').count()): pg.click('#qh .sortrow >> nth=%d >> button >> nth=0'%k)
        elif t=='Written answer':
            pg.fill('#ans','Circular muscles contract, radial muscles relax, the pupil gets smaller and less light enters to protect the retina. Ciliary muscles contract and the lens becomes fatter.')
        if i<n-1: pg.click('#nx')
    shot(pg,'exam_last'); pg.click('#fin'); pg.click('#yes'); pg.wait_for_timeout(500); shot(pg,'exam_res')
    pg.evaluate("go('me')"); pg.wait_for_timeout(400); shot(pg,'me')
    code=pg.evaluate("makeCode(P())"); print(code[:60])
    pg.evaluate("go('teacher')"); pg.fill('#codes',code+"\n"+code.replace('A','B',1)+"\nnonsense"); pg.click('#go'); pg.wait_for_timeout(300); shot(pg,'teacher')
    b.close()
    # light theme + desktop
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':900},color_scheme='light'); pg=ctx.new_page()
    pg.on('pageerror', lambda e: errs.append(('pageerror',str(e))))
    pg.goto(URL); pg.fill('#nm','Mina'); pg.click('button[type=submit]'); pg.wait_for_timeout(1500); shot(pg,'light_home')
    pg.evaluate("go('lab',{id:'eye'})"); pg.wait_for_timeout(800); shot(pg,'light_eye')
    b.close()
print(json.dumps(errs,indent=1))
