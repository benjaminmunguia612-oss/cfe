# Plan recomendado (v2): mínimo gasto de tokens y almacenamiento simple

## 1. Decisión central
El gasto de tokens **no debe estar en el build del corpus** ni en cada consulta si se puede evitar. Se diseña por niveles; solo el último usa IA:

| Nivel | Qué ocurre | Tokens |
|---|---|---|
| 0 | Emergencias/salud/legal/psico → derivación fija; caché; abstención sin evidencia | 0 |
| 1 | Consulta clara (todos los términos hallados y un ganador nítido) → ficha + resumen del propio corpus | 0 |
| 2 | Consulta ambigua o compuesta → **1** llamada al LLM con ≤3 documentos recortados (~610 entrada + ≤250 salida) | ≈ 860 máx. |
| Build | `build_corpus` valida e indexa con BM25 (sin LLM ni embeddings) | 0 |
| Build opcional | `--sugerir-tags` solo para entradas sin tags, con caché por hash | ≈ 100 / entrada nueva |

## 2. Cambios respecto al PDF (y por qué)
| PDF v1.0 | Esta versión | Motivo |
|---|---|---|
| Embeddings + BM25 + RRF | BM25 con campos ponderados (tags×4, título×3, puesto×2), sinónimos y prefijos | Elimina el costo recurrente del build y la dependencia externa |
| Corpus en muchos .md con front-matter | **Un** `corpus.txt` con bloques `CLAVE: valor` | Edición a mano trivial; contacto y tags son campos de primera clase |
| Agente ReAct (varias llamadas) | Pipeline determinista con 1 llamada LLM como máximo | Cada vuelta ReAct multiplica tokens |
| Contacto redactado por el modelo | Ficha de contacto tomada del corpus, no del modelo | Cero alucinación de teléfonos/correos y menos tokens de salida |
| Límite de tasa solo | Cupos por usuario/día, por consulta y global, con degradación a ficha | Gasto acotado y predecible |
| Pictogramas, TTS, rutas, LangGraph | **Fase 2** (no incluidos) | No dependen del corpus; añaden costo de desarrollo y riesgo |

**Riesgo de rúbrica (importante):** el PDF indica que la rúbrica premia una arquitectura de agente con ≥2 herramientas externas (35 %). Esta versión no la cumple tal cual. Si tu curso lo exige, añade en Fase 2 el `StateGraph` de LangGraph envolviendo estas mismas funciones (`search`, `ficha`, `llm.complete`) como herramientas, e integra ARASAAC y gTTS. Confírmalo con tu profesor antes de decidir.

## 3. Requisitos clave y verificación
| Requisito | Verificación |
|---|---|
| Sin evidencia → abstención, nunca inventar | `test_abstencion_sin_evidencia_no_llama_llm`, `test_fuera_de_alcance_baja_relevancia` |
| Citas válidas; inventadas se descartan | `test_llm_cita_validada…`, `test_cita_inventada_se_descarta` |
| Tope de tokens por consulta/usuario/global | `tests/test_quota.py`, `test_limite_diario_degrada_a_ficha` |
| Contactos nunca van al LLM | assert en `test_llm_cita_validada…` |
| Emergencias/salud derivadas | `test_emergencia…`, `test_salud…` |
| Admin protegido | `tests/test_api.py` |
| Nunca HTTP 500 al usuario | manejador en `main.consulta` |

## 4. Riesgos y calibración
- **Umbrales** (`MIN_SCORE`, `MIN_COVERAGE`, `DIRECT_*`) están calibrados solo con el corpus de ejemplo: con tu corpus real crea 30–50 preguntas y ajusta. Sube `DIRECT_COVERAGE`/desactiva `DIRECT_ENABLED` si ves fichas poco precisas.
- **Respuesta directa** devuelve el inicio del texto, no responde la pregunta puntual: por eso solo se usa con consultas de palabras clave claras.
- **Cupos en memoria**: el id de navegador es falsificable y una IP compartida (Wi-Fi del campus) agrupa usuarios; por eso hay multiplicador por IP y tope global. El tope definitivo va en el proveedor.
- **Información obsoleta**: avisos de vigencia por `ACTUALIZADO`; revisa `/api/admin/estado`.
- **Datos reales**: pide autorización antes de publicar contactos en un repositorio público; el corpus incluido es ficticio.
