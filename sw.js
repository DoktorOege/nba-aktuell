const CACHE="nba-aktuell-v3";
const SHELL=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET")return;
  // Daten und Seite: zuerst Netz, sonst Cache
  if(u.origin===location.origin&&(/\/(data|rosters)\.json$/.test(u.pathname)||e.request.mode==="navigate"||u.pathname.endsWith("index.html"))){
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(u.pathname.endsWith(".json")?u.pathname:e.request,c));return r}).catch(()=>caches.match(u.pathname.endsWith(".json")?u.pathname:e.request).then(r=>r||caches.match("index.html"))));
    return;
  }
  // Schriften und Symbole: Cache zuerst
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return res})));
  }
});
