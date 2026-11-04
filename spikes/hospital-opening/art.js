// Throwaway spike art: window.ART, SVG strings only. No text inside any SVG.
(function () {
  var S = 32, OX = 336, OY = 140;
  var uid = 0;

  var C = {
    bg: '#e8dfcf', ink: '#2b2622', inkSoft: '#4a4038',
    wallL: '#f3ebdd', wallR: '#ebe1d0', dadoL: '#b9cbbd', dadoR: '#a9bdae',
    rail: '#8a5f3d', cap: '#7a5236', capEnd: '#5e3f29', capSide: '#6a4630',
    tileA: '#efe6d6', tileB: '#e5d9c5', slabL: '#8f6342', slabR: '#74502f',
    wood: '#a0714a', woodTop: '#b5865c', woodDark: '#7a5236',
    metal: '#cfc8bc', metalDark: '#a99f92', metalTop: '#ddd7cc',
    sheet: '#f8f3e9', sheetSide: '#e6ddcd', sheetSide2: '#d9cfbd',
    jade: '#6f9a86', jadeTop: '#86ae9b', jadeDark: '#5a8270', jadeDeep: '#4d7262',
    steam: '#fffaf0', cool: '#9eafbc', glow: '#ffd492',
    curtain: '#c3d3ca', curtainDark: '#a9bfb3',
    skin: '#ecc9a5', skinDark: '#d6aa84', blush: '#e8a48c'
  };

  function P(x, y, z) {
    return [Math.round(OX + (x - y) * S), Math.round(OY + (x + y) * S / 2 - (z || 0) * S)];
  }
  function pts(list) {
    return list.map(function (p) { var q = P(p[0], p[1], p[2]); return q[0] + ',' + q[1]; }).join(' ');
  }
  function poly(list, fill, extra) {
    return '<polygon points="' + pts(list) + '" fill="' + fill + '"' + (extra || '') + '/>';
  }
  function line(a, b, stroke, w, extra) {
    var p = P(a[0], a[1], a[2]), q = P(b[0], b[1], b[2]);
    return '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke="' + stroke + '" stroke-width="' + w + '"' + (extra || '') + '/>';
  }
  // Visible faces of an axis-aligned box: top, +y (front-left), +x (front-right).
  function box(x, y, z, w, d, h, c) {
    return poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], c[0]) +
      poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], c[1]) +
      poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], c[2]);
  }
  function onR(x1, x2, z1, z2, fill, extra, y) {
    y = y || 0;
    return poly([[x1, y, z1], [x2, y, z1], [x2, y, z2], [x1, y, z2]], fill, extra);
  }
  function onL(y1, y2, z1, z2, fill, extra, x) {
    x = x || 0;
    return poly([[x, y1, z1], [x, y2, z1], [x, y2, z2], [x, y1, z2]], fill, extra);
  }
  function at(x, y, z, inner) {
    var p = P(x, y, z);
    return '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' + inner + '</g>';
  }
  function r(x, y, w, h, f, rx, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + f + '"' +
      (rx ? ' rx="' + rx + '"' : '') + (extra || '') + '/>';
  }
  function circ(cx, cy, rad, f, extra) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + rad + '" fill="' + f + '"' + (extra || '') + '/>';
  }

  // ---------- the room shell ----------

  function shell(id) {
    var s = '';
    s += r(0, 0, 800, 450, C.bg);
    s += '<ellipse cx="400" cy="420" rx="330" ry="26" fill="#3a2a1a" opacity=".08"/>';
    // Floor slab and walls as extruded boxes so their cut edges read like a diorama.
    s += box(0, 0, -0.38, 11, 7, 0.38, [C.tileA, C.slabL, C.slabR]);
    s += box(-0.3, -0.3, -0.38, 0.3, 7.3, 4.38, [C.cap, C.capEnd, C.wallL]);
    s += box(0, -0.3, -0.38, 11, 0.3, 4.38, [C.cap, C.wallR, C.capSide]);
    for (var i = 0; i < 11; i++) {
      for (var j = 0; j < 7; j++) {
        s += poly([[i, j, 0], [i + 1, j, 0], [i + 1, j + 1, 0], [i, j + 1, 0]], (i + j) % 2 ? C.tileB : C.tileA);
      }
    }
    // Dado (the pale jade lower wall paint of an old hospital) with a tea-wood rail.
    s += onL(0, 7, 0, 1.4, C.dadoL);
    s += onR(0, 11, 0, 1.4, C.dadoR);
    s += onL(0, 7, 1.4, 1.55, C.rail);
    s += onR(0, 11, 1.4, 1.55, C.rail);
    s += onL(0, 7, 0, 0.15, '#8fa596');
    s += onR(0, 11, 0, 0.15, '#869c8d');
    // Faint paper texture on the upper wall.
    for (var k = 1; k < 11; k++) s += line([k, 0, 1.55], [k, 0, 4], '#d9cdb8', 1, ' opacity=".5"');
    for (var m = 1; m < 7; m++) s += line([0, m, 1.55], [0, m, 4], '#e2d7c3', 1, ' opacity=".5"');
    s += windowArt(id);
    s += leftWallArt();
    s += curtains();
    s += monitor();
    return s;
  }

  function windowArt(id) {
    var s = '', x1 = 3.9, x2 = 6.4, z1 = 1.75, z2 = 3.6, g = 0.12;
    s += '<defs><linearGradient id="sky' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#b9c8d2"/><stop offset=".55" stop-color="' + C.cool + '"/>' +
      '<stop offset="1" stop-color="#efe2c8"/></linearGradient>' +
      '<clipPath id="glass' + id + '"><polygon points="' + pts([[x1 + g, 0, z1 + g], [x2 - g, 0, z1 + g], [x2 - g, 0, z2 - g], [x1 + g, 0, z2 - g]]) + '"/></clipPath>' +
      '<radialGradient id="sun' + id + '"><stop offset="0" stop-color="' + C.glow + '" stop-opacity=".95"/>' +
      '<stop offset="1" stop-color="' + C.glow + '" stop-opacity="0"/></radialGradient></defs>';
    s += onR(x1 - 0.08, x2 + 0.08, z1 - 0.08, z2 + 0.08, C.woodDark);
    s += onR(x1, x2, z1, z2, C.wood);
    s += '<g clip-path="url(#glass' + id + ')">';
    s += onR(x1, x2, z1, z2, 'url(#sky' + id + ')');
    var sp = P(5.6, 0, 2.6);
    s += '<circle cx="' + sp[0] + '" cy="' + sp[1] + '" r="34" fill="url(#sun' + id + ')"/>';
    s += circ(sp[0], sp[1], 7, '#fff3d6');
    // Distant rooftops in the cold morning.
    s += poly([[3.9, 0, 1.75], [3.9, 0, 2.35], [4.3, 0, 2.35], [4.3, 0, 2.6], [4.8, 0, 2.6], [4.8, 0, 2.2],
      [5.2, 0, 2.2], [5.2, 0, 2.45], [5.5, 0, 2.45], [5.5, 0, 2.1], [6.0, 0, 2.1], [6.0, 0, 2.5], [6.4, 0, 2.5], [6.4, 0, 1.75]], '#c3ccd0');
    s += poly([[3.9, 0, 1.75], [3.9, 0, 2.05], [4.6, 0, 2.05], [4.6, 0, 2.2], [5.4, 0, 2.2], [5.4, 0, 1.95], [6.4, 0, 1.95], [6.4, 0, 1.75]], '#d6d8d2');
    s += '</g>';
    s += line([5.15, 0, z1], [5.15, 0, z2], C.wood, 4);
    s += line([x1, 0, 2.7], [x2, 0, 2.7], C.wood, 3);
    s += box(x1 - 0.15, 0, z1 - 0.12, x2 - x1 + 0.3, 0.28, 0.1, [C.woodTop, C.wood, C.woodDark]);
    // Little sprout on the sill.
    s += box(5.75, 0.05, z1 - 0.02, 0.22, 0.18, 0.2, ['#c98f68', '#b07655', '#93613f']);
    s += at(5.86, 0.14, z1 + 0.18, r(-1, -10, 2, 10, C.jadeDark) + r(-6, -12, 6, 4, C.jade, 2) + r(0, -15, 6, 4, C.jadeTop, 2));
    return s;
  }

  function leftWallArt() {
    var s = '';
    // Framed landscape: jade hills under a pale sky.
    s += onL(0.9, 2.4, 2.25, 3.25, C.woodDark);
    s += onL(1.0, 2.3, 2.33, 3.17, '#f6efe1');
    s += poly([[0, 1.0, 2.33], [0, 1.0, 2.6], [0, 1.4, 2.85], [0, 1.75, 2.6], [0, 2.05, 2.8], [0, 2.3, 2.6], [0, 2.3, 2.33]], C.jade);
    s += poly([[0, 1.0, 2.33], [0, 1.0, 2.45], [0, 1.6, 2.6], [0, 2.3, 2.42], [0, 2.3, 2.33]], C.jadeDark);
    // Clock with no numerals.
    var cy = 3.35, cz = 3.0, rad = 0.38, ring = [], face = [];
    for (var a = 0; a < 16; a++) {
      var t = a / 16 * Math.PI * 2;
      ring.push([0, cy + Math.cos(t) * rad, cz + Math.sin(t) * rad]);
      face.push([0, cy + Math.cos(t) * rad * 0.8, cz + Math.sin(t) * rad * 0.8]);
    }
    s += poly(ring, C.woodDark) + poly(face, C.steam);
    s += line([0, cy, cz], [0, cy, cz + 0.22], C.ink, 2) + line([0, cy, cz], [0, cy + 0.17, cz - 0.05], C.ink, 2);
    // Door with a small window.
    s += onL(4.5, 6.3, 0, 3.05, C.woodDark);
    s += onL(4.6, 6.2, 0, 2.95, C.wood);
    s += onL(5.0, 5.8, 1.9, 2.6, C.cool);
    s += onL(5.05, 5.75, 2.3, 2.55, '#c4d0d8');
    s += onL(4.75, 6.05, 0.3, 1.5, '#946743');
    var hp = P(0, 4.85, 1.35);
    s += r(hp[0] - 1, hp[1] - 2, 7, 4, '#d8c49a');
    return s;
  }

  function curtains() {
    var s = line([0.3, 0, 3.9], [10.7, 0, 3.9], '#8f8778', 2);
    for (var x = 0.4; x < 10.7; x += 0.55) s += line([x, 0, 3.86], [x, 0, 3.94], '#6f685c', 3);
    function bunch(x0, n) {
      var out = '';
      for (var i = 0; i < n; i++) {
        var a = x0 + i * 0.14;
        out += poly([[a, 0.06, 3.86], [a + 0.15, 0.06, 3.86], [a + 0.15, 0.06, 0.95 + (i % 2) * 0.08], [a, 0.06, 0.9 + (i % 2) * 0.08]], i % 2 ? C.curtainDark : C.curtain);
      }
      return out;
    }
    return s + bunch(3.25, 4) + bunch(6.55, 4);
  }

  function monitor() {
    var s = '';
    s += onR(10.15, 10.35, 1.55, 2.3, '#8f8778');
    s += box(9.75, 0, 2.3, 1.0, 0.32, 0.78, ['#5b605c', '#4a4f4c', '#3c403d']);
    s += poly([[9.83, 0.33, 2.38], [10.67, 0.33, 2.38], [10.67, 0.33, 3.0], [9.83, 0.33, 3.0]], '#26302e');
    var beat = [[9.86, 2.66], [10.05, 2.66], [10.12, 2.62], [10.18, 2.92], [10.24, 2.46], [10.3, 2.7], [10.4, 2.66], [10.64, 2.66]];
    s += '<polyline points="' + pts(beat.map(function (b) { return [b[0], 0.33, b[1]]; })) + '" fill="none" stroke="' + C.glow + '" stroke-width="2" stroke-linejoin="bevel"/>';
    var led = P(10.6, 0.33, 2.9);
    s += r(led[0] - 2, led[1] - 1, 3, 3, C.glow);
    return s;
  }

  // ---------- furniture ----------

  function bed(x, y, opts) {
    var w = 2.4, d = 3.95, s = '';
    s += box(x - 0.06, y - 0.2, 0.25, w + 0.12, 0.16, 1.75, [C.woodTop, C.wood, C.woodDark]);
    s += onR(x + 0.25, x + w - 0.25, 0.9, 1.75, C.woodTop, '', y - 0.04);
    [[x + 0.1, y + 0.1], [x + w - 0.3, y + 0.1], [x + 0.1, y + d - 0.3], [x + w - 0.3, y + d - 0.3]].forEach(function (c) {
      s += box(c[0], c[1], 0, 0.2, 0.2, 0.18, ['#4b4540', '#3b3632', '#2f2b28']);
    });
    s += box(x + 0.05, y + 0.05, 0.18, w - 0.1, d - 0.1, 0.32, [C.metalTop, C.metal, C.metalDark]);
    s += box(x, y, 0.5, w, d, 0.42, [C.sheet, C.sheetSide, C.sheetSide2]);
    s += box(x + 0.3, y + 0.12, 0.92, w - 0.6, 0.9, 0.24, [C.steam, '#eee6d6', '#e2d8c6']);
    s += opts.sitter || '';
    var by = y + opts.blanketFrom;
    s += box(x - 0.07, by, 0.58, w + 0.14, y + d - by + 0.04, 0.52, [C.jadeTop, C.jade, C.jadeDark]);
    if (opts.bump) s += box(x + 0.6, by + 0.3, 1.1, 1.2, y + d - by - 0.9, 0.14, [C.jadeTop, C.jade, C.jadeDark]);
    s += box(x - 0.07, by, 1.1, w + 0.14, 0.32, 0.05, [C.steam, '#efe7d8', '#e3dac9']);
    for (var q = 1; q < 4; q++) s += line([x + q * 0.6, by + 0.5, 1.1], [x + q * 0.6, y + d, 1.1], C.jadeDark, 1, ' opacity=".45"');
    s += opts.after || '';
    s += box(x - 0.06, y + d + 0.04, 0.25, w + 0.12, 0.16, 1.15, [C.woodTop, C.wood, C.woodDark]);
    s += onR(x + 0.25, x + w - 0.25, 0.55, 1.15, '#ad7d53', '', y + d + 0.2);
    return s;
  }

  function sideTable() {
    var s = box(9.7, 0.25, 0, 1.1, 1.0, 1.35, [C.woodTop, C.wood, C.woodDark]);
    s += onR(9.8, 10.7, 0.75, 1.2, '#ad7d53', '', 1.26);
    var k = P(10.25, 1.26, 0.98);
    s += r(k[0] - 2, k[1] - 1, 4, 3, '#e3c99a');
    var cup = P(10.1, 0.7, 1.35);
    s += '<g transform="translate(' + cup[0] + ' ' + cup[1] + ')">' +
      '<ellipse cx="0" cy="0" rx="7" ry="3" fill="#3a2a1a" opacity=".18"/>' +
      r(-6, -14, 12, 14, C.steam, 2) + r(2, -14, 4, 14, '#e9e0cf', 1) +
      r(6, -11, 4, 7, 'none', 2, ' stroke="' + C.steam + '" stroke-width="2"') +
      '<ellipse cx="0" cy="-14" rx="6" ry="2.5" fill="#f4e5c6"/>' +
      '<path d="M-2 -20 q-4 -5 0 -10 q4 -5 0 -10 M4 -20 q-3 -4 0 -8 q3 -4 0 -8" fill="none" stroke="' + C.steam + '" stroke-width="2.5" stroke-linecap="round" opacity=".95"/>' +
      '</g>';
    s += at(10.45, 0.55, 1.35, '<ellipse cx="0" cy="0" rx="7" ry="2.5" fill="#3a2a1a" opacity=".15"/>' + circ(0, -6, 6, '#e8c45a') + circ(-3, -8, 2, '#f3dc8d'));
    return s;
  }

  function dripStand() {
    var x = 6.4, y = 1.4, s = '';
    var base = P(x, y, 0), top = P(x, y, 3.5);
    s += '<ellipse cx="' + base[0] + '" cy="' + (base[1] + 1) + '" rx="16" ry="5" fill="#3a2a1a" opacity=".15"/>';
    s += '<path d="M' + (base[0] - 14) + ' ' + (base[1] - 2) + 'h28 M' + base[0] + ' ' + (base[1] - 6) + 'v8" stroke="#8b8478" stroke-width="3"/>';
    s += r(base[0] - 1, top[1], 3, base[1] - top[1], '#b8b0a3');
    s += r(base[0] - 10, top[1], 21, 3, '#8b8478');
    s += r(base[0] + 3, top[1] + 3, 14, 22, '#eef3f1', 3, ' opacity=".92" stroke="#c5cfcb"');
    s += r(base[0] + 4, top[1] + 12, 12, 12, '#cfe0e3', 2);
    s += r(base[0] + 8, top[1] + 25, 4, 6, '#d5dcda');
    return s;
  }

  function plant(x, y) {
    var p = P(x, y, 0), s = '';
    s += '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' +
      '<ellipse cx="0" cy="0" rx="16" ry="5" fill="#3a2a1a" opacity=".16"/>' +
      r(-11, -20, 22, 20, '#a8714d', 2) + r(4, -20, 7, 20, '#8d5c3c') + r(-13, -24, 26, 5, '#b98260', 1);
    [[-9, -48, -3], [-3, -58, 0], [3, -52, 4], [8, -42, 6], [-1, -40, -6]].forEach(function (l, i) {
      s += '<path d="M' + l[2] + ' -24 L' + l[0] + ' ' + l[1] + ' L' + (l[0] + 5) + ' -24 Z" fill="' + (i % 2 ? C.jadeDark : C.jade) + '"/>';
    });
    return s + '</g>';
  }

  // ---------- people (screen space, origin at the feet) ----------

  function standing(o) {
    var s = '<ellipse cx="0" cy="0" rx="22" ry="7" fill="#3a2a1a" opacity=".17"/>';
    s += r(-10, -40, 8, 36, o.legs) + r(2, -40, 8, 36, o.legs);
    s += r(-12, -6, 11, 6, o.shoes, 1) + r(1, -6, 11, 6, o.shoes, 1);
    s += o.under || '';
    s += r(-16, -77, 32, o.coatLen, o.top, 3);
    s += r(9, -77, 7, o.coatLen, o.topDark, 2, ' opacity=".55"');
    s += r(-22, -74, 7, 34, o.topDark, 3) + r(15, -74, 7, 34, o.topDark, 3);
    s += r(-22, -42, 7, 7, C.skin, 2) + r(15, -42, 7, 7, C.skin, 2);
    s += r(-4, -81, 8, 6, C.skinDark);
    s += o.back || '';
    s += head(-106, o.hair);
    return s + (o.front || '');
  }

  function head(y, hair) {
    return r(-13, y, 26, 27, C.skin, 6) + r(-16, y + 11, 4, 7, C.skin, 2) + r(12, y + 11, 4, 7, C.skin, 2) +
      (hair || '') +
      r(-7, y + 13, 3, 4, C.ink) + r(4, y + 13, 3, 4, C.ink) +
      r(-11, y + 19, 4, 2, C.blush, 0, ' opacity=".75"') + r(7, y + 19, 4, 2, C.blush, 0, ' opacity=".75"');
  }

  function doctor() {
    var hair = r(-14, -109, 28, 10, C.ink, 4) + r(-14, -102, 4, 9, C.ink) + r(10, -102, 4, 7, C.ink) + r(-6, -101, 16, 4, C.ink, 1);
    var glasses = '<g fill="none" stroke="' + C.inkSoft + '" stroke-width="1.5"><rect x="-10" y="-95" width="8" height="7"/><rect x="2" y="-95" width="8" height="7"/><path d="M-2 -92h4"/></g>';
    var front = '<polygon points="-5,-77 5,-77 0,-67" fill="#9eb4c4"/>' +
      '<path d="M-5 -77 L0 -64 L5 -77 M0 -64 V-24" stroke="#d6cfc1" stroke-width="1.5" fill="none"/>' +
      r(-13, -58, 8, 7, '#e3ddd1') + r(-11, -62, 2, 6, '#5b7a8a') +
      '<path d="M-7 -79 L-8 -64 Q-7 -55 0 -54 M7 -79 L8 -64 Q7 -55 0 -54" stroke="#3d3a36" stroke-width="2" fill="none"/>' +
      circ(0, -52, 3.5, '#9a958e', ' stroke="#3d3a36" stroke-width="1.5"') +
      r(15, -52, 15, 19, C.wood, 1) + r(17, -49, 11, 14, C.steam) +
      r(19, -46, 7, 1, '#b7ada0') + r(19, -43, 7, 1, '#b7ada0') + r(19, -40, 5, 1, '#b7ada0') + r(20, -53, 5, 3, '#8b8478') +
      r(15, -42, 7, 7, C.skin, 2) + glasses;
    return standing({ legs: '#4b4a52', shoes: '#2f2a26', top: '#f6f2ea', topDark: '#ddd5c7', coatLen: 55, hair: hair, front: front });
  }

  function nurse() {
    var back = circ(13, -100, 7, C.ink) + r(-15, -100, 30, 22, C.ink, 4);
    var hair = r(-14, -108, 28, 9, C.ink, 4) + r(-14, -101, 4, 14, C.ink) + r(10, -101, 4, 14, C.ink) + r(-12, -101, 10, 4, C.ink, 1) +
      '<polygon points="-10,-108 10,-108 8,-117 -8,-117" fill="' + C.steam + '" stroke="#d9d2c4"/>';
    var front = '<polygon points="-6,-77 6,-77 0,-68" fill="' + C.skinDark + '"/>' +
      r(5, -62, 8, 7, '#93b1c5') + r(7, -66, 2, 6, C.steam) +
      r(-4, -36, 8, 2, '#93b1c5');
    return standing({ legs: '#9ab7ca', shoes: C.steam, top: '#aac5d7', topDark: '#8fadc1', coatLen: 43, hair: hair, back: back, front: front });
  }

  function aunt() {
    var curl = '#3b2f29', hair = r(-14, -108, 28, 10, curl, 4);
    [[-12, -103], [-5, -108], [3, -108], [10, -103], [-14, -96], [14, -96], [-1, -110]].forEach(function (c) { hair += circ(c[0], c[1], 5, curl); });
    var under = r(-5, -77, 10, 46, '#f2e6d0');
    var front = r(-5, -77, 10, 46, '#f2e6d0') +
      r(-8, -70, 3, 3, '#7d5a24') + r(-8, -60, 3, 3, '#7d5a24') + r(-8, -50, 3, 3, '#7d5a24') +
      r(-16, -36, 32, 4, '#a7782f', 1) +
      r(-29, -55, 11, 5, '#3f6a5e', 1) + r(-29, -51, 11, 28, '#5f8f80', 2) + r(-29, -44, 11, 3, '#e9dcc4') +
      r(-21, -51, 3, 28, '#4f7c6e') + r(-22, -48, 7, 7, C.skin, 2) +
      '<path d="M17 -40 Q22 -50 30 -42" stroke="#d9cfc0" stroke-width="2" fill="none"/>' +
      r(13, -42, 28, 22, C.steam, 5, ' opacity=".85" stroke="#d9cfc0"') +
      bun(21, -27) + bun(33, -27) + bun(27, -35) +
      r(15, -44, 7, 7, C.skin, 2);
    return standing({ legs: '#5d4a3d', shoes: '#3b2e27', top: '#c99540', topDark: '#a7782f', coatLen: 47, hair: hair, under: under, front: front });
  }

  function bun(x, y) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="6.5" ry="5.5" fill="#f3e3c2" stroke="#d6bb8f"/>' +
      '<path d="M' + (x - 2) + ' ' + (y - 3) + ' q2 2 4 0" stroke="#c9a77a" fill="none"/>';
  }

  function grandpaSitting() {
    var s = '';
    var stripes = '';
    for (var i = -13; i < 15; i += 7) stripes += r(i, -42, 3, 46, '#9fb2bf');
    s += r(-15, -42, 30, 46, '#e5e9e8', 4) + stripes;
    s += r(-21, -40, 7, 30, '#d7dddd', 3) + r(14, -40, 7, 30, '#d7dddd', 3);
    s += r(-21, -12, 7, 7, C.skin, 2) + r(14, -12, 7, 7, C.skin, 2);
    s += '<polygon points="-7,-42 7,-42 0,-34" fill="' + C.skinDark + '"/>';
    s += r(-4, -46, 8, 5, C.skinDark);
    var y = -72;
    s += r(-13, y, 26, 27, C.skin, 6) + r(-16, y + 11, 4, 7, C.skin, 2) + r(12, y + 11, 4, 7, C.skin, 2);
    s += r(-14, y + 3, 5, 12, '#c9c4bb', 2) + r(9, y + 3, 5, 12, '#c9c4bb', 2) + r(-9, y - 2, 18, 5, '#d8d3ca', 2) + r(-3, y - 4, 6, 3, '#d8d3ca', 1);
    s += r(-10, y + 10, 7, 2, '#ebe7e0') + r(3, y + 10, 7, 2, '#ebe7e0');
    s += r(-7, y + 14, 3, 3, C.ink) + r(4, y + 14, 3, 3, C.ink);
    s += r(-11, y + 18, 4, 2, C.blush, 0, ' opacity=".75"') + r(7, y + 18, 4, 2, C.blush, 0, ' opacity=".75"');
    s += r(-5, y + 20, 10, 3, '#d8d3ca', 1);
    s += r(-12, y + 7, 3, 1, '#c2a88c') + r(9, y + 7, 3, 1, '#c2a88c');
    return s;
  }

  function playerLying() {
    var s = r(-15, -6, 30, 10, '#e5e9e8', 3) + r(-10, -6, 3, 10, '#9fb2bf') + r(-1, -6, 3, 10, '#9fb2bf') + r(8, -6, 3, 10, '#9fb2bf');
    s += r(-12, -27, 24, 23, C.skin, 6);
    s += r(-13, -30, 26, 9, C.ink, 4) + r(-13, -24, 4, 8, C.ink) + r(-4, -23, 10, 3, C.ink, 1);
    s += r(-6, -16, 3, 4, C.ink) + r(4, -16, 3, 4, C.ink);
    s += r(-10, -11, 4, 2, C.blush, 0, ' opacity=".75"') + r(6, -11, 4, 2, C.blush, 0, ' opacity=".75"');
    return s;
  }

  // ---------- composition ----------

  function room(present) {
    present = present || [];
    var has = function (k) { return present.indexOf(k) !== -1; };
    var id = 'hs' + (++uid);
    var s = shell(id);

    // Morning light pooled on the floor under the window.
    s += poly([[4.75, 1.55, 0], [7.2, 1.55, 0], [8.2, 3.5, 0], [5.75, 3.5, 0]], C.glow, ' opacity=".28"');
    s += poly([[4.95, 1.75, 0], [5.9, 1.75, 0], [6.4, 2.55, 0], [5.45, 2.55, 0]], C.steam, ' opacity=".35"');
    s += poly([[6.1, 1.75, 0], [7.0, 1.75, 0], [7.5, 2.55, 0], [6.6, 2.55, 0]], C.steam, ' opacity=".35"');

    s += bed(1.0, 0.35, {
      blanketFrom: 1.5,
      sitter: has('grandpa') ? at(2.2, 1.75, 0.8, grandpaSitting()) : '',
      bump: has('grandpa')
    });
    s += dripStand();
    var tube = P(6.6, 1.4, 3.0), hand = P(7.3, 2.6, 1.12);
    s += bed(7.0, 0.35, {
      blanketFrom: 1.1,
      sitter: at(8.2, 0.9, 1.0, playerLying()),
      bump: true,
      after: '<path d="M' + tube[0] + ' ' + tube[1] + ' C' + (tube[0] + 4) + ' ' + (tube[1] + 60) + ' ' + (hand[0] - 30) + ' ' + (hand[1] + 6) + ' ' + hand[0] + ' ' + hand[1] + '" stroke="#e3ecea" stroke-width="2" fill="none" opacity=".9"/>' +
        at(7.3, 2.6, 1.12, r(-5, -5, 10, 6, '#e5e9e8', 2) + r(4, -5, 6, 6, C.skin, 2))
    });
    s += sideTable();

    // Soft shaft of window light over the furniture.
    s += '<defs><linearGradient id="shaft' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="' + P(5, 0, 3.6)[1] + '" x2="0" y2="' + P(7, 3.5, 0)[1] + '">' +
      '<stop offset="0" stop-color="' + C.steam + '" stop-opacity=".45"/><stop offset="1" stop-color="' + C.glow + '" stop-opacity="0"/></linearGradient></defs>';
    s += poly([[4.0, 0, 3.5], [6.3, 0, 3.5], [8.2, 3.5, 0], [5.75, 3.5, 0], [4.75, 1.55, 0], [4.0, 0, 1.8]], 'url(#shaft' + id + ')', ' shape-rendering="geometricPrecision"');

    // Cast, back to front so nearer figures overlap farther ones.
    var cast = [
      ['aunt', 2.6, 5.6, aunt],
      ['doctor', 7.6, 5.6, doctor],
      ['nurse', 10.45, 4.7, nurse]
    ];
    cast.forEach(function (c) { if (has(c[0])) s += at(c[1], c[2], 0, c[3]()); });
    if (!has('aunt')) s += plant(0.55, 6.4);

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" shape-rendering="crispEdges" role="img" aria-hidden="true">' + s + '</svg>';
  }

  // ---------- tray items, 64x64 ----------
  // Ported from src/FoodArt.tsx (viewBox 64x48), shifted down 9 to centre in 64x64.

  function itemSvg(inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true"><g transform="translate(0 9)">' +
      '<ellipse cx="32" cy="40" rx="25" ry="5" fill="#cfc2ab" opacity=".35"/>' + inner + '</g></svg>';
  }

  var item = {
    '豆浆': itemSvg(
      '<path d="m20 12 3 29h20l3-29" fill="#d7e0d1" stroke="#7e998a" stroke-width="1.5"/>' +
      '<ellipse cx="33" cy="12" rx="13" ry="4" fill="#f4e5c6" stroke="#7e998a" stroke-width="1.5"/>' +
      '<path d="m36 10 6-9" stroke="#8b785e" stroke-width="2"/>'),
    '鸡蛋': itemSvg(
      '<ellipse cx="32" cy="27" rx="20" ry="14" fill="#fff9e9" stroke="#c1ad8e" stroke-width="1.5"/>' +
      '<circle cx="33" cy="25" r="9" fill="#dfb25c"/>' +
      '<path d="M29 20q4-3 8 0" fill="none" stroke="#f5d895" stroke-width="2"/>'),
    '馒头': itemSvg(
      '<path d="M9 32C8 17 19 8 32 8S56 17 55 32Q53 41 32 41T9 32" fill="#ecdbb7" stroke="#ad9272" stroke-width="1.5"/>' +
      '<path d="M16 27q6-13 16-15m0 0q-3 9-1 18m1-18q9 6 13 15" fill="none" stroke="#cbb590" stroke-width="2"/>')
  };

  window.ART = { room: room, item: item };
})();
