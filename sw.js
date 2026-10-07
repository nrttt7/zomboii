const C='zomboii-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.webmanifest','icons/icon-192.png'])))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||/firestore\.googleapis\.com|discord\.com|identitytoolkit|securetoken/.test(u.host))return;
 e.respondWith(caches.match(r).then(m=>{const n=fetch(r).then(x=>{if(x&&(x.ok||x.type==='opaque'))caches.open(C).then(c=>c.put(r,x.clone()));return x}).catch(()=>m);return m||n}))});
