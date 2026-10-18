// Interfaz mínima: todo el texto del servidor se inserta con textContent (nunca innerHTML).
const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("pregunta");
const perfil = document.getElementById("perfil");
const btn = document.getElementById("enviar");
const uso = document.getElementById("uso");

function lsGet(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
let cid = lsGet("cg_id", "");
if (!cid) { cid = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)); lsSet("cg_id", cid); }
perfil.value = lsGet("cg_perfil", "todos");
perfil.addEventListener("change", () => lsSet("cg_perfil", perfil.value));

function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }

function ficha(f) {
  const box = el("div", "ficha");
  box.appendChild(el("h3", "", f.titulo + (f.puesto ? " — " + f.puesto : "")));
  const dl = el("dl");
  [["Responsable", f.responsable], ["Ubicación", f.ubicacion], ["Horario", f.horario],
   ["Teléfono", f.telefono], ["Correo", f.correo], ["Web", f.web], ["Actualizado", f.actualizado]].forEach(([k, v]) => {
    if (!v) return;
    dl.appendChild(el("dt", "", k));
    dl.appendChild(el("dd", "", v));
  });
  box.appendChild(dl);
  if (f.desactualizado) box.appendChild(el("p", "warn", "Esta información puede estar desactualizada. Confirma con la oficina."));
  return box;
}

function render(d) {
  const m = el("div", "msg");
  m.appendChild(el("p", "", d.respuesta));
  (d.advertencias || []).forEach(a => m.appendChild(el("p", "warn", a)));
  (d.fichas || []).forEach(f => m.appendChild(ficha(f)));
  if ((d.fuentes || []).length) {
    m.appendChild(el("p", "fuentes", "Fuentes: " + d.fuentes.map(s => `[${s.n}] ${s.titulo}` + (s.actualizado ? ` (${s.actualizado})` : "")).join("; ")));
  }
  if (["llm", "directa"].includes(d.tipo)) {
    const fb = el("div", "fb");
    ["Me sirvió", "No me sirvió"].forEach((t, i) => {
      const b = el("button", "", t); b.type = "button";
      b.addEventListener("click", () => {
        fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ util: i === 0 }) });
        fb.textContent = "Gracias por tu valoración.";
      });
      fb.appendChild(b);
    });
    m.appendChild(fb);
  }
  chat.appendChild(m);
  m.scrollIntoView({ block: "nearest" });
  const u = d.uso || {};
  uso.textContent = u.consultas !== undefined ? `Consultas de IA restantes hoy: ${u.consultas}` : "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const texto = input.value.trim();
  if (!texto) return;
  chat.appendChild(el("div", "msg user", texto));
  input.value = ""; btn.disabled = true; btn.textContent = "Buscando…";
  try {
    const r = await fetch("/api/consulta", { method: "POST", headers: { "Content-Type": "application/json", "X-Client-Id": cid },
      body: JSON.stringify({ texto, perfil: perfil.value }) });
    if (r.status === 429) { render({ respuesta: "Hiciste muchas consultas seguidas. Espera un minuto e inténtalo de nuevo.", tipo: "limite" }); }
    else if (!r.ok) { render({ respuesta: "No pude responder ahora. Inténtalo de nuevo en un momento.", tipo: "error" }); }
    else { render(await r.json()); }
  } catch (err) { render({ respuesta: "No hay conexión con el servidor. Si es la primera consulta, puede tardar un minuto en despertar.", tipo: "error" }); }
  btn.disabled = false; btn.textContent = "Preguntar"; input.focus();
});
