// Provider-agnostic geocoding service: debounce lives in the UI, this layer adds
// caching, a 1-request-per-second queue, request timeouts and superseding of stale requests.
// Provider specifics come from GEO_CONFIG.
(function () {
    'use strict';

    var cfg = window.GEO_CONFIG;
    var provider = cfg.providers[cfg.provider];
    var CACHE_KEY = 'taxi.geo.cache.v1';
    var CACHE_MAX = 80;

    /* ---------- cache (memory, mirrored to sessionStorage) ---------- */
    var cache = (function () {
        try { return JSON.parse(sessionStorage.getItem(CACHE_KEY)) || {}; } catch (e) { return {}; }
    })();
    function cacheSet(key, value) {
        cache[key] = value;
        var keys = Object.keys(cache);
        if (keys.length > CACHE_MAX) delete cache[keys[0]];
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) { /* storage unavailable */ }
    }

    /* ---------- rate-limited queue ---------- */
    var queue = [];
    var inflight = {};      // key -> AbortController
    var running = false;
    var lastStart = 0;

    function schedule(key, task) {
        // A newer request with the same key makes older ones pointless.
        queue = queue.filter(function (job) {
            if (job.key === key) { job.reject({ aborted: true }); return false; }
            return true;
        });
        if (inflight[key]) inflight[key].abort();

        return new Promise(function (resolve, reject) {
            queue.push({ key: key, task: task, resolve: resolve, reject: reject });
            pump();
        });
    }

    function pump() {
        if (running || !queue.length) return;
        running = true;
        var wait = Math.max(0, lastStart + cfg.minIntervalMs - Date.now());
        setTimeout(function () {
            var job = queue.shift();
            if (!job) { running = false; return; }
            lastStart = Date.now();
            var ctl = new AbortController();
            inflight[job.key] = ctl;
            job.task(ctl).then(job.resolve, job.reject).then(function () {
                if (inflight[job.key] === ctl) delete inflight[job.key];
                running = false;
                pump();
            });
        }, wait);
    }

    function fetchJson(url, ctl) {
        var timedOut = false;
        var timer = setTimeout(function () { timedOut = true; ctl.abort(); }, cfg.requestTimeoutMs);
        return fetch(url, { signal: ctl.signal, headers: { Accept: 'application/json' } })
            .then(function (res) {
                if (!res.ok) throw { network: true, status: res.status };
                return res.json();
            })
            .catch(function (err) {
                if (err && err.name === 'AbortError' && !timedOut) throw { aborted: true };
                throw { network: true };
            })
            .finally(function () { clearTimeout(timer); });
    }

    function lang() { return window.I18N ? window.I18N.lang : 'en'; }

    /* ---------- public API ---------- */
    function search(query, opts) {
        var q = String(query || '').trim().replace(/\s+/g, ' ');
        var key = 's|' + lang() + '|' + q.toLowerCase();
        if (cache[key]) return Promise.resolve(cache[key]);
        return schedule((opts && opts.key) || 'search', function (ctl) {
            return fetchJson(provider.searchUrl(q, lang(), cfg), ctl).then(function (json) {
                var results = provider.parseSearch(json);
                cacheSet(key, results);
                return results;
            });
        });
    }

    function reverse(lat, lng, opts) {
        var key = 'r|' + lang() + '|' + lat.toFixed(5) + ',' + lng.toFixed(5);   // ~1 m precision
        if (key in cache) return Promise.resolve(cache[key]);
        return schedule((opts && opts.key) || 'reverse', function (ctl) {
            return fetchJson(provider.reverseUrl(lat, lng, lang(), cfg), ctl).then(function (json) {
                var result = provider.parseReverse(json);
                if (result) cacheSet(key, result);     // don't cache misses
                return result;
            });
        });
    }

    /* ---------- Leaflet (loaded on demand) ---------- */
    var leafletPromise = null;
    function loadLeaflet() {
        if (window.L && window.L.map) return Promise.resolve(window.L);
        if (leafletPromise) return leafletPromise;
        leafletPromise = new Promise(function (resolve, reject) {
            var css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = cfg.leaflet.css;
            document.head.appendChild(css);
            var js = document.createElement('script');
            js.src = cfg.leaflet.js;
            js.onload = function () { resolve(window.L); };
            js.onerror = function () { leafletPromise = null; reject(new Error('leaflet')); };
            document.head.appendChild(js);
        });
        return leafletPromise;
    }

    window.GEO = { search: search, reverse: reverse, loadLeaflet: loadLeaflet, config: cfg };
})();
