// หน้าเตรียม-เหลือ — ต่อปุ่ม/ช่องกรอกเข้ากับข้อมูล (การวาดอยู่ที่ prep-view.js / prep-meat.js / prep-rice.js)
import { get, revise } from '../shared/data.js';
import { PREP_FILTERS } from '../shared/config.js';
import { topBarHtml, toast, formSheet } from '../shared/ui.js';
import { prepMeatTotals, riceTotals } from '../shared/calc.js';
import { setPeople, heroHtml, tabsHtml, filterHtml, kpiHtml, tipHtml, emptyHtml } from './prep-view.js';
import { meatTableHtml } from './prep-meat.js';
import { riceBodyHtml } from './prep-rice.js';
import { forecastBodyHtml, forecastClick } from './prep-forecast.js';
import { fahBodyHtml, fahClick } from './prep-fah.js';

// สิ่งที่ผู้ใช้เลือกอยู่บนหน้านี้ (ไม่แชร์ข้ามหน้า)
const view = { tab: 'meat', filter: 'all', mode: 'num', fahMenu: 'all' };

// ชุดข้อมูลที่แต่ละแท็บใช้
const STORE = { meat: 'prepMeat', rice: 'prepRice', fahAll: 'fahToday' };

// กรองรายการตามชิปที่เลือก: ตามคนรับผิดชอบ (owner/owners) และ/หรือตามหมวดวัตถุดิบ (group)
function visible(rows) {
  const f = (PREP_FILTERS[view.tab] || []).find(x => x.id === view.filter) || {};
  const who = f.people || [], groups = f.groups;
  return rows.filter(r => (!who.length || (r.owners || [r.owner]).some(id => who.includes(id))) && (!groups || groups.includes(r.group)));
}

// เอาโครงหน้าที่โหลดมาแล้ว มาเติมข้อมูลจากประตูข้อมูล
export function mountPrepPage(root) {
  setPeople(get('prepPeople'));
  root.querySelector('#prep-bar').innerHTML = topBarHtml({ title: 'เตรียม-เหลือ', date: get('prepDate'), dateId: 'prep-date' });

  // วาดส่วนที่เปลี่ยนตามแท็บ
  const draw = () => {
    root.querySelector('.prep').dataset.tab = view.tab;   // ให้ CSS รู้ว่าอยู่แท็บไหน (ใช้เลือกพื้นหลัง)
    root.querySelector('#prep-hero').innerHTML = heroHtml(view.tab);
    root.querySelector('#prep-tabs').innerHTML = tabsHtml(view.tab);
    root.querySelector('#prep-filter').innerHTML = filterHtml(view.tab, view.filter);
    root.querySelector('#prep-tip').innerHTML = tipHtml(view.tab);
    drawData();
  };

  // วาดเฉพาะตัวเลขสรุป + ตาราง (เรียกซ้ำเมื่อข้อมูลเปลี่ยน)
  const drawData = () => {
    const kpi = root.querySelector('#prep-kpi'), body = root.querySelector('#prep-body');
    if (view.tab === 'meat') {
      const rows = visible(get('prepMeat'));
      kpi.innerHTML = kpiHtml('meat', prepMeatTotals(rows));
      body.innerHTML = meatTableHtml(rows, get('prepMeatGroups'));
    } else if (view.tab === 'rice') {
      const rows = visible(get('prepRice'));
      kpi.innerHTML = kpiHtml('rice', riceTotals(rows));
      body.innerHTML = riceBodyHtml(rows, riceTotals(rows), get('prepRiceHistory'));
    } else if (view.tab === 'forecast') {
      kpi.innerHTML = '';
      body.innerHTML = forecastBodyHtml(visible(get('prepForecast')), get('prepForecastMeta'), get('prepForecastTips'), view.mode);
    } else if (view.tab === 'fahAll') {
      kpi.innerHTML = '';
      body.innerHTML = fahBodyHtml(view);
    } else {
      kpi.innerHTML = '';
      body.innerHTML = emptyHtml();
    }
  };

  // กดปุ่ม "+ เบิกเพิ่ม" → ถามจำนวน แล้วบวกเป็นรอบใหม่
  const addExtra = async id => {
    const item = get('prepMeat').find(r => r.id === id);
    const res = await formSheet({ title: `เบิกเพิ่ม · ${item.name}`, okLabel: 'เบิกเพิ่ม', fields: [{ key: 'amount', label: 'จำนวนที่เบิกเพิ่ม (กก.)', kind: 'number', step: 0.1, placeholder: 'เช่น 0.5' }] });
    if (!res) return;
    const amount = Number(res.amount);
    if (!amount || amount <= 0) return toast('ยังไม่ได้ใส่จำนวน');
    revise('prepMeat', id, { extras: (item.extras || []).concat([amount]) });
    drawData();
    toast(`เบิกเพิ่ม ${item.name} ${amount} กก. แล้ว`);
  };

  // กดดินสอ → แก้ชื่อ / หมายเหตุ / ผู้รับผิดชอบ / ปริมาณแนะนำ
  const editItem = async id => {
    const item = get('prepMeat').find(r => r.id === id);
    const people = get('prepPeople').map(p => ({ value: p.id, label: p.name }));
    const res = await formSheet({
      title: 'แก้ไขรายการ',
      fields: [
        { key: 'name', label: 'ชื่อวัตถุดิบ', kind: 'text', value: item.name },
        { key: 'note', label: 'หมายเหตุ (ถ้ามี)', kind: 'text', value: item.note },
        { key: 'owner', label: 'ผู้รับผิดชอบ', kind: 'select', value: item.owner, options: people },
        { key: 'rec', label: 'ปริมาณแนะนำ (กก.)', kind: 'number', value: item.rec },
        { key: 'recMin', label: 'แนะนำต่ำสุด (กก.)', kind: 'number', value: item.recMin },
        { key: 'recMax', label: 'แนะนำสูงสุด (กก.)', kind: 'number', value: item.recMax }
      ]
    });
    if (!res) return;
    if (!res.name) return toast('ยังไม่ได้ใส่ชื่อวัตถุดิบ');
    revise('prepMeat', id, { name: res.name, note: res.note, owner: res.owner, rec: Number(res.rec), recMin: Number(res.recMin), recMax: Number(res.recMax) });
    drawData();
    toast('บันทึกแล้ว');
  };

  // ช่องตัวเลขในตารางเปลี่ยน → เก็บลงข้อมูลทันที (r0-r2 = หุงเพิ่มรอบ 1-3 ของข้าว)
  const saveCell = input => {
    const store = STORE[view.tab];
    const value = input.value === '' ? null : Math.max(0, Number(input.value));
    const f = input.dataset.f;
    if (/^r\d$/.test(f)) {
      const item = get(store).find(r => r.id === input.dataset.id);
      const rounds = (item.rounds || [null, null, null]).slice();
      rounds[Number(f[1])] = value;
      revise(store, input.dataset.id, { rounds });
    } else {
      revise(store, input.dataset.id, { [f]: value ?? 0 });
    }
    drawData();
  };

  draw();

  root.addEventListener('click', event => {
    const hit = sel => event.target.closest(sel);
    const tab = hit('[data-tab]'), filter = hit('[data-filter]'), extra = hit('[data-extra]'), edit = hit('[data-edit]');
    if (tab) { view.tab = tab.dataset.tab; view.filter = 'all'; root.closest('.app-view').scrollTop = 0; draw(); }
    else if (filter) { view.filter = filter.dataset.filter; drawData(); root.querySelector('#prep-filter').innerHTML = filterHtml(view.tab, view.filter); }
    else if (extra) addExtra(extra.dataset.extra);
    else if (edit) editItem(edit.dataset.edit);
    else if (view.tab === 'forecast') forecastClick(event, view, get('prepForecastMeta'), drawData);
    else if (view.tab === 'fahAll') fahClick(event, drawData);
  });

  root.addEventListener('change', event => {
    if (event.target.matches('.ptab__in[data-f]')) return saveCell(event.target);
    // เลือกดูสถิติของเหลือทีละเมนูในแท็บของฟ้าทั้งหมด
    if (event.target.matches('[data-fah-menu]')) { view.fahMenu = event.target.value; drawData(); }
  });
}
