import json
from playwright.sync_api import sync_playwright
URL='file:///home/claude/signal/dist/index.html'
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844}); pg=ctx.new_page()
    pg.on('console', lambda m: errs.append((m.type,m.text)) if m.type=='error' and 'TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append(('pageerror',str(e))))
    pg.goto(URL); pg.fill('#nm','Dana'); pg.click('button[type=submit]'); pg.wait_for_timeout(300)
    pg.evaluate("""()=>{const pick=(f)=>BANK.find(f);const qs=[pick(q=>q.type==='mcq'&&q.fig),pick(q=>q.type==='mcq'&&!q.fig),pick(q=>q.type==='tf'),pick(q=>q.type==='label'&&q.diagram==='eye'),pick(q=>q.type==='order'),pick(q=>q.type==='match'),pick(q=>q.type==='sort'),pick(q=>q.type==='explain'&&q.marks>=3),pick(q=>q.type==='label'&&q.diagram==='arc'),pick(q=>q.type==='label'&&q.diagram==='gland'),pick(q=>q.type==='label'&&q.diagram==='brain'),pick(q=>q.type==='label'&&q.diagram==='neurone')];
      window.__qs=qs; R.view='practice'; Runner(document.querySelector('#main'),{qs,quit:()=>go('home'),again:()=>{}})}""")
    pg.wait_for_timeout(300)
    n=pg.evaluate("__qs.length")
    for i in range(n):
        t=pg.evaluate(f"__qs[{i}].type")
        pg.screenshot(path=f'/tmp/shots/q{i:02d}_{t}_a.png', full_page=True)
        if t in('mcq',): pg.click('.opt >> nth=0')
        elif t=='tf': pg.click('.opt >> nth=0')
        elif t=='label': pg.evaluate("document.querySelector('.part').dispatchEvent(new MouseEvent('click',{bubbles:true}))")
        elif t=='order':
            for _ in range(pg.evaluate("__qs[%d].steps.length"%i)): pg.click('#qh [data-i] >> nth=0')
            pg.screenshot(path=f'/tmp/shots/q{i:02d}_{t}_b.png', full_page=True)
            pg.click('#chk, #act button')
        elif t=='match':
            for k in range(4):
                pg.click('[data-l]:not(.sel) >> nth=%d'%0) if False else None
                pg.click('#qh [data-l] >> nth=%d'%k); pg.click('#qh [data-r] >> nth=%d'%k)
            pg.screenshot(path=f'/tmp/shots/q{i:02d}_{t}_b.png', full_page=True)
            pg.click('#act button')
        elif t=='sort':
            n2=pg.evaluate("__qs[%d].items.length"%i)
            for k in range(n2): pg.click('#qh .sortrow >> nth=%d >> button >> nth=0'%k)
            pg.screenshot(path=f'/tmp/shots/q{i:02d}_{t}_b.png', full_page=True)
            pg.click('#act button')
        elif t=='explain':
            pg.fill('#ans','Circular muscles contract and radial muscles relax so the pupil gets smaller. Auxin moves to the shaded side and the cells elongate. The pancreas releases insulin.')
            pg.click('#act button'); pg.wait_for_timeout(200)
            pg.screenshot(path=f'/tmp/shots/q{i:02d}_{t}_b.png', full_page=True)
            pg.click('#act button')
        pg.wait_for_timeout(300)
        pg.screenshot(path=f'/tmp/shots/q{i:02d}_{t}_c.png', full_page=True)
        pg.click('#act button')   # next
        pg.wait_for_timeout(200)
    pg.screenshot(path='/tmp/shots/q_summary.png', full_page=True)
    b.close()
print(json.dumps(errs,indent=1))
