/**
 * Pūrnah — enquiry form → Google Sheet
 * ---------------------------------------------------------------------------
 * Receives POSTs from the "Enquire" section of index.html and appends one row
 * per enquiry. The header row is created automatically on the first submission.
 *
 * SETUP (about 3 minutes — must be done from the Google account that owns the
 * sheet; nobody else can do it for you):
 *
 *   1. Open the sheet:
 *      https://docs.google.com/spreadsheets/d/1O1vsjvjFvq5suX0ay-Ic1Ug6OqPF-lPjeqWZ8iG5jKw/edit
 *   2. Extensions → Apps Script. Delete whatever is in Code.gs.
 *   3. Paste this entire file in and save (the disk icon).
 *   4. Deploy → New deployment → gear icon → Web app.
 *        Description:  Purnah enquiry form
 *        Execute as:   Me
 *        Who has access:  Anyone          ← must be "Anyone", not "Anyone with Google account"
 *      Click Deploy.
 *   5. Authorise when prompted. Google will warn that the app is unverified
 *      because you just wrote it: Advanced → "Go to Purnah enquiry form (unsafe)"
 *      → Allow. This is the normal flow for your own script.
 *   6. Copy the Web app URL. It ends in /exec, like:
 *        https://script.google.com/macros/s/AKfycb.../exec
 *   7. Paste it into index.html, into the line that reads:
 *        var ENQUIRY_ENDPOINT = '';
 *
 * TEST: open the /exec URL in a browser. You should see {"ok":true,...}.
 *       Then submit the form on the site and watch a row appear.
 *
 * IMPORTANT: every time you edit this script, you must Deploy → Manage
 * deployments → pencil icon → Version: New version → Deploy, or the live URL
 * keeps running the old code.
 * ---------------------------------------------------------------------------
 */

var SHEET_ID   = '1O1vsjvjFvq5suX0ay-Ic1Ug6OqPF-lPjeqWZ8iG5jKw';
var SHEET_NAME = 'Sheet1';

var HEADERS = [
  'Timestamp',
  'Name',
  'Email',
  'Phone',
  'Enquiry Type',
  'Message',
  'Submission ID',
  'Source Page',
  'User Agent'
];

/* Column (1-based) holding the submission id, used for de-duplication. */
var ID_COLUMN = 7;


function doPost(e) {
  var lock = LockService.getScriptLock();

  // Two visitors submitting at the same moment must not collide on the same row.
  try {
    lock.waitLock(20000);
  } catch (lockErr) {
    return jsonOut_({ ok: false, error: 'busy' });
  }

  try {
    var p = (e && e.parameter) || {};

    // Spam trap: the hidden field is invisible to people and irresistible to
    // bots. Pretend success so the bot does not retry.
    //
    // The field name must stay meaningless. It was briefly called "company",
    // which browser autofill recognised and filled in for real visitors —
    // their enquiries were silently discarded here. Hence the logging below:
    // a false positive must always be recoverable from the execution log.
    if (String(p.hp_field_9c || '').trim() !== '') {
      Logger.log('Honeypot triggered — submission discarded. Payload: '
                 + JSON.stringify(p));
      return jsonOut_({ ok: true, skipped: 'bot' });
    }

    var sheet = getSheet_();
    var id = String(p.submissionId || '').trim();

    // The browser posts no-cors and cannot read our reply, so a visitor who
    // double-clicks (or a flaky connection that retries) could send twice.
    if (id && isDuplicate_(sheet, id)) {
      return jsonOut_({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      new Date(),
      safe_(p.name,    200),
      safe_(p.email,   200),
      safe_(p.phone,    60),
      safe_(p.type,    100),
      safe_(p.message, 5000),
      safe_(id,        100),
      safe_(p.source,   500),
      safe_(p.userAgent, 300)
    ]);

    notify_(p);

    return jsonOut_({ ok: true });

  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}


/* Opening the /exec URL in a browser hits this — a quick health check. */
function doGet() {
  try {
    var sheet = getSheet_();
    return jsonOut_({
      ok: true,
      message: 'Purnah enquiry endpoint is live. POST form data here.',
      sheet: sheet.getName(),
      rows: Math.max(0, sheet.getLastRow() - 1)
    });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}


/* ---------------------------------------------------------------- helpers */

/**
 * Google Sheets evaluates anything starting with = + - or @ as a formula, so a
 * phone number like "+91 98765 43210" lands as #ERROR!, and a hostile enquiry
 * could inject a live formula into the sheet. A leading apostrophe forces the
 * value to be stored as literal text; Sheets does not display the apostrophe.
 */
function safe_(value, max) {
  var s = String(value === null || value === undefined ? '' : value).slice(0, max);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}

function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

  // Write and freeze the header row the first time we ever run.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);  // Timestamp
    sheet.setColumnWidth(6, 420);  // Message
    // Belt and braces: force Phone to plain text so nothing is ever re-parsed.
    sheet.getRange('D2:D').setNumberFormat('@');
  }
  return sheet;
}


function isDuplicate_(sheet, id) {
  var last = sheet.getLastRow();
  if (last < 2) return false;

  // Only scan the most recent 200 rows — duplicates always arrive within seconds.
  var start = Math.max(2, last - 199);
  var ids = sheet.getRange(start, ID_COLUMN, last - start + 1, 1).getValues();

  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === id) return true;
  }
  return false;
}


/**
 * Emails you when an enquiry arrives.
 * Put your address in NOTIFY_TO to switch this on; leave it empty to skip.
 */
var NOTIFY_TO = '';

function notify_(p) {
  if (!NOTIFY_TO) return;
  try {
    MailApp.sendEmail({
      to: NOTIFY_TO,
      subject: 'Pūrnah enquiry — ' + (p.type || 'General') + ' — ' + (p.name || 'Someone'),
      replyTo: String(p.email || ''),
      body:
        'Name:    ' + (p.name  || '') + '\n' +
        'Email:   ' + (p.email || '') + '\n' +
        'Phone:   ' + (p.phone || '—') + '\n' +
        'About:   ' + (p.type  || '') + '\n\n' +
        (p.message || '') + '\n\n' +
        '— sent from the Pūrnah site enquiry form'
    });
  } catch (mailErr) {
    // Never let a mail failure lose the row that is already saved.
  }
}


function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Run this once from the Apps Script editor (select setupTest and press Run)
 * to create the header row and drop in a sample enquiry, so you can confirm
 * the sheet is wired up before touching the website.
 */
function setupTest() {
  var sheet = getSheet_();
  sheet.appendRow([
    new Date(),
    'Test Enquiry',
    'test@example.com',
    '+91 00000 00000',
    'Table reservation',
    'This row was created by setupTest(). Delete it whenever you like.',
    'setup-test-' + Date.now(),
    'apps-script editor',
    'manual run'
  ]);
  Logger.log('Wrote a test row to "' + sheet.getName() + '". Open the sheet to confirm.');
}
