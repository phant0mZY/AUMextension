/**
 * Amrita Student Companion - Preloaded Academic Snapshot
 * Based on Kshitheesh Sai R Varma's MCA (AI & Data Science) Semester 1 record.
 */

const SAMPLE_DATA = {
  schemaVersion: 1,

  marks: {
    lastUpdated: new Date().toISOString(),
    semester: "Semester 1",
    courses: [
      {
        courseCode: "26MAT501",
        courseName: "Mathematical Foundations for Computer Applications",
        assessments: [
          { examName: "Assignment 1", examType: "Regular", marks: 27.5, maxMarks: 30 },
          { examName: "Assignment 2", examType: "Regular", marks: 7.62, maxMarks: 10 },
          { examName: "Assignment 3", examType: "Regular", marks: 8.0, maxMarks: 10 },
          { examName: "Class Participation", examType: "Regular", marks: 5.0, maxMarks: 5 },
          { examName: "Midterm Exam", examType: "Regular", marks: 45.5, maxMarks: 50 }
        ]
      },
      {
        courseCode: "26CSA634",
        courseName: "Machine Learning",
        assessments: [
          { examName: "Assignment 1", examType: "Regular", marks: 3.0, maxMarks: 5 },
          { examName: "Class Test", examType: "Regular", marks: 10.0, maxMarks: 10 },
          { examName: "Continuous Assessment", examType: "Regular", marks: 4.0, maxMarks: 5 },
          { examName: "Lab Assignment", examType: "Regular", marks: 10.0, maxMarks: 10 },
          { examName: "Midterm Exam", examType: "Regular", marks: 37.0, maxMarks: 50 }
        ]
      },
      {
        courseCode: "26CSA582",
        courseName: "Data Structures Lab",
        assessments: [
          { examName: "Continuous Evaluation", examType: "Regular", marks: 45.0, maxMarks: 50 }
        ]
      },
      {
        courseCode: "26CSA581",
        courseName: "Object-Oriented Programming Using Java Lab",
        assessments: [
          { examName: "Assignment 1", examType: "Regular", marks: 9.0, maxMarks: 10 },
          { examName: "Class Test", examType: "Regular", marks: 16.0, maxMarks: 20 },
          { examName: "Lab Record", examType: "Regular", marks: 9.0, maxMarks: 10 },
          { examName: "Midterm Exam", examType: "Regular", marks: 50.0, maxMarks: 50 }
        ]
      },
      {
        courseCode: "26CSA580",
        courseName: "Advanced DBMS Lab",
        assessments: [
          { examName: "Assignment 1", examType: "Regular", marks: 19.0, maxMarks: 20 },
          { examName: "Assignment 2", examType: "Regular", marks: 9.0, maxMarks: 10 },
          { examName: "Assignment 3", examType: "Regular", marks: 9.0, maxMarks: 10 },
          { examName: "Midterm Exam", examType: "Regular", marks: 39.0, maxMarks: 50 }
        ]
      },
      {
        courseCode: "26CSA532",
        courseName: "Artificial Intelligence",
        assessments: [
          { examName: "Midterm Exam", examType: "Regular", marks: 41.0, maxMarks: 50 },
          { examName: "Theory Assignment", examType: "Regular", marks: 9.5, maxMarks: 10 }
        ]
      },
      {
        courseCode: "26CSA504",
        courseName: "Advanced DBMS",
        assessments: [
          { examName: "Assignment 1", examType: "Regular", marks: 9.0, maxMarks: 10 },
          { examName: "Assignment 2", examType: "Regular", marks: 9.0, maxMarks: 10 },
          { examName: "Midterm Exam", examType: "Regular", marks: 41.0, maxMarks: 50 }
        ]
      },
      {
        courseCode: "26CSA503",
        courseName: "Data Structures",
        assessments: [
          { examName: "Assignment 1", examType: "Regular", marks: 10.0, maxMarks: 10 },
          { examName: "Midterm Exam", examType: "Regular", marks: 37.0, maxMarks: 50 }
        ]
      },
      {
        courseCode: "26CSA502",
        courseName: "Object-Oriented Programming Using Java",
        assessments: [
          { examName: "Assignment 1", examType: "Regular", marks: 9.0, maxMarks: 10 },
          { examName: "Midterm Exam", examType: "Regular", marks: 43.5, maxMarks: 50 }
        ]
      },
      {
        courseCode: "25AVP501",
        courseName: "Mastery Over Mind",
        assessments: [
          { examName: "Midterm Exam", examType: "Regular", marks: 37.0, maxMarks: 50 }
        ]
      },
      {
        courseCode: "24LSK502",
        courseName: "Life Skills 1",
        assessments: []
      },
      {
        courseCode: "22ADM501",
        courseName: "Glimpses of Indian Culture",
        assessments: [
          { examName: "Midterm Exam", examType: "Regular", marks: 40.0, maxMarks: 50 }
        ]
      }
    ]
  },

  attendance: {
    lastUpdated: new Date().toISOString(),
    semester: "Semester 1",
    courses: [
      {
        courseCode: "26CSA502",
        courseName: "Object-Oriented Programming Using Java",
        classesAttended: 24,
        classesConducted: 31,
        percentage: 77.42
      },
      {
        courseCode: "25AVP501",
        courseName: "Mastery Over Mind",
        classesAttended: 17,
        classesConducted: 19,
        percentage: 89.47
      },
      {
        courseCode: "26CSA504",
        courseName: "Advanced DBMS",
        classesAttended: 33,
        classesConducted: 38,
        percentage: 86.84
      },
      {
        courseCode: "26CSA581",
        courseName: "Object-Oriented Programming Using Java Lab",
        classesAttended: 22,
        classesConducted: 29,
        percentage: 75.86
      },
      {
        courseCode: "26CSA582",
        courseName: "Data Structures Lab",
        classesAttended: 18,
        classesConducted: 23,
        percentage: 78.26
      },
      {
        courseCode: "24LSK502",
        courseName: "Life Skills 1",
        classesAttended: 51,
        classesConducted: 64,
        percentage: 79.69
      },
      {
        courseCode: "26CSA503",
        courseName: "Data Structures",
        classesAttended: 35,
        classesConducted: 45,
        percentage: 77.78
      },
      {
        courseCode: "26CSA580",
        courseName: "Advanced DBMS Lab",
        classesAttended: 29,
        classesConducted: 34,
        percentage: 85.29
      },
      {
        courseCode: "26CSA634",
        courseName: "Machine Learning",
        classesAttended: 51,
        classesConducted: 62,
        percentage: 82.26
      },
      {
        courseCode: "26MAT501",
        courseName: "Mathematical Foundations for Computer Applications",
        classesAttended: 35,
        classesConducted: 42,
        percentage: 83.33
      },
      {
        courseCode: "22ADM501",
        courseName: "Glimpses of Indian Culture",
        classesAttended: 14,
        classesConducted: 16,
        percentage: 87.5
      },
      {
        courseCode: "26CSA532",
        courseName: "Artificial Intelligence",
        classesAttended: 34,
        classesConducted: 39,
        percentage: 87.18
      }
    ]
  },

  settings: {
    attendanceThreshold: 75
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAMPLE_DATA };
}
