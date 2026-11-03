(function () {
  'use strict';

  var C = window.CONTENT;
  var PUNCT = '，。！？……,.!?';
  var CHIP_MS = 2000;
  var CARD_LINE_MS = 1100;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var params = new URLSearchParams(location.search);
  var state = {
    variant: C.variants[params.get('variant')] ? params.get('variant') : 'A',
    fog: params.get('fog') !== '0',
    run: [],
    i: 0,
    recovered: [],
    dotUntil: {},
    lastWho: null,
    settled: false,
    woke: false,
  };

  var app = document.getElementById('app');
  var scene = document.getElementById('scene');
  var talk = document.getElementById('talk');
  var stage = document.getElementById('stage');

  function buildRun(variant) {
    return C.variants[variant].intro.concat(C.shared).filter(function (s) {
      return !s.only || s.only === variant;
    });
  }

  function isRecovered(h) { return state.recovered.indexOf(h) !== -1; }

  function presentAt(i) {
    var present = [];
    for (var k = 0; k <= i && k < state.run.length; k++) {
      var s = state.run[k];
      (s.enter || []).forEach(function (id) { if (present.indexOf(id) === -1) present.push(id); });
      if (k < i) (s.leave || []).forEach(function (id) { present = present.filter(function (p) { return p !== id; }); });
    }
    return present;
  }

  // Clips from voice/generate.py (audio/manifest.js). A line or word without a clip stays silent.
  var LINE_CLIPS = window.AUDIO || {};
  var WORD_CLIPS = window.AUDIO_WORDS || {};
  var playing = null;
  var blocked = null;

  function play(src) {
    if (playing) playing.pause();
    playing = null;
    blocked = null;
    if (!src) return;
    var a = new Audio(src);
    playing = a;
    var p = a.play();
    if (p && p.catch) p.catch(function () { if (playing === a) blocked = src; });
  }

  function speak(line) { play(LINE_CLIPS[line]); }
  function speakWord(h) { play(WORD_CLIPS[h]); }

  // Autoplay is refused before the first gesture; that gesture replays the refused line,
  // unless it is the continue button, which moves on to a line that can play.
  document.addEventListener('pointerdown', function (e) {
    if (blocked && !(e.target.closest && e.target.closest('[data-testid="continue"]'))) play(blocked);
  }, true);

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var ICON = {
    speaker: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    chevron: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
  };

  // A word token. Tappable tokens are buttons; labels inside other buttons are spans.
  function token(h, tappable) {
    var n = el(tappable ? 'button' : 'span', 'tok', h);
    n.setAttribute('data-hanzi', h);
    n.setAttribute('data-recovered', String(isRecovered(h)));
    if (tappable) {
      n.type = 'button';
      n.setAttribute('data-testid', 'token');
      n.addEventListener('click', function () { showPinyin(n, h); });
    }
    if (state.dotUntil[h] != null && state.i <= state.dotUntil[h]) n.appendChild(el('span', 'dot'));
    return n;
  }

  function showPinyin(n, h) {
    var w = C.words[h];
    var old = n.querySelector('.pinyin-chip');
    if (old) old.remove();
    if (w) {
      var chip = el('span', 'pinyin-chip', w.pinyin);
      n.appendChild(chip);
      setTimeout(function () { chip.remove(); }, CHIP_MS);
    }
    speakWord(h);
  }

  function zhLine(text) {
    var row = el('div', 'zh');
    row.setAttribute('lang', 'zh-CN');
    text.split(' ').filter(Boolean).forEach(function (t) {
      row.appendChild(PUNCT.indexOf(t) !== -1 || t === '……' ? el('span', 'punct', t) : token(t, true));
    });
    return row;
  }

  function speakerName(who) { return (C.cast[who] && C.cast[who].name) || who; }

  function roundButton(kind, label, onClick) {
    var b = el('button', 'round ' + kind);
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.innerHTML = kind === 'replay' ? ICON.speaker : ICON.chevron;
    if (kind === 'continue') b.setAttribute('data-testid', 'continue');
    b.addEventListener('click', onClick);
    return b;
  }

  function controls(replayText) {
    var c = el('div', 'controls');
    if (replayText) c.appendChild(roundButton('replay', '再听一遍', function () { speak(replayText); }));
    c.appendChild(roundButton('continue', '继续', advance));
    return c;
  }

  // A speech block: speaker label, line, optional replay beside it.
  function speech(who, zh, extraCls) {
    var block = el('div', extraCls || '');
    block.appendChild(el('div', 'speaker', speakerName(who)));
    block.appendChild(zhLine(zh));
    return block;
  }

  function recover(words) {
    (words || []).forEach(function (h) {
      if (isRecovered(h)) return;
      state.recovered.push(h);
      state.dotUntil[h] = state.i + 1;
      document.querySelectorAll('.tok[data-hanzi="' + h + '"]').forEach(function (n) {
        n.setAttribute('data-recovered', 'true');
        if (!n.querySelector('.dot')) n.appendChild(el('span', 'dot'));
      });
    });
    updateChrome();
  }

  // Renderers: one per step type. Each fills `talk` for the current step.
  var RENDER = {
    card: function (s) {
      stage.classList.add('carding');
      var card = el('div', 'card');
      card.setAttribute('lang', 'en');
      s.lines.forEach(function (line, k) {
        var p = el('p', '', line);
        p.style.animationDelay = (reducedMotion ? 0 : k * CARD_LINE_MS) + 'ms';
        card.appendChild(p);
      });
      var c = controls(null);
      c.style.animationDelay = (reducedMotion ? 0 : s.lines.length * CARD_LINE_MS) + 'ms';
      card.appendChild(c);
      stage.appendChild(card);
    },

    say: function (s) {
      var panel = el('div', 'panel line-panel');
      panel.appendChild(el('div', 'speaker', speakerName(s.who)));
      if (s.zh) {
        panel.appendChild(zhLine(s.zh));
        panel.appendChild(controls(s.zh));
        speak(s.zh);
      } else {
        var en = el('p', 'en say', '“' + s.en + '”');
        en.setAttribute('lang', 'en');
        en.style.margin = '0';
        panel.appendChild(en);
        panel.appendChild(controls(s.en));
        speak(s.en);
      }
      talk.appendChild(panel);
    },

    think: function (s) {
      var wrap = el('div', 'thought-wrap');
      var p = el('p', 'thought');
      p.setAttribute('lang', 'en');
      p.style.margin = '0';
      s.text.split(/(\{[^}]+\})/).forEach(function (part) {
        var m = /^\{(.+)\}$/.exec(part);
        if (!m) { p.appendChild(document.createTextNode(part)); return; }
        var h = m[1];
        if (isRecovered(h)) p.appendChild(token(h, true));
        else p.appendChild(document.createTextNode(C.words[h] ? C.words[h].gloss : h));
      });
      wrap.appendChild(p);
      wrap.appendChild(controls(null));
      talk.appendChild(wrap);
    },

    request: function (s) {
      var panel = el('div', 'panel line-panel');
      panel.appendChild(el('div', 'speaker', speakerName(s.who)));
      panel.appendChild(zhLine(s.zh));
      var replay = el('div', 'controls');
      replay.appendChild(roundButton('replay', '再听一遍', function () { speak(s.zh); }));
      panel.appendChild(replay);
      talk.appendChild(panel);
      speak(s.zh);

      var trayPanel = el('div', 'panel line-panel');
      var tray = el('div', 'tray');
      var answer = el('div', 'reply-line');
      answer.hidden = true;
      C.items.forEach(function (h) {
        var tile = el('button', 'tile');
        tile.type = 'button';
        tile.setAttribute('data-testid', 'item-' + h);
        tile.setAttribute('aria-label', h);
        var art = el('span', 'art');
        art.setAttribute('aria-hidden', 'true');
        if (window.ART && window.ART.item && window.ART.item[h]) art.innerHTML = window.ART.item[h];
        else art.appendChild(el('span', 'art-ph'));
        tile.appendChild(art);
        tile.appendChild(token(h, false));
        tile.addEventListener('click', function () { giveItem(s, h, tile, tray, answer, trayPanel); });
        tray.appendChild(tile);
      });
      trayPanel.appendChild(tray);
      trayPanel.appendChild(answer);
      talk.appendChild(trayPanel);
    },

    reply: function (s) {
      var who = state.lastWho;
      for (var k = state.i - 1; k >= 0; k--) {
        var prev = state.run[k];
        if (prev.type === 'say' && prev.zh) {
          var asked = el('div', 'panel line-panel');
          asked.appendChild(el('div', 'speaker', speakerName(prev.who)));
          asked.appendChild(zhLine(prev.zh));
          asked.appendChild(controls(prev.zh));
          asked.querySelector('[data-testid="continue"]').remove();
          talk.appendChild(asked);
          break;
        }
      }
      var panel = el('div', 'panel line-panel');
      var chips = el('div', 'chips');
      var answer = el('div', 'reply-line');
      answer.hidden = true;
      s.options.forEach(function (o) {
        var chip = el('button', 'chip');
        chip.type = 'button';
        chip.setAttribute('data-testid', 'reply-' + o.zh);
        chip.setAttribute('lang', 'zh-CN');
        o.zh.split(' ').forEach(function (t) { chip.appendChild(token(t, false)); });
        chip.addEventListener('click', function () {
          if (state.settled) return;
          state.settled = true;
          chips.querySelectorAll('.chip').forEach(function (c) { c.disabled = true; });
          chip.classList.add('chosen');
          speak(o.zh);
          recover(o.recover);
          setTimeout(function () {
            answer.hidden = false;
            answer.appendChild(speech(who, o.answerZh));
            answer.appendChild(controls(o.answerZh));
            speak(o.answerZh);
            focusContinue();
          }, reducedMotion ? 0 : 500);
        });
        chips.appendChild(chip);
      });
      panel.appendChild(chips);
      panel.appendChild(answer);
      talk.appendChild(panel);
    },

    end: function () {
      var panel = el('div', 'panel end');
      panel.setAttribute('data-testid', 'end-card');
      var h = el('h2', '', '第一天 · 早安小馆');
      h.setAttribute('lang', 'zh-CN');
      panel.appendChild(h);
      panel.appendChild(el('div', 'rule'));
      var words = el('div', 'zh');
      words.setAttribute('lang', 'zh-CN');
      words.style.columnGap = '16px';
      state.recovered.forEach(function (w) { words.appendChild(token(w, true)); });
      panel.appendChild(words);
      talk.appendChild(panel);
    },
  };

  function giveItem(s, h, tile, tray, answer, trayPanel) {
    if (state.settled) return;
    answer.hidden = false;
    answer.innerHTML = '';
    if (h === s.want) {
      state.settled = true;
      answer.classList.remove('wrong');
      tile.classList.add('given');
      tray.querySelectorAll('.tile').forEach(function (t) { t.disabled = true; });
      recover(s.recover);
      answer.appendChild(speech(s.who, s.okZh));
      answer.appendChild(controls(s.okZh));
      speak(s.okZh);
      focusContinue();
    } else {
      answer.classList.add('wrong');
      tile.classList.remove('puzzled');
      void tile.offsetWidth;
      tile.classList.add('puzzled');
      answer.appendChild(speech(s.who, s.wrongZh));
      speak(s.wrongZh);
    }
  }

  var keyboardUser = false;
  document.addEventListener('keydown', function () { keyboardUser = true; }, true);
  document.addEventListener('pointerdown', function () { keyboardUser = false; }, true);

  function focusContinue() {
    if (!keyboardUser) return;
    var b = document.querySelector('[data-testid="continue"]');
    if (b) b.focus({ preventScroll: true });
  }

  function renderScene() {
    var present = presentAt(state.i);
    var room = el('div', 'room');
    if (window.ART && typeof window.ART.room === 'function') {
      room.innerHTML = window.ART.room(present);
    } else {
      room.className = 'room placeholder-room';
      present.forEach(function (id) { room.appendChild(el('span', 'who', speakerName(id))); });
    }
    // Swap only the room: re-inserting the wake overlay would restart its fade.
    var oldRoom = scene.querySelector('.room');
    if (oldRoom) scene.replaceChild(room, oldRoom);
    else scene.appendChild(room);
    if (!scene.querySelector('.wake')) scene.appendChild(el('div', 'wake'));
  }

  function startWake() {
    if (state.woke) return;
    state.woke = true;
    if (reducedMotion) return;
    var w = scene.querySelector('.wake');
    w.classList.remove('run');
    void w.offsetWidth;
    w.classList.add('run');
  }

  function updateChrome() {
    app.classList.toggle('fog', state.fog);
    var fogBtn = document.getElementById('fog-toggle');
    fogBtn.setAttribute('aria-pressed', String(state.fog));
    fogBtn.textContent = state.fog ? 'Fog on' : 'Fog off';
    document.getElementById('memory-count').textContent = String(state.recovered.length);
    document.getElementById('variant-name').textContent = C.variants[state.variant].label;
    document.querySelectorAll('[data-variant]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-variant') === state.variant));
    });
  }

  function current() { return state.run[state.i]; }

  function render() {
    var s = current();
    app.setAttribute('data-step-index', String(state.i));
    app.setAttribute('data-step-type', s.type);
    talk.innerHTML = '';
    stage.classList.remove('carding');
    var oldCard = stage.querySelector('.card');
    if (oldCard) oldCard.remove();
    state.settled = false;
    play(null);
    renderScene();
    if (s.type !== 'card') startWake();
    RENDER[s.type](s);
    if (s.who) state.lastWho = s.who;
    updateChrome();
    if (s.type !== 'request' && s.type !== 'reply') focusContinue();
  }

  function advance() {
    var s = current();
    if (s.type === 'end') return;
    if (s.type !== 'request') recover(s.recover);
    state.i += 1;
    render();
  }

  function restart() {
    state.run = buildRun(state.variant);
    state.i = 0;
    state.recovered = [];
    state.dotUntil = {};
    state.lastWho = null;
    state.woke = false;
    var w = scene.querySelector('.wake');
    if (w) w.classList.remove('run');
    try {
      var url = new URL(location.href);
      url.searchParams.set('variant', state.variant);
      url.searchParams.set('fog', state.fog ? '1' : '0');
      history.replaceState(null, '', url.toString());
    } catch (e) { /* file:// may refuse; the URL is a convenience only */ }
    render();
  }

  document.querySelectorAll('[data-variant]').forEach(function (b) {
    b.addEventListener('click', function () { state.variant = b.getAttribute('data-variant'); restart(); });
  });
  document.getElementById('fog-toggle').addEventListener('click', function () {
    state.fog = !state.fog;
    updateChrome();
    try {
      var url = new URL(location.href);
      url.searchParams.set('fog', state.fog ? '1' : '0');
      history.replaceState(null, '', url.toString());
    } catch (e) { /* see restart */ }
  });
  document.getElementById('restart').addEventListener('click', restart);

  window.__SPIKE__ = {
    state: function () {
      var s = current();
      return {
        variant: state.variant,
        stepIndex: state.i,
        type: s.type,
        recovered: state.recovered.slice(),
        done: s.type === 'end',
      };
    },
  };

  restart();
})();
