import assert from 'node:assert/strict';
import { MobileLabRepository } from '../src/features/shifts/data/repository';
import { Shift, enroll, complete } from '../src/features/shifts/domain/shift';
async function main() {
 const repo=new MobileLabRepository(process.argv[2]);
 const id='integration-demo';
 if(process.argv[3]==='write'){
  const s:Shift={id,title:'Integración demo',place:'Patio',date:'2026-11-29',capacity:2,participants:[]};
  await repo.save(s);assert.equal((await repo.list()).find(x=>x.id===id)?.title,s.title);
  await repo.save(enroll(s,'Alias demo'));assert.equal((await repo.list()).find(x=>x.id===id)?.participants.length,1);
 }else{
  const s=(await repo.list()).find(x=>x.id===id);assert.ok(s);assert.equal(s.participants[0].alias,'Alias demo');
  await repo.save(complete(s,'Alias demo'));assert.equal((await repo.list()).find(x=>x.id===id)?.participants[0].completed,true);
  await repo.remove(id);assert.equal((await repo.list()).some(x=>x.id===id),false);
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
