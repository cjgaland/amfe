// ============================================================
//  logic.js — Lógica PURA (sin DOM) · AMFE
//  Modelo del AMFE (proceso, subprocesos, equipo, sesiones, fallos), escalas
//  G·O·D, IPR y orden, priorización (N primeros o umbral, gravedad 9–10, fallo
//  crítico, decisión manual), matriz de riesgos, avisos didácticos por paso,
//  textos propuestos, progreso, pegar desde Excel, paquete de intercambio
//  «amfe-fallos» para otras apps, hojas de Excel, saneado por esquema y fusión.
//  window.Logica en navegador y module.exports en Node (tests).
// ============================================================
(function (raiz) {
  "use strict";

  const VERSION_DATOS = 1;
  const URL_AUD = "https://cjgaland.github.io/auditorias/";
  const URL_IND = "https://cjgaland.github.io/indicadores-calidad/";
  const URL_TM = "https://cjgaland.github.io/tamano-muestral/";

  // ---------- Utilidades ----------
  const lleno = v => v != null && String(v).trim() !== "";
  const sinTildes = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const num = v => { if (typeof v === "number") return v; const s = String(v == null ? "" : v).trim().replace(/\s/g, "").replace(",", "."); return s === "" || isNaN(s) ? NaN : Number(s); };
  const entero1a10 = v => { const n = num(v); return Number.isInteger(n) && n >= 1 && n <= 10 ? n : null; };
  const corto = (s, n = 60) => { s = String(s || "").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s || "sin nombre"; };
  const normal = s => sinTildes(s).replace(/[^a-z0-9ñ ]/g, " ").replace(/\s+/g, " ").trim();
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

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
      subprocesos: [], equipo: [], sesiones: [], fallos: [], escalas: nuevasEscalas(), prioridad: nuevaPrioridad(), notas: "", creado: fecha, modificado: fecha };
  }
  // Criterio de prioridad: los N de mayor IPR (15, como el curso) o los que superan un umbral de IPR
  const nuevaPrioridad = () => ({ modo: "top", n: "15", umbral: "200" });
  const nuevasEscalas = () => ({ g: ESCALAS_CURSO.g.slice(), o: ESCALAS_CURSO.o.slice(), d: ESCALAS_CURSO.d.slice() });
  function nuevoSubproceso(id, color = 0) { return { id, nombre: "", descripcion: "", inicio: "", fin: "", roles: "", color: String(color % COLORES_SUB) }; }
  function nuevoMiembro(id) { return { id, perfil: "", cargo: "", rol: "miembro", justificacion: "", nombre: "" }; }
  function nuevaSesion(id) { return { id, fecha: "", actividad: "", duracion: "", asistentes: [], resultados: "" }; }
  // manual: "" = lo decide el criterio; "si" / "no" = el equipo lo marca o lo desmarca a mano (con motivo)
  function nuevoFallo(id, n = 0) { return { id, num: n, subprocesoId: "", fallo: "", efecto: "", causa: "", controles: "", g: "", o: "", d: "", critico: false, motivoCritico: "", manual: "", motivo: "" }; }
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

  function avisos(a) { return [...avisosProceso(a), ...avisosEquipo(a), ...avisosFallos(a), ...avisosPuntuar(a), ...avisosPriorizar(a)]; }

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
      3: false,
      4: F.length >= 1 && F.every(f => subDe(a, f)),
      5: F.length >= 1 && F.every(f => iprDe(f)),
      6: F.length >= 1 && F.every(f => iprDe(f)) && prioritarios(a).length >= 1 && !avisosPriorizar(a).some(x => x.nivel === "warn" && x.fallo && /motivo/.test(x.texto)),
      7: false, 8: false
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
    6: a => prioritarios(a).length ? "Revisa los fallos prioritarios: escribe el motivo de los que habéis marcado o desmarcado a mano y de los críticos." : "Elige los fallos prioritarios: los de mayor IPR, los muy graves y los críticos. Mira la matriz de riesgos."
  };
  function siguientePaso(datos, entrega) {
    const L = datos.amfes;
    if (!L.length) return { k: "crear", texto: "Empieza tu primer AMFE: elige un proceso de tu unidad donde un fallo pueda dañar al paciente.", href: "#/amfe/nuevo", btn: "Crear un AMFE" };
    const a = L.slice().sort((x, y) => String(y.modificado).localeCompare(String(x.modificado)))[0];
    const p = pasoPendiente(a, entrega), nom = corto(a.titulo || a.proceso || "tu AMFE", 50);
    if (p) return { k: "paso" + p.n, texto: `«${nom}»: ${TEXTO_PASO[p.n](a)}`, href: `#/amfe/${a.id}/${p.n}`, btn: `Ir al paso ${p.n}` };
    return { k: "listo", texto: `«${nom}» tiene ${plural(prioritarios(a).length, "fallo prioritario", "fallos prioritarios")}. Las acciones de mejora llegan en la próxima versión; mientras, puedes sacar el Excel con la tabla, los prioritarios y la matriz.`, href: `#/amfe/${a.id}/6`, btn: "Ver la priorización" };
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
              critico: f.critico, grave: e.grave, zona: e.zona, acciones: [], residual: null };
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
    // 6. Escalas
    const h6 = cabecera("Escalas de puntuación", ["Puntos", "Gravedad", "Ocurrencia", "Detección"]);
    TRAMOS.forEach((t, i) => h6.push([T(t, "centro"), T(a.escalas.g[i]), T(a.escalas.o[i]), T(a.escalas.d[i])]));
    h6.push([]); h6.push([T("IPR = Gravedad × Ocurrencia × Detección (de 1 a 1.000). La detección va al revés: 10 = casi imposible de detectar.", "sub")]);
    return { estilos: ESTILOS_XLSX, hojas: [
      { nombre: "AMFE", filas: h1, opciones: { anchoColumnas: [6, 22, 34, 30, 30, 30, 5, 5, 5, 7, 8, 10, 12, 11, 34], congelar: { filas: 3, columnas: 0 }, altoFilas: { 1: 24 }, primera: true } },
      { nombre: "Prioritarios", filas: h2, opciones: { anchoColumnas: [8, 6, 22, 34, 30, 30, 5, 5, 5, 7, 36], congelar: { filas: 3, columnas: 0 }, altoFilas: { 1: 24 } } },
      { nombre: "Matriz", filas: h3, opciones: { anchoColumnas: [7, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11], altoFilas: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i + 3, 30])) } },
      { nombre: "Subprocesos", filas: h4, opciones: { anchoColumnas: [5, 28, 34, 26, 26, 30, 8, 11, 10, 10], congelar: { filas: 3, columnas: 0 } } },
      { nombre: "Equipo y sesiones", filas: h5, opciones: { anchoColumnas: [7, 32, 30, 22, 50, 22] } },
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
    fallo: { id: "id", num: "ent", subprocesoId: "ref", fallo: [1000], efecto: [1000], causa: [1000], controles: [1000], g: [3], o: [3], d: [3], critico: "b", motivoCritico: [1000], manual: { en: ["", "si", "no"] }, motivo: [1000] },
    prioridad: { modo: { en: ["top", "umbral"] }, n: [4], umbral: [5] },
    amfe: { id: "id", titulo: [200], proceso: [300], unidad: [200], objetivo: [2000], inicio: [300], fin: [300], incluye: [2000], excluye: [2000], responsable: [300], fecha: [40],
      subprocesos: { de: "subproceso", max: 40 }, equipo: { de: "miembro", max: 40 }, sesiones: { de: "sesion", max: 40 }, fallos: { de: "fallo", max: 500 }, escalas: { obj: "escalas" }, prioridad: { obj: "prioridad" }, notas: [3000], creado: [40], modificado: [40] }
  };
  const FABRICA = { escalas: nuevasEscalas, prioridad: nuevaPrioridad, subproceso: id => nuevoSubproceso(id), miembro: nuevoMiembro, sesion: nuevaSesion, fallo: id => nuevoFallo(id), amfe: id => nuevoAmfe(id, "") };
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
    VERSION_DATOS, URL_AUD, URL_IND, URL_TM,
    lleno, sinTildes, num, entero1a10, corto, normal, plural,
    TRAMOS, ESCALAS_CURSO, ESCALA_NOM, ESCALA_PREG, tramo,
    ipr, iprDe, NIVELES_IPR, nivelIPR, ZONAS, zonaMatriz, ordenarFallos, puestos,
    PASOS, ROLES, ESTAMENTOS, ESTAMENTO_NOM, estamentoDe, PERFILES_SUG, SESIONES_TIPO, COLORES_SUB,
    nuevoAmfe, nuevasEscalas, nuevoSubproceso, nuevoMiembro, nuevaSesion, nuevoFallo, siguienteNum, colorLibre, subDe, nombreSub,
    sugerirObjetivo, tipoRedaccion, nuevaPrioridad,
    avisosProceso, avisosEquipo, avisosFallos, avisosPuntuar, avisosPriorizar, avisos,
    nPrioridad, umbralPrioridad, prioridad, prioritarios, POR_TXT, sugerirMotivo, matriz, porSubproceso,
    FORMATO_INTERCAMBIO, VERSION_INTERCAMBIO, paqueteIntercambio, leerIntercambio, ESTILOS_XLSX, hojasExcel,
    resumen, progreso, pasoPendiente, siguientePaso,
    parsearTabla, incorporarFilas,
    ESQ, sanear, sanearAmfe, sanearDatos, fusionar
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.Logica = API;
})(typeof window !== "undefined" ? window : this);
