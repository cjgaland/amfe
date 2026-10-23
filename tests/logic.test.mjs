// Pruebas de la lógica pura y de los ejemplos · node tests/logic.test.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const L = require("../logic.js");
const C = require("../contenido.js");
const X = require("../xlsx.js");
const D = require("../docx.js");

let ok = 0, fallos = 0;
const t = (nombre, cond) => { if (cond) ok++; else { fallos++; console.error("✗ " + nombre); } };
const eq = (nombre, a, b) => t(`${nombre} (esperado ${JSON.stringify(b).slice(0, 300)}, obtenido ${JSON.stringify(a).slice(0, 300)})`, JSON.stringify(a) === JSON.stringify(b));
let n = 0; const gid = () => "id" + (++n);

// IPR y escalas
eq("IPR 7×7×7", L.ipr(7, 7, 7), 343);
eq("IPR con textos", L.ipr("8", "7", "6"), 336);
eq("IPR fuera de rango", L.ipr(11, 7, 7), null);
eq("IPR decimal", L.ipr("7,5", 7, 7), null);
eq("IPR vacío", L.ipr("", 7, 7), null);
eq("Ejemplo del tema 5: 9×7×8", L.ipr(9, 7, 8), 504);
eq("Tramos", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(L.tramo), [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
eq("Nivel 343", L.nivelIPR(343).k, "muyalto");
eq("Nivel 216", L.nivelIPR(216).k, "alto");
eq("Escalas del curso: 5 tramos", ["g", "o", "d"].map(k => L.ESCALAS_CURSO[k].length), [5, 5, 5]);

// Zonas de la matriz (las del Documento Final: suma de tramos)
eq("Zona G9-10 × O9-10", L.zonaMatriz(10, 9), "rojo");
eq("Zona G9-10 × O1-2", L.zonaMatriz(9, 1), "amarillo");
eq("Zona G7 × O7", L.zonaMatriz(7, 7), "naranja");
eq("Zona G6 × O6", L.zonaMatriz(6, 6), "amarillo");
eq("Zona G5 × O4", L.zonaMatriz(5, 4), "verde");
eq("Zona G1 × O9", L.zonaMatriz(1, 9), "amarillo");
eq("Zona sin datos", L.zonaMatriz("", 5), null);

// Modelo y orden
const a = L.nuevoAmfe("a1", "2026-10-21");
const s1 = Object.assign(L.nuevoSubproceso(gid(), 0), { nombre: "Recepción" }), s2 = Object.assign(L.nuevoSubproceso(gid(), 1), { nombre: "Triaje" });
a.subprocesos = [s1, s2];
const F = (num, sub, fallo, g, o, d) => Object.assign(L.nuevoFallo(gid(), num), { subprocesoId: sub.id, fallo, g: String(g), o: String(o), d: String(d) });
a.fallos = [F(1, s2, "Pulsera", 6, 6, 5), F(2, s2, "Constantes", 7, 7, 7), F(3, s1, "Datos clínicos", 7, 6, 5), F(4, s1, "Sin puntuar", "", "", ""), F(5, s2, "Empate IPR", 6, 7, 5)];
eq("Orden por IPR (a igual IPR, más gravedad)", L.ordenarFallos(a.fallos).map(f => f.num), [2, 3, 5, 1, 4]);
eq("Orden por subproceso", L.ordenarFallos(a.fallos, "sub", a.subprocesos).map(f => f.num), [3, 4, 1, 2, 5]);
const P = L.puestos(a.fallos);
eq("Puestos con empate", [P[a.fallos[2].id], P[a.fallos[4].id]], [2, 2]);
eq("Puesto sin IPR", P[a.fallos[3].id], null);
eq("Siguiente número", L.siguienteNum(a), 6);
eq("Color libre", L.colorLibre(a), 2);

// Redacción: ¿fallo, efecto o causa?
eq("Causa como fallo", L.tipoRedaccion("Sobrecarga asistencial en el turno de noche"), "causa");
eq("Causa: falta de formación", L.tipoRedaccion("Falta de formación del personal"), "causa");
eq("Efecto como fallo", L.tipoRedaccion("Daño al paciente por error de medicación"), "efecto");
eq("Efecto: riesgo de", L.tipoRedaccion("Riesgo de caídas"), "efecto");
eq("Modo de fallo «Falta de protocolo…» no se marca", L.tipoRedaccion("Falta de protocolo ante paciente frágil"), null);
eq("Modo de fallo normal", L.tipoRedaccion("No colocación de pulsera identificativa"), null);

// Avisos
const vacio = L.nuevoAmfe("v", "");
t("Aviso: sin proceso", L.avisosProceso(vacio).some(x => /nombre del proceso/.test(x.texto)));
t("Aviso: sin subprocesos", L.avisosProceso(vacio).some(x => /subprocesos/.test(x.texto)));
t("Aviso: sin equipo", L.avisosEquipo(vacio).some(x => /perfiles del equipo/.test(x.texto)));
const eqA = L.nuevoAmfe("e", "");
eqA.equipo = ["Enfermera de triaje", "Enfermero supervisor", "Enfermera de observación"].map(p => Object.assign(L.nuevoMiembro(gid()), { perfil: p }));
const avE = L.avisosEquipo(eqA).map(x => x.texto).join(" | ");
t("Aviso: equipo pequeño", /al menos 6/.test(avE));
t("Aviso: sin coordinación", /coordinación/.test(avE));
t("Aviso: un solo estamento", /mismo estamento \(Enfermería\)/.test(avE));
eqA.subprocesos = [Object.assign(L.nuevoSubproceso(gid()), { nombre: "Traslado", roles: "Celador, enfermería" })];
t("Aviso: rol de subproceso sin nadie en el equipo", L.avisosEquipo(eqA).some(x => /Celadores/.test(x.texto)));
t("Estamento TCAE no se confunde con enfermería", L.estamentoDe("Técnico/a en Cuidados Auxiliares de Enfermería (TCAE)") === "tcae");

const b = L.nuevoAmfe("b", "");
b.subprocesos = [s1];
b.fallos = [Object.assign(L.nuevoFallo(gid(), 1), { subprocesoId: s1.id, fallo: "Sobrecarga asistencial" }), Object.assign(L.nuevoFallo(gid(), 2), { fallo: "No se verifica la identidad", causa: "No se verifica la identidad" }), Object.assign(L.nuevoFallo(gid(), 3), { subprocesoId: s1.id, fallo: "Sobrecarga asistencial" })];
const avF = L.avisosFallos(b);
t("Aviso: fallo escrito como causa (con id del fallo)", avF.some(x => x.fallo === b.fallos[0].id && /parece una causa/.test(x.texto)));
t("Aviso: fallo sin subproceso", avF.some(x => /no está/.test(x.texto)));
t("Aviso: causa repite el fallo", avF.some(x => /repite el fallo/.test(x.texto)));
t("Aviso: fallo repetido", avF.some(x => /Fallo repetido/.test(x.texto)));
t("Aviso: sin efecto", avF.some(x => /no tienen efecto/.test(x.texto)));

const c = L.nuevoAmfe("c", "");
c.fallos = [Object.assign(L.nuevoFallo(gid(), 1), { fallo: "A", g: "9", o: "2", d: "1" }), Object.assign(L.nuevoFallo(gid(), 2), { fallo: "B", g: "5", o: "x", d: "3" }), Object.assign(L.nuevoFallo(gid(), 3), { fallo: "C", g: "4", o: "4", d: "10", controles: "Doble chequeo" }), Object.assign(L.nuevoFallo(gid(), 4), { fallo: "D" })];
const avP = L.avisosPuntuar(c);
t("Aviso: valores no válidos", avP.some(x => x.nivel === "error" && /nº 2/.test(x.texto)));
t("Aviso: sin puntuar", avP.some(x => /sin puntuar/.test(x.texto)));
t("Aviso: D baja sin controles (detección al revés)", avP.some(x => x.fallo === c.fallos[0].id && /va al revés/.test(x.texto)));
t("Aviso: gravedad 9", avP.some(x => x.fallo === c.fallos[0].id && /gravedad 9/.test(x.texto)));
t("Aviso: D 10 con controles", avP.some(x => x.fallo === c.fallos[2].id && /casi imposible/.test(x.texto)));
const centro = L.nuevoAmfe("x", "");
centro.fallos = Array.from({ length: 6 }, (_, i) => Object.assign(L.nuevoFallo(gid(), i + 1), { fallo: "F" + i, g: "5", o: "6", d: String(5 + (i % 2)) }));
t("Aviso: todo en el centro de la escala", L.avisosPuntuar(centro).some(x => /centro de la escala/.test(x.texto)));

// Texto propuesto
eq("Objetivo propuesto", L.sugerirObjetivo(Object.assign(L.nuevoAmfe("o", ""), { proceso: "Transfusión", inicio: "La prescripción", fin: "El final de la transfusión" })),
  "Garantizar que el proceso «Transfusión» se realiza de forma segura, eficaz y continua, desde la prescripción hasta el final de la transfusión, identificando y previniendo los fallos que pueden causar daño al paciente.");

// Pegar desde Excel
const pegado = "Subproceso\tId\tModo de fallo\tEfecto\tCausa\tG\tO\tD\tIPR\nTriaje\t1\tNo pulsera\tError de identidad\tPrisa\t6\t6\t5\t180\nNueva fase\t2\tOtro\t\t\t11\t2\t2\t44";
const pp = L.parsearTabla(pegado);
eq("Pegar: filas", pp.filas.length, 2);
t("Pegar: cabecera reconocida", pp.cabecera);
eq("Pegar: columnas", [pp.filas[0].subproceso, pp.filas[0].fallo, pp.filas[0].causa, pp.filas[0].g], ["Triaje", "No pulsera", "Prisa", "6"]);
t("Pegar: error de rango", pp.errores.some(e => /Fila 3/.test(e)));
const sinCab = L.parsearTabla("Triaje;No pulsera;Error;Prisa;6;6;5");
eq("Pegar sin cabecera (orden por defecto)", [sinCab.filas[0].fallo, sinCab.filas[0].d], ["No pulsera", "5"]);
const d = L.nuevoAmfe("d", ""); d.subprocesos = [Object.assign(L.nuevoSubproceso(gid()), { nombre: "triaje" })];
const nuevos = L.incorporarFilas(d, pp.filas, gid);
eq("Incorporar: subprocesos nuevos (sin tildes ni mayúsculas)", [nuevos, d.subprocesos.length], [1, 2]);
eq("Incorporar: números", d.fallos.map(f => f.num), [1, 2]);
t("Incorporar: fallo en su subproceso", d.fallos[0].subprocesoId === d.subprocesos[0].id);

// Saneado y fusión
const sucio = { amfes: [{ id: "bueno", proceso: "P".repeat(500), fallos: [{ id: "f1", num: 3, fallo: "x", subprocesoId: "noexiste", g: 5 }, { id: "f2", num: 3, fallo: "y" }, { id: "<mal>", num: -2 }], subprocesos: [{ id: "s1", nombre: "S", color: "99" }], equipo: [{ id: "m1", perfil: "Celador", rol: "jefe" }], sesiones: [{ id: "x1", asistentes: ["m1", "otro"] }], escalas: { g: ["a"], o: "no" } }, "basura", null] };
const S = L.sanearDatos(sucio, gid, "2026-10-21");
const A1 = S.amfes[0];
eq("Saneado: solo objetos válidos", S.amfes.length, 1);
eq("Saneado: texto recortado", A1.proceso.length, 300);
eq("Saneado: referencia rota fuera", A1.fallos[0].subprocesoId, "");
eq("Saneado: número repetido renumerado", A1.fallos.map(f => f.num), [3, 4, 5]);
t("Saneado: id inválido sustituido", /^id\d+$/.test(A1.fallos[2].id));
eq("Saneado: G como texto", A1.fallos[0].g, "5");
eq("Saneado: color fuera de rango", A1.subprocesos[0].color, "0");
eq("Saneado: rol desconocido", A1.equipo[0].rol, "miembro");
eq("Saneado: asistentes que no existen fuera", A1.sesiones[0].asistentes, ["m1"]);
eq("Saneado: escalas con 5 tramos", [A1.escalas.g[0], A1.escalas.g.length, A1.escalas.o[4]], ["a", 5, L.ESCALAS_CURSO.o[4]]);
eq("Saneado: no es copia de AMFE", L.sanearDatos({ mapas: [] }, gid, ""), null);
const viejo = Object.assign(L.nuevoAmfe("z", "2026-01-01"), { modificado: "2026-01-01" }), nuevo = Object.assign(L.nuevoAmfe("z", "2026-02-01"), { modificado: "2026-02-01", proceso: "nuevo" });
eq("Fusión: gana el más reciente", L.fusionar({ amfes: [viejo] }, { amfes: [nuevo, L.nuevoAmfe("w", "")] }).amfes.map(x => x.id + ":" + x.proceso), ["z:nuevo", "w:"]);

// Progreso y siguiente paso
eq("Progreso vacío", L.progreso(vacio)[1], false);
eq("Siguiente paso sin AMFE", L.siguientePaso({ amfes: [] }, 1).href, "#/amfe/nuevo");

// Ejemplo de Urgencias: reproduce el ejercicio 11 resuelto
const U = L.sanearAmfe(JSON.parse(JSON.stringify(C.EJEMPLOS.amfes[0])), gid, "2026-10-21");
eq("Urgencias: 7 subprocesos, 10 perfiles, 3 sesiones, 49 fallos", [U.subprocesos.length, U.equipo.length, U.sesiones.length, U.fallos.length], [7, 10, 3, 49]);
eq("Urgencias: fallos por subproceso", U.subprocesos.map(s => U.fallos.filter(f => f.subprocesoId === s.id).length), [7, 7, 7, 7, 7, 7, 7]);
const top15 = L.ordenarFallos(U.fallos).slice(0, 15);
eq("Urgencias: los 15 de mayor IPR (orden del ejercicio 12)", top15.map(f => f.num), [10, 8, 5, 15, 29, 9, 23, 36, 45, 7, 16, 30, 43, 3, 11]);
eq("Urgencias: IPR de los 15", top15.map(L.iprDe), [343, 336, 294, 294, 294, 252, 252, 252, 252, 216, 216, 216, 216, 210, 180]);
eq("Urgencias: el último", L.ordenarFallos(U.fallos).pop().num, 6);
eq("Urgencias: IPR mínimo", Math.min(...U.fallos.map(L.iprDe)), 36);
eq("Urgencias: zonas de la matriz de los 15", [...new Set(top15.map(f => L.zonaMatriz(f.g, f.o)))].sort(), ["amarillo", "naranja"]);
eq("Urgencias: controles en los 15 primeros", top15.every(f => L.lleno(f.controles)), true);
eq("Urgencias: ningún fallo parece causa o efecto", U.fallos.filter(f => L.tipoRedaccion(f.fallo)).length, 0);
t("Urgencias: sin avisos de error ni de coordinación", !L.avisos(U).some(x => x.nivel === "error" || /coordinación|secretaría/.test(x.texto)));
eq("Urgencias: pasos hechos (el 7 no: quedan 6 prioritarios sin acción para practicar)", Object.entries(L.progreso(U)).filter(([, v]) => v).map(([k]) => k), ["1", "2", "3", "4", "5", "6", "8"]);
eq("Urgencias: sin paso pendiente en la entrega 2", L.pasoPendiente(U, 2), null);
eq("Urgencias: paso pendiente en la entrega 3", L.pasoPendiente(U, 3).n, 7);

// Priorización (entrega 2)
const nums = l => l.map(f => f.num);
eq("Prioridad por defecto: los 15 de mayor IPR", nums(L.prioritarios(U)), [10, 8, 5, 15, 29, 9, 23, 36, 45, 7, 16, 30, 43, 3, 11]);
const avU = L.avisosPriorizar(U);
t("Aviso: empatados con el último que quedan fuera", avU.some(x => /IPR \(180\)/.test(x.texto) && /nº 18, 22, 35, 37/.test(x.texto)));
t("Urgencias: sin avisos de motivo", !avU.some(x => /motivo/.test(x.texto)));
const U2 = JSON.parse(JSON.stringify(U));
U2.prioridad = { modo: "umbral", n: "15", umbral: "250" };
eq("Umbral IPR ≥ 250", nums(L.prioritarios(U2)), [10, 8, 5, 15, 29, 9, 23, 36, 45]);
U2.prioridad.umbral = "";
t("Aviso: umbral vacío", L.avisosPriorizar(U2).some(x => /umbral/.test(x.texto)));
const U3 = JSON.parse(JSON.stringify(U)), f6 = U3.fallos.find(f => f.num === 6), f10 = U3.fallos.find(f => f.num === 10);
f6.critico = true; f10.manual = "no";
let pr = L.prioridad(U3);
eq("Crítico sube a prioritario", [pr[f6.id].prio, pr[f6.id].por, pr[f6.id].auto], [true, "critico", false]);
eq("Quitado a mano", [pr[f10.id].prio, pr[f10.id].por, pr[f10.id].auto], [false, "manual", true]);
const avU3 = L.avisosPriorizar(U3);
t("Aviso: crítico sin motivo", avU3.some(x => x.fallo === f6.id && /crítico sin motivo/.test(x.texto)));
t("Aviso: quitado a mano sin motivo", avU3.some(x => x.fallo === f10.id && /quitado a mano/.test(x.texto)));
eq("Progreso 6 pendiente si faltan motivos", L.progreso(U3)[6], false);
f6.motivoCritico = "Evento centinela"; f10.motivo = "Ya resuelto"; f10.manual = "no";
eq("Progreso 6 con motivos", L.progreso(U3)[6], true);
f10.critico = true;
eq("Crítico gana a «quitado a mano»", L.prioridad(U3)[f10.id].prio, true);
const g = L.nuevoAmfe("g", ""); g.fallos = [Object.assign(L.nuevoFallo("g1", 1), { fallo: "Muy grave raro", g: "10", o: "1", d: "1" }), Object.assign(L.nuevoFallo("g2", 2), { fallo: "Rojo detectable", g: "9", o: "10", d: "1" }), ...Array.from({ length: 3 }, (_, i) => Object.assign(L.nuevoFallo("g" + (i + 3), i + 3), { fallo: "Otro " + i, g: "5", o: "5", d: "8" }))];
g.prioridad.n = "2";
const avG = L.avisosPriorizar(g);
t("Aviso: gravedad 9–10 no prioritario", avG.some(x => x.fallo === "g1" && /gravedad 10/.test(x.texto)));
t("Aviso: zona roja no prioritaria", avG.some(x => x.fallo === "g2" && /zona roja/.test(x.texto)));
g.prioridad.n = "50";
t("Aviso: N mayor que los fallos", L.avisosPriorizar(g).some(x => /entran todos/.test(x.texto)));
eq("Motivo propuesto", L.sugerirMotivo(U, U.fallos.find(f => f.num === 10)), "IPR 343 (puesto 1 de 49); zona naranja de la matriz de riesgos (riesgo alto).");
t("Motivo propuesto: sin controles y grave", /gravedad 10.*sin controles/.test(L.sugerirMotivo(g, g.fallos[0])));

// Matriz
const M10 = L.matriz(L.prioritarios(U), 10), M5 = L.matriz(L.prioritarios(U), 5);
eq("Matriz 10×10: tamaño", [M10.length, M10[0].length, M10[0][0].g, M10[0][0].o], [10, 10, 10, 1]);
eq("Matriz 10×10: total", M10.flat().reduce((s, x) => s + x.fallos.length, 0), 15);
eq("Matriz 10×10: casilla G7 O7", nums(M10[3][6].fallos), [10, 15]);
eq("Matriz 10×10: zona G10 O10", M10[0][9].zona, "rojo");
eq("Matriz 5×5: casilla G7–8 O7–8", nums(M5[1][3].fallos), [10, 8, 15]);
eq("Matriz 5×5: zonas de la primera fila", M5[0].map(x => x.zona), ["amarillo", "naranja", "naranja", "naranja", "rojo"]);
eq("Por subproceso", L.porSubproceso(U).map(s => s.prio), [3, 4, 2, 1, 2, 1, 2]);

// Intercambio «amfe-fallos» v1
const paq = JSON.parse(JSON.stringify(L.paqueteIntercambio([U], "2026.02", "2026-10-21T00:00:00Z")));
const leido = L.leerIntercambio(paq);
eq("Intercambio: cabecera", [paq.formato, paq.version, paq.app, leido.length], ["amfe-fallos", 1, "amfe", 1]);
const pf10 = leido[0].fallos.find(f => f.num === 10);
eq("Intercambio: fallo 10", [pf10.g, pf10.o, pf10.d, pf10.ipr, pf10.puesto, pf10.prioritario, pf10.motivoPrioridad, pf10.subproceso, pf10.zona], [7, 7, 7, 343, 1, true, "top", "Triaje de enfermería", "naranja"]);
eq("Intercambio: 49 fallos, 15 prioritarios, escalas del curso", [leido[0].fallos.length, leido[0].fallos.filter(f => f.prioritario).length, leido[0].escalas, leido[0].criterio], [49, 15, "curso", { modo: "top", n: 15, umbral: null }]);
eq("Intercambio: subprocesos con orden", leido[0].subprocesos.map(s => s.orden), [1, 2, 3, 4, 5, 6, 7]);
eq("Intercambio: no prioritario sin motivo", leido[0].fallos.find(f => f.num === 6).motivoPrioridad, null);
eq("Intercambio: versión desconocida", L.leerIntercambio(Object.assign({}, paq, { version: 2 })), null);
eq("Intercambio: otro formato", L.leerIntercambio({ formato: "otra", version: 1, amfes: [] }), null);

// Excel
const libro = L.hojasExcel(U, "21/10/2026");
eq("Excel: hojas", libro.hojas.map(h => h.nombre), ["AMFE", "Prioritarios", "Matriz", "Subprocesos", "Equipo y sesiones", "Acciones", "Reevaluación", "Escalas"]);
eq("Excel: filas de acciones y reevaluación", [libro.hojas[5].filas.length, libro.hojas[6].filas.length], [12, 12]);
eq("Excel: filas de la hoja AMFE (3 de cabecera + 49)", libro.hojas[0].filas.length, 52);
eq("Excel: filas de prioritarios", libro.hojas[1].filas.length, 18);
eq("Excel: casilla G7 O7 de la matriz", [libro.hojas[2].filas[5][7].texto, libro.hojas[2].filas[5][7].estilo], ["10, 15", "z_naranja"]);
const bytes = X.construirLibroXlsx(libro);
t("Excel: se construye (ZIP)", bytes.length > 5000 && bytes[0] === 0x50 && bytes[1] === 0x4b);
const estilosUsados = new Set(libro.hojas.flatMap(h => h.filas.flat().map(x => x && x.estilo).filter(Boolean)));
t("Excel: todos los estilos existen", [...estilosUsados].every(e => e in libro.estilos));

// Saneado de los campos nuevos
const S2 = L.sanearDatos({ amfes: [{ id: "q", prioridad: { modo: "raro", n: 7 }, fallos: [{ id: "f", num: 1, fallo: "x", critico: "si", manual: "quizá" }] }] }, gid, "");
eq("Saneado: prioridad", S2.amfes[0].prioridad, { modo: "top", n: "7", umbral: "200" });
eq("Saneado: crítico y manual", [S2.amfes[0].fallos[0].critico, S2.amfes[0].fallos[0].manual], [false, ""]);

// Contenido
eq("Aprende: 7 temas", C.TEMAS.length, 7);
t("Aprende: todos con minuto, secciones, minicaso y práctica", C.TEMAS.every(x => x.minuto.length >= 3 && x.secciones.length >= 1 && x.minicaso && x.practica.href));
t("Glosario: más de 20 términos sin repetir", C.GLOSARIO.length > 20 && new Set(C.GLOSARIO.map(g => g[0])).size === C.GLOSARIO.length);

// Acciones de mejora y reevaluación (entrega 3)
eq("Fuerza: checklist obligatorio", L.fuerzaMedida("Establecer un checklist digital obligatorio antes de cerrar el triaje"), "fuerte");
eq("Fuerza: alerta automática", L.fuerzaMedida("Configurar una alerta visible automática en admisión"), "fuerte");
eq("Fuerza: protocolo", L.fuerzaMedida("Actualizar el protocolo de identificación"), "intermedia");
eq("Fuerza: formación", L.fuerzaMedida("Sesión de formación al personal"), "debil");
eq("Vencida", [L.vencida({ fin: "2026-01-01", estado: "curso" }, "2026-02-01"), L.vencida({ fin: "2026-01-01", estado: "hecha" }, "2026-02-01"), L.vencida({ fin: "", estado: "pendiente" }, "2026-02-01")], [true, false, false]);
const mU = L.resumenMejora(U, "2026-10-21");
eq("Urgencias: acciones", [mU.acciones, mU.conAccion, mU.reevaluados, mU.vencidas], [9, 9, 9, 2]);
eq("Urgencias: reducción del IPR", [mU.iprInicial, mU.iprResidual, mU.reduccion], [2569, 1063, 59]);
const avM = L.avisosMejorar(U, "2026-10-21");
t("Aviso: prioritarios sin acción", avM.some(x => /6 fallos prioritarios no tienen/.test(x.texto)));
t("Aviso: acción vencida", avM.some(x => /terminó el 15\/12\/2025/.test(x.texto)));
eq("Urgencias: sin avisos de cierre", L.avisosCerrar(U).length, 0);
const W = JSON.parse(JSON.stringify(U)), w10 = W.fallos.find(f => f.num === 10), w8 = W.fallos.find(f => f.num === 8);
w10.acciones.push(Object.assign(L.nuevaAccion("nueva"), { que: "Sesión de formación" }));
const avW = L.avisosMejorar(W, "2026-10-21");
t("Aviso: acción sin responsable, plazo ni indicador", avW.some(x => x.accion === "nueva" && /falta responsable, plazo y indicador/.test(x.texto)));
t("Aviso: acción sin «actúa sobre»", avW.some(x => x.accion === "nueva" && /marca sobre qué actúa/.test(x.texto)));
w10.residual = { g: "7", o: "7", d: "7", fecha: "", nota: "" };
w8.residual = { g: "6", o: "5", d: "4", fecha: "", nota: "" };
const avC = L.avisosCerrar(W);
t("Aviso: el IPR residual no baja", avC.some(x => x.fallo === w10.id && /no baja del inicial/.test(x.texto)));
t("Aviso: baja la gravedad sin nota", avC.some(x => x.fallo === w8.id && /la gravedad baja de 8 a 6/.test(x.texto)));
const debiles = JSON.parse(JSON.stringify(U)); debiles.fallos.forEach(f => f.acciones.forEach(x => { x.que = "Sesión de formación y recordatorio"; }));
t("Aviso: todas las acciones débiles", L.avisosMejorar(debiles, "").some(x => /medidas débiles/.test(x.texto)));
eq("Por qué propuesto", L.sugerirPorque({ efecto: "Error de identidad", causa: "Rutina interrumpida" }), "Para evitar este efecto: error de identidad; actuando sobre su causa: rutina interrumpida.");
t("Conclusiones propuestas con cifras", /49 fallos potenciales.*de 2569 a 1063 \(un 59 % menos\)/.test(L.conclusionesSugeridas(U)));
const ind = L.indicadoresDe({ indicadores: [{ nombre: "Identificación correcta", numerador: "Pacientes con pulsera", denominador: "Pacientes atendidos", estandar: "95", sentido: "mas", fuentes: ["Historia clínica"] }, { nombre: "" }] });
eq("Indicadores importados", ind, [{ nombre: "Identificación correcta", formula: "Pacientes con pulsera / Pacientes atendidos × 100", estandar: "≥ 95 %", fuente: "Historia clínica" }]);
eq("Indicadores: no es una copia de Indicadores", L.indicadoresDe({ amfes: [] }), null);

// Documentos
const doc = L.documentoInforme(U, "21/10/2026"), h1 = doc.bloques.filter(b => b.t === "h1").map(b => b.texto);
eq("Informe: apartados", h1, ["Control del documento", "1. Introducción", "2. Descripción del proceso", "3. Equipo y metodología", "4. Resultados del análisis", "5. Acciones de mejora", "6. Reevaluación del riesgo", "7. Conclusiones", "Anexo I. Escalas de puntuación", "Anexo II. Fallos analizados", "Anexo III. Diagramas de Ishikawa"]);
const tablas = doc.bloques.filter(b => b.t === "tabla");
t("Informe: todas las tablas con filas del mismo ancho que la cabecera", tablas.every(b => !b.cab || b.filas.every(f => f.length === b.cab.length)));
t("Informe: matriz 10 × 10", tablas.some(b => b.cab && b.cab[0] === "G \\ O" && b.filas.length === 10));
t("Informe: sin nombres en el control del ejemplo", JSON.stringify(doc.bloques).indexOf("Romero") < 0 && JSON.stringify(doc.bloques).indexOf("Galán") < 0);
const word = D.construirDocx(Object.assign({ pie: "AMFE" }, doc));
t("Informe: Word construido (ZIP)", word.length > 10000 && word[0] === 0x50 && word[1] === 0x4b);
const res = L.documentoResumen(U, "21/10/2026"), tRes = res.bloques.find(b => b.t === "tabla");
eq("Resumen: los 5 primeros con su acción", tRes.filas.map(f => f[0].texto), ["10", "8", "5", "15", "29"]);
t("Resumen: Word construido", D.construirDocx(res).length > 5000);
const vacioDoc = L.documentoInforme(L.nuevoAmfe("v", ""), "");
t("Informe de un AMFE vacío no falla", vacioDoc.bloques.length > 5 && D.construirDocx(vacioDoc).length > 3000);

// Intercambio con acciones y residual
const pq = L.leerIntercambio(JSON.parse(JSON.stringify(L.paqueteIntercambio([U], "2026.03", ""))))[0], p10 = pq.fallos.find(f => f.num === 10);
eq("Intercambio: acción y residual", [p10.acciones.length, p10.acciones[0].fuerza, p10.acciones[0].indicador.estandar, p10.residual], [1, "fuerte", "≥ 95 %", { g: 7, o: 4, d: 3, ipr: 84 }]);
eq("Intercambio: sin residual", pq.fallos.find(f => f.num === 7).residual, null);

// Saneado de los campos nuevos
const S3 = L.sanearDatos({ amfes: [{ id: "s", control: { aprobado: [{ nombre: "X", cargo: 3 }], historial: "no" }, fallos: [{ id: "f", num: 1, fallo: "x", residual: { g: 5 }, acciones: [{ id: "a", que: "Hacer", actuaSobre: ["o", "z", "o"], estado: "rara", tipo: "otra", indicador: { nombre: "I" }, comprobacion: { medible: true, factible: "si" } }] }] }] }, gid, "");
const A3 = S3.amfes[0], x3 = A3.fallos[0].acciones[0];
eq("Saneado: acción", [x3.que, x3.actuaSobre, x3.estado, x3.tipo, x3.indicador.nombre, x3.indicador.estandar, x3.comprobacion.medible, x3.comprobacion.factible], ["Hacer", ["o"], "pendiente", "correctora", "I", "", true, false]);
eq("Saneado: residual y control", [A3.fallos[0].residual.g, A3.control.aprobado[0], A3.control.historial], ["5", { nombre: "X", cargo: "3" }, []]);
eq("Saneado: AMFE sin control trae el control por defecto", L.sanearAmfe({ id: "k" }, gid, "").control.historial[0].cambio, "Documento inicial");

// Entrega 4 · Lluvia de ideas y grupo nominal
eq("Urgencias: ideas, bloques y votos", [U.ideas.length, U.bloques.length, U.tgn.votos.length], [26, 12, 15]);
eq("Grupo nominal: recuento del ejercicio 3", L.ranking(U).slice(0, 8).map(r => r.total), [11, 6, 5, 2, 2, 2, 1, 1]);
eq("Grupo nominal: primer bloque", L.ranking(U)[0].b.nombre, "Identificación del paciente");
t("Aviso: bloques sin votos y sin comentario", (() => { const Z = JSON.parse(JSON.stringify(U)); Z.bloques.forEach(b => { b.comentario = ""; }); return L.avisosIdeas(Z).some(x => /ningún voto/.test(x.texto)); })());
t("Ideas parecidas", L.parecidas("No se colocó la pulsera identificativa", "No se le colocó la pulsera identificativa al paciente"));
t("Ideas distintas", !L.parecidas("Sala de espera muy fría", "No se corrigió el error en el apellido"));
const T = L.nuevoAmfe("t", ""); T.equipo = [Object.assign(L.nuevoMiembro("m1"), { perfil: "Enfermera" }), Object.assign(L.nuevoMiembro("m2"), { perfil: "Médico" })];
T.bloques = [L.nuevoBloque("b1", "A"), L.nuevoBloque("b2", "B"), L.nuevoBloque("b3", "C")];
L.ponerVoto321(T, "m1", 3, "b1"); L.ponerVoto321(T, "m1", 2, "b2"); L.ponerVoto321(T, "m1", 3, "b2");
eq("3-2-1: cambiar el 3 a un bloque que tenía el 2 lo mueve", [L.voto321(T, "m1", 3), L.voto321(T, "m1", 2)], ["b2", ""]);
L.ponerVoto321(T, "m1", 2, "b1"); L.ponerVoto321(T, "m2", 3, "b1");
eq("3-2-1: recuento", L.ranking(T).map(r => r.b.id + ":" + r.total), ["b1:5", "b2:3", "b3:0"]);
t("Aviso: votos a medias", L.avisosIdeas(Object.assign(T, { ideas: [Object.assign(L.nuevaIdea("i1"), { texto: "x" })] })).some(x => /ha repartido 2 de sus 3 votos/.test(x.texto)));
T.tgn.modo = "1a10"; T.tgn.votos = []; L.ponerVoto1a10(T, "m1", "b3", "9"); L.ponerVoto1a10(T, "m2", "b3", "8"); L.ponerVoto1a10(T, "m2", "b1", "12");
eq("1 a 10: recuento", L.ranking(T)[0].b.id + ":" + L.ranking(T)[0].total, "b3:17");
t("Aviso: voto 1 a 10 no válido", L.avisosIdeas(T).some(x => x.nivel === "error"));
const I1 = Object.assign(L.nuevaIdea("i9", "s1"), { texto: "  Pulsera no colocada " }), T2 = L.nuevoAmfe("t2", ""); T2.ideas = [I1];
const nf = L.ideaAFallo(T2, I1, () => "f9");
eq("Idea → fallo", [nf.fallo, nf.subprocesoId, nf.num, I1.falloId, L.ideaAFallo(T2, I1, () => "otro")], ["Pulsera no colocada", "s1", 1, "f9", null]);

// Votación de G·O·D por miembro
const f10u = U.fallos.find(f => f.num === 10), mv = L.mediaVotos(f10u);
eq("Media de los votos", [mv.g.media, mv.o.media, mv.d.media, mv.d.rango], [7, 7, 7, 4]);
eq("Discrepancia en la detección", L.discrepancia(f10u), ["d"]);
t("Aviso: votos muy separados", L.avisosPuntuar(U).some(x => x.fallo === f10u.id && /muy separados en detección/.test(x.texto)));
const fv = L.nuevoFallo("fv", 1); L.ponerVotoGOD(fv, "m1", "g", "6"); L.ponerVotoGOD(fv, "m2", "g", "7");
eq("Media redondeada (6,5 → 7)", L.mediaVotos(fv).g.media, 7);
L.ponerVotoGOD(fv, "m2", "g", "");
eq("Voto vacío se quita", fv.votos.length, 1);

// Ediciones
const E1 = L.nuevaEdicion(U, () => "ed1", "2026-11-04T10:00:00.000Z");
eq("Nueva edición", [E1.id, E1.edicion, E1.anteriorId, E1.proxRevision, E1.control.historial.slice(-1)[0].edicion, E1.fallos.length], ["ed1", "01", "ej-amfe-urg", "", "01", 49]);
const e10 = E1.fallos.find(f => f.num === 10); e10.o = "4"; e10.d = "3";
E1.fallos = E1.fallos.filter(f => f.num !== 6); E1.fallos.push(Object.assign(L.nuevoFallo("fnuevo", 50), { fallo: "Nuevo", g: "5", o: "5", d: "5" }));
const cmp = L.compararEdiciones(U, E1);
eq("Comparar ediciones", [cmp.baja, cmp.sube, cmp.igual, cmp.nuevo, cmp.quitado], [1, 0, 47, 1, 1]);
eq("Comparar: fila del nº 10", cmp.filas.find(x => x.num === 10), { num: 10, fallo: f10u.fallo, antes: 343, ahora: 84, cambio: "baja" });
eq("Revisión próxima", [L.revisionProxima(U, "2026-10-21"), L.revisionProxima(U, "2026-11-10").vencida, L.revisionProxima(U, "2026-01-01")], [{ dias: 14, vencida: false }, true, null]);

// Hoja de trabajo
const hoja = L.documentoHoja(U, "21/10/2026");
eq("Hoja: apartados", hoja.bloques.filter(b => b.t === "h1").map(b => b.texto), ["Escalas de puntuación", "1. Lluvia de ideas: ¿qué puede salir mal?", "2. Análisis de cada fallo", "3. Mi votación de G, O y D"]);
t("Hoja: tablas coherentes", hoja.bloques.filter(b => b.t === "tabla").every(b => !b.cab || b.filas.every(f => f.length === b.cab.length)));
t("Hoja: Word construido", D.construirDocx(hoja).length > 10000);
const hv = L.documentoHoja(L.nuevoAmfe("hv", ""), "");
t("Hoja de un AMFE vacío", hv.bloques.some(b => b.t === "tabla" && b.filas.length === 4 + 0 && b.cab.length === 9) && D.construirDocx(hv).length > 3000);

// Saneado de lo nuevo
const S4 = L.sanearDatos({ amfes: [{ id: "q", equipo: [{ id: "m1", perfil: "X" }], bloques: [{ id: "b1", nombre: "B" }], subprocesos: [{ id: "s1", nombre: "S" }], ideas: [{ id: "i1", texto: "t", subprocesoId: "s1", bloqueId: "b9", falloId: "f9" }], tgn: { modo: "otro", votos: [{ miembroId: "m1", bloqueId: "b1", puntos: 3 }, { miembroId: "m9", bloqueId: "b1", puntos: 2 }] }, fallos: [{ id: "f1", num: 1, fallo: "x", votos: [{ miembroId: "m1", g: 5 }, { miembroId: "zz", g: 2 }] }] }] }, gid, "");
const A4 = S4.amfes[0];
eq("Saneado: ideas, votos y edición", [A4.ideas[0].bloqueId, A4.ideas[0].falloId, A4.tgn.modo, A4.tgn.votos.length, A4.tgn.votos[0].puntos, A4.fallos[0].votos.length, A4.edicion], ["", "", "321", 1, "3", 1, "00"]);

// Entrega 5 · Ishikawa
const f2u = U.fallos.find(f => f.num === 2);
eq("Ishikawa del ejemplo: causas por rama", Object.keys(L.RAMAS_ISHIKAWA).map(k => f2u.ishikawa.filter(x => x.cat === k).length), [3, 2, 2, 2, 2, 2, 2]);
eq("Ishikawa: causa de fondo = último porqué", L.causaRaiz(f2u.ishikawa[1]), "Plantilla ajustada en las horas punta");
eq("Ishikawa: causas elegidas", L.textoCausaIshikawa(f2u), "Omisión del protocolo por rutina o fatiga (de fondo: plantilla ajustada en las horas punta); No hay un protocolo obligatorio de identificación al ingreso (de fondo: el protocolo del hospital no se ha adaptado a Urgencias); El sistema informático permite seguir sin confirmar los datos clave (de fondo: no tiene campos obligatorios en admisión)");
const fk = L.nuevoFallo("fk", 1); fk.fallo = "x"; fk.ishikawa = [Object.assign(L.nuevaCausaIsh("k1", "entorno"), { texto: "Ruido", elegida: true })];
const ak = L.nuevoAmfe("ak", ""); ak.fallos = [fk];
t("Aviso: Ishikawa elegido y causa vacía", L.avisosFallos(ak).some(x => x.fallo === "fk" && /Ishikawa/.test(x.texto)));
t("Informe: anexo III de Ishikawa", L.documentoInforme(U, "").bloques.some(b => b.t === "h1" && /Anexo III/.test(b.texto)));
const SK = L.sanearAmfe({ id: "sk", fallos: [{ id: "f", num: 1, fallo: "x", ishikawa: [{ id: "k", cat: "rara", texto: "t", porques: ["a"], elegida: 1 }] }] }, gid, "");
eq("Saneado: Ishikawa", [SK.fallos[0].ishikawa[0].cat, SK.fallos[0].ishikawa[0].porques, SK.fallos[0].ishikawa[0].elegida], ["personal", ["a", "", ""], false]);

// Ponte a prueba y ejercicios
eq("Test: 15 preguntas de los temas 2, 4 y 5", [C.TEST.length, [...new Set(C.TEST.map(q => q.t))]], [15, [2, 4, 5]]);
t("Test: cada pregunta con 5 opciones, respuesta válida y justificación", C.TEST.every(q => q.o.length === 5 && q.ok >= 0 && q.ok < 5 && q.e.length > 20 && !/Pág\.|Curso:/.test(q.q + q.o.join("") + q.e)));
eq("Ejercicio fallo-efecto-causa: 12 frases, 4 de cada", ["fallo", "efecto", "causa"].map(k => C.EJERCICIOS.fec.filter(x => x.tipo === k).length), [4, 4, 4]);
t("Ejercicio: ninguna frase de «fallo» salta como causa o efecto", C.EJERCICIOS.fec.filter(x => x.tipo === "fallo").every(x => !L.tipoRedaccion(x.texto)));
eq("Ejercicio puntúa: puntuaciones del curso", C.EJERCICIOS.puntua.map(x => L.ipr(x.g, x.o, x.d)), [343, 294, 36, 252]);

// Minicasos
const MC = C.EJEMPLOS.amfes.slice(1).map(x => L.sanearAmfe(JSON.parse(JSON.stringify(x)), gid, ""));
eq("Minicasos: 6, con 5 fallos y 3 subprocesos", MC.map(m => [m.fallos.length, m.subprocesos.length]), Array(6).fill([5, 3]));
t("Minicasos: ids de ejemplo", MC.every(m => /^ej-mini-/.test(m.id)) && C.EJEMPLOS.minicasos.length === 6);
const mc = id => MC.find(m => m.id === id), avDe = (id, re) => L.avisos(mc(id), "2026-10-21").some(x => re.test(x.texto));
eq("Minicaso medicación: el primero es el 504", L.iprDe(L.prioritarios(mc("ej-mini-med"))[0]), 504);
t("Minicaso constantes: aviso de la detección al revés", avDe("ej-mini-const", /va al revés/));
t("Minicaso alta: aviso de gravedad 10 no prioritario", avDe("ej-mini-alta", /gravedad 10 y no es prioritario/));
t("Minicaso analítica: aviso de medidas débiles", avDe("ej-mini-anal", /medidas débiles/));
t("Minicaso quirófano: aviso de fallo escrito como causa", avDe("ej-mini-quir", /parece una causa/));
t("Minicaso transfusión: Ishikawa con causas elegidas", L.causasElegidas(mc("ej-mini-trans").fallos[1]).length === 3);
t("Minicasos: Word del informe de cada uno", MC.every(m => D.construirDocx(L.documentoInforme(m, "")).length > 5000));

// Contrato con la app Mapa de Riesgos (carga este logic.js como window.LogicaAmfe; ver su diseño, sección 6.2).
// Si una de estas funciones se quita o cambia de significado, hay que comprobar Mapa de Riesgos y subir MOTOR.
const CONTRATO_MAPA = {
  constantes: ["ESCALAS_CURSO", "TRAMOS", "NIVELES_IPR"],
  funciones: ["ipr", "iprDe", "nivelIPR", "zonaMatriz", "ordenarFallos", "puestos", "prioridad", "prioritarios", "sugerirMotivo", "matriz", "porSubproceso",
    "tipoRedaccion", "avisosEquipo", "avisosFallos", "avisosPuntuar", "avisosPriorizar", "avisosMejorar",
    "fuerzaMedida", "accionCompleta", "iprResidual", "resumenMejora",
    "nuevoFallo", "nuevaAccion", "nuevoMiembro", "nuevaSesion", "sanearAmfe",
    "leerIntercambio", "paqueteIntercambio", "parsearTabla"]
};
eq("Contrato: MOTOR", L.MOTOR, 1);
eq("Contrato: constantes que faltan", CONTRATO_MAPA.constantes.filter(k => L[k] === undefined), []);
eq("Contrato: funciones que faltan", CONTRATO_MAPA.funciones.filter(k => typeof L[k] !== "function"), []);
{ // En el navegador se publica como window.Logica y también como window.LogicaAmfe
  const w = {}, fs = require("node:fs"), url = require("node:url"), path = require("node:path");
  new Function("window", "module", fs.readFileSync(path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "logic.js"), "utf8"))(w, undefined);
  t("Contrato: window.LogicaAmfe en el navegador", w.LogicaAmfe && w.LogicaAmfe === w.Logica && w.LogicaAmfe.MOTOR === 1);
}
// Comportamiento básico que Mapa de Riesgos da por hecho
eq("Contrato: firma de ipr, zonaMatriz y matriz", [L.ipr("7", 7, 7), L.zonaMatriz(10, 10), L.matriz([], 5).length, L.matriz([], 10)[0].length], [343, "rojo", 5, 10]);
eq("Contrato: prioridad devuelve prio, auto, por, grave y zona", Object.keys(L.prioridad(U)[U.fallos[0].id]).sort(), ["auto", "grave", "por", "prio", "zona"]);
eq("Contrato: formato de intercambio", [L.FORMATO_INTERCAMBIO, L.VERSION_INTERCAMBIO], ["amfe-fallos", 1]);

console.log(`${ok} pruebas correctas, ${fallos} fallidas`);
if (fallos) process.exit(1);
