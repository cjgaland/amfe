// ============================================================
//  app.js — UI y estado · AMFE
//  Las reglas viven en logic.js (funciones puras) y los textos didácticos y
//  ejemplos en contenido.js. Aquí: datos en localStorage, enrutado por hash,
//  inicio, lista de AMFE, asistente por pasos, ejemplos, Aprende, glosario,
//  vista imprimible y PDF en iOS, copias de seguridad.
//  Base copiada de Auditorías (mismos patrones: data-k, refrescar sin perder
//  el foco, repintar conservando el scroll, borradores, ejemplos en memoria).
// ============================================================
(function () {
  "use strict";
  const L = window.Logica, C = window.Contenido;

  // ---------- Versión y novedades ----------
  // Al publicar cambios: añadir una entrada AL PRINCIPIO de NOVEDADES, poner su versión en los ?v= de index.html, en
  // APP_VERSION y subir CACHE_NAME en sw.js. Formato de versión: AAAA.NN.
  const APP_VERSION = "2026.01";
  const NOVEDADES = [
    { version: "2026.01", fecha: "Octubre 2026", titulo: "Primera versión: describir, analizar y puntuar", cambios: [
      "Asistente en 8 pasos con «Tu siguiente paso» en la portada. En esta versión están disponibles los pasos 1, 2, 4 y 5.",
      "El proceso y sus subprocesos, con su inicio, su fin y quién interviene, y propuesta del objetivo del proceso.",
      "El equipo del AMFE con su papel de cada miembro y las sesiones de trabajo, con avisos si falta coordinación, secretaría o algún estamento.",
      "Los fallos de cada subproceso con su efecto, su causa y los controles actuales. Aviso cuando un fallo está escrito como si fuera una causa o un efecto.",
      "Pegar los fallos desde Excel, Calc o Word.",
      "Puntuación de gravedad, ocurrencia y detección con la escala a la vista, IPR automático, orden por IPR y avisos de las trampas más habituales.",
      "Ejemplo completo del Servicio de Urgencias (49 fallos), Aprende (7 temas), glosario, tabla imprimible y copia de seguridad."] }
  ];
  const ENTREGA = 1;   // pasos ya construidos (ver L.PASOS[].entrega)

  // ---------- Utilidades ----------
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const escMl = s => esc(s).replace(/\n/g, "<br>");
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const view = $("#view");
  const hoy = () => new Date().toISOString();
  const fechaCorta = iso => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString("es-ES"); };
  const fmtFecha = s => /^\d{4}-\d{2}-\d{2}$/.test(s || "") ? s.split("-").reverse().join("/") : (s || "");
  const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const lleno = L.lleno, plural = L.plural;
  const clon = o => JSON.parse(JSON.stringify(o));
  const leer = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const escribir = (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };

  // ---------- Datos (solo en este dispositivo) ----------
  const KEY_DATOS = "amfe-datos";
  let datos = { amfes: [], ultimaCopia: null };
  (function cargar() {
    const crudo = leer(KEY_DATOS); if (!crudo) return;
    try {
      const o = JSON.parse(crudo), s = L.sanearDatos(o, genId, hoy());
      if (s) datos = { amfes: s.amfes, ultimaCopia: typeof o.ultimaCopia === "string" ? o.ultimaCopia : null };
    } catch (e) { /* datos dañados: se empieza de cero sin borrar lo guardado */ }
  })();
  // Los datos del usuario son los únicos que se guardan. Los ejemplos viven aparte, en memoria
  // (ids «ej-…»): se pueden tocar, pero ni se guardan ni se mezclan con los suyos.
  const datosUsuario = datos;
  let datosEjemplo = null, modoEjemplo = false;
  const esIdEjemplo = id => /^ej-/.test(id || "");
  function ejemplos() {
    if (!datosEjemplo) datosEjemplo = { amfes: C.EJEMPLOS.amfes.map(a => L.sanearAmfe(clon(a), genId, hoy())), ultimaCopia: null };
    return datosEjemplo;
  }
  let tGuardar = null, avisoSinEspacio = false;
  function guardar(inmediato) {
    clearTimeout(tGuardar);
    const fn = () => {
      const ok = escribir(KEY_DATOS, JSON.stringify({ app: "amfe", v: L.VERSION_DATOS, ultimaCopia: datosUsuario.ultimaCopia, amfes: datosUsuario.amfes }));
      if (!ok && !avisoSinEspacio) { avisoSinEspacio = true; toast("No se ha podido guardar en este navegador (¿modo privado o sin espacio?). Haz una copia de seguridad.", 6000); }
    };
    if (inmediato) fn(); else tGuardar = setTimeout(fn, 250);
  }
  window.addEventListener("pagehide", () => guardar(true));
  const buscaAmfe = id => datos.amfes.find(x => x.id === id);
  // Un AMFE recién creado no se guarda hasta que se escribe algo
  const borradores = new Map();
  const esVacio = a => !a.fallos.length && !a.subprocesos.length && !a.equipo.length && !a.sesiones.length && !["titulo", "proceso", "unidad", "objetivo", "inicio", "fin", "responsable"].some(k => lleno(a[k]));

  // ---------- Textos de ayuda reutilizables ----------
  const box = (tipo, tag, html) => `<div class="box box--${tipo}"><span class="box-tag">${tag}</span>${html}</div>`;
  const idea = html => box("idea", "Idea clave", `<p>${html}</p>`);
  const trampa = html => box("trampa", "Ojo, trampa", `<p>${html}</p>`);
  const practica = html => box("practica", "En la práctica", `<p>${html}</p>`);
  const KEY_FACIL = "amfe-facil-abierto";
  const facil = (html, titulo = "Explicado fácil") => `<details class="facil" data-recordar="1"${leer(KEY_FACIL) === "1" ? " open" : ""}><summary>${titulo}</summary><div class="facil-body">${html}</div></details>`;
  const avisoHtml = a => a.nivel === "nota" ? `<div class="note">ℹ ${esc(a.texto)}</div>` : a.nivel === "error" ? `<div class="aviso-error">✕ ${esc(a.texto)}</div>` : `<div class="warn">⚠ ${esc(a.texto)}</div>`;

  // ---------- Campos ----------
  // Por defecto se enlazan con data-k (ruta dentro del AMFE en edición). Con o.bind se enlazan de otra forma
  // (subprocesos: data-s; equipo: data-m; sesiones: data-x; fallos: data-fa; siempre con data-f = campo).
  function getPath(o, path) { return path.split(".").reduce((a, k) => (a == null ? undefined : a[k]), o); }
  function setPath(o, path, v) {
    const ks = path.split("."), ult = ks.pop();
    let a = o; ks.forEach(k => { if (a[k] == null || typeof a[k] !== "object") a[k] = {}; a = a[k]; });
    a[ult] = v;
  }
  let nAyuda = 0;
  function ayudaBtn(help) {
    if (!help) return { btn: "", box: "" };
    const id = "h" + (++nAyuda);
    return { btn: `<button type="button" class="info-btn" data-info="${id}" aria-expanded="false" aria-label="Ayuda">i</button>`, box: `<p class="help" id="help-${id}" hidden>${help}</p>` };
  }
  function campo(obj, path, label, o = {}) {
    const v = getPath(obj, path) || "", a = ayudaBtn(o.help);
    const bind = o.bind || `data-k="${path}"`;
    const ctrl = o.area
      ? `<textarea class="txt-in" ${bind} rows="${o.rows || 2}" placeholder="${esc(o.ph || "")}">${esc(v)}</textarea>`
      : `<div class="input-wrap"><input class="txt-in" ${bind} value="${esc(v)}" placeholder="${esc(o.ph || "")}"${o.tipo ? ` type="${o.tipo}"` : ""}${o.list ? ` list="${o.list}"` : ""} autocomplete="off" /></div>`;
    return `<div class="field${o.destacado ? " field--destacado" : ""}"><div class="field-head"><label class="field-label">${label}</label>${o.opt ? '<span class="field-opt">(opcional)</span>' : ""}${a.btn}</div>${a.box}${o.sub ? `<p class="field-sub">${o.sub}</p>` : ""}${ctrl}${o.extra || ""}</div>`;
  }
  function selector(label, bind, valor, opciones, o = {}) {
    const a = ayudaBtn(o.help);
    return `<div class="field"><div class="field-head"><label class="field-label">${label}</label>${a.btn}</div>${a.box}<div class="input-wrap"><select class="txt-in" ${bind}>${opciones.map(([v, t]) => `<option value="${esc(v)}"${v === valor ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></div></div>`;
  }

  // ---------- Pasos (en toda la ficha de un AMFE) ----------
  const disponible = p => p.entrega <= ENTREGA;
  const pasosDisp = () => L.PASOS.filter(disponible);
  function pasosHtml(a, actual) {
    const g = L.progreso(a);
    return `<ol class="wiz-steps wiz-steps--8 no-print" aria-label="Pasos del AMFE" data-zona="pasos">${pasosInner(a, actual, g)}</ol>`;
  }
  function pasosInner(a, actual, g = L.progreso(a)) {
    return L.PASOS.map(p => `<li><a href="#/amfe/${a.id}/${p.n}" class="wiz-step${p.n === actual ? " actual" : g[p.n] ? " hecho" : ""}${disponible(p) ? "" : " prox"}"${p.n === actual ? ' aria-current="step"' : ""} title="${esc(p.titulo + (disponible(p) ? "" : " (próximamente)"))}"><span class="wiz-num">${g[p.n] && p.n !== actual ? "✓" : p.n}</span><span class="wiz-lbl">${p.corto}</span></a></li>`).join("");
  }

  // ---------- Informe (cabecera y pie, solo al imprimir / Ver tabla) ----------
  function informeBar() {
    return `<div class="informe-bar informe-only"><button class="btn" data-act="volver">← Volver</button><button class="btn btn--primary" data-act="imprimir">Guardar / imprimir</button></div>`;
  }
  function informeCab(titulo, sub) {
    return `<header class="print-head print-only"><h1>${esc(titulo)}</h1><p>${esc(sub ? sub + " · " : "")}AMFE · Calidad y seguridad del paciente · ${new Date().toLocaleDateString("es-ES")}</p></header>`;
  }
  function informePie() {
    return `<footer class="print-foot print-only">
      <span class="autor-titulo">Aplicación desarrollada por</span>
      <span class="autor"><b>Carlos J. Galán Doval</b> · Médico de Familia · Técnico en Calidad y Seguridad del Paciente</span>
      <span class="autor"><b>Rafael J. Romero de Castilla Gil</b> · Médico de Familia · Responsable del Área de Calidad y Seguridad del Paciente</span>
      <span class="autor-area">Área de Gestión Sanitaria Sur de Córdoba · Andalucía</span>
      <span class="autor-uso">De libre uso con fines docentes y divulgativos. No sustituye el criterio profesional.</span>
      <span class="footer-version">AMFE · versión ${APP_VERSION}</span>
    </footer>`;
  }

  // ---------- Pequeñas piezas comunes ----------
  const nivelTxt = v => { const n = L.nivelIPR(v); return n ? n.k : "sin"; };
  const iprBadge = (v, extra = "") => v ? `<span class="ipr-badge niv--${nivelTxt(v)}${extra}">IPR ${v}</span>` : `<span class="ipr-badge niv--sin${extra}">Sin IPR</span>`;
  const volver = (href, txt) => `<a class="volver-cuadro" href="${href}">← ${txt}</a>`;
  const subPunto = s => `<span class="sub-dot sub-c${s ? s.color : "x"}" aria-hidden="true"></span>`;
  const nombreAmfe = a => a.titulo || a.proceso || "";

  // ---------- Inicio ----------
  function renderHome() {
    const d = datosUsuario, sig = L.siguientePaso(d, ENTREGA), n = d.amfes.length;
    const nf = d.amfes.reduce((s, a) => s + a.fallos.length, 0);
    const diasCopia = d.ultimaCopia ? Math.floor((Date.now() - new Date(d.ultimaCopia)) / 864e5) : null;
    const avisoCopia = n && (diasCopia === null || diasCopia > 30)
      ? `<div class="warn">⚠ ${diasCopia === null ? "Aún no has hecho ninguna copia de seguridad." : `Tu última copia de seguridad es de hace ${diasCopia} días.`} Tus datos solo están en este dispositivo: guarda una copia.</div>` : "";
    const ult = d.amfes.slice().sort((x, y) => String(y.modificado).localeCompare(String(x.modificado)))[0];
    view.innerHTML = `
      <section class="hero">
        <h1 class="hero-t"><span>AMFE</span></h1>
        <p class="hero-p">Haz el <b>Análisis Modal de Fallos y Efectos</b> de cualquier proceso sanitario, <b>paso a paso</b> y aprendiendo mientras lo haces: qué puede fallar, qué pasaría, por qué, y por dónde empezar a mejorar.</p>
        <div class="hero-btns">
          <a class="btn btn--primary btn--grande" href="#/amfe/nuevo">+ Nuevo AMFE</a>
          <a class="btn btn--grande" href="#/amfe">Mis AMFE${n ? ` <span class="contador">${n}</span>` : ""}</a>
        </div>
      </section>
      <div class="siguiente">
        <span class="siguiente-tag">Tu siguiente paso</span>
        <p>${esc(sig.texto)}</p>
        <a class="btn btn--primary" href="${sig.href}">${esc(sig.btn)} →</a>
      </div>
      <h2 class="sec-t">El camino, en 8 pasos</h2>
      <p class="page-lead">Del proceso a las acciones de mejora. Cada paso tiene su explicación y sus avisos; al final, el informe AMFE.</p>
      <ol class="fases">
        ${L.PASOS.map(p => `<li><a class="fase fase--acc${disponible(p) ? "" : " prox"}" href="${ult ? `#/amfe/${ult.id}/${p.n}` : "#/amfe/nuevo"}">
          <span class="fase-cab"><span class="pdca-num">${p.n}</span><b>${p.titulo}</b></span>
          <span class="fase-que">${p.que}</span>
          ${disponible(p) ? "" : `<span class="fase-prox">Próximamente · mientras, repásalo en «Aprende»</span>`}
        </a></li>`).join("")}
      </ol>
      <h2 class="sec-t">Tus datos</h2>
      <div class="card datos-card">
        <div class="datos-cifras">
          <a href="#/amfe"><b>${n}</b><span>${n === 1 ? "AMFE" : "AMFE"}</span></a>
          <a href="#/amfe"><b>${nf}</b><span>${nf === 1 ? "fallo analizado" : "fallos analizados"}</span></a>
          <a href="#/amfe"><b>${d.amfes.reduce((s, a) => s + a.fallos.filter(L.iprDe).length, 0)}</b><span>con IPR</span></a>
        </div>
        ${avisoCopia}
        <p class="field-sub">Se guardan <b>solo en este dispositivo</b>. Para trabajar en equipo, pasa tu copia a los demás: al importarla se junta con lo suyo sin duplicar.${d.ultimaCopia ? ` Última copia: ${fechaCorta(d.ultimaCopia)}.` : ""}</p>
        <div class="toolbar"><button class="btn" data-act="copia">⬇ Copia de seguridad</button><button class="btn" data-act="importar">⬆ Importar copia</button></div>
      </div>
      <div class="guide">
        <a class="guide-card" href="#/ejemplos"><span class="guide-num">Ej</span><div><div class="guide-q">Ejemplo</div><div class="guide-a">El AMFE completo de la <b>atención en Urgencias</b>: 7 subprocesos, 10 perfiles y 49 fallos puntuados.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card" href="#/aprende"><span class="guide-num">?</span><div><div class="guide-q">Aprende</div><div class="guide-a">${C.TEMAS.length} temas <b>explicados fácil</b>: del qué es un AMFE a las acciones de mejora.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card" href="#/glosario"><span class="guide-num">A–Z</span><div><div class="guide-q">Glosario</div><div class="guide-a">${C.GLOSARIO.length} términos <b>en lenguaje llano</b>, con buscador.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_AUD}" target="_blank" rel="noopener"><span class="guide-num">✓</span><div><div class="guide-q">Auditorías ↗</div><div class="guide-a">App hermana: <b>comprueba con una auditoría</b> si las medidas contra tus fallos prioritarios se aplican.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_IND}" target="_blank" rel="noopener"><span class="guide-num">%</span><div><div class="guide-q">Indicadores ↗</div><div class="guide-a">App hermana: <b>diseña los indicadores</b> con los que medirás tus acciones de mejora.</div></div><span class="guide-go">›</span></a>
      </div>
      ${practica("<b>Protección de datos:</b> un AMFE analiza un proceso, no a pacientes concretos. No escribas nombres de pacientes ni números de historia clínica.")}`;
  }

  // ---------- Lista de AMFE ----------
  function renderLista() {
    const lista = datos.amfes.slice().sort((a, b) => String(b.modificado).localeCompare(String(a.modificado)));
    view.innerHTML = `
      <h1 class="page-title">Mis AMFE</h1>
      <p class="page-lead">Cada AMFE analiza un proceso: sus subprocesos, su equipo, sus fallos y su prioridad.</p>
      ${facil(`<p>El <b>AMFE</b> (Análisis Modal de Fallos y Efectos) busca, antes de que ocurra nada, <b>qué puede fallar</b> en un proceso, <b>qué pasaría</b> y <b>por qué</b>. Cada fallo se puntúa de 1 a 10 en gravedad, ocurrencia y detección:</p>
        <div class="formula">IPR = G × O × D (de 1 a 1.000)</div>
        <p>Cuanto mayor es el <b>Índice de Prioridad de Riesgo</b>, antes conviene actuar. El AMFE termina con acciones de mejora para los fallos prioritarios.</p>`)}
      <div class="toolbar no-print"><a class="btn btn--primary" href="#/amfe/nuevo">+ Nuevo AMFE</a><a class="btn" href="#/amfe/ej-amfe-urg/1">Ver el ejemplo de Urgencias</a></div>
      ${lista.length ? `<div class="cuadro-lista">${lista.map(tarjeta).join("")}</div>`
        : `<div class="placeholder-box"><p><b>Todavía no tienes ningún AMFE.</b></p><p>Crea uno nuevo, o abre antes el ejemplo de Urgencias para ver cómo queda.</p></div>`}`;
  }
  function tarjeta(a) {
    const r = L.resumen(a), g = L.progreso(a), disp = pasosDisp().filter(p => p.k !== "ideas"), hechos = disp.filter(p => g[p.n]).length;
    return `<div class="item-card">
      <a class="item-main" href="#/amfe/${a.id}">
        <b class="item-t">${lleno(nombreAmfe(a)) ? esc(nombreAmfe(a)) : '<span class="vacio">AMFE sin nombre</span>'}</b>
        <span class="item-s">${esc([a.unidad, a.titulo && a.proceso !== a.titulo ? a.proceso : ""].filter(lleno).join(" · ")) || "&nbsp;"}</span>
        <span class="badges">${r.maxIPR ? iprBadge(r.maxIPR, " ipr-badge--max") : ""}<span class="badge">${plural(r.subprocesos, "subproceso", "subprocesos")}</span><span class="badge">${plural(r.n, "fallo", "fallos")}</span><span class="badge badge--prog">Pasos ${hechos}/${disp.length}</span></span>
      </a>
      <div class="item-pie"><span>Modificado: ${fechaCorta(a.modificado)}</span><span><button class="link-btn" data-act="amfe-dup" data-id="${a.id}">Duplicar</button> · <button class="link-btn link-btn--peligro" data-act="amfe-del" data-id="${a.id}">Borrar</button></span></div>
    </div>`;
  }

  // ---------- Ficha de un AMFE: armazón común de los pasos ----------
  let actual = null, pasoActual = 1;
  const abiertos = new Set();          // fallos desplegados en el paso 4
  let pegarAbierto = false;
  const avisosDe = (a, n) => ({ 1: L.avisosProceso, 2: L.avisosEquipo, 4: L.avisosFallos, 5: L.avisosPuntuar }[n] || (() => []))(a);
  const avisosGenerales = (a, n) => avisosDe(a, n).filter(x => !x.fallo).map(avisoHtml).join("");
  const avisosFallo = (a, n, id) => avisosDe(a, n).filter(x => x.fallo === id).map(avisoHtml).join("");

  function renderAmfe(a, n) {
    actual = a; pasoActual = n; nAyuda = 0;
    if (document.body.classList.contains("ver-informe")) { renderTabla(a); return; }
    const p = L.PASOS[n - 1], disp = pasosDisp();
    const prev = disp.filter(x => x.n < n).pop(), next = disp.find(x => x.n > n);
    const cuerpo = !disponible(p) ? pasoProximo(a, p) : RENDER[n](a);
    view.innerHTML = `
      <div class="wiz-top no-print">${volver(modoEjemplo ? "#/ejemplos" : "#/amfe", modoEjemplo ? "Ejemplos" : "Mis AMFE")}${pasosHtml(a, n)}</div>
      <div class="wiz-titulo"><span class="wiz-paso">Paso ${n} de 8${lleno(nombreAmfe(a)) ? " · " + esc(L.corto(nombreAmfe(a), 60)) : ""}</span><h1 class="page-title">${p.titulo}</h1></div>
      ${cuerpo}
      <div class="wiz-nav no-print">${prev ? `<a class="btn" href="#/amfe/${a.id}/${prev.n}">← ${prev.corto}</a>` : `<span></span>`}${next ? `<a class="btn btn--primary" href="#/amfe/${a.id}/${next.n}">${next.corto} →</a>` : `<span></span>`}</div>`;
  }
  function pasoProximo(a, p) {
    const tema = { 3: 3, 6: 6, 7: 7, 8: 7 }[p.n], sig = pasosDisp().find(x => x.n > p.n);
    return `<p class="page-lead">${p.que}</p>
      <div class="placeholder-box"><p><b>Este paso llegará en una próxima versión.</b></p>
      <p>${p.n === 3 ? "Mientras, escribe los fallos directamente en el paso 4, o pégalos desde la hoja en la que los hayáis apuntado en la reunión." : p.n === 6 ? "Mientras, en el paso 5 tienes todos los fallos ordenados por IPR." : "Mientras, puedes repasar cómo se hace en «Aprende»."}</p>
      <div class="toolbar" style="justify-content:center"><a class="btn" href="#/aprende/${tema}">Repasarlo en «Aprende»</a>${sig ? `<a class="btn btn--primary" href="#/amfe/${a.id}/${sig.n}">Ir al paso ${sig.n} →</a>` : `<a class="btn btn--primary" href="#/amfe/${a.id}/5">Ver el orden por IPR →</a>`}</div></div>`;
  }

  // ---------- Paso 1 · El proceso ----------
  const bs = (s, f) => `data-s="${s.id}" data-f="${f}"`;
  function subCard(s, i, total) {
    return `<div class="sub-card sub-c${s.color}" data-sid="${s.id}">
      <div class="sub-cab">${subPunto(s)}<b>Subproceso ${i + 1}</b>
        <span class="sub-acc no-print"><button type="button" class="icon-mini" data-act="sub-subir" data-id="${s.id}" aria-label="Subir"${i === 0 ? " disabled" : ""}>↑</button><button type="button" class="icon-mini" data-act="sub-bajar" data-id="${s.id}" aria-label="Bajar"${i === total - 1 ? " disabled" : ""}>↓</button><button type="button" class="link-btn link-btn--peligro" data-act="sub-del" data-id="${s.id}">Quitar</button></span></div>
      ${campo(s, "nombre", "Nombre", { bind: bs(s, "nombre"), ph: "p. ej. Triaje de enfermería" })}
      ${campo(s, "descripcion", "Qué se hace", { bind: bs(s, "descripcion"), area: true, opt: true, ph: "p. ej. Evaluación clínica inicial y asignación de prioridad" })}
      <div class="dos-col">
        ${campo(s, "inicio", "Empieza cuando…", { bind: bs(s, "inicio"), ph: "p. ej. Recepción por enfermería de triaje" })}
        ${campo(s, "fin", "Termina cuando…", { bind: bs(s, "fin"), ph: "p. ej. Derivación a sala de espera" })}
      </div>
      ${campo(s, "roles", "Quién interviene", { bind: bs(s, "roles"), ph: "p. ej. Enfermera de triaje, paciente, acompañante", help: "Separa los perfiles con comas. La app los usa para avisarte si falta alguno en el equipo." })}
    </div>`;
  }
  function paso1(a) {
    return `
      ${idea("Antes de buscar fallos hay que <b>conocer bien el proceso</b>: dónde empieza, dónde acaba y en qué fases se divide. Cada fallo irá en su subproceso.")}
      ${facil(`<p>Un <b>subproceso</b> es una fase del proceso con un <b>inicio</b>, un <b>fin</b> y unas <b>personas</b> que intervienen. Por ejemplo, en Urgencias: «Recepción y registro administrativo», «Triaje de enfermería», «Estancia en sala de espera»…</p>
        <p>Lo habitual son entre <b>3 y 8 subprocesos</b>. Si tenéis un flujograma del proceso, los subprocesos salen de ahí.</p>
        ${trampa("Si los subprocesos no tienen inicio y fin claros, se solapan (un fallo se cuenta dos veces) o dejan huecos (nadie mira esa parte del proceso).")}`)}
      <div class="card">
        <h2 class="sub-h">Datos del proceso</h2>
        ${campo(a, "proceso", "Proceso que se analiza", { ph: "p. ej. Atención integral en el Servicio de Urgencias", help: "El proceso completo, con el nombre con el que lo conoce todo el mundo en la unidad." })}
        <div class="dos-col">
          ${campo(a, "titulo", "Nombre corto de este AMFE", { opt: true, ph: "p. ej. Urgencias 2026", help: "Para reconocerlo en tu lista. Si lo dejas vacío, se usa el nombre del proceso." })}
          ${campo(a, "unidad", "Unidad o servicio", { ph: "p. ej. Servicio de Urgencias" })}
        </div>
        <div class="dos-col">
          ${campo(a, "inicio", "El proceso empieza cuando…", { ph: "p. ej. El paciente llega a admisión" })}
          ${campo(a, "fin", "Y termina cuando…", { ph: "p. ej. Se decide su destino (alta, ingreso o derivación)" })}
        </div>
        <div class="dos-col">
          ${campo(a, "incluye", "Qué queda dentro", { area: true, opt: true, ph: "p. ej. Adultos atendidos en Urgencias generales" })}
          ${campo(a, "excluye", "Qué queda fuera", { area: true, opt: true, ph: "p. ej. Urgencias pediátricas; estancia en planta" })}
        </div>
        ${campo(a, "objetivo", "Objetivo del proceso", { area: true, opt: true, ph: "p. ej. Garantizar la atención segura del paciente desde su llegada hasta la decisión sobre su destino", help: "Para qué existe el proceso. Ayuda a reconocer qué es un fallo: todo lo que impide cumplir este objetivo.", extra: `<div class="quick no-print"><button type="button" class="chip chip--accent" data-act="sug-objetivo">✎ Proponer objetivo</button></div>` })}
        <div class="dos-col">
          ${campo(a, "responsable", "Responsable del AMFE", { opt: true, ph: "p. ej. Coordinación de Calidad y Seguridad del Paciente" })}
          ${campo(a, "fecha", "Fecha o periodo del análisis", { opt: true, ph: "p. ej. Octubre–noviembre 2026" })}
        </div>
      </div>
      <h2 class="sec-t">Subprocesos <span class="contador" data-zona="nsub">${a.subprocesos.length}</span></h2>
      <div class="sub-lista">${a.subprocesos.map((s, i) => subCard(s, i, a.subprocesos.length)).join("") || `<p class="placeholder-box">Añade el primer subproceso: la primera fase del proceso.</p>`}</div>
      <div class="toolbar no-print"><button class="btn btn--primary" data-act="sub-add">+ Añadir subproceso</button></div>
      <div data-zona="avisos">${avisosGenerales(a, 1)}</div>`;
  }

  // ---------- Paso 2 · Equipo y sesiones ----------
  const bm = (m, f) => `data-m="${m.id}" data-f="${f}"`;
  const bx = (x, f) => `data-x="${x.id}" data-f="${f}"`;
  const etiquetaMiembro = m => lleno(m.nombre) ? m.nombre : lleno(m.perfil) ? m.perfil : "Sin perfil";
  function miembroCard(m, i) {
    return `<div class="sub-card sub-card--eq">
      <div class="sub-cab"><span class="eq-n">${i + 1}</span><b>${lleno(m.perfil) ? esc(m.perfil) : '<span class="vacio">Perfil sin escribir</span>'}</b><span class="badge">${esc(L.ROLES[m.rol].nom)}</span>
        <span class="sub-acc no-print"><button type="button" class="link-btn link-btn--peligro" data-act="eq-del" data-id="${m.id}">Quitar</button></span></div>
      <div class="dos-col">
        ${campo(m, "perfil", "Perfil profesional", { bind: bm(m, "perfil"), ph: "p. ej. Enfermero/a de Urgencias" })}
        ${campo(m, "cargo", "Cargo o puesto", { bind: bm(m, "cargo"), opt: true, ph: "p. ej. Supervisor/a de turno" })}
      </div>
      ${selector("Papel en el AMFE", bm(m, "rol"), m.rol, Object.keys(L.ROLES).map(k => [k, L.ROLES[k].nom]), { help: Object.keys(L.ROLES).map(k => `<b>${L.ROLES[k].nom}</b>: ${L.ROLES[k].que}`).join("<br>") })}
      ${campo(m, "justificacion", "Por qué está en el equipo", { bind: bm(m, "justificacion"), area: true, opt: true, ph: "p. ej. Conoce el flujo asistencial y los protocolos de cuidados" })}
      ${campo(m, "nombre", "Nombre", { bind: bm(m, "nombre"), opt: true, ph: "Puedes dejarlo vacío", help: "Opcional. Muchos documentos AMFE recogen solo el perfil y el cargo." })}
    </div>`;
  }
  function sesionCard(a, x, i) {
    return `<div class="sub-card sub-card--ses">
      <div class="sub-cab"><span class="eq-n">${i + 1}</span><b>Sesión ${i + 1}</b>${lleno(x.fecha) ? `<span class="badge">${esc(fmtFecha(x.fecha))}</span>` : ""}
        <span class="sub-acc no-print"><button type="button" class="link-btn link-btn--peligro" data-act="ses-del" data-id="${x.id}">Quitar</button></span></div>
      <div class="dos-col">
        ${campo(x, "fecha", "Fecha", { bind: bx(x, "fecha"), tipo: "date" })}
        ${campo(x, "duracion", "Duración", { bind: bx(x, "duracion"), opt: true, ph: "p. ej. 2 h" })}
      </div>
      ${campo(x, "actividad", "Actividad principal", { bind: bx(x, "actividad"), ph: "p. ej. Lluvia de ideas y técnica de grupo nominal" })}
      ${a.equipo.length ? `<div class="field"><div class="field-head"><label class="field-label">Asistentes</label></div><div class="quick">${a.equipo.map(m => `<button type="button" class="chip${x.asistentes.includes(m.id) ? " active" : ""}" data-asis="${x.id}" data-v="${m.id}">${esc(L.corto(etiquetaMiembro(m), 40))}</button>`).join("")}</div></div>` : ""}
      ${campo(x, "resultados", "Resultados", { bind: bx(x, "resultados"), area: true, opt: true, ph: "p. ej. 49 fallos potenciales consensuados" })}
    </div>`;
  }
  function paso2(a) {
    // Un perfil rápido se marca si ya hay alguien de su estamento (o con el mismo perfil)
    const ya = new Set([...a.equipo.map(m => L.normal(m.perfil)), ...a.equipo.map(m => L.estamentoDe(m.perfil + " " + m.cargo)).filter(Boolean)]);
    const yaEsta = p => ya.has(L.normal(p.perfil)) || ya.has(L.estamentoDe(p.perfil));
    return `
      ${idea("Nadie conoce solo todo el proceso. Un AMFE se hace en <b>equipo multidisciplinar</b>: al menos 6 perfiles, con quien hace el proceso a diario.")}
      ${facil(`<p>Incluid a <b>todos los que intervienen</b> en el proceso (mirad los roles de cada subproceso), a alguien que domine la <b>metodología</b> y, si se puede, una mirada <b>externa</b> (otra unidad que colabora).</p>
        <p>Cada miembro tiene un <b>papel</b>: la <b>coordinación</b> dirige y modera; la <b>secretaría</b> registra lo que se decide y prepara los documentos; los demás aportan su experiencia.</p>
        <p>El trabajo se organiza en <b>sesiones</b>: lo habitual son tres de unas dos horas (analizar el proceso; buscar los fallos; puntuarlos).</p>`)}
      <h2 class="sec-t">Equipo <span class="contador" data-zona="neq">${a.equipo.length}</span></h2>
      <div class="card no-print"><p class="field-sub">Añade con un toque los perfiles habituales y después ajústalos:</p>
        <div class="quick">${L.PERFILES_SUG.map((p, i) => `<button type="button" class="chip${yaEsta(p) ? " active" : ""}" data-act="eq-sug" data-i="${i}">+ ${esc(p.perfil)}</button>`).join("")}</div></div>
      <div class="sub-lista">${a.equipo.map(miembroCard).join("")}</div>
      <div class="toolbar no-print"><button class="btn btn--primary" data-act="eq-add">+ Añadir otro perfil</button></div>
      <h2 class="sec-t">Sesiones de trabajo <span class="contador" data-zona="nses">${a.sesiones.length}</span></h2>
      <div class="sub-lista">${a.sesiones.map((x, i) => sesionCard(a, x, i)).join("") || `<p class="placeholder-box">Aún no hay sesiones. Puedes proponer las tres habituales y ajustarlas.</p>`}</div>
      <div class="toolbar no-print"><button class="btn${a.sesiones.length ? "" : " btn--primary"}" data-act="ses-add">+ Añadir sesión</button>${a.sesiones.length ? "" : `<button class="btn" data-act="ses-tipo">Proponer las 3 sesiones habituales</button>`}</div>
      <div data-zona="avisos">${avisosGenerales(a, 2)}</div>`;
  }

  // ---------- Paso 4 · Analizar cada fallo ----------
  const bf = (f, k) => `data-fa="${f.id}" data-f="${k}"`;
  function falloCabInner(a, f) {
    const faltan = ["efecto", "causa"].filter(k => !lleno(f[k]));
    return `<span class="rg-puesto">Nº ${f.num}</span><span class="rg-txt"><b>${lleno(f.fallo) ? esc(f.fallo) : '<span class="vacio">Fallo sin describir</span>'}</b><span>${lleno(f.efecto) ? "→ " + esc(L.corto(f.efecto, 90)) : ""}${faltan.length ? ` <span class="falta">Falta ${faltan.join(" y ")}</span>` : ""}</span></span><span class="rg-flecha" aria-hidden="true">▾</span>`;
  }
  function falloCard(a, f) {
    const ab = abiertos.has(f.id), s = L.subDe(a, f);
    return `<div class="rg fallo sub-c${s ? s.color : "x"}" data-fid="${f.id}">
      <div class="rg-cab"><button type="button" class="rg-toggle" data-act="fa-toggle" data-id="${f.id}" aria-expanded="${ab}">${falloCabInner(a, f)}</button></div>
      <div data-zav="${f.id}">${avisosFallo(a, 4, f.id)}</div>
      <div class="rg-body"${ab ? "" : " hidden"}>
        ${selector("Subproceso", bf(f, "subprocesoId"), f.subprocesoId, [["", "— Elige el subproceso —"], ...a.subprocesos.map((x, i) => [x.id, `${i + 1}. ${x.nombre || "Sin nombre"}`])])}
        ${campo(f, "fallo", "Modo de fallo: ¿qué puede salir mal?", { bind: bf(f, "fallo"), area: true, ph: "p. ej. No colocación de pulsera identificativa", help: "Un hecho concreto y observable, en una frase. No una causa («sobrecarga…») ni un efecto («daño al paciente»)." })}
        ${campo(f, "efecto", "Efecto: ¿qué pasaría si ocurre?", { bind: bf(f, "efecto"), area: true, ph: "p. ej. Error de identidad, confusión en pruebas o medicación", help: "La consecuencia en el paciente, el proceso o el sistema. De aquí sale la gravedad." })}
        ${campo(f, "causa", "Causa: ¿por qué podría ocurrir?", { bind: bf(f, "causa"), area: true, ph: "p. ej. Rutina interrumpida, recursos saturados", help: "Factores humanos, técnicos, organizativos o del entorno. Las acciones de mejora atacarán la causa." })}
        ${campo(f, "controles", "Controles actuales: ¿qué existe hoy para evitarlo o detectarlo?", { bind: bf(f, "controles"), area: true, opt: true, ph: "p. ej. Protocolo de identificación; pulsera impresa en triaje", help: "Protocolos, dobles chequeos, alertas informáticas, listas de verificación… Son la base para puntuar la detección." })}
        <div class="rg-pie no-print"><button type="button" class="link-btn link-btn--peligro" data-act="fa-del" data-id="${f.id}">Quitar este fallo</button><button type="button" class="link-btn" data-act="fa-toggle" data-id="${f.id}">Cerrar ▴</button></div>
      </div>
    </div>`;
  }
  function grupoFallos(a, s, i) {
    const lista = L.ordenarFallos(a.fallos.filter(f => s ? f.subprocesoId === s.id : !L.subDe(a, f)), "num");
    if (!s && !lista.length) return "";
    return `<section class="grupo-sub">
      <h3 class="grupo-t">${subPunto(s)}${s ? `${i + 1}. ${lleno(s.nombre) ? esc(s.nombre) : '<span class="vacio">Subproceso sin nombre</span>'}` : "Sin subproceso"} <span class="contador">${lista.length}</span></h3>
      <div class="rg-lista">${lista.map(f => falloCard(a, f)).join("") || `<p class="field-sub">Sin fallos todavía.</p>`}</div>
      ${s ? `<button class="btn btn--sm no-print" data-act="fa-add" data-sub="${s.id}">+ Fallo en «${esc(L.corto(s.nombre || "este subproceso", 40))}»</button>` : ""}
    </section>`;
  }
  function pegarHtml() {
    return `<div class="card pegar no-print">
      <h3 class="sub-h">Pegar fallos desde Excel, Calc o Word</h3>
      <p class="field-sub">Selecciona las filas de tu tabla (mejor con la fila de títulos), cópialas y pégalas aquí. Sin títulos, las columnas deben ir en este orden: <b>Subproceso · Fallo · Efecto · Causa · G · O · D</b>. Con títulos se reconoce también la columna de <b>controles</b>. El IPR se ignora: se recalcula. Los subprocesos que no existan se crean.</p>
      <textarea class="txt-in" id="pegar-txt" rows="6" placeholder="Pega aquí la tabla…"></textarea>
      <div data-zona="pegar"></div>
      <div class="toolbar"><button class="btn btn--primary" data-act="pegar-ok" disabled>Añadir los fallos</button><button class="btn" data-act="pegar-cerrar">Cancelar</button></div>
    </div>`;
  }
  function paso4(a) {
    return `
      ${idea("Para cada subproceso, preguntaos: <b>¿qué puede salir mal?</b> Y para cada fallo, <b>¿qué pasaría?</b> (efecto) y <b>¿por qué?</b> (causa).")}
      ${facil(`<div class="table-wrap"><table class="mini"><tr><th>Columna</th><th>Pregunta</th><th>Ejemplo</th></tr>
          <tr><td><b>Modo de fallo</b></td><td>¿Qué sale mal?</td><td>No colocación de pulsera identificativa</td></tr>
          <tr><td><b>Efecto</b></td><td>¿Qué pasaría?</td><td>Error de identidad, confusión en pruebas o medicación</td></tr>
          <tr><td><b>Causa</b></td><td>¿Por qué?</td><td>Rutina interrumpida, recursos saturados</td></tr>
          <tr><td><b>Controles</b></td><td>¿Qué hay hoy?</td><td>Protocolo de identificación; impresora de pulseras en triaje</td></tr></table></div>
        ${trampa("El error más frecuente es escribir una <b>causa</b> como fallo («sobrecarga asistencial», «falta de formación») o un <b>efecto</b> como fallo («daño al paciente»). La app te avisa cuando lo detecta.")}`)}
      <div class="toolbar no-print"><button class="btn" data-act="pegar-abrir">Pegar desde Excel</button>${a.fallos.length ? `<button class="btn" data-act="fa-abrir-todos">${abiertos.size ? "Cerrar todos" : "Abrir todos"}</button><button class="btn" data-act="informe">Ver tabla / PDF</button>` : ""}</div>
      ${pegarAbierto ? pegarHtml() : ""}
      <div data-zona="avisos">${avisosGenerales(a, 4)}</div>
      ${a.subprocesos.length ? a.subprocesos.map((s, i) => grupoFallos(a, s, i)).join("") + grupoFallos(a, null, 0)
        : `<div class="placeholder-box"><p>Aún no hay subprocesos. <a href="#/amfe/${a.id}/1">Defínelos en el paso 1</a> o pega tu tabla: los subprocesos se crean solos.</p></div>${grupoFallos(a, null, 0)}`}`;
  }

  // ---------- Paso 5 · Puntuar G·O·D ----------
  const textoEscala = (a, k, v) => { const t = L.tramo(v); return t ? a.escalas[k][t - 1] : ""; };
  function escalaHtml(a) {
    return `<div class="table-wrap"><table class="mini facil-tabla tabla-escalas"><tr><th></th>${["g", "o", "d"].map(k => `<th>${L.ESCALA_NOM[k]}</th>`).join("")}</tr>
      ${L.TRAMOS.map((t, i) => `<tr><td><b>${t}</b></td>${["g", "o", "d"].map(k => `<td>${esc(a.escalas[k][i])}</td>`).join("")}</tr>`).join("")}</table></div>`;
  }
  function escFila(a, f) {
    const partes = ["g", "o", "d"].filter(k => L.entero1a10(f[k])).map(k => `<b>${k.toUpperCase()} ${L.entero1a10(f[k])}</b> ${esc(textoEscala(a, k, f[k]).replace(/\.$/, ""))}`);
    return partes.join(" · ");
  }
  function iprFila(f) {
    const v = L.iprDe(f);
    if (v) return iprBadge(v);
    if ([f.g, f.o, f.d].some(lleno)) return `<span class="ipr-falta">Enteros del 1 al 10</span>`;
    return `<span class="ipr-badge niv--sin">IPR</span>`;
  }
  function filaPuntuar(a, f) {
    return `<div class="punt" data-pid="${f.id}">
      <div class="punt-txt"><span class="rg-puesto">Nº ${f.num}</span><span><b>${lleno(f.fallo) ? esc(f.fallo) : '<span class="vacio">Fallo sin describir</span>'}</b>${lleno(f.efecto) ? `<span class="punt-ef">→ ${esc(L.corto(f.efecto, 110))}</span>` : ""}</span></div>
      <div class="punt-god">
        ${["g", "o", "d"].map(k => `<label class="god-c"><span>${L.ESCALA_NOM[k]}</span><input class="txt-in" data-fa="${f.id}" data-f="${k}" value="${esc(f[k])}" inputmode="numeric" maxlength="2" placeholder="1–10" aria-label="${L.ESCALA_NOM[k]} del fallo ${f.num}" /></label>`).join("")}
        <div class="punt-ipr" data-zipr="${f.id}">${iprFila(f)}</div>
      </div>
      <p class="punt-esc" data-zesc="${f.id}">${escFila(a, f)}</p>
      <div data-zav="${f.id}">${avisosFallo(a, 5, f.id)}</div>
    </div>`;
  }
  function tablaOrden(a) {
    const F = L.ordenarFallos(a.fallos.filter(L.iprDe)), P = L.puestos(a.fallos);
    if (!F.length) return `<p class="placeholder-box">Cuando puntúes los fallos, aquí aparecerán ordenados por IPR.</p>`;
    return `<div class="table-wrap"><table class="mini tabla-riesgos tabla-orden"><thead><tr><th>Puesto</th><th>Nº</th><th>Subproceso</th><th>Fallo</th><th>G</th><th>O</th><th>D</th><th>IPR</th></tr></thead><tbody>
      ${F.map(f => { const s = L.subDe(a, f); return `<tr><td>${P[f.id]}</td><td>${f.num}</td><td>${subPunto(s)} ${esc(s ? s.nombre : "")}</td><td><b>${esc(f.fallo)}</b></td><td>${esc(f.g)}</td><td>${esc(f.o)}</td><td>${esc(f.d)}</td><td>${iprBadge(L.iprDe(f))}</td></tr>`; }).join("")}
    </tbody></table></div>`;
  }
  // Gráfico de prioridad: barras de IPR de mayor a menor, del color del subproceso
  function grafico(a) {
    const F = L.ordenarFallos(a.fallos.filter(L.iprDe));
    if (F.length < 2) return `<p class="field-sub">Puntúa al menos dos fallos para ver el gráfico.</p>`;
    const W = 400, H = 190, x0 = 34, y0 = 12, alto = 140, ancho = W - x0 - 6;
    const max = Math.max(400, Math.ceil(Math.max(...F.map(L.iprDe)) / 100) * 100);
    const paso = ancho / F.length, bw = Math.max(2, Math.min(26, paso * 0.72));
    const y = v => y0 + alto - v / max * alto;
    const guias = []; for (let g = 0; g <= max; g += max > 600 ? 200 : 100) guias.push(g);
    return `<svg class="grafico pareto" viewBox="0 0 ${W} ${H}" role="img" aria-label="Fallos ordenados por IPR">
      ${guias.map(g => `<line class="g-guia" x1="${x0}" x2="${W - 4}" y1="${y(g)}" y2="${y(g)}"/><text class="g-eje" x="${x0 - 4}" y="${y(g) + 3.5}" text-anchor="end">${g}</text>`).join("")}
      ${F.map((f, i) => { const v = L.iprDe(f), cx = x0 + paso * i + paso / 2, s = L.subDe(a, f); return `<g><title>Nº ${f.num} · IPR ${v} · ${esc(f.fallo || "sin describir")}${s ? " · " + esc(s.nombre) : ""}</title>
        <rect class="g-barra sub-fill sub-c${s ? s.color : "x"}" x="${cx - bw / 2}" y="${y(v)}" width="${bw}" height="${y0 + alto - y(v)}" rx="2"/></g>`; }).join("")}
      <text class="g-eje" x="${x0}" y="${H - 6}">Fallos de mayor a menor IPR →</text>
    </svg>
    <div class="leyenda">${a.subprocesos.filter(s => a.fallos.some(f => f.subprocesoId === s.id && L.iprDe(f))).map(s => `<span>${subPunto(s)}${esc(L.corto(s.nombre, 34))}</span>`).join("")}</div>`;
  }
  function paso5(a) {
    const F = a.fallos.filter(f => lleno(f.fallo)), r = L.resumen(a);
    return `
      ${idea("Cada fallo se puntúa de 1 a 10 en tres escalas. <b>IPR = G × O × D</b>: cuanto mayor, antes hay que actuar.")}
      ${facil(`<p>Usad la misma escala en todo el AMFE y ponedla a la vista en la reunión. Cada valor puede salir del <b>consenso</b> del equipo o de la <b>media</b> de lo que puntúa cada miembro.</p>
        ${escalaHtml(a)}
        <div class="formula">IPR = Gravedad × Ocurrencia × Detección (de 1 a 1.000)</div>
        ${trampa("La <b>detección va al revés</b> que las otras dos: 1 = se descubre casi seguro antes de causar daño; 10 = casi imposible de detectar. Antes de puntuarla, mirad los controles actuales.")}`, "Explicado fácil: las escalas")}
      <div class="res-linea" data-zona="resumen5">${resumen5(r)}</div>
      <div data-zona="avisos">${avisosGenerales(a, 5)}</div>
      ${F.length ? a.subprocesos.map((s, i) => { const l = L.ordenarFallos(F.filter(f => f.subprocesoId === s.id), "num"); return l.length ? `<section class="grupo-sub"><h3 class="grupo-t">${subPunto(s)}${i + 1}. ${esc(s.nombre || "Subproceso sin nombre")}</h3><div class="punt-lista">${l.map(f => filaPuntuar(a, f)).join("")}</div></section>` : ""; }).join("")
          + (F.some(f => !L.subDe(a, f)) ? `<section class="grupo-sub"><h3 class="grupo-t">${subPunto(null)}Sin subproceso</h3><div class="punt-lista">${L.ordenarFallos(F.filter(f => !L.subDe(a, f)), "num").map(f => filaPuntuar(a, f)).join("")}</div></section>` : "")
        : `<div class="placeholder-box"><p>Aún no hay fallos que puntuar. <a href="#/amfe/${a.id}/4">Escríbelos en el paso 4</a>.</p></div>`}
      <h2 class="sec-t">Orden por IPR</h2>
      <p class="page-lead">Así queda la prioridad. La selección de los fallos prioritarios, la matriz de riesgos y los fallos críticos llegan en la próxima versión.</p>
      <div class="card chart-card" data-zona="grafico">${grafico(a)}</div>
      <div data-zona="orden">${tablaOrden(a)}</div>
      ${F.length ? `<div class="toolbar no-print sep-arriba"><button class="btn" data-act="informe">Ver tabla / PDF</button></div>` : ""}`;
  }
  function resumen5(r) {
    if (!r.n) return "";
    return `<span class="badge">${r.puntuados} de ${r.n} puntuados</span>${r.maxIPR ? iprBadge(r.maxIPR) : ""}${["muyalto", "alto", "medio", "bajo"].filter(k => r.porNivel[k]).map(k => `<span class="ipr-badge niv--${k}">${r.porNivel[k]} ${L.NIVELES_IPR.find(x => x.k === k).nom.toLowerCase()}</span>`).join("")}`;
  }

  const RENDER = { 1: paso1, 2: paso2, 4: paso4, 5: paso5 };

  // ---------- Vista imprimible: la tabla AMFE ----------
  function renderTabla(a) {
    const fila = (k, v) => lleno(v) ? `<tr><th>${k}</th><td>${escMl(v)}</td></tr>` : "";
    const r = L.resumen(a), P = L.puestos(a.fallos);
    const porSub = L.ordenarFallos(a.fallos.filter(f => lleno(f.fallo)), "sub", a.subprocesos);
    const porIpr = L.ordenarFallos(a.fallos.filter(L.iprDe));
    const filaF = f => { const s = L.subDe(a, f); return `<tr><td>${f.num}</td><td>${esc(s ? s.nombre : "")}</td><td><b>${esc(f.fallo)}</b></td><td>${esc(f.efecto)}</td><td>${esc(f.causa)}</td><td>${esc(f.controles)}</td><td>${esc(f.g)}</td><td>${esc(f.o)}</td><td>${esc(f.d)}</td><td>${iprBadge(L.iprDe(f))}</td></tr>`; };
    const cab = `<thead><tr><th>Nº</th><th>Subproceso</th><th>Modo de fallo</th><th>Efecto</th><th>Causa</th><th>Controles actuales</th><th>G</th><th>O</th><th>D</th><th>IPR</th></tr></thead>`;
    view.innerHTML = `${informeBar()}${informeCab("AMFE" + (lleno(nombreAmfe(a)) ? " · " + nombreAmfe(a) : ""), a.unidad)}
      <div class="ficha">
        <div class="ficha-cab"><span class="wiz-paso">Análisis Modal de Fallos y Efectos</span><h2 class="ficha-nombre">${esc(a.proceso || nombreAmfe(a) || "Proceso sin nombre")}</h2></div>
        <table class="ficha-t">${fila("Unidad o servicio", a.unidad)}${fila("Objetivo del proceso", a.objetivo)}${fila("Empieza", a.inicio)}${fila("Termina", a.fin)}${fila("Qué queda dentro", a.incluye)}${fila("Qué queda fuera", a.excluye)}${fila("Responsable", a.responsable)}${fila("Fecha", a.fecha)}
          <tr><th>Resumen</th><td>${plural(r.subprocesos, "subproceso", "subprocesos")} · ${plural(r.n, "fallo", "fallos")} (${r.puntuados} con IPR) · IPR máximo ${r.maxIPR || "—"}</td></tr></table>
      </div>
      ${a.subprocesos.length ? `<h2 class="sec-t">Subprocesos</h2><div class="table-wrap"><table class="mini tabla-riesgos"><thead><tr><th>Nº</th><th>Subproceso</th><th>Descripción</th><th>Inicio</th><th>Fin</th><th>Roles</th></tr></thead><tbody>${a.subprocesos.map((s, i) => `<tr><td>${i + 1}</td><td>${subPunto(s)} <b>${esc(s.nombre)}</b></td><td>${esc(s.descripcion)}</td><td>${esc(s.inicio)}</td><td>${esc(s.fin)}</td><td>${esc(s.roles)}</td></tr>`).join("")}</tbody></table></div>` : ""}
      ${a.equipo.length ? `<h2 class="sec-t">Equipo</h2><div class="table-wrap"><table class="mini tabla-riesgos"><thead><tr><th>Nº</th><th>Perfil</th><th>Cargo</th><th>Papel</th><th>Justificación</th></tr></thead><tbody>${a.equipo.map((m, i) => `<tr><td>${i + 1}</td><td><b>${esc(m.perfil)}</b>${lleno(m.nombre) ? "<br>" + esc(m.nombre) : ""}</td><td>${esc(m.cargo)}</td><td>${esc(L.ROLES[m.rol].nom)}</td><td>${esc(m.justificacion)}</td></tr>`).join("")}</tbody></table></div>` : ""}
      ${a.sesiones.length ? `<h2 class="sec-t">Sesiones</h2><div class="table-wrap"><table class="mini tabla-riesgos"><thead><tr><th>Nº</th><th>Fecha</th><th>Actividad</th><th>Duración</th><th>Asistentes</th><th>Resultados</th></tr></thead><tbody>${a.sesiones.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(fmtFecha(x.fecha))}</td><td>${esc(x.actividad)}</td><td>${esc(x.duracion)}</td><td>${x.asistentes.length}</td><td>${esc(x.resultados)}</td></tr>`).join("")}</tbody></table></div>` : ""}
      <h2 class="sec-t">Fallos por subproceso</h2>
      <div class="table-wrap"><table class="mini tabla-riesgos tabla-amfe">${cab}<tbody>${porSub.map(filaF).join("")}</tbody></table></div>
      ${porIpr.length ? `<h2 class="sec-t">Fallos ordenados por IPR</h2>
      <div class="chart-card informe-graf">${grafico(a)}</div>
      <div class="table-wrap"><table class="mini tabla-riesgos"><thead><tr><th>Puesto</th><th>Nº</th><th>Subproceso</th><th>Modo de fallo</th><th>G</th><th>O</th><th>D</th><th>IPR</th></tr></thead><tbody>${porIpr.map(f => `<tr><td>${P[f.id]}</td><td>${f.num}</td><td>${esc(L.nombreSub(a, f))}</td><td><b>${esc(f.fallo)}</b></td><td>${esc(f.g)}</td><td>${esc(f.o)}</td><td>${esc(f.d)}</td><td>${iprBadge(L.iprDe(f))}</td></tr>`).join("")}</tbody></table></div>` : ""}
      <h2 class="sec-t">Escalas de puntuación</h2>
      ${escalaHtml(a)}
      ${lleno(a.notas) ? `<p class="field-sub">${escMl(a.notas)}</p>` : ""}
      ${informePie()}`;
  }

  // Refresca lo que depende de lo escrito sin repintar los campos (no se pierde el foco)
  function refrescar(idFallo) {
    const a = actual; if (!a) return;
    const n = pasoActual;
    const Z = {
      pasos: () => pasosInner(a, n),
      avisos: () => avisosGenerales(a, n),
      nsub: () => String(a.subprocesos.length), neq: () => String(a.equipo.length), nses: () => String(a.sesiones.length),
      resumen5: () => resumen5(L.resumen(a)), grafico: () => grafico(a), orden: () => tablaOrden(a)
    };
    $$("[data-zona]").forEach(el => { const f = Z[el.dataset.zona]; if (f) el.innerHTML = f(); });
    $$("[data-zav]").forEach(el => { el.innerHTML = avisosFallo(a, n, el.dataset.zav); });
    if (idFallo) {
      const f = a.fallos.find(x => x.id === idFallo); if (!f) return;
      const t = $(`.fallo[data-fid="${f.id}"] .rg-toggle`); if (t) t.innerHTML = falloCabInner(a, f);
      const zi = $(`[data-zipr="${f.id}"]`); if (zi) zi.innerHTML = iprFila(f);
      const ze = $(`[data-zesc="${f.id}"]`); if (ze) ze.innerHTML = escFila(a, f);
    }
  }
  function repintar() { const y = window.scrollY; renderAmfe(actual, pasoActual); window.scrollTo(0, y); }

  // ---------- Aprende ----------
  function renderAprende(n) {
    const T = C.TEMAS, t = T.find(x => x.n === n);
    if (!t) {
      view.innerHTML = `
        <h1 class="page-title">Aprende</h1>
        <p class="page-lead">${T.length} temas, explicados fácil, para tener a mano mientras haces tu AMFE.</p>
        <div class="temas">${T.map(x => `<a class="tema-card pdca--${x.c}" href="#/aprende/${x.n}"><span class="tema-n">${x.n}</span><span><b>${x.titulo}</b><span>${x.sub}</span></span></a>`).join("")}</div>`;
      return;
    }
    const prev = T.find(x => x.n === n - 1), next = T.find(x => x.n === n + 1);
    view.innerHTML = `
      <div class="wiz-top no-print">${volver("#/aprende", "Aprende")}<div class="tema-pills">${T.map(x => `<a href="#/aprende/${x.n}" class="pdca--${x.c}${x.n === n ? " actual" : ""}">${x.n}</a>`).join("")}</div></div>
      <div class="wiz-titulo"><span class="wiz-paso">Tema ${n} de ${T.length}</span><h1 class="page-title">${t.titulo}</h1><p class="page-lead">${t.sub}</p></div>
      <div class="card minuto pdca--${t.c}"><h2 class="sub-h">En un minuto</h2><ul>${t.minuto.map(x => `<li>${x}</li>`).join("")}</ul></div>
      ${t.secciones.map((s, i) => `<details class="facil"${i === 0 ? " open" : ""}><summary>${s.t}</summary><div class="facil-body">${s.h}</div></details>`).join("")}
      ${box("ejemplo", "Minicaso", t.minicaso)}
      <div class="toolbar"><a class="btn btn--primary" href="${t.practica.href}">${t.practica.texto} →</a></div>
      <div class="wiz-nav no-print">${prev ? `<a class="btn" href="#/aprende/${prev.n}">← ${prev.titulo}</a>` : "<span></span>"}${next ? `<a class="btn" href="#/aprende/${next.n}">${next.titulo} →</a>` : "<span></span>"}</div>`;
  }

  // ---------- Ejemplos ----------
  function renderEjemplos() {
    view.innerHTML = `
      <h1 class="page-title">Ejemplos</h1>
      <p class="page-lead">Para ver cómo queda cada paso antes de hacerlo tú. Están aparte: puedes tocarlos, pero <b>no se guardan ni se mezclan con tus datos</b>. Si te sirve de punto de partida, pulsa «Copiar a mis datos».</p>
      <h2 class="sec-t">Ejemplo completo: atención en Urgencias</h2>
      <p class="field-sub">El AMFE del proceso «Atención integral en el Servicio de Urgencias», desde que el paciente llega a admisión hasta la decisión sobre su destino. Siete subprocesos, un equipo de diez perfiles, tres sesiones de trabajo y 49 fallos con su efecto, su causa y su puntuación. El fallo de mayor IPR: <i>omisión de constantes clave o mal registro en el triaje</i> (7 × 7 × 7 = 343).</p>
      <div class="ej-grid">${C.EJEMPLOS.fichas.map(f => `<a class="ej-card" href="${f.href}"><b>${esc(f.t)}</b><span>${esc(f.s)}</span></a>`).join("")}<a class="ej-card" href="#/amfe/ej-amfe-urg/1?informe=1"><b>Tabla AMFE</b><span>Todo en una vista imprimible</span></a></div>
      <h2 class="sec-t">Minicasos</h2>
      <p class="placeholder-box">Próximamente: casos cortos (transfusión, administración de medicación, alta hospitalaria, quirófano…) para practicar cada paso.</p>
      ${practica("Las cifras de los ejemplos son las del caso del curso. Adapta siempre los fallos y las puntuaciones a tu proceso y a tu unidad.")}`;
  }

  // ---------- Glosario ----------
  function renderGlosario() {
    view.innerHTML = `<h1 class="page-title">Glosario</h1><p class="page-lead">${C.GLOSARIO.length} términos en lenguaje llano.</p>
      <div class="input-wrap glos-buscar"><input id="glos-q" type="search" placeholder="Buscar término…" autocomplete="off" /></div>
      <dl class="glos-lista" id="glos-lista"></dl>`;
    const pinta = q => {
      const t = L.sinTildes(q);
      const l = C.GLOSARIO.filter(([a, b]) => !t || L.sinTildes(a + " " + b).includes(t)).sort((x, y) => x[0].localeCompare(y[0], "es"));
      $("#glos-lista").innerHTML = l.length ? l.map(([a, b]) => `<div class="glos-item"><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("") : `<p class="placeholder-box">Sin resultados.</p>`;
    };
    pinta(""); $("#glos-q").addEventListener("input", e => pinta(e.target.value));
  }

  // ---------- PDF en iOS (sin librerías; mismo método que Auditorías) ----------
  // En iOS, window.print() no hace nada cuando la app está instalada en la pantalla de inicio.
  function esIOS() { return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
  function toast(msg, ms) {
    let t = $("#toast");
    if (!msg) { if (t) t.hidden = true; return; }
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false; clearTimeout(toast.h);
    if (ms) toast.h = setTimeout(() => { t.hidden = true; }, ms);
  }
  function pdfDesdeJPEGs(paginas, wPt, hPt) {
    const enc = new TextEncoder(), partes = [], offs = []; let pos = 0;
    const push = x => { const b = typeof x === "string" ? enc.encode(x) : x; partes.push(b); pos += b.length; };
    const obj = (n, cuerpo) => { offs[n] = pos; push(`${n} 0 obj\n`); cuerpo(); push("\nendobj\n"); };
    push("%PDF-1.4\n"); push(new Uint8Array([37, 226, 227, 207, 211, 10]));
    const n = paginas.length;
    obj(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
    obj(2, () => push(`<< /Type /Pages /Kids [${paginas.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] /Count ${n} >>`));
    paginas.forEach((p, i) => {
      const pg = 3 + i * 3, cont = pg + 1, img = pg + 2, flujo = `q ${wPt} 0 0 ${hPt} 0 0 cm /Im${i} Do Q`;
      obj(pg, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wPt} ${hPt}] /Resources << /XObject << /Im${i} ${img} 0 R >> >> /Contents ${cont} 0 R >>`));
      obj(cont, () => { push(`<< /Length ${flujo.length} >>\nstream\n${flujo}\nendstream`); });
      obj(img, () => { push(`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.bytes.length} >>\nstream\n`); push(p.bytes); push("\nendstream"); });
    });
    const total = 3 + n * 3, xref = pos;
    let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
    for (let k = 1; k < total; k++) x += String(offs[k]).padStart(10, "0") + " 00000 n \n";
    push(x + `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(partes, { type: "application/pdf" });
  }
  async function generarPDF() {
    const ANCHO = 720, K = 2;
    const A4W = 595.28, A4H = 841.89, MARGEN_PT = 34;
    const PX = (A4W - 2 * MARGEN_PT) / ANCHO;
    const PW = A4W / PX, PH = A4H / PX, M = MARGEN_PT / PX, ALTO_UTIL = PH - 2 * M;
    const hoja = document.createElement("div");
    hoja.className = "view";
    hoja.style.cssText = `position:absolute;left:-20000px;top:0;width:${ANCHO}px;max-width:none;margin:0;padding:0;box-shadow:none;`;
    hoja.innerHTML = $("#view").innerHTML;
    $$(".informe-bar, [id]", hoja).forEach(el => { if (el.classList.contains("informe-bar")) el.remove(); else el.removeAttribute("id"); });
    $$("details", hoja).forEach(d => { d.open = true; });
    document.body.appendChild(hoja);
    try {
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const R0 = hoja.getBoundingClientRect();
      const ops = [], cortes = [0], bloques = [];
      const SIN_CORTE = ".print-head, .chart-card, tr, .formula, .box, .print-foot, h1, h2, h3, .ficha-cab, .leyenda";
      const rel = r => ({ x: r.left - R0.left, y: r.top - R0.top, w: r.width, h: r.height });
      const hayColor = c => !!c && c !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(c);
      const LADOS = ["Top", "Right", "Bottom", "Left"];
      const texto = (n, cs) => {
        const t = n.textContent, re = /\S+/g, rg = document.createRange(); let m;
        const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        while ((m = re.exec(t))) {
          rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
          const rs = rg.getClientRects(); if (!rs.length) continue;
          ops.push({ t: "txt", s: cs.textTransform === "uppercase" ? m[0].toUpperCase() : m[0], r: rel(rs[0]), font, col: cs.color, ls: cs.letterSpacing });
        }
      };
      const recorre = el => {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") return;
        const r = rel(el.getBoundingClientRect());
        if (r.h > 0) cortes.push(r.y + r.h);
        if (el.matches(SIN_CORTE)) bloques.push([r.y, r.y + r.h]);
        if (el instanceof SVGSVGElement) { ops.push({ t: "svg", el, r }); return; }
        const bordes = LADOS.map(l => [parseFloat(cs[`border${l}Width`]) || 0, cs[`border${l}Color`]]);
        if (hayColor(cs.backgroundColor) || bordes.some(b => b[0] > 0 && hayColor(b[1]))) ops.push({ t: "caja", r, bg: cs.backgroundColor, rad: parseFloat(cs.borderTopLeftRadius) || 0, bordes });
        if (el.tagName === "LI") {
          const ol = el.parentElement.tagName === "OL", idx = Array.prototype.indexOf.call(el.parentElement.children, el) + 1;
          ops.push({ t: "txt", s: ol ? idx + "." : "•", r: { x: r.x - (ol ? 20 : 14), y: r.y, w: 16, h: parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4 }, font: `normal 700 ${cs.fontSize} ${cs.fontFamily}`, col: ol ? "#9a3f06" : cs.color, ls: "normal" });
        }
        for (const n of el.childNodes) {
          if (n.nodeType === 1) recorre(n);
          else if (n.nodeType === 3 && n.textContent.trim()) texto(n, cs);
        }
      };
      recorre(hoja);
      for (const op of ops.filter(o => o.t === "svg")) {
        const cl = op.el.cloneNode(true), orig = [op.el, ...op.el.querySelectorAll("*")], copia = [cl, ...cl.querySelectorAll("*")];
        orig.forEach((o, i) => { const cs = getComputedStyle(o); copia[i].setAttribute("style", ["fill", "stroke", "stroke-width", "stroke-dasharray", "font-family", "font-size", "font-weight"].map(p => `${p}:${cs.getPropertyValue(p)}`).join(";")); });
        cl.setAttribute("xmlns", "http://www.w3.org/2000/svg"); cl.setAttribute("width", op.r.w); cl.setAttribute("height", op.r.h);
        op.img = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(cl)); });
      }
      const alto = Math.ceil(R0.height);
      const parte = y => bloques.some(([a, b]) => a < y - 0.5 && y + 0.5 < b && b - a < ALTO_UTIL);
      const cands = [...new Set(cortes.map(c => Math.ceil(c)))].sort((a, b) => a - b);
      const pags = []; let y0 = 0;
      while (y0 < alto - 1) {
        const lim = y0 + ALTO_UTIL;
        if (lim >= alto) { pags.push([y0, alto]); break; }
        const y = cands.filter(c => c > y0 + 80 && c <= lim && !parte(c)).pop() || Math.floor(lim);
        pags.push([y0, y]); y0 = y;
      }
      const ponFuente = (ctx, f) => { ctx.font = "10px serif"; ctx.font = f; if (ctx.font === "10px serif") ctx.font = f.replace(/^(.*?\d+(\.\d+)?px).*$/, "$1 sans-serif"); };
      const caja = (ctx, op) => {
        const { x, y, w, h } = op.r, rad = Math.min(op.rad, w / 2, h / 2);
        const camino = () => { ctx.beginPath(); if (rad > 0 && ctx.roundRect) ctx.roundRect(x, y, w, h, rad); else ctx.rect(x, y, w, h); };
        if (hayColor(op.bg)) { ctx.fillStyle = op.bg; camino(); ctx.fill(); }
        const [t, d, b, l] = op.bordes;
        if (op.bordes.every(z => z[0] === t[0] && z[1] === t[1]) && t[0] > 0 && hayColor(t[1])) { ctx.strokeStyle = t[1]; ctx.lineWidth = t[0]; ctx.beginPath(); if (rad > 0 && ctx.roundRect) ctx.roundRect(x + t[0] / 2, y + t[0] / 2, w - t[0], h - t[0], Math.max(0, rad - t[0] / 2)); else ctx.rect(x + t[0] / 2, y + t[0] / 2, w - t[0], h - t[0]); ctx.stroke(); return; }
        const lado = (z, rx, ry, rw, rh) => { if (z[0] > 0 && hayColor(z[1])) { ctx.fillStyle = z[1]; ctx.fillRect(rx, ry, rw, rh); } };
        lado(t, x, y, w, t[0]); lado(b, x, y + h - b[0], w, b[0]); lado(l, x, y, l[0], h); lado(d, x + w - d[0], y, d[0], h);
      };
      const dibujaPaginas = conSVG => pags.map(([a, b]) => {
        const cv = document.createElement("canvas"); cv.width = Math.round(PW * K); cv.height = Math.round(PH * K);
        const ctx = cv.getContext("2d");
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.scale(K, K); ctx.translate(M, M - a);
        ctx.beginPath(); ctx.rect(-2, a, ANCHO + 4, b - a); ctx.clip();
        for (const op of ops) {
          if (op.r.y >= b || op.r.y + op.r.h <= a) continue;
          if (op.t === "caja") caja(ctx, op);
          else if (op.t === "svg") { if (conSVG && op.img) ctx.drawImage(op.img, op.r.x, op.r.y, op.r.w, op.r.h); }
          else {
            ponFuente(ctx, op.font); ctx.fillStyle = op.col; ctx.textBaseline = "alphabetic";
            if ("letterSpacing" in ctx) ctx.letterSpacing = op.ls && op.ls !== "normal" ? op.ls : "0px";
            const mt = ctx.measureText(op.s), asc = mt.fontBoundingBoxAscent || mt.actualBoundingBoxAscent || op.r.h * 0.8, desc = mt.fontBoundingBoxDescent || mt.actualBoundingBoxDescent || op.r.h * 0.2;
            ctx.fillText(op.s, op.r.x, op.r.y + (op.r.h - (asc + desc)) / 2 + asc);
          }
        }
        const url = cv.toDataURL("image/jpeg", 0.9), bin = atob(url.slice(url.indexOf(",") + 1)), bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return { bytes, w: cv.width, h: cv.height };
      });
      let paginas;
      try { paginas = dibujaPaginas(true); } catch (e) { paginas = dibujaPaginas(false); }
      return pdfDesdeJPEGs(paginas, A4W, A4H);
    } finally { hoja.remove(); }
  }
  let pdfListo = null;
  const rutaActual = () => location.hash.split("?")[0];
  const fechaArchivo = () => new Date().toLocaleDateString("es-ES").replace(/\//g, "-");
  function nombreArchivo(ext) {
    const base = actual ? "AMFE " + (nombreAmfe(actual) || "").slice(0, 60) : "AMFE";
    return `${base.replace(/[\\/:*?"<>|%]/g, "").trim()} ${fechaArchivo()}.${ext}`;
  }
  function prepararPDF() {
    pdfListo = null; const r = rutaActual();
    setTimeout(() => { if (rutaActual() === r && document.body.classList.contains("ver-informe")) generarPDF().then(b => { pdfListo = { r, blob: b }; }).catch(() => {}); }, 300);
  }
  async function guardarPDF() {
    if (!document.body.classList.contains("ver-informe")) { irInforme(); toast("Preparando el PDF… pulsa de nuevo «Guardar / imprimir» en un momento.", 4000); return; }
    let blob = pdfListo && pdfListo.r === rutaActual() ? pdfListo.blob : null;
    if (!blob) { toast("Preparando el PDF…"); try { blob = await generarPDF(); pdfListo = { r: rutaActual(), blob }; } catch (e) { toast("No se ha podido crear el PDF.", 4000); return; } }
    const file = new File([blob], nombreArchivo("pdf"), { type: "application/pdf" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: file.name }); toast(""); }
      catch (e) { if (e && e.name === "AbortError") { toast(""); return; } toast("PDF listo: pulsa otra vez «Guardar / imprimir».", 4000); }
      return;
    }
    descargar(blob, file.name); toast("PDF descargado.", 3000);
  }
  function descargar(blob, nombre) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nombre;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 200);
  }
  function irInforme() { location.hash = rutaActual() + "?informe=1"; }
  function imprimir() {
    if (esIOS()) { guardarPDF(); return; }
    if (!document.body.classList.contains("ver-informe")) { irInforme(); setTimeout(() => window.print(), 400); return; }
    window.print();
  }

  // ---------- Copia de seguridad e importar ----------
  async function copiaSeguridad() {
    const contenido = JSON.stringify({ app: "amfe", v: L.VERSION_DATOS, exportado: hoy(), amfes: datosUsuario.amfes }, null, 1);
    const nombre = `AMFE copia ${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([contenido], { type: "application/json" });
    const file = new File([blob], nombre, { type: "application/json" });
    if (esIOS() && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: nombre }); } catch (e) { if (e && e.name === "AbortError") return; }
    } else descargar(blob, nombre);
    datosUsuario.ultimaCopia = hoy(); guardar(true);
    toast("Copia guardada. Guárdala en un sitio seguro (Archivos, Drive, correo…).", 4500);
    if (rutaActual() === "#/" || rutaActual() === "") renderHome();
  }
  function importar(file) {
    const fr = new FileReader();
    fr.onload = () => {
      let s = null; try { s = L.sanearDatos(JSON.parse(fr.result), genId, hoy()); } catch (e) { /* */ }
      if (!s) { toast("Ese archivo no es una copia de AMFE.", 4000); return; }
      // Nunca se importa nada con id de ejemplo
      s.amfes.forEach(x => { if (esIdEjemplo(x.id)) x.id = genId(); });
      const aplicar = modo => {
        const r = modo === "sustituir" ? s : L.fusionar(datosUsuario, s);
        datosUsuario.amfes = r.amfes; guardar(true);
        toast(`Importados ${plural(s.amfes.length, "AMFE", "AMFE")}.`, 4000);
        location.hash = "#/"; route();
      };
      if (!datosUsuario.amfes.length) { aplicar("sustituir"); return; }
      confirmar(`<p>La copia tiene <b>${plural(s.amfes.length, "AMFE", "AMFE")}</b>.</p><p><b>Añadir</b> los junta con los tuyos (si uno está en los dos, se queda el más reciente): así se trabaja en equipo. Si prefieres <b>sustituir</b> todo lo tuyo por la copia, pulsa «Sustituir».</p>`, "Añadir a mis datos", () => aplicar("anadir"), { titulo: "Importar copia", peligro: false, otro: ["Sustituir", () => confirmar("<p>Se borrarán tus AMFE actuales y se quedará solo lo de la copia. Esto no se puede deshacer.</p>", "Sustituir", () => aplicar("sustituir"))] });
    };
    fr.readAsText(file);
  }

  // ---------- Confirmación ----------
  function confirmar(html, siTxt, alSi, o = {}) {
    const m = $("#modal-confirmar");
    $("#conf-titulo").textContent = o.titulo || "¿Seguro?";
    $("#conf-texto").innerHTML = html;
    const si = $("#btn-conf-si"), no = $("#btn-conf-no");
    si.textContent = siTxt; si.className = "btn " + (o.peligro === false ? "btn--primary" : "btn--peligro");
    let extra = $("#btn-conf-otro"); if (extra) extra.remove();
    if (o.otro) { extra = document.createElement("button"); extra.id = "btn-conf-otro"; extra.className = "btn"; extra.textContent = o.otro[0]; no.after(extra); extra.onclick = () => { m.hidden = true; o.otro[1](); }; }
    si.onclick = () => { m.hidden = true; alSi(); };
    no.onclick = () => { m.hidden = true; };
    m.hidden = false; si.focus();
  }

  // ---------- Copiar un ejemplo a mis datos ----------
  function copiarAMisDatos() {
    if (!actual || !esIdEjemplo(actual.id)) return;
    const c = Object.assign(clon(actual), { id: genId(), creado: hoy(), modificado: hoy() });
    datosUsuario.amfes.push(c); guardar(true); location.hash = `#/amfe/${c.id}/${pasoActual}`;
    toast("Copiado a tus AMFE. Ya es tuyo: cámbialo a tu gusto.", 4000);
  }

  // ---------- Enrutado ----------
  const NAV = [["", "Inicio"], ["amfe", "Mis AMFE"], ["ejemplos", "Ejemplos"], ["aprende", "Aprende"], ["glosario", "Glosario"]];
  function buildNav() { $("#calc-nav").innerHTML = NAV.map(([r, t]) => `<a href="#/${r}" data-r="${r}">${t}</a>`).join(""); }
  function noEncontrado(que, href, txt) { view.innerHTML = `<div class="error-box">No se encuentra ${que} en este dispositivo.</div><p><a href="${href}">${txt}</a></p>`; }
  let previo = null;
  function route() {
    const [ruta, qs] = (location.hash.replace(/^#\/?/, "") || "").split("?");
    const partes = ruta.split("/"), q = new URLSearchParams(qs || "");
    const informe = q.get("informe") === "1";
    document.body.classList.toggle("ver-informe", informe);
    actual = null;
    const idR = partes[1] || "", ej = ejemplos();
    modoEjemplo = partes[0] === "ejemplos" || (esIdEjemplo(idR) && ej.amfes.some(x => x.id === idR));
    datos = modoEjemplo ? ej : datosUsuario;
    $("#banner-ejemplo").hidden = !modoEjemplo || informe || partes[0] === "ejemplos";
    let navR = partes[0];
    if (partes[0] === "amfe" && partes[1] === "nuevo") {
      const a = L.nuevoAmfe(genId(), hoy()); borradores.set(a.id, a); abiertos.clear(); pegarAbierto = false; previo = a.id;
      history.replaceState(null, "", `#/amfe/${a.id}/1`); renderAmfe(a, 1);
    } else if (partes[0] === "amfe" && partes[1]) {
      const a = buscaAmfe(partes[1]) || borradores.get(partes[1]);
      if (!a) noEncontrado("ese AMFE", "#/amfe", "Ir a mis AMFE");
      else {
        if (previo !== a.id) { abiertos.clear(); pegarAbierto = false; previo = a.id; }
        let n = parseInt(partes[2], 10);
        if (!(n >= 1 && n <= 8)) { const p = L.pasoPendiente(a, ENTREGA); n = p ? p.n : 1; history.replaceState(null, "", `#/amfe/${a.id}/${n}${informe ? "?informe=1" : ""}`); }
        renderAmfe(a, n);
      }
      navR = "amfe";
    } else if (partes[0] === "amfe") renderLista();
    else if (partes[0] === "ejemplos") renderEjemplos();
    else if (partes[0] === "aprende") renderAprende(parseInt(partes[1], 10) || 0);
    else if (partes[0] === "glosario") renderGlosario();
    else { renderHome(); navR = ""; }
    if (modoEjemplo) navR = "ejemplos";
    if (informe) { $$("details").forEach(d => { d.open = true; }); if (esIOS()) prepararPDF(); }
    $$("#calc-nav a").forEach(a => a.classList.toggle("active", a.dataset.r === navR));
    const act = $("#calc-nav a.active"); if (act && act.scrollIntoView) act.scrollIntoView({ block: "nearest", inline: "center" });
    window.scrollTo(0, 0);
  }

  // ---------- Eventos ----------
  function tocado(a) {
    a.modificado = hoy();
    if (a === actual && !esVacio(a) && !datos.amfes.includes(a)) { datos.amfes.push(a); borradores.delete(a.id); }
    guardar();
  }
  const buscaEn = (lista, id) => lista.find(x => x.id === id);
  // Los cuadros de texto crecen con lo escrito
  function autoAlto(el) { el.style.height = "auto"; el.style.height = el.scrollHeight + 2 + "px"; }
  new MutationObserver(() => $$("textarea.txt-in", view).forEach(el => { if (!el.closest("[hidden]")) autoAlto(el); })).observe(view, { childList: true, subtree: true });

  view.addEventListener("input", e => {
    const t = e.target, a = actual;
    if (t.matches("textarea.txt-in")) autoAlto(t);
    if (t.id === "pegar-txt") {
      const p = L.parsearTabla(t.value), z = $("[data-zona='pegar']"), b = $("[data-act='pegar-ok']");
      z.innerHTML = t.value.trim() ? (p.filas.length ? `<div class="note">ℹ Se ${p.filas.length === 1 ? "ha reconocido 1 fallo" : "han reconocido " + p.filas.length + " fallos"}${p.cabecera ? " (con fila de títulos)" : ""}. Primero: «${esc(L.corto(p.filas[0].fallo, 70))}».</div>` : "") + p.errores.map(x => `<div class="warn">⚠ ${esc(x)}</div>`).join("") : "";
      b.disabled = !p.filas.length; b.textContent = p.filas.length ? `Añadir ${plural(p.filas.length, "fallo", "fallos")}` : "Añadir los fallos";
      return;
    }
    if (!a) return;
    const f = t.dataset.f, esSel = t.tagName === "SELECT";
    if (t.dataset.s) { const s = buscaEn(a.subprocesos, t.dataset.s); if (!s) return; s[f] = t.value; tocado(a); refrescar(); return; }
    if (t.dataset.m) { const m = buscaEn(a.equipo, t.dataset.m); if (!m) return; m[f] = t.value; tocado(a); if (esSel) repintar(); else refrescar(); return; }
    if (t.dataset.x) { const x = buscaEn(a.sesiones, t.dataset.x); if (!x) return; x[f] = t.value; tocado(a); refrescar(); return; }
    if (t.dataset.fa) {
      const fa = buscaEn(a.fallos, t.dataset.fa); if (!fa) return;
      fa[f] = ["g", "o", "d"].includes(f) ? t.value.trim() : t.value; tocado(a);
      if (esSel) { abiertos.add(fa.id); repintar(); } else refrescar(fa.id);
      return;
    }
    if (t.dataset.k) { setPath(a, t.dataset.k, t.value); tocado(a); refrescar(); }
  });
  view.addEventListener("toggle", e => {
    if (e.target.matches && e.target.matches("details[data-recordar]") && !document.body.classList.contains("ver-informe")) escribir(KEY_FACIL, e.target.open ? "1" : "0");
  }, true);
  // Al entrar en un cuadro de G, O o D se ve la descripción de la escala aunque esté vacío
  view.addEventListener("focusin", e => {
    const t = e.target; if (!actual || !t.dataset.fa || !["g", "o", "d"].includes(t.dataset.f)) return;
    const ze = $(`[data-zesc="${t.dataset.fa}"]`), k = t.dataset.f;
    if (ze && !L.entero1a10(t.value)) ze.innerHTML = `<b>${L.ESCALA_NOM[k]}</b>: ${esc(L.ESCALA_PREG[k])}`;
  });

  view.addEventListener("click", e => {
    const t = e.target; let b;
    if ((b = t.closest(".info-btn"))) { const h = $("#help-" + b.dataset.info); if (!h) return; const open = h.hidden; h.hidden = !open; b.setAttribute("aria-expanded", String(open)); return; }
    const a = actual;
    if ((b = t.closest("[data-asis]")) && a) {
      const x = buscaEn(a.sesiones, b.dataset.asis); if (!x) return;
      const i = x.asistentes.indexOf(b.dataset.v); if (i < 0) x.asistentes.push(b.dataset.v); else x.asistentes.splice(i, 1);
      b.classList.toggle("active", i < 0); tocado(a); return;
    }
    if (!(b = t.closest("[data-act]"))) return;
    const act = b.dataset.act, id = b.dataset.id;
    // --- Lista ---
    if (act === "amfe-dup") {
      const o = buscaAmfe(id); if (!o) return;
      const c = Object.assign(clon(o), { id: genId(), titulo: (nombreAmfe(o) || "AMFE") + " (copia)", creado: hoy(), modificado: hoy() });
      datos.amfes.push(c); guardar(); renderLista(); toast("AMFE duplicado.", 2500);
    }
    else if (act === "amfe-del") {
      const o = buscaAmfe(id); if (!o) return;
      confirmar(`<p>Se borrará «${esc(L.corto(nombreAmfe(o) || "AMFE sin nombre", 80))}» con sus ${plural(o.fallos.length, "fallo", "fallos")}. Esto no se puede deshacer${datosUsuario.ultimaCopia ? "" : " (y aún no tienes ninguna copia de seguridad)"}.</p>`, "Borrar", () => {
        datos.amfes = datos.amfes.filter(x => x.id !== id); if (!modoEjemplo) datosUsuario.amfes = datos.amfes; guardar(true); renderLista();
      });
    }
    // --- Paso 1 ---
    else if (act === "sug-objetivo" && a) {
      const s = L.sugerirObjetivo(a);
      if (!s) { toast("Escribe primero el nombre del proceso.", 3000); return; }
      const hacer = () => { a.objetivo = s; tocado(a); repintar(); };
      if (lleno(a.objetivo)) confirmar("<p>Se sustituirá el objetivo que has escrito por el propuesto.</p>", "Sustituir", hacer, { peligro: false }); else hacer();
    }
    else if (act === "sub-add" && a) {
      const s = L.nuevoSubproceso(genId(), L.colorLibre(a)); a.subprocesos.push(s); tocado(a); repintar();
      const el = $(`[data-s="${s.id}"][data-f="nombre"]`); if (el) { el.focus(); el.scrollIntoView({ block: "center" }); }
    }
    else if ((act === "sub-subir" || act === "sub-bajar") && a) {
      const i = a.subprocesos.findIndex(s => s.id === id), j = act === "sub-subir" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= a.subprocesos.length) return;
      [a.subprocesos[i], a.subprocesos[j]] = [a.subprocesos[j], a.subprocesos[i]]; tocado(a); repintar();
    }
    else if (act === "sub-del" && a) {
      const s = buscaEn(a.subprocesos, id); if (!s) return;
      const n = a.fallos.filter(f => f.subprocesoId === id).length;
      const hacer = () => { a.subprocesos = a.subprocesos.filter(x => x.id !== id); a.fallos.forEach(f => { if (f.subprocesoId === id) f.subprocesoId = ""; }); tocado(a); repintar(); };
      if (n || lleno(s.nombre)) confirmar(`<p>Se quitará el subproceso «${esc(L.corto(s.nombre || "sin nombre", 60))}».${n ? ` Sus ${plural(n, "fallo", "fallos")} no se borran: quedarán «sin subproceso».` : ""}</p>`, "Quitar", hacer); else hacer();
    }
    // --- Paso 2 ---
    else if (act === "eq-sug" && a) {
      const p = L.PERFILES_SUG[Number(b.dataset.i)]; if (!p) return;
      if (a.equipo.some(m => L.normal(m.perfil) === L.normal(p.perfil))) { toast("Ese perfil ya está en el equipo.", 2500); return; }
      const m = Object.assign(L.nuevoMiembro(genId()), { perfil: p.perfil, rol: a.equipo.some(x => x.rol === p.rol && (p.rol === "coordinador" || p.rol === "secretario")) ? "miembro" : p.rol });
      a.equipo.push(m); tocado(a); repintar();
    }
    else if (act === "eq-add" && a) {
      const m = L.nuevoMiembro(genId()); a.equipo.push(m); tocado(a); repintar();
      const el = $(`[data-m="${m.id}"][data-f="perfil"]`); if (el) { el.focus(); el.scrollIntoView({ block: "center" }); }
    }
    else if (act === "eq-del" && a) {
      const m = buscaEn(a.equipo, id); if (!m) return;
      const hacer = () => { a.equipo = a.equipo.filter(x => x.id !== id); a.sesiones.forEach(x => { x.asistentes = x.asistentes.filter(y => y !== id); }); tocado(a); repintar(); };
      if (lleno(m.perfil) || lleno(m.justificacion)) confirmar(`<p>Se quitará «${esc(L.corto(etiquetaMiembro(m), 60))}» del equipo.</p>`, "Quitar", hacer); else hacer();
    }
    else if (act === "ses-add" && a) {
      const x = L.nuevaSesion(genId()); a.sesiones.push(x); tocado(a); repintar();
      const el = $(`[data-x="${x.id}"][data-f="actividad"]`); if (el) el.scrollIntoView({ block: "center" });
    }
    else if (act === "ses-tipo" && a) {
      L.SESIONES_TIPO.forEach(s => a.sesiones.push(Object.assign(L.nuevaSesion(genId()), s, { asistentes: a.equipo.map(m => m.id) })));
      tocado(a); repintar(); toast("Propuestas las 3 sesiones habituales. Pon las fechas y ajústalas.", 3500);
    }
    else if (act === "ses-del" && a) {
      const x = buscaEn(a.sesiones, id); if (!x) return;
      const hacer = () => { a.sesiones = a.sesiones.filter(y => y.id !== id); tocado(a); repintar(); };
      if (lleno(x.actividad) || lleno(x.resultados)) confirmar("<p>Se quitará esta sesión.</p>", "Quitar", hacer); else hacer();
    }
    // --- Paso 4 ---
    else if (act === "fa-toggle") {
      if (abiertos.has(id)) abiertos.delete(id); else abiertos.add(id);
      const card = $(`.fallo[data-fid="${id}"]`); if (!card) return;
      const ab = abiertos.has(id);
      $(".rg-body", card).hidden = !ab; $(".rg-toggle", card).setAttribute("aria-expanded", ab);
      if (ab) $$("textarea.txt-in", card).forEach(autoAlto); else if (card.getBoundingClientRect().top < 60) card.scrollIntoView({ block: "start" });
    }
    else if (act === "fa-abrir-todos" && a) {
      if (abiertos.size) abiertos.clear(); else a.fallos.forEach(f => abiertos.add(f.id));
      repintar();
    }
    else if (act === "fa-add" && a) {
      const f = Object.assign(L.nuevoFallo(genId(), L.siguienteNum(a)), { subprocesoId: b.dataset.sub || "" });
      a.fallos.push(f); abiertos.add(f.id); tocado(a); repintar();
      const el = $(`[data-fa="${f.id}"][data-f="fallo"]`); if (el) { el.focus(); el.scrollIntoView({ block: "center" }); }
    }
    else if (act === "fa-del" && a) {
      const f = buscaEn(a.fallos, id); if (!f) return;
      const hacer = () => { a.fallos = a.fallos.filter(x => x.id !== id); abiertos.delete(id); tocado(a); repintar(); };
      if ([f.fallo, f.efecto, f.causa, f.controles].some(lleno)) confirmar(`<p>Se quitará el fallo nº ${f.num} «${esc(L.corto(f.fallo || "sin describir", 60))}».</p>`, "Quitar", hacer); else hacer();
    }
    else if (act === "pegar-abrir") { pegarAbierto = true; repintar(); const el = $("#pegar-txt"); if (el) el.focus(); }
    else if (act === "pegar-cerrar") { pegarAbierto = false; repintar(); }
    else if (act === "pegar-ok" && a) {
      const p = L.parsearTabla($("#pegar-txt").value); if (!p.filas.length) return;
      const ns = L.incorporarFilas(a, p.filas, genId);
      pegarAbierto = false; tocado(a); repintar();
      toast(`Añadidos ${plural(p.filas.length, "fallo", "fallos")}${ns ? ` y ${plural(ns, "subproceso nuevo", "subprocesos nuevos")}` : ""}.`, 4000);
    }
    // --- Generales ---
    else if (act === "informe") irInforme();
    else if (act === "volver") location.hash = rutaActual();
    else if (act === "imprimir") imprimir();
    else if (act === "copia") copiaSeguridad();
    else if (act === "importar") $("#input-importar").click();
  });
  $("#banner-copiar").addEventListener("click", copiarAMisDatos);
  $("#input-importar").addEventListener("change", e => { const f = e.target.files && e.target.files[0]; if (f) importar(f); e.target.value = ""; });

  // Imprimir: abrir los desplegables y restaurarlos después
  let cerrados = [];
  window.addEventListener("beforeprint", () => { cerrados = $$("details").filter(d => !d.open); cerrados.forEach(d => { d.open = true; }); });
  window.addEventListener("afterprint", () => { cerrados.forEach(d => { d.open = false; }); cerrados = []; });

  // ---------- Tema ----------
  function setTema(t) {
    document.documentElement.setAttribute("data-tema", t);
    const m = $("#meta-theme-color"); if (m) m.content = t === "claro" ? "#f0f7fb" : "#0d1b2a";
  }
  setTema(document.documentElement.getAttribute("data-tema") || "claro");
  $("#btn-tema").addEventListener("click", () => {
    const t = document.documentElement.getAttribute("data-tema") === "oscuro" ? "claro" : "oscuro";
    setTema(t); escribir("amfe-tema", t);
  });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ev => { if (!leer("amfe-tema")) setTema(ev.matches ? "oscuro" : "claro"); });

  // ---------- Modales ----------
  const KEY_BIENV = "amfe-bienvenida-vista";
  const mb = $("#modal-bienvenida"), ma = $("#modal-acerca");
  const vista = leer(KEY_BIENV);
  if (!vista) mb.hidden = false;
  $("#btn-bienv-ok").addEventListener("click", () => { if ($("#modal-no-repetir").checked) escribir(KEY_BIENV, "1"); mb.hidden = true; });
  $("#btn-acerca").addEventListener("click", () => { ma.hidden = false; });
  $("#btn-acerca-cerrar").addEventListener("click", () => { ma.hidden = true; });
  ma.addEventListener("click", e => { if (e.target === ma) ma.hidden = true; });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { ma.hidden = true; $("#modal-confirmar").hidden = true; } });

  // ---------- Versiones y novedades ----------
  const KEY_VERSION = "amfe-version-vista";
  const listaCambios = n => `<div class="version-item"><div class="version-cab"><b>${esc(n.titulo)}</b><span class="version-tag">v${esc(n.version)} · ${esc(n.fecha)}</span></div><ul>${n.cambios.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>`;
  $("#historial-versiones").innerHTML = NOVEDADES.map(listaCambios).join("");
  $("#about-version").textContent = $("#footer-version").textContent = `Versión ${APP_VERSION}`;
  const mn = $("#modal-novedades");
  $("#btn-novedades-ok").addEventListener("click", () => { mn.hidden = true; escribir(KEY_VERSION, APP_VERSION); });
  (function gestionarNovedades() {
    const vistaV = leer(KEY_VERSION);
    if (vistaV === APP_VERSION) return;
    if (!vistaV && !vista) { escribir(KEY_VERSION, APP_VERSION); return; }
    const idx = NOVEDADES.findIndex(n => n.version === vistaV);
    const nuevas = idx > 0 ? NOVEDADES.slice(0, idx) : [NOVEDADES[0]];
    $("#novedades-sub").textContent = nuevas.length > 1 ? "Esto es lo nuevo desde tu última visita" : "Gracias por mantener la app al día";
    $("#novedades-body").innerHTML = nuevas.map(listaCambios).join("");
    if (mb.hidden) mn.hidden = false;
  })();

  // ---------- Service worker y aviso de nueva versión ----------
  let actualizando = false;
  function avisoActualizacion(reg) {
    if ($("#update-banner")) return;
    const b = document.createElement("div");
    b.id = "update-banner"; b.className = "update-banner no-print"; b.setAttribute("role", "status");
    b.innerHTML = "<span>Nueva versión disponible</span><button type=\"button\">Actualizar</button>";
    b.querySelector("button").addEventListener("click", () => { guardar(true); actualizando = true; if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" }); b.remove(); });
    document.body.appendChild(b);
  }
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").then(reg => {
      if (reg.waiting && navigator.serviceWorker.controller) avisoActualizacion(reg);
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing; if (!nw) return;
        nw.addEventListener("statechange", () => { if (nw.state === "installed" && navigator.serviceWorker.controller) avisoActualizacion(reg); });
      });
    }).catch(() => {});
    let recargando = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (recargando || !actualizando) return; recargando = true; location.reload(); });
  }

  // ---------- Instalar como aplicación ----------
  let avisoInstalar = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); avisoInstalar = e; const b = $("#btn-instalar"); if (b) b.hidden = false; });
  $("#btn-instalar").addEventListener("click", async () => { if (!avisoInstalar) return; avisoInstalar.prompt(); try { await avisoInstalar.userChoice; } catch (e) { /* */ } avisoInstalar = null; $("#btn-instalar").hidden = true; });
  window.addEventListener("appinstalled", () => { const b = $("#btn-instalar"); if (b) b.hidden = true; });
  if (matchMedia("(display-mode: standalone)").matches || navigator.standalone) { const i = $("#instalar-bloque"); if (i) i.classList.add("instalada"); }

  window.AMFE = { generarPDF, datos: () => datos };   // solo para pruebas desde la consola

  // ---------- Arranque ----------
  buildNav();
  window.addEventListener("hashchange", route);
  route();
})();
