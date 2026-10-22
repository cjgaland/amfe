// ============================================================
//  logic.js — Lógica PURA (sin DOM) · AMFE
//  Modelo del AMFE (proceso, subprocesos, equipo, sesiones, fallos), escalas
//  G·O·D, IPR y orden, priorización (N primeros o umbral, gravedad 9–10, fallo
//  crítico, decisión manual), matriz de riesgos, acciones de mejora 5W1H con
//  indicador y estándar, IPR residual, control documental, avisos didácticos
//  por paso, textos propuestos, progreso, pegar desde Excel, paquete de
//  intercambio «amfe-fallos» para otras apps, documentos (informe y resumen,
//  como lista de bloques para Word y PDF), hojas de Excel, saneado y fusión.
//  window.Logica en navegador y module.exports en Node (tests).
// ============================================================
(function (raiz) {
  "use strict";

  const VERSION_DATOS = 1;
  const URL_AUD = "https://cjgaland.github.io/auditorias/";
  const URL_IND = "https://cjgaland.github.io/indicadores-calidad/";
  const URL_TM = "https://cjgaland.github.io/tamano-muestral/";
  const URL_FLUJO = "https://cjgaland.github.io/flujograma/";
  const URL_DAFO = "https://cjgaland.github.io/dafo/";

  // ---------- Utilidades ----------
  const lleno = v => v != null && String(v).trim() !== "";
  const sinTildes = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const num = v => { if (typeof v === "number") return v; const s = String(v == null ? "" : v).trim().replace(/\s/g, "").replace(",", "."); return s === "" || isNaN(s) ? NaN : Number(s); };
  const entero1a10 = v => { const n = num(v); return Number.isInteger(n) && n >= 1 && n <= 10 ? n : null; };
  const corto = (s, n = 60) => { s = String(s || "").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s || "sin nombre"; };
  const normal = s => sinTildes(s).replace(/[^a-z0-9ñ ]/g, " ").replace(/\s+/g, " ").trim();
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const listaY = l => l.length > 1 ? l.slice(0, -1).join(", ") + " y " + l[l.length - 1] : l.join("");
  // «2026-01-12» → «12/01/2026» (los campos de fecha guardan el formato del calendario del navegador)
  const fmtFecha = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || "").trim()); return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v || ""); };

  // ---------- Escalas G·O·D (las del curso, en tramos de dos puntos) ----------
  const TRAMOS = ["1–2", "3–4", "5–6", "7–8", "9–10"];
  const ESCALAS_CURSO = {
    g: ["Sin efecto o muy leve. No causa daño significativo.", "Leve o mínimo, puede requerir intervención menor.", "Moderado o significativo, puede requerir hospitalización.", "Mayor o extremo, puede causar daño permanente.", "Serio o peligroso, puede resultar en discapacidad o muerte."],
    o: ["Casi nunca o remota, improbable.", "Muy leve o leve, ocurre raramente.", "Baja o media, ocurre ocasionalmente.", "Moderadamente alta o alta, ocurre con frecuencia.", "Muy alta o casi segura, ocurre casi siempre."],
    d: ["Casi segura o muy alta, fácilmente detectable.", "Alta o moderadamente alta, detectable con facilidad.", "Media, puede ser detectada con esfuerzo moderado.", "Baja, leve o difícil de detectar.", "Muy leve o casi imposible, muy difícil de detectar."]
  };
  const ESCALA_NOM = { g: "Gravedad", o: "Ocurrencia", d: "Detección" };
  const ESCALA_PREG = { g: "¿Cuánto daño haría si ocurre?", o: "¿Con qué frecuencia puede ocurrir?", d: "¿Se descubre antes de que cause daño? (al revés: 10 = no se detecta)" };
  // Tramo 1–5 de un valor 1–10 (1-2 → 1 … 9-10 → 5)
  const tramo = v => { const n = entero1a10(v); return n ? Math.ceil(n / 2) : null; };

  // ---------- IPR ----------
  // IPR = Gravedad × Ocurrencia × Detección, cada una de 1 a 10 (máximo 1.000)
  function ipr(g, o, d) {
    const a = entero1a10(g), b = entero1a10(o), c = entero1a10(d);
    return a && b && c ? a * b * c : null;
  }
  const iprDe = f => ipr(f.g, f.o, f.d);
  // Niveles orientativos para colorear (los mismos que Auditorías); la prioridad real es el orden dentro del AMFE
  const NIVELES_IPR = [
    { k: "muyalto", min: 300, nom: "Muy alto" },
    { k: "alto", min: 200, nom: "Alto" },
    { k: "medio", min: 100, nom: "Medio" },
    { k: "bajo", min: 1, nom: "Bajo" }
  ];
  const nivelIPR = v => Number.isFinite(v) && v > 0 ? NIVELES_IPR.find(n => v >= n.min) : null;

  // Zonas de la matriz G × O, tal como las pinta el Documento Final del curso: se suman los tramos de G y de O
  const ZONAS = {
    verde: { nom: "Bajo", que: "aceptable" },
    amarillo: { nom: "Moderado", que: "requiere vigilancia" },
    naranja: { nom: "Alto", que: "requiere intervención" },
    rojo: { nom: "Muy alto", que: "requiere intervención inmediata" }
  };
  function zonaMatriz(g, o) {
    const a = tramo(g), b = tramo(o); if (!a || !b) return null;
    const s = a + b;
    return s >= 10 ? "rojo" : s >= 7 ? "naranja" : s === 6 ? "amarillo" : "verde";
  }

  // Orden: IPR descendente; a igual IPR, más gravedad primero; luego por número. Sin IPR al final.
  function ordenarFallos(fallos, por = "ipr", subprocesos = []) {
    const pos = id => { const i = subprocesos.findIndex(s => s.id === id); return i < 0 ? 999 : i; };
    const lista = fallos.map((f, i) => ({ f, i, v: iprDe(f) || 0, g: entero1a10(f.g) || 0, n: Number(f.num) || 0, s: pos(f.subprocesoId) }));
    if (por === "ipr") lista.sort((a, b) => b.v - a.v || b.g - a.g || a.n - b.n || a.i - b.i);
    else if (por === "sub") lista.sort((a, b) => a.s - b.s || a.n - b.n || a.i - b.i);
    else lista.sort((a, b) => a.n - b.n || a.i - b.i);
    return lista.map(x => x.f);
  }
  // Puesto de cada fallo por IPR (1 = el más prioritario); empates comparten puesto
  function puestos(fallos) {
    const vals = fallos.map(iprDe).filter(v => v).sort((a, b) => b - a), m = {};
    fallos.forEach(f => { const v = iprDe(f); m[f.id] = v ? vals.indexOf(v) + 1 : null; });
    return m;
  }

  // ---------- Pasos del AMFE ----------
  // entrega = versión de la app en que se activa cada paso
  const PASOS = [
    { n: 1, k: "proceso", corto: "Proceso", titulo: "El proceso", que: "Qué proceso analizáis, dónde empieza y acaba, y en qué subprocesos se divide.", entrega: 1 },
    { n: 2, k: "equipo", corto: "Equipo", titulo: "El equipo y las sesiones", que: "Quién participa, con qué papel, y cuándo os reunís.", entrega: 1 },
    { n: 3, k: "ideas", corto: "Ideas", titulo: "Encontrar los fallos", que: "Lluvia de ideas por subproceso y técnica de grupo nominal para quedaros con lo importante.", entrega: 4 },
    { n: 4, k: "fallos", corto: "Fallos", titulo: "Analizar cada fallo", que: "Modo de fallo, efecto, causa y controles que ya existen.", entrega: 1 },
    { n: 5, k: "puntuar", corto: "Puntuar", titulo: "Puntuar G·O·D", que: "Gravedad, ocurrencia y detección de 1 a 10. La app calcula el IPR.", entrega: 1 },
    { n: 6, k: "priorizar", corto: "Priorizar", titulo: "Priorizar", que: "Los fallos de mayor IPR, los muy graves y los críticos, y la matriz de riesgos.", entrega: 2 },
    { n: 7, k: "mejorar", corto: "Mejorar", titulo: "Acciones de mejora", que: "Qué, por qué, dónde, cuándo, quién y cómo, con indicador y estándar.", entrega: 3 },
    { n: 8, k: "cerrar", corto: "Cerrar", titulo: "Reevaluar y cerrar", que: "IPR tras las acciones, conclusiones e informe AMFE.", entrega: 3 }
  ];

  // ---------- Equipo ----------
  const ROLES = {
    coordinador: { nom: "Coordinador/a", que: "Dirige las sesiones, modera y vela por que se llegue a acuerdos." },
    secretario: { nom: "Secretario/a", que: "Registra lo que se dice y decide, y prepara los documentos. Asegura el uso correcto del método." },
    referente: { nom: "Referente clínico", que: "Conoce a fondo el proceso asistencial y sus protocolos." },
    operativo: { nom: "Representante operativo", que: "Hace el proceso a diario: aporta cómo se trabaja de verdad." },
    experto: { nom: "Asesor/a experto", que: "Aporta conocimiento técnico de un área concreta (medicación, sistemas…)." },
    metodologico: { nom: "Consultor/a metodológico", que: "Experto en seguridad del paciente y en la metodología AMFE." },
    externo: { nom: "Miembro externo", que: "Mirada desde fuera del proceso (otra unidad o especialidad que colabora)." },
    miembro: { nom: "Miembro", que: "Participa en el análisis aportando su experiencia." }
  };
  // Estamento a partir del perfil escrito (para avisar de equipos poco variados)
  const ESTAMENTOS = [
    ["medico", "Medicina", /medic|facultativ|pediatr|cirujan|anestesi|intensivist|internist|radiolog/],
    ["tcae", "TCAE", /tcae|auxiliar de enfer|tecnico\/a en cuidados|tecnico en cuidados|cuidados aux/],
    ["enfermeria", "Enfermería", /enfermer|supervisor|matron|due\b/],
    ["celador", "Celadores", /celador/],
    ["administrativo", "Administración", /administrativ|admision/],
    ["farmacia", "Farmacia", /farmac/],
    ["tecnico", "Técnicos sanitarios", /tecnico.*(rayos|radiodiagn|laborator|imagen)|\bter\b|\btel\b/],
    ["calidad", "Calidad y seguridad", /calidad|seguridad del paciente/],
    ["paciente", "Pacientes", /paciente|usuari|familiar|asociacion/]
  ];
  const estamentoDe = texto => { const t = sinTildes(texto); const e = ESTAMENTOS.find(([, , re]) => re.test(t)); return e ? e[0] : null; };
  const ESTAMENTO_NOM = Object.fromEntries(ESTAMENTOS.map(([k, nom]) => [k, nom]));
  // Perfiles habituales para añadir con un toque (los del ejercicio 9)
  const PERFILES_SUG = [
    { perfil: "Médico/a del servicio", rol: "coordinador" },
    { perfil: "Enfermero/a (supervisión o referente)", rol: "referente" },
    { perfil: "Técnico/a en Cuidados Auxiliares de Enfermería (TCAE)", rol: "operativo" },
    { perfil: "Celador/a", rol: "miembro" },
    { perfil: "Administrativo/a", rol: "miembro" },
    { perfil: "Farmacéutico/a", rol: "experto" },
    { perfil: "Técnico/a de Calidad", rol: "secretario" },
    { perfil: "Responsable de Seguridad del Paciente", rol: "metodologico" }
  ];

  // ---------- Modelo ----------
  const COLORES_SUB = 8;   // número de colores de subproceso (styles.css: .sub-c0 … .sub-c7)
  function nuevoAmfe(id, fecha) {
    return { id, titulo: "", proceso: "", unidad: "", objetivo: "", inicio: "", fin: "", incluye: "", excluye: "", responsable: "", fecha: "",
      subprocesos: [], equipo: [], sesiones: [], fallos: [], escalas: nuevasEscalas(), prioridad: nuevaPrioridad(),
      introduccion: "", conclusiones: "", control: nuevoControl(), proxRevision: "", edicion: "00", anteriorId: "",
      ideas: [], bloques: [], tgn: nuevaTgn(), notas: "", creado: fecha, modificado: fecha };
  }
  // Criterio de prioridad: los N de mayor IPR (15, como el curso) o los que superan un umbral de IPR
  const nuevaPrioridad = () => ({ modo: "top", n: "15", umbral: "200" });
  const nuevasEscalas = () => ({ g: ESCALAS_CURSO.g.slice(), o: ESCALAS_CURSO.o.slice(), d: ESCALAS_CURSO.d.slice() });
  function nuevoSubproceso(id, color = 0) { return { id, nombre: "", descripcion: "", inicio: "", fin: "", roles: "", color: String(color % COLORES_SUB) }; }
  function nuevoMiembro(id) { return { id, perfil: "", cargo: "", rol: "miembro", justificacion: "", nombre: "" }; }
  function nuevaSesion(id) { return { id, fecha: "", actividad: "", duracion: "", asistentes: [], resultados: "" }; }
  // manual: "" = lo decide el criterio; "si" / "no" = el equipo lo marca o lo desmarca a mano (con motivo)
  function nuevoFallo(id, n = 0) { return { id, num: n, subprocesoId: "", fallo: "", efecto: "", causa: "", controles: "", g: "", o: "", d: "", critico: false, motivoCritico: "", manual: "", motivo: "", acciones: [], residual: nuevoResidual(), votos: [], ishikawa: [] }; }
  // Control del documento (como en el Documento Final): elaborado, revisado, aprobado e histórico de revisiones
  function nuevaPersona() { return { nombre: "", cargo: "" }; }
  function nuevoControl() { return { elaborado: [nuevaPersona()], revisado: [nuevaPersona()], aprobado: [nuevaPersona()], historial: [{ edicion: "00", fecha: "", cambio: "Documento inicial" }] }; }
  // G·O·D esperados (o medidos) tras aplicar las acciones de mejora
  function nuevoResidual() { return { g: "", o: "", d: "", fecha: "", nota: "" }; }
  const siguienteNum = a => a.fallos.reduce((m, f) => Math.max(m, Number(f.num) || 0), 0) + 1;
  // Color libre para un subproceso nuevo (el primero que no se use)
  function colorLibre(a) {
    const usados = a.subprocesos.map(s => s.color);
    for (let i = 0; i < COLORES_SUB; i++) if (!usados.includes(String(i))) return i;
    return a.subprocesos.length % COLORES_SUB;
  }
  const subDe = (a, f) => a.subprocesos.find(s => s.id === f.subprocesoId) || null;
  const nombreSub = (a, f) => { const s = subDe(a, f); return s ? s.nombre : ""; };

  // Las tres sesiones habituales (Documento Final de Urgencias)
  const SESIONES_TIPO = [
    { actividad: "Lectura del proceso y análisis de sus subprocesos", duracion: "2 h", resultados: "Subprocesos delimitados y puntos críticos identificados" },
    { actividad: "Lluvia de ideas y técnica de grupo nominal", duracion: "2 h", resultados: "Fallos potenciales identificados y consensuados" },
    { actividad: "Puntuación de gravedad, ocurrencia y detección, y cálculo del IPR", duracion: "2 h", resultados: "Fallos priorizados según su IPR" }
  ];

  // ---------- Textos propuestos ----------
  function sugerirObjetivo(a) {
    const p = lleno(a.proceso) ? a.proceso.trim() : "";
    if (!p) return "";
    const tramoTxt = lleno(a.inicio) && lleno(a.fin) ? `, desde ${minuscula(a.inicio)} hasta ${minuscula(a.fin)}` : "";
    return `Garantizar que el proceso «${p}» se realiza de forma segura, eficaz y continua${tramoTxt}, identificando y previniendo los fallos que pueden causar daño al paciente.`;
  }
  const minuscula = s => { s = String(s || "").trim().replace(/[.]$/, ""); return s && /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s; };

  // ---------- Redacción: ¿fallo, efecto o causa? (mejora D) ----------
  // Detecta frases que parecen una causa o un efecto escritas en la columna del modo de fallo.
  // Los patrones son estrechos a propósito: «Falta de protocolo…» o «Falta de acompañamiento…» SÍ son modos de fallo.
  const RE_CAUSA = /^(sobrecarga|saturacion|presion asistencial|alta carga|carga (asistencial|de trabajo)|fatiga|cansancio|desconocimiento|escasez|poca formacion|mala formacion|formacion insuficiente|personal insuficiente|falta de (formacion|personal|tiempo|recursos|experiencia|medios|plantilla))/;
  const RE_EFECTO = /^(dano|muerte|fallecimiento|exitus|lesion|secuela|reaccion (adversa|alergica|hemolitica)|empeoramiento|agravamiento|infeccion|sepsis|caida del paciente|hemorragia|insatisfaccion|reclamacion|riesgo de|perjuicio)/;
  function tipoRedaccion(texto) {
    const t = normal(texto);
    if (!t) return null;
    if (RE_CAUSA.test(t)) return "causa";
    if (RE_EFECTO.test(t)) return "efecto";
    return null;
  }

  // ---------- Avisos didácticos por paso ----------
  function avisosProceso(a) {
    const A = [], S = a.subprocesos;
    if (!lleno(a.proceso)) A.push({ nivel: "nota", texto: "Escribe el nombre del proceso que vais a analizar." });
    else if (!lleno(a.inicio) || !lleno(a.fin)) A.push({ nivel: "nota", texto: "Marca dónde empieza y dónde acaba el proceso. Sin límites claros, el análisis se alarga sin fin o se deja partes fuera." });
    if (!S.length) A.push({ nivel: "nota", texto: "Divide el proceso en subprocesos (fases con un inicio y un fin claros). Lo habitual es entre 3 y 8." });
    else if (S.length === 1) A.push({ nivel: "nota", texto: "Con un solo subproceso el análisis suele quedarse grueso. Prueba a dividirlo en fases más pequeñas." });
    else if (S.length > 10) A.push({ nivel: "nota", texto: `Hay ${S.length} subprocesos: puede ser demasiado detalle para un AMFE. Valora agrupar los más pequeños.` });
    const sinNombre = S.filter(s => !lleno(s.nombre)).length;
    if (sinNombre) A.push({ nivel: "warn", texto: `${sinNombre === 1 ? "Hay un subproceso" : "Hay " + sinNombre + " subprocesos"} sin nombre.` });
    const vistos = {}; S.forEach(s => { const k = normal(s.nombre); if (k) vistos[k] = (vistos[k] || 0) + 1; });
    Object.keys(vistos).filter(k => vistos[k] > 1).forEach(k => A.push({ nivel: "warn", texto: `El subproceso «${S.find(s => normal(s.nombre) === k).nombre}» está repetido.` }));
    const sinLim = S.filter(s => lleno(s.nombre) && (!lleno(s.inicio) || !lleno(s.fin))).length;
    if (sinLim) A.push({ nivel: "nota", texto: `${sinLim === 1 ? "Un subproceso no tiene" : sinLim + " subprocesos no tienen"} inicio o fin. Delimitarlos evita huecos y solapes entre fases.` });
    const sinRoles = S.filter(s => lleno(s.nombre) && !lleno(s.roles)).length;
    if (sinRoles) A.push({ nivel: "nota", texto: `${sinRoles === 1 ? "Un subproceso no dice" : sinRoles + " subprocesos no dicen"} quién interviene. Los roles ayudan a formar el equipo del AMFE.` });
    return A.map(x => Object.assign({ paso: 1 }, x));
  }

  function avisosEquipo(a) {
    const A = [], E = a.equipo.filter(m => lleno(m.perfil));
    if (!E.length) A.push({ nivel: "nota", texto: "Añade los perfiles del equipo. Un AMFE se hace en grupo: nadie conoce solo todo el proceso." });
    else {
      if (E.length < 6) A.push({ nivel: "nota", texto: `El equipo tiene ${plural(E.length, "perfil", "perfiles")}. Se recomienda un equipo multidisciplinar de al menos 6, con todos los que intervienen en el proceso.` });
      if (!E.some(m => m.rol === "coordinador")) A.push({ nivel: "warn", texto: "Nadie tiene el papel de coordinación: alguien tiene que dirigir las sesiones y moderar." });
      if (!E.some(m => m.rol === "secretario")) A.push({ nivel: "warn", texto: "Nadie tiene el papel de secretaría: alguien tiene que registrar lo que se decide y preparar los documentos." });
      const est = [...new Set(E.map(m => estamentoDe(m.perfil + " " + m.cargo)).filter(Boolean))];
      if (E.length >= 3 && est.length === 1) A.push({ nivel: "warn", texto: `Todo el equipo es del mismo estamento (${ESTAMENTO_NOM[est[0]]}). Faltan otras miradas del proceso.` });
      // Roles que aparecen en los subprocesos y no tienen nadie en el equipo
      const enSubs = [...new Set(a.subprocesos.flatMap(s => String(s.roles || "").split(/[,;\/\n]| y /).map(estamentoDe)).filter(k => k && k !== "paciente"))];
      const faltan = enSubs.filter(k => !est.includes(k));
      if (faltan.length) A.push({ nivel: "nota", texto: `Los subprocesos citan a ${faltan.map(k => ESTAMENTO_NOM[k]).join(", ")}, y nadie del equipo es de ahí. Valora incluirlo: conoce riesgos que los demás no ven.` });
      if (!E.some(m => m.rol === "metodologico" || estamentoDe(m.perfil + " " + m.cargo) === "calidad")) A.push({ nivel: "nota", texto: "Conviene que alguien del equipo conozca bien la metodología AMFE (por ejemplo, de la Unidad de Calidad)." });
      const sinJust = E.filter(m => !lleno(m.justificacion)).length;
      if (sinJust && E.length >= 3) A.push({ nivel: "nota", texto: `${sinJust === 1 ? "Un perfil no tiene" : sinJust + " perfiles no tienen"} justificación: por qué está en el equipo y qué aporta.` });
    }
    if (E.length && !a.sesiones.length) A.push({ nivel: "nota", texto: "Planifica las sesiones de trabajo. Lo habitual son 3 sesiones de unas 2 horas." });
    return A.map(x => Object.assign({ paso: 2 }, x));
  }

  function avisosFallos(a) {
    const A = [], F = a.fallos;
    if (!a.subprocesos.filter(s => lleno(s.nombre)).length) A.push({ nivel: "nota", texto: "Define primero los subprocesos (paso 1): cada fallo se coloca en el suyo." });
    if (!F.length) { A.push({ nivel: "nota", texto: "Añade los fallos de cada subproceso preguntándoos: «¿qué puede salir mal en este paso?»." }); return A.map(x => Object.assign({ paso: 4 }, x)); }
    const sinSub = F.filter(f => !subDe(a, f)).length;
    if (sinSub) A.push({ nivel: "warn", texto: `${sinSub === 1 ? "Un fallo no está" : sinSub + " fallos no están"} en ningún subproceso.` });
    const vacios = F.filter(f => !lleno(f.fallo)).length;
    if (vacios) A.push({ nivel: "warn", texto: `${vacios === 1 ? "Hay un fallo" : "Hay " + vacios + " fallos"} sin describir.` });
    F.forEach(f => {
      const t = tipoRedaccion(f.fallo);
      if (t === "causa") A.push({ nivel: "warn", fallo: f.id, texto: `Nº ${f.num} «${corto(f.fallo, 50)}» parece una causa (por qué ocurre), no un modo de fallo. Pregúntate: ¿qué es lo que sale mal? Pásalo a la columna «causa».` });
      if (t === "efecto") A.push({ nivel: "warn", fallo: f.id, texto: `Nº ${f.num} «${corto(f.fallo, 50)}» parece un efecto (lo que le pasa al paciente), no un modo de fallo. ¿Qué fallo lo provoca?` });
      if (lleno(f.fallo) && lleno(f.causa) && normal(f.fallo) === normal(f.causa)) A.push({ nivel: "warn", fallo: f.id, texto: `Nº ${f.num}: la causa repite el fallo. La causa responde a «¿por qué ocurre?».` });
      if (lleno(f.fallo) && String(f.fallo).length > 220) A.push({ nivel: "nota", fallo: f.id, texto: `Nº ${f.num}: el fallo es muy largo. Un modo de fallo se escribe en una frase; lo demás va a efecto, causa o controles.` });
    });
    const vistos = {}; F.forEach(f => { const k = normal(f.fallo); if (k) (vistos[k] = vistos[k] || []).push(f); });
    Object.values(vistos).filter(l => l.length > 1).forEach(l => A.push({ nivel: "warn", texto: `Fallo repetido: «${corto(l[0].fallo, 60)}» (nº ${l.map(f => f.num).join(", ")}). Si ocurre en subprocesos distintos, distínguelos en el texto.` }));
    const conTexto = F.filter(f => lleno(f.fallo));
    const sinEf = conTexto.filter(f => !lleno(f.efecto)).length, sinCa = conTexto.filter(f => !lleno(f.causa)).length;
    if (sinEf) A.push({ nivel: "nota", texto: `${sinEf === 1 ? "Un fallo no tiene" : sinEf + " fallos no tienen"} efecto. Sin el efecto no se puede puntuar la gravedad.` });
    if (sinCa) A.push({ nivel: "nota", texto: `${sinCa === 1 ? "Un fallo no tiene" : sinCa + " fallos no tienen"} causa. Las acciones de mejora atacan la causa: sin ella, no sabréis qué cambiar.` });
    const sinCtl = conTexto.filter(f => !lleno(f.controles)).length;
    if (conTexto.length >= 3 && sinCtl > conTexto.length / 2) A.push({ nivel: "nota", texto: `${sinCtl} de ${conTexto.length} fallos no tienen controles actuales. Escribe lo que hoy ya existe para evitarlos o detectarlos (protocolos, dobles chequeos, alertas…): sin eso, la detección se puntúa a ciegas.` });
    F.forEach(f => { if (causasElegidas(f).length && !lleno(f.causa)) A.push({ nivel: "nota", fallo: f.id, texto: `Nº ${f.num}: el Ishikawa tiene causas elegidas, pero la columna «causa» está vacía. Pásalas con el botón del diagrama.` }); });
    const vaciosSub = a.subprocesos.filter(s => lleno(s.nombre) && !F.some(f => f.subprocesoId === s.id));
    if (vaciosSub.length && F.length >= 3) A.push({ nivel: "nota", texto: `${vaciosSub.length === 1 ? "El subproceso «" + vaciosSub[0].nombre + "» no tiene" : "Los subprocesos " + vaciosSub.map(s => "«" + s.nombre + "»").join(", ") + " no tienen"} ningún fallo. ¿De verdad no puede salir nada mal ahí?` });
    return A.map(x => Object.assign({ paso: 4 }, x));
  }

  function avisosPuntuar(a) {
    const A = [], F = a.fallos.filter(f => lleno(f.fallo));
    if (!F.length) { A.push({ nivel: "nota", texto: "Primero describe los fallos (paso 4); después se puntúan." }); return A.map(x => Object.assign({ paso: 5 }, x)); }
    const malos = F.filter(f => [f.g, f.o, f.d].some(lleno) && !iprDe(f));
    if (malos.length) A.push({ nivel: "error", texto: `G, O y D tienen que ser números enteros del 1 al 10. Revisa: nº ${malos.map(f => f.num).join(", ")}.` });
    const sinPunt = F.filter(f => ![f.g, f.o, f.d].some(lleno)).length;
    if (sinPunt) A.push({ nivel: "nota", texto: `${sinPunt === 1 ? "Queda un fallo" : "Quedan " + sinPunt + " fallos"} sin puntuar. Sin G, O y D no hay IPR ni se puede priorizar.` });
    F.forEach(f => {
      const d = entero1a10(f.d), g = entero1a10(f.g);
      if (d && d <= 2 && !lleno(f.controles)) A.push({ nivel: "warn", fallo: f.id, texto: `Nº ${f.num}: detección ${d} significa que el fallo se descubre casi seguro antes de causar daño, pero no hay controles escritos. ¿Quién o qué lo detecta? Recuerda: la detección va al revés.` });
      if (d && d >= 9 && lleno(f.controles)) A.push({ nivel: "nota", fallo: f.id, texto: `Nº ${f.num}: detección ${d} (casi imposible de detectar) aunque hay controles escritos. ¿No sirven para descubrirlo a tiempo? Si sí sirven, la D debería ser más baja.` });
      if (g && g >= 9) A.push({ nivel: "nota", fallo: f.id, texto: `Nº ${f.num} tiene gravedad ${g}: merece atención aunque su IPR no salga de los primeros. Un fallo muy grave no se deja fuera por ser raro o fácil de detectar.` });
      const dis = discrepancia(f);
      if (dis.length) A.push({ nivel: "warn", fallo: f.id, texto: `Nº ${f.num}: los votos del equipo están muy separados en ${listaY(dis.map(k => ESCALA_NOM[k].toLowerCase()))} (4 puntos o más entre el más alto y el más bajo). Habladlo antes de cerrar el valor: puede que no todos imaginéis el mismo fallo.` });
    });
    const P = F.filter(iprDe);
    if (P.length >= 6) {
      const centro = P.filter(f => [f.g, f.o, f.d].every(v => { const n = entero1a10(v); return n >= 5 && n <= 6; })).length;
      if (centro / P.length >= 0.6) A.push({ nivel: "nota", texto: `${centro} de ${P.length} fallos tienen G, O y D en el centro de la escala (5 o 6). Puede ser falta de información más que acuerdo: usad la escala completa y los datos que tengáis (notificaciones, quejas, auditorías).` });
      if (new Set(P.map(iprDe)).size === 1) A.push({ nivel: "nota", texto: "Todos los fallos tienen el mismo IPR: así no se puede priorizar. Revisad las puntuaciones fallo a fallo." });
    }
    return A.map(x => Object.assign({ paso: 5 }, x));
  }

  // ---------- Priorizar (paso 6) ----------
  const nPrioridad = a => { const n = num(a.prioridad.n); return Number.isInteger(n) && n >= 1 ? Math.min(n, 500) : 15; };
  const umbralPrioridad = a => { const u = num(a.prioridad.umbral); return Number.isFinite(u) && u >= 1 ? u : null; };
  // Estado de prioridad de cada fallo con texto: { prio, auto (lo elige el criterio), por: "criterio"|"critico"|"manual"|"", grave (G 9–10), zona }
  function prioridad(a) {
    const F = a.fallos.filter(f => lleno(f.fallo)), orden = ordenarFallos(F.filter(iprDe)), base = new Set();
    if (a.prioridad.modo === "umbral") { const u = umbralPrioridad(a); if (u) orden.filter(f => iprDe(f) >= u).forEach(f => base.add(f.id)); }
    else orden.slice(0, nPrioridad(a)).forEach(f => base.add(f.id));
    const m = {};
    F.forEach(f => {
      const auto = base.has(f.id);
      let prio = auto, por = auto ? "criterio" : "";
      if (f.critico) { prio = true; por = "critico"; }
      if (f.manual === "si") { prio = true; if (!f.critico) por = "manual"; }
      if (f.manual === "no" && !f.critico) { prio = false; por = "manual"; }
      m[f.id] = { prio, auto, por, grave: (entero1a10(f.g) || 0) >= 9, zona: zonaMatriz(f.g, f.o) };
    });
    return m;
  }
  const prioritarios = a => { const m = prioridad(a); return ordenarFallos(a.fallos.filter(f => m[f.id] && m[f.id].prio)); };
  const POR_TXT = { criterio: "Criterio de IPR", critico: "Fallo crítico", manual: "Decisión del equipo" };
  // Propone el motivo de prioridad a partir del IPR, el puesto, la gravedad y la zona de la matriz
  function sugerirMotivo(a, f) {
    const v = iprDe(f), P = puestos(a.fallos), g = entero1a10(f.g), z = zonaMatriz(f.g, f.o), partes = [];
    if (v) partes.push(`IPR ${v} (puesto ${P[f.id]} de ${a.fallos.filter(iprDe).length})`);
    if (g >= 9) partes.push(`gravedad ${g}: el daño posible es muy grave aunque el IPR no sea de los primeros`);
    if (z === "rojo" || z === "naranja") partes.push(`zona ${z} de la matriz de riesgos (riesgo ${ZONAS[z].nom.toLowerCase()})`);
    if (!lleno(f.controles)) partes.push("sin controles actuales que lo eviten o lo detecten");
    return partes.length ? partes.join("; ").replace(/^./, x => x.toUpperCase()) + "." : "";
  }
  function avisosPriorizar(a) {
    const A = [], F = a.fallos.filter(f => lleno(f.fallo)), P = F.filter(iprDe), m = prioridad(a);
    if (!P.length) { A.push({ nivel: "nota", texto: "Primero puntúa los fallos (paso 5): sin IPR no se puede priorizar." }); return A.map(x => Object.assign({ paso: 6 }, x)); }
    const sinPunt = F.length - P.length;
    if (sinPunt) A.push({ nivel: "warn", texto: `${sinPunt === 1 ? "Queda un fallo" : "Quedan " + sinPunt + " fallos"} sin puntuar: no entran en la priorización por IPR.` });
    if (a.prioridad.modo === "umbral" && !umbralPrioridad(a)) A.push({ nivel: "warn", texto: "Escribe el umbral de IPR (un número), o elige «los N de mayor IPR»." });
    if (a.prioridad.modo !== "umbral") {
      const orden = ordenarFallos(P), n = nPrioridad(a), ult = orden[n - 1];
      if (ult && orden.length > n) {
        const empatados = orden.slice(n).filter(f => iprDe(f) === iprDe(ult));
        if (empatados.length) A.push({ nivel: "nota", texto: `${empatados.length === 1 ? "Un fallo tiene" : empatados.length + " fallos tienen"} el mismo IPR (${iprDe(ult)}) que el último de los ${n} y ${empatados.length === 1 ? "queda" : "quedan"} fuera (nº ${empatados.map(f => f.num).join(", ")}). A igual IPR la app pone antes el de más gravedad; si alguno os parece más importante, marcadlo a mano.` });
      }
      if (n >= P.length) A.push({ nivel: "nota", texto: `Con los ${n} primeros entran todos los fallos puntuados: así no se prioriza nada. Elige un número menor.` });
    }
    const pr = F.filter(f => m[f.id].prio), crit = F.filter(f => f.critico);
    if (crit.length && pr.length >= 3 && crit.length > pr.length / 3) A.push({ nivel: "warn", texto: `Hay ${crit.length} fallos marcados como críticos de ${pr.length} prioritarios. Si se abusa de la marca «crítico», la priorización deja de ser objetiva: resérvala para lo que de verdad no puede esperar.` });
    F.forEach(f => {
      const e = m[f.id];
      if (f.critico && !lleno(f.motivoCritico)) A.push({ nivel: "warn", fallo: f.id, texto: `Nº ${f.num} está marcado como crítico sin motivo. Escribe por qué (evento centinela, exigencia normativa, gravedad extrema…).` });
      if (f.manual === "si" && !lleno(f.motivo)) A.push({ nivel: "warn", fallo: f.id, texto: `Nº ${f.num} se ha añadido a mano a los prioritarios: escribe el motivo.` });
      if (f.manual === "no" && !lleno(f.motivo)) A.push({ nivel: "warn", fallo: f.id, texto: `Nº ${f.num} tiene IPR ${iprDe(f)} y se ha quitado a mano de los prioritarios: escribe el motivo.` });
      if (e.grave && !e.prio) A.push({ nivel: "warn", fallo: f.id, texto: `Nº ${f.num} tiene gravedad ${f.g} y no es prioritario. Un fallo muy grave merece atención aunque sea raro o fácil de detectar: valora marcarlo.` });
      if (e.zona === "rojo" && !e.prio) A.push({ nivel: "warn", fallo: f.id, texto: `Nº ${f.num} cae en la zona roja de la matriz (gravedad y ocurrencia muy altas) pero no es prioritario, porque su detección es baja. ¿Seguro que se detecta a tiempo?` });
    });
    if (!pr.length) A.push({ nivel: "nota", texto: "No hay ningún fallo prioritario con el criterio actual." });
    return A.map(x => Object.assign({ paso: 6 }, x));
  }

  // Matriz G × O: celdas con los fallos que caen en cada una. tam = 10 (valor exacto) o 5 (tramos de dos puntos)
  // Devuelve filas de gravedad alta a baja; cada celda { g, o, zona, fallos: [...] }
  function matriz(fallos, tam = 10) {
    const filas = [];
    for (let g = tam; g >= 1; g--) {
      const fila = [];
      for (let o = 1; o <= tam; o++) {
        const gv = tam === 10 ? g : g * 2, ov = tam === 10 ? o : o * 2;
        fila.push({ g, o, zona: zonaMatriz(gv, ov), fallos: fallos.filter(f => { const fg = entero1a10(f.g), fo = entero1a10(f.o); return fg && fo && (tam === 10 ? fg === g && fo === o : tramo(fg) === g && tramo(fo) === o); }) });
      }
      filas.push(fila);
    }
    return filas;
  }
  // Por subproceso: nº de fallos, prioritarios, IPR máximo y medio
  function porSubproceso(a) {
    const m = prioridad(a), F = a.fallos.filter(f => lleno(f.fallo));
    return a.subprocesos.map(s => { const l = F.filter(f => f.subprocesoId === s.id), v = l.map(iprDe).filter(Boolean);
      return { id: s.id, nombre: s.nombre, color: s.color, n: l.length, prio: l.filter(f => m[f.id].prio).length, max: v.length ? Math.max(...v) : 0, media: v.length ? Math.round(v.reduce((x, y) => x + y, 0) / v.length) : 0 }; });
  }

  // ---------- Acciones de mejora (paso 7) ----------
  const TIPOS_ACCION = {
    correccion: { nom: "Corrección inmediata", que: "Arregla el fallo en el momento en que ocurre." },
    correctora: { nom: "Acción correctora", que: "Elimina la causa para que el fallo no se repita." },
    preventiva: { nom: "Acción preventiva", que: "Elimina un riesgo antes de que llegue a ocurrir." }
  };
  const CLASES_ACCION = { procedimiento: { nom: "Procedimiento o protocolo" }, formacion: { nom: "Formación" }, tecnologia: { nom: "Tecnología" }, organizativa: { nom: "Cambio organizativo" } };
  const ACTUA = { o: "Baja la ocurrencia", d: "Mejora la detección", g: "Reduce la gravedad" };
  // Criterios del tema 5 para que una acción sea efectiva
  const COMPROBACION = {
    especifica: { nom: "Específica", que: "Ataca la causa del fallo." },
    factible: { nom: "Factible", que: "Es realista con los recursos disponibles." },
    medible: { nom: "Medible", que: "Tiene un indicador para comprobar su efecto." },
    sostenible: { nom: "Sostenible", que: "Se integra en el trabajo diario y se mantiene." },
    aceptable: { nom: "Aceptable", que: "Cuenta con el apoyo del personal implicado." }
  };
  const ESTADOS_ACCION = { pendiente: "Pendiente", curso: "En curso", hecha: "Hecha", verificada: "Verificada" };
  const ESTADOS_PLURAL = { pendiente: "pendientes", curso: "en curso", hecha: "hechas", verificada: "verificadas" };
  const cuentaEstado = (k, n) => `${n} ${n === 1 ? ESTADOS_ACCION[k].toLowerCase() : ESTADOS_PLURAL[k]}`;
  // Fuerza de la medida (misma lógica que Auditorías): lo que cambia el sistema es más fuerte que formar o recordar
  const FUERZAS = {
    fuerte: { nom: "Medida fuerte", que: "Cambia el sistema: obliga, automatiza o elimina el paso que falla." },
    intermedia: { nom: "Medida intermedia", que: "Apoya la práctica: listas de verificación, doble verificación, estandarizar." },
    debil: { nom: "Medida débil", que: "Depende de la memoria o la voluntad: formación, avisos, sensibilización." }
  };
  function fuerzaMedida(texto) {
    const t = sinTildes(texto);
    if (!t) return "";
    if (/campo obligatori|no permit|\bbloque(e|ar|a)\b|forzad|automat|alerta autom|alerta visible|integracion|interoperab|redisen|eliminar|simplific|panel de camas|en tiempo real|sistema de alerta|checklist (digital )?obligatori|canal directo/.test(t)) return "fuerte";
    if (/checklist|lista de verificacion|listado de control|doble (verificacion|validacion|identificacion|chequeo|revision)|protocolo|procedimiento|estandariz|auditori|revision (cruzada|semanal|periodica|sistematica)|reevaluacion|recordatorio visual|listado actualizado|circuito|reunion|etiquetado|designacion|cuestionario/.test(t)) return "intermedia";
    if (/formacion|\bformar\b|sesion|sensibiliz|concienci|charla|informar|difundir|recordar|insistir|cartel|cuidado|curso/.test(t)) return "debil";
    return "";
  }
  function nuevoIndicador() { return { nombre: "", formula: "", estandar: "", fuente: "" }; }
  function nuevaComprobacion() { return { especifica: false, factible: false, medible: false, sostenible: false, aceptable: false }; }
  function nuevaAccion(id) { return { id, que: "", porque: "", donde: "", plazo: "", fin: "", quien: "", como: "", tipo: "correctora", clase: "", actuaSobre: [], indicador: nuevoIndicador(), comprobacion: nuevaComprobacion(), estado: "pendiente", nota: "" }; }
  const iprResidual = f => ipr(f.residual.g, f.residual.o, f.residual.d);
  const vencida = (x, hoy) => /^\d{4}-\d{2}-\d{2}$/.test(x.fin || "") && x.fin < hoy && (x.estado === "pendiente" || x.estado === "curso");
  const accionCompleta = x => lleno(x.que) && lleno(x.quien) && (lleno(x.plazo) || lleno(x.fin));
  const accionesDe = f => f.acciones.filter(x => lleno(x.que));
  function sugerirPorque(f) {
    if (!lleno(f.efecto)) return "";
    return `Para evitar este efecto: ${minuscula(f.efecto).replace(/[.;]$/, "")}${lleno(f.causa) ? `; actuando sobre su causa: ${minuscula(f.causa).replace(/[.;]$/, "")}` : ""}.`;
  }
  // Indicadores de la app Indicadores (su almacenamiento «indicadores-datos» o su copia .json). Se copian, no se enlazan.
  function indicadoresDe(o) {
    if (!o || typeof o !== "object" || !Array.isArray(o.indicadores)) return null;
    const t = v => (typeof v === "string" || typeof v === "number") ? String(v).slice(0, 500) : "";
    return o.indicadores.slice(0, 300).filter(x => x && typeof x === "object" && lleno(x.nombre)).map(x => {
      const e = t(x.estandar).replace(/[^\d.,]/g, "");
      return { nombre: t(x.nombre), formula: [t(x.numerador), t(x.denominador)].every(lleno) ? `${t(x.numerador)} / ${t(x.denominador)} × 100` : "",
        estandar: e ? `${x.sentido === "menos" ? "≤" : "≥"} ${e} %` : "", fuente: [...(Array.isArray(x.fuentes) ? x.fuentes.map(t) : []), t(x.fuenteOtra)].filter(lleno).join(", ") };
    });
  }
  function avisosMejorar(a, hoy) {
    const A = [], PR = prioritarios(a);
    if (!PR.length) { A.push({ nivel: "nota", texto: "Primero elige los fallos prioritarios (paso 6): las acciones de mejora se hacen para ellos." }); return A.map(x => Object.assign({ paso: 7 }, x)); }
    const sinAcc = PR.filter(f => !accionesDe(f).length);
    if (sinAcc.length) A.push({ nivel: "nota", texto: `${sinAcc.length === 1 ? "Un fallo prioritario no tiene" : sinAcc.length + " fallos prioritarios no tienen"} ninguna acción de mejora (nº ${sinAcc.map(f => f.num).join(", ")}).` });
    PR.forEach(f => f.acciones.forEach((x, i) => {
      const n = `Nº ${f.num}, acción ${i + 1}`, base = { fallo: f.id, accion: x.id };
      if (!lleno(x.que)) { A.push(Object.assign({ nivel: "warn", texto: `${n}: describe qué se va a hacer.` }, base)); return; }
      const falta = [!lleno(x.quien) && "responsable", !lleno(x.plazo) && !lleno(x.fin) && "plazo", !lleno(x.indicador.nombre) && "indicador"].filter(Boolean);
      if (falta.length) A.push(Object.assign({ nivel: "warn", texto: `${n}: falta ${listaY(falta)}. Sin ${falta.length === 1 ? "eso" : "ellos"} no se puede hacer el seguimiento.` }, base));
      if (lleno(x.indicador.nombre) && !lleno(x.indicador.estandar)) A.push(Object.assign({ nivel: "nota", texto: `${n}: el indicador no tiene estándar. ¿Qué valor consideraréis aceptable (por ejemplo, ≥ 95 %)?` }, base));
      if (!x.actuaSobre.length) A.push(Object.assign({ nivel: "nota", texto: `${n}: marca sobre qué actúa (ocurrencia, detección o gravedad). Os servirá para volver a puntuar el fallo en el paso 8.` }, base));
      if (vencida(x, hoy)) A.push(Object.assign({ nivel: "warn", texto: `${n}: el plazo terminó el ${fmtFecha(x.fin)} y la acción sigue ${ESTADOS_ACCION[x.estado].toLowerCase()}.` }, base));
    }));
    const todas = PR.flatMap(accionesDe), fz = todas.map(x => fuerzaMedida(x.que));
    if (todas.length >= 3 && fz.every(z => z === "debil")) A.push({ nivel: "warn", texto: "Todas las acciones son de formación, avisos o sensibilización: medidas débiles, que dependen de la memoria y la buena voluntad. Añadid alguna que cambie el sistema (obligar, automatizar o eliminar el paso que falla)." });
    else if (todas.length >= 3 && !fz.includes("fuerte")) A.push({ nivel: "nota", texto: "Ninguna acción es una medida fuerte (que obligue, automatice o elimine el paso que falla). Si es posible, combinad las medidas intermedias con alguna fuerte." });
    return A.map(x => Object.assign({ paso: 7 }, x));
  }

  // ---------- Reevaluar y cerrar (paso 8) ----------
  const conAcciones = a => prioritarios(a).filter(f => accionesDe(f).length);
  function avisosCerrar(a) {
    const A = [], F = conAcciones(a), pend = [];
    if (!F.length) A.push({ nivel: "nota", texto: "Primero define las acciones de mejora de los fallos prioritarios (paso 7)." });
    F.forEach(f => {
      const r = f.residual, v0 = iprDe(f), v1 = iprResidual(f);
      if (![r.g, r.o, r.d].some(lleno)) { pend.push(f); return; }
      if (!v1) { A.push({ nivel: "error", fallo: f.id, texto: `Nº ${f.num}: G, O y D tras las acciones tienen que ser enteros del 1 al 10.` }); return; }
      if (v0 && v1 >= v0) A.push({ nivel: "warn", fallo: f.id, texto: `Nº ${f.num}: el IPR tras las acciones (${v1}) no baja del inicial (${v0}). Así las acciones no reducen el riesgo: revisadlas.` });
      if (entero1a10(r.g) < entero1a10(f.g) && !lleno(r.nota)) A.push({ nivel: "warn", fallo: f.id, texto: `Nº ${f.num}: la gravedad baja de ${f.g} a ${r.g}. Es raro: una acción suele bajar la ocurrencia o mejorar la detección, pero el daño posible casi nunca cambia si no se cambia el proceso. Explica por qué en la nota.` });
      const act = new Set(f.acciones.flatMap(x => x.actuaSobre));
      ["o", "d"].forEach(k => { if (entero1a10(r[k]) < entero1a10(f[k]) && !act.has(k)) A.push({ nivel: "nota", fallo: f.id, texto: `Nº ${f.num}: baja la ${ESCALA_NOM[k].toLowerCase()} (de ${f[k]} a ${r[k]}), pero ninguna acción dice actuar sobre ella. Revisa el paso 7.` }); });
    });
    if (pend.length) A.push({ nivel: "nota", texto: `Falta volver a puntuar ${pend.length === 1 ? "un fallo" : pend.length + " fallos"} con acciones (nº ${pend.map(f => f.num).join(", ")}): ¿cómo quedarían G, O y D cuando las acciones funcionen?` });
    if (F.length && !lleno(a.conclusiones)) A.push({ nivel: "nota", texto: "Escribe las conclusiones del AMFE (la app propone un texto con las cifras)." });
    if (!a.control.aprobado.some(p => lleno(p.nombre) || lleno(p.cargo))) A.push({ nivel: "nota", texto: "Indica quién aprueba el documento en el control del documento." });
    if (!lleno(a.proxRevision)) A.push({ nivel: "nota", texto: "Fija la fecha de la próxima revisión. Los riesgos cambian con el tiempo, con las acciones y con los incidentes: el AMFE se revisa periódicamente." });
    return A.map(x => Object.assign({ paso: 8 }, x));
  }
  function resumenMejora(a, hoy) {
    const PR = prioritarios(a), AC = PR.flatMap(accionesDe), F = conAcciones(a), R = F.filter(iprResidual);
    const porEstado = Object.keys(ESTADOS_ACCION).reduce((o, k) => (o[k] = AC.filter(x => x.estado === k).length, o), {});
    const ini = R.reduce((s, f) => s + iprDe(f), 0), fin = R.reduce((s, f) => s + iprResidual(f), 0);
    return { prioritarios: PR.length, conAccion: F.length, acciones: AC.length, porEstado, vencidas: AC.filter(x => vencida(x, hoy)).length,
      reevaluados: R.length, iprInicial: ini, iprResidual: fin, reduccion: ini ? Math.round((1 - fin / ini) * 100) : null };
  }
  function conclusionesSugeridas(a) {
    const r = resumen(a), PR = prioritarios(a), F = a.fallos.filter(f => lleno(f.fallo) && iprDe(f)), m = resumenMejora(a, "");
    if (!r.n) return "";
    const vals = F.map(iprDe), crit = PR.filter(f => f.critico).length;
    const sub = porSubproceso(a).filter(s => s.prio).sort((x, y) => y.prio - x.prio || y.max - x.max)[0];
    const partes = [`El AMFE del proceso «${a.proceso || a.titulo || "analizado"}» ha identificado ${plural(r.n, "fallo potencial", "fallos potenciales")} en ${plural(r.subprocesos, "subproceso", "subprocesos")}${vals.length ? `, con un IPR entre ${Math.min(...vals)} y ${Math.max(...vals)}` : ""}.`];
    if (PR.length) partes.push(`Se han priorizado ${plural(PR.length, "fallo", "fallos")} (${a.prioridad.modo === "umbral" ? `IPR igual o mayor que ${umbralPrioridad(a)}` : `los ${nPrioridad(a)} de mayor IPR`}${crit ? `, más ${plural(crit, "fallo crítico", "fallos críticos")}` : ""})${sub ? `, que se concentran sobre todo en «${sub.nombre}» (${sub.prio})` : ""}.`);
    if (m.acciones) partes.push(`Para ellos se han propuesto ${plural(m.acciones, "acción de mejora", "acciones de mejora")}, con responsable, plazo e indicador de seguimiento.`);
    if (m.reevaluados && m.reduccion !== null) partes.push(`Si las acciones funcionan como se espera, el IPR de los ${plural(m.reevaluados, "fallo reevaluado", "fallos reevaluados")} bajaría en conjunto de ${m.iprInicial} a ${m.iprResidual} (un ${m.reduccion} % menos).`);
    partes.push(`Las acciones se comprobarán con sus indicadores y, cuando proceda, con una auditoría. El AMFE se revisará ${lleno(a.proxRevision) ? "el " + fmtFecha(a.proxRevision) : "periódicamente"}, o antes si cambia el proceso o se produce un incidente relacionado.`);
    return partes.join(" ");
  }

  // ---------- Encontrar los fallos (paso 3): lluvia de ideas y técnica de grupo nominal ----------
  const PREGUNTAS_GUIA = ["¿Qué puede salir mal en este paso?", "¿Qué errores hemos visto en el pasado?", "¿Qué fallos podríamos prever?", "¿Qué pasa si falta alguien, algo o hay prisa?", "¿Dónde se pierde o se confunde información?"];
  const MODOS_TGN = { "321": { nom: "3, 2 y 1 puntos", que: "Cada persona elige los tres bloques que le parecen más importantes y les da 3, 2 y 1 puntos (como en el curso)." }, "1a10": { nom: "Del 1 al 10", que: "Cada persona puntúa todos los bloques del 1 al 10." } };
  function nuevaTgn() { return { modo: "321", votos: [] }; }
  function nuevaIdea(id, subprocesoId = "") { return { id, subprocesoId, texto: "", bloqueId: "", falloId: "" }; }
  function nuevoBloque(id, nombre = "") { return { id, nombre, comentario: "" }; }
  // Palabras con contenido (sin artículos ni preposiciones) para comparar ideas
  const VACIAS = new Set("el la los las un una unos unas de del al a en y o u que se no por con sin para su sus lo le les es son muy mas".split(" "));
  const palabras = s => normal(s).split(" ").filter(w => w.length > 2 && !VACIAS.has(w));
  function parecidas(x, y) {
    const A = new Set(palabras(x)), B = new Set(palabras(y)); if (!A.size || !B.size) return false;
    const comunes = [...A].filter(w => B.has(w)).length;
    return comunes / Math.min(A.size, B.size) >= 0.6;
  }
  // Parejas de ideas que parecen la misma (para agrupar o quitar duplicados)
  function duplicados(ideas) {
    const l = ideas.filter(i => lleno(i.texto)), r = [];
    for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) if (parecidas(l[i].texto, l[j].texto)) r.push([l[i], l[j]]);
    return r;
  }
  // Recuento del grupo nominal: total de puntos por bloque, de mayor a menor (a igual total, más votos)
  function ranking(a) {
    return a.bloques.map((b, i) => { const v = a.tgn.votos.filter(x => x.bloqueId === b.id).map(x => num(x.puntos)).filter(n => Number.isFinite(n) && n > 0); return { b, i, total: v.reduce((s, n) => s + n, 0), votos: v.length, ideas: a.ideas.filter(x => x.bloqueId === b.id).length }; })
      .sort((x, y) => y.total - x.total || y.votos - x.votos || x.i - y.i);
  }
  // Voto 3-2-1: qué bloque ha recibido de un miembro cada valor (3, 2, 1)
  const voto321 = (a, miembroId, puntos) => { const v = a.tgn.votos.find(x => x.miembroId === miembroId && String(x.puntos) === String(puntos)); return v ? v.bloqueId : ""; };
  function ponerVoto321(a, miembroId, puntos, bloqueId) {
    // Un valor por miembro, y un bloque no puede recibir dos valores del mismo miembro
    a.tgn.votos = a.tgn.votos.filter(x => !(x.miembroId === miembroId && (String(x.puntos) === String(puntos) || (bloqueId && x.bloqueId === bloqueId))));
    if (bloqueId) a.tgn.votos.push({ miembroId, bloqueId, puntos: String(puntos) });
  }
  const voto1a10 = (a, miembroId, bloqueId) => { const v = a.tgn.votos.find(x => x.miembroId === miembroId && x.bloqueId === bloqueId); return v ? v.puntos : ""; };
  function ponerVoto1a10(a, miembroId, bloqueId, puntos) {
    a.tgn.votos = a.tgn.votos.filter(x => !(x.miembroId === miembroId && x.bloqueId === bloqueId));
    if (lleno(puntos)) a.tgn.votos.push({ miembroId, bloqueId, puntos: String(puntos).trim() });
  }
  // Una idea se convierte en modo de fallo (en su subproceso); la idea guarda el fallo creado
  function ideaAFallo(a, idea, genId) {
    if (idea.falloId && a.fallos.some(f => f.id === idea.falloId)) return null;
    const f = Object.assign(nuevoFallo(genId(), siguienteNum(a)), { subprocesoId: idea.subprocesoId, fallo: idea.texto.trim() });
    a.fallos.push(f); idea.falloId = f.id; return f;
  }
  function avisosIdeas(a) {
    const A = [], I = a.ideas.filter(i => lleno(i.texto)), M = a.equipo.filter(m => lleno(m.perfil));
    if (!a.subprocesos.filter(s => lleno(s.nombre)).length) A.push({ nivel: "nota", texto: "Define primero los subprocesos (paso 1): la lluvia de ideas se hace subproceso a subproceso." });
    if (!I.length) { A.push({ nivel: "nota", texto: "Apuntad todas las ideas sin juzgarlas: «¿qué puede salir mal en este paso?». Se puede pedir tres ideas a cada persona." }); return A.map(x => Object.assign({ paso: 3 }, x)); }
    const sinSub = I.filter(i => !a.subprocesos.some(s => s.id === i.subprocesoId)).length;
    if (sinSub) A.push({ nivel: "nota", texto: `${sinSub === 1 ? "Una idea no tiene" : sinSub + " ideas no tienen"} subproceso.` });
    duplicados(I).slice(0, 5).forEach(([x, y]) => A.push({ nivel: "nota", texto: `«${corto(x.texto, 50)}» y «${corto(y.texto, 50)}» parecen la misma idea. Agrupadlas en el mismo bloque o quitad una.` }));
    const sinBloque = I.filter(i => !a.bloques.some(b => b.id === i.bloqueId)).length;
    if (I.length >= 4 && sinBloque) A.push({ nivel: "nota", texto: `${sinBloque === 1 ? "Una idea está" : sinBloque + " ideas están"} sin agrupar. Agruparlas en bloques ayuda a ver los temas y a votar.` });
    if (a.bloques.length >= 2 && M.length) {
      const R = ranking(a), votaron = new Set(a.tgn.votos.map(v => v.miembroId)), faltan = M.filter(m => !votaron.has(m.id));
      if (votaron.size && faltan.length) A.push({ nivel: "nota", texto: `Falta el voto de ${faltan.length === 1 ? "un miembro" : faltan.length + " miembros"} del equipo (${faltan.map(m => corto(m.perfil, 30)).join(", ")}).` });
      if (votaron.size) {
        if (a.tgn.modo === "321") M.forEach(m => { const n = [3, 2, 1].filter(p => voto321(a, m.id, p)).length; if (n && n < 3) A.push({ nivel: "nota", texto: `${corto(m.perfil, 40)} ha repartido ${n} de sus 3 votos.` }); });
        const malos = a.tgn.modo === "1a10" ? a.tgn.votos.filter(v => !entero1a10(v.puntos)).length : 0;
        if (malos) A.push({ nivel: "error", texto: "Los votos del 1 al 10 tienen que ser números enteros del 1 al 10." });
        const ignorados = R.filter(r => !r.total && !lleno(r.b.comentario));
        if (ignorados.length) A.push({ nivel: "nota", texto: `${ignorados.length === 1 ? "Un bloque no ha recibido" : ignorados.length + " bloques no han recibido"} ningún voto. Comentadlos también: a veces esconden un riesgo grave que nadie quiso destacar (en el curso, «No evaluación del riesgo de caída»).` });
      }
    }
    const pendientes = I.filter(i => !i.falloId || !a.fallos.some(f => f.id === i.falloId)).length;
    if (pendientes && a.tgn.votos.length) A.push({ nivel: "nota", texto: `${pendientes === 1 ? "Queda una idea" : "Quedan " + pendientes + " ideas"} sin pasar a fallos. Las que el grupo considere importantes pasan al paso 4 como modos de fallo.` });
    return A.map(x => Object.assign({ paso: 3 }, x));
  }

  // ---------- Diagrama de Ishikawa por fallo (mejora B) ----------
  // Las siete ramas que usan los ejercicios del curso
  const RAMAS_ISHIKAWA = {
    personal: { corto: "Personal", nom: "Personal", que: "Formación, experiencia, cansancio, presión asistencial." },
    procedimiento: { corto: "Procedimientos", nom: "Procedimiento y protocolos", que: "Protocolos que no existen, no se conocen o no se cumplen; pasos que faltan." },
    entorno: { corto: "Entorno", nom: "Entorno", que: "Ruido, luz, espacio, interrupciones, condiciones del lugar." },
    equipamiento: { corto: "Equipos y tecnología", nom: "Equipamiento y tecnología", que: "Aparatos, sistemas informáticos, material que falla o no ayuda." },
    comunicacion: { corto: "Comunicación", nom: "Comunicación", que: "Información que no llega, se entiende mal o no se registra." },
    paciente: { corto: "Paciente", nom: "Factores del paciente", que: "Estado clínico o cognitivo, idioma, falta de acompañante." },
    organizacion: { corto: "Organización", nom: "Sistema y organización", que: "Cultura de seguridad, cargas de trabajo, circuitos, supervisión." }
  };
  function nuevaCausaIsh(id, cat = "personal") { return { id, cat, texto: "", porques: ["", "", ""], elegida: false }; }
  // La causa de fondo de una rama: el último «¿por qué?» contestado (o la propia causa)
  const causaRaiz = x => [...x.porques].reverse().find(lleno) || x.texto;
  const causasElegidas = f => f.ishikawa.filter(x => x.elegida && lleno(x.texto));
  // Para la columna «causa»: cada causa elegida con su causa de fondo, si se han contestado los porqués
  const limpia = t => String(t).trim().replace(/[.;]$/, "");
  function textoCausaIshikawa(f) { return causasElegidas(f).map(x => limpia(x.texto) + (causaRaiz(x) !== x.texto ? ` (de fondo: ${limpia(causaRaiz(x)).replace(/^./, m => m.toLowerCase())})` : "")).join("; "); }

  // ---------- Votación del equipo para G·O·D (mejora A) ----------
  // La media se redondea al entero (0,5 hacia arriba); si entre el voto más alto y el más bajo hay 4 puntos o más, hay que hablarlo
  function mediaVotos(f) {
    const r = {};
    ["g", "o", "d"].forEach(k => {
      const v = f.votos.map(x => entero1a10(x[k])).filter(Boolean);
      r[k] = v.length ? { n: v.length, media: Math.round(v.reduce((s, x) => s + x, 0) / v.length), exacta: v.reduce((s, x) => s + x, 0) / v.length, rango: Math.max(...v) - Math.min(...v) } : null;
    });
    return r;
  }
  const discrepancia = f => ["g", "o", "d"].filter(k => { const m = mediaVotos(f)[k]; return m && m.n >= 2 && m.rango >= 4; });
  function ponerVotoGOD(f, miembroId, k, valor) {
    let v = f.votos.find(x => x.miembroId === miembroId);
    if (!v) { v = { miembroId, g: "", o: "", d: "" }; f.votos.push(v); }
    v[k] = String(valor).trim();
    f.votos = f.votos.filter(x => [x.g, x.o, x.d].some(lleno));
  }

  // ---------- Ediciones y revisión periódica (mejora G) ----------
  // Una nueva edición copia el AMFE entero (mismos ids de fallos, para poder comparar) y la enlaza con la anterior
  function nuevaEdicion(a, genId, fechaIso) {
    const c = JSON.parse(JSON.stringify(a)), ed = String((parseInt(a.edicion, 10) || 0) + 1).padStart(2, "0");
    Object.assign(c, { id: genId(), edicion: ed, anteriorId: a.id, proxRevision: "", conclusiones: "", creado: fechaIso, modificado: fechaIso });
    c.control.historial.push({ edicion: ed, fecha: fechaIso.slice(0, 10), cambio: "Revisión periódica del AMFE" });
    return c;
  }
  function compararEdiciones(ant, act) {
    const filas = [], vistos = new Set();
    act.fallos.filter(f => lleno(f.fallo)).forEach(f => {
      const g = ant.fallos.find(x => x.id === f.id) || null; if (g) vistos.add(g.id);
      const v0 = g ? iprDe(g) : null, v1 = iprDe(f);
      filas.push({ num: f.num, fallo: f.fallo, antes: v0, ahora: v1, cambio: !g ? "nuevo" : !v0 || !v1 ? "sin" : v1 < v0 ? "baja" : v1 > v0 ? "sube" : "igual" });
    });
    ant.fallos.filter(f => lleno(f.fallo) && !vistos.has(f.id)).forEach(f => filas.push({ num: f.num, fallo: f.fallo, antes: iprDe(f), ahora: null, cambio: "quitado" }));
    const cuenta = k => filas.filter(x => x.cambio === k).length;
    return { filas: filas.sort((x, y) => x.num - y.num), baja: cuenta("baja"), sube: cuenta("sube"), igual: cuenta("igual"), nuevo: cuenta("nuevo"), quitado: cuenta("quitado") };
  }
  // ¿Toca revisar? (fecha de próxima revisión pasada o en los próximos 30 días)
  function revisionProxima(a, hoyIso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.proxRevision || "")) return null;
    const dias = Math.round((new Date(a.proxRevision) - new Date(hoyIso)) / 864e5);
    return dias <= 30 ? { dias, vencida: dias < 0 } : null;
  }

  function avisos(a, hoy = "") { return [...avisosProceso(a), ...avisosEquipo(a), ...avisosIdeas(a), ...avisosFallos(a), ...avisosPuntuar(a), ...avisosPriorizar(a), ...avisosMejorar(a, hoy), ...avisosCerrar(a)]; }

  // ---------- Resumen y progreso ----------
  function resumen(a) {
    const F = a.fallos.filter(f => lleno(f.fallo)), vals = F.map(iprDe);
    const porNivel = { muyalto: 0, alto: 0, medio: 0, bajo: 0 };
    vals.forEach(v => { const n = nivelIPR(v); if (n) porNivel[n.k]++; });
    const porSub = a.subprocesos.map(s => { const l = F.filter(f => f.subprocesoId === s.id), v = l.map(iprDe).filter(Boolean); return { id: s.id, nombre: s.nombre, color: s.color, n: l.length, max: v.length ? Math.max(...v) : 0, media: v.length ? Math.round(v.reduce((x, y) => x + y, 0) / v.length) : 0 }; });
    return { n: F.length, puntuados: vals.filter(Boolean).length, maxIPR: vals.reduce((m, v) => Math.max(m, v || 0), 0), porNivel, porSub, equipo: a.equipo.filter(m => lleno(m.perfil)).length, subprocesos: a.subprocesos.filter(s => lleno(s.nombre)).length };
  }
  function progreso(a) {
    const F = a.fallos.filter(f => lleno(f.fallo)), subs = a.subprocesos.filter(s => lleno(s.nombre));
    return {
      1: lleno(a.proceso) && subs.length >= 2,
      2: a.equipo.filter(m => lleno(m.perfil)).length >= 3,
      3: a.ideas.some(i => lleno(i.texto) && i.falloId && a.fallos.some(f => f.id === i.falloId)),
      4: F.length >= 1 && F.every(f => subDe(a, f)),
      5: F.length >= 1 && F.every(f => iprDe(f)),
      6: F.length >= 1 && F.every(f => iprDe(f)) && prioritarios(a).length >= 1 && !avisosPriorizar(a).some(x => x.nivel === "warn" && x.fallo && /motivo/.test(x.texto)),
      7: prioritarios(a).length >= 1 && prioritarios(a).every(f => accionesDe(f).length && accionesDe(f).every(accionCompleta)),
      8: conAcciones(a).length >= 1 && conAcciones(a).every(f => iprResidual(f)) && lleno(a.conclusiones)
    };
  }
  // Primer paso disponible sin terminar (o el último disponible si todo está hecho)
  function pasoPendiente(a, entrega) {
    const g = progreso(a), disp = PASOS.filter(p => p.entrega <= entrega);
    const p = disp.find(x => x.k !== "ideas" && !g[x.n]);
    return p || null;
  }
  const TEXTO_PASO = {
    1: a => lleno(a.proceso) ? `Divide «${corto(a.proceso, 50)}» en subprocesos, con su inicio, su fin y quién interviene.` : "Describe el proceso que vais a analizar y divídelo en subprocesos.",
    2: () => "Forma el equipo del AMFE (al menos 6 perfiles distintos) y planifica las sesiones.",
    4: a => a.fallos.length ? "Completa los fallos: cada uno en su subproceso, con su efecto, su causa y los controles actuales." : "Escribe los fallos de cada subproceso: ¿qué puede salir mal en cada paso?",
    5: a => { const n = a.fallos.filter(f => lleno(f.fallo) && !iprDe(f)).length; return `Puntúa la gravedad, la ocurrencia y la detección de ${n === 1 ? "el fallo que queda" : "los " + n + " fallos que quedan"}.`; },
    6: a => prioritarios(a).length ? "Revisa los fallos prioritarios: escribe el motivo de los que habéis marcado o desmarcado a mano y de los críticos." : "Elige los fallos prioritarios: los de mayor IPR, los muy graves y los críticos. Mira la matriz de riesgos.",
    7: a => { const n = prioritarios(a).filter(f => !accionesDe(f).length).length; return n ? `Propón acciones de mejora para ${n === 1 ? "el fallo prioritario que queda" : "los " + n + " fallos prioritarios que quedan"}: qué, por qué, dónde, cuándo, quién y cómo.` : "Completa las acciones de mejora: cada una con su responsable, su plazo y su indicador."; },
    8: a => conAcciones(a).some(f => !iprResidual(f)) ? "Vuelve a puntuar los fallos con acciones: ¿cómo quedarían G, O y D cuando las acciones funcionen?" : "Escribe las conclusiones y el control del documento, y descarga el informe AMFE."
  };
  function siguientePaso(datos, entrega) {
    const L = datos.amfes;
    if (!L.length) return { k: "crear", texto: "Empieza tu primer AMFE: elige un proceso de tu unidad donde un fallo pueda dañar al paciente.", href: "#/amfe/nuevo", btn: "Crear un AMFE" };
    const a = L.slice().sort((x, y) => String(y.modificado).localeCompare(String(x.modificado)))[0];
    const p = pasoPendiente(a, entrega), nom = corto(a.titulo || a.proceso || "tu AMFE", 50);
    if (p) return { k: "paso" + p.n, texto: `«${nom}»: ${TEXTO_PASO[p.n](a)}`, href: `#/amfe/${a.id}/${p.n}`, btn: `Ir al paso ${p.n}` };
    return { k: "listo", texto: `«${nom}» está completo. Descarga el informe AMFE en Word o PDF, haz el seguimiento de las acciones y fija la próxima revisión.`, href: `#/amfe/${a.id}/8`, btn: "Ir al informe" };
  }

  // ---------- Pegar una tabla desde Excel/Calc/Word ----------
  const CAB_PEGAR = {
    subproceso: ["subproceso", "subprocesos", "fase", "etapa", "supbproceso"],
    num: ["id", "n", "no", "nº", "numero", "num"],
    fallo: ["fallo", "modo de fallo", "modos de fallo", "error", "riesgo", "punto critico", "error o punto critico"],
    efecto: ["efecto", "efectos", "consecuencia", "consecuencias"],
    causa: ["causa", "causas"],
    controles: ["controles", "controles actuales", "medidas", "medidas actuales", "medidas de control", "barreras"],
    g: ["g", "gravedad", "severidad", "s"],
    o: ["o", "ocurrencia", "frecuencia", "probabilidad"],
    d: ["d", "deteccion", "detectabilidad"]
  };
  const ORDEN_PEGAR = ["subproceso", "fallo", "efecto", "causa", "g", "o", "d"];
  function parsearTabla(texto) {
    const lineas = String(texto || "").replace(/\r\n?/g, "\n").split("\n").filter(l => l.trim());
    if (!lineas.length) return { filas: [], errores: ["No hay nada que importar."], cabecera: false };
    const sep = lineas.some(l => l.includes("\t")) ? "\t" : lineas.some(l => l.includes(";")) ? ";" : null;
    if (!sep) return { filas: [], errores: ["No se reconocen columnas. Copia la tabla directamente desde Excel, Calc o Word (columnas separadas por tabuladores) o usa «;» entre columnas."], cabecera: false };
    const celdas = lineas.map(l => l.split(sep).map(c => c.trim().replace(/^"(.*)"$/, "$1")));
    let mapa = ORDEN_PEGAR.slice(), cabecera = false;
    const reconocidas = celdas[0].map(c => { const t = sinTildes(c); return Object.keys(CAB_PEGAR).find(k => CAB_PEGAR[k].includes(t)) || null; });
    // Es cabecera si reconoce al menos dos nombres de columna y no trae números (una fila de datos sí los trae)
    if (reconocidas.filter(Boolean).length >= 2 && !celdas[0].some(c => Number.isFinite(num(c)))) { cabecera = true; mapa = reconocidas; celdas.shift(); }
    const filas = [], errores = [];
    celdas.forEach((c, i) => {
      const r = { subproceso: "", fallo: "", efecto: "", causa: "", controles: "", g: "", o: "", d: "" };
      c.forEach((v, j) => { const k = mapa[j]; if (k && k !== "num" && r[k] === "") r[k] = v.slice(0, 1000); });
      if (!lleno(r.fallo)) return;
      if ([r.g, r.o, r.d].some(lleno) && !ipr(r.g, r.o, r.d)) errores.push(`Fila ${i + 1 + (cabecera ? 1 : 0)}: G, O o D no son enteros del 1 al 10 (se importa igualmente para que lo corrijas).`);
      filas.push(r);
    });
    if (!filas.length) errores.push("No se ha encontrado ninguna fila con un fallo escrito.");
    return { filas, errores, cabecera };
  }
  // Añade al AMFE las filas pegadas; crea los subprocesos que no existan. Devuelve cuántos subprocesos ha creado.
  function incorporarFilas(a, filas, genId) {
    let nuevosSub = 0, n = siguienteNum(a);
    filas.forEach(r => {
      let s = null;
      if (lleno(r.subproceso)) {
        s = a.subprocesos.find(x => normal(x.nombre) === normal(r.subproceso));
        if (!s) { s = nuevoSubproceso(genId(), colorLibre(a)); s.nombre = r.subproceso.trim(); a.subprocesos.push(s); nuevosSub++; }
      }
      const f = nuevoFallo(genId(), n++);
      Object.assign(f, { subprocesoId: s ? s.id : "", fallo: r.fallo, efecto: r.efecto, causa: r.causa, controles: r.controles, g: r.g, o: r.o, d: r.d });
      a.fallos.push(f);
    });
    return nuevosSub;
  }

  // ---------- Paquete de intercambio «amfe-fallos» (para «Traer de AMFE» en Mapa de Riesgos y Auditorías) ----------
  // Forma FIJA y versionada (Diseño, 5.3): las otras apps leen esto, nunca «amfe-datos». Añadir campos no sube la
  // versión; quitar o cambiar el significado de uno sí (y entonces se escriben las dos versiones durante un tiempo).
  const FORMATO_INTERCAMBIO = "amfe-fallos", VERSION_INTERCAMBIO = 1;
  const numONull = v => entero1a10(v) || null;
  const mismasEscalas = e => ["g", "o", "d"].every(k => e[k].every((t, i) => t === ESCALAS_CURSO[k][i]));
  function paqueteIntercambio(amfes, appVersion, fecha) {
    return {
      formato: FORMATO_INTERCAMBIO, version: VERSION_INTERCAMBIO, app: "amfe", appVersion, generado: fecha,
      amfes: amfes.map(a => {
        const m = prioridad(a), P = puestos(a.fallos), modo = a.prioridad.modo === "umbral" ? "umbral" : "top";
        return {
          id: a.id, titulo: a.titulo || a.proceso, proceso: a.proceso, unidad: a.unidad, fecha: a.fecha, edicion: "",
          escalas: mismasEscalas(a.escalas) ? "curso" : { g: a.escalas.g.slice(), o: a.escalas.o.slice(), d: a.escalas.d.slice() },
          criterio: { modo, n: modo === "top" ? nPrioridad(a) : null, umbral: modo === "umbral" ? umbralPrioridad(a) : null },
          subprocesos: a.subprocesos.map((s, i) => ({ id: s.id, orden: i + 1, nombre: s.nombre, inicio: s.inicio, fin: s.fin, roles: s.roles })),
          fallos: ordenarFallos(a.fallos.filter(f => lleno(f.fallo)), "sub", a.subprocesos).map(f => {
            const e = m[f.id];
            return { id: f.id, num: f.num, subprocesoId: f.subprocesoId, subproceso: nombreSub(a, f), fallo: f.fallo, efecto: f.efecto, causa: f.causa, controles: f.controles,
              g: numONull(f.g), o: numONull(f.o), d: numONull(f.d), ipr: iprDe(f), puesto: P[f.id] || null,
              prioritario: e.prio, motivoPrioridad: !e.prio ? null : e.por === "criterio" ? modo : e.por, motivo: f.critico ? f.motivoCritico : f.motivo,
              critico: f.critico, grave: e.grave, zona: e.zona,
              acciones: accionesDe(f).map(x => ({ que: x.que, porque: x.porque, donde: x.donde, plazo: x.plazo, fin: x.fin, quien: x.quien, como: x.como, tipo: x.tipo, clase: x.clase, fuerza: fuerzaMedida(x.que) || null, actuaSobre: x.actuaSobre.slice(), indicador: Object.assign({}, x.indicador), estado: x.estado })),
              residual: iprResidual(f) ? { g: numONull(f.residual.g), o: numONull(f.residual.o), d: numONull(f.residual.d), ipr: iprResidual(f) } : null };
          })
        };
      })
    };
  }
  // Lo que hará la app que recibe: comprobar formato y versión antes de usar nada (aquí sirve para los tests y de modelo)
  function leerIntercambio(o) {
    if (!o || typeof o !== "object" || o.formato !== FORMATO_INTERCAMBIO || o.version !== VERSION_INTERCAMBIO || !Array.isArray(o.amfes)) return null;
    return o.amfes.filter(x => x && typeof x === "object" && Array.isArray(x.fallos));
  }

  // ---------- Documentos (bloques que docx.js convierte en Word y app.js en HTML para imprimir/PDF) ----------
  // Bloques: {t:"portada"}, {t:"h1"|"h2", texto}, {t:"p", texto|runs, estilo}, {t:"lista", items}, {t:"tabla", cab, filas, anchos, fuente}, {t:"salto"}
  const FONDO_NIVEL = { muyalto: "FFE4E6", alto: "FFEDD5", medio: "FEF3C7", bajo: "DCFCE7" };
  const FONDO_ZONA = { verde: "BBF7D0", amarillo: "FEF08A", naranja: "FED7AA", rojo: "FCA5A5" };
  const celdaIpr = v => v ? { texto: String(v), centro: true, negrita: true, fondo: FONDO_NIVEL[nivelIPR(v).k] } : { texto: "", centro: true };
  const C_ = t => ({ texto: t == null ? "" : String(t), centro: true });
  function bloquesControl(control) {
    const filas = [];
    [["Elaborado", control.elaborado], ["Revisado", control.revisado], ["Aprobado", control.aprobado]].forEach(([k, ps]) => {
      const v = ps.filter(x => lleno(x.nombre) || lleno(x.cargo));
      (v.length ? v : [nuevaPersona()]).forEach((x, i) => filas.push([{ texto: i === 0 ? k : "", negrita: true, fondo: "FDF3EC" }, x.nombre || " ", x.cargo || " "]));
    });
    return [{ t: "tabla", cab: ["", "Nombre", "Cargo"], filas, anchos: [18, 41, 41] }, { t: "h2", texto: "Histórico de revisiones" },
      { t: "tabla", cab: ["Edición", "Fecha", "Cambio"], filas: control.historial.filter(h => lleno(h.edicion) || lleno(h.cambio)).map(h => [h.edicion, fmtFecha(h.fecha), h.cambio]), anchos: [14, 22, 64] }];
  }
  function bloqueMatriz(a, fallos, tam) {
    const etq = i => tam === 10 ? String(i) : TRAMOS[i - 1];
    return { t: "tabla", fuente: 8, cab: ["G \\ O", ...Array.from({ length: tam }, (_, i) => etq(i + 1))], anchos: [12, ...Array(tam).fill(88 / tam)],
      filas: matriz(fallos, tam).map(fila => [{ texto: etq(fila[0].g), negrita: true, centro: true }, ...fila.map(cl => ({ texto: cl.fallos.map(f => f.num).join(", "), centro: true, negrita: true, fondo: FONDO_ZONA[cl.zona] }))]) };
  }
  const textoMotivo = (a, f, e) => e.por === "critico" ? "Fallo crítico. " + f.motivoCritico : e.por === "manual" ? "Decisión del equipo. " + f.motivo : (a.prioridad.modo === "umbral" ? `IPR ≥ ${umbralPrioridad(a)}` : `Entre los ${nPrioridad(a)} de mayor IPR`);
  function introduccionSugerida(a) {
    return `La gestión proactiva de la seguridad del paciente exige identificar de forma sistemática los riesgos de los procesos asistenciales antes de que causen daño. Este documento recoge el Análisis Modal de Fallos y Efectos (AMFE) del proceso «${a.proceso || a.titulo || ""}»${lleno(a.unidad) ? ` en ${a.unidad}` : ""}: la delimitación del proceso y sus subprocesos, el equipo que lo ha realizado, los fallos potenciales con sus efectos y causas, su priorización mediante el Índice de Prioridad de Riesgo (IPR = gravedad × ocurrencia × detección) y la matriz de riesgos, las acciones de mejora propuestas para los fallos prioritarios y la reevaluación del riesgo esperado tras aplicarlas. La metodología es reproducible y adaptable a cualquier otro proceso clínico o de soporte.`;
  }
  function documentoInforme(a, fecha, tam = 10) {
    const B = [], r = resumen(a), m = prioridad(a), PR = prioritarios(a), P = puestos(a.fallos), nom = a.proceso || a.titulo || "Proceso sin nombre";
    const F = ordenarFallos(a.fallos.filter(f => lleno(f.fallo)), "sub", a.subprocesos);
    B.push({ t: "portada", titulo: "Análisis Modal de Fallos y Efectos (AMFE)", sub: nom, extra: [a.unidad, a.fecha || fecha, lleno(a.responsable) ? "Responsable: " + a.responsable : ""].filter(lleno) });
    B.push({ t: "h1", texto: "Control del documento" }, ...bloquesControl(a.control));
    B.push({ t: "salto" });
    B.push({ t: "h1", texto: "1. Introducción" }, { t: "p", texto: lleno(a.introduccion) ? a.introduccion : introduccionSugerida(a) });
    B.push({ t: "h1", texto: "2. Descripción del proceso" });
    if (lleno(a.objetivo)) B.push({ t: "p", runs: [{ texto: "Objetivo del proceso. ", negrita: true }, { texto: a.objetivo }] });
    const datos = [["Empieza", a.inicio], ["Termina", a.fin], ["Qué queda dentro", a.incluye], ["Qué queda fuera", a.excluye]].filter(x => lleno(x[1]));
    if (datos.length) B.push({ t: "tabla", sinCab: true, anchos: [26, 74], filas: datos.map(([k, v]) => [{ texto: k, negrita: true, fondo: "FDF3EC" }, v]) });
    if (a.subprocesos.length) { B.push({ t: "h2", texto: "2.1. Subprocesos" }, { t: "tabla", fuente: 8, cab: ["Nº", "Subproceso", "Descripción", "Inicio", "Fin", "Roles"], anchos: [5, 19, 25, 17, 17, 17], filas: a.subprocesos.map((s, i) => [C_(i + 1), { texto: s.nombre, negrita: true }, s.descripcion, s.inicio, s.fin, s.roles]) }); }
    B.push({ t: "h1", texto: "3. Equipo y metodología" });
    if (a.equipo.length) { B.push({ t: "h2", texto: "3.1. Equipo de trabajo" }, { t: "tabla", fuente: 8, cab: ["Nº", "Perfil profesional", "Cargo", "Papel", "Justificación"], anchos: [5, 22, 20, 15, 38], filas: a.equipo.map((x, i) => [C_(i + 1), { texto: x.perfil + (lleno(x.nombre) ? "\n" + x.nombre : ""), negrita: true }, x.cargo, ROLES[x.rol].nom, x.justificacion]) }); }
    B.push({ t: "h2", texto: "3.2. Metodología" }, { t: "p", texto: "Los fallos se identificaron en grupo, subproceso a subproceso (lluvia de ideas y técnica de grupo nominal). Para cada fallo se describieron su efecto, su causa y los controles que ya existen, y se puntuaron de 1 a 10 la gravedad (G), la ocurrencia (O) y la detección (D) con las escalas del Anexo I. El Índice de Prioridad de Riesgo es IPR = G × O × D (de 1 a 1.000)." });
    if (a.sesiones.length) B.push({ t: "tabla", fuente: 8, cab: ["Sesión", "Fecha", "Actividad principal", "Duración", "Resultados"], anchos: [9, 13, 33, 10, 35], filas: a.sesiones.map((x, i) => [C_(i + 1), C_(fmtFecha(x.fecha)), x.actividad, C_(x.duracion), x.resultados]) });
    B.push({ t: "h1", texto: "4. Resultados del análisis" });
    const vals = F.map(iprDe).filter(Boolean);
    B.push({ t: "p", texto: `Se identificaron ${plural(r.n, "fallo potencial", "fallos potenciales")} en ${plural(r.subprocesos, "subproceso", "subprocesos")}${vals.length ? `, con un IPR entre ${Math.min(...vals)} y ${Math.max(...vals)}` : ""}. Se consideran prioritarios ${PR.length === 1 ? "el fallo" : "los " + PR.length + " fallos"} ${a.prioridad.modo === "umbral" ? `con IPR igual o mayor que ${umbralPrioridad(a)}` : `de mayor IPR (los ${nPrioridad(a)} primeros)`}${PR.some(f => f.critico) ? ", más los marcados como críticos" : ""}${PR.some(f => f.manual === "si") ? " y los añadidos por el equipo" : ""}. El listado completo está en el Anexo II.` });
    if (PR.length) {
      B.push({ t: "h2", texto: "4.1. Fallos prioritarios" }, { t: "tabla", fuente: 8, cab: ["Puesto", "Nº", "Subproceso", "Modo de fallo", "Efecto", "Causa", "G", "O", "D", "IPR", "Motivo"], anchos: [8, 4, 12, 17, 15, 15, 3, 3, 3, 6, 14],
        filas: PR.map(f => [C_(P[f.id] || ""), C_(f.num), nombreSub(a, f), { texto: f.fallo, negrita: true }, f.efecto, f.causa, C_(f.g), C_(f.o), C_(f.d), celdaIpr(iprDe(f)), textoMotivo(a, f, m[f.id])]) });
      const graves = a.fallos.filter(f => m[f.id] && m[f.id].grave);
      if (graves.length) B.push({ t: "p", estilo: "nota", texto: `Fallos con gravedad 9–10: nº ${graves.map(f => f.num).join(", ")}.` });
      B.push({ t: "h2", texto: "4.2. Matriz de riesgos" }, { t: "p", texto: "Cada fallo prioritario se sitúa según su gravedad (filas) y su ocurrencia (columnas). Zonas: verde, riesgo bajo (aceptable); amarillo, moderado (vigilar); naranja, alto (intervenir); rojo, muy alto (intervenir de inmediato). La matriz no tiene en cuenta la detección: complementa al IPR, no lo sustituye." }, bloqueMatriz(a, PR, tam));
      B.push({ t: "h2", texto: "4.3. Priorización por subprocesos" }, { t: "tabla", fuente: 8, cab: ["Subproceso", "Fallos", "Prioritarios", "IPR máximo", "IPR medio"], anchos: [44, 14, 14, 14, 14], filas: porSubproceso(a).filter(s => s.n).map(s => [s.nombre, C_(s.n), { texto: String(s.prio), centro: true, negrita: true }, celdaIpr(s.max), C_(s.media || "")]) });
    }
    const CA = conAcciones(a);
    B.push({ t: "h1", texto: "5. Acciones de mejora" });
    if (!CA.length) B.push({ t: "p", texto: "Pendiente de definir las acciones de mejora de los fallos prioritarios." });
    else {
      B.push({ t: "p", texto: "Para cada fallo prioritario se proponen acciones que eliminen su causa, reduzcan su probabilidad o mejoren su detección. Cada acción se define con el modelo 5W1H (qué, por qué, dónde, cuándo, quién y cómo) y un indicador con su estándar para el seguimiento. Criterios: específicas, factibles, medibles, sostenibles y aceptables para el equipo." });
      B.push({ t: "h2", texto: "5.1. Acciones propuestas (5W1H)" }, { t: "tabla", fuente: 8, cab: ["Nº", "Modo de fallo", "Qué", "Por qué", "Dónde", "Cuándo", "Quién", "Cómo"], anchos: [4, 14, 17, 14, 10, 9, 12, 20],
        filas: CA.flatMap(f => accionesDe(f).map((x, i) => [C_(i ? "" : f.num), i ? "" : { texto: f.fallo, negrita: true }, { texto: x.que, negrita: true }, x.porque, x.donde, [x.plazo, fmtFecha(x.fin)].filter(lleno).join("\n"), x.quien, x.como])) });
      B.push({ t: "h2", texto: "5.2. Indicadores y seguimiento" }, { t: "tabla", fuente: 8, cab: ["Nº", "Acción", "Tipo", "Fuerza", "Indicador", "Estándar", "Fuente", "Estado"], anchos: [4, 22, 13, 10, 22, 9, 11, 9],
        filas: CA.flatMap(f => accionesDe(f).map(x => [C_(f.num), x.que, [TIPOS_ACCION[x.tipo] ? TIPOS_ACCION[x.tipo].nom : "", CLASES_ACCION[x.clase] ? CLASES_ACCION[x.clase].nom : ""].filter(lleno).join("\n"), FUERZAS[fuerzaMedida(x.que)] ? FUERZAS[fuerzaMedida(x.que)].nom.replace("Medida ", "") : "", x.indicador.nombre + (lleno(x.indicador.formula) ? "\n" + x.indicador.formula : ""), C_(x.indicador.estandar), x.indicador.fuente, C_(ESTADOS_ACCION[x.estado])])) });
      const R = CA.filter(iprResidual);
      B.push({ t: "h1", texto: "6. Reevaluación del riesgo" });
      if (R.length) {
        const mm = resumenMejora(a, "");
        B.push({ t: "p", texto: `Puntuación esperada de cada fallo cuando las acciones estén implantadas (IPR residual). En conjunto, el IPR de los ${plural(R.length, "fallo reevaluado", "fallos reevaluados")} pasaría de ${mm.iprInicial} a ${mm.iprResidual} (un ${mm.reduccion} % menos).` },
          { t: "tabla", fuente: 8, cab: ["Nº", "Modo de fallo", "G·O·D inicial", "IPR inicial", "G·O·D tras acciones", "IPR residual", "Reducción", "Nota"], anchos: [4, 26, 11, 9, 12, 9, 9, 20],
            filas: R.map(f => { const v0 = iprDe(f), v1 = iprResidual(f); return [C_(f.num), { texto: f.fallo, negrita: true }, C_(`${f.g} · ${f.o} · ${f.d}`), celdaIpr(v0), C_(`${f.residual.g} · ${f.residual.o} · ${f.residual.d}`), celdaIpr(v1), C_(Math.round((1 - v1 / v0) * 100) + " %"), [f.residual.nota, lleno(f.residual.fecha) ? "(" + fmtFecha(f.residual.fecha) + ")" : ""].filter(lleno).join(" ")]; }) });
      } else B.push({ t: "p", texto: "Pendiente de volver a puntuar los fallos tras las acciones." });
    }
    B.push({ t: "h1", texto: `${CA.length ? 7 : 6}. Conclusiones` }, { t: "p", texto: lleno(a.conclusiones) ? a.conclusiones : conclusionesSugeridas(a) });
    if (lleno(a.proxRevision)) B.push({ t: "p", runs: [{ texto: "Próxima revisión del AMFE: ", negrita: true }, { texto: fmtFecha(a.proxRevision) }] });
    B.push({ t: "salto" }, { t: "h1", texto: "Anexo I. Escalas de puntuación" }, { t: "tabla", fuente: 8, cab: ["Puntos", "Gravedad", "Ocurrencia", "Detección"], anchos: [10, 30, 30, 30], filas: TRAMOS.map((t, i) => [{ texto: t, centro: true, negrita: true }, a.escalas.g[i], a.escalas.o[i], a.escalas.d[i]]) },
      { t: "p", estilo: "nota", texto: "La detección va al revés que las otras dos escalas: 1 = el fallo se detecta casi seguro antes de causar daño; 10 = casi imposible de detectar." });
    B.push({ t: "h1", texto: "Anexo II. Fallos analizados" }, { t: "h2", texto: "Por subproceso" }, { t: "tabla", fuente: 7, cab: ["Nº", "Subproceso", "Modo de fallo", "Efecto", "Causa", "Controles actuales", "G", "O", "D", "IPR"], anchos: [4, 12, 18, 16, 16, 16, 3, 3, 3, 9],
      filas: F.map(f => [C_(f.num), nombreSub(a, f), { texto: f.fallo, negrita: true }, f.efecto, f.causa, f.controles, C_(f.g), C_(f.o), C_(f.d), celdaIpr(iprDe(f))]) });
    const O = ordenarFallos(F.filter(iprDe));
    if (O.length) B.push({ t: "h2", texto: "Ordenados por IPR" }, { t: "tabla", fuente: 7, cab: ["Puesto", "Nº", "Subproceso", "Modo de fallo", "G", "O", "D", "IPR", "Prioritario"], anchos: [7, 4, 20, 39, 4, 4, 4, 8, 10], filas: O.map(f => [C_(P[f.id]), C_(f.num), nombreSub(a, f), f.fallo, C_(f.g), C_(f.o), C_(f.d), celdaIpr(iprDe(f)), C_(m[f.id].prio ? "★" : "")]) });
    const ISH = F.filter(f => f.ishikawa.some(x => lleno(x.texto)));
    if (ISH.length) {
      B.push({ t: "h1", texto: "Anexo III. Diagramas de Ishikawa" });
      ISH.forEach(f => B.push({ t: "h2", texto: `Nº ${f.num}. ${f.fallo}` }, { t: "tabla", fuente: 8, cab: ["Rama", "Causa", "¿Por qué? (de la causa a la causa de fondo)", "Elegida"], anchos: [18, 30, 42, 10],
        filas: Object.keys(RAMAS_ISHIKAWA).flatMap(k => f.ishikawa.filter(x => x.cat === k && lleno(x.texto)).map((x, i) => [i ? "" : { texto: RAMAS_ISHIKAWA[k].nom, negrita: true }, x.texto, x.porques.filter(lleno).join(" → "), { texto: x.elegida ? "✓" : "", centro: true }])) }));
    }
    if (lleno(a.notas)) B.push({ t: "p", estilo: "nota", texto: a.notas });
    return { titulo: "AMFE · " + nom, bloques: B };
  }
  // Resumen para la Dirección: una página con las cifras, los primeros riesgos y sus acciones
  function documentoResumen(a, fecha) {
    const B = [], r = resumen(a), PR = prioritarios(a), mm = resumenMejora(a, ""), nom = a.proceso || a.titulo || "Proceso sin nombre";
    B.push({ t: "portada", titulo: "AMFE · Resumen para la Dirección", sub: nom, extra: [a.unidad, a.fecha || fecha].filter(lleno) });
    B.push({ t: "h1", texto: "En cifras" }, { t: "lista", items: [`${plural(r.n, "fallo potencial analizado", "fallos potenciales analizados")} en ${plural(r.subprocesos, "subproceso", "subprocesos")}, por un equipo de ${plural(r.equipo, "perfil", "perfiles")}.`, `IPR máximo: ${r.maxIPR || "—"}. ${plural(PR.length, "fallo prioritario", "fallos prioritarios")}${PR.some(f => f.critico) ? ` (${PR.filter(f => f.critico).length} críticos)` : ""}.`, `${plural(mm.acciones, "acción de mejora propuesta", "acciones de mejora propuestas")}: ${Object.keys(ESTADOS_ACCION).filter(k => mm.porEstado[k]).map(k => cuentaEstado(k, mm.porEstado[k])).join(", ") || "ninguna todavía"}.`, ...(mm.reevaluados ? [`Reducción esperada del riesgo en los fallos reevaluados: ${mm.reduccion} % (IPR de ${mm.iprInicial} a ${mm.iprResidual}).`] : [])] });
    const top = PR.slice(0, 5);
    if (top.length) B.push({ t: "h1", texto: "Los riesgos más importantes y qué se va a hacer" }, { t: "tabla", fuente: 8, cab: ["Nº", "Riesgo", "IPR", "Acción principal", "Responsable", "Plazo"], anchos: [5, 27, 8, 32, 15, 13],
      filas: top.map(f => { const x = accionesDe(f)[0]; return [C_(f.num), { texto: f.fallo, negrita: true }, celdaIpr(iprDe(f)), x ? x.que : "Pendiente", x ? x.quien : "", x ? [x.plazo, fmtFecha(x.fin)].filter(lleno).join(" · ") : ""]; }) });
    B.push({ t: "h1", texto: "Conclusión" }, { t: "p", texto: lleno(a.conclusiones) ? a.conclusiones : conclusionesSugeridas(a) });
    return { titulo: "AMFE · Resumen · " + nom, bloques: B };
  }

  // Hoja de trabajo para las sesiones presenciales (mejora F): escalas, lluvia de ideas, análisis y votación
  function documentoHoja(a, fecha, vacias = 4) {
    const B = [], nom = a.proceso || a.titulo || "Proceso", SUB = a.subprocesos.filter(s => lleno(s.nombre)), F = a.fallos.filter(f => lleno(f.fallo));
    const L_ = n => Array.from({ length: n }, () => " ");
    B.push({ t: "portada", titulo: "AMFE · Hoja de trabajo", sub: nom, extra: [a.unidad, "Sesión del ____ / ____ / ________", "Asistentes: ____________________________________________"].filter(lleno) });
    B.push({ t: "h1", texto: "Escalas de puntuación" }, { t: "tabla", fuente: 8, cab: ["Puntos", "Gravedad", "Ocurrencia", "Detección (¡al revés!)"], anchos: [10, 30, 30, 30], filas: TRAMOS.map((t, i) => [{ texto: t, centro: true, negrita: true }, a.escalas.g[i], a.escalas.o[i], a.escalas.d[i]]) },
      { t: "p", estilo: "nota", texto: "IPR = Gravedad × Ocurrencia × Detección. Detección: 1 = se detecta casi seguro antes de causar daño; 10 = casi imposible de detectar." });
    B.push({ t: "salto" }, { t: "h1", texto: "1. Lluvia de ideas: ¿qué puede salir mal?" }, { t: "p", texto: "Sin juzgar ni debatir. Una idea por línea. Preguntas guía: " + PREGUNTAS_GUIA.join(" ") });
    (SUB.length ? SUB : [{ nombre: "Subproceso: ______________________" }]).forEach((s, i) => B.push({ t: "h2", texto: SUB.length ? `${i + 1}. ${s.nombre}` : s.nombre }, { t: "tabla", fuente: 9, cab: ["Idea", "Bloque"], anchos: [78, 22], filas: [...a.ideas.filter(x => x.subprocesoId === s.id && lleno(x.texto)).map(x => [x.texto, (a.bloques.find(b => b.id === x.bloqueId) || {}).nombre || ""]), ...L_(vacias + 2).map(() => [" ", " "])] }));
    if (a.bloques.length) {
      B.push({ t: "h2", texto: "Técnica de grupo nominal: reparte 3, 2 y 1 puntos" }, { t: "tabla", fuente: 9, cab: ["Bloque", "Mis puntos (3, 2 o 1)"], anchos: [75, 25], filas: a.bloques.map(b => [b.nombre, " "]) });
    }
    B.push({ t: "salto" }, { t: "h1", texto: "2. Análisis de cada fallo" });
    (SUB.length ? SUB : [{ id: "", nombre: "Subproceso: ______________________" }]).forEach((s, i) => {
      const l = ordenarFallos(F.filter(f => f.subprocesoId === s.id), "num");
      B.push({ t: "h2", texto: SUB.length ? `${i + 1}. ${s.nombre}` : s.nombre }, { t: "tabla", fuente: 8, cab: ["Nº", "Modo de fallo", "Efecto", "Causa", "Controles actuales", "G", "O", "D", "IPR"], anchos: [5, 21, 18, 18, 18, 5, 5, 5, 5],
        filas: [...l.map(f => [{ texto: String(f.num), centro: true }, f.fallo, f.efecto, f.causa, f.controles, { texto: f.g, centro: true }, { texto: f.o, centro: true }, { texto: f.d, centro: true }, { texto: String(iprDe(f) || ""), centro: true }]), ...L_(vacias).map(() => L_(9))] });
    });
    B.push({ t: "salto" }, { t: "h1", texto: "3. Mi votación de G, O y D" }, { t: "p", texto: "Perfil o nombre: ______________________________. Puntúa cada fallo de 1 a 10 sin hablar con los demás; después se comparan los votos y se calcula la media." },
      { t: "tabla", fuente: 8, cab: ["Nº", "Modo de fallo", "G", "O", "D"], anchos: [6, 64, 10, 10, 10], filas: [...ordenarFallos(F, "sub", a.subprocesos).map(f => [{ texto: String(f.num), centro: true }, f.fallo, " ", " ", " "]), ...L_(vacias).map(() => L_(5))] });
    return { titulo: "AMFE · Hoja de trabajo · " + nom, bloques: B };
  }

  // ---------- Excel ----------
  const ESTILOS_XLSX = {
    titulo: { negrita: true, tamano: 14, colorTexto: "FFFFFF", colorFondo: "9A3F06", borde: false },
    sub: { cursiva: true, colorTexto: "444444", borde: false },
    cab: { negrita: true, colorTexto: "FFFFFF", colorFondo: "0D1B2A", alineacion: "center", ajustarTexto: true },
    celda: { ajustarTexto: true, vertical: "top" },
    negrita: { negrita: true, ajustarTexto: true, vertical: "top" },
    centro: { alineacion: "center", vertical: "top", ajustarTexto: true },
    muyalto: { negrita: true, alineacion: "center", vertical: "top", colorFondo: "FFE4E6", colorTexto: "881337" },
    alto: { negrita: true, alineacion: "center", vertical: "top", colorFondo: "FFEDD5", colorTexto: "9A3412" },
    medio: { alineacion: "center", vertical: "top", colorFondo: "FEF3C7", colorTexto: "92400E" },
    bajo: { alineacion: "center", vertical: "top", colorFondo: "DCFCE7", colorTexto: "14532D" },
    prio: { negrita: true, alineacion: "center", vertical: "top", colorTexto: "9A3F06" },
    z_verde: { alineacion: "center", vertical: "center", ajustarTexto: true, negrita: true, colorFondo: "BBF7D0" },
    z_amarillo: { alineacion: "center", vertical: "center", ajustarTexto: true, negrita: true, colorFondo: "FEF08A" },
    z_naranja: { alineacion: "center", vertical: "center", ajustarTexto: true, negrita: true, colorFondo: "FED7AA" },
    z_rojo: { alineacion: "center", vertical: "center", ajustarTexto: true, negrita: true, colorFondo: "FECACA" },
    eje: { negrita: true, alineacion: "center", vertical: "center", colorFondo: "E2E8F0" }
  };
  function hojasExcel(a, fecha) {
    const T = (texto, estilo = "celda") => ({ texto: texto == null ? "" : String(texto), estilo });
    const nom = a.titulo || a.proceso || "AMFE", m = prioridad(a), P = puestos(a.fallos);
    const cabecera = (titulo, cols) => { const f = [[T(titulo, "titulo")], [T([a.unidad, a.proceso !== nom ? a.proceso : "", "Exportado de la app AMFE · " + fecha].filter(lleno).join(" · "), "sub")], cols.map(x => T(x, "cab"))]; f[0][0].combinar = cols.length; return f; };
    const iprCelda = f => { const v = iprDe(f), n = nivelIPR(v); return v ? { numero: v, estilo: n.k } : T("", "centro"); };
    const motivoDe = f => { const e = m[f.id]; if (!e || !e.prio) return f.manual === "no" ? "Quitado a mano: " + f.motivo : ""; return e.por === "critico" ? "Fallo crítico: " + f.motivoCritico : e.por === "manual" ? "Decisión del equipo: " + f.motivo : (a.prioridad.modo === "umbral" ? `IPR ≥ ${umbralPrioridad(a)}` : `Entre los ${nPrioridad(a)} de mayor IPR`); };
    const F = ordenarFallos(a.fallos.filter(f => lleno(f.fallo)), "sub", a.subprocesos);
    // 1. Tabla AMFE completa
    const c1 = ["Nº", "Subproceso", "Modo de fallo", "Efecto", "Causa", "Controles actuales", "G", "O", "D", "IPR", "Puesto", "Nivel", "Zona de la matriz", "Prioritario", "Motivo de prioridad"];
    const h1 = cabecera("AMFE · " + nom, c1);
    F.forEach(f => { const e = m[f.id], v = iprDe(f); h1.push([T(f.num, "centro"), T(nombreSub(a, f)), T(f.fallo, "negrita"), T(f.efecto), T(f.causa), T(f.controles), T(f.g, "centro"), T(f.o, "centro"), T(f.d, "centro"), iprCelda(f), T(P[f.id] || "", "centro"), T(v ? nivelIPR(v).nom : "", "centro"), T(e.zona ? ZONAS[e.zona].nom : "", "centro"), T(e.prio ? "★" + (f.critico ? " crítico" : "") : "", "prio"), T(motivoDe(f))]); });
    // 2. Prioritarios
    const c2 = ["Puesto", "Nº", "Subproceso", "Modo de fallo", "Efecto", "Causa", "G", "O", "D", "IPR", "Motivo de prioridad"];
    const h2 = cabecera("Fallos prioritarios · " + nom, c2);
    prioritarios(a).forEach(f => h2.push([T(P[f.id] || "", "centro"), T(f.num, "centro"), T(nombreSub(a, f)), T(f.fallo, "negrita"), T(f.efecto), T(f.causa), T(f.g, "centro"), T(f.o, "centro"), T(f.d, "centro"), iprCelda(f), T(motivoDe(f))]));
    // 3. Matriz 10 × 10 con los números de los fallos prioritarios
    const h3 = [[T("Matriz de riesgos · fallos prioritarios (nº)", "titulo")], [T("Gravedad (filas, de 10 a 1) × Ocurrencia (columnas, de 1 a 10). Zonas: verde bajo, amarillo moderado, naranja alto, rojo muy alto.", "sub")]];
    h3[0][0].combinar = 11;
    const PR = a.fallos.filter(f => m[f.id] && m[f.id].prio);
    matriz(PR, 10).forEach(fila => h3.push([T("G " + fila[0].g, "eje"), ...fila.map(cl => T(cl.fallos.map(f => f.num).join(", "), "z_" + cl.zona))]));
    h3.push([T("", "eje"), ...Array.from({ length: 10 }, (_, i) => T("O " + (i + 1), "eje"))]);
    // 4. Subprocesos
    const c4 = ["Nº", "Subproceso", "Qué se hace", "Inicio", "Fin", "Roles", "Fallos", "Prioritarios", "IPR máximo", "IPR medio"];
    const h4 = cabecera("Subprocesos · " + nom, c4), PS = porSubproceso(a);
    a.subprocesos.forEach((s, i) => { const r = PS[i]; h4.push([T(i + 1, "centro"), T(s.nombre, "negrita"), T(s.descripcion), T(s.inicio), T(s.fin), T(s.roles), { numero: r.n, estilo: "centro" }, { numero: r.prio, estilo: "centro" }, r.max ? { numero: r.max, estilo: nivelIPR(r.max).k } : T("", "centro"), r.media ? { numero: r.media, estilo: "centro" } : T("", "centro")]); });
    // 5. Equipo y sesiones
    const h5 = cabecera("Equipo y sesiones · " + nom, ["Nº", "Perfil", "Cargo", "Papel", "Justificación", "Nombre"]);
    a.equipo.forEach((x, i) => h5.push([T(i + 1, "centro"), T(x.perfil, "negrita"), T(x.cargo), T(ROLES[x.rol].nom), T(x.justificacion), T(x.nombre)]));
    if (a.sesiones.length) { h5.push([]); h5.push(["Sesión", "Fecha", "Actividad", "Duración", "Asistentes", "Resultados"].map(x => T(x, "cab"))); a.sesiones.forEach((x, i) => h5.push([T(i + 1, "centro"), T(/^\d{4}-\d{2}-\d{2}$/.test(x.fecha) ? x.fecha.split("-").reverse().join("/") : x.fecha, "centro"), T(x.actividad), T(x.duracion, "centro"), T(x.asistentes.length, "centro"), T(x.resultados)])); }
    // 6. Acciones de mejora
    const c7 = ["Nº fallo", "Modo de fallo", "IPR", "Acción", "Qué", "Por qué", "Dónde", "Plazo", "Fecha fin", "Responsable", "Cómo", "Tipo", "Clase", "Fuerza", "Actúa sobre", "Indicador", "Fórmula", "Estándar", "Fuente", "Estado", "Nota"];
    const h7 = cabecera("Acciones de mejora · " + nom, c7);
    conAcciones(a).forEach(f => accionesDe(f).forEach((x, i) => h7.push([T(f.num, "centro"), T(f.fallo, "negrita"), iprCelda(f), T(i + 1, "centro"), T(x.que, "negrita"), T(x.porque), T(x.donde), T(x.plazo), T(fmtFecha(x.fin), "centro"), T(x.quien), T(x.como), T(TIPOS_ACCION[x.tipo] ? TIPOS_ACCION[x.tipo].nom : ""), T(CLASES_ACCION[x.clase] ? CLASES_ACCION[x.clase].nom : ""), T(FUERZAS[fuerzaMedida(x.que)] ? FUERZAS[fuerzaMedida(x.que)].nom : ""), T(x.actuaSobre.map(k => ACTUA[k]).join(", ")), T(x.indicador.nombre), T(x.indicador.formula), T(x.indicador.estandar, "centro"), T(x.indicador.fuente), T(ESTADOS_ACCION[x.estado], "centro"), T(x.nota)])));
    // 7. Reevaluación
    const h8 = cabecera("Reevaluación (IPR residual) · " + nom, ["Nº", "Modo de fallo", "G", "O", "D", "IPR inicial", "G tras", "O tras", "D tras", "IPR residual", "Reducción %", "Nota"]);
    conAcciones(a).filter(iprResidual).forEach(f => { const v0 = iprDe(f), v1 = iprResidual(f); h8.push([T(f.num, "centro"), T(f.fallo, "negrita"), T(f.g, "centro"), T(f.o, "centro"), T(f.d, "centro"), iprCelda(f), T(f.residual.g, "centro"), T(f.residual.o, "centro"), T(f.residual.d, "centro"), { numero: v1, estilo: nivelIPR(v1).k }, { numero: Math.round((1 - v1 / v0) * 100), estilo: "centro" }, T(f.residual.nota)]); });
    // 8. Escalas
    const h6 = cabecera("Escalas de puntuación", ["Puntos", "Gravedad", "Ocurrencia", "Detección"]);
    TRAMOS.forEach((t, i) => h6.push([T(t, "centro"), T(a.escalas.g[i]), T(a.escalas.o[i]), T(a.escalas.d[i])]));
    h6.push([]); h6.push([T("IPR = Gravedad × Ocurrencia × Detección (de 1 a 1.000). La detección va al revés: 10 = casi imposible de detectar.", "sub")]);
    return { estilos: ESTILOS_XLSX, hojas: [
      { nombre: "AMFE", filas: h1, opciones: { anchoColumnas: [6, 22, 34, 30, 30, 30, 5, 5, 5, 7, 8, 10, 12, 11, 34], congelar: { filas: 3, columnas: 0 }, altoFilas: { 1: 24 }, primera: true } },
      { nombre: "Prioritarios", filas: h2, opciones: { anchoColumnas: [8, 6, 22, 34, 30, 30, 5, 5, 5, 7, 36], congelar: { filas: 3, columnas: 0 }, altoFilas: { 1: 24 } } },
      { nombre: "Matriz", filas: h3, opciones: { anchoColumnas: [7, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11], altoFilas: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i + 3, 30])) } },
      { nombre: "Subprocesos", filas: h4, opciones: { anchoColumnas: [5, 28, 34, 26, 26, 30, 8, 11, 10, 10], congelar: { filas: 3, columnas: 0 } } },
      { nombre: "Equipo y sesiones", filas: h5, opciones: { anchoColumnas: [7, 32, 30, 22, 50, 22] } },
      { nombre: "Acciones", filas: h7, opciones: { anchoColumnas: [8, 30, 7, 7, 34, 30, 18, 12, 11, 20, 34, 18, 18, 16, 22, 32, 28, 10, 18, 11, 24], congelar: { filas: 3, columnas: 0 } } },
      { nombre: "Reevaluación", filas: h8, opciones: { anchoColumnas: [6, 36, 5, 5, 5, 10, 7, 7, 7, 11, 11, 34], congelar: { filas: 3, columnas: 0 } } },
      { nombre: "Escalas", filas: h6, opciones: { anchoColumnas: [9, 45, 45, 45] } }
    ] };
  }

  // ---------- Saneado por esquema (lo que se carga o se importa nunca se usa sin pasar por aquí) ----------
  // [max] = texto; "b" = sí/no; "id" = id propio; "ref" = id de otro objeto; "ent" = entero ≥ 0; {en} = enumerado;
  // {lista: max, max} = lista de textos; {lista, keepEmpty: n} = lista de longitud fija; {de: esquema, max} = lista de objetos; {obj: esquema} = objeto anidado
  const idValido = v => typeof v === "string" && /^[a-z0-9-]{1,40}$/i.test(v);
  const txt = (v, max) => (typeof v === "string" || typeof v === "number") ? String(v).slice(0, max) : "";
  const ESQ = {
    escalas: { g: { lista: 300, keepEmpty: 5 }, o: { lista: 300, keepEmpty: 5 }, d: { lista: 300, keepEmpty: 5 } },
    subproceso: { id: "id", nombre: [200], descripcion: [1000], inicio: [300], fin: [300], roles: [500], color: { en: Array.from({ length: COLORES_SUB }, (_, i) => String(i)) } },
    miembro: { id: "id", perfil: [200], cargo: [200], rol: { en: Object.keys(ROLES) }, justificacion: [1000], nombre: [200] },
    sesion: { id: "id", fecha: [20], actividad: [500], duracion: [40], asistentes: { lista: "ref", max: 40 }, resultados: [1500] },
    fallo: { id: "id", num: "ent", subprocesoId: "ref", fallo: [1000], efecto: [1000], causa: [1000], controles: [1000], g: [3], o: [3], d: [3], critico: "b", motivoCritico: [1000], manual: { en: ["", "si", "no"] }, motivo: [1000], acciones: { de: "accion", max: 20 }, residual: { obj: "residual" }, votos: { de: "votoGOD", max: 40 }, ishikawa: { de: "causaIsh", max: 80 } },
    causaIsh: { id: "id", cat: { en: Object.keys(RAMAS_ISHIKAWA) }, texto: [500], porques: { lista: 500, keepEmpty: 3 }, elegida: "b" },
    votoGOD: { miembroId: "ref", g: [3], o: [3], d: [3] },
    idea: { id: "id", subprocesoId: "ref", texto: [500], bloqueId: "ref", falloId: "ref" },
    bloque: { id: "id", nombre: [200], comentario: [1000] },
    votoTgn: { miembroId: "ref", bloqueId: "ref", puntos: [3] },
    tgn: { modo: { en: Object.keys(MODOS_TGN) }, votos: { de: "votoTgn", max: 2000 } },
    prioridad: { modo: { en: ["top", "umbral"] }, n: [4], umbral: [5] },
    indicador: { nombre: [500], formula: [1000], estandar: [60], fuente: [500] },
    comprobacion: Object.fromEntries(Object.keys(COMPROBACION).map(k => [k, "b"])),
    accion: { id: "id", que: [1500], porque: [1000], donde: [300], plazo: [100], fin: [20], quien: [300], como: [1500], tipo: { en: Object.keys(TIPOS_ACCION) }, clase: { en: ["", ...Object.keys(CLASES_ACCION)] }, actuaSobre: { lista: 2, max: 3, en: Object.keys(ACTUA) }, indicador: { obj: "indicador" }, comprobacion: { obj: "comprobacion" }, estado: { en: Object.keys(ESTADOS_ACCION) }, nota: [1000] },
    residual: { g: [3], o: [3], d: [3], fecha: [40], nota: [1000] },
    persona: { nombre: [200], cargo: [200] },
    revision: { edicion: [10], fecha: [20], cambio: [500] },
    control: { elaborado: { de: "persona", max: 10 }, revisado: { de: "persona", max: 10 }, aprobado: { de: "persona", max: 10 }, historial: { de: "revision", max: 50 } },
    amfe: { id: "id", titulo: [200], proceso: [300], unidad: [200], objetivo: [2000], inicio: [300], fin: [300], incluye: [2000], excluye: [2000], responsable: [300], fecha: [40],
      subprocesos: { de: "subproceso", max: 40 }, equipo: { de: "miembro", max: 40 }, sesiones: { de: "sesion", max: 40 }, fallos: { de: "fallo", max: 500 }, escalas: { obj: "escalas" }, prioridad: { obj: "prioridad" }, introduccion: [4000], conclusiones: [5000], control: { obj: "control" }, proxRevision: [20], edicion: [4], anteriorId: "ref", ideas: { de: "idea", max: 500 }, bloques: { de: "bloque", max: 60 }, tgn: { obj: "tgn" }, notas: [3000], creado: [40], modificado: [40] }
  };
  const FABRICA = { causaIsh: id => nuevaCausaIsh(id), votoGOD: () => ({ miembroId: "", g: "", o: "", d: "" }), idea: id => nuevaIdea(id), bloque: id => nuevoBloque(id), votoTgn: () => ({ miembroId: "", bloqueId: "", puntos: "" }), tgn: nuevaTgn, escalas: nuevasEscalas, prioridad: nuevaPrioridad, indicador: nuevoIndicador, comprobacion: nuevaComprobacion, accion: nuevaAccion, residual: nuevoResidual, persona: nuevaPersona, revision: () => ({ edicion: "", fecha: "", cambio: "" }), control: () => ({ elaborado: [], revisado: [], aprobado: [], historial: [] }), subproceso: id => nuevoSubproceso(id), miembro: nuevoMiembro, sesion: nuevaSesion, fallo: id => nuevoFallo(id), amfe: id => nuevoAmfe(id, "") };
  function sanear(esq, o, genId) {
    if (!o || typeof o !== "object" || Array.isArray(o)) return null;
    const S = ESQ[esq], r = FABRICA[esq](genId());
    Object.keys(S).forEach(k => {
      const regla = S[k], v = o[k];
      if (regla === "id") r[k] = idValido(v) ? v : r[k];
      else if (regla === "ref") r[k] = idValido(v) ? v : "";
      else if (regla === "b") r[k] = v === true;
      else if (regla === "ent") { const n = num(v); r[k] = Number.isInteger(n) && n >= 0 && n < 1e6 ? n : 0; }
      else if (Array.isArray(regla)) { if (v !== undefined) r[k] = txt(v, regla[0]); }
      else if (regla.en && !regla.lista) r[k] = regla.en.includes(v) ? v : r[k];
      else if (regla.keepEmpty) r[k] = Array.from({ length: regla.keepEmpty }, (_, j) => Array.isArray(v) && typeof v[j] === "string" ? txt(v[j], regla.lista) : r[k][j]);
      else if (regla.lista) r[k] = Array.isArray(v) ? [...new Set(v.slice(0, regla.max * 2).map(x => regla.lista === "ref" ? (idValido(x) ? x : "") : txt(x, regla.lista)).filter(x => x && (!regla.en || regla.en.includes(x))))].slice(0, regla.max) : [];
      else if (regla.de) r[k] = Array.isArray(v) ? v.slice(0, regla.max).map(x => sanear(regla.de, x, genId)).filter(Boolean) : [];
      else if (regla.obj) r[k] = sanear(regla.obj, v, genId) || r[k];
    });
    return r;
  }
  function sanearAmfe(o, genId, fecha) {
    const a = sanear("amfe", o, genId); if (!a) return null;
    if (!a.creado) a.creado = fecha; if (!a.modificado) a.modificado = a.creado;
    // Referencias rotas fuera; números de fallo únicos (los repetidos o a 0 se renumeran al final)
    const subs = new Set(a.subprocesos.map(s => s.id)), miembros = new Set(a.equipo.map(m => m.id));
    a.fallos.forEach(f => { if (!subs.has(f.subprocesoId)) f.subprocesoId = ""; });
    a.sesiones.forEach(s => { s.asistentes = s.asistentes.filter(id => miembros.has(id)); });
    // Ideas, bloques y votos: fuera las referencias a lo que ya no existe
    const bloques = new Set(a.bloques.map(b => b.id)), fallos = new Set(a.fallos.map(f => f.id));
    a.ideas.forEach(i => { if (!subs.has(i.subprocesoId)) i.subprocesoId = ""; if (!bloques.has(i.bloqueId)) i.bloqueId = ""; if (!fallos.has(i.falloId)) i.falloId = ""; });
    a.tgn.votos = a.tgn.votos.filter(v => miembros.has(v.miembroId) && bloques.has(v.bloqueId));
    a.fallos.forEach(f => { f.votos = f.votos.filter(v => miembros.has(v.miembroId)); });
    if (!lleno(a.edicion)) a.edicion = "00";
    const usados = new Set();
    a.fallos.forEach(f => { if (!f.num || usados.has(f.num)) f.num = 0; else usados.add(f.num); });
    a.fallos.filter(f => !f.num).forEach(f => { f.num = siguienteNum(a); });
    return a;
  }
  function sanearDatos(o, genId, fecha) {
    if (!o || typeof o !== "object" || !Array.isArray(o.amfes)) return null;
    return { amfes: o.amfes.slice(0, 300).map(x => sanearAmfe(x, genId, fecha)).filter(Boolean) };
  }
  // Fusiona sin duplicar: si un id ya existe se conserva el más reciente
  function fusionar(actual, nuevo) {
    const m = new Map(actual.amfes.map(x => [x.id, x]));
    nuevo.amfes.forEach(x => { const y = m.get(x.id); if (!y || String(x.modificado) > String(y.modificado)) m.set(x.id, x); });
    return { amfes: Array.from(m.values()) };
  }

  const API = {
    VERSION_DATOS, URL_AUD, URL_IND, URL_TM, URL_FLUJO, URL_DAFO,
    lleno, sinTildes, num, entero1a10, corto, normal, plural,
    TRAMOS, ESCALAS_CURSO, ESCALA_NOM, ESCALA_PREG, tramo,
    ipr, iprDe, NIVELES_IPR, nivelIPR, ZONAS, zonaMatriz, ordenarFallos, puestos,
    PASOS, ROLES, ESTAMENTOS, ESTAMENTO_NOM, estamentoDe, PERFILES_SUG, SESIONES_TIPO, COLORES_SUB,
    nuevoAmfe, nuevasEscalas, nuevoSubproceso, nuevoMiembro, nuevaSesion, nuevoFallo, siguienteNum, colorLibre, subDe, nombreSub,
    sugerirObjetivo, tipoRedaccion, nuevaPrioridad,
    avisosProceso, avisosEquipo, avisosFallos, avisosPuntuar, avisosPriorizar, avisos,
    nPrioridad, umbralPrioridad, prioridad, prioritarios, POR_TXT, sugerirMotivo, matriz, porSubproceso,
    FORMATO_INTERCAMBIO, VERSION_INTERCAMBIO, paqueteIntercambio, leerIntercambio, ESTILOS_XLSX, hojasExcel,
    fmtFecha, TIPOS_ACCION, CLASES_ACCION, ACTUA, COMPROBACION, ESTADOS_ACCION, cuentaEstado, FUERZAS, fuerzaMedida,
    nuevaAccion, nuevoIndicador, nuevoResidual, nuevaPersona, nuevoControl, iprResidual, vencida, accionCompleta, accionesDe, conAcciones, sugerirPorque, indicadoresDe,
    PREGUNTAS_GUIA, MODOS_TGN, nuevaIdea, nuevoBloque, duplicados, parecidas, ranking, voto321, ponerVoto321, voto1a10, ponerVoto1a10, ideaAFallo, avisosIdeas,
    RAMAS_ISHIKAWA, nuevaCausaIsh, causaRaiz, causasElegidas, textoCausaIshikawa,
    mediaVotos, discrepancia, ponerVotoGOD, nuevaEdicion, compararEdiciones, revisionProxima, documentoHoja,
    avisosMejorar, avisosCerrar, resumenMejora, conclusionesSugeridas, introduccionSugerida, documentoInforme, documentoResumen,
    resumen, progreso, pasoPendiente, siguientePaso,
    parsearTabla, incorporarFilas,
    ESQ, sanear, sanearAmfe, sanearDatos, fusionar
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.Logica = API;
})(typeof window !== "undefined" ? window : this);
