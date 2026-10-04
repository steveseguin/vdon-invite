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

const {test}=require('node:test');
const params=(a,id)=>new URL(a.ids[id].href).searchParams;
for (const mode of ['Pro-audio','Force mono','Standard audio mode']) {
 test(`display labels and fixed stream IDs survive ${mode}`,()=>{
  const a=boot();a.edit('&push','FIXED_ID');a.toggle('Show display names');a.toggle(mode);
  assert.equal(a.input('&push').value,'FIXED_ID');
  for(const [id,key] of [['url','push'],['viewUrl','view']]) {
   assert.equal(params(a,id).get(key),'FIXED_ID');
   assert.equal(params(a,id).has('sl'),true);
  }
 });
}
test('screen-sharing option survives audio selection',()=>{
 const a=boot();a.edit('&push','FIXED_ID');a.toggle('Screen');a.toggle('Pro-audio');
 assert.equal(params(a,'url').get('push'),'FIXED_ID');
 assert.equal(params(a,'url').has('ss'),true);
});
for(const operation of ['video radio','beta round trip']) {
 test(`viewer scene survives ${operation}`,()=>{
  const a=boot();a.edit('&room','demo');assert.equal(params(a,'viewUrl').has('scene'),true);
  if(operation==='video radio')a.toggle('Up to 1080p60');else {a.ctx.toggleBeta('viewUrl');a.ctx.toggleBeta('viewUrl');}
  assert.equal(params(a,'viewUrl').has('scene'),true);
  assert.equal(new URL(a.ids.viewUrl.dataset.raw).searchParams.has('scene'),true);
 });
}
test('room scene persists through audio and is removed on room clearing',()=>{
 const a=boot();a.edit('&room','demo');a.toggle('Pro-audio');a.edit('&room','next');
 assert.equal(params(a,'viewUrl').get('room'),'next');assert.equal(params(a,'viewUrl').getAll('scene').length,1);
 a.edit('&room','');assert.equal(params(a,'viewUrl').has('room'),false);assert.equal(params(a,'viewUrl').has('scene'),false);
 a.edit('&room','again');a.toggle('Force mono');assert.equal(params(a,'viewUrl').getAll('scene').length,1);
});
test('radio round trips preserve bare flags and encoded CSS',()=>{
 const a=boot();a.edit('&push','FIXED_ID');a.edit('&css','https://example.com/a b.css');a.toggle('Show display names');a.toggle('Screen');
 const css=params(a,'url').get('css');
 for(const mode of ['Pro-audio','Force mono','Standard audio mode','Pro-audio','Pro-audio']) {
  a.toggle(mode);
  assert.equal(params(a,'url').get('push'),'FIXED_ID');assert.equal(params(a,'url').get('css'),css);assert.equal(params(a,'url').has('ss'),true);assert.equal(params(a,'url').has('sl'),true);
  assert.equal(params(a,'url').getAll('s').length,mode==='Pro-audio'?1:0);assert.equal(params(a,'viewUrl').getAll('s').length,mode==='Pro-audio'?1:0);
  assert.equal(params(a,'url').getAll('mono').length,mode==='Force mono'?1:0);assert.equal(params(a,'viewUrl').has('mono'),false);
 }
 a.toggle('Show display names',false);assert.equal(params(a,'url').has('sl'),false);assert.equal(params(a,'url').has('s'),true);
});
test('radio replacement does not consume longer values',()=>{
 const a=boot();a.ids.url.dataset.raw+='&q=10';a.toggle('Up to 720p30');assert.deepEqual(params(a,'url').getAll('q'),['10','1']);
 a.toggle('Default quality');assert.deepEqual(params(a,'url').getAll('q'),['10']);
});
