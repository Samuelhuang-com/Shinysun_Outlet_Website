const byId = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const external = (url, label) => {
  try {
    const link = new URL(url);
    if (link.protocol === 'https:') return '<a class="text-link" href="' + escapeHTML(link.href) + '" target="_blank" rel="noopener">' + label + '</a>';
  } catch {}
  return '';
};
const now = new Date();
const date = todayTaipei(now);
const weekday = new Intl.DateTimeFormat('en', {timeZone:taipei, weekday:'short'}).format(now);
byId('today').textContent = ['Sat','Sun'].includes(weekday) ? '10:30–22:00' : '11:00–22:00';
byId('today').title = '依例行營業時間顯示，國定假日與特殊調整請以館方公告為準。';
const preview = new URLSearchParams(location.search).get('preview') === '1';
const visibleOffers = activeOffers(preview ? readDraft() : standardOffers, date);
const feature = visibleOffers.find(item => item.featured);
byId('hero-event').innerHTML = '<div class="hero-event"><a class="button" href="' + (feature ? '#offers' : '#directory') + '">' + (feature ? '看本檔優惠' : '探索品牌與樓層') + '</a>' +
  (feature ? '<p>' + escapeHTML(feature.title) + ' · ' + escapeHTML(dateLabel(feature)) + '</p>' : '') + '</div>';

const icons = {
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  layers:'<path d="M3 8 12 3l9 5-9 5-9-5Zm0 4 9 5 9-5M3 16l9 5 9-5"/>',
  food:'<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18m12 0V3c-3 1-4 4-4 8v2h4"/>',
  parking:'<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M9 16V8h4a2 2 0 0 1 0 4H9"/>'
};
document.querySelectorAll('[data-icon]').forEach(el => {
  el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[el.dataset.icon] + '</svg>';
});
const dialog = byId('detail');
function showDetail(content) {
  byId('detail-body').innerHTML = content;
  dialog.showModal();
}
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
const offerFilters = byId('offer-filters');
const offerList = byId('offer-list');
function renderOffers(category) {
  const selected = visibleOffers.filter(item => !category || item.category === category);
  const art = {'全館活動':'event','品牌優惠':'brand-art','刷卡禮':'bank-art'};
  offerList.innerHTML = selected.map((item, index) => '<article class="card"><div class="card-media '+art[item.category]+'"><span>' +
    escapeHTML(item.headline) + '</span></div><div class="card-body"><span class="tag">' + escapeHTML(item.category) + '</span><h3>' +
    escapeHTML(item.title) + '</h3><p>' + escapeHTML(dateLabel(item)) + '｜' + escapeHTML(item.scope) +
    '</p><button class="text-link" data-offer="' + index + '" type="button">查看詳情</button></div></article>').join('') ||
    '<p class="empty" role="status">目前沒有有效活動。</p>';
  offerList.querySelectorAll('[data-offer]').forEach(button => button.addEventListener('click', () => {
    const item = selected[Number(button.dataset.offer)];
    showDetail('<span class="tag">' + escapeHTML(item.category) + '</span><h3>' + escapeHTML(item.title) +
      '</h3><p>' + escapeHTML(dateLabel(item)) + '｜' + escapeHTML(item.scope) + '</p><p>' +
      escapeHTML(item.description) + '</p>' + (item.brand ? '<p>關聯品牌｜' + escapeHTML(item.brand) + '</p>' : '') + external(item.url,'查看官方公告'));
  }));
}
['', ...offerTypes].forEach(category => {
  const button = document.createElement('button');
  button.textContent = category || '全部';
  button.type = 'button';
  button.setAttribute('aria-pressed', String(!category));
  button.addEventListener('click', () => {
    Array.from(offerFilters.children).forEach(child => child.setAttribute('aria-pressed',String(child === button)));
    renderOffers(category);
  });
  offerFilters.append(button);
});
renderOffers('');

const brandSearch = byId('brand-search');
const brandCategory = byId('brand-category');
const brandFloor = byId('brand-floor');
const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[’'\s&.-]/g,'');
function options(select, values, label) {
  select.add(new Option(label, ''));
  values.forEach(value => select.add(new Option(value,value)));
}
options(brandCategory, ['女裝','男裝','配件','休閒','運動','餐飲'], '全部類別');
options(brandFloor, ['B2F','B1F','1F','2F'], '全部樓層');
const brandList = byId('brand-list');
const more = byId('more-brands');
let limit = 8;
function renderBrands() {
  const query = normalize(brandSearch.value.trim());
  const filtered = stores.filter(store => normalize(store.name + ' ' + (store.english || '')).includes(query) &&
    (!brandCategory.value || store.category === brandCategory.value) && (!brandFloor.value || store.floors.includes(brandFloor.value)));
  byId('brand-count').textContent = '符合條件 ' + filtered.length + ' 個櫃位';
  brandList.innerHTML = filtered.slice(0,limit).map(store =>
    '<a class="store" href="' + store.url + '" target="_blank" rel="noopener"><span><strong>' + escapeHTML(store.name) +
    '</strong><small>' + store.category + '</small></span><span class="tag">' + store.floors.join(' / ') + '</span></a>'
  ).join('') || '<p class="empty">找不到符合條件的品牌。請調整關鍵字、類別或樓層。</p>';
  more.hidden = filtered.length <= limit;
}
[brandSearch, brandCategory, brandFloor].forEach(input => input.addEventListener(input === brandSearch ? 'input' : 'change', () => {limit=8; renderBrands();}));
byId('reset').addEventListener('click', () => {brandSearch.value=''; brandCategory.value=''; brandFloor.value=''; limit=8; renderBrands(); brandSearch.focus();});
more.addEventListener('click', () => {const index = limit; limit += 8; renderBrands(); brandList.children[index]?.focus();});
document.querySelectorAll('[data-jump]').forEach(link => link.addEventListener('click', () => {
  const target = link.dataset.jump === 'search' ? brandSearch : brandFloor;
  target.focus({preventScroll:true});
}));
document.querySelector('a[href="#parking"]').addEventListener('click', () => {byId('parking').open = true;});
renderBrands();

byId('dining-list').innerHTML = restaurants.map(item => '<article class="card"><div class="card-media"><span>' + item.english + '</span>' +
  (item.image ? '<img loading="lazy" alt="" src="' + item.image + '">' : '') + '</div><div class="card-body"><span class="tag">' +
  item.floors.join(' / ') + '</span><h3>' + item.name + '</h3><p>' + item.type + '</p>' +
  (item.hours ? '<p>' + item.hours + '</p>' : '') + '<a href="tel:+886' + item.phone.slice(1).replaceAll('-','') + '">' + item.phone +
  '</a>' + external(item.url,'查看餐廳資訊') + '</div></article>').join('');
document.querySelector('.hero-photo img').addEventListener('error', event => {event.target.hidden = true;});
document.querySelectorAll('#dining-list img').forEach(img => img.addEventListener('error', () => {img.hidden = true;}));
const menu = document.querySelector('.menu');
const navLinks = byId('links');
function setMenu(value) {
  navLinks.classList.toggle('open', value);
  menu.setAttribute('aria-expanded', String(value));
}
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {setMenu(false); menu.focus();}});