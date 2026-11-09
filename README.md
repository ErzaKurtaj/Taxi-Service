# Taxi Services (Shërbime Taxi)

A static, bilingual (English / Albanian) website for a taxi company. Visitors can read about the service and fleet, book a taxi using addresses or a map, and get in touch. There is no build step and no backend: open it in a browser or serve the folder.

## Features

- **Pages:** Home, Book Taxi, Contact.
- **Language switch (EN | SQ):** every page, including the site name, form messages and the dynamic trip list. The choice is remembered in the browser; first-time visitors with an Albanian browser start in Albanian.
- **Location-aware booking form** (Pickup, Destination, Continue):
  - Type an address and pick from suggestions (biased to Kosovo).
  - **Use my location** (pickup): asks for permission only when clicked, reverse-geocodes to a readable address, stores latitude and longitude.
  - **Choose on map** (pickup and destination): full-screen on mobile. The map centres on your current location, shows the other point, lets you tap to drop a draggable pin, shows the address and confirms with a button.
  - Continue and Confirm booking unlock only when both locations have coordinates. The home page passes addresses and coordinates to the booking page.
- **Booking page:** 1) where to, 2) choose Standard / Comfort / Van, a route map once both locations are set, and a "My trips" list (booked, cancelled, completed with star ratings) saved in `localStorage`.
- **Contact form:** validation and a success message (front-end only, see Known limitations).
- **Accessible and responsive:** mobile-first layout, keyboard-operable suggestions and map, visible focus, ARIA labels, reduced-motion support.

## Run it

Geolocation only works on **HTTPS or `localhost`**, so don't open the files with `file://`. From this folder:

```bash
# any static server works, for example:
python -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000>.

## Project structure

```
index.html          Home (hero + quick booking form, services, fleet, testimonials)
order.html          Book Taxi (location fields, vehicle choice, route map, my trips)
contact.html        Contact (info, form, FAQ)
css/style.css       All styles (design tokens at the top)
images/             Fleet photos and GIFs

i18n.js             Translations (EN + SQ) and the language switch
main.js             Shared: mobile menu, scroll reveal, contact form, home quick-booking form
geo-config.js       Map and geocoding provider settings (the ONLY provider-specific file)
geo.js              Geocoding service: cache, 1 request/second queue, timeouts, Leaflet loader
location-picker.js  Location fields (suggestions, "Use my location") and the map picker dialog
booking.js          Booking page logic: trips, overview map, prefill from the home page
```

## How it works

### Translations
All text lives in `i18n.js` under `en` and `sq`. Markup uses `data-i18n` (text), `data-i18n-html`, `data-i18n-placeholder`, `data-i18n-aria` and `data-i18n-alt`. Code builds dynamic text with `I18N.t('key')`. To add or fix a string, edit it for both languages in that one file. The site name is the `brand` key (English "Taxi Services", Albanian "Shërbime Taxi").

### Maps and geocoding
- Maps use [Leaflet](https://leafletjs.com) with OpenStreetMap tiles, loaded from a CDN only when a map is needed.
- Search and reverse geocoding use [Nominatim](https://nominatim.org). Typing is debounced by 500 ms, results are cached (memory + `sessionStorage`), requests are limited to one per second, and stale requests are cancelled.
- **Switching provider:** everything provider-specific is in `geo-config.js`. Add an entry under `providers` (two URL builders and two response parsers that return `{ label, lat, lng }`), set `provider`, and update `tiles` if needed. No other file changes.

### Booking data
Trips are stored in `localStorage` (`taxi.trips.v2`) with addresses and coordinates. Geocoding cache is in `sessionStorage`.

## Configuration

| What | Where |
|---|---|
| Default map centre and zoom (Pristina) | `geo-config.js` → `center`, `zoom` |
| Search bias area (Kosovo) | `geo-config.js` → `KOSOVO_VIEWBOX` |
| Debounce, rate limit, result count | `geo-config.js` → `debounceMs`, `minIntervalMs`, `resultLimit` |
| Colours and spacing | `css/style.css` → `:root` tokens |
| Add a vehicle | `order.html` (button in "Choose your vehicle"), `VEHICLES` in `booking.js` and its names in `i18n.js` |

## Known limitations and to-do before launch

- **Pricing is a placeholder.** `calculateFare()` in `booking.js` returns `null`; the UI says "Confirmed by your driver". No prices are shown or invented.
- **No backend.** Bookings stay in the visitor's browser and are not sent to a dispatcher; the contact form validates but does not send. Connect both to a real service (for example a form service or your own API).
- **Placeholder content:** phone number and email on the contact page, the home-page stats (24/7, ~5 min, 4.9★) and the testimonials are sample data. Replace them with real details.
- **Nominatim public server:** meant for light use, not production traffic. Switch to a paid or self-hosted provider before launch (see above).
- **Privacy:** reverse geocoding sends the user's coordinates to the geocoding provider. Mention this in the Privacy Policy. The Privacy Policy and Terms links currently point to `#`.
- **Albanian translations** were written without a native review. Have a native speaker check them.
- Unused images remain in `images/` (airport, group, tours and others).

## Credits

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors. Icons by [Font Awesome](https://fontawesome.com). Font: Plus Jakarta Sans.
