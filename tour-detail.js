/* Single dynamic guide page renders one of six tours using the shared data source. */
(() => {
  'use strict';
  const find = id => document.getElementById(id);
  document.addEventListener('DOMContentLoaded', () => {
    if (!find('tourGuide')) return;
    const tours = window.KZT_TOURS || [];
    const id = new URLSearchParams(location.search).get('id') || 'charyn';
    const tour = tours.find(item => item.id === id);
    if (!tour) {
      find('tourGuide').hidden = true;
      find('tourNotFound').hidden = false;
      document.title = 'Tour not found | Kazakhstan Travel Company';
      return;
    }
    document.title = `${tour.title} | Kazakhstan Travel Company`;
    find('tourBreadcrumb').textContent = tour.title;
    find('tourTitle').textContent = tour.title;
    find('tourSubtitle').textContent = tour.subtitle;
    const photo = find('tourHeroImage');
    photo.src = `images/${tour.image}`;
    photo.alt = `${tour.title} scenic landscape`;
    find('tourDays').textContent = `${tour.days} day sample trip`;
    find('tourPrice').textContent = `Example price: $${tour.price}`;
    find('tourCategory').textContent = tour.category.charAt(0).toUpperCase() + tour.category.slice(1);
    find('tourDescription').textContent = tour.details;
    find('tourBestFor').textContent = `Best for: ${tour.bestFor}`;
    find('tourTip').textContent = tour.tips;
    for (const highlight of tour.highlights) {
      const li = document.createElement('li'); li.textContent = highlight;
      find('tourHighlights').appendChild(li);
    }
    tour.plan.forEach((day, index) => {
      const li = document.createElement('li');
      const strong = document.createElement('strong'); strong.textContent = `Day ${index + 1}`;
      const p = document.createElement('p'); p.textContent = day;
      li.append(strong, p);
      find('tourItinerary').appendChild(li);
    });
    find('saveTourLink').href = `profile.html?save=${encodeURIComponent(tour.id)}`;
    find('tourWeatherLink').href = `weather.html?city=${encodeURIComponent(tour.id)}`;
    const related = tours.filter(other => other.id !== id).slice(0, 3);
    related.forEach(other => {
      const a = document.createElement('a');
      a.className = 'related-item';
      a.href = `tour.html?id=${encodeURIComponent(other.id)}`;
      const img = document.createElement('img'); img.src = `images/${other.image}`;
      img.alt = other.title; img.loading = 'lazy';
      const text = document.createElement('span'); text.textContent = other.title;
      a.append(img, text); find('relatedTrips').appendChild(a);
    });
  });
})();
