const CACHE_NAME = 'CODE_CLUB_PH';
const {INSTALL, FETCH} = {
    INSTALL: 'install',
    FETCH: 'fetch'
}
const  URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/learn.html',
    '/index.html?homescreen=1',
    '/?homescreen=1',
    '/src/dist/custom.css',
    '/src/images/assets/dsclogo.png',
    '/src/images/assets/community.svg',
    '/src/images/assets/technologies/android.svg',
    '/src/images/assets/technologies/web.svg',
    '/src/images/assets/technologies/cloud.png',
    '/src/images/assets/technologies/mi.png',
    '/src/images/assets/team/debbie.jpeg',
    '/src/images/assets/team/ray_erica.jpeg',
    '/src/images/assets/team/benjamin.jpg',
    '/src/images/assets/team/obinna.jpeg',
    '/src/images/assets/team/kelvin_gobo.jpeg',
    'src/images/assets/team/vinebo_derek.jpeg',
    'src/dist/App.bundle.js',
    '/service-worker.js',
    '/manifest.json',
]

const preLoad = async () => {
    console.log("Installing web app");
    try {
        const cache = await caches.open(CACHE_NAME)
        const cachedUrls = cache.addAll(URLS_TO_CACHE);
        return cachedUrls
    }
    catch (error) {
        console.error(error)
    }
};
  
self.addEventListener(FETCH, event => {
    event.respondWith(makeNetWorkRequest(event.request).catch(() => {
        return returnFromCache(event.request);
    }));
    event.waitUntil(addToCache(event.request));
});
  
const makeNetWorkRequest = (request) => (
    new Promise( async (resolve, reject) => {
        try {
            const networkFetchResponse = await fetch(request)
            console.log("fetch completed: ",request, networkFetchResponse)
            if(networkFetchResponse.status !== 404) {
                resolve(networkFetchResponse);
            } 
            else {
               throw new Error('no resource found')
            }
        }
        catch (error) {
            console.log(error)
            reject(error);
        }
    })

)

const addToCache = async (request) => {
    try {
        const cache = await caches.open(CACHE_NAME)
        const networkFetchResponse = await fetch(request)
        
        if (request.method === 'GET' && networkFetchResponse.type === 'basic') {
            console.debug("updated cached page: " + request.url, networkFetchResponse);
            return cache.put(request, networkFetchResponse.clone());
        }
    }
    catch (error) {
        console.error(error)
    }
}
    

const returnFromCache = async (request) => {
    try {
        const cache = await caches.open(CACHE_NAME)
        const cacheItemMatchingNetworkRequest = await cache.match(request)
        if(!cacheItemMatchingNetworkRequest || cacheItemMatchingNetworkRequest.status == 404) {
            console.log(cacheItemMatchingNetworkRequest)
            return cache.match("offline.html");
        } 
        else {
            return cacheItemMatchingNetworkRequest;
        }
    }   
    catch (error) {
        console.error(error)
    }
};


self.addEventListener(INSTALL, event => {
    self.skipWaiting()
    event.waitUntil(preLoad());
    console.log('installed latest version')
});
  