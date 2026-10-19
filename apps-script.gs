/**
 * GONZA-COSITORTO · sincronización con Google Sheets
 *
 * Pegá este código en la planilla: Extensiones → Apps Script → Código.gs.
 * Cambiá CLAVE por una clave propia, guardá y publicá:
 * Implementar → Nueva implementación → Tipo: Aplicación web
 *   - Ejecutar como: Yo
 *   - Quién tiene acceso: Cualquier usuario
 * Copiá la URL que termina en /exec y cargala en la app junto con la clave.
 */
const CLAVE = 'cambia-esta-clave';

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.key !== CLAVE) return json_({ error: 'Clave incorrecta' });
  const v = version_();
  if (p.since !== undefined && p.since !== '' && Number(p.since) === v) return json_({ version: v, unchanged: true });
  return json_({ version: v, tables: read_() });
}

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return json_({ error: 'Pedido inválido' }); }
  if (b.key !== CLAVE) return json_({ error: 'Clave incorrecta' });
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const v = version_();
    // Otro dispositivo guardó antes: devolvemos lo actual para que la app combine y reintente
    if (Number(b.base) !== v) return json_({ conflict: true, version: v, tables: read_() });
    write_(b.tables || {});
    const nv = v + 1;
    PropertiesService.getScriptProperties().setProperty('version', String(nv));
    return json_({ version: nv });
  } finally {
    lock.releaseLock();
  }
}

// Ediciones hechas a mano en la planilla: marcan la fila como actualizada y avisan a los dispositivos
function onEdit(e) {
  const sh = e.range.getSheet();
  const lastCol = sh.getLastColumn();
  if (lastCol > 0 && e.range.getRow() > 1) {
    const head = sh.getRange(1, 1, 1, lastCol).getValues()[0];
    const col = head.indexOf('actualizado');
    const onlyThatCol = e.range.getNumColumns() === 1 && e.range.getColumn() === col + 1;
    if (col >= 0 && !onlyThatCol) {
      const n = e.range.getNumRows();
      const now = Date.now();
      sh.getRange(e.range.getRow(), col + 1, n, 1).setValues(Array.from({ length: n }, () => [now]));
    }
  }
  const pr = PropertiesService.getScriptProperties();
  pr.setProperty('version', String(Number(pr.getProperty('version') || 0) + 1));
}

function version_() {
  return Number(PropertiesService.getScriptProperties().getProperty('version') || 0);
}

function read_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone();
  const out = {};
  ss.getSheets().forEach(function (sh) {
    if (sh.getLastRow() === 0) return;
    const vals = sh.getDataRange().getValues();
    if (vals[0][0] === '') return;
    out[sh.getName()] = vals.map(function (r) {
      return r.map(function (c) { return c instanceof Date ? Utilities.formatDate(c, tz, 'yyyy-MM-dd') : c; });
    });
  });
  return out;
}

function write_(tables) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(tables).forEach(function (name) {
    const t = tables[name];
    const rows = t.rows;
    if (!rows || !rows.length) return;
    const w = rows[0].length;
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.clearContents();
    (t.text || []).forEach(function (c) { sh.getRange(1, c + 1, rows.length, 1).setNumberFormat('@'); });
    sh.getRange(1, 1, rows.length, w).setValues(rows);
    sh.getRange(1, 1, 1, w).setFontWeight('bold');
    sh.setFrozenRows(1);
    if (t.hidden) sh.hideSheet();
  });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
