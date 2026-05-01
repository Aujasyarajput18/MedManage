/**
 * lib/pin.js
 * App PIN lock — stores a hashed 4-digit PIN in localStorage.
 * Uses SubtleCrypto for hashing (no plain-text storage).
 */

const PIN_KEY = 'medmanage_pin_hash';
const LAST_ACTIVE_KEY = 'medmanage_last_active';
const LOCKED_KEY = 'medmanage_locked';

/** Hash a PIN string using SHA-256 */
async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + '_medmanage_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Save a new PIN (hashed) */
export async function setPin(pin) {
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be exactly 4 digits');
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_KEY, hash);
}

/** Verify a PIN attempt. Returns true if correct. */
export async function verifyPin(pin) {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) return true; // No PIN set — always pass
  const hash = await hashPin(pin);
  return hash === stored;
}

/** Check if a PIN is currently set */
export function isPinSet() {
  return !!localStorage.getItem(PIN_KEY);
}

/** Remove PIN lock entirely */
export function clearPin() {
  localStorage.removeItem(PIN_KEY);
}

/** Record user activity timestamp */
export function recordActivity() {
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

/** Check if the session should be locked due to inactivity.
 *  @param {number} timeoutMinutes - minutes of inactivity before lock
 */
export function shouldLock(timeoutMinutes = 5) {
  if (!isPinSet()) return false;
  const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10);
  if (!lastActive) return false;
  const elapsed = (Date.now() - lastActive) / 1000 / 60;
  return elapsed >= timeoutMinutes;
}

/** Set the locked state */
export function setLocked(locked) {
  localStorage.setItem(LOCKED_KEY, locked ? '1' : '0');
}

/** Get the locked state */
export function isLocked() {
  return localStorage.getItem(LOCKED_KEY) === '1';
}
