// Pruebas de «Traer de Lectura Crítica» (paquete «lecturacritica-lecturas» v1).
// Mismo archivo en AMFE, DAFO, Auditorías e Indicadores. Ejecutar: node tests/lectura-critica.test.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const L = require("../logic.js");

let ok = 0, mal = 0;
const prueba = (nombre, cond) => { if (cond) ok++; else { mal++; console.log("✗ " + nombre); } };

// Paquete con la forma exacta que escribe Lectura Crítica v2026.04 (logic.js, paqueteIntercambio)
const lectura = (id, extra) => Object.assign({
  id, titulo: "Ondansetrón frente a placebo en la gastroenteritis infantil", cita: "Freedman SB, et al. N Engl J Med. 2006;354:1698-705.",
  doi: "10.1056/NEJMoa055119", pmid: "16625009", url: "", anio: "2006",
  pregunta: "En niños con gastroenteritis, ¿el ondansetrón reduce la necesidad de sueroterapia intravenosa?",
  pico: { p: "Niños con gastroenteritis y vómitos", i: "Ondansetrón oral", c: "Placebo", o: "Sueroterapia intravenosa" },
  tipo: "ensayo", tipoNombre: "Ensayo clínico", eliminacion: "supera", semaforo: { validez: "verde", resultados: "verde", aplicabilidad: "ambar" },
  decision: "aplicar", motivo: "Ensayo válido y efecto importante.",
  resultadosClave: [{ desenlace: "Sueroterapia intravenosa", medida: "NNTB", valor: 5.2, icInf: 3.6, icSup: 9.4, texto: "Sueroterapia intravenosa: NNTB 5,2 (IC 95 %: 3,6 a 9,4)" }],
  mensaje: "Una dosis de ondansetrón evita una sueroterapia por cada 5 niños tratados.", fecha: "2026-10-26"
}, extra);
const paquete = { formato: "lecturacritica-lecturas", version: 1, app: "lecturacritica", appVersion: "2026.04", generado: "2026-10-26",
  lecturas: [lectura("l1"), lectura("l2", { decision: "", titulo: "", cita: "", resultadosClave: [] }), lectura("l3", { decision: "esperar", resultadosClave: [], mensaje: "" }), lectura("ej-u-1"), null, { id: 7 }] };

const r = L.lecturasDe(paquete);
prueba("Lee el paquete", Array.isArray(r.lecturas));
prueba("Quita las lecturas sin título ni referencia, los ejemplos y lo que no es una lectura", r.lecturas.map(x => x.id).join() === "l1,l3");
prueba("Conserva la decisión", r.lecturas[0].decision === "aplicar" && r.lecturas[1].decision === "esperar");
prueba("Conserva los números del resultado clave", r.lecturas[0].resultadosClave[0].valor === 5.2 && r.lecturas[0].resultadosClave[0].icSup === 9.4);
prueba("Acepta la copia .json de Lectura Crítica (clave «intercambio»)", L.lecturasDe({ app: "lecturacritica", v: 1, lecturas: [], intercambio: paquete }).lecturas.length === 2);
prueba("Rechaza otro formato", L.lecturasDe({ formato: "amfe-fallos", version: 1, amfes: [] }).error === "formato");
prueba("Rechaza otra versión", L.lecturasDe(Object.assign({}, paquete, { version: 2 })).error === "version");
prueba("Rechaza lo que no es un objeto", L.lecturasDe(null).error === "formato" && L.lecturasDe("x").error === "formato");
prueba("Una decisión desconocida queda vacía", L.lecturasDe(Object.assign({}, paquete, { lecturas: [lectura("z", { decision: "quizás" })] })).lecturas[0].decision === "");
prueba("Recorta los textos largos", L.lecturasDe(Object.assign({}, paquete, { lecturas: [lectura("z", { mensaje: "x".repeat(5000) })] })).lecturas[0].mensaje.length === 2000);

const t = L.textoEvidenciaLC(r.lecturas[0]);
prueba("El texto lleva la referencia y el tipo de estudio", t.startsWith("Evidencia: Freedman SB, et al. N Engl J Med. 2006;354:1698-705 (ensayo clínico)."));
prueba("El texto lleva el resultado, el mensaje y la decisión", t.includes("Resultado: Sueroterapia intravenosa: NNTB 5,2 (IC 95 %: 3,6 a 9,4).") && t.includes("por cada 5 niños tratados.") && t.endsWith("Decisión tras la lectura crítica: aplicar."));
prueba("Sin cita, usa título, año y DOI", L.referenciaLC(Object.assign({}, r.lecturas[0], { cita: "" })) === "Ondansetrón frente a placebo en la gastroenteritis infantil. 2006. doi: 10.1056/NEJMoa055119");
prueba("Sin resultado ni mensaje, solo referencia y decisión", L.textoEvidenciaLC(r.lecturas[1]).split(". Resultado").length === 1 && L.textoEvidenciaLC(r.lecturas[1]).endsWith("esperar."));

console.log(`Lectura Crítica: ${ok} pruebas correctas, ${mal} fallidas`);
if (mal) process.exit(1);
