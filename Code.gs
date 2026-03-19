// ============================================================
//  AUCTION APP — Code.gs  (Google Apps Script)
//  Deploy as Web App → Execute as: Me | Who has access: Anyone
// ============================================================

// ── Inline config (mirrors config.js — keep both in sync) ───
const CFG = {
  STUDENT_DATA_SHEET_ID: "1eziZUNDjHkNd17pmENcC59SLU1Ns0qv9JBmP-_qWEwk",
  RESULTS_SHEET_ID:      "1eziZUNDjHkNd17pmENcC59SLU1Ns0qv9JBmP-_qWEwk",
  STUDENT_SHEET_NAME:    "Students",
  RESULTS_SHEET_NAME:    "Results",

  COLUMNS: {
    NAME: "C", BATCH: "D",
    MUSIC: "E", DANCE: "F", ARTS: "G", PHOTOGRAPHY: "H", CINEMA: "I",
    ACADEMICS: "J", EDITING: "K", DIRECTION: "L", SPORTS: "M", ONLINE_GAMES: "N",
    NOTE: "O",
  },

  SKILL_KEYS: ["MUSIC","DANCE","ARTS","PHOTOGRAPHY","CINEMA",
               "ACADEMICS","EDITING","DIRECTION","SPORTS","ONLINE_GAMES"],

  SKILL_LABELS: {
    MUSIC:"Music", DANCE:"Dance", ARTS:"Arts", PHOTOGRAPHY:"Photography",
    CINEMA:"Cinema", ACADEMICS:"Academics", EDITING:"Editing",
    DIRECTION:"Direction", SPORTS:"Sports", ONLINE_GAMES:"Online Games",
  },

  TOTAL_STUDENTS:    10,
  STUDENTS_PER_SET:   2,
  TEAMS: [
    {id:"team_1",name:"Team Alpha"},
    {id:"team_2",name:"Team Beta"},
    {id:"team_3",name:"Team Gamma"},
    {id:"team_4",name:"Team Delta"},
  ],
  TEAM_BUDGET:         100000,
  MAX_SETS_PER_TEAM:   null,
  BID_TIMER_SECONDS:   10,

  RESULTS_COLUMNS: {
    SET_NUMBER:"A", TEAM_NAME:"B", WINNING_BID:"C",
    STUDENT_NAMES:"D", TIMESTAMP:"E",
  },
};

// ── Helpers ─────────────────────────────────────────────────

function colIndex(letter) {
  // "A" → 1, "B" → 2, etc.
  return letter.toUpperCase().charCodeAt(0) - 64;
}

function getStudentSheet() {
  return SpreadsheetApp
    .openById(CFG.STUDENT_DATA_SHEET_ID)
    .getSheetByName(CFG.STUDENT_SHEET_NAME);
}

function getResultsSheet() {
  return SpreadsheetApp
    .openById(CFG.RESULTS_SHEET_ID)
    .getSheetByName(CFG.RESULTS_SHEET_NAME);
}

// ── Web App entry points ─────────────────────────────────────

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile("index")
    .setTitle("Cultural Auction")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const action  = payload.action;

  if (action === "getConfig")    return respond(getConfig());
  if (action === "getStudents")  return respond(getStudents());
  if (action === "saveResult")   return respond(saveResult(payload.data));

  return respond({ error: "Unknown action" });
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── API: getConfig ───────────────────────────────────────────

function getConfig() {
  const totalSets = Math.floor(CFG.TOTAL_STUDENTS / CFG.STUDENTS_PER_SET);
  const maxSets   = CFG.MAX_SETS_PER_TEAM ||
                    Math.floor(totalSets / CFG.TEAMS.length);
  return {
    teams:           CFG.TEAMS,
    teamBudget:      CFG.TEAM_BUDGET,
    studentsPerSet:  CFG.STUDENTS_PER_SET,
    totalStudents:   CFG.TOTAL_STUDENTS,
    bidTimerSeconds: CFG.BID_TIMER_SECONDS,
    totalSets:       totalSets,
    maxSetsPerTeam:  maxSets,
    skillLabels:     CFG.SKILL_LABELS,
    skillKeys:       CFG.SKILL_KEYS,
  };
}

// ── API: getStudents ─────────────────────────────────────────

function getStudents() {
  const sheet     = getStudentSheet();
  const lastRow   = sheet.getLastRow();
  if (lastRow < 2) return { students: [] };

  // Read all data starting from row 2
  const data = sheet.getRange(2, 1, lastRow - 1, colIndex(CFG.COLUMNS.NOTE)).getValues();

  const students = data.map((row, i) => {
    const skills = {};
    CFG.SKILL_KEYS.forEach(key => {
      skills[key] = parseFloat(row[colIndex(CFG.COLUMNS[key]) - 1]) || 0;
    });

    // Top 3 skills
    const sorted = Object.entries(skills)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]) => ({ key: k, label: CFG.SKILL_LABELS[k], score: v }));

    return {
      id:        i + 2,                              // row number
      name:      row[colIndex(CFG.COLUMNS.NAME) - 1],
      batch:     row[colIndex(CFG.COLUMNS.BATCH) - 1],
      skills:    skills,
      topSkills: sorted,
      note:      row[colIndex(CFG.COLUMNS.NOTE) - 1] || "",
    };
  }).filter(s => s.name); // skip blank rows

  // Build balanced sets: each set covers a variety of top skills
  const sets = buildBalancedSets(students, CFG.STUDENTS_PER_SET);
  return { students, sets };
}

// ── Set builder: greedy skill-diversity grouping ─────────────

function buildBalancedSets(students, perSet) {
  // Sort students by their overall score descending so top talent
  // is spread across sets rather than concentrated.
  const pool = [...students].sort((a, b) => {
    const scoreA = Object.values(a.skills).reduce((x, y) => x + y, 0);
    const scoreB = Object.values(b.skills).reduce((x, y) => x + y, 0);
    return scoreB - scoreA;
  });

  const sets = [];
  while (pool.length >= perSet) {
    const set = [];
    const usedSkills = new Set();

    // Pick the first student (highest overall remaining)
    set.push(pool.shift());
    set[0].topSkills.forEach(s => usedSkills.add(s.key));

    // Fill remaining slots preferring students with new top skills
    for (let slot = 1; slot < perSet && pool.length > 0; slot++) {
      let bestIdx = 0;
      let bestNovelty = -1;

      pool.forEach((student, idx) => {
        const novelty = student.topSkills.filter(s => !usedSkills.has(s.key)).length;
        if (novelty > bestNovelty) { bestNovelty = novelty; bestIdx = idx; }
      });

      const chosen = pool.splice(bestIdx, 1)[0];
      set.push(chosen);
      chosen.topSkills.forEach(s => usedSkills.add(s.key));
    }

    sets.push({
      setNumber: sets.length + 1,
      students:  set,
      skills:    [...usedSkills],
    });
  }

  // If leftover students exist, append as a partial last set
  if (pool.length > 0) {
    sets.push({
      setNumber: sets.length + 1,
      students:  pool,
      skills:    [...new Set(pool.flatMap(s => s.topSkills.map(t => t.key)))],
    });
  }

  return sets;
}

// ── API: saveResult ──────────────────────────────────────────

function saveResult(data) {
  /*
   * data: {
   *   setNumber:    number,
   *   teamName:     string,
   *   winningBid:   number,
   *   studentNames: string[],
   * }
   */
  const sheet = getResultsSheet();

  // Write header if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Set #", "Team", "Winning Bid (coins)",
                     "Students", "Timestamp"]);
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
  }

  sheet.appendRow([
    data.setNumber,
    data.teamName,
    data.winningBid,
    data.studentNames.join(", "),
    new Date().toLocaleString(),
  ]);

  // Auto-resize columns for readability
  sheet.autoResizeColumns(1, 5);

  return { success: true };
}
