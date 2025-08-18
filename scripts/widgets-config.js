<script>
// Minimal config you can tweak later
window.PU_WIDGETS_CFG = {
  // 1) Your proxy base URL
  baseUrl: 'https://YOUR-RENDER-APP.onrender.com', // <-- EDIT

  // 2) Smartsheet sheet IDs
  sheets: {
    employeeMaster: '2195459817820036',
    levelTracker:   '8346763116105604',   // used for Power Hour goals mapping
    powerHours:     '1240392906264452',
    dynamicGoals:   '3542697273937796',
    ciSubmissions:  '6584024920182660',
    safetyConcerns: '4089265651666820',
    qcCatches:      '1431258165890948'
  },

  // 3) Column names (exact Smartsheet titles)
columns: {
  // Identity
  employeeId:   'Position ID',
  employeeName: 'Display Name',

  // Header Level (fast path from Employee Master)
  headerLevelSourceSheetKey: 'employeeMaster',
  headerLevelColumn: 'PowerUp Level (Select)',

  // Power Hours (match old app)
  phEmpCol:              'Position ID',       // <-- set to how PH sheet stores the person
  phCompletedFlagCol:    'Completed',         // <-- NEW
  phCompletedHoursCol:   'Completed Hours',   // <-- NEW
  phMonthCol:            'Month',             // supports 'YYYY-MM' or date text
  phDateCol:             'Date',              // fallback

  // Goals & generic
  goalsLevelCol: 'Level',
  goalsMinCol:   'Min',
  goalsMaxCol:   'Max',
  dateColGeneric: 'Created Date'
},

  // 4) DOM targets (you already added these in your HTML)
  selectors: {
    headerName:  '#js-header-name',
    headerLevel: '#js-header-level',

    phCount:     '#js-ph-hours',
    phBar:       '#js-ph-bar',
    phMsg:       '#js-ph-msg',
    phGoal:      '#js-ph-goal',

    tokenTotal:  '#js-token-total',
    tokenMonth:  '#js-token-month',
    tokenMsg:    '#js-token-msg'
  },

  // 5) Token sources (adjust points/date/status columns if yours differ)
  tokens: {
    enabled: true,
    sources: [
      { sheetKey: 'ciSubmissions',  empCol: 'Employee ID', pointsCol: 'Points', statusCol: 'Status', approvedValue: 'Approved', dateCol: 'Created Date' },
      { sheetKey: 'safetyConcerns', empCol: 'Employee ID', pointsCol: 'Points', statusCol: 'Status', approvedValue: 'Approved', dateCol: 'Created Date' },
      { sheetKey: 'qcCatches',      empCol: 'Employee ID', pointsCol: 'Points', statusCol: 'Status', approvedValue: 'Approved', dateCol: 'Created Date' }
    ]
  },

  defaults: { minHours: 8, maxHours: 8 }
};
</script>
