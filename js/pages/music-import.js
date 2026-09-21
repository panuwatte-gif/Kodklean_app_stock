// นำเข้าเพลงของหน้าเพลง — เลือกไฟล์จากเครื่อง แปลงเป็น MP3 อัปโหลด และเพิ่มเพลงจากคลังเข้าเพลย์ลิสต์
import { MUSIC_UI } from '../shared/config.js';
import { toast, multiPickSheet } from '../shared/ui.js';
import { fillText } from '../shared/format.js';
import { currentUser } from '../shared/auth.js';
import * as data from '../shared/data.js';
import { pickAudioFiles, toMp3, titleOf, isAudioLike, isMp3 } from '../shared/audio.js';

const T = MUSIC_UI;

// เลือกไฟล์จากเครื่อง → ไฟล์ที่ไม่ใช่ MP3 จะถูกแปลงเป็น MP3 ก่อนอัปโหลดขึ้นคลัง
export async function importFiles(state, reload) {
  if (state.listId === 'all' && !state.lists.length) return toast(T.err.needList);
  const files = await pickAudioFiles();
  if (!files.length) return;
  const me = currentUser();
  let done = 0;
  for (const file of files) {
    if (!isAudioLike(file)) { toast(fillText(T.err.audio, { name: file.name })); continue; }
    try {
      toast(fillText(isMp3(file) ? T.uploading : T.converting, { name: titleOf(file) }));
      const out = await toMp3(file);
      const track = await data.addTrack({ title: titleOf(file), artist: me && me.name, blob: out.blob, seconds: out.seconds });
      if (state.listId !== 'all') await data.addTrackToPlaylist(state.listId, track.id, Date.now() % 100000);
      done++;
    } catch (err) {
      toast(fillText(T.err.convert, { name: titleOf(file) }));
    }
  }
  if (done) { await reload(); toast(fillText(T.done.imported, { n: done })); }
}

// เพิ่มเพลงที่มีอยู่ในคลังเข้าเพลย์ลิสต์ที่เปิดอยู่ (เลือกหลายเพลงได้)
export async function addFromLibrary(state, reload) {
  const list = state.lists.find(l => l.id === state.listId);
  if (!list) return;
  const inList = new Set(state.links.filter(l => l.playlist_id === list.id).map(l => l.track_id));
  const options = state.tracks.filter(t => !inList.has(t.id)).map(t => ({ value: t.id, label: t.title, tag: t.artist || '' }));
  if (!options.length) return toast(T.addFromEmpty);
  const picked = await multiPickSheet({
    title: fillText(T.addFromTitle, { name: list.name }), options, selected: [], okLabel: T.pickDone
  });
  if (!picked || !picked.length) return;
  for (const id of picked) await data.addTrackToPlaylist(list.id, id, Date.now() % 100000);
  await reload();
  toast(fillText(T.done.add, { n: picked.length }));
}
