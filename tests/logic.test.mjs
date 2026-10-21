// Pruebas de la lógica pura y de los ejemplos · node tests/logic.test.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const L = require("../logic.js");
const C = require("../contenido.js");

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
eq("Urgencias: pasos hechos", Object.entries(L.progreso(U)).filter(([, v]) => v).map(([k]) => k), ["1", "2", "4", "5"]);
eq("Urgencias: sin paso pendiente en la entrega 1", L.pasoPendiente(U, 1), null);

// Contenido
eq("Aprende: 7 temas", C.TEMAS.length, 7);
t("Aprende: todos con minuto, secciones, minicaso y práctica", C.TEMAS.every(x => x.minuto.length >= 3 && x.secciones.length >= 1 && x.minicaso && x.practica.href));
t("Glosario: más de 20 términos sin repetir", C.GLOSARIO.length > 20 && new Set(C.GLOSARIO.map(g => g[0])).size === C.GLOSARIO.length);

console.log(`${ok} pruebas correctas, ${fallos} fallidas`);
if (fallos) process.exit(1);
