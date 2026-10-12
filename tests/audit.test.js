import test from 'node:test';
import assert from 'node:assert/strict';
import {createStorage} from '../src/utils/storage.js';
let serviceId = 0;
const freshService = () => import('../src/services/search.js?audit=' + (++serviceId));
const request = {source: 'github', query: 'audit regression', page: 1};

test('non-JSON HTTP 429 still applies a rate-limit cooldown', async () => {
  const {search} = await freshService();
  let calls = 0;
  globalThis.fetch = async () => { calls++; return {ok:false,status:429,headers:new Headers({'retry-after':'120'}),json:async()=>{throw new SyntaxError('HTML error page');}}; };
  await assert.rejects(search(request), /rate limit/);
  await assert.rejects(search({...request,query:'another query'}), /pause/);
  assert.equal(calls, 1);
});

test('non-JSON HTTP 500 produces a helpful HTTP error', async () => {
  const {search} = await freshService();
  globalThis.fetch = async () => ({ok:false,status:500,headers:new Headers(),json:async()=>{throw new SyntaxError('HTML error page');}});
  await assert.rejects(search(request), /HTTP 500/);
});

test('GitHub secondary limit without retry-after also applies a cooldown', async () => {
  const {search} = await freshService();
  let calls = 0;
  globalThis.fetch = async () => {calls++;return {ok:false,status:403,headers:new Headers(),json:async()=>({message:'You have exceeded a secondary rate limit.'})};};
  await assert.rejects(search(request), /rate limit/);
  await assert.rejects(search({...request,query:'another query'}), /pause/);
  assert.equal(calls, 1);
});

test('null successful JSON is a malformed response, not a network failure', async () => {
  const {search} = await freshService();
  globalThis.fetch = async () => ({ok:true,status:200,headers:new Headers(),json:async()=>null});
  await assert.rejects(search(request), /Unexpected search response/);
});

test('storage preserves last successfully read values if later reads fail', () => {
  let broken = false;
  const messages = [];
  const storage = createStorage({getItem(){if(broken)throw new Error();return '[1,2]';},setItem(){}},m=>messages.push(m));
  assert.deepEqual(storage.read('saved'),[1,2]);
  broken = true;
  assert.deepEqual(storage.read('saved'),[1,2]);
  assert.equal(messages.length,1);
});

test('valid JSON with the wrong storage shape is reported as damaged', () => {
  let notices = 0;
  const storage = createStorage({getItem:()=>'{"unexpected":true}',setItem(){}},()=>notices++);
  assert.deepEqual(storage.read('saved'),[]);
  assert.equal(notices,1);
});

test('question answer-status filters use accepted booleans, not minimum answer count', async () => {
  const {searchUrl} = await freshService();
  const u = new URL(searchUrl({source:'stackoverflow',query:'javascript',filter:'unaccepted'}));
  assert.equal(u.searchParams.get('accepted'),'false');
  assert.equal(u.searchParams.has('answers'),false);
});

test('pagination reports more pages and stops GitHub at its search-window boundary', async () => {
  const {search} = await freshService();
  globalThis.fetch = async () => ({ok:true,status:200,headers:new Headers(),json:async()=>({items:[{id:1}],total_count:5000})});
  assert.equal((await search({...request,page:1})).more,true);
  assert.equal((await search({...request,page:83})).more,false);
  globalThis.fetch = async () => ({ok:true,status:200,headers:new Headers(),json:async()=>({items:[{question_id:1}],has_more:true})});
  assert.equal((await search({...request,source:'stackoverflow'})).more,true);
});

test('zero Stack Exchange quota blocks another network request', async () => {
  const {search} = await freshService();let calls=0;
  globalThis.fetch = async () => {calls++;return {ok:true,status:200,headers:new Headers(),json:async()=>({items:[],has_more:false,quota_remaining:0})};};
  const options={...request,source:'stackoverflow'};
  assert.equal((await search(options)).quota,0);
  await assert.rejects(search({...options,page:2}), /pause/);
  assert.equal(calls,1);
});

test('Stack Exchange error envelopes and timed-out requests are actionable', async () => {
  const {search} = await freshService();
  globalThis.fetch = async () => ({ok:true,status:200,headers:new Headers(),json:async()=>({error_id:400,error_name:'bad_parameter'})});
  await assert.rejects(search({...request,source:'stackoverflow'}), /simpler keyword/);
  globalThis.fetch = async () => {throw new DOMException('Aborted','AbortError');};
  await assert.rejects(search(request), /timed out/);
});

test('saved resource snapshots persist across storage instances and can be removed', () => {
  const data=new Map();const backend={getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)};
  const first=createStorage(backend);const saved=[{id:'github:1',source:'github',title:'Repository',url:'https://github.com/a/b'},{id:'stackoverflow:1',source:'stackoverflow',title:'Question',url:'https://stackoverflow.com/questions/1'}];
  first.write('saved',saved);const reloaded=createStorage(backend);
  assert.deepEqual(reloaded.read('saved'),saved);
  reloaded.write('saved',reloaded.read('saved').filter(i=>i.id!=='github:1'));
  assert.deepEqual(createStorage(backend).read('saved'),[saved[1]]);
  reloaded.write('saved',[]);assert.deepEqual(createStorage(backend).read('saved'),[]);
});
