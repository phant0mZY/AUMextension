/**
 * Amrita Student Companion - Academic & Attendance Calculations
 * Pure mathematical functions for attendance analysis and class-skip projections.
 */

/**
 * Calculates current attendance percentage safely.
 * @param {number} attended - Number of classes attended
 * @param {number} conducted - Total number of classes conducted
 * @returns {number} Attendance percentage (0 to 100, 1 decimal place)
 */
function calculateAttendancePercentage(attended, conducted) {
  const a = Number(attended) || 0;
  const c = Number(conducted) || 0;
  if (c <= 0) return 0;
  if (a >= c) return 100;
  const pct = (a / c) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Calculates projected attendance percentage after skipping additional classes.
 * Formula: (A / (C + S)) * 100
 * @param {number} attended - Current classes attended
 * @param {number} conducted - Current classes conducted
 * @param {number} skipped - Number of upcoming classes to skip
 * @returns {number} Projected attendance percentage (0 to 100, 1 decimal place)
 */
function calculateProjectedAttendance(attended, conducted, skipped) {
  const a = Number(attended) || 0;
  const c = Number(conducted) || 0;
  const s = Math.max(0, Number(skipped) || 0);

  const totalClasses = c + s;
  if (totalClasses <= 0) return 0;
  const projected = (a / totalClasses) * 100;
  return Math.round(projected * 10) / 10;
}

/**
 * Calculates the minimum consecutive classes a student must attend to reach or recover the target threshold.
 * Formula: Math.ceil((T * C - A) / (1 - T))
 * @param {number} attended - Current classes attended
 * @param {number} conducted - Current classes conducted
 * @param {number} thresholdPct - Target threshold in percentage (e.g., 75)
 * @returns {number} Minimum additional classes required
 */
function calculateRecoveryClasses(attended, conducted, thresholdPct = 75) {
  const a = Number(attended) || 0;
  const c = Number(conducted) || 0;
  const t = (Number(thresholdPct) || 75) / 100;

  if (c <= 0) return 0;
  if (t <= 0) return 0;
  if (t >= 1) {
    // If target is 100%, and attended < conducted, you can never reach 100%
    return a >= c ? 0 : Infinity;
  }

  // Already at or above threshold?
  if (a / c >= t) return 0;

  const needed = Math.ceil((t * c - a) / (1 - t));
  return Math.max(0, needed);
}

/**
 * Calculates how many upcoming classes can be safely skipped while staying >= threshold.
 * Useful complementary metric for students!
 * Formula: floor((A - T * C) / T)
 * @param {number} attended 
 * @param {number} conducted 
 * @param {number} thresholdPct 
 * @returns {number} Number of classes that can be safely missed
 */
function calculateBunkableClasses(attended, conducted, thresholdPct = 75) {
  const a = Number(attended) || 0;
  const c = Number(conducted) || 0;
  const t = (Number(thresholdPct) || 75) / 100;

  if (c <= 0 || t <= 0) return 0;
  if (a / c < t) return 0;

  const canSkip = Math.floor((a - t * c) / t);
  return Math.max(0, canSkip);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateAttendancePercentage,
    calculateProjectedAttendance,
    calculateRecoveryClasses,
    calculateBunkableClasses
  };
}

