/**
 * Amrita Student Companion - Course Code Mapping
 * 
 * Maps Amrita course codes (e.g., 26CSA502) to student-readable course titles.
 * If a course is not listed here, getCourseName() gracefully falls back to the original code.
 */

const COURSE_NAMES = {
  "26CSA502": "Object-Oriented Programming Using Java",
  "26MAT501": "Mathematical Foundations for Computer Applications",
  "26CSA503": "Data Structures",
  "26CSA504": "Advanced DBMS",
  "26CSA581": "Object-Oriented Programming Using Java Lab",
  "26CSA582": "Data Structures Lab",
  "26CSA580": "Advanced DBMS Lab",
  "25AVP501": "Mastery Over Mind",
  "22ADM501": "Glimpses of Indian Culture",
  "24LSK502": "Life Skills 1",
  "26CSA532": "Artificial Intelligence",
  "26CSA634": "Machine Learning"
};

/**
 * Returns readable course title or the code itself if unknown.
 * @param {string} code Course code (e.g. "26CSA502")
 * @returns {string} Course title or original code
 */
function getCourseName(code) {
  if (!code || typeof code !== 'string') return "Unknown Course";
  const cleanCode = code.trim().toUpperCase();
  return COURSE_NAMES[cleanCode] || cleanCode;
}

// Export for ES modules or script tags
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COURSE_NAMES, getCourseName };
}

