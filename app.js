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
  const APP_VERSION = "2026.09";
  const NOVEDADES = [
    { version: "2026.09", fecha: "Octubre 2026", titulo: "Herramientas de apoyo y portal de las apps", cambios: [
      "En «Acerca de», nuevo grupo «Herramientas de apoyo»: el Anonimizador RGPD (seudonimiza o anonimiza una hoja de cálculo sin que los datos salgan de tu navegador) y el Normalizador Bibliográfico (pon tus referencias en Vancouver, APA y otros estilos).",
      "Y un enlace al portal cjgaland.github.io, la página que reúne todas las apps y explica cómo encajan."] },
    { version: "2026.08", fecha: "Octubre 2026", titulo: "Nueva app hermana: Rondas de Seguridad", cambios: [
      "Enlace a la nueva app hermana Rondas de Seguridad en la portada y en «Acerca de»: programa y haz las rondas de seguridad de una unidad; su «Traer de AMFE» convierte tus fallos prioritarios en preguntas de la ronda."] },
    { version: "2026.07", fecha: "Octubre 2026", titulo: "Nueva app hermana: Mapa de Riesgos", cambios: [
      "Enlace a la nueva app hermana Mapa de Riesgos en la portada y en «Acerca de»: une tu AMFE con el flujograma del proceso y pinta los riesgos sobre él, coloreados por su IPR, con el documento final."] },
    { version: "2026.06", fecha: "Octubre 2026", titulo: "Nuevas apps hermanas: Flujograma y DAFO · CAME", cambios: [
      "Enlaces a las nuevas apps hermanas Flujograma (dibuja el flujograma del proceso; su botón «Traer de AMFE» usa tus subprocesos y fallos prioritarios) y DAFO · CAME (análisis DAFO de una unidad), en la portada y en «Acerca de»."] },
    { version: "2026.05", fecha: "Octubre 2026", titulo: "Ishikawa, Ponte a prueba y minicasos", cambios: [
      "Diagrama de Ishikawa en cada fallo (paso 4), con las siete ramas de los ejercicios del curso, los «porqués» hasta la causa de fondo y un botón para llevar las causas elegidas a la columna «causa». La app dibuja la espina de pescado y el informe lo incluye como anexo.",
      "«Ponte a prueba»: las 15 preguntas de los temas de herramientas y AMFE del test del curso, con su explicación, y dos ejercicios prácticos: «¿fallo, efecto o causa?» y «puntúa este fallo» comparando con el equipo del curso.",
      "Seis minicasos para practicar un paso concreto: transfusión, administración de medicación, toma de constantes, alta hospitalaria, analítica urgente y preparación de quirófano.",
      "Enlaces a las apps hermanas en la portada y pequeños retoques."] },
    { version: "2026.04", fecha: "Octubre 2026", titulo: "Trabajo en equipo: ideas, votaciones y reuniones", cambios: [
      "Nuevo paso 3, Encontrar los fallos: lluvia de ideas por subproceso con preguntas guía, agrupación en bloques, aviso de ideas repetidas y técnica de grupo nominal (3, 2 y 1 puntos o del 1 al 10) con el recuento y los comentarios del grupo.",
      "Las ideas elegidas pasan a fallos con un toque, una a una o todas las de un bloque.",
      "Votación del equipo para la gravedad, la ocurrencia y la detección: cada miembro puntúa, la app calcula la media y avisa si los votos están muy separados.",
      "Modo reunión: letra grande y pantalla limpia para proyectar la lluvia de ideas, la votación y la matriz.",
      "Hoja de trabajo para las sesiones presenciales, en Word y PDF: escalas, lluvia de ideas, análisis de fallos y hoja de votación.",
      "Ediciones: al revisar el AMFE se crea una edición nueva que se compara con la anterior, y la portada avisa cuando se acerca la fecha de revisión.",
      "El ejemplo de Urgencias trae la lluvia de ideas y la votación de los ejercicios del curso."] },
    { version: "2026.03", fecha: "Octubre 2026", titulo: "Acciones de mejora, reevaluación e informe AMFE", cambios: [
      "Nuevo paso 7, Acciones de mejora: para cada fallo prioritario, una o varias acciones con qué, por qué, dónde, cuándo, quién y cómo (5W1H), su tipo, sobre qué actúa, su indicador y su estándar, y su estado.",
      "La app distingue las medidas fuertes, intermedias y débiles, avisa si todas son de formación o recordatorios y de los plazos vencidos, y propone el «por qué» a partir del efecto del fallo.",
      "«Traer de Indicadores»: usa un indicador que ya tengas en la app Indicadores, en este navegador o desde su copia de seguridad.",
      "Nuevo paso 8, Reevaluar y cerrar: la puntuación esperada tras las acciones (IPR residual), cuánto baja el riesgo, las conclusiones (con texto propuesto), la fecha de la próxima revisión y el control del documento.",
      "Informe AMFE completo y resumen para la Dirección, en Word editable y en PDF, con el mismo orden que el Documento Final del curso.",
      "El Excel incluye las acciones y la reevaluación, y el ejemplo de Urgencias trae las acciones de los ejercicios del curso."] },
    { version: "2026.02", fecha: "Octubre 2026", titulo: "Priorizar y matriz de riesgos", cambios: [
      "Nuevo paso 6, Priorizar: los N fallos de mayor IPR (15 por defecto, como el curso) o los que superan un umbral de IPR.",
      "Los fallos de gravedad 9–10 se señalan siempre, y se puede marcar un fallo como «crítico» o añadirlo y quitarlo a mano, escribiendo el motivo (la app propone uno).",
      "Matriz de riesgos gravedad × ocurrencia con las zonas de colores del curso, en 10 × 10 o agrupada en 5 × 5, con cada fallo del color de su subproceso.",
      "Priorización por subprocesos: dónde se concentran los riesgos.",
      "Exportar a Excel: tabla AMFE completa, prioritarios, matriz, subprocesos, equipo y sesiones, y escalas.",
      "La tabla imprimible y el PDF incluyen los prioritarios, la matriz y la priorización por subprocesos.",
      "Las apps Mapa de Riesgos y Auditorías podrán traer los fallos de este AMFE en el mismo navegador (próximamente en ellas)."] },
    { version: "2026.01", fecha: "Octubre 2026", titulo: "Primera versión: describir, analizar y puntuar", cambios: [
      "Asistente en 8 pasos con «Tu siguiente paso» en la portada. En esta versión están disponibles los pasos 1, 2, 4 y 5.",
      "El proceso y sus subprocesos, con su inicio, su fin y quién interviene, y propuesta del objetivo del proceso.",
      "El equipo del AMFE con su papel de cada miembro y las sesiones de trabajo, con avisos si falta coordinación, secretaría o algún estamento.",
      "Los fallos de cada subproceso con su efecto, su causa y los controles actuales. Aviso cuando un fallo está escrito como si fuera una causa o un efecto.",
      "Pegar los fallos desde Excel, Calc o Word.",
      "Puntuación de gravedad, ocurrencia y detección con la escala a la vista, IPR automático, orden por IPR y avisos de las trampas más habituales.",
      "Ejemplo completo del Servicio de Urgencias (49 fallos), Aprende (7 temas), glosario, tabla imprimible y copia de seguridad."] }
  ];
  const ENTREGA = 5;   // pasos ya construidos (ver L.PASOS[].entrega)

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
  const KEY_DATOS = "amfe-datos", KEY_INTERCAMBIO = "amfe-intercambio";
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
      // Paquete con forma fija para que otras apps del mismo dominio lo lean («Traer de AMFE»); nunca leen amfe-datos
      try { escribir(KEY_INTERCAMBIO, JSON.stringify(L.paqueteIntercambio(datosUsuario.amfes, APP_VERSION, hoy()))); } catch (e) { /* */ }
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
        <a class="guide-card" href="#/ejemplos"><span class="guide-num">Ej</span><div><div class="guide-q">Ejemplo</div><div class="guide-a">El AMFE completo de la <b>atención en Urgencias</b> (49 fallos, de la lluvia de ideas al informe) y <b>seis minicasos</b> para practicar.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card" href="#/aprende"><span class="guide-num">?</span><div><div class="guide-q">Aprende</div><div class="guide-a">${C.TEMAS.length} temas <b>explicados fácil</b>: del qué es un AMFE a las acciones de mejora.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card" href="#/prueba"><span class="guide-num">✓</span><div><div class="guide-q">Ponte a prueba</div><div class="guide-a">${C.TEST.length} preguntas del test con su <b>explicación</b>, y ejercicios prácticos.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card" href="#/glosario"><span class="guide-num">A–Z</span><div><div class="guide-q">Glosario</div><div class="guide-a">${C.GLOSARIO.length} términos <b>en lenguaje llano</b>, con buscador.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_AUD}" target="_blank" rel="noopener"><span class="guide-num">✓</span><div><div class="guide-q">Auditorías ↗</div><div class="guide-a">App hermana: <b>comprueba con una auditoría</b> si las medidas contra tus fallos prioritarios se aplican.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_IND}" target="_blank" rel="noopener"><span class="guide-num">%</span><div><div class="guide-q">Indicadores ↗</div><div class="guide-a">App hermana: <b>diseña los indicadores</b> con los que medirás tus acciones de mejora.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_TM}" target="_blank" rel="noopener"><span class="guide-num">n</span><div><div class="guide-q">Tamaño Muestral ↗</div><div class="guide-a">App hermana: <b>cuántos casos revisar</b> para medir esos indicadores.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_FLUJO}" target="_blank" rel="noopener"><span class="guide-num">→</span><div><div class="guide-q">Flujograma ↗</div><div class="guide-a">App hermana: <b>dibuja el flujograma</b> del proceso y marca los puntos críticos; puede traer tus subprocesos y fallos prioritarios.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_DAFO}" target="_blank" rel="noopener"><span class="guide-num">D</span><div><div class="guide-q">DAFO · CAME ↗</div><div class="guide-a">App hermana: <b>analiza tu unidad</b> con un DAFO para decidir qué proceso merece un AMFE.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_MAPA}" target="_blank" rel="noopener"><span class="guide-num">◆</span><div><div class="guide-q">Mapa de Riesgos ↗</div><div class="guide-a">App hermana: <b>elabora el mapa de riesgos</b> del proceso con este AMFE y su flujograma, con los riesgos coloreados por su IPR y el documento final.</div></div><span class="guide-go">›</span></a>
        <a class="guide-card guide-card--hermana" href="${L.URL_RONDAS}" target="_blank" rel="noopener"><span class="guide-num">✓</span><div><div class="guide-q">Rondas de Seguridad ↗</div><div class="guide-a">App hermana: <b>rondas de seguridad</b> en tu unidad; puede traer los fallos prioritarios de este AMFE como preguntas de la ronda.</div></div><span class="guide-go">›</span></a>
      </div>
      ${revisionesHtml(d)}
      ${practica("<b>Protección de datos:</b> un AMFE analiza un proceso, no a pacientes concretos. No escribas nombres de pacientes ni números de historia clínica.")}`;
  }

  function revisionesHtml(d) {
    const l = d.amfes.filter(a => !d.amfes.some(x => x.anteriorId === a.id)).map(a => ({ a, r: L.revisionProxima(a, hoyIso()) })).filter(x => x.r);
    return l.map(({ a, r }) => `<div class="warn">⚠ «${esc(L.corto(nombreAmfe(a) || "AMFE sin nombre", 60))}»: ${r.vencida ? `la revisión estaba prevista para el ${esc(L.fmtFecha(a.proxRevision))}` : `toca revisarlo en ${plural(r.dias, "día", "días")}`}. <a href="#/amfe/${a.id}/8">Crear una edición nueva</a></div>`).join("");
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
        <span class="badges">${r.maxIPR ? iprBadge(r.maxIPR, " ipr-badge--max") : ""}<span class="badge">${plural(r.subprocesos, "subproceso", "subprocesos")}</span><span class="badge">${plural(r.n, "fallo", "fallos")}</span><span class="badge badge--prog">Pasos ${hechos}/${disp.length}</span>${a.edicion && a.edicion !== "00" ? `<span class="badge">Edición ${esc(a.edicion)}</span>` : ""}${L.revisionProxima(a, hoyIso()) ? `<span class="ea-b ea-b--vencida">Toca revisar</span>` : ""}</span>
      </a>
      <div class="item-pie"><span>Modificado: ${fechaCorta(a.modificado)}</span><span><button class="link-btn" data-act="amfe-dup" data-id="${a.id}">Duplicar</button> · <button class="link-btn link-btn--peligro" data-act="amfe-del" data-id="${a.id}">Borrar</button></span></div>
    </div>`;
  }

  // ---------- Ficha de un AMFE: armazón común de los pasos ----------
  let actual = null, pasoActual = 1;
  const abiertos = new Set();          // fallos desplegados en el paso 4
  let pegarAbierto = false;
  const hoyIso = () => new Date().toISOString().slice(0, 10);
  const avisosDe = (a, n) => ({ 1: L.avisosProceso, 2: L.avisosEquipo, 3: L.avisosIdeas, 4: L.avisosFallos, 5: L.avisosPuntuar, 6: L.avisosPriorizar, 7: x => L.avisosMejorar(x, hoyIso()), 8: L.avisosCerrar }[n] || (() => []))(a);
  const avisosGenerales = (a, n) => avisosDe(a, n).filter(x => !x.fallo).map(avisoHtml).join("");
  const avisosFallo = (a, n, id) => avisosDe(a, n).filter(x => x.fallo === id && !x.accion).map(avisoHtml).join("");
  const avisosAccion = (a, id) => avisosDe(a, 7).filter(x => x.accion === id).map(avisoHtml).join("");

  function renderAmfe(a, n) {
    actual = a; pasoActual = n; nAyuda = 0;
    if (document.body.classList.contains("ver-informe")) {
      const fecha = new Date().toLocaleDateString("es-ES");
      if (docActual === "informe") renderDoc(L.documentoInforme(a, fecha, tamMatriz));
      else if (docActual === "hoja") renderDoc(L.documentoHoja(a, fecha));
      else if (docActual === "resumen") renderDoc(L.documentoResumen(a, fecha));
      else renderTabla(a);
      return;
    }
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
        <button type="button" class="link-btn ish-btn no-print" data-act="ish-toggle" data-id="${f.id}">${ishAbiertos.has(f.id) ? "Cerrar el diagrama de Ishikawa ▴" : `Buscar causas con un diagrama de Ishikawa${f.ishikawa.length ? ` (${plural(f.ishikawa.filter(x => lleno(x.texto)).length, "causa", "causas")})` : ""} ▾`}</button>
        ${ishAbiertos.has(f.id) ? ishHtml(f) : ""}
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
      <div class="toolbar no-print"><button class="btn" data-act="pegar-abrir">Pegar desde Excel</button>${a.fallos.length ? `<button class="btn" data-act="fa-abrir-todos">${abiertos.size ? "Cerrar todos" : "Abrir todos"}</button><button class="btn" data-act="informe">Ver tabla / PDF</button>` : ""}<button class="btn" data-act="doc-ver" data-doc="hoja">Hoja de trabajo</button></div>
      ${pegarAbierto ? pegarHtml() : ""}
      <div data-zona="avisos">${avisosGenerales(a, 4)}</div>
      ${a.subprocesos.length ? a.subprocesos.map((s, i) => grupoFallos(a, s, i)).join("") + grupoFallos(a, null, 0)
        : `<div class="placeholder-box"><p>Aún no hay subprocesos. <a href="#/amfe/${a.id}/1">Defínelos en el paso 1</a> o pega tu tabla: los subprocesos se crean solos.</p></div>${grupoFallos(a, null, 0)}`}`;
  }

  // ---------- Diagrama de Ishikawa por fallo (mejora B) ----------
  const ishAbiertos = new Set();
  const buscaCausa = (a, id) => { for (const f of a.fallos) { const x = f.ishikawa.find(y => y.id === id); if (x) return { f, x }; } return null; };
  // Espina de pescado: cabeza = el fallo; 4 espinas arriba y 3 abajo, con hasta 3 causas por espina (las elegidas, resaltadas)
  function ishSvg(f) {
    const W = 800, H = 380, Y = 190, cab = 630, R = Object.keys(L.RAMAS_ISHIKAWA);
    const corta = (s, n) => { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
    const lineas = (s, n, max) => { const w = String(s || "").split(/\s+/), r = [""]; w.forEach(p => { if ((r[r.length - 1] + " " + p).trim().length > n) r.push(p); else r[r.length - 1] = (r[r.length - 1] + " " + p).trim(); }); return r.slice(0, max).map((l, i, a) => i === max - 1 && r.length > max ? corta(l, n - 1) + "…" : l); };
    const huesos = R.map((k, i) => { const arriba = i < 4, x = arriba ? 205 + i * 135 : 272 + (i - 4) * 135; return { k, x, arriba }; });
    return `<svg class="ish-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagrama de Ishikawa del fallo ${f.num}">
      <line class="ish-espina" x1="20" y1="${Y}" x2="${cab}" y2="${Y}"/><path class="ish-espina" d="M${cab - 14} ${Y - 8} L${cab} ${Y} L${cab - 14} ${Y + 8}" fill="none"/>
      <rect class="ish-cab" x="${cab + 4}" y="${Y - 58}" width="${W - cab - 8}" height="116" rx="10"/>
      ${lineas(f.fallo, 22, 6).map((l, i, a) => `<text class="ish-cab-t" x="${(cab + W) / 2}" y="${Y - (a.length - 1) * 8.5 + i * 17 + 4}" text-anchor="middle">${esc(l)}</text>`).join("")}
      ${huesos.map(({ k, x, arriba }) => { const dy = arriba ? -1 : 1, x2 = x - 70, y2 = Y + dy * 150, cs = f.ishikawa.filter(c => c.cat === k && lleno(c.texto)).sort((p, q) => q.elegida - p.elegida).slice(0, 3); return `<g>
        <line class="ish-hueso" x1="${x}" y1="${Y}" x2="${x2}" y2="${y2}"/>
        <text class="ish-rama" x="${x2}" y="${y2 + dy * 14 + (arriba ? 0 : 6)}" text-anchor="middle">${esc(L.RAMAS_ISHIKAWA[k].corto)}</text>
        ${cs.map((c, j) => { const t = 0.36 + j * 0.24, px = x - 70 * t, py = Y + dy * 150 * t; return `<line class="ish-rama-l" x1="${px - 6}" y1="${py}" x2="${px}" y2="${py}"/><text class="ish-causa${c.elegida ? " ish-causa--el" : ""}" x="${px - 8}" y="${py + 3.5}" text-anchor="end"><title>${esc(c.texto)}</title>${esc(corta(c.texto, 21))}</text>`; }).join("")}
        ${f.ishikawa.filter(c => c.cat === k && lleno(c.texto)).length > 3 ? `<text class="ish-mas" x="${x2 + 8}" y="${y2 + dy * 2 + (arriba ? 14 : -6)}">+${f.ishikawa.filter(c => c.cat === k && lleno(c.texto)).length - 3}</text>` : ""}</g>`; }).join("")}
    </svg>`;
  }
  function ishHtml(f) {
    const ele = L.causasElegidas(f);
    return `<div class="ish no-print">
      <p class="field-sub">Para cada rama, ¿qué causas pueden llevar a este fallo? En cada causa, preguntad «¿por qué?» hasta llegar a la causa de fondo (normalmente basta con tres veces). No hace falta rellenar todas las ramas. Marcad las causas más importantes.</p>
      <div class="chart-card ish-graf" data-zish="${f.id}">${ishSvg(f)}</div>
      ${Object.keys(L.RAMAS_ISHIKAWA).map(k => { const cs = f.ishikawa.filter(c => c.cat === k); return `<div class="ish-rama-b">
        <div class="ish-rama-cab"><b>${L.RAMAS_ISHIKAWA[k].nom}</b><span>${esc(L.RAMAS_ISHIKAWA[k].que)}</span></div>
        ${cs.map(c => `<div class="ish-causa-f">
          <div class="ish-causa-fila"><label class="ish-el" title="Causa importante: pasará a la columna «causa»"><input type="checkbox" data-act="ish-elegir" data-id="${c.id}"${c.elegida ? " checked" : ""} /><span class="sr">Elegida</span></label>
            <input class="txt-in ish-in" data-ik="${c.id}" data-f="texto" value="${esc(c.texto)}" placeholder="Causa" autocomplete="off" />
            <button type="button" class="icon-btn" data-act="ish-del" data-id="${c.id}" aria-label="Quitar la causa">✕</button></div>
          <details class="ish-pq"${c.porques.some(lleno) ? " open" : ""}><summary>¿Por qué?${c.porques.some(lleno) ? ` (${c.porques.filter(lleno).length})` : ""}</summary>${[0, 1, 2].map(j => `<input class="txt-in ish-in ish-in--pq" data-ik="${c.id}" data-f="porques.${j}" value="${esc(c.porques[j])}" placeholder="${j + 1}.º ¿por qué?" autocomplete="off" />`).join("")}</details>
        </div>`).join("")}
        <button type="button" class="link-btn" data-act="ish-add" data-id="${f.id}" data-cat="${k}">+ Causa</button>
      </div>`; }).join("")}
      <div class="toolbar"><button class="btn btn--primary" data-act="ish-causa" data-id="${f.id}"${ele.length ? "" : " disabled"}>Llevar ${ele.length ? plural(ele.length, "la causa elegida", "las " + ele.length + " causas elegidas").replace(/^\d+ /, "") : "las causas elegidas"} a «causa»</button></div>
    </div>`;
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
      ${a.equipo.some(m => lleno(m.perfil)) ? `<button type="button" class="link-btn vot-btn no-print" data-act="vot-toggle" data-id="${f.id}">${votAbiertos.has(f.id) ? "Cerrar la votación ▴" : `Votación del equipo${f.votos.length ? ` (${plural(f.votos.length, "voto", "votos")})` : ""} ▾`}</button>` : ""}
      ${votAbiertos.has(f.id) ? votacionHtml(a, f) : ""}
    </div>`;
  }
  // Votación individual de G·O·D (mejora A): cada miembro puntúa; la app propone la media y avisa de la discrepancia
  const votAbiertos = new Set();
  function mediaHtml(f) {
    const m = L.mediaVotos(f), dis = L.discrepancia(f);
    if (!["g", "o", "d"].some(k => m[k])) return `<span class="field-sub">Cuando voten, aquí verás la media.</span>`;
    return ["g", "o", "d"].map(k => m[k] ? `<span class="vot-med${dis.includes(k) ? " vot-med--dis" : ""}" title="${m[k].n} votos · media exacta ${m[k].exacta.toFixed(1).replace(".", ",")} · entre el voto más alto y el más bajo hay ${plural(m[k].rango, "punto", "puntos")}"><b>${k.toUpperCase()} ${m[k].media}</b>${dis.includes(k) ? " ⚠" : ""}</span>` : `<span class="vot-med">${k.toUpperCase()} –</span>`).join("")
      + `<button type="button" class="chip chip--accent" data-act="vot-media" data-id="${f.id}">Usar la media</button>`;
  }
  function votacionHtml(a, f) {
    const M = a.equipo.filter(m => lleno(m.perfil)), voto = (m, k) => { const v = f.votos.find(x => x.miembroId === m.id); return v ? v[k] : ""; };
    return `<div class="vot no-print">
      <p class="field-sub">Cada miembro puntúa sin hablar con los demás; luego se comparan los votos. La app propone la media redondeada, pero el valor final lo decide el equipo.</p>
      <div class="table-wrap"><table class="mini vot-t"><thead><tr><th>Miembro</th><th>G</th><th>O</th><th>D</th></tr></thead><tbody>
        ${M.map(m => `<tr><td>${esc(L.corto(etiquetaMiembro(m), 38))}</td>${["g", "o", "d"].map(k => `<td><input class="txt-in vot-in" data-vf="${f.id}" data-vm="${m.id}" data-f="${k}" value="${esc(voto(m, k))}" inputmode="numeric" maxlength="2" aria-label="${L.ESCALA_NOM[k]} de ${esc(m.perfil)}" /></td>`).join("")}</tr>`).join("")}
      </tbody></table></div>
      <div class="vot-res" data-zmed="${f.id}">${mediaHtml(f)}</div>
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
      <div class="toolbar no-print">${btnReunion()}<button class="btn" data-act="doc-ver" data-doc="hoja">Hoja de trabajo y votación</button></div>
      <div class="res-linea" data-zona="resumen5">${resumen5(r)}</div>
      <div data-zona="avisos">${avisosGenerales(a, 5)}</div>
      ${F.length ? a.subprocesos.map((s, i) => { const l = L.ordenarFallos(F.filter(f => f.subprocesoId === s.id), "num"); return l.length ? `<section class="grupo-sub"><h3 class="grupo-t">${subPunto(s)}${i + 1}. ${esc(s.nombre || "Subproceso sin nombre")}</h3><div class="punt-lista">${l.map(f => filaPuntuar(a, f)).join("")}</div></section>` : ""; }).join("")
          + (F.some(f => !L.subDe(a, f)) ? `<section class="grupo-sub"><h3 class="grupo-t">${subPunto(null)}Sin subproceso</h3><div class="punt-lista">${L.ordenarFallos(F.filter(f => !L.subDe(a, f)), "num").map(f => filaPuntuar(a, f)).join("")}</div></section>` : "")
        : `<div class="placeholder-box"><p>Aún no hay fallos que puntuar. <a href="#/amfe/${a.id}/4">Escríbelos en el paso 4</a>.</p></div>`}
      <h2 class="sec-t">Orden por IPR</h2>
      <p class="page-lead">Así queda el orden. En el paso 6 elegiréis los fallos prioritarios y los veréis en la matriz de riesgos.</p>
      <div class="card chart-card" data-zona="grafico">${grafico(a)}</div>
      <div data-zona="orden">${tablaOrden(a)}</div>
      ${F.length ? `<div class="toolbar no-print sep-arriba"><button class="btn" data-act="informe">Ver tabla / PDF</button><button class="btn" data-act="excel">Exportar a Excel</button></div>` : ""}`;
  }
  function resumen5(r) {
    if (!r.n) return "";
    return `<span class="badge">${r.puntuados} de ${r.n} puntuados</span>${r.maxIPR ? iprBadge(r.maxIPR) : ""}${["muyalto", "alto", "medio", "bajo"].filter(k => r.porNivel[k]).map(k => `<span class="ipr-badge niv--${k}">${r.porNivel[k]} ${L.NIVELES_IPR.find(x => x.k === k).nom.toLowerCase()}</span>`).join("")}`;
  }

  // ---------- Paso 6 · Priorizar ----------
  const KEY_MATRIZ = "amfe-matriz";
  let tamMatriz = leer(KEY_MATRIZ) === "5" ? 5 : 10, soloPrio = true;
  const ZONA_COLOR = { verde: "verde", amarillo: "amarillo", naranja: "naranja", rojo: "rojo" };
  const zonaBadge = z => z ? `<span class="zona-b zona--${z}" title="Zona ${z} de la matriz de riesgos: riesgo ${L.ZONAS[z].nom.toLowerCase()}, ${L.ZONAS[z].que}">Zona ${z}</span>` : "";
  function matrizHtml(a, tam = tamMatriz, solo = soloPrio, conControles = true) {
    const m = L.prioridad(a), F = a.fallos.filter(f => lleno(f.fallo) && L.iprDe(f) && (!solo || m[f.id].prio));
    const M = L.matriz(F, tam), etq = i => tam === 10 ? String(i) : L.TRAMOS[i - 1];
    const leyendaSub = a.subprocesos.filter(s => F.some(f => f.subprocesoId === s.id));
    return `${conControles ? `<div class="mz-ctl no-print"><div class="seg" role="group" aria-label="Tamaño de la matriz">${[[10, "10 × 10"], [5, "5 × 5"]].map(([v, t]) => `<button type="button" class="${tam === v ? "active" : ""}" data-act="mz-tam" data-v="${v}">${t}</button>`).join("")}</div><div class="seg" role="group" aria-label="Qué fallos se ven">${[[true, "Prioritarios"], [false, "Todos"]].map(([v, t]) => `<button type="button" class="${solo === v ? "active" : ""}" data-act="mz-solo" data-v="${v ? 1 : 0}">${t}</button>`).join("")}</div></div>` : ""}
      <div class="mz-wrap">
        <div class="mz-eje-g" aria-hidden="true">Gravedad</div>
        <div class="mz mz--${tam}" role="table" aria-label="Matriz de riesgos: gravedad (filas) por ocurrencia (columnas)">
          ${M.map(fila => `<div class="mz-n" role="rowheader">${etq(fila[0].g)}</div>${fila.map(cl => `<div class="mz-c mz--${ZONA_COLOR[cl.zona]}" role="cell" title="G ${etq(cl.g)} · O ${etq(cl.o)} · zona ${cl.zona}${cl.fallos.length ? " · " + plural(cl.fallos.length, "fallo", "fallos") : ""}">${cl.fallos.map(f => { const s = L.subDe(a, f); return `<button type="button" class="mz-f sub-c${s ? s.color : "x"}${m[f.id].prio ? "" : " mz-f--no"}" data-act="ir-fallo" data-id="${f.id}" title="Nº ${f.num} · ${esc(L.corto(f.fallo, 80))} · IPR ${L.iprDe(f)}">${f.num}</button>`; }).join("")}</div>`).join("")}`).join("")}
          <div></div>${Array.from({ length: tam }, (_, i) => `<div class="mz-n mz-n--o">${etq(i + 1)}</div>`).join("")}
        </div>
        <div class="mz-eje-o" aria-hidden="true">Ocurrencia</div>
      </div>
      <div class="leyenda">${Object.keys(L.ZONAS).map(z => `<span><i class="mz--${z}"></i>${L.ZONAS[z].nom} (${L.ZONAS[z].que})</span>`).join("")}</div>
      ${leyendaSub.length ? `<div class="leyenda">${leyendaSub.map(s => `<span>${subPunto(s)}${esc(L.corto(s.nombre, 34))}</span>`).join("")}</div>` : ""}
      <p class="field-sub">${F.length ? `${plural(F.length, "fallo", "fallos")} en la matriz. Cada número es un fallo, del color de su subproceso${solo ? "" : "; los apagados no son prioritarios"}. Toca uno para ir a él.` : "No hay fallos que mostrar."}</p>`;
  }
  function criterioRes(a) {
    const m = L.prioridad(a), l = Object.values(m).filter(x => x.prio);
    const n = { criterio: l.filter(x => x.por === "criterio").length, critico: l.filter(x => x.por === "critico").length, manual: l.filter(x => x.por === "manual").length };
    const graves = Object.values(m).filter(x => x.grave).length;
    return `<b>${plural(l.length, "fallo prioritario", "fallos prioritarios")}</b>: ${[n.criterio ? `${n.criterio} por IPR` : "", n.critico ? `${n.critico} ${n.critico === 1 ? "crítico" : "críticos"}` : "", n.manual ? `${n.manual} a mano` : ""].filter(Boolean).join(", ") || "ninguno"}.${graves ? ` ${plural(graves, "fallo tiene", "fallos tienen")} gravedad 9–10.` : ""}`;
  }
  function filaPrio(a, f, P, m) {
    const e = m[f.id], s = L.subDe(a, f);
    const porTxt = e.prio ? (e.por === "criterio" ? (a.prioridad.modo === "umbral" ? "Supera el umbral de IPR" : `Entre los ${L.nPrioridad(a)} de mayor IPR`) : e.por === "critico" ? "Fallo crítico" : "Añadido a mano") : (f.manual === "no" ? "Quitado a mano" : "No prioritario");
    const bm = k => `data-fa="${f.id}" data-f="${k}"`;
    return `<div class="pf sub-c${s ? s.color : "x"}${e.prio ? " pf--on" : ""}" data-pf="${f.id}">
      <div class="pf-cab"><span class="rg-puesto">${P[f.id] ? "#" + P[f.id] : "–"}</span>
        <span class="pf-txt"><b>Nº ${f.num} · ${esc(f.fallo)}</b><span>${subPunto(s)}${esc(s ? s.nombre : "Sin subproceso")} · G ${esc(f.g)} · O ${esc(f.o)} · D ${esc(f.d)}</span></span>
        <span class="pf-badges">${iprBadge(L.iprDe(f))}${e.grave ? `<span class="badge badge--grave" title="Gravedad 9–10">Muy grave</span>` : ""}${zonaBadge(e.zona)}</span></div>
      <div class="pf-acc no-print">
        <button type="button" class="pf-btn${e.prio ? " on" : ""}" data-act="pf-prio" data-id="${f.id}" aria-pressed="${e.prio}" ${f.critico ? 'disabled title="Un fallo crítico siempre es prioritario"' : ""}>${e.prio ? "★ Prioritario" : "☆ No prioritario"}</button>
        <span class="pf-por">${porTxt}</span>
        <label class="pf-crit"><input type="checkbox" data-act="pf-critico" data-id="${f.id}"${f.critico ? " checked" : ""} /> Fallo crítico</label>
      </div>
      ${f.critico ? campo(f, "motivoCritico", "¿Por qué es crítico?", { bind: bm("motivoCritico"), area: true, ph: "p. ej. Evento centinela en el último año", extra: `<div class="quick no-print"><button type="button" class="chip chip--accent" data-act="pf-motivo" data-id="${f.id}" data-k="motivoCritico">✎ Proponer motivo</button></div>` }) : ""}
      ${f.manual ? campo(f, "motivo", f.manual === "si" ? "¿Por qué lo añadís a los prioritarios?" : "¿Por qué lo quitáis de los prioritarios?", { bind: bm("motivo"), area: true, ph: f.manual === "si" ? "p. ej. Gravedad 9 y ningún control actual" : "p. ej. Ya hay una acción en marcha", extra: f.manual === "si" ? `<div class="quick no-print"><button type="button" class="chip chip--accent" data-act="pf-motivo" data-id="${f.id}" data-k="motivo">✎ Proponer motivo</button></div>` : "" }) : ""}
      <div data-zav="${f.id}">${avisosFallo(a, 6, f.id)}</div>
    </div>`;
  }
  function listaPrio(a) {
    const P = L.puestos(a.fallos), m = L.prioridad(a), F = L.ordenarFallos(a.fallos.filter(f => lleno(f.fallo) && L.iprDe(f)));
    return F.length ? F.map(f => filaPrio(a, f, P, m)).join("") : `<p class="placeholder-box">Aún no hay fallos puntuados. <a href="#/amfe/${a.id}/5">Puntúalos en el paso 5</a>.</p>`;
  }
  function porSubHtml(a) {
    const S = L.porSubproceso(a).filter(s => s.n), max = Math.max(1, ...S.map(s => s.max));
    if (!S.length) return `<p class="field-sub">Aún no hay fallos en los subprocesos.</p>`;
    return `<div class="table-wrap"><table class="mini tabla-porsub"><thead><tr><th>Subproceso</th><th>Fallos</th><th>Prioritarios</th><th>IPR máx.</th><th>IPR medio</th><th class="col-barra">IPR máximo</th></tr></thead><tbody>
      ${S.map(s => `<tr><td>${subPunto(s)}${esc(s.nombre || "Sin nombre")}</td><td>${s.n}</td><td><b>${s.prio}</b></td><td>${s.max ? iprBadge(s.max) : "—"}</td><td>${s.media || "—"}</td><td class="col-barra"><span class="barra sub-c${s.color}"><i style="width:${Math.round(s.max / max * 100)}%"></i></span></td></tr>`).join("")}
    </tbody></table></div>`;
  }
  function paso6(a) {
    const umbral = a.prioridad.modo === "umbral";
    return `
      ${idea("No se puede actuar sobre todo a la vez. Priorizar es decidir <b>por dónde empezar</b>: los fallos de mayor IPR, sin olvidar los muy graves.")}
      ${facil(`<p>Lo habitual es quedarse con <b>los de mayor IPR</b> (en el curso, los 15 primeros) o con los que <b>superan un umbral</b> que acuerda el equipo. Además:</p>
        <ul><li>Un fallo con <b>gravedad 9–10</b> merece atención aunque su IPR no sea de los primeros: la app lo señala siempre.</li>
        <li>La marca <b>«fallo crítico»</b> sube un fallo a prioritario aunque su IPR sea bajo (un evento centinela, una exigencia normativa…). Usarla mucho distorsiona la jerarquía: escribid siempre el motivo.</li>
        <li>El equipo puede <b>añadir o quitar</b> un fallo a mano, explicando por qué.</li></ul>
        <p>La <b>matriz de riesgos</b> coloca cada fallo según su gravedad (filas) y su ocurrencia (columnas). No tiene en cuenta la detección, así que no sustituye al IPR, pero <b>comunica el riesgo de un vistazo</b>.</p>
        ${trampa("Un fallo en la zona roja de la matriz puede no salir prioritario por IPR porque «se detecta fácil». Comprobad que esa detección existe de verdad.")}`)}
      <div class="toolbar no-print">${btnReunion()}</div>
      <div class="card">
        <h2 class="sub-h">Criterio de prioridad</h2>
        <div class="seg" role="group">${[["top", "Los N de mayor IPR"], ["umbral", "Umbral de IPR"]].map(([v, t]) => `<button type="button" class="${a.prioridad.modo === v ? "active" : ""}" data-act="prio-modo" data-v="${v}">${t}</button>`).join("")}</div>
        ${umbral ? campo(a, "prioridad.umbral", "Prioritarios los fallos con IPR igual o mayor que…", { ph: "p. ej. 200", help: "Un umbral acordado por el equipo. Como orientación: 300 o más es muy alto, de 200 a 299 alto y de 100 a 199 medio." })
          : campo(a, "prioridad.n", "¿Cuántos fallos de mayor IPR?", { ph: "15", help: "En el curso se eligen los 15 de mayor IPR. A igual IPR, la app pone antes el de más gravedad." })}
        <p class="criterio-res" data-zona="criterio">${criterioRes(a)}</p>
      </div>
      <div data-zona="avisos">${avisosGenerales(a, 6)}</div>
      <h2 class="sec-t">Matriz de riesgos</h2>
      <div class="card chart-card" data-zona="matriz">${matrizHtml(a)}</div>
      <h2 class="sec-t">Fallos por orden de IPR</h2>
      <p class="page-lead">Los marcados con ★ son los prioritarios: pasarán a las acciones de mejora.</p>
      <div class="pf-lista" data-zona="lista6">${listaPrio(a)}</div>
      <h2 class="sec-t">Priorización por subprocesos</h2>
      <p class="page-lead">Dónde se concentran los riesgos del proceso.</p>
      <div data-zona="porsub">${porSubHtml(a)}</div>
      <div class="toolbar no-print sep-arriba"><button class="btn" data-act="informe">Ver tabla / PDF</button><button class="btn" data-act="excel">Exportar a Excel</button></div>
      ${practica("Las apps <b>Mapa de Riesgos</b> y <b>Auditorías</b> podrán traer estos fallos, con su IPR y su prioridad, desde este mismo navegador. Si trabajáis en otro dispositivo, usad la copia de seguridad.")}`;
  }

  // ---------- Paso 7 · Acciones de mejora ----------
  let indImportados = null, indPara = null;   // indicadores traídos de la app Indicadores y la acción que los espera
  const bac = (x, f) => `data-ac="${x.id}" data-f="${f}"`;
  const buscaAccion = (a, id) => { for (const f of a.fallos) { const x = f.acciones.find(y => y.id === id); if (x) return { f, x }; } return null; };
  const fzBadge = t => { const f = L.fuerzaMedida(t); return f ? `<span class="fz-b fz-b--${f}" title="${esc(L.FUERZAS[f].que)}">${L.FUERZAS[f].nom}</span>` : ""; };
  const estadoBadge = x => `<span class="ea-b ea-b--${L.vencida(x, hoyIso()) ? "vencida" : x.estado}">${L.vencida(x, hoyIso()) ? "Vencida" : L.ESTADOS_ACCION[x.estado]}</span>`;
  const segAc = (x, f, opciones) => `<div class="seg seg--wrap" role="group">${opciones.map(([v, t, tit]) => `<button type="button" class="${x[f] === v ? "active" : ""}" data-acpick="${x.id}" data-f="${f}" data-v="${v}"${tit ? ` title="${esc(tit)}"` : ""}>${t}</button>`).join("")}</div>`;
  function zonaInd(x) {
    if (indPara !== x.id || !indImportados) return "";
    return `<div class="field no-print"><div class="field-head"><label class="field-label">Elige un indicador de la app Indicadores</label></div><div class="input-wrap"><select class="txt-in" data-act-sel="usar-ind" data-ac="${x.id}"><option value="">— ${plural(indImportados.length, "indicador", "indicadores")} —</option>${indImportados.map((y, i) => `<option value="${i}">${esc(L.corto(y.nombre, 90))}</option>`).join("")}</select></div></div>`;
  }
  function accCard(a, f, x, i) {
    return `<div class="acc-card" data-acid="${x.id}">
      <div class="sub-cab"><span class="eq-n">${i + 1}</span><b>Acción ${i + 1}</b><span data-zfz="${x.id}">${fzBadge(x.que)}</span>${estadoBadge(x)}
        <span class="sub-acc no-print"><button type="button" class="link-btn link-btn--peligro" data-act="acc-del" data-id="${x.id}">Quitar</button></span></div>
      ${campo(x, "que", "Qué: la acción", { bind: bac(x, "que"), area: true, ph: "p. ej. Checklist digital obligatorio antes de cerrar el triaje", help: "Concreta y verificable. Las acciones que cambian el sistema (obligar, automatizar, eliminar el paso que falla) son más fuertes que formar o recordar." })}
      ${campo(x, "porque", "Por qué: lo que se quiere conseguir", { bind: bac(x, "porque"), area: true, ph: "p. ej. Para garantizar una valoración inicial completa", extra: `<div class="quick no-print"><button type="button" class="chip chip--accent" data-act="acc-porque" data-id="${x.id}">✎ Proponer a partir del efecto</button></div>` })}
      <div class="dos-col">
        ${campo(x, "donde", "Dónde", { bind: bac(x, "donde"), ph: "p. ej. Puesto de triaje" })}
        ${campo(x, "quien", "Quién: responsable", { bind: bac(x, "quien"), ph: "p. ej. Supervisión de Enfermería", help: "Un cargo o una persona concreta, no «todos» ni «el servicio»." })}
      </div>
      <div class="dos-col">
        ${campo(x, "plazo", "Cuándo: plazo", { bind: bac(x, "plazo"), ph: "p. ej. 1 mes" })}
        ${campo(x, "fin", "Fecha de fin", { bind: bac(x, "fin"), tipo: "date", opt: true })}
      </div>
      ${campo(x, "como", "Cómo: pasos para hacerla", { bind: bac(x, "como"), area: true, ph: "p. ej. Configuración en el módulo de triaje, sesiones formativas y supervisión semanal" })}
      <div class="field"><div class="field-head"><label class="field-label">Tipo de acción</label></div>${segAc(x, "tipo", Object.keys(L.TIPOS_ACCION).map(k => [k, L.TIPOS_ACCION[k].nom, L.TIPOS_ACCION[k].que]))}</div>
      <div class="field"><div class="field-head"><label class="field-label">Qué cambia</label></div>${segAc(x, "clase", Object.keys(L.CLASES_ACCION).map(k => [k, L.CLASES_ACCION[k].nom]))}</div>
      <div class="field"><div class="field-head"><label class="field-label">Sobre qué actúa</label></div><div class="quick">${Object.keys(L.ACTUA).map(k => `<button type="button" class="chip${x.actuaSobre.includes(k) ? " active" : ""}" data-acmulti="${x.id}" data-v="${k}">${L.ACTUA[k]}</button>`).join("")}</div></div>
      <div class="acc-ind">
        <div class="sub-cab"><b>Indicador de seguimiento</b><span class="sub-acc no-print"><button type="button" class="link-btn" data-act="ind-traer" data-id="${x.id}">Traer de Indicadores</button></span></div>
        <div data-zind="${x.id}">${zonaInd(x)}</div>
        ${campo(x, "indicador.nombre", "Indicador", { bind: bac(x, "indicador.nombre"), ph: "p. ej. % de triajes con las cuatro constantes registradas" })}
        ${campo(x, "indicador.formula", "Fórmula", { bind: bac(x, "indicador.formula"), opt: true, ph: "p. ej. Triajes con TA, FC, SatO₂ y Tª / triajes realizados × 100" })}
        <div class="dos-col">
          ${campo(x, "indicador.estandar", "Estándar", { bind: bac(x, "indicador.estandar"), ph: "p. ej. ≥ 95 %" })}
          ${campo(x, "indicador.fuente", "Fuente de datos", { bind: bac(x, "indicador.fuente"), opt: true, ph: "p. ej. Módulo de triaje" })}
        </div>
      </div>
      <div class="field"><div class="field-head"><label class="field-label">¿Cumple los criterios de una buena acción?</label></div><div class="quick">${Object.keys(L.COMPROBACION).map(k => `<button type="button" class="chip${x.comprobacion[k] ? " active" : ""}" data-acchk="${x.id}" data-v="${k}" title="${esc(L.COMPROBACION[k].que)}">${x.comprobacion[k] ? "✓ " : ""}${L.COMPROBACION[k].nom}</button>`).join("")}</div></div>
      <div class="field"><div class="field-head"><label class="field-label">Estado</label></div>${segAc(x, "estado", Object.keys(L.ESTADOS_ACCION).map(k => [k, L.ESTADOS_ACCION[k]]))}</div>
      ${campo(x, "nota", "Nota de seguimiento", { bind: bac(x, "nota"), area: true, opt: true, ph: "p. ej. Piloto terminado en noviembre" })}
      <div data-zac="${x.id}">${avisosAccion(a, x.id)}</div>
    </div>`;
  }
  function resumen7(a) {
    const m = L.resumenMejora(a, hoyIso());
    if (!m.prioritarios) return "";
    return `<span class="badge">${m.conAccion} de ${m.prioritarios} prioritarios con acción</span><span class="badge">${plural(m.acciones, "acción", "acciones")}</span>${Object.keys(L.ESTADOS_ACCION).filter(k => m.porEstado[k]).map(k => `<span class="ea-b ea-b--${k}">${L.cuentaEstado(k, m.porEstado[k])}</span>`).join("")}${m.vencidas ? `<span class="ea-b ea-b--vencida">${m.vencidas} ${m.vencidas === 1 ? "vencida" : "vencidas"}</span>` : ""}`;
  }
  function paso7(a) {
    const PR = L.prioritarios(a), P = L.puestos(a.fallos);
    return `
      ${idea("Cada fallo prioritario necesita al menos una acción que <b>ataque su causa</b>, con un responsable, un plazo y un indicador para comprobar que funciona.")}
      ${facil(`<p>Cada acción se describe con el modelo <b>5W1H</b>: <b>qué</b> se hace, <b>por qué</b>, <b>dónde</b>, <b>cuándo</b>, <b>quién</b> es responsable y <b>cómo</b> se hará.</p>
        <ul><li><b>Corrección</b>: arregla el fallo cuando ocurre. <b>Acción correctora</b>: elimina la causa. <b>Acción preventiva</b>: elimina un riesgo antes de que ocurra.</li>
        <li>Una buena acción es <b>específica</b> (ataca la causa), <b>factible</b>, <b>medible</b>, <b>sostenible</b> y <b>aceptable</b> para el equipo.</li>
        <li>Marca <b>sobre qué actúa</b>: lo normal es que baje la ocurrencia o mejore la detección. Lo usarás en el paso 8 para volver a puntuar.</li></ul>
        ${trampa("Formar, recordar o poner carteles son <b>medidas débiles</b>: dependen de la memoria y la buena voluntad. Combínalas con alguna que cambie el sistema (campo obligatorio, alerta automática, eliminar el paso que falla).")}`)}
      <div class="res-linea" data-zona="resumen7">${resumen7(a)}</div>
      <div data-zona="avisos">${avisosGenerales(a, 7)}</div>
      ${PR.length ? PR.map(f => { const s = L.subDe(a, f); return `<section class="acc-f sub-c${s ? s.color : "x"}" data-af="${f.id}">
        <div class="acc-f-cab"><span class="rg-puesto">${P[f.id] ? "#" + P[f.id] : "–"}</span><span class="pf-txt"><b>Nº ${f.num} · ${esc(f.fallo)}</b><span>${subPunto(s)}${esc(s ? s.nombre : "Sin subproceso")}</span></span>${iprBadge(L.iprDe(f))}</div>
        <dl class="acc-f-dl">${lleno(f.efecto) ? `<div><dt>Efecto</dt><dd>${esc(f.efecto)}</dd></div>` : ""}${lleno(f.causa) ? `<div><dt>Causa</dt><dd>${esc(f.causa)}</dd></div>` : ""}${lleno(f.controles) ? `<div><dt>Controles actuales</dt><dd>${esc(f.controles)}</dd></div>` : ""}</dl>
        <div data-zav="${f.id}">${avisosFallo(a, 7, f.id)}</div>
        ${f.acciones.map((x, i) => accCard(a, f, x, i)).join("")}
        <button class="btn btn--sm no-print" data-act="acc-add" data-id="${f.id}">+ ${f.acciones.length ? "Otra acción" : "Añadir una acción"}</button>
      </section>`; }).join("") : `<div class="placeholder-box"><p>No hay fallos prioritarios. <a href="#/amfe/${a.id}/6">Elígelos en el paso 6</a>.</p></div>`}
      ${PR.length ? `<div class="toolbar no-print sep-arriba"><button class="btn" data-act="excel">Exportar a Excel</button></div>` : ""}`;
  }

  // ---------- Paso 8 · Reevaluar y cerrar ----------
  const bfr = (f, k) => `data-fr="${f.id}" data-f="${k}"`;
  function resFila(f) {
    const v0 = L.iprDe(f), v1 = L.iprResidual(f);
    if (v1) return `${iprBadge(v0)} → ${iprBadge(v1)} <b class="red-pct${v1 < v0 ? "" : " red-pct--mal"}">${v1 < v0 ? "−" + Math.round((1 - v1 / v0) * 100) + " %" : "no baja"}</b>`;
    if ([f.residual.g, f.residual.o, f.residual.d].some(lleno)) return `<span class="ipr-falta">Enteros del 1 al 10</span>`;
    return `${iprBadge(v0)} → <span class="ipr-badge niv--sin">IPR tras acciones</span>`;
  }
  function filaResidual(a, f) {
    const s = L.subDe(a, f), act = new Set(f.acciones.flatMap(x => x.actuaSobre));
    return `<div class="punt sub-c${s ? s.color : "x"}" data-rid="${f.id}">
      <div class="punt-txt"><span class="rg-puesto">Nº ${f.num}</span><span><b>${esc(f.fallo)}</b><span class="punt-ef">${L.accionesDe(f).map(x => `• ${esc(L.corto(x.que, 90))} ${estadoBadge(x)}`).join("<br>")}</span></span></div>
      <p class="punt-esc">Antes: <b>G ${esc(f.g)} · O ${esc(f.o)} · D ${esc(f.d)}</b>${act.size ? ` · Las acciones actúan sobre: ${[...act].map(k => L.ACTUA[k].toLowerCase()).join(", ")}` : ""}</p>
      <div class="punt-god">
        ${["g", "o", "d"].map(k => `<label class="god-c"><span>${L.ESCALA_NOM[k]} tras</span><input class="txt-in" ${bfr(f, k)} value="${esc(f.residual[k])}" inputmode="numeric" maxlength="2" placeholder="${esc(f[k])}" aria-label="${L.ESCALA_NOM[k]} del fallo ${f.num} tras las acciones" /></label>`).join("")}
        <div class="punt-ipr punt-ipr--res" data-zres="${f.id}">${resFila(f)}</div>
      </div>
      ${campo(f, "residual.nota", "Nota", { bind: bfr(f, "nota"), opt: true, ph: "p. ej. Esperado cuando el checklist esté implantado" })}
      <div data-zav="${f.id}">${avisosFallo(a, 8, f.id)}</div>
    </div>`;
  }
  function grafico8(a) {
    const F = L.conAcciones(a).filter(L.iprResidual);
    if (!F.length) return `<p class="field-sub">Cuando vuelvas a puntuar los fallos, aquí verás el antes y el después.</p>`;
    const max = Math.max(...F.map(L.iprDe)), m = L.resumenMejora(a, "");
    return `<div class="ad-lista">${F.map(f => { const v0 = L.iprDe(f), v1 = L.iprResidual(f); return `<div class="ad"><span class="ad-n">Nº ${f.num}</span><div class="ad-barras" title="${esc(f.fallo)}"><span class="ad-b ad-b--antes" style="width:${Math.round(v0 / max * 100)}%">${v0}</span><span class="ad-b ad-b--desp niv-fill--${nivelTxt(v1)}" style="width:${Math.max(6, Math.round(v1 / max * 100))}%">${v1}</span></div></div>`; }).join("")}</div>
      <div class="leyenda"><span><i class="ad-b--antes"></i>IPR inicial</span><span><i class="niv-fill--medio"></i>IPR tras las acciones (color según su nivel)</span></div>
      <p class="field-sub">En conjunto, el IPR de estos ${plural(F.length, "fallo", "fallos")} pasaría de <b>${m.iprInicial}</b> a <b>${m.iprResidual}</b>: <b>un ${m.reduccion} % menos</b>.</p>`;
  }
  function personasHtml(a, k, titulo) {
    return `<div class="personas"><p class="personas-t">${titulo}</p>${a.control[k].map((x, i) => `<div class="persona">
      <input class="txt-in" data-cp="${k}" data-i="${i}" data-f="nombre" value="${esc(x.nombre)}" placeholder="Nombre (opcional)" autocomplete="off" />
      <input class="txt-in" data-cp="${k}" data-i="${i}" data-f="cargo" value="${esc(x.cargo)}" placeholder="Cargo" autocomplete="off" />
      <button type="button" class="icon-btn no-print" data-act="cp-del" data-k="${k}" data-i="${i}" aria-label="Quitar">✕</button></div>`).join("")}
      <button type="button" class="link-btn no-print" data-act="cp-add" data-k="${k}">+ Añadir persona</button></div>`;
  }
  function controlHtml(a) {
    return `${personasHtml(a, "elaborado", "Elaborado por")}${personasHtml(a, "revisado", "Revisado por")}${personasHtml(a, "aprobado", "Aprobado por")}
      <div class="personas"><p class="personas-t">Histórico de revisiones</p>${a.control.historial.map((h, i) => `<div class="persona persona--hist">
        <input class="txt-in" data-ch="${i}" data-f="edicion" value="${esc(h.edicion)}" placeholder="Ed." autocomplete="off" />
        <input class="txt-in" type="date" data-ch="${i}" data-f="fecha" value="${esc(h.fecha)}" />
        <input class="txt-in" data-ch="${i}" data-f="cambio" value="${esc(h.cambio)}" placeholder="Qué cambia" autocomplete="off" />
        <button type="button" class="icon-btn no-print" data-act="ch-del" data-i="${i}" aria-label="Quitar">✕</button></div>`).join("")}
        <button type="button" class="link-btn no-print" data-act="ch-add">+ Nueva edición</button></div>`;
  }
  function paso8(a) {
    const F = L.conAcciones(a);
    return `
      ${idea("El AMFE termina cuando el riesgo baja. Volved a puntuar cada fallo pensando en cómo quedará <b>cuando las acciones funcionen</b>.")}
      ${facil(`<p>El <b>IPR residual</b> es el que queda después de aplicar las acciones. Puede ser una previsión (al aprobar el plan) o una medida real (cuando las acciones ya están implantadas y los indicadores lo confirman).</p>
        <ul><li>Lo normal es que baje la <b>ocurrencia</b> (el fallo pasa menos) o la <b>detección</b> (se descubre antes de que dañe).</li><li>La <b>gravedad</b> del daño casi nunca cambia si no se cambia el proceso.</li></ul>
        <p>Después: conclusiones, control del documento y <b>fecha de la próxima revisión</b>. Los riesgos cambian con el tiempo, con las acciones y con los incidentes.</p>`)}
      <h2 class="sec-t">Reevaluación del riesgo</h2>
      ${F.length ? `<div class="punt-lista">${F.map(f => filaResidual(a, f)).join("")}</div>
        <div class="card chart-card" data-zona="grafico8">${grafico8(a)}</div>`
        : `<div class="placeholder-box"><p>Aún no hay acciones de mejora. <a href="#/amfe/${a.id}/7">Defínelas en el paso 7</a>.</p></div>`}
      <h2 class="sec-t">Conclusiones</h2>
      <div class="card">
        ${campo(a, "introduccion", "Introducción del informe", { area: true, opt: true, rows: 3, ph: "Si la dejas vacía, el informe usa un texto estándar", extra: `<div class="quick no-print"><button type="button" class="chip chip--accent" data-act="sug-intro">✎ Proponer introducción</button></div>` })}
        ${campo(a, "conclusiones", "Conclusiones", { area: true, rows: 4, ph: "Qué se ha encontrado, qué se va a hacer y cuánto bajará el riesgo", extra: `<div class="quick no-print"><button type="button" class="chip chip--accent" data-act="sug-concl">✎ Proponer conclusiones con las cifras</button></div>` })}
        ${campo(a, "proxRevision", "Próxima revisión del AMFE", { tipo: "date", help: "Lo habitual es revisarlo cada año, o antes si cambia el proceso o hay un incidente relacionado." })}
      </div>
      <h2 class="sec-t">Control del documento</h2>
      <div class="card">${controlHtml(a)}</div>
      <div data-zona="avisos">${avisosGenerales(a, 8)}</div>
      <h2 class="sec-t">Ediciones y revisión</h2>
      <div class="card">${edicionesHtml(a)}</div>
      <h2 class="sec-t">Documentos</h2>
      <div class="doc-botones">
        <div class="card"><h3 class="sub-h">Informe AMFE</h3><p class="field-sub">El documento completo, con el orden del Documento Final del curso: control del documento, proceso, equipo, resultados, matriz, acciones, reevaluación, conclusiones y anexos.</p>
          <div class="toolbar"><button class="btn btn--primary" data-act="doc-word" data-doc="informe">⬇ Word</button><button class="btn" data-act="doc-ver" data-doc="informe">Ver / PDF</button></div></div>
        <div class="card"><h3 class="sub-h">Resumen para la Dirección</h3><p class="field-sub">Una página: las cifras, los cinco riesgos más importantes con su acción, y la conclusión.</p>
          <div class="toolbar"><button class="btn btn--primary" data-act="doc-word" data-doc="resumen">⬇ Word</button><button class="btn" data-act="doc-ver" data-doc="resumen">Ver / PDF</button></div></div>
        <div class="card"><h3 class="sub-h">Tabla y Excel</h3><p class="field-sub">La tabla AMFE completa para imprimir y el libro de Excel con todas las hojas.</p>
          <div class="toolbar"><button class="btn" data-act="informe">Tabla / PDF</button><button class="btn" data-act="excel">Excel</button></div></div>
        <div class="card"><h3 class="sub-h">Hoja de trabajo</h3><p class="field-sub">Para las sesiones presenciales: escalas, lluvia de ideas, análisis de fallos y hoja de votación. Lo apuntado en papel se pasa luego con «Pegar desde Excel».</p>
          <div class="toolbar"><button class="btn" data-act="doc-word" data-doc="hoja">⬇ Word</button><button class="btn" data-act="doc-ver" data-doc="hoja">Ver / PDF</button></div></div>
      </div>`;
  }
  // Ediciones (mejora G): cada revisión periódica es una edición nueva que se compara con la anterior
  function edicionesHtml(a) {
    const ant = a.anteriorId ? buscaAmfe(a.anteriorId) : null, sig = datos.amfes.find(x => x.anteriorId === a.id);
    const rev = L.revisionProxima(a, hoyIso());
    let h = `<p>Edición <b>${esc(a.edicion || "00")}</b>${lleno(a.proxRevision) ? ` · Próxima revisión: <b>${esc(L.fmtFecha(a.proxRevision))}</b>${rev ? (rev.vencida ? ` <span class="ea-b ea-b--vencida">Pasada</span>` : ` <span class="ea-b ea-b--curso">En ${plural(rev.dias, "día", "días")}</span>`) : ""}` : ""}</p>
      <p class="field-sub">Cuando toque revisar el AMFE (por fecha, por un cambio en el proceso o por un incidente), crea una <b>edición nueva</b>: es una copia completa que podréis actualizar y comparar con esta.</p>`;
    if (sig) h += `<div class="note">ℹ Ya existe una edición posterior (${esc(sig.edicion)}). <a href="#/amfe/${sig.id}/8">Ir a la edición ${esc(sig.edicion)}</a></div>`;
    else h += `<div class="toolbar no-print"><button class="btn" data-act="ed-nueva">Crear la edición ${String((parseInt(a.edicion, 10) || 0) + 1).padStart(2, "0")}</button></div>`;
    if (a.anteriorId && !ant) h += `<p class="field-sub">La edición anterior no está en este dispositivo.</p>`;
    if (ant) {
      const C2 = L.compararEdiciones(ant, a), ico = { baja: "↓", sube: "↑", igual: "=", nuevo: "nuevo", quitado: "quitado", sin: "–" };
      const cambian = C2.filas.filter(x => x.cambio !== "igual");
      h += `<h3 class="sub-h">Comparación con la edición ${esc(ant.edicion)} <a class="field-sub" href="#/amfe/${ant.id}/8">(abrirla)</a></h3>
        <div class="res-linea"><span class="ea-b ea-b--hecha">${C2.baja} bajan</span><span class="ea-b ea-b--vencida">${C2.sube} suben</span><span class="badge">${C2.igual} igual</span><span class="badge">${C2.nuevo} nuevos</span><span class="badge">${C2.quitado} quitados</span></div>
        ${cambian.length ? `<div class="table-wrap"><table class="mini tabla-riesgos"><thead><tr><th>Nº</th><th>Modo de fallo</th><th>IPR antes</th><th>IPR ahora</th><th>Cambio</th></tr></thead><tbody>${cambian.map(x => `<tr><td>${x.num}</td><td>${esc(x.fallo)}</td><td>${x.antes ? iprBadge(x.antes) : "—"}</td><td>${x.ahora ? iprBadge(x.ahora) : "—"}</td><td class="cmp-${x.cambio}">${ico[x.cambio]}</td></tr>`).join("")}</tbody></table></div>` : `<p class="field-sub">Aún no hay cambios respecto a la edición anterior.</p>`}`;
    }
    return h;
  }

  // ---------- Paso 3 · Encontrar los fallos ----------
  let subIdeas = "";
  const btnReunion = () => `<button class="btn" data-act="reunion">${document.body.classList.contains("modo-reunion") ? "Salir del modo reunión" : "🖥 Modo reunión"}</button>`;
  function ideaFila(a, i) {
    const f = i.falloId ? a.fallos.find(x => x.id === i.falloId) : null;
    return `<div class="idea-fila">
      <input class="txt-in idea-in" data-idea="${i.id}" data-f="texto" value="${esc(i.texto)}" aria-label="Idea" autocomplete="off" />
      <div class="input-wrap idea-bq"><select class="txt-in" data-idea="${i.id}" data-f="bloqueId" aria-label="Bloque"><option value="">— Sin bloque —</option>${a.bloques.map(b => `<option value="${b.id}"${b.id === i.bloqueId ? " selected" : ""}>${esc(L.corto(b.nombre || "Bloque sin nombre", 40))}</option>`).join("")}</select></div>
      ${f ? `<a class="badge badge--clave idea-ok" href="#/amfe/${a.id}/4" title="Ya es el fallo nº ${f.num}">✓ Nº ${f.num}</a>` : `<button type="button" class="btn btn--sm" data-act="idea-fallo" data-id="${i.id}" title="Pasar esta idea al paso 4 como modo de fallo">→ Fallo</button>`}
      <button type="button" class="icon-btn" data-act="idea-del" data-id="${i.id}" aria-label="Quitar la idea">✕</button>
    </div>`;
  }
  function rankingHtml(a) {
    const R = L.ranking(a);
    if (!R.some(r => r.total)) return `<p class="field-sub">Cuando el equipo vote, aquí aparecerá el recuento.</p>`;
    return `<div class="table-wrap"><table class="mini tabla-riesgos tgn-res"><thead><tr><th>Puesto</th><th>Bloque</th><th>Puntos</th><th>Votos</th><th>Comentario del grupo</th><th></th></tr></thead><tbody>
      ${R.map((r, k) => { const pend = a.ideas.filter(i => i.bloqueId === r.b.id && lleno(i.texto) && !(i.falloId && a.fallos.some(f => f.id === i.falloId))).length; return `<tr${r.total ? "" : ' class="tgn-cero"'}><td>${r.total ? k + 1 : "–"}</td><td><b>${esc(r.b.nombre || "Sin nombre")}</b><br><span class="field-sub">${plural(r.ideas, "idea", "ideas")}</span></td><td><b>${r.total}</b></td><td>${r.votos}</td>
        <td><textarea class="txt-in txt-in--sm" data-bq="${r.b.id}" data-f="comentario" rows="2" placeholder="${r.total ? "Por qué es importante" : "Nadie lo ha votado: ¿por qué?"}">${esc(r.b.comentario)}</textarea></td>
        <td>${pend ? `<button type="button" class="btn btn--sm no-print" data-act="bloque-fallos" data-id="${r.b.id}">${pend === 1 ? "Pasar su idea a fallo" : `Pasar sus ${pend} ideas a fallos`}</button>` : ""}</td></tr>`; }).join("")}
    </tbody></table></div>`;
  }
  function votacionTgn(a) {
    const M = a.equipo.filter(m => lleno(m.perfil)), B = a.bloques;
    if (!M.length) return `<p class="placeholder-box">Para votar hace falta el equipo. <a href="#/amfe/${a.id}/2">Añádelo en el paso 2</a>.</p>`;
    if (B.length < 2) return `<p class="placeholder-box">Agrupa primero las ideas en al menos dos bloques.</p>`;
    if (a.tgn.modo === "321") return `<div class="table-wrap"><table class="mini tgn-t"><thead><tr><th>Miembro</th><th>3 puntos</th><th>2 puntos</th><th>1 punto</th></tr></thead><tbody>
      ${M.map(m => `<tr><td>${esc(L.corto(etiquetaMiembro(m), 34))}</td>${[3, 2, 1].map(pt => `<td><select class="txt-in tgn-sel" data-v321="${m.id}" data-p="${pt}" aria-label="${pt} puntos de ${esc(m.perfil)}"><option value="">—</option>${B.map(b => `<option value="${b.id}"${L.voto321(a, m.id, pt) === b.id ? " selected" : ""}>${esc(L.corto(b.nombre || "Sin nombre", 30))}</option>`).join("")}</select></td>`).join("")}</tr>`).join("")}
    </tbody></table></div>`;
    return `<div class="table-wrap"><table class="mini tgn-t tgn-t--10"><thead><tr><th>Bloque</th>${M.map(m => `<th title="${esc(m.perfil)}">${esc(L.corto(etiquetaMiembro(m), 14))}</th>`).join("")}</tr></thead><tbody>
      ${B.map(b => `<tr><td>${esc(L.corto(b.nombre || "Sin nombre", 40))}</td>${M.map(m => `<td><input class="txt-in vot-in" data-v10="${m.id}" data-b="${b.id}" value="${esc(L.voto1a10(a, m.id, b.id))}" inputmode="numeric" maxlength="2" aria-label="Voto de ${esc(m.perfil)} a ${esc(b.nombre)}" /></td>`).join("")}</tr>`).join("")}
    </tbody></table></div>`;
  }
  function paso3(a) {
    const SUB = a.subprocesos;
    if (!SUB.some(s => s.id === subIdeas)) subIdeas = SUB.length ? SUB[0].id : "";
    const grupos = [...SUB.map(s => [s, a.ideas.filter(i => i.subprocesoId === s.id)]), [null, a.ideas.filter(i => !SUB.some(s => s.id === i.subprocesoId))]].filter(([, l]) => l.length);
    return `
      ${idea("Primero, <b>muchas ideas sin juzgarlas</b>; después se agrupan en bloques y cada persona vota en silencio para quedarse con lo importante.")}
      ${facil(`<p><b>Lluvia de ideas</b>: para cada subproceso, cada persona dice qué puede salir mal. Todo se apunta, sin debatir ni criticar. Se puede pedir tres ideas a cada uno.</p>
        <p><b>Agrupar</b>: se juntan las ideas parecidas en bloques temáticos y se quitan las repetidas.</p>
        <p><b>Técnica de grupo nominal</b>: cada persona reparte en silencio 3, 2 y 1 puntos entre los bloques que le parecen más importantes; se suman y se comentan, también los bloques que nadie votó.</p>
        <p>Las ideas importantes pasan al <b>paso 4</b> como modos de fallo con un toque.</p>
        ${trampa("La lluvia de ideas puede dejar fuera las ideas minoritarias o de quien habla menos. Por eso se vota en silencio y de forma individual.")}`)}
      <div class="toolbar no-print">${btnReunion()}<button class="btn" data-act="doc-ver" data-doc="hoja">Hoja de trabajo</button></div>
      <h2 class="sec-t">1. Lluvia de ideas <span class="contador">${a.ideas.length}</span></h2>
      ${SUB.length ? `<div class="card ideas-entrada no-print">
        <div class="quick" role="group" aria-label="Subproceso">${SUB.map((s, i) => `<button type="button" class="chip chip-sub${s.id === subIdeas ? " active" : ""}" data-act="idea-sub" data-id="${s.id}">${subPunto(s)}${i + 1}. ${esc(L.corto(s.nombre || "Sin nombre", 30))}</button>`).join("")}</div>
        <p class="guia">${L.PREGUNTAS_GUIA.map(q => `<span>${esc(q)}</span>`).join("")}</p>
        <div class="idea-nueva"><input class="txt-in" id="idea-txt" placeholder="Escribe una idea y pulsa Intro" autocomplete="off" /><button class="btn btn--primary" data-act="idea-add">Añadir</button></div>
      </div>` : `<div class="placeholder-box"><p>Define primero los subprocesos en el <a href="#/amfe/${a.id}/1">paso 1</a>.</p></div>`}
      ${grupos.map(([s, l]) => `<section class="grupo-sub"><h3 class="grupo-t">${subPunto(s)}${s ? esc(s.nombre || "Sin nombre") : "Sin subproceso"} <span class="contador">${l.length}</span></h3><div class="ideas-lista">${l.map(i => ideaFila(a, i)).join("")}</div></section>`).join("")}
      <h2 class="sec-t">2. Agrupar en bloques <span class="contador">${a.bloques.length}</span></h2>
      <div class="card">
        <div class="idea-nueva no-print"><input class="txt-in" id="bloque-txt" placeholder="Nombre del bloque (p. ej. Identificación del paciente)" autocomplete="off" /><button class="btn" data-act="bloque-add">Crear bloque</button></div>
        <div class="bloques-lista">${a.bloques.map(b => `<div class="bloque-fila"><input class="txt-in" data-bq="${b.id}" data-f="nombre" value="${esc(b.nombre)}" aria-label="Nombre del bloque" autocomplete="off" /><span class="badge">${plural(a.ideas.filter(i => i.bloqueId === b.id).length, "idea", "ideas")}</span><button type="button" class="icon-btn no-print" data-act="bloque-del" data-id="${b.id}" aria-label="Quitar el bloque">✕</button></div>`).join("") || `<p class="field-sub">Crea los bloques y elige el de cada idea en su desplegable.</p>`}</div>
      </div>
      <h2 class="sec-t">3. Técnica de grupo nominal</h2>
      <div class="seg" role="group">${Object.keys(L.MODOS_TGN).map(k => `<button type="button" class="${a.tgn.modo === k ? "active" : ""}" data-act="tgn-modo" data-v="${k}" title="${esc(L.MODOS_TGN[k].que)}">${L.MODOS_TGN[k].nom}</button>`).join("")}</div>
      <p class="field-sub">${esc(L.MODOS_TGN[a.tgn.modo].que)}</p>
      ${votacionTgn(a)}
      <h3 class="sub-h">Recuento</h3>
      <div data-zona="ranking">${rankingHtml(a)}</div>
      <div data-zona="avisos">${avisosGenerales(a, 3)}</div>`;
  }

  const RENDER = { 1: paso1, 2: paso2, 3: paso3, 4: paso4, 5: paso5, 6: paso6, 7: paso7, 8: paso8 };

  // ---------- Documentos: bloques → HTML (vista previa, imprimir y PDF) y → Word ----------
  function bloquesHtml(bloques) {
    const celda = (c, cab) => { const o = c !== null && typeof c === "object" ? c : { texto: c }; const st = o.fondo ? ` style="background:#${o.fondo}"` : ""; const cl = [o.centro ? "c" : "", o.negrita ? "b" : ""].filter(Boolean).join(" "); return `<${cab ? "th" : "td"}${cl ? ` class="${cl}"` : ""}${st}>${escMl(o.texto)}</${cab ? "th" : "td"}>`; };
    return bloques.map(b => {
      if (b.t === "portada") return `<div class="doc-portada"><h1>${esc(b.titulo)}</h1>${b.sub ? `<p class="doc-sub">${esc(b.sub)}</p>` : ""}${(b.extra || []).map(x => `<p>${esc(x)}</p>`).join("")}</div>`;
      if (b.t === "h1") return `<h2 class="doc-h1">${esc(b.texto)}</h2>`;
      if (b.t === "h2") return `<h3 class="doc-h2">${esc(b.texto)}</h3>`;
      if (b.t === "p") return `<p class="doc-p${b.estilo === "nota" ? " doc-nota" : ""}">${b.runs ? b.runs.map(r => r.negrita ? `<b>${escMl(r.texto)}</b>` : escMl(r.texto)).join("") : escMl(b.texto)}</p>`;
      if (b.t === "lista") return `<ul class="doc-ul">${b.items.map(i => `<li>${esc(typeof i === "string" ? i : i.texto)}</li>`).join("")}</ul>`;
      if (b.t === "salto") return `<div class="doc-salto"></div>`;
      if (b.t === "tabla") {
        const suma = (b.anchos || []).reduce((a, x) => a + x, 0);
        const cols = b.anchos ? `<colgroup>${b.anchos.map(w => `<col style="width:${(w / suma * 100).toFixed(1)}%">`).join("")}</colgroup>` : "";
        return `<div class="table-wrap"><table class="doc-t${b.fuente && b.fuente < 9 ? " doc-t--peq" : ""}">${cols}${b.cab && !b.sinCab ? `<thead><tr>${b.cab.map(c => celda(c, true)).join("")}</tr></thead>` : ""}<tbody>${b.filas.map(f => `<tr>${f.map(c => celda(c, false)).join("")}</tr>`).join("")}</tbody></table></div>`;
      }
      return "";
    }).join("");
  }
  function renderDoc(doc) {
    view.innerHTML = `<div class="informe-bar informe-only"><button class="btn" data-act="volver">← Volver</button><span class="informe-acc"><button class="btn" data-act="doc-word" data-doc="${docActual}">⬇ Word</button><button class="btn btn--primary" data-act="imprimir">Guardar / imprimir</button></span></div>
      <div class="doc-prev doc-prev--informe">${bloquesHtml(doc.bloques)}</div>${informePie()}`;
  }
  function descargarWord(a, cual) {
    try {
      const fecha = new Date().toLocaleDateString("es-ES");
      const doc = cual === "resumen" ? L.documentoResumen(a, fecha) : cual === "hoja" ? L.documentoHoja(a, fecha) : L.documentoInforme(a, fecha, tamMatriz);
      const bytes = window.Docx.construirDocx(Object.assign({ pie: doc.titulo + " · Generado con la app AMFE" }, doc));
      const base = ({ resumen: "AMFE Resumen ", hoja: "AMFE Hoja de trabajo " }[cual] || "AMFE ") + (nombreAmfe(a) || "").slice(0, 60);
      compartirOBajar(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), `${base.replace(/[\\/:*?"<>|%]/g, "").trim()} ${fechaArchivo()}.docx`, "Word descargado. Ábrelo con Word, Pages o LibreOffice y ajústalo a tu gusto.");
    } catch (e) { toast("No se ha podido crear el Word.", 4000); }
  }

  // ---------- Vista imprimible: la tabla AMFE ----------
  function renderTabla(a) {
    const fila = (k, v) => lleno(v) ? `<tr><th>${k}</th><td>${escMl(v)}</td></tr>` : "";
    const r = L.resumen(a), P = L.puestos(a.fallos);
    const porSub = L.ordenarFallos(a.fallos.filter(f => lleno(f.fallo)), "sub", a.subprocesos);
    const porIpr = L.ordenarFallos(a.fallos.filter(L.iprDe)), PR = L.prioritarios(a), MP = L.prioridad(a);
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
      ${PR.length ? `<h2 class="sec-t">Fallos prioritarios</h2>
      <p class="field-sub">Criterio: ${a.prioridad.modo === "umbral" ? `IPR igual o mayor que ${esc(L.umbralPrioridad(a) || "—")}` : `los ${L.nPrioridad(a)} de mayor IPR`}${PR.some(f => f.critico) ? ", más los fallos críticos" : ""}${PR.some(f => f.manual === "si") ? " y los añadidos por el equipo" : ""}.</p>
      <div class="table-wrap"><table class="mini tabla-riesgos tabla-amfe"><thead><tr><th>Puesto</th><th>Nº</th><th>Subproceso</th><th>Modo de fallo</th><th>Efecto</th><th>Causa</th><th>IPR</th><th>Motivo</th></tr></thead><tbody>${PR.map(f => { const e = MP[f.id]; return `<tr><td>${P[f.id] || ""}</td><td>${f.num}</td><td>${esc(L.nombreSub(a, f))}</td><td><b>${esc(f.fallo)}</b>${e.grave ? " <span class=\"badge badge--grave\">Muy grave</span>" : ""}</td><td>${esc(f.efecto)}</td><td>${esc(f.causa)}</td><td>${iprBadge(L.iprDe(f))}</td><td>${esc(e.por === "critico" ? "Fallo crítico. " + f.motivoCritico : e.por === "manual" ? "Decisión del equipo. " + f.motivo : "Criterio de IPR")}</td></tr>`; }).join("")}</tbody></table></div>
      <h2 class="sec-t">Matriz de riesgos</h2>
      <div class="chart-card informe-graf">${matrizHtml(a, tamMatriz, true, false)}</div>
      <h2 class="sec-t">Priorización por subprocesos</h2>
      ${porSubHtml(a)}` : ""}
      <h2 class="sec-t">Escalas de puntuación</h2>
      ${escalaHtml(a)}
      ${lleno(a.notas) ? `<p class="field-sub">${escMl(a.notas)}</p>` : ""}
      ${informePie()}`;
  }

  // Refresca lo que depende de lo escrito sin repintar los campos (no se pierde el foco)
  function refrescar(idFallo, todo) {
    const a = actual; if (!a) return;
    const n = pasoActual;
    const Z = {
      pasos: () => pasosInner(a, n),
      avisos: () => avisosGenerales(a, n),
      nsub: () => String(a.subprocesos.length), neq: () => String(a.equipo.length), nses: () => String(a.sesiones.length),
      resumen5: () => resumen5(L.resumen(a)), grafico: () => grafico(a), orden: () => tablaOrden(a),
      criterio: () => criterioRes(a), matriz: () => matrizHtml(a), porsub: () => porSubHtml(a),
      lista6: () => listaPrio(a), ranking: () => rankingHtml(a),
      resumen7: () => resumen7(a), grafico8: () => grafico8(a)
    };
    // La lista del paso 6 solo se repinta si se cambia el criterio (si se escribe un motivo dentro, se perdería el foco)
    if (!todo) { delete Z.lista6; delete Z.ranking; }
    $$("[data-zish]").forEach(el => { const f = a.fallos.find(x => x.id === el.dataset.zish); if (f) el.innerHTML = ishSvg(f); });
    $$("[data-zmed]").forEach(el => { const f = a.fallos.find(x => x.id === el.dataset.zmed); if (f) el.innerHTML = mediaHtml(f); });
    $$("[data-zona]").forEach(el => { const f = Z[el.dataset.zona]; if (f) el.innerHTML = f(); });
    $$("[data-zav]").forEach(el => { el.innerHTML = avisosFallo(a, n, el.dataset.zav); });
    $$("[data-zac]").forEach(el => { el.innerHTML = avisosAccion(a, el.dataset.zac); });
    $$("[data-zfz]").forEach(el => { const r = buscaAccion(a, el.dataset.zfz); if (r) el.innerHTML = fzBadge(r.x.que); });
    $$("[data-zres]").forEach(el => { const f = a.fallos.find(x => x.id === el.dataset.zres); if (f) el.innerHTML = resFila(f); });
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
      <div class="toolbar"><a class="btn" href="#/prueba/${PRUEBA_DE_TEMA[t.n]}">✓ Ponte a prueba</a><a class="btn btn--primary" href="${t.practica.href}">${t.practica.texto} →</a></div>
      <div class="wiz-nav no-print">${prev ? `<a class="btn" href="#/aprende/${prev.n}">← ${prev.titulo}</a>` : "<span></span>"}${next ? `<a class="btn" href="#/aprende/${next.n}">${next.titulo} →</a>` : "<span></span>"}</div>`;
  }

  // ---------- Ponte a prueba ----------
  // Tema de Aprende → bloque del test del curso (2 = Herramientas, 4 = AMFE I, 5 = AMFE II)
  const PRUEBA_DE_TEMA = { 1: 4, 2: 4, 3: 2, 4: 2, 5: 5, 6: 5, 7: 5 };
  const respuestas = {}, respFec = {}, puntuaciones = {};
  // Orden de las opciones barajado pero estable (para que la correcta no esté siempre en el mismo sitio)
  const barajar = (n, semilla) => { const a = Array.from({ length: n }, (_, i) => i); let s = semilla * 9301 + 49297; for (let i = n - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pillsPrueba = actualP => `<div class="tema-pills prueba-pills no-print"><a href="#/prueba" class="pdca--P${!actualP ? " actual" : ""}" title="Todas las preguntas">T</a>${Object.keys(C.TEMAS_TEST).map(k => `<a href="#/prueba/${k}" class="pdca--P${String(actualP) === k ? " actual" : ""}" title="${esc(C.TEMAS_TEST[k].nom)}">${k}</a>`).join("")}<a href="#/prueba/practica" class="pdca--H${actualP === "practica" ? " actual" : ""}" title="Ejercicios prácticos">✎</a></div>`;
  function renderPrueba(tema) {
    if (tema === "practica") { renderPractica(); return; }
    const Q = C.TEST.map((q, i) => Object.assign({ i }, q)).filter(q => !tema || q.t === tema);
    view.innerHTML = `
      <h1 class="page-title">Ponte a prueba</h1>
      <p class="page-lead">${C.TEST.length} preguntas del test del curso sobre herramientas y AMFE${tema ? ` (aquí, las del bloque «${esc(C.TEMAS_TEST[tema].nom)}»)` : ""}. Toca la respuesta que creas correcta y lee la explicación. Y en ✎, dos ejercicios prácticos.</p>
      ${pillsPrueba(tema)}
      <div class="marcador" data-zona="marcador">${marcadorHtml(Q)}</div>
      <div class="card">${Q.map(q => { const ord = barajar(q.o.length, q.i + 1), r = respuestas[q.i]; return `<div class="quiz-q" data-q="${q.i}">
        <p><span class="badge">${esc(C.TEMAS_TEST[q.t].nom)}</span> <b>${esc(q.q)}</b></p>
        ${ord.map(j => `<button class="quiz-o${r != null ? (j === q.ok ? " quiz-o--ok" : j === r ? " quiz-o--mal" : "") : ""}" data-act="quiz" data-q="${q.i}" data-o="${j}">${esc(q.o[j])}</button>`).join("")}
        <p class="quiz-fb"${r == null ? " hidden" : ""}>${r != null ? `${r === q.ok ? "<b>¡Correcto!</b> " : "<b>No.</b> "}${esc(q.e)} <a href="#/aprende/${C.TEMAS_TEST[q.t].aprende}">Repasar en «Aprende»</a>` : ""}</p>
      </div>`; }).join("")}</div>
      <div class="toolbar no-print"><button class="btn" data-act="quiz-reset">Empezar de nuevo</button><a class="btn btn--primary" href="#/prueba/practica">Ejercicios prácticos →</a></div>`;
  }
  function marcadorHtml(Q) {
    const hechas = Q.filter(q => q.i in respuestas), bien = hechas.filter(q => respuestas[q.i] === q.ok).length;
    if (!hechas.length) return `<span class="field-sub">Aciertos: 0 de ${Q.length}</span>`;
    const p = bien / hechas.length;
    return `<span><b>${bien}</b> aciertos de ${hechas.length} respondidas (de ${Q.length})</span>${hechas.length === Q.length ? `<span class="sem-b sem-b--${p >= 0.8 ? "verde" : p >= 0.6 ? "ambar" : "rojo"}">${p >= 0.8 ? "¡Muy bien!" : p >= 0.6 ? "Bien: repasa los fallos" : "Repasa «Aprende»"}</span>` : ""}`;
  }
  const EXPLICA_FEC = { fallo: "Es un <b>modo de fallo</b>: lo que sale mal, un hecho concreto y observable.", efecto: "Es un <b>efecto</b>: lo que le pasaría al paciente o al proceso si el fallo ocurre.", causa: "Es una <b>causa</b>: por qué podría ocurrir el fallo." };
  function renderPractica() {
    const E = C.EJERCICIOS, bien = E.fec.filter((x, i) => respFec[i] === x.tipo).length, hechas = Object.keys(respFec).length;
    view.innerHTML = `
      <h1 class="page-title">Ponte a prueba · ejercicios</h1>
      <p class="page-lead">Dos ejercicios con frases y puntuaciones del AMFE de Urgencias del curso.</p>
      ${pillsPrueba("practica")}
      <h2 class="sec-t">1. ¿Fallo, efecto o causa?</h2>
      <p class="field-sub">El error más frecuente al empezar un AMFE es mezclar las tres columnas. ¿Dónde pondrías cada frase? ${hechas ? `<b>${bien} de ${hechas}</b> bien.` : ""}</p>
      <div class="card">${E.fec.map((x, i) => { const r = respFec[i]; return `<div class="quiz-q fec-q">
        <p><b>«${esc(x.texto)}»</b></p>
        <div class="seg seg--wrap" role="group">${["fallo", "efecto", "causa"].map(k => `<button type="button" class="${r === k ? (k === x.tipo ? "fec-ok" : "fec-mal") : r && k === x.tipo ? "fec-ok" : ""}" data-act="fec" data-i="${i}" data-v="${k}">${{ fallo: "Modo de fallo", efecto: "Efecto", causa: "Causa" }[k]}</button>`).join("")}</div>
        ${r ? `<p class="quiz-fb">${r === x.tipo ? "<b>¡Correcto!</b> " : "<b>No.</b> "}${EXPLICA_FEC[x.tipo]} En el AMFE del curso es la columna «${x.tipo}» del fallo nº ${x.num}.</p>` : ""}
      </div>`; }).join("")}</div>
      <h2 class="sec-t">2. Puntúa este fallo</h2>
      <p class="field-sub">Puntúa de 1 a 10 la gravedad, la ocurrencia y la detección, y compara con lo que decidió el equipo del curso. No hay una única respuesta correcta: lo importante es saber justificarla.</p>
      ${E.puntua.map(x => { const p = puntuaciones[x.num] || {}; const mi = L.ipr(p.g, p.o, p.d), cur = L.ipr(x.g, x.o, x.d); return `<div class="card punt-ej">
        <p><b>Nº ${x.num} · ${esc(x.fallo)}</b></p><p class="field-sub">Efecto: ${esc(x.efecto)} · Causa: ${esc(x.causa)}</p>
        <div class="punt-god">${["g", "o", "d"].map(k => `<label class="god-c"><span>${L.ESCALA_NOM[k]}</span><input class="txt-in" data-pe="${x.num}" data-f="${k}" value="${esc(p[k] || "")}" inputmode="numeric" maxlength="2" placeholder="1–10" /></label>`).join("")}
          <div class="punt-ipr"><button type="button" class="btn btn--sm" data-act="pe-ver" data-id="${x.num}">Comparar</button></div></div>
        ${p.ver ? `<div class="note">ℹ El equipo del curso: <b>G ${x.g} · O ${x.o} · D ${x.d}</b> (IPR ${cur}).${mi ? ` Tú: IPR ${mi}.` : " Completa tus tres puntuaciones para ver tu IPR."} ${mi ? (["g", "o", "d"].some(k => Math.abs(L.entero1a10(p[k]) - x[k]) >= 3) ? "En alguna escala hay 3 puntos o más de diferencia: ¿imaginabais el mismo fallo, el mismo daño, los mismos controles?" : "Muy parecido al equipo del curso.") : ""}</div>` : ""}
      </div>`; }).join("")}
      <div class="toolbar no-print"><button class="btn" data-act="practica-reset">Empezar de nuevo</button><a class="btn" href="#/prueba">← Preguntas del test</a></div>`;
  }

  // ---------- Ejemplos ----------
  function renderEjemplos() {
    view.innerHTML = `
      <h1 class="page-title">Ejemplos</h1>
      <p class="page-lead">Para ver cómo queda cada paso antes de hacerlo tú. Están aparte: puedes tocarlos, pero <b>no se guardan ni se mezclan con tus datos</b>. Si te sirve de punto de partida, pulsa «Copiar a mis datos».</p>
      <h2 class="sec-t">Ejemplo completo: atención en Urgencias</h2>
      <p class="field-sub">El AMFE del proceso «Atención integral en el Servicio de Urgencias», desde que el paciente llega a admisión hasta la decisión sobre su destino. Siete subprocesos, un equipo de diez perfiles, tres sesiones de trabajo, 49 fallos con su efecto, su causa y su puntuación, y los 15 prioritarios en la matriz de riesgos. El fallo de mayor IPR: <i>omisión de constantes clave o mal registro en el triaje</i> (7 × 7 × 7 = 343).</p>
      <div class="ej-grid">${C.EJEMPLOS.fichas.map(f => `<a class="ej-card" href="${f.href}"><b>${esc(f.t)}</b><span>${esc(f.s)}</span></a>`).join("")}<a class="ej-card" href="#/amfe/ej-amfe-urg/1?informe=1"><b>Tabla AMFE</b><span>Todo en una vista imprimible</span></a></div>
      <h2 class="sec-t">Minicasos</h2>
      <p class="field-sub">AMFE cortos e inventados (tres subprocesos y cinco fallos) para practicar un paso concreto. Cada uno abre en el paso que trabaja.</p>
      <div class="ej-grid ej-grid--mini">${C.EJEMPLOS.minicasos.map(f => `<a class="ej-card" href="${f.href}"><b>${esc(f.t)}</b><span>${esc(f.s)}</span></a>`).join("")}</div>
      ${practica("Las cifras del ejemplo de Urgencias son las del caso del curso; las de los minicasos son inventadas. Adapta siempre los fallos y las puntuaciones a tu proceso y a tu unidad.")}`;
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
  function irInforme(doc) { location.hash = rutaActual() + "?informe=1" + (doc ? "&doc=" + doc : ""); }
  function imprimir() {
    if (esIOS()) { guardarPDF(); return; }
    if (!document.body.classList.contains("ver-informe")) { irInforme(); setTimeout(() => window.print(), 400); return; }
    window.print();
  }

  // ---------- Copia de seguridad e importar ----------
  async function copiaSeguridad() {
    const contenido = JSON.stringify({ app: "amfe", v: L.VERSION_DATOS, exportado: hoy(), amfes: datosUsuario.amfes, intercambio: L.paqueteIntercambio(datosUsuario.amfes, APP_VERSION, hoy()) }, null, 1);
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

  function exportarExcel(a) {
    try {
      const bytes = window.Xlsx.construirLibroXlsx(L.hojasExcel(a, new Date().toLocaleDateString("es-ES")));
      compartirOBajar(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), nombreArchivo("xlsx"), "Excel descargado.");
    } catch (e) { toast("No se ha podido crear el Excel.", 4000); }
  }
  function compartirOBajar(blob, nombre, msg) {
    const file = new File([blob], nombre, { type: blob.type });
    if (esIOS() && navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: nombre }).catch(() => {});
    else { descargar(blob, nombre); toast(msg, 3000); }
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
  const NAV = [["", "Inicio"], ["amfe", "Mis AMFE"], ["ejemplos", "Ejemplos"], ["aprende", "Aprende"], ["prueba", "Ponte a prueba"], ["glosario", "Glosario"]];
  function buildNav() { $("#calc-nav").innerHTML = NAV.map(([r, t]) => `<a href="#/${r}" data-r="${r}">${t}</a>`).join(""); }
  function noEncontrado(que, href, txt) { view.innerHTML = `<div class="error-box">No se encuentra ${que} en este dispositivo.</div><p><a href="${href}">${txt}</a></p>`; }
  let previo = null, docActual = "";
  function route() {
    const [ruta, qs] = (location.hash.replace(/^#\/?/, "") || "").split("?");
    const partes = ruta.split("/"), q = new URLSearchParams(qs || "");
    const informe = q.get("informe") === "1";
    docActual = informe ? (q.get("doc") || "") : "";
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
    else if (partes[0] === "prueba") renderPrueba(partes[1] === "practica" ? "practica" : (C.TEMAS_TEST[partes[1]] ? Number(partes[1]) : 0));
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
    if (t.dataset.pe) { const p = puntuaciones[t.dataset.pe] || (puntuaciones[t.dataset.pe] = {}); p[t.dataset.f] = t.value.trim(); return; }
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
    if (t.dataset.idea) {
      const i = buscaEn(a.ideas, t.dataset.idea); if (!i) return;
      i[f] = t.value; tocado(a); if (esSel) repintar(); else refrescar(); return;
    }
    if (t.dataset.bq) { const b = buscaEn(a.bloques, t.dataset.bq); if (!b) return; b[f] = t.value; tocado(a); refrescar(); return; }
    if (t.dataset.v321) { L.ponerVoto321(a, t.dataset.v321, t.dataset.p, t.value); tocado(a); repintar(); return; }
    if (t.dataset.v10) { L.ponerVoto1a10(a, t.dataset.v10, t.dataset.b, t.value); tocado(a); refrescar(null, true); return; }
    if (t.dataset.vf) {
      const fa = buscaEn(a.fallos, t.dataset.vf); if (!fa) return;
      L.ponerVotoGOD(fa, t.dataset.vm, f, t.value); tocado(a); refrescar(fa.id); return;
    }
    if (t.dataset.ik) { const r = buscaCausa(a, t.dataset.ik); if (!r) return; setPath(r.x, f, t.value); tocado(a); refrescar(); return; }
    if (t.dataset.ac) { const r = buscaAccion(a, t.dataset.ac); if (!r) return; setPath(r.x, f, t.value); tocado(a); refrescar(); return; }
    if (t.dataset.fr) {
      const fa = buscaEn(a.fallos, t.dataset.fr); if (!fa) return;
      fa.residual[f] = ["g", "o", "d"].includes(f) ? t.value.trim() : t.value; tocado(a); refrescar(fa.id); return;
    }
    if (t.dataset.cp) { const x = a.control[t.dataset.cp][Number(t.dataset.i)]; if (!x) return; x[f] = t.value; tocado(a); refrescar(); return; }
    if (t.dataset.ch) { const x = a.control.historial[Number(t.dataset.ch)]; if (!x) return; x[f] = t.value; tocado(a); return; }
    if (t.dataset.k) { setPath(a, t.dataset.k, t.value); tocado(a); refrescar(null, /^prioridad\./.test(t.dataset.k)); }
  });
  view.addEventListener("change", e => {
    const s = e.target.closest("[data-act-sel='usar-ind']"), a = actual;
    if (!s || !a || s.value === "" || !indImportados) return;
    const r = buscaAccion(a, s.dataset.ac), y = indImportados[Number(s.value)]; if (!r || !y) return;
    const hacer = () => { Object.assign(r.x.indicador, y); indPara = null; tocado(a); repintar(); toast("Indicador copiado. Revisa el estándar.", 3000); };
    if (lleno(r.x.indicador.nombre)) confirmar("<p>Se sustituirá el indicador de esta acción por el elegido.</p>", "Sustituir", hacer, { peligro: false }); else hacer();
  });
  function anadirIdea(a) {
    const el = $("#idea-txt"), txt = el ? el.value.trim() : ""; if (!txt) { if (el) el.focus(); return; }
    a.ideas.push(Object.assign(L.nuevaIdea(genId(), subIdeas), { texto: txt })); tocado(a); repintar();
    const n = $("#idea-txt"); if (n) n.focus();
  }
  view.addEventListener("keydown", e => {
    if (e.key !== "Enter" || !actual) return;
    if (e.target.id === "idea-txt") { e.preventDefault(); anadirIdea(actual); }
    else if (e.target.id === "bloque-txt") { e.preventDefault(); const b = $("[data-act='bloque-add']"); if (b) b.click(); }
  });
  // Modo reunión (mejora J): letra grande y pantalla limpia para proyectar
  function ponerReunion(si) {
    document.body.classList.toggle("modo-reunion", si);
    let x = $("#salir-reunion");
    if (si && !x) { x = document.createElement("button"); x.id = "salir-reunion"; x.className = "btn salir-reunion no-print"; x.textContent = "✕ Salir del modo reunión"; x.addEventListener("click", () => ponerReunion(false)); document.body.appendChild(x); }
    if (!si && x) x.remove();
    if (actual) repintar();
  }
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
    if ((b = t.closest("[data-acpick]")) && a) {
      const r = buscaAccion(a, b.dataset.acpick); if (!r) return;
      r.x[b.dataset.f] = b.dataset.f === "clase" && r.x.clase === b.dataset.v ? "" : b.dataset.v; tocado(a); repintar(); return;
    }
    if ((b = t.closest("[data-acmulti]")) && a) {
      const r = buscaAccion(a, b.dataset.acmulti); if (!r) return;
      const l = r.x.actuaSobre, i = l.indexOf(b.dataset.v); if (i < 0) l.push(b.dataset.v); else l.splice(i, 1);
      b.classList.toggle("active", i < 0); tocado(a); refrescar(); return;
    }
    if ((b = t.closest("[data-acchk]")) && a) {
      const r = buscaAccion(a, b.dataset.acchk); if (!r) return;
      const k = b.dataset.v; r.x.comprobacion[k] = !r.x.comprobacion[k];
      b.classList.toggle("active", r.x.comprobacion[k]); b.textContent = (r.x.comprobacion[k] ? "✓ " : "") + L.COMPROBACION[k].nom; tocado(a); return;
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
    // --- Paso 6 ---
    else if (act === "prio-modo" && a) { a.prioridad.modo = b.dataset.v; tocado(a); repintar(); }
    else if (act === "mz-tam") { tamMatriz = Number(b.dataset.v) === 5 ? 5 : 10; escribir(KEY_MATRIZ, String(tamMatriz)); const z = $("[data-zona='matriz']"); if (z && a) z.innerHTML = matrizHtml(a); }
    else if (act === "mz-solo") { soloPrio = b.dataset.v === "1"; const z = $("[data-zona='matriz']"); if (z && a) z.innerHTML = matrizHtml(a); }
    else if (act === "ir-fallo") {
      const el = $(`[data-pf="${id}"]`); if (!el) return;
      el.scrollIntoView({ block: "center", behavior: "smooth" }); el.classList.remove("pf--flash"); void el.offsetWidth; el.classList.add("pf--flash");
    }
    else if (act === "pf-prio" && a) {
      const f = buscaEn(a.fallos, id); if (!f || f.critico) return;
      const e = L.prioridad(a)[f.id];
      // Alterna entre lo que dice el criterio y la decisión del equipo
      f.manual = f.manual ? "" : (e.prio ? "no" : "si");
      if (f.manual === "si" && !lleno(f.motivo)) f.motivo = L.sugerirMotivo(a, f);
      tocado(a); repintar();
      if (f.manual) { const el = $(`[data-fa="${f.id}"][data-f="motivo"]`); if (el) el.focus(); }
    }
    else if (act === "pf-critico" && a) {
      const f = buscaEn(a.fallos, id); if (!f) return;
      f.critico = b.checked; tocado(a); repintar();
      if (f.critico) { const el = $(`[data-fa="${f.id}"][data-f="motivoCritico"]`); if (el) el.focus(); }
    }
    else if (act === "pf-motivo" && a) {
      const f = buscaEn(a.fallos, id), k = b.dataset.k; if (!f) return;
      const s = L.sugerirMotivo(a, f), hacer = () => { f[k] = s; tocado(a); repintar(); };
      if (lleno(f[k])) confirmar("<p>Se sustituirá el motivo que has escrito por el propuesto.</p>", "Sustituir", hacer, { peligro: false }); else hacer();
    }
    else if (act === "excel" && a) exportarExcel(a);
    // --- Paso 7 ---
    else if (act === "acc-add" && a) {
      const f = buscaEn(a.fallos, id); if (!f) return;
      const x = L.nuevaAccion(genId()); f.acciones.push(x); tocado(a); repintar();
      const el = $(`[data-ac="${x.id}"][data-f="que"]`); if (el) { el.focus(); el.scrollIntoView({ block: "center" }); }
    }
    else if (act === "acc-del" && a) {
      const r = buscaAccion(a, id); if (!r) return;
      const hacer = () => { r.f.acciones = r.f.acciones.filter(y => y.id !== id); tocado(a); repintar(); };
      if (lleno(r.x.que) || lleno(r.x.como)) confirmar(`<p>Se quitará la acción «${esc(L.corto(r.x.que || "sin describir", 70))}».</p>`, "Quitar", hacer); else hacer();
    }
    else if (act === "acc-porque" && a) {
      const r = buscaAccion(a, id); if (!r) return;
      const s = L.sugerirPorque(r.f); if (!s) { toast("El fallo no tiene efecto escrito (paso 4).", 3000); return; }
      const hacer = () => { r.x.porque = s; tocado(a); repintar(); };
      if (lleno(r.x.porque)) confirmar("<p>Se sustituirá lo que has escrito por el texto propuesto.</p>", "Sustituir", hacer, { peligro: false }); else hacer();
    }
    else if (act === "ind-traer" && a) {
      let l = null; try { l = L.indicadoresDe(JSON.parse(leer("indicadores-datos") || "null")); } catch (er) { /* */ }
      indPara = id;
      if (l && l.length) { indImportados = l; const z = $(`[data-zind="${id}"]`); if (z) z.innerHTML = zonaInd(buscaAccion(a, id).x); }
      else confirmar("<p>No hay indicadores de la app <b>Indicadores</b> en este navegador.</p><p>Si los tienes en otro dispositivo, carga su copia de seguridad (.json).</p>", "Cargar una copia", () => $("#input-ind").click(), { titulo: "Traer de Indicadores", peligro: false });
    }
    // --- Paso 8 ---
    else if ((act === "sug-concl" || act === "sug-intro") && a) {
      const k = act === "sug-concl" ? "conclusiones" : "introduccion", s = k === "conclusiones" ? L.conclusionesSugeridas(a) : L.introduccionSugerida(a);
      if (!s) { toast("Aún no hay datos suficientes para proponer un texto.", 3000); return; }
      const hacer = () => { a[k] = s; tocado(a); repintar(); };
      if (lleno(a[k])) confirmar("<p>Se sustituirá lo que has escrito por el texto propuesto.</p>", "Sustituir", hacer, { peligro: false }); else hacer();
    }
    else if (act === "cp-add" && a) { a.control[b.dataset.k].push(L.nuevaPersona()); tocado(a); repintar(); }
    else if (act === "cp-del" && a) { a.control[b.dataset.k].splice(Number(b.dataset.i), 1); tocado(a); repintar(); }
    else if (act === "ch-add" && a) {
      const H = a.control.historial, ult = H.length ? parseInt(H[H.length - 1].edicion, 10) : -1;
      H.push({ edicion: String((Number.isFinite(ult) ? ult : -1) + 1).padStart(2, "0"), fecha: hoyIso(), cambio: "" }); tocado(a); repintar();
    }
    else if (act === "ch-del" && a) { a.control.historial.splice(Number(b.dataset.i), 1); tocado(a); repintar(); }
    else if (act === "doc-ver") irInforme(b.dataset.doc);
    else if (act === "doc-word" && a) descargarWord(a, b.dataset.doc);
    // --- Ishikawa ---
    else if (act === "ish-toggle" && a) { if (ishAbiertos.has(id)) ishAbiertos.delete(id); else ishAbiertos.add(id); abiertos.add(id); repintar(); }
    else if (act === "ish-add" && a) {
      const f = buscaEn(a.fallos, id); if (!f) return;
      const x = L.nuevaCausaIsh(genId(), b.dataset.cat); f.ishikawa.push(x); tocado(a); repintar();
      const el = $(`[data-ik="${x.id}"][data-f="texto"]`); if (el) el.focus();
    }
    else if (act === "ish-del" && a) { const r = buscaCausa(a, id); if (!r) return; r.f.ishikawa = r.f.ishikawa.filter(y => y.id !== id); tocado(a); repintar(); }
    else if (act === "ish-elegir" && a) { const r = buscaCausa(a, id); if (!r) return; r.x.elegida = b.checked; tocado(a); repintar(); }
    else if (act === "ish-causa" && a) {
      const f = buscaEn(a.fallos, id); if (!f) return; const s = L.textoCausaIshikawa(f); if (!s) return;
      const hacer = () => { f.causa = s; tocado(a); repintar(); toast("Causas copiadas a la columna «causa».", 2500); };
      if (lleno(f.causa) && f.causa !== s) confirmar(`<p>La causa escrita («${esc(L.corto(f.causa, 80))}») se sustituirá por las causas elegidas en el diagrama.</p>`, "Sustituir", hacer, { peligro: false }); else hacer();
    }
    // --- Ponte a prueba ---
    else if (act === "quiz") {
      const qi = Number(b.dataset.q), q = C.TEST[qi]; if (!q || qi in respuestas) return;
      respuestas[qi] = Number(b.dataset.o);
      const y = window.scrollY; renderPrueba(rutaActual().split("/")[2] ? Number(rutaActual().split("/")[2]) || 0 : 0); window.scrollTo(0, y);
    }
    else if (act === "quiz-reset") { Object.keys(respuestas).forEach(k => delete respuestas[k]); renderPrueba(Number(rutaActual().split("/")[2]) || 0); }
    else if (act === "fec") { const i = Number(b.dataset.i); if (!(i in respFec)) { respFec[i] = b.dataset.v; const y = window.scrollY; renderPractica(); window.scrollTo(0, y); } }
    else if (act === "pe-ver") { const p = puntuaciones[id] || (puntuaciones[id] = {}); p.ver = true; const y = window.scrollY; renderPractica(); window.scrollTo(0, y); }
    else if (act === "practica-reset") { Object.keys(respFec).forEach(k => delete respFec[k]); Object.keys(puntuaciones).forEach(k => delete puntuaciones[k]); renderPractica(); }
    // --- Paso 3 ---
    else if (act === "idea-sub") { subIdeas = id; $$(".chip-sub").forEach(x => x.classList.toggle("active", x.dataset.id === id)); const el = $("#idea-txt"); if (el) el.focus(); }
    else if (act === "idea-add" && a) anadirIdea(a);
    else if (act === "idea-del" && a) { a.ideas = a.ideas.filter(i => i.id !== id); tocado(a); repintar(); }
    else if (act === "idea-fallo" && a) {
      const i = buscaEn(a.ideas, id); if (!i || !lleno(i.texto)) return;
      const f = L.ideaAFallo(a, i, genId); tocado(a); repintar(); if (f) toast(`Ahora es el fallo nº ${f.num}. Complétalo en el paso 4 (efecto, causa y controles).`, 3500);
    }
    else if (act === "bloque-add" && a) {
      const el = $("#bloque-txt"), nom = el ? el.value.trim() : ""; if (!nom) { if (el) el.focus(); return; }
      a.bloques.push(L.nuevoBloque(genId(), nom)); tocado(a); repintar(); const n = $("#bloque-txt"); if (n) n.focus();
    }
    else if (act === "bloque-del" && a) {
      const bq = buscaEn(a.bloques, id); if (!bq) return;
      const hacer = () => { a.bloques = a.bloques.filter(x => x.id !== id); a.ideas.forEach(i => { if (i.bloqueId === id) i.bloqueId = ""; }); a.tgn.votos = a.tgn.votos.filter(v => v.bloqueId !== id); tocado(a); repintar(); };
      const n = a.ideas.filter(i => i.bloqueId === id).length + a.tgn.votos.filter(v => v.bloqueId === id).length;
      if (n) confirmar(`<p>Se quitará el bloque «${esc(bq.nombre)}». Sus ideas no se borran (quedan sin bloque), pero se pierden sus votos.</p>`, "Quitar", hacer); else hacer();
    }
    else if (act === "bloque-fallos" && a) {
      const l = a.ideas.filter(i => i.bloqueId === id && lleno(i.texto)).map(i => L.ideaAFallo(a, i, genId)).filter(Boolean);
      tocado(a); repintar(); toast(`${plural(l.length, "idea pasada", "ideas pasadas")} a fallos (nº ${l.map(f => f.num).join(", ")}).`, 3500);
    }
    else if (act === "tgn-modo" && a) {
      if (a.tgn.modo === b.dataset.v) return;
      const hacer = () => { a.tgn.modo = b.dataset.v; a.tgn.votos = []; tocado(a); repintar(); };
      if (a.tgn.votos.length) confirmar("<p>Al cambiar la forma de votar se borran los votos que hay.</p>", "Cambiar", hacer); else hacer();
    }
    else if (act === "reunion") ponerReunion(!document.body.classList.contains("modo-reunion"));
    // --- Votación de G·O·D ---
    else if (act === "vot-toggle" && a) { if (votAbiertos.has(id)) votAbiertos.delete(id); else votAbiertos.add(id); repintar(); }
    else if (act === "vot-media" && a) {
      const f = buscaEn(a.fallos, id); if (!f) return; const m = L.mediaVotos(f);
      if (!["g", "o", "d"].some(k => m[k])) { toast("Aún no hay votos.", 2500); return; }
      const hacer = () => { ["g", "o", "d"].forEach(k => { if (m[k]) f[k] = String(m[k].media); }); tocado(a); repintar(); };
      if (L.discrepancia(f).length) confirmar("<p>Los votos están muy separados en alguna escala. ¿Lo habéis hablado? Si es así, usa la media (o escribe el valor que acordéis).</p>", "Usar la media", hacer, { peligro: false }); else hacer();
    }
    // --- Ediciones ---
    else if (act === "ed-nueva" && a) {
      confirmar(`<p>Se creará la <b>edición ${String((parseInt(a.edicion, 10) || 0) + 1).padStart(2, "0")}</b>: una copia completa de este AMFE para revisarlo. Esta edición se queda como estaba, para comparar.</p><p>Revisad el proceso, los fallos (nuevos o que ya no existen) y las puntuaciones a la luz de las acciones hechas y de los incidentes.</p>`, "Crear la edición", () => {
        // En los ejemplos, la edición nueva también es de ejemplo (id «ej-…»): vive en memoria y no se mezcla con los datos
        const c = L.nuevaEdicion(a, modoEjemplo ? () => "ej-ed-" + genId() : genId, hoy()); datos.amfes.push(c); if (!modoEjemplo) guardar(true);
        location.hash = `#/amfe/${c.id}/5`; toast(`Edición ${c.edicion} creada. Empieza por revisar las puntuaciones.`, 4000);
      }, { titulo: "Nueva edición", peligro: false });
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
  // Copia de seguridad de la app Indicadores (para «Traer de Indicadores» desde otro dispositivo)
  $("#input-ind").addEventListener("change", e => {
    const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      let l = null; try { l = L.indicadoresDe(JSON.parse(fr.result)); } catch (er) { /* */ }
      if (!l || !l.length) { toast("Ese archivo no es una copia de la app Indicadores (o no tiene indicadores con nombre).", 4500); return; }
      indImportados = l; if (actual) repintar(); toast(`Cargados ${plural(l.length, "indicador", "indicadores")}. Elige el que quieras usar.`, 3500);
    };
    fr.readAsText(f);
  });

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
  document.addEventListener("keydown", e => { if (e.key === "Escape") { ma.hidden = true; $("#modal-confirmar").hidden = true; if (document.body.classList.contains("modo-reunion")) ponerReunion(false); } });

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
