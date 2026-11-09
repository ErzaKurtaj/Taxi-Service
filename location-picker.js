// Location fields: typed address with suggestions, "Use my location" (pickup) and
// "Choose on map" (full-screen on mobile). Markup hook: <div class="field loc-field" data-loc="pickup|destination" [data-locate]>
// containing a label, an .input-wrap with an input.input, and an optional .field-error.
(function () {
    'use strict';

    var cfg = window.GEO_CONFIG;
    var t = window.I18N.t;
    var fields = {};

    /* ---------- tiny helpers ---------- */
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
    function i18nText(tag, key, cls) {
        return el(tag, { 'class': cls || '', 'data-i18n': key, text: t(key) });
    }
    function coordsLabel(lat, lng) { return t('loc.pinned') + ' (' + lat.toFixed(5) + ', ' + lng.toFixed(5) + ')'; }

    /* ---------- geolocation helpers ---------- */
    // Reasons location can't work at all, checked before asking. Returns an i18n key or null.
    function locationBlocker() {
        if (!('geolocation' in navigator)) return 'loc.err.unsupported';
        if (location.protocol === 'file:') return 'loc.err.file';
        if (window.isSecureContext === false) return 'loc.err.insecure';
        return null;
    }

    // One position. Tries a precise fix first; if the device can't give one (typical for laptops
    // without GPS) it falls back to a coarse Wi-Fi/network fix instead of failing.
    function getOnce(onFix, onError) {
        navigator.geolocation.getCurrentPosition(onFix, function (err) {
            if (err.code === 1) { onError(err); return; }
            navigator.geolocation.getCurrentPosition(onFix, onError, { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 });
        }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
    }

    // Live position: a quick coarse fix first so something shows fast, then GPS refines it.
    // onFix can run several times (each more accurate). Returns a stop() function.
    function watchPosition(onFix, onError) {
        var watchId = null, timer = null, gotFix = false, errored = false;
        function stop() {
            if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
            clearTimeout(timer);
        }
        function fix(pos) {
            gotFix = true;
            onFix(pos);
            if (pos.coords.accuracy <= 25) stop();
        }
        function fail(err) {
            if (gotFix || errored) return;
            errored = true;
            stop();
            onError(err);
        }
        navigator.geolocation.getCurrentPosition(fix, function (err) { if (err.code === 1) fail(err); },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
        watchId = navigator.geolocation.watchPosition(fix, fail, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
        timer = setTimeout(function () { if (!gotFix) fail({ code: 3 }); else stop(); }, 25000);
        return stop;
    }

    function pinIcon(kind) {
        var glyph = kind === 'pickup' ? 'circle-dot' : 'location-dot';
        return L.divIcon({
            className: '',
            html: '<span class="map-pin map-pin--' + kind + '"><i class="fas fa-' + glyph + '" aria-hidden="true"></i></span>',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
    }

    /* ======================================================================
       Field
       ====================================================================== */
    function createField(root) {
        var kind = root.getAttribute('data-loc');
        var input = root.querySelector('input');
        var wrap = root.querySelector('.input-wrap, .input-shell');
        var errorSlot = root.querySelector('.field-error');
        var listId = input.id + '-suggestions';

        var coords = null;
        var results = [];
        var active = -1;
        var seq = 0;
        var timer = null;
        var locating = false;

        function insert(node) { errorSlot ? root.insertBefore(node, errorSlot) : root.appendChild(node); }

        // hidden coordinates travel with the form (GET params / FormData)
        var latEl = el('input', { type: 'hidden', name: kind + '_lat' });
        var lngEl = el('input', { type: 'hidden', name: kind + '_lng' });
        root.appendChild(latEl);
        root.appendChild(lngEl);

        // combobox wiring
        var list = el('ul', { 'class': 'suggestions', id: listId, role: 'listbox', hidden: '', 'data-i18n-aria': 'loc.sugg', 'aria-label': t('loc.sugg') });
        wrap.appendChild(list);
        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('aria-expanded', 'false');
        input.setAttribute('aria-controls', listId);
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('spellcheck', 'false');

        // action chips
        var actions = el('div', { 'class': 'loc-actions' });
        var locateBtn = null, locateIcon = null, locateLabel = null;
        if (root.hasAttribute('data-locate')) {
            locateIcon = icon('fas fa-crosshairs');
            locateLabel = i18nText('span', 'loc.use');
            locateBtn = el('button', { type: 'button', 'class': 'chip' }, [locateIcon, locateLabel]);
            locateBtn.addEventListener('click', locate);
            actions.appendChild(locateBtn);
        }
        var mapBtn = el('button', { type: 'button', 'class': 'chip' }, [icon('fas fa-map-location-dot'), i18nText('span', 'loc.map')]);
        mapBtn.addEventListener('click', function () { MapPicker.open(api); });
        actions.appendChild(mapBtn);
        insert(actions);

        var status = el('p', { 'class': 'loc-status', role: 'status', 'aria-live': 'polite' });
        insert(status);

        /* ----- status / errors ----- */
        function setStatus(key, isError) {
            status.className = 'loc-status' + (isError ? ' is-error' : '');
            if (key) { status.setAttribute('data-i18n', key); status.textContent = t(key); }
            else { status.removeAttribute('data-i18n'); status.textContent = ''; }
        }
        function clearError() {
            if (!errorSlot) return;
            errorSlot.removeAttribute('data-i18n');
            errorSlot.textContent = '';
            input.removeAttribute('aria-invalid');
        }

        /* ----- value ----- */
        function emit() {
            root.dispatchEvent(new CustomEvent('locationchange', { bubbles: true, detail: { kind: kind, value: get() } }));
        }
        function get() {
            return coords ? { address: input.value.trim(), lat: coords.lat, lng: coords.lng } : null;
        }
        function set(loc) {
            input.value = loc.address;
            coords = { lat: loc.lat, lng: loc.lng };
            latEl.value = loc.lat.toFixed(6);
            lngEl.value = loc.lng.toFixed(6);
            seq++;                         // drop any in-flight suggestion search
            wrap.classList.remove('is-loading');
            closeList();
            clearError();
            emit();
        }
        function clearCoords() {
            if (!coords) return;
            coords = null;
            latEl.value = '';
            lngEl.value = '';
            emit();
        }
        function clear() {
            input.value = '';
            seq++;
            wrap.classList.remove('is-loading');
            closeList();
            setStatus(null);
            clearError();
            clearCoords();
        }
        function validate() {
            if (coords) return true;
            if (errorSlot) {
                errorSlot.setAttribute('data-i18n', 'loc.err.pick');
                errorSlot.textContent = t('loc.err.pick');
            }
            input.setAttribute('aria-invalid', 'true');
            return false;
        }

        /* ----- suggestions ----- */
        function openList() { list.hidden = false; input.setAttribute('aria-expanded', 'true'); }
        function closeList() {
            list.hidden = true;
            list.textContent = '';
            results = [];
            active = -1;
            input.setAttribute('aria-expanded', 'false');
            input.removeAttribute('aria-activedescendant');
        }
        function setActive(i) {
            var items = list.children;
            if (active > -1 && items[active]) items[active].classList.remove('is-active');
            active = i;
            if (i > -1 && items[i]) {
                items[i].classList.add('is-active');
                items[i].scrollIntoView({ block: 'nearest' });
                input.setAttribute('aria-activedescendant', items[i].id);
            } else {
                input.removeAttribute('aria-activedescendant');
            }
        }
        function renderResults(res) {
            list.textContent = '';
            results = res;
            res.forEach(function (r, i) {
                var li = el('li', { id: listId + '-' + i, role: 'option' }, [icon('fas fa-location-dot'), el('span', { text: r.label })]);
                li.addEventListener('mousedown', function (e) { e.preventDefault(); });   // keep input focus
                li.addEventListener('click', function () { choose(i); });
                list.appendChild(li);
            });
            active = -1;
            openList();
        }
        function choose(i) {
            var r = results[i];
            if (!r) return;
            set({ address: r.label, lat: r.lat, lng: r.lng });
            setStatus(null);
        }
        function runSearch(q) {
            var mine = ++seq;
            wrap.classList.add('is-loading');
            GEO.search(q, { key: 'search:' + input.id }).then(function (res) {
                if (mine !== seq) return;
                wrap.classList.remove('is-loading');
                if (!res.length) { closeList(); setStatus('loc.noresults', false); return; }
                setStatus(null);
                renderResults(res);
            }).catch(function (err) {
                if (err && err.aborted) return;
                if (mine !== seq) return;
                wrap.classList.remove('is-loading');
                closeList();
                setStatus('loc.err.search', true);
            });
        }

        input.addEventListener('input', function () {
            clearCoords();
            clearError();
            setStatus(null);
            clearTimeout(timer);
            var q = input.value.trim();
            if (q.length < cfg.minChars) {
                seq++;
                wrap.classList.remove('is-loading');
                closeList();
                return;
            }
            timer = setTimeout(function () { runSearch(q); }, cfg.debounceMs);
        });
        input.addEventListener('keydown', function (e) {
            var open = !list.hidden && results.length;
            if (e.key === 'ArrowDown' && open) { e.preventDefault(); setActive((active + 1) % results.length); }
            else if (e.key === 'ArrowUp' && open) { e.preventDefault(); setActive(active <= 0 ? results.length - 1 : active - 1); }
            else if (e.key === 'Enter' && open) { e.preventDefault(); choose(active > -1 ? active : 0); }
            else if (e.key === 'Escape' && !list.hidden) { e.preventDefault(); closeList(); }
        });
        input.addEventListener('blur', function () { closeList(); });

        /* ----- Use my location ----- */
        function setLocating(on, key) {
            locating = on;
            locateBtn.classList.toggle('is-busy', on);
            locateBtn.setAttribute('aria-busy', String(on));
            locateIcon.className = on ? 'fas fa-spinner fa-spin' : 'fas fa-crosshairs';
            var k = on ? key : 'loc.use';
            locateLabel.setAttribute('data-i18n', k);
            locateLabel.textContent = t(k);
        }
        function locate() {
            if (locating) return;
            setStatus(null);
            var blocked = locationBlocker();
            if (blocked) { setStatus(blocked, true); return; }

            setLocating(true, 'loc.finding');
            // Permission is requested here, only because the user clicked.
            getOnce(function (pos) {
                var lat = pos.coords.latitude, lng = pos.coords.longitude;
                setLocating(true, 'loc.addr');
                GEO.reverse(lat, lng, { key: 'reverse:' + input.id }).then(function (r) { return r; }, function () { return null; })
                    .then(function (r) {
                        setLocating(false);
                        // If the address lookup fails we still keep the coordinates.
                        set({ address: r ? r.label : coordsLabel(lat, lng), lat: lat, lng: lng });
                        setStatus('loc.found', false);
                    });
            }, function (err) {
                setLocating(false);
                var key = err.code === 1 ? 'loc.err.denied' : err.code === 3 ? 'loc.err.timeout' : 'loc.err.unavailable';
                setStatus(key, true);
            });
        }

        var api = { kind: kind, root: root, input: input, get: get, set: set, clear: clear, validate: validate };
        return api;
    }

    /* ======================================================================
       Map picker dialog (full-screen on mobile)
       ====================================================================== */
    var MapPicker = (function () {
        var dlg, mapEl, overlay, titleEl, addrText, confirmBtn, confirmLabel, hintEl, noteEl, recenterBtn;
        var map = null, marker = null, otherMarker = null, meMarker = null, meCircle = null, locToken = 0, stopLoc = null;
        var target = null, tentative = null, seq = 0;

        function build() {
            if (dlg) return;
            titleEl = el('h2', { id: 'md-title' });
            var closeBtn = el('button', { type: 'button', 'class': 'md-close', 'data-i18n-aria': 'md.close', 'aria-label': t('md.close') }, [icon('fas fa-xmark')]);
            closeBtn.addEventListener('click', function () { dlg.close(); });
            var head = el('header', { 'class': 'md-head' }, [titleEl, closeBtn]);

            mapEl = el('div', { id: 'md-map', 'data-i18n-aria': 'book.map', 'aria-label': t('book.map') });
            overlay = el('div', { 'class': 'md-overlay' }, [i18nText('p', 'book.map.loading')]);
            recenterBtn = el('button', { type: 'button', 'class': 'md-recenter', 'data-i18n-aria': 'md.recenter', 'aria-label': t('md.recenter') }, [icon('fas fa-crosshairs')]);
            recenterBtn.addEventListener('click', function () { locateMe(true); });
            var body = el('div', { 'class': 'md-body' }, [mapEl, recenterBtn, overlay]);

            hintEl = el('p', { 'class': 'md-hint' }, [i18nText('span', 'md.hint'), document.createTextNode(' '), i18nText('span', 'md.hint.kb', 'md-hint-kb')]);
            addrText = el('span', { 'data-i18n': 'md.nopin', text: t('md.nopin') });
            var addr = el('p', { 'class': 'md-address', 'aria-live': 'polite' }, [icon('fas fa-location-dot'), addrText]);
            confirmLabel = el('span');
            confirmBtn = el('button', { type: 'button', 'class': 'btn btn--primary btn--block md-confirm', 'aria-disabled': 'true' }, [icon('fas fa-check'), confirmLabel]);
            confirmBtn.addEventListener('click', confirm);
            noteEl = el('p', { 'class': 'md-note', role: 'status', 'aria-live': 'polite' });
            var foot = el('footer', { 'class': 'md-foot' }, [noteEl, hintEl, addr, confirmBtn]);

            dlg = el('dialog', { 'class': 'map-dialog', 'aria-labelledby': 'md-title' }, [head, body, foot]);
            dlg.addEventListener('close', function () {
                document.documentElement.classList.remove('modal-open');
                seq++;
                locToken++;
                if (stopLoc) { stopLoc(); stopLoc = null; }
            });
            document.body.appendChild(dlg);
        }

        function setAddr(key, text) {
            if (key) { addrText.setAttribute('data-i18n', key); addrText.textContent = t(key); }
            else { addrText.removeAttribute('data-i18n'); addrText.textContent = text; }
        }
        function setNote(key, isError) {
            noteEl.className = 'md-note' + (isError ? ' is-error' : '');
            if (key) { noteEl.setAttribute('data-i18n', key); noteEl.textContent = t(key); }
            else { noteEl.removeAttribute('data-i18n'); noteEl.textContent = ''; }
        }
        function setConfirmable(ok) { confirmBtn.setAttribute('aria-disabled', String(!ok)); }

        function open(field) {
            build();
            target = field;
            tentative = null;
            setConfirmable(false);
            setAddr('md.nopin');
            titleEl.setAttribute('data-i18n', 'md.title.' + field.kind);
            titleEl.textContent = t('md.title.' + field.kind);
            confirmLabel.setAttribute('data-i18n', 'md.confirm.' + field.kind);
            confirmLabel.textContent = t('md.confirm.' + field.kind);
            overlay.hidden = false;
            overlay.innerHTML = '';
            overlay.appendChild(i18nText('p', 'book.map.loading'));
            hintEl.hidden = false;
            setNote(null);

            document.documentElement.classList.add('modal-open');
            if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');

            GEO.loadLeaflet().then(function () { if (dlg.open) init(); }).catch(function () {
                overlay.innerHTML = '';
                overlay.appendChild(i18nText('p', 'md.fail'));
                hintEl.hidden = true;
            });
        }

        function init() {
            overlay.hidden = true;
            if (!map) {
                map = L.map(mapEl, { zoomControl: true });
                L.tileLayer(cfg.tiles.url, { attribution: cfg.tiles.attribution, maxZoom: cfg.tiles.maxZoom }).addTo(map);
                map.on('click', function (e) { place(e.latlng); });
                // Keyboard users: arrow keys move the map, Enter drops the pin at the centre.
                mapEl.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' && e.target === mapEl) { e.preventDefault(); place(map.getCenter()); }
                });
            }
            if (marker) { map.removeLayer(marker); marker = null; }
            if (otherMarker) { map.removeLayer(otherMarker); otherMarker = null; }
            if (meMarker) { map.removeLayer(meMarker); meMarker = null; }
            if (meCircle) { map.removeLayer(meCircle); meCircle = null; }

            var otherKind = target.kind === 'pickup' ? 'destination' : 'pickup';
            var other = fields[otherKind] && fields[otherKind].get();
            var own = target.get();

            if (other) {
                otherMarker = L.marker([other.lat, other.lng], { icon: pinIcon(otherKind), interactive: false, keyboard: false, title: t(otherKind === 'pickup' ? 'qb.pickup' : 'qb.dest') }).addTo(map);
            }
            if (own) {
                map.setView([own.lat, own.lng], 16);
                place({ lat: own.lat, lng: own.lng }, own.address);
            } else if (other) {
                map.setView([other.lat, other.lng], 15);
            } else {
                map.setView(cfg.center, cfg.zoom);
            }
            setTimeout(function () { map.invalidateSize(); mapEl.focus({ preventScroll: true }); }, 50);

            // Opening the map is a tap, so ask for the position now and centre on it.
            // (If this field already has a location we keep showing it, but still mark where the user is.)
            locateMe(!own);
        }

        // Show the user's real position (dot + accuracy circle). `center` moves the view there.
        function locateMe(center) {
            if (stopLoc) { stopLoc(); stopLoc = null; }
            var blocked = locationBlocker();
            if (blocked) { setNote(blocked === 'loc.err.file' || blocked === 'loc.err.insecure' ? blocked : 'md.loc.fail', true); return; }
            var mine = ++locToken;
            var moved = false;                      // user panned/zoomed by hand: stop auto-centring
            map.once('dragstart zoomstart', function () { moved = true; });
            setNote('loc.finding');
            recenterBtn.classList.add('is-busy');
            stopLoc = watchPosition(function (pos) {
                if (mine !== locToken || !dlg.open || !map) return;
                recenterBtn.classList.remove('is-busy');
                setNote(null);
                var ll = [pos.coords.latitude, pos.coords.longitude];
                var acc = pos.coords.accuracy || 0;
                if (!meMarker) {
                    meMarker = L.marker(ll, { icon: L.divIcon({ className: '', html: '<span class="me-dot"></span>', iconSize: [22, 22], iconAnchor: [11, 11] }), interactive: false, keyboard: false, zIndexOffset: -500 }).addTo(map);
                    meCircle = L.circle(ll, { radius: acc, weight: 1, color: '#2f6fed', fillColor: '#2f6fed', fillOpacity: 0.12, interactive: false }).addTo(map);
                } else {
                    meMarker.setLatLng(ll);
                    meCircle.setLatLng(ll).setRadius(acc);
                }
                // Centre unless the user already dropped a pin or moved the map (a recenter tap always centres).
                if ((center || !marker) && (center || !moved)) {
                    if (acc > 60) map.fitBounds(meCircle.getBounds(), { maxZoom: 17, padding: [20, 20] });
                    else map.setView(ll, 17);
                }
                center = false;                     // later, more accurate fixes only refine the view
            }, function (err) {
                if (mine !== locToken) return;
                recenterBtn.classList.remove('is-busy');
                setNote(err.code === 1 ? 'md.loc.denied' : 'md.loc.fail', true);
            });
        }

        function place(ll, knownAddress) {
            ll = ll.wrap ? ll.wrap() : ll;
            if (!marker) {
                marker = L.marker(ll, { draggable: true, icon: pinIcon(target.kind), title: t(target.kind === 'pickup' ? 'qb.pickup' : 'qb.dest') }).addTo(map);
                marker.on('dragend', function () { lookup(marker.getLatLng().wrap()); });
            } else {
                marker.setLatLng(ll);
            }
            if (knownAddress) {
                tentative = { address: knownAddress, lat: ll.lat, lng: ll.lng };
                setAddr(null, knownAddress);
                setConfirmable(true);
            } else {
                lookup(ll);
            }
        }

        function lookup(ll) {
            var mine = ++seq;
            tentative = null;
            setConfirmable(false);
            setAddr('loc.addr');
            GEO.reverse(ll.lat, ll.lng, { key: 'reverse:map' }).then(function (r) { return r; }, function () { return null; })
                .then(function (r) {
                    if (mine !== seq) return;
                    var address = r ? r.label : coordsLabel(ll.lat, ll.lng);
                    tentative = { address: address, lat: ll.lat, lng: ll.lng };
                    setAddr(null, address);
                    setConfirmable(true);
                });
        }

        function confirm() {
            if (!tentative) return;
            target.set(tentative);
            var f = target;
            dlg.close();
            f.input.focus();
        }

        return { open: open };
    })();

    /* ---------- public ---------- */
    window.LocationPicker = {
        fields: fields,
        pinIcon: pinIcon,
        init: function (scope) {
            (scope || document).querySelectorAll('.loc-field').forEach(function (root) {
                var f = createField(root);
                fields[f.kind] = f;
            });
            return fields;
        }
    };
})();
