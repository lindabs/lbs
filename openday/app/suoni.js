// Musica di sottofondo generata dal browser (nessun file audio): accordi lenti e note di carillon.
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const ACCORDI = [[50, 57, 62, 66, 69], [47, 54, 59, 62, 66], [43, 50, 55, 59, 62], [45, 52, 57, 61, 64]];
const PENTA = [74, 76, 78, 81, 83, 86, 88, 90];

export const suoni = {
  ctx: null, attiva: false, livello: 0.4, timer: null, carillon: null, accordo: 0,
  prepara() {
    if (this.ctx) return true;
    try { const AC = window.AudioContext || window.webkitAudioContext; this.ctx = new AC(); } catch (e) { return false; }
    const c = this.ctx; this.master = c.createGain(); this.master.gain.value = 0; this.master.connect(c.destination);
    this.filtro = c.createBiquadFilter(); this.filtro.type = 'lowpass'; this.filtro.frequency.value = 1400; this.filtro.connect(this.master);
    this.eco = c.createDelay(1.2); this.eco.delayTime.value = 0.42; const fb = c.createGain(); fb.gain.value = 0.33;
    this.eco.connect(fb); fb.connect(this.eco); this.eco.connect(this.master);
    return true;
  },
  accendi() {
    if (!this.prepara()) return false;
    this.ctx.resume?.(); this.attiva = true; this.volume(this.livello);
    if (!this.timer) { this.suonaAccordo(); this.timer = setInterval(() => this.suonaAccordo(), 7000); this.programmaNota(); }
    return true;
  },
  spegni() { this.attiva = false; if (this.ctx) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4); clearInterval(this.timer); clearTimeout(this.carillon); this.timer = null; },
  volume(v) { this.livello = v; if (this.ctx && this.attiva) this.master.gain.setTargetAtTime(v * 0.5, this.ctx.currentTime, 0.8); },
  suonaAccordo() {
    const c = this.ctx, t = c.currentTime; const note = ACCORDI[this.accordo++ % ACCORDI.length];
    for (const n of note) for (const [tipo, det] of [['sine', 0], ['triangle', 5]]) {
      const o = c.createOscillator(); o.type = tipo; o.frequency.value = midi(n); o.detune.value = det;
      const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.028, t + 2.5); g.gain.linearRampToValueAtTime(0.02, t + 6); g.gain.linearRampToValueAtTime(0, t + 9);
      o.connect(g); g.connect(this.filtro); o.start(t); o.stop(t + 9.2);
    }
  },
  programmaNota() { this.carillon = setTimeout(() => { if (!this.attiva) return; this.nota(PENTA[Math.floor(Math.random() * PENTA.length)], 0.05); this.programmaNota(); }, 700 + Math.random() * 1600); },
  nota(n, vol = 0.06, quando = 0) {
    if (!this.ctx) return; const c = this.ctx, t = c.currentTime + quando;
    const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = midi(n);
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g); g.connect(this.master); g.connect(this.eco); o.start(t); o.stop(t + 1.7);
  },
  scintilla() { if (!this.attiva) return; [81, 86, 90, 93].forEach((n, i) => this.nota(n, 0.07, i * 0.09)); },
};
