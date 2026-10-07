const C="sales-v77",F=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","sdm-logo.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=="sales-data").map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);
 /* only the app itself and Firebase's script files; never the live database traffic */
 if(u.origin!==location.origin&&u.hostname!=="www.gstatic.com")return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c)).catch(()=>{});return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))))});
/* daily follow-up reminder (runs in the background on Android when the app is installed) */
function ld(){const d=new Date(),p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())}
async function dailyNote(){
 const c=await caches.open("sales-data"),r=await c.match("due.json");if(!r)return;
 const j=await r.json(),t=ld();if(j.shown===t)return;
 const due=(j.l||[]).filter(x=>x.d&&x.d<=t);if(!due.length)return;
 j.shown=t;await c.put("due.json",new Response(JSON.stringify(j)));
 const names=due.slice(0,3).map(x=>x.n).join(", ")+(due.length>3?" +"+(due.length-3)+" more":"");
 await self.registration.showNotification(due.length+(due.length>1?" follow-ups due":" follow-up due"),{body:names,tag:"fu-daily",icon:"icon-192.png",badge:"icon-192.png"})}
self.addEventListener("periodicsync",e=>{if(e.tag==="sales-daily")e.waitUntil(dailyNote())});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>{for(const w of l){if("focus"in w)return w.focus()}return clients.openWindow("./")}))});
