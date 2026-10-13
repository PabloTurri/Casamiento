/**
 * Backend de la invitación de Mili & Pablo.
 * Se pega en la planilla: Extensiones > Apps Script.
 * Ver LEEME.md para la instalación.
 */

// URL pública del sitio (GitHub Pages). Cambiala por la tuya, con la barra final.
const BASE_URL = 'https://pabloturri.github.io/Casamiento/';

const HOJA_INV = 'Invitados';
const HOJA_CONF = 'Confirmaciones';
const HOJA_CANC = 'Canciones';

const COLS_INV = ['Grupo', 'Integrantes (separados por coma)', 'Clave', 'Link', 'Estado', 'Van', 'Restricciones', 'Última respuesta', 'Datos (no tocar)'];
const COLS_CONF = ['Fecha', 'Grupo', 'Clave', 'Asiste', 'Van', 'No van', 'Restricciones', 'Mensaje'];
const COLS_CANC = ['Fecha', 'Grupo', 'Canción', 'Artista'];

// Índices (base 0) de columnas en Invitados
const C = { GRUPO: 0, INTEG: 1, CLAVE: 2, LINK: 3, ESTADO: 4, VAN: 5, DIETAS: 6, ULTIMA: 7, DATOS: 8 };

/* ---------- Menú en la planilla ---------- */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Invitación')
    .addItem('1. Preparar planilla', 'preparar')
    .addItem('2. Generar links de invitados', 'generarLinks')
    .addToUi();
}

function preparar() {
  const ss = SpreadsheetApp.getActive();
  [[HOJA_INV, COLS_INV], [HOJA_CONF, COLS_CONF], [HOJA_CANC, COLS_CANC]].forEach(([nombre, cols]) => {
    let sh = ss.getSheetByName(nombre);
    if (!sh) sh = ss.insertSheet(nombre);
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold').setBackground('#e8eef4');
    sh.setFrozenRows(1);
  });
  const inv = ss.getSheetByName(HOJA_INV);
  inv.setColumnWidth(C.INTEG + 1, 320);
  inv.setColumnWidth(C.LINK + 1, 320);
  inv.hideColumns(C.DATOS + 1);
  SpreadsheetApp.getUi().alert('Listo. Cargá los invitados en la hoja "Invitados" (una fila por grupo) y después usá "2. Generar links".');
}

function generarLinks() {
  const sh = SpreadsheetApp.getActive().getSheetByName(HOJA_INV);
  const n = sh.getLastRow() - 1;
  if (n < 1) return;
  const datos = sh.getRange(2, 1, n, COLS_INV.length).getValues();
  const usadas = new Set(datos.map(r => String(r[C.CLAVE])).filter(Boolean));
  let nuevos = 0;
  datos.forEach((r, i) => {
    if (!String(r[C.INTEG]).trim()) return;
    if (!r[C.CLAVE]) {
      let k;
      do { k = claveAleatoria(); } while (usadas.has(k));
      usadas.add(k);
      sh.getRange(i + 2, C.CLAVE + 1).setValue(k);
      r[C.CLAVE] = k;
      nuevos++;
    }
    sh.getRange(i + 2, C.LINK + 1).setValue(BASE_URL + '?i=' + r[C.CLAVE]);
    if (!r[C.ESTADO]) sh.getRange(i + 2, C.ESTADO + 1).setValue('Pendiente');
  });
  SpreadsheetApp.getUi().alert('Links listos (' + nuevos + ' nuevos). Copiá el de cada grupo de la columna "Link".');
}

function claveAleatoria() {
  const abc = 'abcdefghjkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

/* ---------- API ---------- */

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function integrantesDe(fila) {
  return String(fila[C.INTEG]).split(',').map(s => s.trim()).filter(Boolean);
}

function buscarFila(clave) {
  const sh = SpreadsheetApp.getActive().getSheetByName(HOJA_INV);
  const n = sh.getLastRow() - 1;
  if (n < 1 || !clave) return null;
  const datos = sh.getRange(2, 1, n, COLS_INV.length).getValues();
  for (let i = 0; i < datos.length; i++) {
    if (String(datos[i][C.CLAVE]) === String(clave)) return { sh, fila: i + 2, valores: datos[i] };
  }
  return null;
}

// GET ?i=clave  -> datos de la invitación
function doGet(e) {
  const clave = (e.parameter.i || '').trim();
  const f = buscarFila(clave);
  if (!f) return json({ ok: false, error: 'no_encontrada' });
  let respuesta = null;
  try { respuesta = f.valores[C.DATOS] ? JSON.parse(f.valores[C.DATOS]) : null; } catch (err) {}
  return json({ ok: true, clave, grupo: f.valores[C.GRUPO], integrantes: integrantesDe(f.valores), respuesta });
}

// POST {action:"rsvp"|"cancion", ...}
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.action === 'rsvp') return json(guardarRsvp(d));
    if (d.action === 'cancion') return json(guardarCancion(d));
    return json({ ok: false, error: 'accion_invalida' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function limpiar(s, max) { return String(s || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max); }

function guardarRsvp(d) {
  const f = buscarFila(d.clave);
  if (!f) return { ok: false, error: 'no_encontrada' };
  const integrantes = integrantesDe(f.valores);
  const asiste = !!d.asiste;
  // Solo se aceptan integrantes del grupo: nadie puede sumar gente
  const recibidas = {};
  (d.personas || []).forEach(p => { if (integrantes.indexOf(p.nombre) >= 0) recibidas[p.nombre] = p; });
  const personas = integrantes.map(nombre => {
    const p = recibidas[nombre] || {};
    const va = asiste && !!p.va;
    return { nombre, va, dieta: va ? limpiar(p.dieta, 80) : '' };
  });
  const van = personas.filter(p => p.va);
  const noVan = personas.filter(p => !p.va);
  const dietas = van.filter(p => p.dieta && p.dieta !== 'Sin restricciones').map(p => p.nombre + ': ' + p.dieta).join('; ');
  const mensaje = limpiar(d.mensaje, 500);
  const ahora = new Date();
  const fechaTxt = Utilities.formatDate(ahora, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy');

  SpreadsheetApp.getActive().getSheetByName(HOJA_CONF).appendRow([
    ahora, f.valores[C.GRUPO], d.clave, asiste ? 'Sí' : 'No',
    van.map(p => p.nombre).join(', '), noVan.map(p => p.nombre).join(', '), dietas, mensaje
  ]);

  const respuesta = { asiste: van.length > 0, personas, mensaje, fecha: fechaTxt };
  const estado = van.length === 0 ? 'No va' : (van.length === integrantes.length ? 'Confirmado' : 'Confirmado parcial');
  f.sh.getRange(f.fila, C.ESTADO + 1, 1, 5).setValues([[
    estado, van.length + ' de ' + integrantes.length, dietas, ahora, JSON.stringify(respuesta)
  ]]);
  return { ok: true, respuesta };
}

function guardarCancion(d) {
  const cancion = limpiar(d.cancion, 120);
  if (!cancion) return { ok: false, error: 'vacia' };
  const f = buscarFila(d.clave);
  SpreadsheetApp.getActive().getSheetByName(HOJA_CANC).appendRow([
    new Date(), f ? f.valores[C.GRUPO] : '(sin link personal)', cancion, limpiar(d.artista, 120)
  ]);
  return { ok: true };
}
