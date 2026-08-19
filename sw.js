const CACHE='tram-trainer-2026-08-19-images-fix-v1';
const CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./tramnetz-2026.png","./tramnetz-quiz-ohne-ortschaften.png","./routes.json"];
const IMAGE_ASSETS=["./bilderquiz/iq_001.jpg","./bilderquiz/iq_002.jpg","./bilderquiz/iq_003.jpg","./bilderquiz/iq_004.jpg","./bilderquiz/iq_005.jpg","./bilderquiz/iq_006.jpg","./bilderquiz/iq_007.jpg","./bilderquiz/iq_008.jpg","./bilderquiz/iq_009.jpg","./bilderquiz/iq_010.jpg","./bilderquiz/iq_011.jpg","./bilderquiz/iq_012.jpg","./bilderquiz/iq_013.jpg","./bilderquiz/iq_014.jpg","./bilderquiz/iq_015.jpg","./bilderquiz/iq_016.jpg","./bilderquiz/iq_017.jpg","./bilderquiz/iq_018.jpg","./bilderquiz/iq_019.jpg","./bilderquiz/iq_020.jpg","./bilderquiz/iq_021.jpg","./bilderquiz/iq_022.jpg","./bilderquiz/iq_023.jpg","./bilderquiz/iq_024.jpg","./bilderquiz/iq_025.jpg","./bilderquiz/iq_026.jpg","./bilderquiz/iq_027.jpg","./bilderquiz/iq_028.jpg","./bilderquiz/iq_029.jpg","./bilderquiz/iq_030.jpg","./bilderquiz/iq_031.jpg","./bilderquiz/iq_032.jpg","./bilderquiz/iq_033.jpg","./bilderquiz/iq_034.jpg","./bilderquiz/iq_035.jpg","./bilderquiz/iq_036.jpg","./bilderquiz/iq_037.jpg","./bilderquiz/iq_038.jpg","./bilderquiz/iq_039.jpg","./bilderquiz/iq_040.jpg","./bilderquiz/iq_041.jpg","./bilderquiz/iq_042.jpg","./bilderquiz/iq_043.jpg","./bilderquiz/iq_044.jpg","./bilderquiz/iq_045.jpg","./bilderquiz/iq_046.jpg","./bilderquiz/iq_047.jpg","./bilderquiz/iq_048.jpg","./bilderquiz/iq_049.jpg","./bilderquiz/iq_050.jpg","./bilderquiz/iq_051.jpg","./bilderquiz/iq_052.jpg","./bilderquiz/iq_053.jpg","./bilderquiz/iq_054.jpg","./bilderquiz/iq_055.jpg","./bilderquiz/iq_056.jpg","./bilderquiz/iq_057.jpg","./bilderquiz/iq_058.jpg","./bilderquiz/iq_059.jpg","./bilderquiz/iq_060.jpg","./bilderquiz/iq_061.jpg","./bilderquiz/iq_062.jpg","./bilderquiz/iq_063.jpg","./bilderquiz/iq_064.jpg","./bilderquiz/iq_065.jpg","./bilderquiz/iq_066.jpg","./bilderquiz/iq_067.jpg","./bilderquiz/iq_068.jpg","./bilderquiz/iq_069.jpg","./bilderquiz/iq_070.jpg","./bilderquiz/iq_071.jpg","./bilderquiz/iq_072.jpg","./bilderquiz/iq_073.jpg","./bilderquiz/iq_074.jpg","./bilderquiz/iq_075.jpg","./bilderquiz/iq_076.jpg","./bilderquiz/iq_077.jpg","./bilderquiz/iq_078.jpg","./bilderquiz/iq_079.jpg","./bilderquiz/iq_080.jpg","./bilderquiz/iq_081.jpg","./bilderquiz/iq_082.jpg","./bilderquiz/iq_083.jpg","./bilderquiz/iq_084.jpg","./bilderquiz/iq_085.jpg","./bilderquiz/iq_086.jpg","./bilderquiz/iq_087.jpg","./bilderquiz/iq_088.jpg","./bilderquiz/iq_089.jpg","./bilderquiz/iq_090.jpg","./bilderquiz/iq_091.jpg","./bilderquiz/iq_092.jpg","./bilderquiz/iq_093.jpg","./bilderquiz/iq_094.jpg","./bilderquiz/iq_095.jpg","./bilderquiz/iq_096.jpg","./bilderquiz/iq_097.jpg","./bilderquiz/iq_098.jpg","./bilderquiz/iq_099.jpg","./bilderquiz/iq_100.jpg","./bilderquiz/iq_101.jpg","./bilderquiz/iq_102.jpg","./bilderquiz/iq_103.jpg","./bilderquiz/iq_104.jpg","./bilderquiz/iq_105.jpg","./bilderquiz/iq_106.jpg","./bilderquiz/iq_107.jpg","./bilderquiz/iq_108.jpg"];

self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(CORE);
    // Bilder einzeln cachen: ein einzelner Netzwerkfehler darf die Installation nicht abbrechen.
    await Promise.allSettled(IMAGE_ASSETS.map(async url=>{
      const response=await fetch(url,{cache:'reload'});
      if(response.ok) await cache.put(url,response.clone());
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  const isImageQuiz=url.pathname.includes('/bilderquiz/');
  if(isImageQuiz) {
    // Netzwerk zuerst, damit neue/ersetzte Bilder sofort sichtbar werden; offline aus Cache.
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      try {
        const fresh=await fetch(event.request,{cache:'no-store'});
        if(fresh.ok) await cache.put(event.request,fresh.clone());
        return fresh;
      } catch(err) {
        return (await cache.match(event.request)) || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached) return cached;
    try {
      const response=await fetch(event.request);
      if(response.ok) {
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone());
      }
      return response;
    } catch(err) {
      return cached || Response.error();
    }
  })());
});
