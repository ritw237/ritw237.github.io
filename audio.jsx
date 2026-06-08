// audio.jsx — procedural ambient + fire crackle via Web Audio API.
// Also supports loading a user-supplied music file (e.g. the user's
// own copy of the Deus Ex: MD soundtrack) since I can't ship copyrighted music.

const { useState, useEffect, useRef } = React;

function useAudioEngine() {
  const ctxRef        = useRef(null);
  const masterRef     = useRef(null);
  const padGainRef    = useRef(null);
  const fireGainRef   = useRef(null);
  const musicGainRef  = useRef(null);
  const padNodesRef   = useRef([]);
  const fireTimerRef  = useRef(null);
  const musicElRef    = useRef(null);
  const startedRef    = useRef(false);

  function ensure() {
    if (ctxRef.current) return ctxRef.current;
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(ctx.destination);
    masterRef.current = master;

    const padG = ctx.createGain(); padG.gain.value = 0.0; padG.connect(master); padGainRef.current = padG;
    const fireG = ctx.createGain(); fireG.gain.value = 0.0; fireG.connect(master); fireGainRef.current = fireG;
    const musicG = ctx.createGain(); musicG.gain.value = 0.0; musicG.connect(master); musicGainRef.current = musicG;

    return ctx;
  }

  /* ── Ambient pad ──
     Two detuned saws through a slow lowpass sweep + a sub sine,
     soft chord (i — vi — III) cycling slowly. Industrial-noir mood. */
  function startPad() {
    const ctx = ensure();
    if (padNodesRef.current.length) return;

    // pad master filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    filter.Q.value = 6;
    filter.connect(padGainRef.current);

    // very slow LFO on filter cutoff
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 180;
    lfo.connect(lfoG); lfoG.connect(filter.frequency);
    lfo.start();

    // chord notes — Bb minor-ish (Bb1, F2, Ab2)
    const baseFreqs = [58.27, 87.31, 103.83];
    const oscillators = [];
    baseFreqs.forEach((f, i) => {
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      o1.type = "sawtooth"; o2.type = "sawtooth";
      o1.frequency.value = f;
      o2.frequency.value = f * (1 + (Math.random() * 0.005 + 0.003));
      const g = ctx.createGain();
      g.gain.value = (i === 0 ? 0.22 : 0.14);
      o1.connect(g); o2.connect(g); g.connect(filter);
      o1.start(); o2.start();
      oscillators.push(o1, o2);
    });

    // sub
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 29.13;
    const subG = ctx.createGain();
    subG.gain.value = 0.32;
    sub.connect(subG); subG.connect(padGainRef.current);
    sub.start();
    oscillators.push(sub);

    // distant filtered noise wind
    const wind = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    wind.buffer = buf;
    wind.loop = true;
    const windF = ctx.createBiquadFilter();
    windF.type = "bandpass";
    windF.frequency.value = 220;
    windF.Q.value = 2;
    const windG = ctx.createGain();
    windG.gain.value = 0.18;
    wind.connect(windF); windF.connect(windG); windG.connect(padGainRef.current);
    wind.start();

    // sparse industrial pulse — a single low hit every ~12s
    function pulse() {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = 55;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
      o.connect(g); g.connect(padGainRef.current);
      o.start();
      o.stop(ctx.currentTime + 1.7);
      const next = 9 + Math.random() * 8;
      padNodesRef.current.pulseTimer = setTimeout(pulse, next * 1000);
    }
    padNodesRef.current.pulseTimer = setTimeout(pulse, 4000);

    padNodesRef.current = { oscillators, lfo, wind, pulseTimer: padNodesRef.current.pulseTimer };
    padGainRef.current.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 2.5);
  }
  function stopPad() {
    if (!padNodesRef.current || !padNodesRef.current.oscillators) return;
    const ctx = ctxRef.current;
    padGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
    padGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    setTimeout(() => {
      padNodesRef.current.oscillators.forEach(o => { try { o.stop(); } catch (e) {} });
      try { padNodesRef.current.lfo.stop(); } catch (e) {}
      try { padNodesRef.current.wind.stop(); } catch (e) {}
      clearTimeout(padNodesRef.current.pulseTimer);
      padNodesRef.current = [];
    }, 900);
  }

  /* ── Fire crackle ── (v2)
     Layered, organic, no longer "white-noise-burst" artificial.
     - low rumble bed (sub bass with slow tremolo) = the breathing of the fire
     - mid noise bed (heavy lowpass) = the steady combustion hush
     - frequent tiny tics (very short, high-mid bandpass, small) = ember settling
     - occasional medium pops (band-passed noise burst with longer body) = wood snap
     - rare big crackles (cluster of pops + low-mid thump) = log shifting
     All amplitudes randomised; intervals follow a Poisson-ish distribution.
  */
  function startFire() {
    const ctx = ensure();
    if (fireTimerRef.current) return;
    const out = fireGainRef.current;
    const refs = { timers: [] };

    /* ── steady beds ── */

    // 1) low rumble — slow tremolo'd brown noise around 60-160 Hz
    const lowBed = makeNoiseBuffer(ctx, 6);
    const lowSrc = ctx.createBufferSource();
    lowSrc.buffer = lowBed; lowSrc.loop = true;
    const lowF = ctx.createBiquadFilter();
    lowF.type = "lowpass"; lowF.frequency.value = 180; lowF.Q.value = 0.7;
    const lowG = ctx.createGain(); lowG.gain.value = 0.12;
    // slow tremolo: LFO modulating gain
    const lowLFO = ctx.createOscillator(); lowLFO.frequency.value = 0.35;
    const lowLFOAmp = ctx.createGain(); lowLFOAmp.gain.value = 0.05;
    lowLFO.connect(lowLFOAmp); lowLFOAmp.connect(lowG.gain);
    lowSrc.connect(lowF); lowF.connect(lowG); lowG.connect(out);
    lowSrc.start(); lowLFO.start();
    refs.lowSrc = lowSrc; refs.lowLFO = lowLFO;

    // 2) mid combustion hush — band-limited noise around 300-1200 Hz
    const midBed = makeNoiseBuffer(ctx, 6);
    const midSrc = ctx.createBufferSource();
    midSrc.buffer = midBed; midSrc.loop = true;
    const midF1 = ctx.createBiquadFilter();
    midF1.type = "lowpass"; midF1.frequency.value = 1200;
    const midF2 = ctx.createBiquadFilter();
    midF2.type = "highpass"; midF2.frequency.value = 250;
    const midG = ctx.createGain(); midG.gain.value = 0.05;
    // gentle 0.6 Hz amplitude wobble
    const midLFO = ctx.createOscillator(); midLFO.frequency.value = 0.6;
    const midLFOAmp = ctx.createGain(); midLFOAmp.gain.value = 0.022;
    midLFO.connect(midLFOAmp); midLFOAmp.connect(midG.gain);
    midSrc.connect(midF1); midF1.connect(midF2); midF2.connect(midG); midG.connect(out);
    midSrc.start(); midLFO.start();
    refs.midSrc = midSrc; refs.midLFO = midLFO;

    /* ── transients (pops, tics, snaps) ── */

    // small tic — ember settling. Very short, high-mid, soft.
    function tic() {
      const dur = 0.018 + Math.random() * 0.025;
      const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        // strong exponential decay
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4);
      }
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 1800 + Math.random() * 2800;
      f.Q.value = 1.6 + Math.random() * 1.4;
      const g = ctx.createGain(); g.gain.value = 0.04 + Math.random() * 0.10;
      src.connect(f); f.connect(g); g.connect(out);
      src.start();
    }

    // medium pop — wood snap. Has a low-end thump + bright pop.
    function pop() {
      // bright pop layer
      const dur = 0.07 + Math.random() * 0.10;
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const env = Math.pow(1 - i / d.length, 2.6);
        d[i] = (Math.random() * 2 - 1) * env;
      }
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 900 + Math.random() * 1800;
      f.Q.value = 1.0 + Math.random() * 1.6;
      const g = ctx.createGain(); g.gain.value = 0.10 + Math.random() * 0.16;
      src.connect(f); f.connect(g); g.connect(out);
      src.start();

      // low-end thump using a quick sine pluck (gives the pop body)
      const o = ctx.createOscillator();
      o.type = "sine";
      const baseHz = 90 + Math.random() * 60;
      o.frequency.setValueAtTime(baseHz * 1.6, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(baseHz * 0.7, ctx.currentTime + 0.12);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0, ctx.currentTime);
      og.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.003);
      og.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      o.connect(og); og.connect(out);
      o.start(); o.stop(ctx.currentTime + 0.22);
    }

    // big crackle — a flurry of 3-6 pops + lower rumble. Rare.
    function crackle() {
      const burstCount = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < burstCount; i++) {
        refs.timers.push(setTimeout(pop, i * (40 + Math.random() * 90)));
        refs.timers.push(setTimeout(tic, i * (30 + Math.random() * 80) + 20));
      }
      // low rumble bump
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(70, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      o.connect(g); g.connect(out);
      o.start(); o.stop(ctx.currentTime + 0.7);
    }

    /* ── schedulers ── */

    function scheduleTics() {
      tic();
      if (Math.random() < 0.30) tic();  // sometimes a quick pair
      const wait = 0.08 + Math.random() * 0.55;
      refs.timers.push(setTimeout(scheduleTics, wait * 1000));
    }
    function schedulePops() {
      pop();
      const wait = 1.5 + Math.random() * 4.0;
      refs.timers.push(setTimeout(schedulePops, wait * 1000));
    }
    function scheduleCrackles() {
      crackle();
      const wait = 10 + Math.random() * 18;
      refs.timers.push(setTimeout(scheduleCrackles, wait * 1000));
    }

    refs.timers.push(setTimeout(scheduleTics,    300));
    refs.timers.push(setTimeout(schedulePops,    900));
    refs.timers.push(setTimeout(scheduleCrackles, 4000));

    fireTimerRef.current = refs;
    out.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.4);
  }
  function stopFire() {
    if (!fireTimerRef.current) return;
    const ctx = ctxRef.current;
    fireGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
    fireGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    const refs = fireTimerRef.current;
    setTimeout(() => {
      try { refs.lowSrc.stop(); } catch (e) {}
      try { refs.midSrc.stop(); } catch (e) {}
      try { refs.lowLFO.stop(); } catch (e) {}
      try { refs.midLFO.stop(); } catch (e) {}
      (refs.timers || []).forEach(clearTimeout);
      fireTimerRef.current = null;
    }, 600);
  }

  /* helper — brown noise buffer */
  function makeNoiseBuffer(ctx, seconds) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 2.4;
    }
    return buf;
  }

  /* ── User-supplied music track ── */
  function loadMusic(file) {
    ensure();
    if (musicElRef.current) {
      musicElRef.current.pause();
      URL.revokeObjectURL(musicElRef.current.src);
    }
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.loop = true;
    audio.crossOrigin = "anonymous";
    const src = ctxRef.current.createMediaElementSource(audio);
    src.connect(musicGainRef.current);
    musicElRef.current = audio;
    audio.play().catch(() => {});
    musicGainRef.current.gain.linearRampToValueAtTime(0.5, ctxRef.current.currentTime + 2);
  }
  function toggleMusic(on) {
    if (!musicElRef.current) return;
    if (on) musicElRef.current.play().catch(() => {});
    else    musicElRef.current.pause();
  }

  function setVolume(v) {
    if (!masterRef.current) ensure();
    masterRef.current.gain.value = v;
  }

  function resume() {
    ensure();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    startedRef.current = true;
  }

  return { resume, startPad, stopPad, startFire, stopFire, loadMusic, toggleMusic, setVolume,
           isStarted: () => startedRef.current,
           hasMusic: () => !!musicElRef.current };
}

function AudioPanel() {
  const engine = useAudioEngine();
  const [enabled, setEnabled]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [volume, setVolumeS]    = useState(0.6);
  const [padOn, setPadOn]       = useState(true);
  const [fireOn, setFireOn]     = useState(true);
  const [musicOn, setMusicOn]   = useState(false);
  const [hasMusic, setHasMusic] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Refs to read latest state inside the one-shot first-interaction listener
  const enabledRef = useRef(enabled); enabledRef.current = enabled;
  const padRef     = useRef(padOn);   padRef.current = padOn;
  const fireRef    = useRef(fireOn);  fireRef.current = fireOn;
  const volRef     = useRef(volume);  volRef.current = volume;

  // Auto-start on first interaction (browsers require it)
  useEffect(() => {
    function handler() {
      if (enabledRef.current) return;
      engine.resume();
      engine.setVolume(volRef.current);
      if (padRef.current)  engine.startPad();
      if (fireRef.current) engine.startFire();
      setEnabled(true);
      setShowHint(false);
    }
    window.addEventListener("click", handler, { once: false });
    window.addEventListener("keydown", handler, { once: false });
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [engine]);

  function togglePad(v)  { setPadOn(v);  if (enabledRef.current) v ? engine.startPad()  : engine.stopPad(); }
  function toggleFire(v) { setFireOn(v); if (enabledRef.current) v ? engine.startFire() : engine.stopFire(); }
  function onVolume(v)   { setVolumeS(v); if (enabledRef.current) engine.setVolume(v); }
  function toggleMusicOn(v) { setMusicOn(v); if (enabledRef.current) engine.toggleMusic(v); }
  function loadFile(file) {
    if (!enabledRef.current) {
      engine.resume();
      engine.setVolume(volRef.current);
      if (padRef.current)  engine.startPad();
      if (fireRef.current) engine.startFire();
      setEnabled(true);
    }
    engine.loadMusic(file);
    setHasMusic(true);
    setMusicOn(true);
    setShowHint(false);
  }

  return (
    <React.Fragment>
      {/* small dock icon — bottom-right corner above the strip */}
      <button className={"audio-dock" + (enabled ? " is-live" : "")}
              onClick={() => setOpen(o => !o)}
              title="Audio">
        <span className="bars">
          <span /><span /><span /><span />
        </span>
        <span className="lbl">{enabled ? "AUDIO" : "MUTE"}</span>
      </button>

      {showHint && !enabled && (
        <div className="audio-hint">
          CLICK ANYWHERE TO ENABLE AMBIENT AUDIO
        </div>
      )}

      <div className={"audio-panel" + (open ? " is-open" : "")}>
        <div className="audio-h">
          <span>AUDIO // AMBIENT</span>
          <span className="x" onClick={() => setOpen(false)}>×</span>
        </div>
        <div className="audio-body">
          <div className="audio-row">
            <span className="k">MASTER VOLUME</span>
            <span className="v">{Math.round(volume * 100)}</span>
          </div>
          <input type="range" className="audio-slider" min="0" max="1" step="0.01"
                 value={volume} onChange={e => onVolume(Number(e.target.value))} />

          <div className="audio-toggle" onClick={() => togglePad(!padOn)}>
            <span className={"box" + (padOn ? " on" : "")} />
            <span className="lbl"><b>AMBIENT PAD</b> <small>synth drone</small></span>
          </div>
          <div className="audio-toggle" onClick={() => toggleFire(!fireOn)}>
            <span className={"box" + (fireOn ? " on" : "")} />
            <span className="lbl"><b>FIREPLACE</b> <small>crackling fire</small></span>
          </div>
          <div className="audio-toggle" onClick={() => toggleMusicOn(!musicOn)}
               style={{ opacity: hasMusic ? 1 : 0.4, pointerEvents: hasMusic ? "auto" : "none" }}>
            <span className={"box" + (musicOn ? " on" : "")} />
            <span className="lbl"><b>CUSTOM TRACK</b> <small>{hasMusic ? "loaded" : "load below"}</small></span>
          </div>

          <div className="audio-divider" />

          <label className="audio-file">
            <input type="file" accept="audio/*"
                   onChange={e => e.target.files[0] && loadFile(e.target.files[0])} />
            <span>LOAD YOUR OWN TRACK</span>
            <small>drop in a soundtrack file<br/>(plays from your machine, never uploaded)</small>
          </label>

          <div className="audio-note">
            i can't ship copyrighted music. the ambient pad is a deus-ex-style synthesized drone. drop in your own copy of any soundtrack to play it alongside.
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

window.AudioPanel = AudioPanel;
