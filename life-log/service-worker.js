var CACHE_NAME  = "my-portfolio-cache-v1";
var urlsToCache = [
    "/",
    "/life-log/img_male3.png"
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(
            function(cache){
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWidth(
        caches.match(event.request)
            .then(function (response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('fetch', function(event) {
    if (isImage(event.request.url)) {
        event.respondWith(
            caches.match(event.request).then(function (response) {
                return response || fetch(event.request);
            })
        );
    }
    else {
        event.respondWith(
            fetch(event.request).catch(function() {
                return caches.match(event.request);
            })
        );
    }
});

function isImage (url) {
    return Boolean(url.match(/(\.png)|(\.jpg)$/));
}
