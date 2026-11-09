// Geo provider configuration. This is the ONLY file that knows which map/geocoding
// provider is used. To switch to a paid provider (Mapbox, Google, LocationIQ, ...):
//   1. add an entry to `providers` below (build the two URLs, normalise the two responses),
//   2. change `provider`, and update `tiles` if the tile source changes.
// Nothing else in the site needs to change.
//
// Normalised shapes:  search  -> [{ label, lat, lng }]     reverse -> { label, lat, lng } | null
window.GEO_CONFIG = (function () {
    'use strict';

    // Bias results towards Kosovo (left, top, right, bottom). Not a hard limit (bounded=0).
    var KOSOVO_VIEWBOX = '19.95,43.30,21.85,41.80';

    function qs(params) {
        return Object.keys(params).map(function (k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
        }).join('&');
    }

    // Build a short, readable label from a Nominatim result.
    function nominatimLabel(item) {
        var a = item.address || {};
        var street = a.road ? a.road + (a.house_number ? ' ' + a.house_number : '') : '';
        var primary = item.name && item.name !== a.road ? item.name : street;
        var area = a.neighbourhood || a.suburb || a.quarter || '';
        var city = a.city || a.town || a.village || a.municipality || a.county || '';
        var parts = [];
        [primary, street, area, city].forEach(function (p) {
            if (p && parts.indexOf(p) === -1) parts.push(p);
        });
        if (!parts.length && item.display_name) parts = item.display_name.split(',').slice(0, 3);
        return parts.map(function (p) { return p.trim(); }).join(', ');
    }

    function nominatimItem(item) {
        return { label: nominatimLabel(item), lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
    }

    return {
        provider: 'nominatim',

        // Behaviour
        debounceMs: 500,          // wait after typing stops
        minIntervalMs: 1000,      // at most one geocoding request per second (Nominatim usage policy)
        minChars: 3,
        resultLimit: 5,
        requestTimeoutMs: 10000,

        // Default map view (Pristina)
        center: [42.6629, 21.1655],
        zoom: 13,

        tiles: {
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
            maxZoom: 19
        },

        leaflet: {
            css: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
            js: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
        },

        providers: {
            nominatim: {
                searchUrl: function (query, lang, cfg) {
                    return 'https://nominatim.openstreetmap.org/search?' + qs({
                        format: 'jsonv2', q: query, limit: cfg.resultLimit, addressdetails: 1,
                        'accept-language': lang, viewbox: KOSOVO_VIEWBOX, bounded: 0
                    });
                },
                reverseUrl: function (lat, lng, lang) {
                    return 'https://nominatim.openstreetmap.org/reverse?' + qs({
                        format: 'jsonv2', lat: lat, lon: lng, zoom: 18, addressdetails: 1, 'accept-language': lang
                    });
                },
                parseSearch: function (json) {
                    return (Array.isArray(json) ? json : []).map(nominatimItem).filter(function (r) {
                        return r.label && isFinite(r.lat) && isFinite(r.lng);
                    });
                },
                parseReverse: function (json) {
                    if (!json || json.error) return null;
                    var r = nominatimItem(json);
                    return r.label && isFinite(r.lat) && isFinite(r.lng) ? r : null;
                }
            }
        }
    };
})();
