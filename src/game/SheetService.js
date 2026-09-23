/**
 * ============================================================
 *  CODE KINGDOM ESCAPE — Google Sheets Score Submission Service
 * ============================================================
 *
 * This module POSTs the player's final score to a Google Apps
 * Script Web App, which writes it into a Google Sheet.
 *
 * HOW TO SET UP (one-time, takes ~5 minutes):
 *  1. Go to https://sheets.google.com  →  create a new sheet
 *     named "Code Kingdom Leaderboard"
 *  2. Click Extensions → Apps Script
 *  3. Delete all default code and paste the contents of
 *     public/google_apps_script.js  (see that file)
 *  4. Click Deploy → New deployment → Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Copy the Web App URL and paste it below as SHEET_URL
 * ============================================================
 */

// ← PASTE YOUR APPS SCRIPT WEB APP URL HERE after deploying
const SHEET_URL = import.meta.env.VITE_SHEET_URL || '';

/**
 * Submit the player's result to the Google Sheet leaderboard.
 * Fires-and-forgets: won't block the ending screen.
 *
 * @param {object} data
 * @param {string} data.teamName
 * @param {number} data.finalScore
 * @param {number} data.minigameScore
 * @param {number} data.bitsCollected
 * @param {number} data.elapsedSec
 * @param {number} data.timeBonus
 */
export async function submitScoreToSheet(data) {
  if (!SHEET_URL) {
    console.warn('[Sheets] VITE_SHEET_URL not set — skipping submission.');
    return { ok: false, reason: 'no_url' };
  }

  try {
    const payload = {
      teamName: data.teamName || 'Anonymous',
      finalScore: data.finalScore || 0,
      minigameScore: data.minigameScore || 0,
      bitsCollected: data.bitsCollected || 0,
      elapsedSec: data.elapsedSec || 0,
      timeBonus: data.timeBonus || 0,
      submittedAt: new Date().toISOString(),
    };

    // Google Apps Script requires no-cors for cross-origin POST
    const res = await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // no-cors always returns opaque response — treat as success
    console.log('[Sheets] Score submitted ✓', payload);
    return { ok: true };
  } catch (err) {
    console.warn('[Sheets] Submission failed:', err);
    return { ok: false, reason: err.message };
  }
}
