const official = 'https://www.s-outlet.com.tw/';
const brands = [
  ['COACH','配件','1F',52], ['adidas','運動','B2F',231],
  ['Maison Mori','女裝','2F',256], ['THE NORTH FACE','運動','1F',195],
  ['NEW BALANCE','運動','B2F',80], ['Levi’s','休閒','B1F',95],
  ['BURBERRY','配件','1F',49], ['SST&C','男裝','B1F',42],
  ['LONGCHAMP','配件','1F',58], ['Viga Wang','女裝','1F',244],
  ['JUN','男裝','B1F',38], ['BALLY','配件','1F',189],
  ['MERRELL','配件','B1F',273], ['PUMA','運動','B2F',81],
  ['FILA','運動','B2F',77], ['Champion','休閒','B1F',246],
  ['Superdry','休閒','B1F',263], ['Roots','休閒','B1F',102], ['Timberland','休閒','B1F',105], ['MICHAEL KORS','配件','1F',59]
].map(([name, category, floor, id]) => ({name, category, floors:[floor], url:official+'brand.php?brand='+id}));
const restaurants = [
  {name:'星巴克', english:'STARBUCKS', type:'咖啡與輕食', floors:['1F'], phone:'04-2225-3841', hours:'每日 10:00–22:00', id:6, image:'https://www.s-outlet.com.tw/_upload/images/1910031001552.jpg'},
  {name:'十二月', english:'TWELVE MONTHS', type:'粥品與茶飲', floors:['1F','2F'], phone:'04-2221-9393', id:5},
  {name:'上澄鍋物', english:'KIYORA SHABUSHABU', type:'日式鍋物', floors:['2F'], phone:'04-2223-7013', hours:'平日 12:00–14:30、18:00–21:30｜假日 11:00–15:00、17:00–21:30', id:1, image:'https://www.s-outlet.com.tw/_upload/htmlEdit/20230630220808_90.jpg'}
].map(row => ({...row, category:'餐飲', url:official+'food.php?type='+row.id}));
const stores = [...brands, ...restaurants];
const offerTypes = ['全館活動','品牌優惠','刷卡禮'];
const standardOffers = [
  {id:'year-end', title:'OUTLET 倒貨祭', category:'品牌優惠', headline:'年末品牌特惠', scope:'全館參與品牌', brand:'Maison Mori', start:'2026-11-06', end:'2026-11-30', description:'全館參與品牌包含 Maison Mori、Whiple、TOP-DO 等。6F 特賣另至 11/23。品牌商品、折扣和供應以現場及官方型錄為準。', url:official+'dm.php?i=300', featured:true},
  {id:'taichung-shopping', title:'臺中購物節', category:'全館活動', headline:'消費金額 5 倍累計', scope:'全館', start:'', end:'2026-12-25', description:'活動期間於日曜天地消費，可享臺中購物節消費金額 5 倍累計。登錄方式與適用條件依活動公告。', url:official+'news.php?type=316', featured:true},
  {id:'dm', title:'品牌優惠與線上 DM', category:'品牌優惠', headline:'OUTLET 好物選購', scope:'各檔參與品牌', start:'', end:'', description:'瀏覽日曜天地官方型錄。參與品牌、檔期與適用條件請以各篇活動公告為準。', url:official+'dm-list.php', directory:true},
  {id:'bank', title:'信用卡刷卡禮', category:'刷卡禮', headline:'信用卡優惠', scope:'依銀行公告', start:'', end:'', description:'查詢合作銀行的刷卡禮與登錄方式。優惠資格、名額和期限依各銀行公告。', url:official+'bank.php', directory:true}
];
const draftKey = 'shinysun-preview-offers-v1';
const taipei = 'Asia/Taipei';
function todayTaipei(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en', {timeZone:taipei, year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(now);
  return ['year','month','day'].map(type => parts.find(part => part.type === type).value).join('-');
}
function activeOffers(items, date) {
  return items.filter(item => (!item.start || item.start <= date) && (!item.end || item.end >= date));
}
function readDraft() {
  try { return JSON.parse(localStorage.getItem(draftKey)) ?? standardOffers; }
  catch { return standardOffers; }
}
function dateLabel(item) {
  const date = value => value.replaceAll('-', '/');
  if (item.start && item.end) return date(item.start) + ' – ' + date(item.end);
  if (item.end) return '至 ' + date(item.end);
  if (item.start) return date(item.start) + ' 起';
  return '依各檔公告';
}