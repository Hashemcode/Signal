import json,sys
from playwright.sync_api import sync_playwright
URL='file:///home/claude/signal/dist/index.html'
errs=[]
def shot(pg,n): pg.screenshot(path=f'/tmp/shots/{n}.png',full_page=True)
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844},color_scheme='dark'); pg=ctx.new_page()
    pg.on('console', lambda m: errs.append((m.type,m.text)) if m.type=='error' and 'TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: errs.append(('pageerror',str(e))))
    pg.goto(URL); pg.fill('#nm','Dana'); pg.click('button[type=submit]'); pg.wait_for_timeout(300)
    pg.evaluate("go('labs')"); pg.wait_for_timeout(300); shot(pg,'lab_hub')
    # neuro
    pg.evaluate("go('lab',{id:'neuro'})"); pg.wait_for_timeout(400); shot(pg,'lab_neuro1')
    for i in range(6): pg.evaluate(f"document.querySelectorAll('#labhost .part')[{i}].dispatchEvent(new MouseEvent('click',{{bubbles:true}}))")
    pg.click('#fire'); pg.wait_for_timeout(1200); shot(pg,'lab_neuro1b'); pg.wait_for_timeout(1500)
    pg.click('[data-tab=synapse]'); pg.wait_for_timeout(300)
    for i in range(4): pg.click('#nx'); pg.wait_for_timeout(2200 if i==2 else 1200)
    shot(pg,'lab_neuro2'); pg.wait_for_timeout(1500)
    pg.click('#blk'); 
    for i in range(4): pg.click('#nx'); pg.wait_for_timeout(2200 if i==2 else 900)
    shot(pg,'lab_neuro2b')
    pg.click('[data-tab=race]'); pg.click('#go'); pg.wait_for_timeout(2500); shot(pg,'lab_neuro3'); pg.wait_for_timeout(3200)
    print('neuro done', pg.evaluate("Object.keys(P().labs.neuro.done)"))
    # reflex
    pg.evaluate("go('lab',{id:'reflex'})"); pg.wait_for_timeout(300)
    for i in range(5):
        pg.click('#zone'); pg.wait_for_selector('.ruler-zone.ready',timeout=6000); pg.click('#zone'); pg.wait_for_timeout(100)
    shot(pg,'lab_reflex1')
    pg.click('[data-tab=race]'); pg.click('#go'); pg.wait_for_timeout(1800); shot(pg,'lab_reflex2a'); pg.wait_for_timeout(3000); shot(pg,'lab_reflex2b')
    pg.click('[data-tab=cut]')
    for c in ['sens','relay','motor']:
        pg.click(f'[data-c={c}]'); pg.click('#pred .opt >> nth=1'); pg.click('#test'); pg.wait_for_timeout(3000); 
        if c=='motor': shot(pg,'lab_reflex3')
    print('reflex done', pg.evaluate("Object.keys(P().labs.reflex.done)"))
    # eye
    pg.evaluate("go('lab',{id:'eye'})"); pg.wait_for_timeout(400)
    pg.evaluate("(()=>{const s=document.querySelector('#lt');s.value=100;s.dispatchEvent(new Event('input'))})()"); pg.wait_for_timeout(2500); shot(pg,'lab_eye1')
    pg.evaluate("(()=>{const s=document.querySelector('#lt');s.value=0;s.dispatchEvent(new Event('input'))})()"); pg.wait_for_timeout(2500); shot(pg,'lab_eye1b')
    pg.click('#flash'); pg.wait_for_timeout(500)
    pg.click('[data-tab=focus]'); pg.wait_for_timeout(300); shot(pg,'lab_eye2a')
    pg.evaluate("(()=>{const s=document.querySelector('#dist');s.value=10;s.dispatchEvent(new Event('input'))})()"); shot(pg,'lab_eye2b')
    pg.evaluate("(()=>{const s=document.querySelector('#cil');s.value=57;s.dispatchEvent(new Event('input'))})()"); shot(pg,'lab_eye2c')
    print('eye done', pg.evaluate("Object.keys(P().labs.eye.done)"))
    # glucose
    pg.evaluate("go('lab',{id:'glucose'})"); pg.wait_for_timeout(500)
    pg.click('[data-a=meal]'); pg.wait_for_timeout(6000); shot(pg,'lab_glu1')
    pg.click('#mode [data-m=t1]'); pg.click('[data-a=meal]'); pg.wait_for_timeout(5000); shot(pg,'lab_glu2')
    pg.click('[data-a=i6]'); pg.wait_for_timeout(5000); shot(pg,'lab_glu3')
    pg.click('[data-tab=scare]'); pg.click('#bang'); pg.wait_for_timeout(4000); shot(pg,'lab_scare1'); pg.wait_for_timeout(4000); shot(pg,'lab_scare2')
    print('glucose done', pg.evaluate("Object.keys(P().labs.glucose.done)"))
    # plant
    pg.evaluate("go('lab',{id:'plant'})"); pg.wait_for_timeout(400)
    pg.evaluate("document.querySelector('#dy').value=7;document.querySelector('#dy').dispatchEvent(new Event('input'))"); pg.wait_for_timeout(200); shot(pg,'lab_plant1')
    pg.click('#g-tip [data-v=cover]'); pg.evaluate("document.querySelector('#dy').value=7;document.querySelector('#dy').dispatchEvent(new Event('input'))"); shot(pg,'lab_plant2')
    pg.click('#g-tip [data-v=cut]'); pg.evaluate("document.querySelector('#dy').value=7;document.querySelector('#dy').dispatchEvent(new Event('input'))")
    pg.click('#g-tip [data-v=on]'); pg.click('#g-light [data-v=none]'); pg.click('#g-or [data-v=side]'); pg.evaluate("document.querySelector('#dy').value=7;document.querySelector('#dy').dispatchEvent(new Event('input'))"); shot(pg,'lab_plant3')
    pg.click('#clino'); pg.evaluate("document.querySelector('#dy').value=7;document.querySelector('#dy').dispatchEvent(new Event('input'))"); shot(pg,'lab_plant4')
    print('plant done', pg.evaluate("Object.keys(P().labs.plant.done)"))
    b.close()
print(json.dumps(errs,indent=1))
