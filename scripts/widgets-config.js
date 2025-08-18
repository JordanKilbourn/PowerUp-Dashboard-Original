// widgets-config.js
// Edit baseUrl if needed; adjust column titles only if your Smartsheet uses different names.
window.PU_WIDGETS_CFG = {
  // Your proxy base URL
  baseUrl: 'https://YOUR-RENDER-APP.onrender.com', // <-- EDIT

  // Smartsheet sheet IDs
  sheets: {
    employeeMaster: '2195459817820036',
    levelTracker:   '8346763116105604',   // used to derive numeric level for goals
    powerHours:     '1240392906264452',
    dynamicGoals:   '3542697273937796',
    ciSubmissions:  '6584024920182660',
    safetyConcerns: '4089265651666820',
    qcCatches:      '1431258165890948'
  },

  // Column titles (exact match to Smartsheet)
  columns: {
    // Identity
    employeeId:   'Position ID',
    employeeName: 'Display Name',

    // Header Level (fast path from Employee Master)
    headerLevelSourceSheetKey: 'employeeMaster',
    headerLevelColumn:         'PowerUp Level (Select)',

    // Power Hours (align with the old app behavior)
    // If your PH sheet stores employee by Employee ID, change to 'Employee ID'.
    phEmpCol:            'Position ID',
    phCompletedFlagCol:  'Completed',         // truthy values: true/yes/completed/1/x
    phCompletedHoursCol: 'Completed Hours',   // preferred; falls back to phHoursCol if absent
    phHoursCol:          'Hours',
    phMonthCol:          'Month',             // accepts 'YYYY-MM' or any date-like text
    phDateCol:           'Date',              // fallback when Month missing

    // Dynamic goals (level → min/max)
    goalsLevelCol: 'Level',
    goalsMinCol:   'Min',
    goalsMaxCol:   'Max',

    // Generic date name used by tokens if a source doesn’t specify one
    dateColGeneric: 'Created Date'
  },

  // DOM targets already added to your HTML
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

  // Token aggregation
  tokens: {
    enabled: true,
    sources: [
      // CI uses "Token Payout" (old app behavior)
      { sheetKey: 'ciSubmissions',  empCol: 'Employee ID', pointsCol: 'Token Payout', statusCol: 'Status', approvedValue: 'Approved', dateCol: 'Created Date' },
      // Keep/remove these depending on your program rules
      { sheetKey: 'safetyConcerns', empCol: 'Employee ID', pointsCol: 'Points',       statusCol: 'Status', approvedValue: 'Approved', dateCol: 'Created Date' },
      { sheetKey: 'qcCatches',      empCol: 'Employee ID', pointsCol: 'Points',       statusCol: 'Status', approvedValue: 'Approved', dateCol: 'Created Date' }
    ]
  },

  // Defaults if no goal row matches a level
  defaults: { minHours: 8, maxHours: 8 }
};
