// música do leitor (house gerado no browser, sem copyright)
// ======================================================
(() => {

// nota midi para frequência
const N = (n) => 440 * Math.pow(2, (n - 69) / 12);

// faixas
// ======================================================
const TRACKS = [
    { name: "Sunset Drive",  bpm: 120, swing: .06,
      chords: [[57,60,64,67],[53,57,60,64],[50,53,57,60],[52,55,59,62]],   // Am7 Fmaj7 Dm7 Em7
      bass:   [33, 29, 26, 28] },
    { name: "Deep Roots",    bpm: 122, swing: .08,
      chords: [[48,51,55,58],[53,56,60,63],[44,48,51,55],[46,50,53,56]],   // Cm7 Fm7 Abmaj7 Bb7
      bass:   [36, 29, 32, 34] },
    { name: "Night Market",  bpm: 118, swing: .05,
      chords: [[55,58,62,65],[51,55,58,62],[53,57,60,63],[50,53,57,60]],   // Gm7 Ebmaj7 F7 Dm7
      bass:   [31, 27, 29, 26] }
];
const BARS = 96;              // compassos por faixa (~3 min)

let ctx, master, comp, verb, verbSend, noiseBuf;
let cur = 0, playing = false, step = 0, nextTime = 0, timer = null, startedAt = 0;
let volume = .7, muted = false;
const listeners = [];

const emit = () => listeners.forEach(f => f(state()));
const state = () => ({ playing, started: !!ctx, track: TRACKS[cur].name, bpm: TRACKS[cur].bpm, index: cur, progress: progress() });
const progress = () => {
    if(!ctx || !playing) return lastProgress;
    const t = TRACKS[cur];
    const len = BARS * 4 * 60 / t.bpm;
    return Math.min(1, (ctx.currentTime - startedAt) / len);
};
let lastProgress = 0;

// preparar áudio
// ======================================================
const init = () => {
    if(ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = .01; comp.release.value = .2;
    master = ctx.createGain();
    master.gain.value = muted ? 0 : volume;
    comp.connect(master); master.connect(ctx.destination);

    // reverb
    verb = ctx.createConvolver();
    const len = ctx.sampleRate * 2.4, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for(let c = 0; c < 2; c++){
        const d = ir.getChannelData(c);
        for(let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    verb.buffer = ir;
    verbSend = ctx.createGain(); verbSend.gain.value = .28;
    verbSend.connect(verb); verb.connect(comp);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for(let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
};

// instrumentos
// ======================================================
const out = (node, gain, rev = 0) => {
    const g = ctx.createGain(); g.gain.value = gain;
    node.connect(g); g.connect(comp);
    if(rev){ const s = ctx.createGain(); s.gain.value = rev; g.connect(s); s.connect(verbSend); }
    return g;
};

const kick = (t) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + .12);
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(.001, t + .42);
    o.connect(g); out(g, .95);
    o.start(t); o.stop(t + .45);
};

const noise = (t, dur, type, freq, gain, rev = 0, q = 1) => {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(.001, t + dur);
    s.connect(f); f.connect(g); out(g, 1, rev);
    s.start(t, Math.random() * .5); s.stop(t + dur + .02);
};
const hat    = (t, open) => noise(t, open ? .18 : .05, "highpass", 8000, open ? .22 : .16);
const shaker = (t, acc)  => noise(t, .07, "bandpass", 6500, acc ? .1 : .055, 0, .8);
const clap   = (t) => { [0, .012, .024].forEach(d => noise(t + d, .14, "bandpass", 1500, .32, .5, .7)); };

const conga = (t, hi) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    const f = hi ? 330 : 220;
    o.type = "sine";
    o.frequency.setValueAtTime(f * 1.35, t);
    o.frequency.exponentialRampToValueAtTime(f, t + .04);
    g.gain.setValueAtTime(.5, t);
    g.gain.exponentialRampToValueAtTime(.001, t + .22);
    o.connect(g); out(g, .38, .25);
    o.start(t); o.stop(t + .25);
};

const bass = (t, note, dur) => {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "sawtooth"; o2.type = "sine";
    o.frequency.value = N(note); o2.frequency.value = N(note - 12);
    f.type = "lowpass"; f.Q.value = 6;
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(180, t + dur * .8);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.42, t + .01);
    g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(f); o2.connect(g); f.connect(g); out(g, .6);
    o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
};

const pad = (t, notes, dur, open) => {
    const f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = "lowpass"; f.frequency.value = 600 + open * 1600; f.Q.value = .7;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.09, t + dur * .25);
    g.gain.setValueAtTime(.09, t + dur * .8);
    g.gain.linearRampToValueAtTime(0, t + dur);
    f.connect(g); out(g, 1, .7);
    notes.forEach(n => [-6, 6].forEach(det => {
        const o = ctx.createOscillator(); o.type = "sawtooth";
        o.frequency.value = N(n); o.detune.value = det;
        o.connect(f); o.start(t); o.stop(t + dur + .05);
    }));
};

const pluck = (t, note) => {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "triangle"; o.frequency.value = N(note);
    f.type = "lowpass"; f.frequency.value = 2400;
    g.gain.setValueAtTime(.16, t);
    g.gain.exponentialRampToValueAtTime(.001, t + .35);
    o.connect(f); f.connect(g); out(g, 1, .55);
    o.start(t); o.stop(t + .4);
};

// arranjo
// ======================================================
const play16 = (s, t) => {
    const tr = TRACKS[cur];
    const bar = Math.floor(s / 16), pos = s % 16;
    const sec = bar % 32;                     // secções de 32 compassos
    const intro = bar < 8, breakdown = sec >= 24 && sec < 28, outro = bar >= BARS - 8;
    const chordIdx = Math.floor(bar / 2) % 4;
    const stepDur = 60 / tr.bpm / 4;

    if(!breakdown && !(intro && bar < 4) && pos % 4 === 0) kick(t);
    if(!intro && !breakdown && (pos === 4 || pos === 12)) clap(t);
    if(pos % 4 === 2) hat(t, !intro && pos === 14);
    if(bar >= 2) shaker(t, pos % 4 === 2);
    if(bar >= 4 && !outro && [3, 6, 10, 11, 14].includes(pos)) conga(t, pos === 10 || pos === 14);

    if(!intro && !breakdown && !outro){
        const root = tr.bass[chordIdx];
        if(pos === 2 || pos === 10) bass(t, root, stepDur * 2.5);
        if(pos === 7) bass(t, root + 7, stepDur * 1.5);
        if(pos === 14) bass(t, root + 12, stepDur);
    }
    if(pos === 0 && bar % 2 === 0) pad(t, tr.chords[chordIdx], stepDur * 32, breakdown ? 1 : (sec / 32));
    if(!intro && (breakdown || sec >= 8) && [0, 3, 6, 10, 13].includes(pos) && bar % 2 === 1){
        const ch = tr.chords[chordIdx];
        pluck(t, ch[(pos + bar) % ch.length] + 12);
    }
};

// relógio
// ======================================================
const tick = () => {
    const tr = TRACKS[cur];
    const stepDur = 60 / tr.bpm / 4;
    while(nextTime < ctx.currentTime + .15){
        const swing = (step % 2) ? tr.swing * stepDur * 2 : 0;
        play16(step, nextTime + swing);
        nextTime += stepDur;
        step++;
        if(step >= BARS * 16){ go(1); return; }
    }
    lastProgress = progress();
    emit();
};

const startTrack = () => {
    step = 0;
    nextTime = ctx.currentTime + .08;
    startedAt = nextTime;
    clearInterval(timer);
    timer = setInterval(tick, 40);
};

const play = () => {
    init();
    ctx.resume();
    if(!playing){ playing = true; startTrack(); }
    emit();
};
const pause = () => {
    playing = false;
    clearInterval(timer);
    lastProgress = 0;
    if(ctx) ctx.suspend();
    emit();
};
const go = (d) => {
    cur = (cur + d + TRACKS.length) % TRACKS.length;
    lastProgress = 0;
    if(playing){ ctx.suspend().then(() => { startTrack(); ctx.resume(); }); }
    emit();
};
const setVolume = (v) => {
    volume = v;
    if(master) master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, .05);
};
const setMuted = (m) => {
    muted = m;
    if(master) master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, .05);
};

// para quando o separador fica escondido
document.addEventListener("visibilitychange", () => {
    if(!ctx || !playing) return;
    if(document.hidden) ctx.suspend(); else ctx.resume();
});

const playIndex = (i) => {
    cur = (i + TRACKS.length) % TRACKS.length;
    lastProgress = 0;
    if(playing){ ctx.suspend().then(() => { startTrack(); ctx.resume(); }); emit(); }
    else play();
};

window.ArthrMusic = {
    tracks: TRACKS.map(t => ({ name:t.name, bpm:t.bpm })),
    playIndex,
    toggle: () => (playing ? pause() : play()),
    play, pause, next: () => go(1), prev: () => go(-1),
    setVolume, setMuted, state,
    onChange: (f) => { listeners.push(f); f(state()); }
};

})();
