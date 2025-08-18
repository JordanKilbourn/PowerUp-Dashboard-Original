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
    employeeId:   'Position ID',          // your canonical key
    employeeName: 'Display Name',

    // Header Level — FAST PATH
    headerLevelSourceSheetKey: 'employeeMaster',
    headerLevelColumn:         'PowerUp Level (Select)',

    // Power Hours
    phEmpCol:    'Employee ID',           // change to 'Position ID' if that’s how PH sheet stores it
    phHoursCol:  'Hours',
    phMonthCol:  'Month',                 // 'YYYY-MM' or a parseable date text
    phDateCol:   'Date',                  // fallback if Month missing

    // Dynamic goals (per-level)
    goalsLevelCol: 'Level',
    goalsMinCol:   'Min',
    goalsMaxCol:   'Max',

    // Generic date column for tokens when no specific one is present
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
