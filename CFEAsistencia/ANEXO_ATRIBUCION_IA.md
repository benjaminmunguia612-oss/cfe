# Anexo A — Atribución de IA (completar)

**A.1 Herramientas:** Claude (Anthropic) — planeación y generación inicial de código/documentación. Fechas: 2026-10-10 […]

**A.2 Prompts relevantes**
| N.º | Prompt (resumen) | Resultado | Qué modifiqué |
|---|---|---|---|
| 1 | Plan de desarrollo + simplificación a RAG con corpus en .txt y mínimo gasto de tokens | Proyecto base (app/, data/, tests/) | […] |

**A.3 Código generado por IA**
| Archivo | Origen | Revisión realizada | Pruebas |
|---|---|---|---|
| app/index.py, app/service.py, app/quota.py, app/corpus.py … | generado y adaptado | […] lectura línea por línea, ejecución, casos límite | tests/ |

**A.4 Auditoría personal** — marca cuando lo hayas hecho:
- [ ] Ejecuté y entiendo cada módulo.
- [ ] Verifiqué la API del proveedor, el nombre del modelo y los límites de Render en su documentación oficial.
- [ ] Ningún secreto en el repositorio (revisé el historial de git).
- [ ] Medí calidad con consultas reales y documenté desviaciones.

**A.5 Declaración:** «Declaro que he utilizado herramientas de IA como se describe, que he revisado y comprendido el material generado y que asumo la responsabilidad por el contenido entregado.» Nombre y fecha: […]
