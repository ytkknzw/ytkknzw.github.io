var isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]'     ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

if ('serviceWorker' in navigator &&
    (window.location.protocol === 'https:' || isLocalhost)
) {
    navigator.serviceWorker.register('service-worker.js')
        .then(function (registration) {
            if (typeof registration.update == 'function') {
                registration.update();
            }
        })
        .catch(function (error) {
        });
}
