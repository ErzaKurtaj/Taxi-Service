// Language switch (English / Albanian). Loaded before main.js on every page.
// Markup hooks: data-i18n, data-i18n-html, data-i18n-placeholder, data-i18n-aria, data-i18n-alt.
(function () {
    'use strict';

    var STORAGE_KEY = 'taxi.lang';
    var LANGS = ['en', 'sq'];

    var dict = {
        en: {
            'brand': 'Taxi Services',

            'loc.use': 'Use my location', 'loc.map': 'Choose on map',
            'loc.finding': 'Finding your location…', 'loc.addr': 'Looking up the address…',
            'loc.found': 'Location found. You can edit the address if needed.',
            'loc.err.denied': "Location access is blocked. Allow it in your browser's site settings (lock icon next to the address), or type your address / choose it on the map.",
            'loc.err.file': 'Location does not work when the page is opened as a file. Open the site from http://localhost or an https:// address.',
            'loc.err.unavailable': 'Your location is unavailable right now. Please type your address or choose it on the map.',
            'loc.err.timeout': 'Finding your location took too long. Please try again, or type your address.',
            'loc.err.unsupported': 'Your browser does not support location. Please type your address or choose it on the map.',
            'loc.err.insecure': 'Location needs a secure (HTTPS) connection. Please type your address or choose it on the map.',
            'loc.err.search': 'Address suggestions are unavailable right now. You can still choose it on the map.',
            'loc.err.pick': 'Please pick an address from the suggestions, use your location, or choose it on the map.',
            'loc.noresults': 'No results found. Try another spelling or choose it on the map.',
            'loc.pinned': 'Pinned location', 'loc.sugg': 'Address suggestions',
            'loc.needboth': 'Choose a pickup and a destination to continue.',
            'md.title.pickup': 'Choose pickup location', 'md.title.destination': 'Choose destination',
            'md.close': 'Close map', 'md.close.toast': 'Dismiss', 'md.recenter': 'Show my location',
            'md.loc.denied': "Location access is blocked. Allow it in your browser's site settings (lock icon next to the address), then tap the crosshair button. Or tap the map to choose a spot.",
            'md.loc.fail': "Couldn't get your location. Tap the map to choose a spot.",
            'md.hint': 'Tap the map to drop a pin, then drag it to adjust.',
            'md.hint.kb': 'Keyboard: move the map with the arrow keys and press Enter to drop the pin at the center.',
            'md.nopin': 'No location selected yet',
            'md.confirm.pickup': 'Confirm pickup', 'md.confirm.destination': 'Confirm destination',
            'md.fail': 'The map could not be loaded. Please type your address instead.',
            'book.est.label': 'Estimated fare', 'book.est.tbc': 'Confirmed by your driver',
            'skip': 'Skip to content',
            'nav.home': 'Home', 'nav.book': 'Book Taxi', 'nav.contact': 'Contact', 'nav.cta': 'Book now',
            'nav.toggle': 'Toggle menu', 'nav.lang': 'Language',

            'home.title': 'Taxi Services',
            'home.desc': 'Book a safe, comfortable taxi across the city in under a minute. City rides, airport transfers and group travel, available 24/7.',
            'hero.eyebrow': 'Available 24/7',
            'hero.h1': 'Your ride is <em>one tap</em> away.',
            'hero.lead': 'Reliable, comfortable taxi service across the city, with professional drivers and clear pricing. Solo, with friends, or with the whole group.',
            'hero.cta1': 'Book a taxi', 'hero.cta2': 'See our fleet',
            'badge.1': 'Licensed drivers', 'badge.2': 'No hidden fees', 'badge.3': 'Always on time',
            'qb.title': 'Where to?', 'qb.sub': "Enter your trip and pick the rest on the next step.",
            'qb.pickup': 'Pickup', 'qb.pickup.ph': 'Pickup location',
            'qb.dest': 'Destination', 'qb.dest.ph': 'Where are you going?', 'qb.continue': 'Continue',
            'stat.1': 'Every day of the year', 'stat.2': 'Average pickup time', 'stat.3': 'Seats in our largest van', 'stat.4': 'Average driver rating',
            'svc.eyebrow': 'What we do', 'svc.h2': 'A ride for every occasion',
            'svc.lead': 'From a quick hop across town to a late flight, we have you covered.',
            'svc.1.t': 'City rides', 'svc.1.p': 'Get around quickly and comfortably, with a clean car and a driver who knows the shortcuts.',
            'svc.2.t': 'Airport transfers', 'svc.2.p': 'Flight delayed? We keep track. Reliable transfers so you never miss a departure.',
            'svc.3.t': 'Group travel', 'svc.3.p': 'Spacious vans for up to 14 passengers: perfect for families, tours and events.',
            'why.alt': 'Taxi driving through the city',
            'why.eyebrow': 'Why riders choose us', 'why.h2': 'Safe, comfortable, and on your schedule.',
            'why.lead': 'Our fleet suits solo travellers and large groups alike, and every ride is handled by a professional driver.',
            'why.1': '<strong>Professional drivers.</strong> Vetted, experienced and courteous.',
            'why.2': '<strong>Clear pricing.</strong> See an estimate before you confirm.',
            'why.3': '<strong>Clean, modern vehicles.</strong> From compact cars to VIP vans.',
            'how.eyebrow': 'How it works', 'how.h2': 'Booking takes under a minute',
            'how.1.t': 'Enter your trip', 'how.1.p': "Tell us where to pick you up and where you're headed.",
            'how.2.t': 'Choose a vehicle', 'how.2.p': 'Pick the size that fits your group and see your estimated fare.',
            'how.3.t': 'Ride & rate', 'how.3.p': "Your driver arrives in minutes. Rate the trip when you're done.",
            'fleet.eyebrow': 'Our fleet', 'fleet.h2': 'Choose the ride that fits your trip',
            'fleet.lead': 'Clean, comfortable vehicles for every journey, from solo rides to the whole group.',
            'fleet.1.t': 'Standard', 'fleet.1.p': 'Everyday rides across the city.', 'fleet.1.pax': '4 passengers', 'fleet.1.bags': '2 bags',
            'fleet.2.t': 'Comfort', 'fleet.2.p': 'More space and a smoother ride.', 'fleet.2.pax': '4 passengers', 'fleet.2.bags': '4 bags',
            'fleet.3.t': 'Van', 'fleet.3.p': 'Room for groups and luggage.', 'fleet.3.pax': '6 passengers', 'fleet.3.bags': '4 bags',
            'fleet.1.alt': 'Blue Taxi, a white electric SUV', 'fleet.2.alt': 'Radio Taxi, a white SUV with taxi livery', 'fleet.3.alt': 'Golden VIP, a black luxury van',
            'pax.4': 'Up to 4 passengers', 'pax.11': 'Up to 11 passengers', 'pax.14': 'Up to 14 passengers',
            'test.eyebrow': 'Testimonials', 'test.h2': 'Trusted for the journeys that matter',
            'test.1': '“The driver arrived early and made our airport trip completely stress-free.”', 'test.1.n': '— Arta K.',
            'test.2': '“Clean car, friendly service, and the booking could not have been easier.”', 'test.2.n': '— Leon B.',
            'test.3': '“My first choice for business trips around Prishtina. Always professional.”', 'test.3.n': '— Mira H.',
            'cta.h2': 'Ready when you are.', 'cta.p': 'Tell us where you need to go. Your driver will confirm the details.',

            'foot.tag': 'Reliable and comfortable taxi service across the city, 24 hours a day.',
            'foot.explore': 'Explore', 'foot.legal': 'Legal', 'foot.privacy': 'Privacy Policy', 'foot.terms': 'Terms of Service',
            'foot.rights': 'All rights reserved.',

            'book.title': 'Book a Taxi — Taxi Services',
            'book.desc': 'Book your taxi in under a minute. Choose a vehicle and track your trips.',
            'book.h1': 'Book your taxi', 'book.sub': "Tell us where you're going, pick a vehicle and confirm. It takes under a minute.",
            'book.step1': '1. Where to?', 'book.step2': '2. Choose your vehicle',
            'book.note': 'Price and pickup time are confirmed by your driver.',
            'book.ok.t': 'Booking confirmed', 'book.ok.p': 'Your driver will contact you shortly.',
            'book.route': 'Your route', 'book.route.hint': 'Choose a pickup and a destination to see your route.',
            'md.selected': 'Selected location',
            'trips.none': 'No trips yet.', 'trips.cancelled': 'Cancelled', 'trips.on': 'on',
            'trips.rate.cta': 'Rate this trip', 'trips.rated': 'Rated',
            'book.details': 'Trip details',
            'book.pickup': 'Pickup location', 'book.pickup.ph': 'Enter pickup location',
            'book.dest': 'Destination', 'book.dest.ph': 'Enter destination',
            'book.vehicle': 'Choose a vehicle', 'book.confirm': 'Confirm booking',
            'book.map': 'Map', 'book.map.loading': 'Loading map…',
            'book.map.fail': 'The map is unavailable right now. You can still book your taxi.',

            'book.required': 'Please fill this in.',
            'trips.title': 'Your trips', 'trips.booked': 'Booked', 'trips.completed': 'Completed',
            'trips.empty.booked': 'No upcoming trips. Book your first ride above.', 'trips.empty.completed': 'No completed trips yet.',
            'trips.done': 'Mark completed', 'trips.cancel': 'Cancel', 'trips.fare.tbc': 'Fare confirmed by driver',
            'trips.driver': 'Driver', 'trips.rate': 'Rate {driver}', 'trips.star': '{n} of 5',

            'contact.title': 'Contact — Taxi Services',
            'contact.desc': "Get in touch with Taxi Services. We're available 24/7 and reply to messages within 24 hours.",
            'contact.h1': 'Get in touch', 'contact.sub': "Questions, feedback or special requests? We're here around the clock.",
            'contact.avail': "We're always available",
            'contact.hours': 'Working hours', 'contact.hours.p': '24/7, every day of the year, including weekends and holidays.',
            'contact.phone': 'Phone', 'contact.email': 'Email',
            'contact.resp': 'Response time', 'contact.resp.p': 'We reply to every message within 24 hours.',
            'contact.form': 'Send us a message',
            'contact.ok': "Thanks! Your message is ready to send. We'll get back to you within 24 hours.",
            'contact.name': 'Your name', 'contact.mail': 'Your email', 'contact.msg': 'Your message', 'contact.send': 'Send message',
            'err.required': 'This field is required.', 'err.email': 'Please enter a valid email address.',
            'faq.h2': 'Frequently asked questions',
            'faq.1.q': 'How do I use the contact form?', 'faq.1.a': 'Fill in your name, email and message, then click "Send message". We\'ll reply to the email you provide.',
            'faq.2.q': 'How quickly will I get a response?', 'faq.2.a': 'We respond to every message within 24 hours. For urgent trips, it\'s fastest to book directly on the Book Taxi page.',
            'faq.3.q': 'Can I book for a large group?', 'faq.3.a': 'Yes. Our Golden VIP Van seats up to 14 passengers, and the Radio Taxi up to 11.'
        },

        sq: {
            'brand': 'Shërbime Taxi',

            'loc.use': 'Përdor vendndodhjen time', 'loc.map': 'Zgjidh në hartë',
            'loc.finding': 'Po gjejmë vendndodhjen tënde…', 'loc.addr': 'Po kërkojmë adresën…',
            'loc.found': 'Vendndodhja u gjet. Mund ta ndryshosh adresën nëse duhet.',
            'loc.err.denied': 'Qasja te vendndodhja është e bllokuar. Lejoje te cilësimet e faqes në shfletues (ikona e çelësit pranë adresës), ose shkruaje adresën / zgjidhe në hartë.',
            'loc.err.file': 'Vendndodhja nuk funksionon kur faqja hapet si skedar. Hape faqen nga http://localhost ose një adresë https://.',
            'loc.err.unavailable': 'Vendndodhja jote nuk është e disponueshme tani. Shkruaje adresën ose zgjidhe në hartë.',
            'loc.err.timeout': 'Gjetja e vendndodhjes zgjati shumë. Provo përsëri ose shkruaje adresën.',
            'loc.err.unsupported': 'Shfletuesi yt nuk e mbështet vendndodhjen. Shkruaje adresën ose zgjidhe në hartë.',
            'loc.err.insecure': 'Vendndodhja kërkon lidhje të sigurt (HTTPS). Shkruaje adresën ose zgjidhe në hartë.',
            'loc.err.search': 'Sugjerimet e adresave nuk janë të disponueshme tani. Mund ta zgjedhësh prapë në hartë.',
            'loc.err.pick': 'Zgjidh një adresë nga sugjerimet, përdor vendndodhjen tënde ose zgjidhe në hartë.',
            'loc.noresults': 'Nuk u gjet asnjë rezultat. Provo një shkrim tjetër ose zgjidhe në hartë.',
            'loc.pinned': 'Vend i shënuar', 'loc.sugg': 'Sugjerime adresash',
            'loc.needboth': 'Zgjidh marrjen dhe destinacionin për të vazhduar.',
            'md.title.pickup': 'Zgjidh vendin e marrjes', 'md.title.destination': 'Zgjidh destinacionin',
            'md.close': 'Mbyll hartën', 'md.close.toast': 'Mbyll', 'md.recenter': 'Shfaq vendndodhjen time',
            'md.loc.denied': 'Qasja te vendndodhja është e bllokuar. Lejoje te cilësimet e faqes në shfletues (ikona e çelësit pranë adresës), pastaj shtyp butonin e shënjestrës. Ose prek hartën për të zgjedhur një vend.',
            'md.loc.fail': 'Nuk e gjetëm vendndodhjen tënde. Prek hartën për të zgjedhur një vend.',
            'md.hint': 'Prek hartën për të vendosur një shenjë, pastaj zvarrite për ta rregulluar.',
            'md.hint.kb': 'Tastiera: lëviz hartën me shigjetat dhe shtyp Enter për ta vendosur shenjën në qendër.',
            'md.nopin': 'Nuk është zgjedhur ende asnjë vend',
            'md.confirm.pickup': 'Konfirmo marrjen', 'md.confirm.destination': 'Konfirmo destinacionin',
            'md.fail': 'Harta nuk u ngarkua. Shkruaje adresën në vend të saj.',
            'book.est.label': 'Çmimi i vlerësuar', 'book.est.tbc': 'Konfirmohet nga shoferi',
            'skip': 'Kalo te përmbajtja',
            'nav.home': 'Kryefaqja', 'nav.book': 'Rezervo Taksi', 'nav.contact': 'Kontakti', 'nav.cta': 'Rezervo tani',
            'nav.toggle': 'Hap/mbyll menynë', 'nav.lang': 'Gjuha',

            'home.title': 'Shërbime Taxi',
            'home.desc': 'Rezervo një taksi të sigurt dhe të rehatshme në qytet për më pak se një minutë. Udhëtime në qytet, transferta në aeroport dhe udhëtime në grup, 24/7.',
            'hero.eyebrow': 'Në dispozicion 24/7',
            'hero.h1': 'Udhëtimi yt është <em>vetëm një klik</em> larg.',
            'hero.lead': 'Shërbim taksi i besueshëm dhe i rehatshëm në të gjithë qytetin, me shoferë profesionistë dhe çmime të qarta. Vetëm, me miq, ose me të gjithë grupin.',
            'hero.cta1': 'Rezervo një taksi', 'hero.cta2': 'Shiko flotën tonë',
            'badge.1': 'Shoferë të licencuar', 'badge.2': 'Pa tarifa të fshehura', 'badge.3': 'Gjithmonë në kohë',
            'qb.title': 'Për ku?', 'qb.sub': 'Shkruaj udhëtimin dhe zgjidh pjesën tjetër në hapin e radhës.',
            'qb.pickup': 'Marrja', 'qb.pickup.ph': 'Vendi i marrjes',
            'qb.dest': 'Destinacioni', 'qb.dest.ph': 'Ku po shkon?', 'qb.continue': 'Vazhdo',
            'stat.1': 'Çdo ditë të vitit', 'stat.2': 'Koha mesatare e marrjes', 'stat.3': 'Vende në furgonin tonë më të madh', 'stat.4': 'Vlerësimi mesatar i shoferëve',
            'svc.eyebrow': 'Çfarë ofrojmë', 'svc.h2': 'Një udhëtim për çdo rast',
            'svc.lead': 'Nga një udhëtim i shpejtë nëpër qytet te një fluturim i vonë, ne jemi pranë teje.',
            'svc.1.t': 'Udhëtime në qytet', 'svc.1.p': 'Lëvizni shpejt dhe rehat, me makinë të pastër dhe shofer që i njeh shkurtesat.',
            'svc.2.t': 'Transferta në aeroport', 'svc.2.p': 'Fluturimi u vonua? Ne e ndjekim. Transferta të besueshme që të mos humbasësh asnjë nisje.',
            'svc.3.t': 'Udhëtime në grup', 'svc.3.p': 'Furgonë të gjerë deri në 14 pasagjerë: ideale për familje, ture dhe evente.',
            'why.alt': 'Taksi duke udhëtuar nëpër qytet',
            'why.eyebrow': 'Pse na zgjedhin', 'why.h2': 'E sigurt, e rehatshme dhe sipas orarit tënd.',
            'why.lead': 'Flota jonë u përshtatet si udhëtarëve të vetëm ashtu edhe grupeve të mëdha, dhe çdo udhëtim kryhet nga një shofer profesionist.',
            'why.1': '<strong>Shoferë profesionistë.</strong> Të verifikuar, me përvojë dhe të sjellshëm.',
            'why.2': '<strong>Çmime të qarta.</strong> Shiko një vlerësim përpara se të konfirmosh.',
            'why.3': '<strong>Automjete të pastra dhe moderne.</strong> Nga makina kompakte te furgonë VIP.',
            'how.eyebrow': 'Si funksionon', 'how.h2': 'Rezervimi zgjat më pak se një minutë',
            'how.1.t': 'Shkruaj udhëtimin', 'how.1.p': 'Na thuaj ku të marrim dhe ku po shkon.',
            'how.2.t': 'Zgjidh automjetin', 'how.2.p': 'Zgjidh madhësinë që i përshtatet grupit dhe shiko çmimin e vlerësuar.',
            'how.3.t': 'Udhëto dhe vlerëso', 'how.3.p': 'Shoferi mbërrin brenda pak minutash. Vlerëso udhëtimin kur të mbarojë.',
            'fleet.eyebrow': 'Flota jonë', 'fleet.h2': 'Zgjidh automjetin që i përshtatet udhëtimit tënd',
            'fleet.lead': 'Automjete të pastra dhe të rehatshme për çdo udhëtim, nga udhëtimet e vetme te gjithë grupi.',
            'fleet.1.t': 'Standard', 'fleet.1.p': 'Udhëtime të përditshme nëpër qytet.', 'fleet.1.pax': '4 pasagjerë', 'fleet.1.bags': '2 valixhe',
            'fleet.2.t': 'Komfort', 'fleet.2.p': 'Më shumë hapësirë dhe udhëtim më i qetë.', 'fleet.2.pax': '4 pasagjerë', 'fleet.2.bags': '4 valixhe',
            'fleet.3.t': 'Furgon', 'fleet.3.p': 'Vend për grupe dhe bagazh.', 'fleet.3.pax': '6 pasagjerë', 'fleet.3.bags': '4 valixhe',
            'fleet.1.alt': 'Blue Taxi, një SUV elektrik i bardhë', 'fleet.2.alt': 'Radio Taxi, një SUV i bardhë me ngjyrat e taksisë', 'fleet.3.alt': 'Golden VIP, një furgon luksoz i zi',
            'pax.4': 'Deri në 4 pasagjerë', 'pax.11': 'Deri në 11 pasagjerë', 'pax.14': 'Deri në 14 pasagjerë',
            'test.eyebrow': 'Dëshmi', 'test.h2': 'Të besuar për udhëtimet që kanë rëndësi',
            'test.1': '“Shoferi mbërriti herët dhe e bëri udhëtimin tonë për në aeroport krejt pa stres.”', 'test.1.n': '— Arta K.',
            'test.2': '“Makinë e pastër, shërbim miqësor dhe rezervimi nuk mund të ishte më i lehtë.”', 'test.2.n': '— Leon B.',
            'test.3': '“Zgjedhja ime e parë për udhëtime pune nëpër Prishtinë. Gjithmonë profesionist.”', 'test.3.n': '— Mira H.',
            'cta.h2': 'Gati kur të jesh ti.', 'cta.p': 'Na thuaj ku duhet të shkosh. Shoferi yt do t’i konfirmojë detajet.',

            'foot.tag': 'Shërbim taksie i besueshëm dhe i rehatshëm në të gjithë qytetin, 24 orë në ditë.',
            'foot.explore': 'Eksploro', 'foot.legal': 'Ligjore', 'foot.privacy': 'Politika e privatësisë', 'foot.terms': 'Kushtet e shërbimit',
            'foot.rights': 'Të gjitha të drejtat e rezervuara.',

            'book.title': 'Rezervo një taksi — Shërbime Taxi',
            'book.desc': 'Rezervo taksinë për më pak se një minutë. Zgjidh automjetin dhe ndiq udhëtimet e tua.',
            'book.h1': 'Rezervo taksinë', 'book.sub': 'Na thuaj ku po shkon, zgjidh automjetin dhe konfirmo. Zgjat më pak se një minutë.',
            'book.step1': '1. Për ku?', 'book.step2': '2. Zgjidh automjetin',
            'book.note': 'Çmimi dhe ora e marrjes konfirmohen nga shoferi.',
            'book.ok.t': 'Rezervimi u konfirmua', 'book.ok.p': 'Shoferi yt do të të kontaktojë së shpejti.',
            'book.route': 'Itinerari yt', 'book.route.hint': 'Zgjidh marrjen dhe destinacionin për të parë itinerarin.',
            'md.selected': 'Vendi i zgjedhur',
            'trips.none': 'Ende nuk ka udhëtime.', 'trips.cancelled': 'Anuluar', 'trips.on': 'më',
            'trips.rate.cta': 'Vlerëso udhëtimin', 'trips.rated': 'Vlerësuar',
            'book.details': 'Detajet e udhëtimit',
            'book.pickup': 'Vendi i marrjes', 'book.pickup.ph': 'Shkruaj vendin e marrjes',
            'book.dest': 'Destinacioni', 'book.dest.ph': 'Shkruaj destinacionin',
            'book.vehicle': 'Zgjidh automjetin', 'book.confirm': 'Konfirmo rezervimin',
            'book.map': 'Harta', 'book.map.loading': 'Duke ngarkuar hartën…',
            'book.map.fail': 'Harta nuk është e disponueshme tani. Mund ta rezervosh prapë taksinë.',

            'book.required': 'Ju lutem plotësoni këtë fushë.',
            'trips.title': 'Udhëtimet e tua', 'trips.booked': 'Të rezervuara', 'trips.completed': 'Të përfunduara',
            'trips.empty.booked': 'Nuk ka udhëtime të ardhshme. Rezervo udhëtimin e parë më sipër.', 'trips.empty.completed': 'Nuk ka ende udhëtime të përfunduara.',
            'trips.done': 'Shëno si të përfunduar', 'trips.cancel': 'Anulo', 'trips.fare.tbc': 'Çmimi konfirmohet nga shoferi',
            'trips.driver': 'Shoferi', 'trips.rate': 'Vlerëso {driver}', 'trips.star': '{n} nga 5',

            'contact.title': 'Kontakti — Shërbime Taxi',
            'contact.desc': 'Na kontaktoni te Shërbime Taxi. Jemi në dispozicion 24/7 dhe i përgjigjemi mesazheve brenda 24 orësh.',
            'contact.h1': 'Na kontaktoni', 'contact.sub': 'Pyetje, komente ose kërkesa të veçanta? Jemi këtu gjithë ditën e natën.',
            'contact.avail': 'Jemi gjithmonë në dispozicion',
            'contact.hours': 'Orari i punës', 'contact.hours.p': '24/7, çdo ditë të vitit, përfshirë fundjavat dhe festat.',
            'contact.phone': 'Telefoni', 'contact.email': 'Email-i',
            'contact.resp': 'Koha e përgjigjes', 'contact.resp.p': 'U përgjigjemi çdo mesazhi brenda 24 orësh.',
            'contact.form': 'Dërgoni një mesazh',
            'contact.ok': 'Faleminderit! Mesazhi juaj është gati për dërgim. Do t’ju përgjigjemi brenda 24 orësh.',
            'contact.name': 'Emri juaj', 'contact.mail': 'Email-i juaj', 'contact.msg': 'Mesazhi juaj', 'contact.send': 'Dërgo mesazhin',
            'err.required': 'Kjo fushë është e detyrueshme.', 'err.email': 'Ju lutem shkruani një adresë email-i të vlefshme.',
            'faq.h2': 'Pyetjet më të shpeshta',
            'faq.1.q': 'Si e përdor formularin e kontaktit?', 'faq.1.a': 'Plotësoni emrin, email-in dhe mesazhin, pastaj klikoni "Dërgo mesazhin". Do t’i përgjigjemi email-it që jepni.',
            'faq.2.q': 'Sa shpejt do të marr përgjigje?', 'faq.2.a': 'I përgjigjemi çdo mesazhi brenda 24 orësh. Për udhëtime urgjente, është më e shpejtë të rezervoni drejtpërdrejt te faqja Rezervo Taksi.',
            'faq.3.q': 'A mund të rezervoj për një grup të madh?', 'faq.3.a': 'Po. Golden VIP Van ka vend për deri në 14 pasagjerë, ndërsa Radio Taxi për deri në 11.'
        }
    };

    var lang = (function () {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (LANGS.indexOf(saved) > -1) return saved;
        } catch (e) { /* storage unavailable */ }
        return (navigator.language || 'en').toLowerCase().indexOf('sq') === 0 ? 'sq' : 'en';
    })();

    var listeners = [];

    function t(key, vars) {
        var s = (dict[lang] && dict[lang][key]) || dict.en[key] || key;
        if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
        return s;
    }

    function apply() {
        document.documentElement.lang = lang;
        var root = document;
        root.querySelectorAll('[data-i18n]').forEach(function (n) { n.textContent = t(n.getAttribute('data-i18n')); });
        root.querySelectorAll('[data-i18n-html]').forEach(function (n) { n.innerHTML = t(n.getAttribute('data-i18n-html')); });
        root.querySelectorAll('[data-i18n-placeholder]').forEach(function (n) { n.setAttribute('placeholder', t(n.getAttribute('data-i18n-placeholder'))); });
        root.querySelectorAll('[data-i18n-aria]').forEach(function (n) { n.setAttribute('aria-label', t(n.getAttribute('data-i18n-aria'))); });
        root.querySelectorAll('[data-i18n-alt]').forEach(function (n) { n.setAttribute('alt', t(n.getAttribute('data-i18n-alt'))); });

        var page = document.body.getAttribute('data-page');
        if (page) {
            document.title = t(page + '.title');
            var meta = document.querySelector('meta[name="description"]');
            if (meta) meta.setAttribute('content', t(page + '.desc'));
        }
        document.querySelectorAll('.lang-switch button').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
        });
        listeners.forEach(function (fn) { fn(lang); });
    }

    function setLang(next) {
        if (LANGS.indexOf(next) < 0 || next === lang) return;
        lang = next;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
        apply();
    }

    window.I18N = {
        t: t,
        apply: apply,
        get lang() { return lang; },
        onChange: function (fn) { listeners.push(fn); }
    };

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.lang-switch button').forEach(function (b) {
            b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
        });
        apply();
    });
})();
