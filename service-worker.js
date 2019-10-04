const CACHE_NAME = 'CODE_CLUB_PH';
const {INSTALL, FETCH} = {
    INSTALL: 'install',
    FETCH: 'fetch'
}
const  URLS_TO_CACHE = [ '/', './index.html', './learn.html']


self.addEventListener(INSTALL, event => {
    self.skipWaiting()
    event.waitUntil(preLoad());
    console.log('installed latest version')
});
  

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
            if(networkFetchResponse.status !== 404) {
                resolve(networkFetchResponse);
            } 
            else {
               throw new Error('no resource found')
            }
        }
        catch (error) {
            console.error(error)
            reject(error);
        }
    })

)

const addToCache = async (request) => {
    try {
        const cache = await caches.open(CACHE_NAME)
        const networkFetchResponse = await fetch(request)
        
        if (request.method === 'GET' && networkFetchResponse.type === 'basic') {
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

