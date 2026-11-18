/* Final Project - real Open-Meteo API integration (no key required).
   The current weather and daily temperatures are fetched from the browser;
   loading/error states are explicit and nothing is fabricated on failure. */
(() => {
  'use strict';
  const locations = {
    almaty: { name: 'Almaty', latitude: 43.2389, longitude: 76.8897 },
    astana: { name: 'Astana', latitude: 51.1694, longitude: 71.4491 },
    charyn: { name: 'Charyn Canyon', latitude: 43.3513, longitude: 79.0809 },
    turkestan: { name: 'Turkestan', latitude: 43.2973, longitude: 68.2518 },
    mangystau: { name: 'Aktau (Mangystau)', latitude: 43.6532, longitude: 51.1975 },
    burabay: { name: 'Burabay', latitude: 53.0877, longitude: 70.3138 }
  };
  const descriptions = {
    0: ['Clear sky', '☀'], 1: ['Mainly clear', '🌤'],
    2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁'],
    45: ['Fog', '🌫'], 48: ['Depositing rime fog', '🌫'],
    51: ['Light drizzle', '🌦'], 53: ['Drizzle', '🌦'], 55: ['Heavy drizzle', '🌧'],
    56: ['Freezing drizzle', '🌧'], 57: ['Freezing drizzle', '🌧'],
    61: ['Light rain', '🌦'], 63: ['Rain', '🌧'], 65: ['Heavy rain', '🌧'],
    66: ['Freezing rain', '🌧'], 67: ['Freezing rain', '🌧'],
    71: ['Light snow', '🌨'], 73: ['Snow', '❄'], 75: ['Heavy snow', '❄'], 77: ['Snow grains', '❄'],
    80: ['Rain showers', '🌦'], 81: ['Rain showers', '🌧'], 82: ['Heavy rain showers', '🌧'],
    85: ['Snow showers', '🌨'], 86: ['Heavy snow showers', '❄'],
    95: ['Thunderstorm', '⛈'], 96: ['Thunderstorm with hail', '⛈'], 99: ['Thunderstorm with hail', '⛈']
  };
  const el = id => document.getElementById(id);
  let controller = null;
  function labelFor(code) { return descriptions[code] || ['Conditions unavailable', '🌤']; }
  function setBusy(busy) {
    el('weatherLoading').hidden = !busy;
    document.querySelector('.weather-panel').setAttribute('aria-busy', String(busy));
    el('weatherRefresh').disabled = busy;
  }
  const number = value => Number.isFinite(value) ? `${Math.round(value)}°C` : '—';

  async function loadWeather() {
    const key = el('weatherCity').value;
    const place = locations[key];
    if (!place) return;
    try { localStorage.setItem('kzt_weather_city_v1', key); } catch (_) {}
    if (controller) controller.abort();
    const requestController = new AbortController();
    controller = requestController;
    const signal = requestController.signal;
    const params = new URLSearchParams({
      latitude: place.latitude, longitude: place.longitude,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      daily: 'temperature_2m_max,temperature_2m_min',
      timezone: 'auto', forecast_days: '1'
    });
    el('weatherPlace').textContent = place.name;
    el('weatherData').hidden = true;
    el('weatherError').hidden = true;
    el('weatherUpdated').textContent = 'Checking latest observations...';
    setBusy(true);
    let timedOut = false;
    try {
      // Timeout prevents endless spinners when API or connection is inaccessible.
      const timeout = setTimeout(() => { timedOut = true; requestController.abort(); }, 12000);
      let response;
      try { response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal }); }
      finally { clearTimeout(timeout); }
      if (!response.ok) throw new Error(`Weather service returned HTTP ${response.status}.`);
      const data = await response.json();
      if (!data.current || !data.daily || !Number.isFinite(data.current.temperature_2m)
        || !Number.isFinite(data.current.relative_humidity_2m)
        || !Number.isFinite(data.current.wind_speed_10m)
        || !Number.isFinite(data.current.apparent_temperature)
        || typeof data.current.time !== 'string') {
        throw new Error('The weather service returned incomplete data.');
      }
      if (signal.aborted) return;
      const current = data.current;
      const daily = data.daily;
      const [description, icon] = labelFor(current.weather_code);
      el('weatherTemp').textContent = number(current.temperature_2m);
      el('weatherDescription').textContent = description;
      el('weatherIcon').textContent = icon;
      el('weatherFeels').textContent = number(current.apparent_temperature);
      el('weatherHumidity').textContent = `${Math.round(current.relative_humidity_2m)}%`;
      el('weatherWind').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
      el('weatherRange').textContent = `${number(daily.temperature_2m_max?.[0])} / ${number(daily.temperature_2m_min?.[0])}`;
      // API time is local to chosen destination (timezone=auto).
      el('weatherUpdated').textContent = `Updated: ${current.time.replace('T', ' ')} (destination local time)`;
      el('weatherData').hidden = false;
    } catch (error) {
      if (signal.aborted && !timedOut) return;  // superseded by a newer city request
      const explanation = timedOut ? 'The request took too long.' : error.message;
      el('weatherErrorText').textContent = `Couldn't load live weather for ${place.name}. ${explanation} Check your connection or try again.`;
      el('weatherError').hidden = false;
      el('weatherUpdated').textContent = 'Live data unavailable';
    } finally {
      if (controller === requestController) setBusy(false);
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    if (!el('weatherCity')) return;
    try {
      const saved = localStorage.getItem('kzt_weather_city_v1');
      if (saved && locations[saved]) el('weatherCity').value = saved;
    } catch (_) {}
    const requested = new URLSearchParams(location.search).get('city');
    if (requested && locations[requested]) el('weatherCity').value = requested;
    el('weatherCity').addEventListener('change', loadWeather);
    el('weatherRefresh').addEventListener('click', loadWeather);
    el('weatherRetry').addEventListener('click', loadWeather);
    loadWeather();
  });
})();
