// ═══════════════════════════════════════════════════════
//  MD.Studio — Google Apps Script Web App
//  Instruções:
//  1. Aceda a https://script.google.com → Novo projeto
//  2. Substitua o conteúdo pelo código abaixo
//  3. Clique em Implementar → Nova implementação
//     - Tipo: App da Web
//     - Executar como: Eu (a minha conta Google)
//     - Quem tem acesso: Qualquer pessoa
//  4. Copie o URL gerado e cole em index.html na constante AS_URL
// ═══════════════════════════════════════════════════════

function doGet(e) {
  try {
    const action   = (e.parameter && e.parameter.action)   || 'list';
    const callback = (e.parameter && e.parameter.callback) || '';
    var data;
    if (action === 'list') data = getListData();
    else if (action === 'maintenance') data = getMaintenanceData();
    else data = { status: 'ok' };

    if (callback) {
      // JSONP — bypasses CORS entirely
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(data) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return jsonOut(data);
  } catch (err) {
    return jsonOut({ error: err.message });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'create') return createEvent(data);
    if (data.action === 'delete') return deleteByMdId(data.mdId);
    if (data.action === 'create-maintenance') return createMaintenanceEvent(data);
    if (data.action === 'update-maintenance') return updateMaintenanceEvent(data);
    if (data.action === 'delete-maintenance') return deleteMaintenanceEvent(data.eventId);
    return jsonOut({ error: 'unknown action' });
  } catch (err) {
    console.error('doPost failed: ' + err.message);
    return jsonOut({ error: err.message });
  }
}

// ── Lista todos os eventos MD.Studio dos próximos 60 dias ──
const CALENDAR_ID = '2108f778462463561b425fbc3bc034e9eb6e3c503152b98dc9757718e7a914ee@group.calendar.google.com';
const MAINTENANCE_MARKER = '[MDSTUDIO_MAINTENANCE_v1]';

function getListData() {
  const cal   = CalendarApp.getCalendarById(CALENDAR_ID);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);

  const events = cal.getEvents(start, end).filter(function(ev) {
    var desc = ev.getDescription ? ev.getDescription() : '';
    return desc.indexOf('[MDSTUDIO_v1]') !== -1;
  });

  return events.map(function(ev) {
    return {
      id:          ev.getId(),
      summary:     ev.getTitle(),
      description: ev.getDescription(),
      start:       ev.getStartTime().toISOString(),
      end:         ev.getEndTime().toISOString()
    };
  });
}

function getMaintenanceData() {
  const cal = CalendarApp.getCalendarById(CALENDAR_ID);
  const start = new Date(2020, 0, 1, 0, 0, 0, 0);
  const end = new Date(2100, 0, 1, 0, 0, 0, 0);
  const events = cal.getEvents(start, end, { search: MAINTENANCE_MARKER }).filter(function(ev) {
    const description = ev.getDescription ? ev.getDescription() : '';
    return description.indexOf(MAINTENANCE_MARKER) !== -1;
  });

  return events.map(function(ev) {
    const description = ev.getDescription();
    return {
      eventId: ev.getId(),
      date: maintenanceField_(description, 'date'),
      time: maintenanceField_(description, 'time'),
      name: maintenanceField_(description, 'name')
    };
  }).filter(function(item) {
    return item.date && item.time && item.name;
  }).sort(function(a, b) {
    return (a.date + 'T' + a.time).localeCompare(b.date + 'T' + b.time);
  });
}

function createMaintenanceEvent(data) {
  const input = validateMaintenanceInput_(data);
  const eventId = Utilities.getUuid();
  const description = maintenanceDescription_(eventId, input.date, input.time, input.name);
  const cal = CalendarApp.getCalendarById(CALENDAR_ID);
  const start = maintenanceDate_(input.date, '00:00', cal.getTimeZone());
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  cal.createEvent('MD.Studio | Limpeza - ' + input.name, start, end, {
    description: description,
    location: 'MD.Studio Fitness'
  });

  return jsonOut({ success: true, id: eventId });
}

function updateMaintenanceEvent(data) {
  const input = validateMaintenanceInput_(data);
  const cal = CalendarApp.getCalendarById(CALENDAR_ID);
  const event = findMaintenanceEvent_(cal, data.eventId);
  assertMaintenanceUpcoming_(event.getDescription());

  const start = maintenanceDate_(input.date, '00:00', cal.getTimeZone());
  event.setTime(start, new Date(start.getTime() + 30 * 60 * 1000));
  event.setTitle('MD.Studio | Limpeza - ' + input.name);
  event.setDescription(maintenanceDescription_(
    maintenanceField_(event.getDescription(), 'id'), input.date, input.time, input.name
  ));

  return jsonOut({ success: true });
}

function deleteMaintenanceEvent(eventId) {
  const cal = CalendarApp.getCalendarById(CALENDAR_ID);
  const event = findMaintenanceEvent_(cal, eventId);
  assertMaintenanceUpcoming_(event.getDescription());
  event.deleteEvent();
  return jsonOut({ success: true });
}

function findMaintenanceEvent_(cal, eventId) {
  if (!eventId) throw new Error('maintenance event not found');
  const event = cal.getEventById(String(eventId));
  if (!event || event.getDescription().indexOf(MAINTENANCE_MARKER) === -1) {
    throw new Error('maintenance event not found');
  }
  return event;
}

function validateMaintenanceInput_(data) {
  const date = String(data.date || '');
  const time = String(data.time || '');
  const name = String(data.name || '').replace(/[\r\n]+/g, ' ').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:(00|30)$/.test(time) ||
      time < '08:00' || time > '20:30' || !name || name.length > 100) {
    throw new Error('invalid maintenance date or time');
  }

  const timeZone = CalendarApp.getCalendarById(CALENDAR_ID).getTimeZone();
  let selectedDate;
  try {
    selectedDate = maintenanceDate_(date, '00:00', timeZone);
  } catch (error) {
    throw new Error('invalid maintenance date or time');
  }
  if (Utilities.formatDate(selectedDate, timeZone, 'yyyy-MM-dd') !== date) {
    throw new Error('invalid maintenance date or time');
  }

  const now = new Date();
  const today = Utilities.formatDate(now, timeZone, 'yyyy-MM-dd');
  const currentTime = Utilities.formatDate(now, timeZone, 'HH:mm');
  if (date < today || (date === today && time <= currentTime)) {
    throw new Error('invalid maintenance date or time');
  }

  return { date: date, time: time, name: name };
}

function assertMaintenanceUpcoming_(description) {
  const date = maintenanceField_(description, 'date');
  const time = maintenanceField_(description, 'time');
  const input = validateMaintenanceInput_({ date: date, time: time, name: maintenanceField_(description, 'name') });
  if (!input) throw new Error('maintenance event not found');
}

function maintenanceDescription_(id, date, time, name) {
  return MAINTENANCE_MARKER + '\nid: ' + id + '\ndate: ' + date + '\ntime: ' + time + '\nname: ' + name;
}

function maintenanceField_(description, field) {
  const match = String(description || '').match(new RegExp('^' + field + ': (.*)$', 'm'));
  return match ? match[1].trim() : '';
}

function maintenanceTimeToHour_(time) {
  const match = String(time || '').match(/^(\d{2}):(\d{2})$/);
  return match ? Number(match[1]) + Number(match[2]) / 60 : NaN;
}

function maintenanceDate_(date, time, timeZone) {
  return Utilities.parseDate(date + ' ' + time, timeZone, 'yyyy-MM-dd HH:mm');
}

function listEvents() {
  return jsonOut(getListData());
}

// ── Cria um novo evento no calendário ──
function createEvent(data) {
  const cal   = CalendarApp.getCalendarById(CALENDAR_ID);
  assertNoMaintenanceOverlap_(cal, data.description);
  const start = new Date(data.start);
  const end   = new Date(data.end);

  cal.createEvent(data.summary, start, end, {
    description: data.description,
    location:    data.location || 'MD.Studio Fitness'
  });

  return jsonOut({ success: true });
}

function assertNoMaintenanceOverlap_(cal, description) {
  const details = String(description || '');
  if (details.indexOf('[MDSTUDIO_v1]') === -1) return;

  const date = maintenanceField_(details, 'date');
  const workoutStart = Number(maintenanceField_(details, 'hour'));
  const duration = Number(maintenanceField_(details, 'duration')) || 0.5;
  if (!date || !Number.isFinite(workoutStart) || !Number.isFinite(duration) || duration <= 0) return;

  const dayStart = maintenanceDate_(date, '00:00', cal.getTimeZone());
  const dayEnd = new Date(dayStart.getTime() + 36 * 60 * 60 * 1000);
  const workoutEnd = workoutStart + duration;
  const hasConflict = cal.getEvents(dayStart, dayEnd).some(function(event) {
    const eventDescription = event.getDescription ? event.getDescription() : '';
    if (eventDescription.indexOf(MAINTENANCE_MARKER) === -1 ||
        maintenanceField_(eventDescription, 'date') !== date) return false;

    const cleaningStart = maintenanceTimeToHour_(maintenanceField_(eventDescription, 'time'));
    return Number.isFinite(cleaningStart) &&
      workoutStart < cleaningStart + 0.5 && cleaningStart < workoutEnd;
  });

  if (hasConflict) throw new Error('workout overlaps scheduled cleaning');
}

// ── Apaga o evento que contém o ID interno da reserva ──
function deleteByMdId(mdId) {
  if (!mdId) return jsonOut({ error: 'no mdId' });

  const cal   = CalendarApp.getCalendarById(CALENDAR_ID);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000);

  const events = cal.getEvents(start, end);
  for (var i = 0; i < events.length; i++) {
    var desc = events[i].getDescription ? events[i].getDescription() : '';
    if (desc.indexOf('id: ' + mdId) !== -1) {
      events[i].deleteEvent();
      break;
    }
  }

  return jsonOut({ success: true });
}

// ── Helper ──
function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
