// Booking page: location fields, vehicle choice, Leaflet overview map, trip list (localStorage).
(function () {
    'use strict';

    var STORAGE_KEY = 'taxi.trips.v2';
    var t = I18N.t;
    var cfg = GEO.config;

    var form = document.getElementById('booking-form');
    var panel = document.getElementById('panel-trips');
    var confirmBtn = document.getElementById('confirm-btn');
    var hint = document.getElementById('booking-hint');
    var vehicleBtns = document.querySelectorAll('#vehicle-choices > button');

    var trips = load();
    var activeTab = 'booked';
    var fields = LocationPicker.init(form);

    var VEHICLES = { standard: 'fleet.1.t', comfort: 'fleet.2.t', van: 'fleet.3.t' };
    var vehicle = 'standard';

    /* ---------- pricing placeholder ----------
       Fare calculation is intentionally not implemented yet: no prices are invented.
       When pricing exists, compute it here from the two coordinates and the vehicle. */
    function calculateFare(/* pickup, destination, vehicleKey */) { return null; }

    /* ---------- storage ---------- */
    function load() {
        try {
            var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(data) ? data : [];
        } catch (e) { return []; }
    }
    function save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trips)); } catch (e) { /* storage unavailable */ }
    }

    /* ---------- helpers ---------- */
    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (k) {
            if (k === 'class') node.className = attrs[k];
            else if (k === 'text') node.textContent = attrs[k];
            else node.setAttribute(k, attrs[k]);
        });
        (children || []).forEach(function (c) { node.appendChild(c); });
        return node;
    }
    function icon(cls) { return el('i', { 'class': cls, 'aria-hidden': 'true' }); }
    function money(n) { return '€' + n.toFixed(2); }
    // Trips saved earlier may hold a vehicle name instead of a key.
    function vehicleName(v) { return VEHICLES[v] ? t(VEHICLES[v]) : String(v); }
    function addressOf(place) { return place && typeof place === 'object' ? place.address : String(place || ''); }

    /* ---------- vehicle choice ---------- */
    vehicleBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            vehicle = btn.getAttribute('data-vehicle');
            vehicleBtns.forEach(function (b) {
                var on = b === btn;
                b.classList.toggle('selected', on);
                b.setAttribute('aria-pressed', String(on));
                b.querySelector('.choice-check').hidden = !on;
            });
        });
    });

    /* ---------- form state ---------- */
    function syncForm() {
        var ok = !!(fields.pickup.get() && fields.destination.get());
        confirmBtn.setAttribute('aria-disabled', String(!ok));
        hint.hidden = ok;
        syncMap();
    }
    form.addEventListener('locationchange', syncForm);

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var p = fields.pickup.validate(), d = fields.destination.validate();
        if (!p || !d) { (p ? fields.destination : fields.pickup).input.focus(); return; }

        var from = fields.pickup.get(), to = fields.destination.get();
        trips.unshift({
            id: Date.now(),
            pickup: from.address,
            destination: to.address,
            pickupCoords: { lat: from.lat, lng: from.lng },
            destinationCoords: { lat: to.lat, lng: to.lng },
            vehicle: vehicle,
            price: calculateFare(from, to, vehicle),
            driver: trips.length + 1,
            status: 'booked',
            rating: 0,
            createdAt: new Date().toISOString()
        });
        save();
        fields.pickup.clear();
        fields.destination.clear();
        activeTab = 'booked';
        render();
        showToast();
    });

    /* ---------- toast ---------- */
    var toast = null, toastTimer = null;
    function showToast() {
        if (!toast) {
            toast = el('div', { 'class': 'toast', role: 'status', 'aria-live': 'polite' });
            document.body.appendChild(toast);
        }
        toast.textContent = '';
        toast.appendChild(icon('fas fa-circle-check'));
        toast.appendChild(el('div', {}, [
            el('strong', { 'data-i18n': 'book.ok.t', text: t('book.ok.t') }),
            el('p', { 'data-i18n': 'book.ok.p', text: t('book.ok.p') })
        ]));
        var close = el('button', { type: 'button', 'class': 'toast-close', 'data-i18n-aria': 'md.close.toast', 'aria-label': t('md.close.toast') }, [icon('fas fa-xmark')]);
        close.addEventListener('click', hideToast);
        toast.appendChild(close);

        toast.classList.remove('is-visible');
        void toast.offsetWidth;                       // restart the animation if it is shown again
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(hideToast, 5000);
    }
    function hideToast() {
        clearTimeout(toastTimer);
        if (toast) toast.classList.remove('is-visible');
    }

    /* ---------- overview map (Leaflet) ---------- */
    var map = null, markers = {};

    function mapFallback(key) {
        var holder = document.getElementById('map');
        holder.textContent = '';
        holder.appendChild(el('div', { 'class': 'map-fallback' }, [el('div', {}, [icon('fas fa-map-location-dot'), el('p', { 'data-i18n': key, text: t(key) })])]));
    }

    function syncMap() {
        if (!map) return;
        var points = [];
        ['pickup', 'destination'].forEach(function (kind) {
            var v = fields[kind].get();
            if (v) {
                var ll = [v.lat, v.lng];
                if (markers[kind]) markers[kind].setLatLng(ll);
                else markers[kind] = L.marker(ll, { icon: LocationPicker.pinIcon(kind), title: t(kind === 'pickup' ? 'qb.pickup' : 'qb.dest'), keyboard: false }).addTo(map);
                points.push(ll);
            } else if (markers[kind]) {
                map.removeLayer(markers[kind]);
                delete markers[kind];
            }
        });
        if (points.length === 2) map.fitBounds(points, { padding: [60, 60], maxZoom: 16 });
        else if (points.length === 1) map.setView(points[0], 15);
    }

    GEO.loadLeaflet().then(function () {
        var holder = document.getElementById('map');
        holder.textContent = '';
        map = L.map(holder, { zoomControl: true }).setView(cfg.center, cfg.zoom);
        L.tileLayer(cfg.tiles.url, { attribution: cfg.tiles.attribution, maxZoom: cfg.tiles.maxZoom }).addTo(map);
        syncMap();
    }).catch(function () { mapFallback('book.map.fail'); });

    /* ---------- trips ---------- */
    function setStatus(id, status) {
        trips.forEach(function (tr) { if (tr.id === id) tr.status = status; });
        save(); render();
    }
    function remove(id) {
        trips = trips.filter(function (tr) { return tr.id !== id; });
        save(); render();
    }
    function rate(id, n) {
        trips.forEach(function (tr) { if (tr.id === id) tr.rating = n; });
        save(); render();
    }

    function driverLabel(tr) {
        return typeof tr.driver === 'number' ? t('trips.driver') + ' ' + tr.driver : String(tr.driver).replace(/^Driver/, t('trips.driver'));
    }

    function tripNode(tr) {
        var route = el('div', { 'class': 'trip-route' }, [
            el('div', {}, [icon('fas fa-circle-dot'), el('strong', { text: addressOf(tr.pickup) })]),
            el('div', {}, [icon('fas fa-location-dot'), el('strong', { text: addressOf(tr.destination) })])
        ]);
        var meta = el('div', { 'class': 'trip-meta' }, [
            el('span', { text: vehicleName(tr.vehicle) }),
            el('span', { text: driverLabel(tr) }),
            el('span', { text: tr.price != null ? money(tr.price) : t('trips.fare.tbc') }),
            el('span', { text: new Date(tr.createdAt).toLocaleString(I18N.lang === 'sq' ? 'sq-AL' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }) })
        ]);
        var left = el('div', {}, [route, meta]);

        var actions = el('div', { 'class': 'trip-actions' });
        if (tr.status === 'booked') {
            actions.appendChild(el('span', { 'class': 'status status--booked', text: t('trips.booked') }));
            var done = el('button', { 'class': 'btn btn--outline btn--sm', type: 'button', text: t('trips.done') });
            done.addEventListener('click', function () { setStatus(tr.id, 'completed'); });
            var cancel = el('button', { 'class': 'btn btn--sm', type: 'button', text: t('trips.cancel'), style: 'background:var(--sand)' });
            cancel.addEventListener('click', function () { remove(tr.id); });
            actions.appendChild(done);
            actions.appendChild(cancel);
        } else {
            actions.appendChild(el('span', { 'class': 'status status--completed', text: t('trips.completed') }));
            var stars = el('div', { 'class': 'rating-input', role: 'group', 'aria-label': t('trips.rate', { driver: driverLabel(tr) }) });
            for (var n = 5; n >= 1; n--) {
                (function (n) {
                    var b = el('button', {
                        type: 'button', text: '★', 'aria-label': t('trips.star', { n: n }),
                        'class': tr.rating >= n ? 'on' : ''
                    });
                    b.addEventListener('click', function () { rate(tr.id, n); });
                    stars.appendChild(b);
                })(n);
            }
            actions.appendChild(stars);
        }
        return el('li', { 'class': 'trip' }, [left, actions]);
    }

    function render() {
        var counts = { booked: 0, completed: 0 };
        trips.forEach(function (tr) { if (counts[tr.status] !== undefined) counts[tr.status]++; });
        document.getElementById('count-booked').textContent = counts.booked;
        document.getElementById('count-completed').textContent = counts.completed;
        document.querySelectorAll('.tab').forEach(function (tab) {
            tab.setAttribute('aria-selected', String(tab.dataset.tab === activeTab));
        });

        panel.textContent = '';
        var list = trips.filter(function (tr) { return tr.status === activeTab; });
        if (!list.length) {
            panel.appendChild(el('div', { 'class': 'empty' }, [icon('fas fa-taxi'), el('p', { text: t('trips.empty.' + activeTab), style: 'margin:0' })]));
            return;
        }
        var ul = el('ul', { 'class': 'trip-list' });
        list.forEach(function (tr) { ul.appendChild(tripNode(tr)); });
        panel.appendChild(ul);
    }

    document.querySelectorAll('.tab').forEach(function (tab) {
        tab.addEventListener('click', function () { activeTab = tab.dataset.tab; render(); });
    });

    /* ---------- prefill from the home page (addresses + coordinates) ---------- */
    (function prefill() {
        var q = new URLSearchParams(location.search);
        ['pickup', 'destination'].forEach(function (kind) {
            var address = (q.get(kind) || '').trim();
            var lat = parseFloat(q.get(kind + '_lat')), lng = parseFloat(q.get(kind + '_lng'));
            if (!address) return;
            if (isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
                fields[kind].set({ address: address, lat: lat, lng: lng });
            } else {
                fields[kind].input.value = address;     // text only: the user still has to pick a suggestion
            }
        });
    })();

    I18N.onChange(render);
    render();
    syncForm();
})();
