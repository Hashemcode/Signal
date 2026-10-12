import sys, json
from playwright.sync_api import sync_playwright
URL='file:///home/claude/signal/dist/index.html'
errs=[]
def run(p, vp, name, dark=True):
    b=p.chromium.launch()
    ctx=b.new_context(viewport=vp, color_scheme='dark' if dark else 'light', device_scale_factor=1)
    pg=ctx.new_page()
    pg.on('console', lambda m: errs.append(('console',m.type,m.text)) if m.type in('error','warning') else None)
    pg.on('pageerror', lambda e: errs.append(('pageerror',str(e))))
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.screenshot(path=f'/tmp/shots/{name}_welcome.png')
    pg.fill('#nm','Dana'); pg.click('button[type=submit]'); pg.wait_for_timeout(1200)
    pg.screenshot(path=f'/tmp/shots/{name}_home.png', full_page=True)
    return b,pg
with sync_playwright() as p:
    b,pg=run(p,{'width':390,'height':844},'m')
    for t in range(5):
        pg.evaluate(f"go('topic',{{t:{t}}})"); pg.wait_for_timeout(300)
    pg.evaluate("go('topic',{t:2})"); pg.wait_for_timeout(300); pg.screenshot(path='/tmp/shots/m_topic.png', full_page=True)
    b.close()
    b,pg=run(p,{'width':1280,'height':900},'d')
    b.close()
print(json.dumps(errs,indent=1))
