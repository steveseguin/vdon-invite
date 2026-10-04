const fs=require('fs'), vm=require('vm'), assert=require('assert/strict');
const source=fs.readFileSync(__dirname+'/../'+(process.env.SOURCE || 'main.js'),'utf8'), steps=JSON.parse(fs.readFileSync(__dirname+'/../data.json','utf8'));
function boot(){
  const ids={}, all=[];
  class Element{
    constructor(tag){this.tagName=tag.toUpperCase();this.dataset={};this.attrs={};this.children=[];this.value='';this.style={};this.classList={add(){},remove(){},toggle(){}};this.events={};all.push(this)}
    setAttribute(k,v){this.attrs[k]=String(v);if(k.startsWith('data-'))this.dataset[k.slice(5)]=String(v);else if(k==='onchange')this.onchange=()=>ctx.updateLink(this);else if(k==='name')this.name=v}
    getAttribute(k){return this.attrs[k]||null}
    appendChild(e){this.children.push(e);e.parentElement=this}
    addEventListener(k,f){this.events[k]=f}
    querySelectorAll(){return all.filter(e=>e.name===this._queryName)}
    blur(){}
    click(){if(this.events.click)this.events.click.call(this)}
    set id(x){this._id=x;ids[x]=this}get id(){return this._id}
    set href(x){this._href=new URL(x,'https://invite.test/').href}get href(){return this._href}
  }
  for(const id of ['url','viewUrl','directorUrl','directorLink','panels']){const e=new Element('a');e.id=id;if(id.endsWith('Url')||id==='url'){e.href='https://vdo.ninja/';e.dataset.raw=e.href;e.innerText=id==='directorUrl'?e.href:''}}
  const ctx=vm.createContext({document:{getElementById:id=>ids[id],createElement:tag=>new Element(tag)},URL,console:{log(){},error(){}},Math,generateName:()=> 'DemoRoom',fetch:()=>new Promise(()=>{}),setTimeout, btoa});ctx.window=ctx;
  vm.runInContext(source,ctx);ctx.printSteps(steps);
  const input=param=>all.find(e=>e.tagName==='INPUT'&&e.dataset.param===param&&e.getAttribute('type')==='text');
  const edit=(param,value)=>{const e=input(param);e.oldValue=e.value;e.value=value;ctx.updateLink(e)};
  const toggle=(label,checked=true)=>{let e=ids[label];e.checked=checked;if(e.getAttribute('type')==='radio'){e.parentElement.parentElement.parentElement.querySelectorAll=()=>all.filter(x=>x.name===e.name)}ctx.updateLink(e)};
  const links=()=>Object.fromEntries(['url','viewUrl','directorUrl'].map(id=>[id,{href:ids[id].href,raw:ids[id].dataset.raw,text:ids[id].innerText}]));
  return {ctx,ids,all,input,edit,toggle,links};
}

const {test} = require('node:test');
const parsed = (app, id) => new URL(app.ids[id].href);

test('initial viewer link matches the generated push ID', () => {
  const app = boot();
  const id = parsed(app, 'url').searchParams.get('push');
  assert.ok(id);
  assert.equal(parsed(app, 'viewUrl').searchParams.get('view'), id);
  assert.equal(app.ids.viewUrl.innerText, app.ids.viewUrl.href);
  assert.equal(app.ids.viewUrl.dataset.raw, app.ids.viewUrl.href);
});

test('password before room produces a root-path director URL with both parameters', () => {
  const app = boot();
  app.edit('&pw', 'secret');
  app.edit('&room', 'demo');
  for (const id of ['url', 'viewUrl', 'directorUrl']) {
    assert.equal(parsed(app, id).pathname, '/');
    assert.equal(parsed(app, id).searchParams.get('pw'), 'secret');
  }
  assert.equal(parsed(app, 'directorUrl').searchParams.get('dir'), 'demo');
});

test('password special characters survive edits and clearing in either room order', () => {
  for (const roomFirst of [false, true]) {
    const app = boot();
    if (roomFirst) app.edit('&room', 'demo');
    for (const password of ['one&two', 'three', 'space + % # ? = / café', '', 'final&value']) {
      app.edit('&pw', password);
      for (const id of ['url', 'viewUrl', 'directorUrl']) {
        const params = parsed(app, id).searchParams;
        assert.equal(params.get('pw'), password || null);
        assert.equal(params.getAll('pw').length, password ? 1 : 0);
      }
    }
    if (!roomFirst) app.edit('&room', 'demo');
    app.edit('&room', 'another');
    assert.equal(parsed(app, 'directorUrl').searchParams.get('dir'), 'another');
    assert.equal(parsed(app, 'directorUrl').searchParams.get('pw'), 'final&value');
    app.edit('&room', '');
    assert.equal(parsed(app, 'directorUrl').searchParams.get('dir'), null);
    assert.equal(parsed(app, 'directorUrl').searchParams.get('pw'), 'final&value');
    app.edit('&room', 'restored');
    assert.equal(parsed(app, 'directorUrl').searchParams.get('dir'), 'restored');
  }
});

test('password edits preserve bare flag spelling for later toggles', () => {
  const app = boot();
  const push = parsed(app, 'url').searchParams.get('push');
  app.toggle('Show display names');
  app.edit('&pw', 'secret');
  app.toggle('Show display names', false);
  assert.equal(parsed(app, 'url').searchParams.get('push'), push);
  assert.equal(parsed(app, 'viewUrl').searchParams.get('view'), push);
  for (const id of ['url', 'viewUrl']) {
    assert.equal(parsed(app, id).searchParams.has('sl'), false);
    assert.equal(parsed(app, id).searchParams.get('pw'), 'secret');
  }
});

test('password changes preserve existing encoded CSS and raw display-name updates', () => {
  const app = boot();
  app.edit('&css', 'https://example.com/a b.css');
  app.edit('&l', 'Jane Doe');
  app.edit('&pw', 'secret');
  app.edit('&css', 'https://example.com/new.css');
  app.edit('&l', 'John Doe');
  assert.equal(parsed(app, 'url').searchParams.get('css'), 'https://example.com/new.css');
  assert.equal(parsed(app, 'viewUrl').searchParams.get('css'), 'https://example.com/new.css');
  assert.equal(parsed(app, 'url').searchParams.get('l'), 'John Doe');
});
