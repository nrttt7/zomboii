const admin=require('firebase-admin');
admin.initializeApp({credential:admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))});
const db=admin.firestore(),KEY=process.env.SYNC_KEY,HOOK=process.env.DISCORD_WEBHOOK_URL,UID=process.env.DISCORD_USER_ID;
const DAY=864e5,LV=[50,25,10,0],DV=[30,7,0];
const LM={50:'เลือดเหลือครึ่งหลอดแล้วนะ 🩸',25:'เลือดเหลือ 25% เริ่มแผ่วแล้ว! 😰',10:'เลือดเหลือแค่ 10% ใกล้สิ้นลมแล้ว 💀',0:'เลือดหมดหลอดแล้ว! โดนฟันเรียบร้อย ⚔️'};
const today=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Bangkok'});
(async()=>{
 const S=(await db.doc('zomboii/'+KEY).get()).data();if(!S)return console.log('ไม่พบข้อมูล ตรวจ SYNC_KEY');
 const aref=db.doc('alerts/'+KEY),sent=(await aref.get()).data()||{},msgs=[];
 for(const v of S.vehicles){
  const d=Math.max(0,Math.round((new Date(today)-new Date(v.odoDate))/DAY)),cur=v.odo+(v.sim?d*v.kmDay:0);
  for(const p of v.parts){const h=Math.max(0,100*(1-(cur-p.lastOdo)/p.max)),k=`${v.id}${p.id}${p.lastOdo}_`,L=LV.filter(l=>h<=l).pop();
   if(L===undefined||sent[k+L])continue;LV.filter(l=>l>=L).forEach(l=>sent[k+l]=1);
   msgs.push(`🧟‍♂️ [ZOMBOII] ลูกพี่! ${p.name}ของ ${v.name} ${LM[L]}`)}
  for(const x of v.dues){const n=Math.round((new Date(x.due)-new Date(today))/DAY),k=`${v.id}${x.id}${x.due}_`,L=DV.filter(l=>n<=l).pop();
   if(L===undefined||sent[k+L])continue;DV.filter(l=>l>=L).forEach(l=>sent[k+l]=1);
   msgs.push(`🧟‍♂️ [ZOMBOII] ลูกพี่! ${L===0?`ถึงเวลาต่อ${x.name}ของ ${v.name} แล้ว!`:`อีก ${n} วันต้องต่อ${x.name}ของ ${v.name} นะ`}`)}}
 for(const m of msgs){const r=await fetch(HOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:(UID?`<@${UID}> `:'')+m})});if(!r.ok)console.log('discord error',r.status);await new Promise(r=>setTimeout(r,700))}
 await aref.set(sent);console.log('ส่งแจ้งเตือน',msgs.length,'ข้อความ');
})().catch(e=>{console.error(e);process.exit(1)});
