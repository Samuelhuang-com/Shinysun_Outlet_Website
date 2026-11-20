const editor = document.getElementById('form');
const input = name => editor.elements.namedItem(name);
const select = document.getElementById('items');
const status = document.getElementById('status');
const remove = document.getElementById('remove');
const previewFrame = document.getElementById('preview');
const fields = ['title','category','headline','scope','brand','url','start','end','description'];
let rows = readDraft();

stores.forEach(store => input('brand').add(new Option(store.name,store.name)));
function loadForm() {
  const item = rows.find(row => row.id === select.value);
  editor.reset();
  if (item) fields.forEach(name => {input(name).value = item[name] ?? '';});
  input('featured').checked = Boolean(item?.featured);
  remove.disabled = !item;
}
function renderList(id = '') {
  select.replaceChildren(new Option('新增活動',''));
  rows.forEach(row => select.add(new Option(row.title,row.id)));
  select.value = id;
  loadForm();
}
function saveRows(next, id, message) {
  try { localStorage.setItem(draftKey,JSON.stringify(next)); }
  catch { status.textContent = '此瀏覽器無法儲存草稿。'; return; }
  rows = next;
  renderList(id);
  previewFrame.src = './?preview=1&v=' + Date.now();
  status.textContent = message;
}
select.addEventListener('change', () => {loadForm();status.textContent='';});
editor.addEventListener('submit', event => {
  event.preventDefault();
  const record = {id:select.value || 'event-' + Date.now()};
  fields.forEach(name => {record[name] = input(name).value.trim();});
  if (['title','headline','scope','description'].some(name => !record[name])) {
    status.textContent = '請填寫名稱、主打文案、範圍與說明。'; return;
  }
  if (record.start && record.end && record.start > record.end) {
    status.textContent = '最後有效日須為上架日當天或之後。'; return;
  }
  if (record.url && !record.url.startsWith('https://')) {
    status.textContent = '活動連結須使用 HTTPS。'; return;
  }
  record.featured = input('featured').checked;
  const index = rows.findIndex(item => item.id === record.id);
  const next = rows.map(item => record.featured ? {...item, featured:false} : item);
  if (index < 0) next.push(record); else next[index] = record;
  saveRows(next,record.id,'活動草稿已儲存，手機版已更新。');
});
remove.addEventListener('click', () => {
  if (select.value && window.confirm('刪除這筆活動草稿？')) {
    saveRows(rows.filter(row => row.id !== select.value),'','活動草稿已刪除。');
  }
});
document.getElementById('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(rows,null,2)],{type:'application/json'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'shinysun-offers.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url),1000);
});
renderList();