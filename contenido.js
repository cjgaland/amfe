// ============================================================
//  contenido.js — Solo datos · AMFE
//  Aprende (7 temas), glosario y ejemplos. HTML de confianza escrito a mano.
//  Fuente: temas 2, 4 y 5 del curso, ejercicios 3, 6, 9 a 13 y el Documento
//  Final del Mapa de Riesgos de Urgencias (sin nombres de centro ni de personas).
//  window.Contenido en navegador y module.exports en Node (tests).
// ============================================================
(function (raiz) {
  "use strict";

  // ---------- Aprende ----------
  // c = color del tema (clases pdca--P/H/V/A de styles.css, solo como color)
  const TEMAS = [
    { n: 1, c: "P", titulo: "Qué es un AMFE", sub: "Adelantarse a los fallos antes de que dañen a un paciente",
      minuto: [
        "El <b>AMFE</b> (Análisis Modal de Fallos y Efectos) busca, de forma ordenada, <b>qué puede fallar</b> en un proceso, <b>qué pasaría</b> si falla y <b>por qué</b> podría ocurrir.",
        "Es <b>proactivo</b>: se hace antes de que ocurra el incidente. El análisis de causa raíz, en cambio, es reactivo: se hace después.",
        "Cada fallo se puntúa en <b>gravedad</b>, <b>ocurrencia</b> y <b>detección</b>. Su producto es el <b>IPR</b>, que ordena las prioridades.",
        "El resultado no es la tabla: son las <b>acciones de mejora</b> que bajan el riesgo de los fallos más importantes."],
      secciones: [
        { t: "¿Para qué sirve?", h: `<p>Para que un equipo conozca los puntos débiles de su proceso y decida, con criterios objetivos, dónde poner primero sus esfuerzos. Además:</p>
          <ul><li>Previene errores graves antes de que lleguen al paciente.</li><li>Da una base sólida a la mejora continua y a las auditorías.</li><li>Implica al equipo y mejora la cultura de seguridad.</li><li>Reduce costes: un error evitado no hay que gestionarlo.</li></ul>` },
        { t: "¿Qué procesos merecen un AMFE?", h: `<p>Los que son <b>relevantes para la seguridad del paciente</b> y en los que un fallo tendría consecuencias importantes: transfusión, administración de medicación, identificación, atención en Urgencias, preparación de quirófano…</p>
          <div class="box box--practica"><span class="box-tag">En la práctica</span><p>Empezad por un proceso acotado que conozcáis bien. Un AMFE de «todo el hospital» no se termina nunca.</p></div>` },
        { t: "Los pasos, en orden", h: `<ol><li>Elegir y describir el proceso, y dividirlo en subprocesos.</li><li>Formar el equipo.</li><li>Encontrar los fallos posibles (lluvia de ideas, grupo nominal).</li><li>Para cada fallo, su efecto y su causa.</li><li>Puntuar gravedad, ocurrencia y detección: IPR.</li><li>Priorizar.</li><li>Proponer acciones de mejora.</li><li>Volver a puntuar tras las acciones y revisar periódicamente.</li></ol>` }
      ],
      minicaso: `<p>Un hospital elige el proceso de <b>transfusión</b> por el riesgo de errores de grupo sanguíneo. Un fallo posible: <i>identificación incorrecta del grupo del paciente</i>. Efecto: <i>transfusión incompatible y reacción hemolítica grave</i>. Causa: <i>etiquetas mal impresas o verificación inadecuada</i>. Acción: <i>doble verificación electrónica antes de transfundir</i>.</p>`,
      practica: { texto: "Ver el ejemplo de Urgencias", href: "#/amfe/ej-amfe-urg/1" } },

    { n: 2, c: "P", titulo: "El proceso y el equipo", sub: "Delimitar bien el proceso y reunir a quien lo conoce",
      minuto: [
        "Antes de buscar fallos hay que <b>mapear el proceso</b>: dónde empieza, dónde acaba y qué pasos tiene.",
        "Se divide en <b>subprocesos</b>: fases con un inicio, un fin y unos roles claros (lo habitual, entre 3 y 8).",
        "El equipo es <b>multidisciplinar</b>: al menos 6 perfiles, con quien hace el proceso a diario.",
        "Cada miembro tiene un <b>papel</b> (coordinación, secretaría, referente clínico…) y el trabajo se organiza en <b>sesiones</b>."],
      secciones: [
        { t: "Delimitar el proceso y los subprocesos", h: `<p>Un subproceso es una unidad operativa dentro del proceso general: «Triaje de enfermería», «Administración de medicación», «Tramitación del alta»… Para cada uno, anotad:</p>
          <ul><li><b>Descripción</b>: qué se hace.</li><li><b>Inicio y fin</b>: el hecho que lo abre y el que lo cierra.</li><li><b>Roles</b>: quién interviene.</li></ul>
          <div class="box box--trampa"><span class="box-tag">Ojo, trampa</span><p>Si los subprocesos no tienen inicio y fin claros, se solapan (un fallo se cuenta dos veces) o dejan huecos (nadie mira esa parte).</p></div>` },
        { t: "Quién forma el equipo", h: `<p>Todos los que intervienen en el proceso, cada uno aporta riesgos que los demás no ven. En Urgencias, por ejemplo: medicina, enfermería, TCAE, celadores, admisión, farmacia, una especialidad que colabora, Calidad y Seguridad del Paciente.</p>
          <p>Papeles habituales: <b>coordinación</b> (dirige y modera), <b>secretaría</b> (registra y asegura el método), <b>referente clínico</b>, <b>representante operativo</b>, <b>asesor experto</b>, <b>consultor metodológico</b>.</p>` },
        { t: "Las sesiones", h: `<p>Lo habitual son tres sesiones de unas dos horas: 1) leer y analizar el proceso; 2) lluvia de ideas y grupo nominal para encontrar los fallos; 3) puntuar G, O y D y calcular el IPR. Anotad fecha, asistentes y resultados: el documento final los recoge.</p>` }
      ],
      minicaso: `<p>En el AMFE de Urgencias, los subprocesos citaban a celadores en «Pruebas diagnósticas y traslado», pero el primer borrador del equipo no tenía ninguno. Al incluir a un celador de guardia apareció un fallo que nadie había previsto: <i>confusión de camillas al volver de pruebas</i> (IPR 216).</p>`,
      practica: { texto: "Crear mi AMFE", href: "#/amfe/nuevo" } },

    { n: 3, c: "H", titulo: "Lluvia de ideas y grupo nominal", sub: "Encontrar muchos fallos y quedarse con los importantes",
      minuto: [
        "La <b>lluvia de ideas</b> genera muchas ideas en poco tiempo, <b>sin criticarlas</b>.",
        "La <b>técnica de grupo nominal</b> es más estructurada: cada persona piensa en silencio, se ponen en común y se <b>vota</b> de forma individual.",
        "La lluvia de ideas puede <b>infrarrepresentar las ideas minoritarias</b>; el grupo nominal da a todos la misma voz.",
        "Después de votar se <b>comentan</b> también las ideas que nadie votó: a veces esconden riesgos importantes."],
      secciones: [
        { t: "Lluvia de ideas, paso a paso", h: `<ol><li>Explicar el objetivo y el proceso que se analiza.</li><li>Generar ideas sin juzgarlas («¿qué puede salir mal en este paso?», «¿qué errores hemos visto?», «¿qué fallos podríamos prever?»). Se puede pedir tres ideas a cada persona.</li><li>Anotarlas todas a la vista del grupo.</li><li>Aclararlas, agruparlas por temas y quitar duplicados.</li></ol>` },
        { t: "Técnica de grupo nominal, paso a paso", h: `<ol><li>Presentar todas las ideas o bloques.</li><li>Votar de forma individual: por ejemplo, cada persona reparte 3, 2 y 1 puntos entre los tres bloques que le parecen más importantes.</li><li>Sumar y ordenar.</li><li>Comentar el resultado en grupo (y repetir la votación si hace falta).</li></ol>
          <div class="box box--practica"><span class="box-tag">En la práctica</span><p>En la app, el paso 3 («Encontrar los fallos») llegará en una próxima versión con la lluvia de ideas por subproceso y el recuento de votos.</p></div>` }
      ],
      minicaso: `<p>Con el caso clínico de Urgencias, un grupo votó 12 bloques de causas. «Identificación del paciente» sumó 11 puntos; «Historia clínica incompleta / fármacos», 6; «Fallos en la detección de sepsis», 5. «No evaluación del riesgo de caída» no recibió ningún voto… pero al comentarlo el grupo reconoció que era un fallo de seguridad estructural.</p>`,
      practica: { texto: "Ver los fallos del ejemplo", href: "#/amfe/ej-amfe-urg/4" } },

    { n: 4, c: "H", titulo: "Fallo, efecto y causa", sub: "Tres preguntas distintas que no hay que mezclar",
      minuto: [
        "<b>Modo de fallo</b>: <i>¿qué puede salir mal?</i> Un hecho concreto y observable.",
        "<b>Efecto</b>: <i>¿qué pasaría si ocurre?</i> En el paciente, el proceso o el sistema.",
        "<b>Causa</b>: <i>¿por qué podría ocurrir?</i> Factores humanos, técnicos, organizativos o del entorno.",
        "<b>Controles actuales</b>: <i>¿qué existe hoy para evitarlo o detectarlo?</i> Ayudan a puntuar bien la detección."],
      secciones: [
        { t: "Cómo distinguirlos", h: `<div class="table-wrap"><table class="mini"><tr><th>Columna</th><th>Pregunta</th><th>Ejemplo (Urgencias)</th></tr>
          <tr><td><b>Fallo</b></td><td>¿Qué sale mal?</td><td>No colocación de pulsera identificativa</td></tr>
          <tr><td><b>Efecto</b></td><td>¿Qué pasaría?</td><td>Error de identidad, confusión en pruebas o medicación</td></tr>
          <tr><td><b>Causa</b></td><td>¿Por qué?</td><td>Rutina interrumpida, recursos saturados</td></tr></table></div>
          <div class="box box--trampa"><span class="box-tag">Ojo, trampa</span><p>El error más frecuente es escribir una <b>causa</b> como fallo («sobrecarga asistencial», «falta de formación») o un <b>efecto</b> como fallo («daño al paciente», «riesgo de caída»). La app avisa cuando lo detecta.</p></div>` },
        { t: "Diagrama de Ishikawa y los porqués", h: `<p>Para buscar causas, el <b>diagrama de espina de pescado</b> ordena las posibles causas en categorías: personas, métodos, equipos, materiales, entorno y organización. En cada una se pregunta «¿por qué?» hasta llegar a la causa de fondo (normalmente basta con tres veces). No hace falta encontrar causas en todas las categorías.</p>
          <p>En la app, el Ishikawa por fallo llegará en una próxima versión.</p>` }
      ],
      minicaso: `<p>«Falta de formación del personal de triaje» no es un modo de fallo: es una causa. ¿Qué sale mal por esa falta de formación? <b>Fallo</b>: <i>clasificación errónea del nivel de prioridad</i>. <b>Efecto</b>: <i>retraso en la atención y progresión del cuadro</i>. <b>Causa</b>: <i>subestimación de signos vitales alterados, falta de formación, presión asistencial</i>.</p>`,
      practica: { texto: "Analizar los fallos del ejemplo", href: "#/amfe/ej-amfe-urg/4" } },

    { n: 5, c: "V", titulo: "Gravedad, ocurrencia, detección e IPR", sub: "Puntuar con la misma escala y entender qué significa cada número",
      minuto: [
        "<b>Gravedad</b> (1–10): el daño que causaría el fallo. 10 = discapacidad o muerte.",
        "<b>Ocurrencia</b> (1–10): con qué frecuencia puede pasar. 10 = casi siempre.",
        "<b>Detección</b> (1–10): <b>al revés</b>. 1 = se detecta casi seguro antes de causar daño; 10 = casi imposible de detectar.",
        "<b>IPR = G × O × D</b>, de 1 a 1.000. Cuanto mayor, antes hay que actuar."],
      secciones: [
        { t: "Las escalas del curso", h: `<div class="table-wrap"><table class="mini facil-tabla"><tr><th></th><th>Gravedad</th><th>Ocurrencia</th><th>Detección</th></tr>
          <tr><td><b>1–2</b></td><td>Sin efecto o muy leve</td><td>Casi nunca, improbable</td><td>Fácilmente detectable</td></tr>
          <tr><td><b>3–4</b></td><td>Leve, intervención menor</td><td>Ocurre raramente</td><td>Detectable con facilidad</td></tr>
          <tr><td><b>5–6</b></td><td>Moderado, puede requerir hospitalización</td><td>Ocurre ocasionalmente</td><td>Detectable con esfuerzo moderado</td></tr>
          <tr><td><b>7–8</b></td><td>Mayor, puede causar daño permanente</td><td>Ocurre con frecuencia</td><td>Difícil de detectar</td></tr>
          <tr><td><b>9–10</b></td><td>Serio, discapacidad o muerte</td><td>Casi siempre</td><td>Casi imposible de detectar</td></tr></table></div>
          <p>Las escalas tienen que ser <b>conocidas y consensuadas</b> por todo el equipo. Cada valor puede salir de la <b>media de las votaciones</b> de los miembros.</p>` },
        { t: "Cómo se calcula el IPR", h: `<div class="formula">IPR = G × O × D</div>
          <p>Ejemplo del curso: un fármaco equivocado (gravedad 9) que ocurre con frecuencia por confusión de envases (ocurrencia 7) y sin verificación eficaz (detección 8) tiene un IPR de 9 × 7 × 8 = <b>504</b>.</p>` },
        { t: "Trampas al puntuar", h: `<div class="box box--trampa"><span class="box-tag">Ojo, trampa</span><p><b>La detección va al revés</b> que las otras dos. Un fallo que nadie descubre a tiempo es más peligroso: puntúa alto.</p></div>
          <ul><li>Puntuar todo «en el centro» (5-5-5) suele ser falta de información, no acuerdo.</li><li>Usad los datos que tengáis: notificaciones de incidentes, quejas, auditorías.</li><li>Antes de puntuar la detección, mirad qué controles existen hoy.</li></ul>` }
      ],
      minicaso: `<p>En Urgencias, <i>omisión de constantes clave o mal registro</i> en triaje: gravedad 7, ocurrencia 7, detección 7. IPR = <b>343</b>, el primero de los 49 fallos. <i>Clasificación errónea del nivel de prioridad</i>: 8 × 7 × 6 = <b>336</b>, el segundo.</p>`,
      practica: { texto: "Puntuar el ejemplo", href: "#/amfe/ej-amfe-urg/5" } },

    { n: 6, c: "V", titulo: "Priorizar: IPR y matriz de riesgos", sub: "No se puede actuar sobre todo a la vez",
      minuto: [
        "Se ordenan los fallos por <b>IPR</b> y se eligen los primeros (en el curso, los <b>15</b> de mayor IPR).",
        "La <b>matriz de riesgos</b> coloca cada fallo según su gravedad y su ocurrencia, con zonas de colores (verde, amarillo, naranja, rojo).",
        "Un fallo con <b>gravedad 9–10</b> merece atención aunque su IPR no sea de los primeros.",
        "Marcar un fallo como «<b>crítico</b>» lo sube a prioritario, pero usarlo mucho distorsiona la jerarquía."],
      secciones: [
        { t: "La matriz de riesgos", h: `<p>El eje vertical es la gravedad y el horizontal, la ocurrencia. Los fallos con gravedad y ocurrencia altas caen arriba a la derecha: la zona de mayor riesgo. La matriz no sustituye al IPR (no tiene en cuenta la detección), pero <b>comunica el riesgo de un vistazo</b>.</p>
          <p>Las zonas del curso: verde, riesgo bajo (aceptable); amarillo, moderado (vigilar); naranja, alto (intervenir); rojo, muy alto (intervenir ya).</p>` },
        { t: "El fallo «crítico»", h: `<p>Algunos sistemas añaden una marca Sí/No de <b>criticidad</b>: un fallo crítico pasa a los primeros puestos aunque su IPR sea bajo. Puede estar justificado (un evento centinela, una exigencia normativa), pero si se abusa de ella la priorización deja de ser objetiva. Escribid siempre el motivo.</p>
          <p>En la app, la priorización y la matriz llegan en la próxima versión.</p>` }
      ],
      minicaso: `<p>De los 49 fallos de Urgencias, los 15 de mayor IPR van de 343 a 180. En la matriz quedan en las zonas naranja y amarilla: gravedad 6–8 y ocurrencia 6–7. Ninguno cae en la zona roja, pero ninguno es aceptable.</p>`,
      practica: { texto: "Ver el orden por IPR del ejemplo", href: "#/amfe/ej-amfe-urg/5" } },

    { n: 7, c: "A", titulo: "Acciones de mejora y reevaluación", sub: "El AMFE termina cuando el riesgo baja",
      minuto: [
        "Para cada fallo prioritario, una acción con <b>5W1H</b>: qué, por qué, dónde, cuándo, quién y cómo.",
        "Una buena acción es <b>específica</b> (ataca la causa), <b>factible</b>, <b>medible</b>, <b>sostenible</b> y <b>aceptable</b> para el equipo.",
        "Tipos: cambios en procedimientos, formación, tecnología y cambios organizativos. Las que cambian el sistema son más fuertes que «formar» o «recordar».",
        "Después se vuelve a puntuar (<b>IPR residual</b>) y se revisa el AMFE periódicamente."],
      secciones: [
        { t: "Corrección, acción correctora y acción preventiva", h: `<ul><li><b>Corrección</b>: arreglar el fallo en el momento en que ocurre.</li><li><b>Acción correctora</b>: eliminar la causa para que no se repita.</li><li><b>Acción preventiva</b>: eliminar un riesgo antes de que llegue a ocurrir.</li></ul>
          <p>Las acciones correctoras y preventivas son las <b>acciones de mejora</b>.</p>` },
        { t: "Medir y volver a puntuar", h: `<p>Cada acción necesita un <b>indicador</b> con su <b>estándar</b> (por ejemplo, «% de triajes con las cuatro constantes registradas», estándar ≥ 95 %). Las auditorías comprueban después si se aplica.</p>
          <p>Una acción suele bajar la <b>ocurrencia</b> o mejorar la <b>detección</b>; la <b>gravedad</b> del daño casi nunca cambia si no se cambia el proceso.</p>
          <p>En la app, las acciones y la reevaluación llegan en una próxima versión.</p>` }
      ],
      minicaso: `<p>Para <i>omisión de constantes clave en triaje</i> (IPR 343): <b>qué</b>, checklist digital obligatorio antes de cerrar el triaje (TA, FC, SatO₂ y temperatura); <b>por qué</b>, para una valoración inicial completa y homogénea; <b>dónde</b>, puesto de triaje; <b>cuándo</b>, en 1 mes; <b>quién</b>, supervisión de enfermería de Urgencias; <b>cómo</b>, configuración en el módulo de triaje, sesiones formativas y supervisión semanal.</p>`,
      practica: { texto: "Ver el ejemplo de Urgencias", href: "#/amfe/ej-amfe-urg/1" } }
  ];

  // ---------- Glosario ----------
  const GLOSARIO = [
    ["AMFE", "Análisis Modal de Fallos y Efectos. Método proactivo para encontrar qué puede fallar en un proceso, qué pasaría y por qué, y priorizar dónde actuar."],
    ["Proceso", "Conjunto de actividades relacionadas que transforman unas entradas en un resultado para el paciente."],
    ["Subproceso", "Fase de un proceso con un inicio, un fin y unos roles claros. El AMFE se hace subproceso a subproceso."],
    ["Punto crítico", "Momento del proceso en el que puede producirse un fallo con impacto en la seguridad del paciente."],
    ["Modo de fallo", "Forma concreta en que algo puede salir mal en un paso del proceso. Responde a «¿qué falla?»."],
    ["Efecto", "Consecuencia del fallo si ocurre, en el paciente, el proceso o el sistema. Responde a «¿qué pasaría?»."],
    ["Causa", "Razón por la que puede ocurrir el fallo: humana, técnica, organizativa o del entorno. Responde a «¿por qué?»."],
    ["Controles actuales", "Lo que ya existe hoy para evitar el fallo o detectarlo a tiempo: protocolos, dobles chequeos, alertas, listas de verificación."],
    ["Gravedad (G)", "Daño que causaría el fallo, de 1 (ninguno) a 10 (discapacidad o muerte)."],
    ["Ocurrencia (O)", "Probabilidad o frecuencia del fallo, de 1 (casi nunca) a 10 (casi siempre)."],
    ["Detección (D)", "Facilidad para descubrir el fallo antes de que cause daño. Va al revés: 1 = casi seguro que se detecta; 10 = casi imposible."],
    ["IPR", "Índice de Prioridad de Riesgo = gravedad × ocurrencia × detección (de 1 a 1.000). Cuanto mayor, antes hay que actuar."],
    ["IPR residual", "El IPR que queda después de aplicar las acciones de mejora. Sirve para comprobar cuánto ha bajado el riesgo."],
    ["Matriz de riesgos", "Cuadro de gravedad (vertical) por ocurrencia (horizontal) con zonas de colores, donde se coloca cada fallo. También se llama parrilla de priorización."],
    ["Parrilla de priorización", "Herramienta visual para clasificar los fallos según su gravedad, ocurrencia y detección. En el curso, la matriz de riesgos."],
    ["Fallo crítico", "Marca Sí/No que sube un fallo a prioritario aunque su IPR sea bajo. Hay que justificarla y no abusar de ella."],
    ["Lluvia de ideas", "Técnica de grupo para generar muchas ideas en poco tiempo sin criticarlas."],
    ["Técnica de grupo nominal", "Técnica estructurada: cada persona piensa en silencio, se ponen las ideas en común y se votan de forma individual para priorizarlas."],
    ["Diagrama de Ishikawa", "Diagrama de espina de pescado que ordena las posibles causas de un problema en categorías (personas, métodos, equipos, materiales, entorno, organización)."],
    ["5 porqués", "Preguntar «¿por qué?» varias veces seguidas para llegar de la causa aparente a la causa de fondo."],
    ["5W1H", "Plantilla para definir una acción: qué (what), por qué (why), dónde (where), cuándo (when), quién (who) y cómo (how)."],
    ["Corrección", "Acción inmediata para resolver un fallo en el momento en que ocurre."],
    ["Acción correctora", "Medida para eliminar la causa de un fallo y evitar que se repita."],
    ["Acción preventiva", "Medida planificada para eliminar un riesgo antes de que llegue a ocurrir."],
    ["Indicador", "Medida que permite comprobar si una acción se aplica y funciona (por ejemplo, % de triajes con las constantes registradas)."],
    ["Estándar", "Valor del indicador que se considera aceptable (por ejemplo, ≥ 95 %)."],
    ["Mapa de Riesgos", "Representación de los riesgos de un proceso sobre su flujograma, con los fallos priorizados por el AMFE y sus acciones."],
    ["Análisis de causa raíz", "Método reactivo para investigar un incidente ya ocurrido y encontrar sus causas de fondo. El AMFE, en cambio, es proactivo."]
  ];

  // ---------- Ejemplo completo: Urgencias (Documento Final del curso) ----------
  const SUBS_URG = [
    ["Recepción y registro administrativo", "Registro inicial y verificación de datos del paciente.", "Llegada del paciente al mostrador de admisión", "Derivación al triaje", "Administrativa, paciente, acompañante"],
    ["Triaje de enfermería", "Evaluación clínica inicial y asignación de prioridad.", "Recepción por parte de enfermería de triaje", "Derivación a sala de espera", "Enfermera de triaje"],
    ["Estancia en sala de espera", "Permanencia del paciente hasta la atención clínica.", "Entrada en sala de espera", "Llamada a consulta médica", "TCAE, celador, paciente"],
    ["Valoración médica inicial", "Exploración y toma de decisiones clínicas preliminares.", "Entrada a consulta médica", "Solicitud de pruebas diagnósticas", "Médico, paciente"],
    ["Pruebas diagnósticas y traslado", "Realización y retorno de los estudios solicitados.", "Salida de la consulta para pruebas", "Regreso a box o área de observación", "Celador, técnico de rayos, enfermería, paciente"],
    ["Comunicación de resultados y decisión final", "Valoración de pruebas y decisión terapéutica.", "Disponibilidad de resultados clínicos", "Decisión de ingreso, alta o derivación", "Médico"],
    ["Gestión del ingreso", "Preparación y formalización del ingreso hospitalario.", "Confirmación del ingreso por parte del médico", "Salida del paciente hacia planta", "Médico, enfermería, administrativo, celador"]
  ];
  // Equipo del ejercicio 9 (solo perfiles: sin nombres)
  const EQUIPO_URG = [
    ["Médico/a de Urgencias", "Facultativo responsable de guardia", "coordinador", "Visión clínica integral del proceso, toma de decisiones médicas y conocimiento global del funcionamiento del servicio."],
    ["Enfermero/a de Urgencias", "Supervisor/a o referente de turno", "referente", "Conocimiento detallado del flujo asistencial, cuidados y protocolos. Aporta experiencia sobre la operativa diaria."],
    ["Técnico/a en Cuidados Auxiliares de Enfermería (TCAE)", "TCAE del área de observación", "operativo", "Identifica riesgos asociados a la movilización, higiene y apoyo directo al paciente."],
    ["Celador/a", "Celador de guardia", "miembro", "Aporta la perspectiva de los traslados y la accesibilidad física del paciente dentro del servicio."],
    ["Administrativo/a de Admisión", "Administrativo/a de Urgencias", "miembro", "Apunta riesgos del registro inicial, la identificación y la gestión documental."],
    ["Farmacéutico/a Hospitalario", "Referente de conciliación en Urgencias", "experto", "Su visión es esencial para detectar fallos relacionados con la medicación y la conciliación farmacológica."],
    ["Médico/a de Medicina Interna", "Médico/a de interconsulta frecuente", "externo", "Aporta una mirada externa y transversal desde otra especialidad que colabora habitualmente con Urgencias."],
    ["Técnico/a de Calidad", "Técnico de Calidad del hospital", "secretario", "Organiza, registra y estructura las sesiones. Asegura el uso correcto de la metodología AMFE."],
    ["Enfermero/a de Triaje", "Enfermero/a con formación específica en triaje", "miembro", "Identifica riesgos críticos del proceso inicial de clasificación y priorización."],
    ["Responsable de Seguridad del Paciente", "Coordinador/a de Seguridad del Área", "metodologico", "Supervisa el análisis desde la perspectiva de la seguridad del paciente y garantiza la trazabilidad del proceso de mejora."]
  ];
  // [nº, subproceso (índice en SUBS_URG), fallo, efecto, causa, G, O, D] · ejercicio 11 resuelto
  const FALLOS_URG = [
    [1, 0, "Registro incorrecto del nombre o apellidos del paciente", "Errores en la historia clínica, duplicación, retrasos", "Error tipográfico no corregido, alta carga asistencial", 5, 5, 4],
    [2, 0, "No identificación del paciente mediante DNI o tarjeta", "Error de identidad, mezcla de historiales", "Proceso no protocolizado o no exigido en todos los turnos", 6, 4, 6],
    [3, 0, "Omisión de datos clínicos relevantes (alergias, medicación)", "Falta de información crítica para el triaje y atención médica", "No recogida sistemática, desconocimiento de la importancia", 7, 6, 5],
    [4, 0, "No se registra acompañante o contacto", "Imposibilidad de recabar información en caso de urgencia", "Falta de campo obligatorio o rutina en el sistema informático", 5, 5, 4],
    [5, 0, "El sistema no alerta de antecedentes clínicos relevantes", "Riesgo en atención inicial por falta de alertas previas", "Historia clínica fragmentada, mal interoperada o sin codificación", 7, 6, 7],
    [6, 0, "No se valida el centro de salud de referencia", "Pérdida de continuidad asistencial", "Omisión del campo o proceso automatizado no verificado", 4, 3, 3],
    [7, 0, "Falta de protocolo ante paciente frágil", "No se activa circuito preferente ni seguimiento específico", "Desconocimiento del riesgo o falta de cribado geriátrico inicial", 6, 6, 6],
    [8, 1, "Clasificación errónea del nivel de prioridad", "Retraso en la atención, progresión del cuadro clínico", "Subestimación de signos vitales alterados, presión asistencial", 8, 7, 6],
    [9, 1, "No detección de paciente frágil o con deterioro cognitivo", "Pérdida de oportunidad de atención prioritaria y acompañamiento", "Falta de cribado geriátrico, comunicación deficiente", 7, 6, 6],
    [10, 1, "Omisión de constantes clave o mal registro", "Asignación incorrecta de prioridad, fallo en alerta de sepsis", "Automatización excesiva, omisión por prisa", 7, 7, 7],
    [11, 1, "No colocación de pulsera identificativa", "Riesgo de error de identidad, confusión en pruebas o medicación", "Rutina interrumpida, recursos saturados", 6, 6, 5],
    [12, 1, "No revisión de medicación habitual o tratamiento activo", "Fallo en conciliación posterior o detección de interacciones", "No integración enfermería–médico en fase de triaje", 6, 5, 5],
    [13, 1, "No documentación de contacto acompañante relevante", "Dificultad para recabar historia clínica real", "Se asume presencia ocasional, no protocolizado", 5, 4, 3],
    [14, 1, "Falta de priorización del malestar subjetivo del paciente", "Desatención percibida, riesgo de descompensación por estrés", "Focalización en datos objetivos, falta de escucha activa", 4, 5, 4],
    [15, 2, "Espera prolongada sin reevaluación clínica", "Empeoramiento del estado sin detección", "Saturación del servicio, falta de protocolos de vigilancia activa", 7, 7, 6],
    [16, 2, "Falta de acompañamiento o supervisión", "Riesgo de caídas, desorientación o ansiedad", "Recursos humanos limitados, paciente frágil sin alerta de riesgo", 6, 6, 6],
    [17, 2, "Falta de control térmico/ambiental", "Incomodidad, hipo/hipertermia, estrés añadido", "Problemas estructurales o falta de monitorización", 4, 5, 4],
    [18, 2, "No identificación visual del paciente (sin pulsera)", "Error de citación, traslado o intervención", "Omisión inicial de identificación, pérdida durante la espera", 6, 6, 5],
    [19, 2, "Pérdida de pertenencias o ayudas técnicas", "Dificultad para comunicarse o desplazarse", "Entorno desorganizado, falta de seguimiento del paciente vulnerable", 4, 4, 4],
    [20, 2, "Falta de comunicación sobre tiempos estimados", "Ansiedad, percepción negativa de la atención", "Comunicación deficiente, falta de circuitos informativos", 3, 5, 3],
    [21, 2, "Peticiones no atendidas (baño, agua, información)", "Deshidratación, frustración, malestar físico y emocional", "Alta ocupación, roles no definidos, ausencia de atención humanizada", 5, 5, 5],
    [22, 3, "Anamnesis incompleta por falta de información del paciente", "Diagnóstico inexacto o incompleto", "Ausencia de familiar acompañante, paciente con deterioro cognitivo", 6, 6, 5],
    [23, 3, "No conciliación de medicación habitual", "Interacciones, duplicidades o errores de tratamiento", "Falta de tiempo, no consultar historia previa o base de datos farmacológica", 7, 6, 6],
    [24, 3, "Exploración física superficial o apresurada", "Omisión de signos relevantes", "Sobrecarga asistencial, fatiga profesional", 6, 5, 5],
    [25, 3, "No valoración del contexto social o funcional del paciente", "Decisiones clínicas inadecuadas a su perfil o vulnerabilidad", "Foco exclusivo en lo biomédico", 5, 4, 5],
    [26, 3, "Fallo en la solicitud de pruebas necesarias", "Retrasos en diagnóstico o pruebas repetidas", "Falta de experiencia o coordinación", 5, 4, 4],
    [27, 3, "No introducción en el sistema de diagnósticos o alertas clave", "Pérdida de trazabilidad del caso, errores posteriores", "Desorganización, fallos informáticos o falta de formación", 6, 5, 5],
    [28, 3, "No comunicación efectiva con enfermería", "Descoordinación en cuidados, retrasos en procedimientos", "Trabajo en paralelo sin briefing ni comunicación estructurada", 5, 5, 4],
    [29, 4, "Pérdida o no colocación de la pulsera identificativa", "Riesgo de error en la realización de pruebas a paciente equivocado", "Omisión previa en triaje o retirada accidental no detectada", 7, 6, 7],
    [30, 4, "Confusión de camillas al volver de pruebas", "Error de localización o atención a paciente erróneo", "Falta de etiquetado visible, desorganización en pasillos o boxes", 6, 6, 6],
    [31, 4, "Retraso excesivo en el transporte", "Atraso en pruebas, deterioro clínico no monitorizado", "Falta de celadores, priorización deficiente de traslados", 6, 5, 5],
    [32, 4, "Traslado sin información clínica mínima al técnico", "Pruebas mal orientadas o incompletas", "Desconexión entre médico prescriptor y personal técnico", 5, 4, 4],
    [33, 4, "Prueba no realizada por fallo de citación o duplicidad", "Repetición innecesaria, demora en diagnóstico", "Errores administrativos, confusión entre nombres similares", 5, 4, 3],
    [34, 4, "Paciente vulnerable sin acompañamiento funcional", "Riesgo de caída, desorientación o ansiedad", "No identificación de situación de fragilidad", 6, 5, 5],
    [35, 4, "Resultados no comunicados adecuadamente al médico", "Omisión en la toma de decisiones o retraso clínico", "Falta de integración entre sistemas informáticos o interrupciones en flujo", 6, 5, 6],
    [36, 5, "No revisión o interpretación incompleta de resultados", "Diagnóstico erróneo o retrasado", "Saturación, distracciones, falta de seguimiento", 7, 6, 6],
    [37, 5, "No integración de datos clínicos previos y actuales", "Toma de decisiones descontextualizada", "Falta de tiempo, historia clínica dispersa, desconocimiento del paciente", 6, 6, 5],
    [38, 5, "No comunicación al paciente o familiar", "Ansiedad, desinformación, resistencia a tratamiento", "Pérdida de oportunidad, falta de cultura comunicativa", 6, 5, 5],
    [39, 5, "Comunicación técnica no adaptada al nivel del paciente", "Incomprensión del diagnóstico, mal cumplimiento posterior", "Déficit en habilidades de comunicación clínica", 5, 4, 4],
    [40, 5, "Falta de registro de la información comunicada", "Imposibilidad de verificar que se ha informado al paciente", "Omisión de anotación en historia clínica", 4, 4, 3],
    [41, 5, "Decisión médica sin valorar situación funcional/social", "Tratamiento o ingreso inadecuado a su situación global", "No integración del modelo biopsicosocial", 6, 5, 5],
    [42, 5, "No participación del paciente en la decisión", "Rechazo posterior, pérdida de adherencia, conflicto ético", "Cultura paternalista, falta de tiempo o presión asistencial", 5, 5, 4],
    [43, 6, "Demora prolongada en encontrar cama disponible", "Empeoramiento del estado clínico, descompensación", "Saturación hospitalaria, falta de planificación anticipada", 6, 6, 6],
    [44, 6, "Ubicación provisional no monitorizada", "Falta de seguimiento, pérdida de oportunidad terapéutica", "Recursos insuficientes, decisiones transitorias que se prolongan", 6, 5, 5],
    [45, 6, "Falta de coordinación entre urgencias y planta receptora", "Omisión de datos importantes, duplicación o discontinuidad asistencial", "Comunicación incompleta, registros no compartidos, traslado precipitado", 7, 6, 6],
    [46, 6, "No traslado de documentación clínica actualizada", "Riesgos de errores en tratamiento o cuidados", "Falta de impresión, sistemas no interoperables, protocolo ineficaz", 6, 5, 5],
    [47, 6, "No identificación clara del responsable del ingreso", "Tareas no asignadas, retrasos o pérdidas de información", "Ambigüedad en circuitos o turnos cambiantes sin traspaso efectivo", 5, 4, 4],
    [48, 6, "Ingreso sin valoración funcional del paciente", "Asignación a unidad inadecuada", "Desconocimiento del perfil del paciente, presión para agilizar ingresos", 6, 5, 4],
    [49, 6, "Ausencia de notificación al familiar sobre ingreso", "Confusión, falta de pertenencias, retraso en cuidados básicos", "Omisión del contacto de referencia, fallo en comunicación", 5, 4, 4]
  ];
  // Controles actuales: el caso del curso no los trae; se han añadido para el ejemplo en los 15 de mayor IPR
  const CONTROLES_URG = {
    10: "Registro de constantes en el módulo de triaje, sin obligación de completarlas para cerrarlo.",
    8: "Sistema de triaje estructurado de cinco niveles; no se revisa después la clasificación.",
    5: "Consulta manual de la historia clínica cuando hay tiempo; el sistema no genera alertas.",
    15: "Reevaluación solo si el paciente o su acompañante avisan; sin tiempos fijados.",
    29: "Protocolo de identificación con pulsera; no se comprueba al volver de pruebas.",
    9: "Preguntas generales en el triaje; no se usa ninguna escala de fragilidad.",
    23: "Consulta de la receta electrónica a criterio de cada médico.",
    36: "Aviso de resultados disponibles en la estación clínica.",
    45: "Llamada telefónica a la planta e informe de enfermería al trasladar.",
    7: "Ninguno específico.",
    16: "Vigilancia visual de la sala por la TCAE cuando sus tareas lo permiten.",
    30: "Identificación verbal del paciente al volver al box.",
    43: "Gestión de camas por la supervisión de guardia.",
    3: "Se pregunta por alergias en admisión, pero no de forma sistemática.",
    11: "Protocolo de identificación e impresora de pulseras en el triaje."
  };
  function amfeUrgencias() {
    const subs = SUBS_URG.map(([nombre, descripcion, inicio, fin, roles], i) => ({ id: "ej-urg-s" + (i + 1), nombre, descripcion, inicio, fin, roles, color: String(i) }));
    const equipo = EQUIPO_URG.map(([perfil, cargo, rol, justificacion], i) => ({ id: "ej-urg-m" + (i + 1), perfil, cargo, rol, justificacion, nombre: "" }));
    const todos = equipo.map(m => m.id);
    return {
      id: "ej-amfe-urg", titulo: "Atención integral en Urgencias", proceso: "Atención integral en el Servicio de Urgencias", unidad: "Servicio de Urgencias hospitalarias",
      objetivo: "Garantizar la atención segura, eficaz y continua del paciente que acude al servicio de urgencias hospitalarias, desde su llegada hasta la decisión final sobre su destino, respetando criterios clínicos, organizativos y de calidad asistencial.",
      inicio: "Llegada del paciente al mostrador de admisión", fin: "Decisión final sobre su destino (alta, ingreso o derivación) y salida hacia planta si ingresa",
      incluye: "Los siete subprocesos de la atención en Urgencias, desde la admisión hasta la salida hacia planta.", excluye: "La atención antes de llegar al hospital y la estancia en planta después del ingreso.",
      responsable: "Coordinación de Calidad y Seguridad del Paciente", fecha: "Octubre–noviembre 2025",
      subprocesos: subs, equipo,
      sesiones: [
        { id: "ej-urg-x1", fecha: "2025-10-07", actividad: "Lectura del caso y análisis del proceso", duracion: "2 h", asistentes: todos.slice(), resultados: "Identificación de los 7 subprocesos y de sus puntos críticos" },
        { id: "ej-urg-x2", fecha: "2025-10-21", actividad: "Lluvia de ideas y técnica de grupo nominal", duracion: "2 h", asistentes: todos.slice(), resultados: "Identificación consensuada de 49 fallos potenciales" },
        { id: "ej-urg-x3", fecha: "2025-11-04", actividad: "Asignación de escalas G-O-D y cálculo del IPR", duracion: "2 h", asistentes: todos.slice(), resultados: "Priorización de los fallos según su criticidad e impacto en el proceso" }
      ],
      fallos: FALLOS_URG.map(([num, s, fallo, efecto, causa, g, o, d]) => ({ id: "ej-urg-f" + num, num, subprocesoId: subs[s].id, fallo, efecto, causa, controles: CONTROLES_URG[num] || "", g: String(g), o: String(o), d: String(d) })),
      escalas: null,
      notas: "Ejemplo basado en el Documento Final del Mapa de Riesgos de Urgencias. Los controles actuales no están en el caso original: se han añadido para el ejemplo en los 15 fallos de mayor IPR.",
      creado: "2025-11-04T12:00:00.000Z", modificado: "2025-11-04T12:00:00.000Z"
    };
  }

  const EJEMPLOS = {
    amfes: [amfeUrgencias()],
    fichas: [
      { t: "1 · El proceso", s: "7 subprocesos con su inicio, fin y roles", href: "#/amfe/ej-amfe-urg/1" },
      { t: "2 · El equipo", s: "10 perfiles y 3 sesiones de trabajo", href: "#/amfe/ej-amfe-urg/2" },
      { t: "4 · Los fallos", s: "49 fallos con su efecto y su causa", href: "#/amfe/ej-amfe-urg/4" },
      { t: "5 · La puntuación", s: "G·O·D e IPR: del 343 al 36", href: "#/amfe/ej-amfe-urg/5" }
    ]
  };

  const API = { TEMAS, GLOSARIO, EJEMPLOS };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.Contenido = API;
})(typeof window !== "undefined" ? window : this);
