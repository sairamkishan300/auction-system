// ============================================================
//  AUCTION APP — CONFIG FILE
//  Edit these values to match your Google Sheets setup
// ============================================================

const CONFIG = {

  // ----------------------------------------------------------
  // GOOGLE SHEET IDs
  // ----------------------------------------------------------
  STUDENT_DATA_SHEET_ID: "1eziZUNDjHkNd17pmENcC59SLU1Ns0qv9JBmP-_qWEwk",   // Sheet 1: student details
  RESULTS_SHEET_ID: "1eziZUNDjHkNd17pmENcC59SLU1Ns0qv9JBmP-_qWEwk",        // Sheet 2: auction results

  // ----------------------------------------------------------
  // SHEET NAMES (tab names inside each spreadsheet)
  // ----------------------------------------------------------
  STUDENT_SHEET_NAME: "Students",   // tab name in Sheet 1
  RESULTS_SHEET_NAME: "Results",    // tab name in Sheet 2

  // ----------------------------------------------------------
  // COLUMN MAPPING  (A=1, B=2, C=3 … or use letter strings)
  // Row 1 is the header row — data starts from row 2
  // ----------------------------------------------------------
  COLUMNS: {
    NAME: "C",   // Student full name
    BATCH: "D",   // Batch / year / section
    MUSIC: "E",   // Music score  (out of 5)
    DANCE: "F",   // Dance score
    ARTS: "G",   // Arts score
    PHOTOGRAPHY: "H",   // Photography score
    CINEMA: "I",   // Cinema score
    ACADEMICS: "J",   // Academics score
    EDITING: "K",   // Editing score
    DIRECTION: "L",   // Direction score
    SPORTS: "M",   // Sports score
    ONLINE_GAMES: "N",   // Online Games score
    NOTE: "O",   // Student's own note  e.g. "cricket player"
  },

  // List of skills in the same order as above (used for display & sorting)
  SKILL_KEYS: [
    "MUSIC", "DANCE", "ARTS", "PHOTOGRAPHY", "CINEMA",
    "ACADEMICS", "EDITING", "DIRECTION", "SPORTS", "ONLINE_GAMES"
  ],

  // Human-readable labels for each skill key
  SKILL_LABELS: {
    MUSIC: "Music",
    DANCE: "Dance",
    ARTS: "Arts",
    PHOTOGRAPHY: "Photography",
    CINEMA: "Cinema",
    ACADEMICS: "Academics",
    EDITING: "Editing",
    DIRECTION: "Direction",
    SPORTS: "Sports",
    ONLINE_GAMES: "Online Games",
  },

  // ----------------------------------------------------------
  // STUDENT & SET SETTINGS
  // ----------------------------------------------------------
  TOTAL_STUDENTS: 10,   // Total number of students in the pool
  STUDENTS_PER_SET: 2,   // How many students form one bidding set

  // ----------------------------------------------------------
  // TEAM SETTINGS
  // ----------------------------------------------------------
  TEAMS: [
    { id: "team_1", name: "Team Alpha" },
    { id: "team_2", name: "Team Beta" },
    { id: "team_3", name: "Team Gamma" },
    { id: "team_4", name: "Team Delta" },
  ],

  // Virtual coins given to each team at the start
  TEAM_BUDGET: 100000,

  // Maximum sets (and thus students) each team can win.
  // Formula: TOTAL_STUDENTS / STUDENTS_PER_SET / NUMBER_OF_TEAMS
  // Leave as null to auto-calculate.
  MAX_SETS_PER_TEAM: null,   // e.g. set to 4 to hard-code

  // ----------------------------------------------------------
  // BIDDING TIMER
  // ----------------------------------------------------------
  BID_TIMER_SECONDS: 15,   // Countdown after the first bid on a set

  // ----------------------------------------------------------
  // RESULTS SHEET COLUMNS  (written by the app after each bid)
  // ----------------------------------------------------------
  RESULTS_COLUMNS: {
    SET_NUMBER: "A",
    TEAM_NAME: "B",
    WINNING_BID: "C",
    STUDENT_NAMES: "D",   // comma-separated names of students in the set
    TIMESTAMP: "E",
  },
};
