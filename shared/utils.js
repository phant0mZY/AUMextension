/**
 * Amrita Student Companion - Shared Formatting & Utility Helpers
 */

/**
 * Formats an ISO date string into a friendly relative or localized time.
 * e.g., "Nov 5, 2026, 07:30 PM" or "2 hours ago"
 * @param {string|null} isoString 
 * @returns {string}
 */
function formatLastUpdated(isoString) {
  if (!isoString) return "Never updated";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Unknown date";

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    return "Invalid date";
  }
}

/**
 * Returns attendance status metadata: class name, label, color code.
 * @param {number} percentage 
 * @param {number} threshold 
 */
function getAttendanceStatus(percentage, threshold = 75) {
  const p = Number(percentage) || 0;
  if (p >= threshold + 10) {
    return { status: "safe", label: "Safe", color: "var(--color-success)" };
  } else if (p >= threshold) {
    return { status: "borderline", label: "Near Threshold", color: "var(--color-warning)" };
  } else {
    return { status: "danger", label: "Below Threshold", color: "var(--color-danger)" };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatLastUpdated, getAttendanceStatus };
}

