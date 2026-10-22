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
          <div class="box box--practica"><span class="box-tag">En la práctica</span><p>En la app, el paso 3 («Encontrar los fallos») recoge las ideas por subproceso, las agrupa en bloques, hace el recuento de votos y pasa las ideas elegidas a fallos con un toque. Con el «modo reunión» se proyecta con letra grande, y la «hoja de trabajo» se imprime para las sesiones presenciales.</p></div>` }
      ],
      minicaso: `<p>Con el caso clínico de Urgencias, un grupo votó 12 bloques de causas. «Identificación del paciente» sumó 11 puntos; «Historia clínica incompleta / fármacos», 6; «Fallos en la detección de sepsis», 5. «No evaluación del riesgo de caída» no recibió ningún voto… pero al comentarlo el grupo reconoció que era un fallo de seguridad estructural.</p>`,
      practica: { texto: "Ver la lluvia de ideas del ejemplo", href: "#/amfe/ej-amfe-urg/3" } },

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
          <p>En la app, cada fallo del paso 4 puede tener su diagrama de Ishikawa con las siete ramas de los ejercicios del curso (personal, procedimiento, entorno, equipamiento, comunicación, paciente y organización). Marca las causas de fondo y pásalas a la columna «causa» con un botón.</p>` }
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
          <p>En la app, el paso 6 propone los 15 de mayor IPR (o un umbral), señala los de gravedad 9–10 y deja marcar los críticos o añadir y quitar fallos a mano, siempre con su motivo.</p>` }
      ],
      minicaso: `<p>De los 49 fallos de Urgencias, los 15 de mayor IPR van de 343 a 180. En la matriz quedan en las zonas naranja y amarilla: gravedad 6–8 y ocurrencia 6–7. Ninguno cae en la zona roja, pero ninguno es aceptable.</p>`,
      practica: { texto: "Ver la priorización del ejemplo", href: "#/amfe/ej-amfe-urg/6" } },

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
          <p>En la app, el paso 7 recoge cada acción con su 5W1H, su tipo, su fuerza y su indicador, y el paso 8 calcula el IPR residual y genera el informe AMFE en Word y PDF.</p>` }
      ],
      minicaso: `<p>Para <i>omisión de constantes clave en triaje</i> (IPR 343): <b>qué</b>, checklist digital obligatorio antes de cerrar el triaje (TA, FC, SatO₂ y temperatura); <b>por qué</b>, para una valoración inicial completa y homogénea; <b>dónde</b>, puesto de triaje; <b>cuándo</b>, en 1 mes; <b>quién</b>, supervisión de enfermería de Urgencias; <b>cómo</b>, configuración en el módulo de triaje, sesiones formativas y supervisión semanal.</p>`,
      practica: { texto: "Ver las acciones del ejemplo", href: "#/amfe/ej-amfe-urg/7" } }
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

  // ---------- Ponte a prueba ----------
  // Las 15 preguntas de los temas 2 (Herramientas), 4 (AMFE I) y 5 (AMFE II) del test de conocimientos del curso, con su justificación.
  // t = tema del curso; ok = índice de la opción correcta (las opciones se barajan de forma estable al mostrarlas)
  const TEMAS_TEST = { 2: { nom: "Herramientas", aprende: 3 }, 4: { nom: "AMFE I: el análisis", aprende: 4 }, 5: { nom: "AMFE II: priorizar y mejorar", aprende: 6 } };
  const TEST = [
    { t: 2, q: "¿Cuál de las siguientes se considera una herramienta básica para la mejora de procesos en Seguridad del Paciente?", o: ["Publicidad en redes sociales del hospital.", "Registro contable anual.", "Mapa de Procesos.", "Encuesta de clima laboral.", "Manual de bienvenida."], ok: 2, e: "El Mapa de Procesos es una herramienta básica para identificar, analizar y priorizar procesos críticos." },
    { t: 2, q: "¿Qué herramienta permite identificar causas raíz de un problema asistencial?", o: ["Diagrama de Ishikawa (causa-efecto).", "Hoja de cálculo financiera.", "Calendario de turnos.", "Protocolos de alta hospitalaria.", "Registro de llamadas."], ok: 0, e: "El Diagrama de Ishikawa o espina de pescado ayuda a analizar causas principales y secundarias de un problema." },
    { t: 2, q: "¿Cuál es el propósito principal del Diagrama de Pareto en calidad asistencial?", o: ["Dividir a los equipos de trabajo.", "Identificar el 80 % de problemas causados por el 20 % de causas clave.", "Validar la satisfacción del paciente.", "Clasificar medicamentos de alto riesgo.", "Planificar vacaciones."], ok: 1, e: "El principio de Pareto muestra que una parte reducida de causas suele generar la mayoría de los problemas." },
    { t: 2, q: "¿Qué herramienta se usa para representar gráficamente un proceso paso a paso?", o: ["Histograma de frecuencias.", "Flujograma.", "Gráfico de barras.", "Checklist de enfermería.", "Diagrama de Gantt."], ok: 1, e: "El flujograma es ideal para representar procesos y facilitar su análisis y mejora." },
    { t: 2, q: "¿Qué ventaja aporta la aplicación de herramientas de análisis en la gestión de riesgos asistenciales?", o: ["Elimina totalmente los riesgos.", "Minimiza la necesidad de formación.", "Permite tomar decisiones basadas en datos objetivos.", "Aumenta la carga burocrática sin beneficios.", "Sustituye la responsabilidad de los profesionales."], ok: 2, e: "Estas herramientas aportan datos que permiten priorizar y tomar decisiones informadas, no eliminan los riesgos al 100 %." },
    { t: 4, q: "¿Qué significa AMFE en el ámbito de la gestión de riesgos sanitarios?", o: ["Análisis Múltiple de Fallos y Errores.", "Análisis Modal de Fallos y Efectos.", "Auditoría Médica de Fallos y Eventos.", "Asociación de Modos de Funcionamiento Eficiente.", "Análisis Metódico de Factores y Eventos."], ok: 1, e: "AMFE es la sigla de Análisis Modal de Fallos y Efectos, una herramienta estructurada para prevenir riesgos." },
    { t: 4, q: "¿Cuál es el principal objetivo de aplicar un AMFE en un proceso sanitario?", o: ["Registrar incidencias informáticas.", "Incrementar la facturación anual.", "Identificar y priorizar posibles fallos antes de que ocurran.", "Sustituir las auditorías externas.", "Elaborar el presupuesto económico del servicio."], ok: 2, e: "El AMFE permite analizar anticipadamente los posibles fallos y priorizar medidas preventivas." },
    { t: 4, q: "¿Qué elemento NO forma parte de la metodología básica de un AMFE?", o: ["Identificar los modos de fallo.", "Evaluar los efectos de cada fallo.", "Calcular la criticidad de cada riesgo.", "Asignar vacaciones a los equipos.", "Proponer acciones de mejora."], ok: 3, e: "Asignar vacaciones no forma parte de la metodología AMFE, que se centra en analizar riesgos y proponer mejoras." },
    { t: 4, q: "¿Qué aspecto se evalúa habitualmente para calcular el índice de criticidad en un AMFE?", o: ["Tiempo de respuesta a reclamaciones.", "Grado de satisfacción de los visitantes.", "Severidad, ocurrencia y detección de cada fallo.", "Ingresos por acto quirúrgico.", "Desempeño financiero del hospital."], ok: 2, e: "Los tres factores clave son severidad, frecuencia (ocurrencia) y capacidad de detección del fallo." },
    { t: 4, q: "¿Qué ventaja principal ofrece el uso del AMFE en procesos sanitarios?", o: ["Elimina por completo todos los riesgos.", "Identifica oportunidades de mejora preventiva y prioriza recursos.", "Garantiza la acreditación externa sin más requisitos.", "Sustituye la responsabilidad de los profesionales.", "Reduce la formación necesaria para el personal."], ok: 1, e: "El AMFE no elimina totalmente los riesgos, pero ayuda a identificarlos y priorizar acciones preventivas." },
    { t: 5, q: "¿Qué significa el “Índice de Criticidad” en un AMFE?", o: ["El número de profesionales que realizan la auditoría.", "El coste económico de implantar una medida preventiva.", "El producto de severidad, ocurrencia y detección de un fallo.", "El tiempo dedicado a reuniones del equipo.", "El grado de satisfacción del paciente."], ok: 2, e: "El índice de criticidad se calcula multiplicando severidad × ocurrencia × detección para priorizar riesgos." },
    { t: 5, q: "¿Qué valor indica mayor prioridad de actuación en un AMFE?", o: ["Un índice de criticidad bajo.", "Un índice de criticidad cercano a cero.", "Un índice de criticidad elevado.", "Cualquier índice da igual.", "El valor que indique la dirección."], ok: 2, e: "A mayor índice de criticidad, mayor prioridad para actuar sobre ese riesgo." },
    { t: 5, q: "¿Qué papel tienen los equipos multidisciplinares en la aplicación del AMFE?", o: ["Ninguno, solo el jefe de servicio debe aplicarlo.", "Solo revisan los resultados finales.", "Son clave para aportar perspectivas distintas sobre el proceso y sus riesgos.", "Se encargan de elaborar los presupuestos.", "Notifican los fallos a Recursos Humanos."], ok: 2, e: "El AMFE se enriquece con la visión de distintos profesionales que conocen bien cada fase del proceso." },
    { t: 5, q: "¿Qué acción debe seguirse tras calcular los índices de criticidad?", o: ["Clasificar los fallos por orden de prioridad y proponer acciones de mejora.", "Finalizar el proceso sin más pasos.", "Repetir la auditoría completa.", "Derivar todo el proceso a un auditor externo.", "Cancelar la implantación del AMFE."], ok: 0, e: "Tras priorizar los fallos, se proponen medidas preventivas o correctoras para reducir los riesgos más críticos." },
    { t: 5, q: "¿Qué beneficio aporta realizar un AMFE de forma periódica?", o: ["Permite detectar nuevos riesgos y comprobar la eficacia de las acciones implantadas.", "Reduce la necesidad de formación del equipo.", "Disminuye la calidad asistencial.", "Elimina la obligación de notificar eventos adversos.", "Sustituye el Plan de Calidad de la unidad."], ok: 0, e: "Un AMFE periódico ayuda a actualizar riesgos y valorar si las mejoras aplicadas funcionan de forma real." }
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
  // Acciones de mejora 5W1H de los ejercicios 13a, 13b y 13c resueltos y del Documento Final (fallos nº 10, 8, 5, 15, 29, 9, 23, 36 y 45).
  // El curso no trae indicador, estándar, estado ni fecha de fin: se han añadido para el ejemplo.
  // [nº, qué, por qué, dónde, plazo, fin, quién, cómo, tipo, clase, actúa sobre, indicador, estándar, fuente, estado]
  const ACCIONES_URG = [
    [10, "Establecer un checklist digital obligatorio antes de cerrar el triaje con los parámetros mínimos: TA, FC, SatO₂ y temperatura", "Para garantizar una valoración inicial completa y homogénea de todos los pacientes", "Puesto de triaje", "1 mes", "2025-12-15", "Supervisora de Enfermería de Urgencias", "Configuración del checklist en el módulo de triaje de la historia digital, sesiones formativas y supervisión semanal", "correctora", "tecnologia", ["o", "d"], "% de triajes con TA, FC, SatO₂ y temperatura registradas", "≥ 95 %", "Módulo de triaje de la historia digital", "verificada"],
    [8, "Implantar una auditoría clínica mensual de triajes con doble revisión y retroalimentación individual", "Para mejorar la calidad y la homogeneidad en la asignación de los niveles de prioridad", "Puesto de triaje", "2 meses", "2026-01-15", "Coordinador médico y Supervisora de Enfermería", "Selección aleatoria de 20 historias al mes, revisión ciega por un profesional experto e informe con los errores detectados y formación orientada", "correctora", "procedimiento", ["o", "d"], "% de triajes con nivel de prioridad concordante en la doble revisión", "≥ 90 %", "Auditoría mensual de triaje", "hecha"],
    [5, "Configurar una alerta visible automática en el campo de admisión para pacientes con antecedentes relevantes registrados en la historia clínica", "Para evitar omisiones críticas en pacientes con patologías relevantes en su atención urgente", "Puesto de admisión", "1 mes", "2025-12-15", "Responsable TIC y Dirección Médica", "Modificación del sistema informático, prueba piloto y formación del personal administrativo", "preventiva", "tecnologia", ["d"], "% de pacientes con antecedentes relevantes en los que salta la alerta en admisión", "≥ 95 %", "Sistema informático de admisión", "hecha"],
    [15, "Implementar reevaluaciones clínicas programadas cada 90 minutos para los pacientes en espera", "Para disminuir los riesgos clínicos en pacientes cuya situación puede agravarse sin control", "Sala de espera del Servicio de Urgencias", "Inmediato, con 1 mes de piloto", "2025-12-01", "Supervisor/a de enfermería de Urgencias", "Modificando el protocolo de espera, asignando un responsable por turno y registrando la reevaluación en la historia clínica", "correctora", "procedimiento", ["o", "d"], "% de pacientes con espera > 90 min con reevaluación registrada", "≥ 90 %", "Historia clínica (registro de reevaluaciones)", "verificada"],
    [29, "Establecer la verificación activa y el doble chequeo de la pulsera antes de salir a pruebas", "Para garantizar la identificación segura en los traslados y evitar errores de identidad", "Box de exploración y área de pruebas", "2 semanas", "2025-11-30", "Personal de enfermería de boxes", "Listado de control obligatorio antes del traslado, formación al personal y auditoría semanal de cumplimiento", "correctora", "procedimiento", ["o", "d"], "% de traslados a pruebas con la pulsera verificada en el listado de control", "100 %", "Listado de control de traslados", "verificada"],
    [9, "Incluir una alerta de fragilidad en el triaje mediante un cuestionario breve y estructurado", "Para prevenir riesgos en pacientes vulnerables que no se detectan al principio", "Puesto de triaje", "1 mes", "2025-12-15", "Profesional de triaje", "Añadiendo ítems al sistema informático de triaje (edad, dependencia, deterioro cognitivo), con formación previa", "preventiva", "tecnologia", ["o", "d"], "% de pacientes de 75 años o más con el cuestionario de fragilidad completado en el triaje", "≥ 90 %", "Módulo de triaje", "hecha"],
    [23, "Implementar un checklist obligatorio de conciliación de la medicación en las primeras indicaciones", "Para evitar interacciones y errores por desconocer la medicación crónica del paciente", "Historia clínica electrónica", "1 mes", "2026-01-31", "Jefe de Urgencias y Responsable de Calidad", "Campo obligatorio en el parte médico inicial, formación breve del personal y auditoría mensual de cumplimiento", "correctora", "tecnologia", ["o", "d"], "% de pacientes con la medicación habitual conciliada en las primeras indicaciones", "≥ 85 %", "Historia clínica electrónica", "curso"],
    [36, "Activar un sistema de alertas del laboratorio ante resultados críticos", "Para reducir las omisiones de resultados importantes y evitar retrasos en la actuación médica", "Sistema informático de resultados del laboratorio", "1 mes", "2025-12-31", "Responsable de Sistemas y Jefe de Urgencias", "Configurando alertas automáticas por valores críticos y verificando que el clínico los ha visto antes del alta", "preventiva", "tecnologia", ["o", "d"], "% de resultados críticos con visualización verificada antes del alta", "100 %", "Sistema de laboratorio", "hecha"],
    [45, "Crear un canal directo de comunicación y un parte de ingreso normalizado entre Urgencias y la planta", "Para minimizar retrasos en la ubicación del paciente y mejorar la continuidad asistencial", "Área de admisión e ingreso y planta hospitalaria", "2 semanas", "2025-12-15", "Supervisor de Urgencias y Supervisor de planta", "Grupo de mensajería institucional y plantilla electrónica compartida con la información clínica relevante para la planta receptora", "correctora", "organizativa", ["o", "d"], "% de ingresos con el parte de ingreso normalizado enviado a la planta", "≥ 95 %", "Registro de ingresos", "pendiente"]
  ];
  // G·O·D esperados tras las acciones (añadidos para el ejemplo; la gravedad no cambia)
  const RESIDUAL_URG = { 10: [7, 4, 3], 8: [8, 5, 4], 5: [7, 6, 3], 15: [7, 5, 4], 29: [7, 3, 4], 9: [7, 4, 4], 23: [7, 4, 4], 36: [7, 5, 3], 45: [7, 4, 5] };
  // Lluvia de ideas del ejercicio 2 resuelto (caso clínico de Urgencias), en los 12 bloques del ejercicio y repartida por subprocesos.
  // [bloque (índice), subproceso (índice), idea, nº del fallo al que se pasó (0 = ninguno)]
  const BLOQUES_URG = [
    ["Identificación del paciente", "Es la base de todo. Sin una correcta identificación puede haber errores en medicación, pruebas, etc."],
    ["Historia clínica incompleta / fármacos", "La falta de información sobre medicación y antecedentes limita la capacidad del clínico para decidir y aumenta el riesgo de errores terapéuticos."],
    ["Fallos en la detección de sepsis", "Las constantes alteradas pasaron desapercibidas. No activar el protocolo de sepsis puede tener consecuencias graves."],
    ["Errores administrativos", "No se ha puntuado, posiblemente por percibirse como menor. Sin embargo, un error en la identificación puede originar fallos en cadena."],
    ["Comunicación clínica ineficaz", "Más de una hora sin supervisión con signos de gravedad: eso no puede pasar desapercibido."],
    ["Omisión del deterioro cognitivo", "A pesar de su baja puntuación, desconocer el estado cognitivo dificultó la valoración y llevó a decisiones inadecuadas."],
    ["Condiciones físicas inadecuadas (frío, ruido…)", "No se ha puntuado, aunque la paciente se quejaba de frío, dolor y ruido. Afecta a su experiencia y puede agravar su estado."],
    ["Falta de registro de información relevante", "Baja puntuación, pero es una condición transversal que impide el seguimiento del caso y la coordinación entre profesionales."],
    ["No evaluación del riesgo de caída", "Ignorado en la votación, pero esencial: la movilidad no valorada y la ayuda prestada por otra paciente muestran un fallo de seguridad estructural."],
    ["No ayuda para necesidades básicas", "No puntuado; sin embargo, que la paciente fuera sola al baño es una señal de alerta."],
    ["Demora y ausencia de reevaluación en espera", "El tiempo prolongado en sala de espera sin reevaluación muestra un fallo organizativo con impacto clínico."],
    ["Errores en el protocolo de pulsera", "La pérdida de la pulsera es una señal de alerta grave que expone a errores de identificación."]
  ];
  const IDEAS_URG = [
    [0, 0, "No se verificó bien la identidad del paciente", 2], [0, 1, "No se colocó la pulsera identificativa", 11], [0, 4, "Confusión de camillas al volver de radiología", 30], [0, 4, "Pérdida de la pulsera de identificación", 29],
    [1, 1, "No se preguntó por su medicación habitual", 12], [1, 0, "Nadie recogió las alergias", 3], [1, 3, "Anamnesis incompleta por no estar presente la hija", 22],
    [2, 1, "No se identificó el riesgo de sepsis con las constantes alteradas", 8], [2, 1, "Constantes alteradas registradas pero no valoradas", 10],
    [3, 0, "No se corrigió el error en el segundo apellido", 1], [3, 0, "Datos administrativos aportados por la vecina sin comprobar", 0],
    [4, 5, "Nadie explicó el plan asistencial a la paciente", 38], [4, 5, "Se le habló demasiado rápido y no entendía", 39], [4, 6, "No sabía si se quedaba ingresada o no", 0],
    [5, 1, "Nadie mencionó su deterioro cognitivo", 9], [5, 4, "No se avisó al celador de su deterioro cognitivo", 32], [5, 0, "El deterioro no figuraba en su ficha", 7],
    [6, 2, "Sala de espera muy fría", 17], [6, 2, "Mucho ruido, difícil descansar", 0],
    [7, 3, "No quedó registrado si llevaba medicación activa", 27],
    [8, 2, "No se evaluó el riesgo de caída pese a la edad y el deterioro", 16],
    [9, 2, "Fue sola al baño sin ayuda disponible", 21], [9, 2, "Otra paciente tuvo que ayudarla", 0],
    [10, 2, "Esperó 75 minutos sin revisión", 15], [10, 2, "Nadie la reevaluó pese a que empeoraba", 0],
    [11, 1, "Se pidió una pulsera nueva pero no se priorizó su colocación", 0]
  ];
  // Votos de la técnica de grupo nominal del ejercicio 3 resuelto (5 personas; 3, 2 y 1 puntos), asignados a los cinco primeros miembros del equipo
  // [miembro (índice), bloque (índice), puntos]
  const VOTOS_URG = [[0, 0, 2], [0, 1, 3], [0, 2, 1], [1, 0, 3], [1, 1, 2], [1, 5, 1], [2, 0, 3], [2, 4, 2], [2, 2, 1], [3, 0, 3], [3, 10, 2], [3, 7, 1], [4, 2, 3], [4, 11, 2], [4, 1, 1]];
  // Votación individual de G·O·D en el fallo nº 10 (añadida para el ejemplo): media 7-7-7, con discrepancia en la detección
  const VOTOS_GOD_URG = { 10: [[0, 7, 7, 9], [1, 8, 7, 7], [2, 6, 8, 5], [3, 7, 6, 7], [4, 7, 7, 7]] };
  // Diagrama de Ishikawa del fallo nº 2 (No identificación del paciente), con las causas del ejercicio 4a resuelto
  // («Identificación del paciente»). Los «porqués» y las causas elegidas se han añadido para el ejemplo. [rama, causa, porqués, elegida]
  const ISHIKAWA_URG = { 2: [
    ["personal", "Presión asistencial que reduce el tiempo para hacer comprobaciones", [], false],
    ["personal", "Omisión del protocolo por rutina o fatiga", ["Turnos largos con mucha presión", "Plantilla ajustada en las horas punta"], true],
    ["personal", "Personal nuevo o en prácticas sin supervisión adecuada", [], false],
    ["procedimiento", "No hay un protocolo obligatorio de identificación al ingreso", ["Cada turno lo hace a su manera", "El protocolo del hospital no se ha adaptado a Urgencias"], true],
    ["procedimiento", "Falta de doble verificación antes de las pruebas diagnósticas", [], false],
    ["entorno", "Zona de admisión con exceso de ruido que impide una comunicación clara", [], false],
    ["entorno", "Iluminación deficiente para leer bien las pulseras o los documentos", [], false],
    ["equipamiento", "Impresora de pulseras fuera de servicio o con errores frecuentes", [], false],
    ["equipamiento", "El sistema informático permite seguir sin confirmar los datos clave", ["No tiene campos obligatorios en admisión"], true],
    ["comunicacion", "No se verifican los datos de viva voz con el paciente", [], false],
    ["comunicacion", "El error detectado (apellido incorrecto) no se comunica ni se corrige", [], false],
    ["paciente", "Deterioro cognitivo que impide verificar sus propios datos", [], false],
    ["paciente", "Sin acompañante habitual que conozca sus datos y antecedentes", [], false],
    ["organizacion", "Falta de cultura institucional de seguridad en la identificación", [], false],
    ["organizacion", "No hay indicadores ni auditorías sobre los errores de identificación", [], false]
  ] };
  // Ejercicio «¿Fallo, efecto o causa?»: frases del AMFE de Urgencias [nº de fallo, columna]
  const EJERCICIO_FEC_URG = [[8, "fallo"], [10, "efecto"], [1, "causa"], [29, "fallo"], [23, "efecto"], [9, "causa"], [15, "fallo"], [36, "efecto"], [30, "causa"], [45, "fallo"], [5, "efecto"], [43, "causa"]];
  // Ejercicio «Puntúa este fallo»: se compara con la puntuación del equipo del curso
  const EJERCICIO_PUNTUA_URG = [10, 29, 6, 23];
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
      fallos: FALLOS_URG.map(([num, s, fallo, efecto, causa, g, o, d]) => {
        const acc = ACCIONES_URG.filter(x => x[0] === num).map(([, que, porque, donde, plazo, fin, quien, como, tipo, clase, actuaSobre, nombre, estandar, fuente, estado], i) => ({ id: `ej-urg-a${num}-${i + 1}`, que, porque, donde, plazo, fin, quien, como, tipo, clase, actuaSobre, indicador: { nombre, formula: "", estandar, fuente }, comprobacion: { especifica: true, factible: true, medible: true, sostenible: estado === "verificada", aceptable: true }, estado, nota: "" }));
        const r = RESIDUAL_URG[num];
        return { id: "ej-urg-f" + num, num, subprocesoId: subs[s].id, fallo, efecto, causa, controles: CONTROLES_URG[num] || "", g: String(g), o: String(o), d: String(d),
          acciones: acc, residual: r ? { g: String(r[0]), o: String(r[1]), d: String(r[2]), fecha: "", nota: "Esperado cuando la acción esté implantada" } : { g: "", o: "", d: "", fecha: "", nota: "" },
          votos: (VOTOS_GOD_URG[num] || []).map(([m, g, o, d]) => ({ miembroId: equipo[m].id, g: String(g), o: String(o), d: String(d) })),
          ishikawa: (ISHIKAWA_URG[num] || []).map(([cat, texto, pq, elegida], i) => ({ id: `ej-urg-k${num}-${i + 1}`, cat, texto, porques: [0, 1, 2].map(j => pq[j] || ""), elegida })) };
      }),
      bloques: BLOQUES_URG.map(([nombre, comentario], i) => ({ id: "ej-urg-b" + (i + 1), nombre, comentario })),
      ideas: IDEAS_URG.map(([b, s, texto, f], i) => ({ id: "ej-urg-i" + (i + 1), subprocesoId: subs[s].id, texto, bloqueId: "ej-urg-b" + (b + 1), falloId: f ? "ej-urg-f" + f : "" })),
      tgn: { modo: "321", votos: VOTOS_URG.map(([m, b, p]) => ({ miembroId: equipo[m].id, bloqueId: "ej-urg-b" + (b + 1), puntos: String(p) })) },
      edicion: "00", anteriorId: "",
      escalas: null,
      conclusiones: "El AMFE ha permitido identificar de forma sistemática 49 fallos potenciales en los 7 subprocesos de la atención en Urgencias y priorizarlos según su gravedad, su ocurrencia y su detección. Los 15 fallos de mayor IPR (de 343 a 180) se concentran en el triaje, la identificación del paciente y la continuidad de la información clínica. Se han propuesto acciones de mejora con responsable, plazo e indicador para los 9 primeros; si funcionan como se espera, su IPR bajaría a menos de la mitad. Estas acciones servirán de base para una auditoría interna de seguimiento, y el AMFE se usará también en la acogida de los nuevos profesionales y en las sesiones de seguridad del paciente.",
      control: {
        elaborado: [{ nombre: "", cargo: "Coordinación de Calidad y Seguridad del Paciente" }, { nombre: "", cargo: "Técnicos de Calidad y Seguridad del Paciente" }],
        revisado: [{ nombre: "", cargo: "Jefatura de Servicio de Urgencias" }],
        aprobado: [{ nombre: "", cargo: "Gerencia del Área de Gestión Sanitaria" }],
        historial: [{ edicion: "00", fecha: "2025-11-04", cambio: "Documento inicial" }]
      },
      proxRevision: "2026-11-04",
      notas: "Ejemplo basado en el Documento Final del Mapa de Riesgos de Urgencias y en los ejercicios resueltos del curso. Se han añadido para el ejemplo los controles actuales de los 15 fallos de mayor IPR y, en las acciones, el indicador, el estándar, el estado, la fecha de fin y la puntuación esperada tras las acciones. Las acciones cubren los 9 fallos que trabajan los ejercicios; quedan 6 prioritarios sin acción para practicar. La lluvia de ideas y la votación del grupo nominal son las de los ejercicios 2 y 3 (votos asignados a cinco miembros del equipo); la votación de G·O·D del fallo nº 10 se ha añadido para el ejemplo. El Ishikawa del fallo nº 2 usa las causas del ejercicio 4a; sus «porqués» se han añadido para el ejemplo.",
      creado: "2025-11-04T12:00:00.000Z", modificado: "2025-11-04T12:00:00.000Z"
    };
  }

  // ---------- Minicasos inventados: AMFE cortos para practicar un paso concreto ----------
  // subs: [nombre, qué se hace, inicio, fin, roles] · equipo: [perfil, cargo, papel]
  // fallos: [subproceso (índice), fallo, efecto, causa, controles, G, O, D] · acciones: { nº: [[qué, por qué, dónde, plazo, quién, cómo, tipo, clase, actúa sobre, indicador, estándar]] }
  // ishikawa: { nº: [[rama, causa, porqués, elegida]] }
  const MINICASOS = [
    { id: "ej-mini-trans", titulo: "Transfusión de sangre", unidad: "Hospitalización médica", paso: 4, foco: "Fallo, efecto y causa, y un diagrama de Ishikawa completo (fallo nº 2).",
      proceso: "Transfusión de concentrados de hematíes en planta", inicio: "La prescripción de la transfusión", fin: "El final de la transfusión y la vigilancia posterior",
      subs: [["Prescripción y solicitud", "Indicación y petición a banco de sangre.", "Decisión médica de transfundir", "Petición enviada", "Médico, hematología"], ["Extracción de la muestra para pruebas cruzadas", "Identificación, extracción y etiquetado.", "Llegada de la petición a planta", "Muestra en el banco de sangre", "Enfermería, celador"], ["Administración", "Comprobación final, transfusión y vigilancia.", "Llegada de la bolsa a planta", "Fin de la vigilancia", "Enfermería, médico"]],
      equipo: [["Hematólogo/a", "Responsable del banco de sangre", "coordinador"], ["Enfermero/a de hospitalización", "Referente de seguridad transfusional", "referente"], ["Técnico/a de laboratorio", "Banco de sangre", "experto"], ["Técnico/a de Calidad", "Unidad de Calidad", "secretario"]],
      fallos: [[0, "Solicitud de transfusión sin indicación documentada", "Transfusión innecesaria con riesgo de reacción", "La petición no pide criterios de indicación", "Revisión por hematología de las peticiones", 6, 4, 4],
        [1, "Muestra de pruebas cruzadas extraída a un paciente distinto", "Reacción hemolítica grave por incompatibilidad ABO", "No se identifica al paciente a pie de cama al extraer", "Etiquetado de los tubos en el control de enfermería", 10, 3, 7],
        [1, "Tubo etiquetado lejos de la cabecera del paciente", "Confusión de muestras entre pacientes", "Etiquetas impresas por adelantado", "Ninguno", 9, 4, 6],
        [2, "No se comprueba la compatibilidad de la bolsa con la pulsera antes de transfundir", "Transfusión de un componente incompatible", "La doble verificación no se exige en turnos con poco personal", "Protocolo de doble verificación", 10, 3, 6],
        [2, "No se vigilan las constantes en los primeros 15 minutos", "Reacción transfusional no detectada a tiempo", "Interrupciones y carga de trabajo", "Hoja de registro de constantes", 8, 5, 5]],
      ishikawa: { 2: [["personal", "Personal eventual que no conoce el protocolo", ["La acogida de los nuevos profesionales es muy breve", "No hay plan de acogida en seguridad transfusional"], true], ["procedimiento", "Los tubos se etiquetan fuera de la habitación", ["El protocolo no exige etiquetar a pie de cama", "El protocolo no se revisa desde hace años"], true], ["entorno", "Interrupciones durante la extracción", [], false], ["equipamiento", "No hay lector de pulseras en planta", ["No se ha incluido en el presupuesto"], true], ["comunicacion", "No se pide al paciente que diga su nombre", [], false], ["paciente", "Paciente desorientado o sedado", [], false], ["organizacion", "Muchas extracciones a la vez en el mismo turno", [], false]] } },
    { id: "ej-mini-med", titulo: "Administración de medicación", unidad: "Medicina Interna", paso: 5, foco: "Puntuar G·O·D: el ejemplo del tema 5 (fármaco equivocado, 9 × 7 × 8 = 504).",
      proceso: "Administración de medicación oral e intravenosa en planta", inicio: "La prescripción médica", fin: "El registro de la administración",
      subs: [["Prescripción", "Indicación de fármaco, dosis, vía y horario.", "Valoración médica", "Prescripción firmada", "Médico"], ["Validación y dispensación", "Revisión farmacéutica y envío a planta.", "Prescripción recibida", "Medicación en el carro", "Farmacia"], ["Preparación y administración", "Preparación, comprobación y registro.", "Hora pautada", "Registro de la dosis", "Enfermería, TCAE"]],
      equipo: [["Médico/a internista", "Facultativo/a de planta", "coordinador"], ["Farmacéutico/a", "Farmacia hospitalaria", "experto"], ["Enfermero/a", "Enfermería de planta", "referente"], ["TCAE", "Auxiliar de planta", "operativo"]],
      fallos: [[2, "Administración de un fármaco equivocado por envases parecidos", "Daño grave por el fármaco incorrecto", "Envases similares guardados juntos en el carro", "Ninguno eficaz: no hay verificación", 9, 7, 8],
        [0, "Prescripción con dosis o unidades ambiguas", "Sobredosis o infradosis", "Prescripción en texto libre", "Validación farmacéutica", 8, 5, 4],
        [1, "No se revisan las alergias antes de dispensar", "Reacción alérgica", "Alergias no registradas en la historia", "Alerta de alergias en el programa de prescripción", 9, 3, 3],
        [2, "Dosis administrada a una hora distinta de la pautada", "Pérdida de eficacia del tratamiento", "Sobrecarga en los pases de medicación", "Registro de administración", 4, 6, 4],
        [2, "No se registra la administración", "Dosis duplicada por el turno siguiente", "Registro en papel al final del turno", "Ninguno", 7, 5, 7]] },
    { id: "ej-mini-const", titulo: "Toma de constantes", unidad: "Hospitalización quirúrgica", paso: 5, foco: "La detección va al revés: el fallo nº 2 tiene D = 2 sin controles escritos y la app avisa.",
      proceso: "Toma y registro de constantes vitales en hospitalización", inicio: "La hora pautada de toma de constantes", fin: "El aviso al médico si hay valores de alarma",
      subs: [["Toma de constantes", "Medición de TA, FC, FR, SatO₂ y temperatura.", "Hora pautada", "Valores medidos", "TCAE, enfermería"], ["Registro", "Anotación en la historia clínica.", "Valores medidos", "Valores registrados", "Enfermería"], ["Aviso al médico", "Comunicación de valores de alarma.", "Valor fuera de rango", "Médico avisado", "Enfermería, médico"]],
      equipo: [["Supervisor/a de enfermería", "Supervisión de planta", "coordinador"], ["Enfermero/a", "Enfermería de planta", "referente"], ["TCAE", "Auxiliar de planta", "operativo"], ["Técnico/a de Calidad", "Unidad de Calidad", "secretario"]],
      fallos: [[0, "No se toman las constantes en el horario pautado", "Deterioro clínico no detectado", "Carga de trabajo en el turno de noche", "Hoja de constantes por paciente", 7, 5, 6],
        [0, "Tensiómetro mal calibrado", "Valores falsos que llevan a decisiones erróneas", "No hay plan de mantenimiento de los aparatos", "", 6, 3, 2],
        [1, "Constantes anotadas en papel y no en la historia", "El médico no ve los valores alterados", "Faltan ordenadores en el control", "Revisión del registro en el pase de planta", 6, 6, 5],
        [2, "No se avisa al médico ante valores de alarma", "Retraso en la atención de un paciente que empeora", "No hay escala de alerta temprana", "Criterio de cada enfermera", 9, 4, 6],
        [2, "Aviso al médico sin la información clave", "Valoración telefónica incompleta", "Comunicación no estructurada", "Ninguno", 6, 5, 5]] },
    { id: "ej-mini-alta", titulo: "Alta hospitalaria", unidad: "Medicina Interna", paso: 6, foco: "Priorizar: con los 3 de mayor IPR, el fallo nº 4 (gravedad 10, IPR 80) queda fuera y la app lo señala.",
      proceso: "Alta hospitalaria y continuidad de cuidados", inicio: "La decisión médica de alta", fin: "La salida del paciente y el aviso a Atención Primaria",
      subs: [["Decisión e informe de alta", "Informe médico y de enfermería.", "Decisión de alta", "Informes firmados", "Médico, enfermería"], ["Conciliación y educación", "Revisión del tratamiento y explicación al paciente.", "Informe disponible", "Paciente informado", "Farmacia, enfermería"], ["Salida y continuidad", "Citas, transporte y aviso al centro de salud.", "Paciente informado", "Salida del hospital", "Administración, enfermería de enlace"]],
      equipo: [["Médico/a internista", "Facultativo/a responsable", "coordinador"], ["Enfermero/a de enlace", "Gestión de casos", "referente"], ["Farmacéutico/a", "Farmacia hospitalaria", "experto"], ["Administrativo/a", "Admisión", "miembro"]],
      prioridad: "3",
      fallos: [[0, "Informe de alta entregado sin la medicación actualizada", "Errores de tratamiento en casa", "Informe redactado con prisa al final de la mañana", "Revisión del informe por el médico responsable", 7, 6, 6],
        [1, "No se concilia la medicación al alta", "Duplicidades o interacciones", "No hay farmacéutico en planta por la tarde", "Ninguno", 7, 6, 5],
        [1, "No se explica al paciente cómo tomar la medicación nueva", "Mala adherencia y reingreso", "Falta de tiempo y de material escrito", "Ninguno", 6, 6, 5],
        [2, "Alta de un paciente anticoagulado sin control programado", "Hemorragia grave o trombosis", "No se cita el control antes de la salida", "Protocolo de anticoagulación", 10, 2, 4],
        [2, "No se comunica el alta al centro de salud", "Pérdida de continuidad asistencial", "Comunicación solo con el informe en papel", "Informe de enfermería al alta", 5, 5, 6]] },
    { id: "ej-mini-anal", titulo: "Analítica urgente", unidad: "Urgencias y laboratorio", paso: 7, foco: "Acciones de mejora: todas son de formación o recordatorios y la app avisa de que son medidas débiles.",
      proceso: "Solicitud y resultado de una analítica urgente", inicio: "La petición médica", fin: "La comunicación del resultado al médico",
      subs: [["Petición", "Solicitud en el programa.", "Decisión médica", "Petición registrada", "Médico"], ["Extracción y envío", "Extracción, etiquetado y traslado al laboratorio.", "Petición registrada", "Muestra en el laboratorio", "Enfermería, celador"], ["Resultado y comunicación", "Análisis, validación y aviso.", "Muestra recibida", "Resultado visto por el médico", "Laboratorio, médico"]],
      equipo: [["Médico/a de Urgencias", "Facultativo/a de guardia", "coordinador"], ["Enfermero/a de Urgencias", "Enfermería de boxes", "referente"], ["Técnico/a de laboratorio", "Laboratorio de urgencias", "experto"], ["Celador/a", "Celador de guardia", "miembro"]],
      prioridad: "3",
      fallos: [[0, "Petición sin marcar como urgente", "Resultado tardío y retraso del diagnóstico", "El programa no destaca la prioridad", "Ninguno", 6, 6, 6],
        [1, "Tubo de muestra equivocado", "Muestra rechazada y nueva extracción", "Tubos parecidos sin guía visual", "Rechazo en el laboratorio", 4, 5, 3],
        [1, "La muestra tarda en llegar al laboratorio", "Retraso en el resultado", "Celador ocupado en otros traslados", "Ninguno", 5, 6, 5],
        [2, "Valor crítico no comunicado al médico", "Retraso en tratar una situación grave", "No hay circuito de aviso de valores críticos", "Visualización en el programa", 9, 3, 7],
        [0, "Analítica pedida a un paciente equivocado", "Decisiones con los resultados de otra persona", "Varios pacientes con nombres parecidos", "Identificación con pulsera", 9, 2, 5]],
      acciones: { 1: [["Sesión de formación sobre cómo marcar las peticiones urgentes", "Para que los resultados urgentes lleguen a tiempo", "Urgencias", "1 mes", "Jefatura de Urgencias", "Sesión de una hora en cada turno", "correctora", "formacion", ["o"], "% de peticiones urgentes marcadas como urgentes", "≥ 95 %"]],
        4: [["Recordar al personal del laboratorio que avise de los valores críticos", "Para que ningún valor crítico pase desapercibido", "Laboratorio", "Inmediato", "Responsable del laboratorio", "Correo informativo y cartel en el laboratorio", "correctora", "formacion", ["d"], "% de valores críticos comunicados en menos de 30 minutos", "100 %"]],
        3: [["Charla de sensibilización a los celadores sobre la prioridad de las muestras", "Para reducir el tiempo de traslado de las muestras urgentes", "Urgencias", "1 mes", "Supervisión de celadores", "Charla de 30 minutos", "correctora", "formacion", ["o"], "Tiempo medio de traslado de muestras urgentes", "≤ 15 min"]] } },
    { id: "ej-mini-quir", titulo: "Preparación de quirófano", unidad: "Bloque quirúrgico", paso: 4, foco: "Redacción: el fallo nº 2 está escrito como una causa («Sobrecarga del personal…») y la app avisa.",
      proceso: "Preparación del quirófano y del paciente antes de la incisión", inicio: "La programación de la intervención", fin: "La verificación antes de la incisión",
      subs: [["Programación", "Parte quirúrgico y documentación.", "Indicación quirúrgica", "Paciente programado", "Cirujano, admisión"], ["Preparación de la sala y el material", "Instrumental, material y equipos.", "Parte del día", "Sala preparada", "Enfermería de quirófano, TCAE"], ["Verificación antes de la incisión", "Lista de verificación quirúrgica.", "Paciente en quirófano", "Inicio de la intervención", "Equipo quirúrgico"]],
      equipo: [["Cirujano/a", "Jefatura de sección", "coordinador"], ["Enfermero/a de quirófano", "Supervisión del bloque", "referente"], ["Anestesiólogo/a", "Anestesia", "experto"], ["Técnico/a de Calidad", "Unidad de Calidad", "secretario"]],
      fallos: [[0, "Paciente programado sin el consentimiento firmado", "Suspensión de la intervención", "No se comprueba en la consulta preanestésica", "Revisión de la documentación el día antes", 5, 4, 3],
        [1, "Sobrecarga del personal de quirófano", "Material incompleto en la sala", "Programación con poco margen entre intervenciones", "Ninguno", 6, 5, 5],
        [1, "Instrumental no estéril por un fallo del ciclo de esterilización", "Infección del sitio quirúrgico", "No se revisa el indicador químico del paquete", "Control del ciclo en la central de esterilización", 9, 2, 5],
        [2, "No se realiza la lista de verificación quirúrgica", "Cirugía en el lado o en el paciente equivocado", "Se considera un trámite cuando hay prisa", "Lista de verificación en papel", 10, 3, 6],
        [2, "No se marca el sitio quirúrgico", "Intervención en el lado equivocado", "No está incluido en el protocolo de la unidad", "Ninguno", 10, 2, 7]] }
  ];
  function miniAmfe(m) {
    const subs = m.subs.map(([nombre, descripcion, inicio, fin, roles], i) => ({ id: `${m.id}-s${i + 1}`, nombre, descripcion, inicio, fin, roles, color: String(i) }));
    const equipo = m.equipo.map(([perfil, cargo, rol], i) => ({ id: `${m.id}-m${i + 1}`, perfil, cargo, rol, justificacion: "", nombre: "" }));
    return { id: m.id, titulo: m.titulo, proceso: m.proceso, unidad: m.unidad, objetivo: "", inicio: m.inicio, fin: m.fin, incluye: "", excluye: "", responsable: "", fecha: "",
      subprocesos: subs, equipo, sesiones: [], prioridad: { modo: "top", n: m.prioridad || "3", umbral: "200" },
      fallos: m.fallos.map(([s, fallo, efecto, causa, controles, g, o, d], i) => { const num = i + 1; return { id: `${m.id}-f${num}`, num, subprocesoId: subs[s].id, fallo, efecto, causa, controles, g: String(g), o: String(o), d: String(d),
        acciones: ((m.acciones || {})[num] || []).map(([que, porque, donde, plazo, quien, como, tipo, clase, actuaSobre, nombre, estandar], j) => ({ id: `${m.id}-a${num}-${j + 1}`, que, porque, donde, plazo, fin: "", quien, como, tipo, clase, actuaSobre, indicador: { nombre, formula: "", estandar, fuente: "" }, estado: "pendiente", nota: "" })),
        ishikawa: ((m.ishikawa || {})[num] || []).map(([cat, texto, pq, elegida], j) => ({ id: `${m.id}-k${num}-${j + 1}`, cat, texto, porques: [0, 1, 2].map(k => pq[k] || ""), elegida })) }; }),
      notas: "Minicaso inventado para practicar. " + m.foco, creado: "2026-10-21T12:00:00.000Z", modificado: "2026-10-21T12:00:00.000Z" };
  }
  const EJERCICIOS = {
    fec: EJERCICIO_FEC_URG.map(([num, col]) => { const f = FALLOS_URG.find(x => x[0] === num); return { texto: f[{ fallo: 2, efecto: 3, causa: 4 }[col]], tipo: col, num }; }),
    puntua: EJERCICIO_PUNTUA_URG.map(num => { const f = FALLOS_URG.find(x => x[0] === num); return { num, fallo: f[2], efecto: f[3], causa: f[4], g: f[5], o: f[6], d: f[7] }; })
  };

  const EJEMPLOS = {
    amfes: [amfeUrgencias(), ...MINICASOS.map(miniAmfe)],
    minicasos: MINICASOS.map(m => ({ t: m.titulo, s: m.foco, href: `#/amfe/${m.id}/${m.paso}` })),
    fichas: [
      { t: "1 · El proceso", s: "7 subprocesos con su inicio, fin y roles", href: "#/amfe/ej-amfe-urg/1" },
      { t: "2 · El equipo", s: "10 perfiles y 3 sesiones de trabajo", href: "#/amfe/ej-amfe-urg/2" },
      { t: "3 · Las ideas", s: "Lluvia de ideas en 12 bloques y grupo nominal", href: "#/amfe/ej-amfe-urg/3" },
      { t: "4 · Los fallos", s: "49 fallos con su efecto y su causa", href: "#/amfe/ej-amfe-urg/4" },
      { t: "5 · La puntuación", s: "G·O·D e IPR: del 343 al 36", href: "#/amfe/ej-amfe-urg/5" },
      { t: "6 · La priorización", s: "Los 15 de mayor IPR y la matriz de riesgos", href: "#/amfe/ej-amfe-urg/6" },
      { t: "7 · Las acciones", s: "9 acciones 5W1H con indicador y estándar", href: "#/amfe/ej-amfe-urg/7" },
      { t: "8 · Cierre e informe", s: "IPR residual, conclusiones e informe en Word", href: "#/amfe/ej-amfe-urg/8" }
    ]
  };

  const API = { TEMAS, GLOSARIO, EJEMPLOS, TEST, TEMAS_TEST, EJERCICIOS };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.Contenido = API;
})(typeof window !== "undefined" ? window : this);
