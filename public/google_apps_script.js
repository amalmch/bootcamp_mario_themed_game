/**
 * ============================================================
 *  CODE KINGDOM ESCAPE — Google Apps Script Web App
 * ============================================================
 *
 *  PASTE THIS ENTIRE FILE into your Google Apps Script editor.
 *  (Extensions → Apps Script in your Google Sheet)
 *
 *  Then deploy as a Web App:
 *    Deploy → New deployment → Web App
 *    Execute as: Me
 *    Access: Anyone
 *
 *  Copy the Web App URL → paste into Vercel env var VITE_SHEET_URL
 * ============================================================
 */

const SHEET_NAME = 'Leaderboard';

// Column headers (written on first run)
const HEADERS = [
  'Rank',
  'Team Name',
  'Final Score',
  'Minigame Score',
  'Bits Collected',
  'Time (mm:ss)',
  'Speed Bonus',
  'Submitted At',
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    // Format elapsed seconds as mm:ss
    const elapsed = parseInt(data.elapsedSec || 0, 10);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    const timeFormatted = `${mins}:${secs}`;

    // Append the new row
    sheet.appendRow([
      '',                         // Rank (formula fills this)
      data.teamName || 'Anonymous',
      parseInt(data.finalScore || 0, 10),
      parseInt(data.minigameScore || 0, 10),
      parseInt(data.bitsCollected || 0, 10),
      timeFormatted,
      parseInt(data.timeBonus || 0, 10),
      data.submittedAt || new Date().toISOString(),
    ]);

    // Re-rank all rows by Final Score descending
    rankRows(sheet);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Allow reading the leaderboard (optional)
function doGet(e) {
  const sheet = getOrCreateSheet();
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- Helpers ----

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Write headers
    sheet.appendRow(HEADERS);
    // Style header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#e52521');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    // Freeze header
    sheet.setFrozenRows(1);
    // Set column widths
    sheet.setColumnWidth(2, 200); // Team Name
    sheet.setColumnWidth(3, 120); // Final Score
    sheet.setColumnWidth(8, 200); // Submitted At
  }

  return sheet;
}

function rankRows(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return; // Only headers

  // Sort by Final Score (col 3) descending
  sheet.getRange(2, 1, lastRow - 1, HEADERS.length)
    .sort({ column: 3, ascending: false });

  // Write rank numbers
  for (let i = 2; i <= lastRow; i++) {
    sheet.getRange(i, 1).setValue(i - 1);
  }

  // Style rank #1 in gold
  if (lastRow >= 2) {
    sheet.getRange(2, 1, 1, HEADERS.length).setBackground('#fff3cd');
    sheet.getRange(2, 1).setValue('🥇 1');
  }
  if (lastRow >= 3) {
    sheet.getRange(3, 1, 1, HEADERS.length).setBackground('#f8f9fa');
    sheet.getRange(3, 1).setValue('🥈 2');
  }
  if (lastRow >= 4) {
    sheet.getRange(4, 1, 1, HEADERS.length).setBackground('#fff8f0');
    sheet.getRange(4, 1).setValue('🥉 3');
  }
}
