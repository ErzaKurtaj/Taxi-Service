// Shared behaviour for every page: mobile nav, footer year, scroll reveal, contact form.
(function () {
    'use strict';

    // Mobile navigation toggle
    var toggle = document.querySelector('.nav-toggle');
    var links = document.getElementById('nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', function () {
            var open = links.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(open));
            toggle.querySelector('i').className = open ? 'fas fa-xmark' : 'fas fa-bars';
        });
        links.addEventListener('click', function (e) {
            if (e.target.closest('a')) {
                links.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Footer year
    document.querySelectorAll('[data-year]').forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });

    // Scroll reveal
    // Every content section fades in as it scrolls into view. The first screen (hero / page header) stays visible.
    document.querySelectorAll(
        'main > section:not(.hero):not(.page-head):not(.page-hero), .booking-layout, .contact-layout, .faq, .trips'
    ).forEach(function (el) { el.classList.add('reveal'); });
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-in'); });
    }

    // Home quick-booking form: Continue unlocks once pickup and destination both have coordinates.
    var qb = document.getElementById('quick-book');
    if (qb && window.LocationPicker) {
        var qf = LocationPicker.init(qb);
        var qbBtn = qb.querySelector('[type="submit"]');
        var qbHint = document.getElementById('qb-hint');
        var syncQb = function () {
            var ok = !!(qf.pickup.get() && qf.destination.get());
            qbBtn.setAttribute('aria-disabled', String(!ok));
            qbHint.hidden = ok;
        };
        qb.addEventListener('locationchange', syncQb);
        syncQb();
        qb.addEventListener('submit', function (e) {
            e.preventDefault();
            var p = qf.pickup.validate(), d = qf.destination.validate();
            if (!p || !d) { (p ? qf.destination : qf.pickup).input.focus(); return; }
            var a = qf.pickup.get(), b = qf.destination.get();
            var params = new URLSearchParams({
                pickup: a.address, pickup_lat: a.lat.toFixed(6), pickup_lng: a.lng.toFixed(6),
                destination: b.address, destination_lat: b.lat.toFixed(6), destination_lng: b.lng.toFixed(6)
            });
            location.href = 'order.html?' + params.toString();
        });
    }

    // Contact form validation (front-end only; no backend is connected yet)
    var form = document.getElementById('contact-form');
    if (form) {
        var setError = function (field, key) {
            var slot = form.querySelector('[data-error-for="' + field.id + '"]');
            if (slot) {
                // data-i18n keeps the message translated if the language is switched
                if (key) { slot.setAttribute('data-i18n', key); slot.textContent = I18N.t(key); }
                else { slot.removeAttribute('data-i18n'); slot.textContent = ''; }
            }
            field.setAttribute('aria-invalid', key ? 'true' : 'false');
        };
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var ok = true;
            ['name', 'email', 'message'].forEach(function (id) {
                var f = form.elements[id];
                var v = f.value.trim();
                var msg = '';
                if (!v) msg = 'err.required';
                else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'err.email';
                setError(f, msg);
                if (msg) ok = false;
            });
            var notice = document.getElementById('contact-success');
            if (ok) {
                form.reset();
                notice.classList.add('is-visible');
                notice.focus && notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                notice.classList.remove('is-visible');
                var firstBad = form.querySelector('[aria-invalid="true"]');
                if (firstBad) firstBad.focus();
            }
        });
    }
})();
