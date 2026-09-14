// สร้างคำถามอัตโนมัติจากคลังเมนูและคลังศัพท์ (กติกาอยู่ที่นี่ที่เดียว)

// สลับลำดับรายการแบบสุ่ม (คัดออกทีละตัว)
function mixOrder(list) {
  const rest = list.slice();
  const out = [];
  while (rest.length > 0) {
    const pick = Math.floor(Math.random() * rest.length);
    out.push(rest[pick]);
    rest.splice(pick, 1);
  }
  return out;
}

// ตัวเลือกที่ไม่ใช่คำตอบ: เอาจากกลุ่มสับสนเดียวกันก่อน ไม่พอค่อยเอาเมนูอื่น
function otherChoices(item, all, n) {
  const usable = all.filter(x => x.active && x.id !== item.id);
  const sameGroup = usable.filter(x => x.confuse_group && x.confuse_group === item.confuse_group);
  const others = usable.filter(x => sameGroup.indexOf(x) === -1);
  return mixOrder(sameGroup).slice(0, n).concat(mixOrder(others)).slice(0, n);
}

// 1 เมนู → คำถาม 3 แบบ: คำไทย→เลือกรูป, รูป→เลือกคำไทย, เสียง→เลือกคำไทย (ไม่มีเสียง→ข้าม)
export function menuQuestions(item, all) {
  const wrong = otherChoices(item, all, 3);
  if (wrong.length < 1) return [];
  const four = [item].concat(wrong);
  const list = [
    { kind: 'word2img', prompt: item.name_th, options: four.map(x => x.image_url), answer: item.image_url },
    { kind: 'img2word', prompt: item.image_url, options: four.map(x => x.name_th), answer: item.name_th }
  ];
  if (item.audio_url) {
    list.push({ kind: 'audio2word', prompt: item.audio_url, options: four.map(x => x.name_th), answer: item.name_th });
  }
  return list.map(q => ({ ...q, options: mixOrder(q.options), menu_id: item.id }));
}

// คำศัพท์: ความสำคัญสูง = วนถามถี่ 2 เท่า
export function vocabQueue(rows) {
  const queue = [];
  rows.filter(r => r.active).forEach(r => {
    queue.push(r);
    if (r.priority === 'high') queue.push(r);
  });
  return mixOrder(queue);
}

// หมวดที่ถือว่า "เปลี่ยนบ่อย" — แก้เฉลยแล้วต้องให้ทุกคนเรียนใหม่
export const VOLATILE = ['grab', 'ourshop'];
