import { chromium } from '@playwright/test';

const APP_URL = 'http://127.0.0.1:4173/fantasy-war-sim.html';

async function audit() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console errors for debugging
  page.on('console', msg => {
    if (msg.type() === 'error') process.stderr.write('[PAGE ERROR] ' + msg.text() + '\n');
  });

  const findings = [];
  
  function note(label, value, expected = null) {
    const status = expected === null ? 'INFO' : (String(value) === String(expected) ? 'PASS' : 'FAIL');
    findings.push({ status, label, value: String(value), expected: expected !== null ? String(expected) : undefined });
  }

  // Setup
  await page.addInitScript(() => { window.localStorage.clear(); });
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

  // ── 1. INITIAL STATE - Side setup ─────────────────────────────────────────
  const attChooserVisible = await page.locator('#attChooserWrap').isVisible();
  const attSetupVisible   = await page.locator('#attSetupWrap').isVisible();
  const defChooserVisible = await page.locator('#defChooserWrap').isVisible();
  const chooserOrExists   = await page.locator('.chooserOr').count();
  note('attChooserWrap initially visible',  attChooserVisible, true);
  note('attSetupWrap initially hidden',     attSetupVisible,   false);
  note('defChooserWrap initially visible',  defChooserVisible, true);
  note('chooserOr divider count in DOM',    chooserOrExists);

  // Click Create new army (attacker)
  await page.click('#attCreateArmyBtn');
  const attChooserAfterCreate = await page.locator('#attChooserWrap').isVisible();
  const attSetupAfterCreate   = await page.locator('#attSetupWrap').isVisible();
  note('attChooserWrap hidden after Create',  attChooserAfterCreate, false);
  note('attSetupWrap visible after Create',   attSetupAfterCreate,   true);

  const armyNameDraftVisible = await page.locator('#attackerArmyNameDraft').isVisible();
  note('attackerArmyNameDraft visible in creating mode', armyNameDraftVisible, true);

  // Click "Set up another army" to go back
  await page.click('#attSetupChangeBtn');
  const attChooserBack = await page.locator('#attChooserWrap').isVisible();
  note('attChooserWrap visible after cancel', attChooserBack, true);

  // ── 2. Prefill example → both sides creating ─────────────────────────────
  await page.click('#prefillExample');
  const attSetupAfterPrefill  = await page.locator('#attSetupWrap').isVisible();
  const defSetupAfterPrefill  = await page.locator('#defSetupWrap').isVisible();
  const attChooserAfterPrefill = await page.locator('#attChooserWrap').isVisible();
  note('attSetupWrap visible after prefill',   attSetupAfterPrefill,  true);
  note('defSetupWrap visible after prefill',   defSetupAfterPrefill,  true);
  note('attChooserWrap hidden after prefill',  attChooserAfterPrefill, false);

  // ── 3. WAR REPORT STAGING ─────────────────────────────────────────────────
  await page.click('#battleBtn');
  await page.waitForSelector('#warReportModal[open]', { timeout: 5000 });
  const modalOpen = await page.locator('#warReportModal').getAttribute('open');
  note('warReportModal opens', modalOpen !== null, true);

  const stagingNoticeText = await page.locator('[data-testid="war-report-staging-notice"]').textContent().catch(() => 'NOT FOUND');
  note('warReportStagingNotice text contains "No round"', stagingNoticeText.includes('No round has run'), true);
  note('warReportStagingNotice full text', stagingNoticeText);

  const battleAgainText = await page.locator('#warReportBattleAgainBtn').textContent().catch(() => 'NOT FOUND');
  note('warReportBattleAgainBtn initial text', battleAgainText.trim(), 'Start Battle Roll');

  const prevWrapVisible = await page.locator('#warReportPreviousWrap').isVisible().catch(() => false);
  note('warReportPreviousWrap hidden before first battle', prevWrapVisible, false);

  const stagingWrapVisible = await page.locator('#warReportStagingWrap').isVisible().catch(() => false);
  note('warReportStagingWrap visible in staging', stagingWrapVisible, true);

  const weatherStripVisible = await page.locator('#warReportWeatherStrip').isVisible().catch(() => false);
  note('warReportWeatherStrip visible in staging', weatherStripVisible, true);

  // Modal accessibility
  const modalTagName = await page.locator('#warReportModal').evaluate(el => el.tagName.toLowerCase());
  note('warReportModal element tag', modalTagName, 'dialog');

  const autoStatusRole      = await page.locator('#warReportAutoStatus').getAttribute('role').catch(() => 'NOT FOUND');
  const autoStatusAriaLive  = await page.locator('#warReportAutoStatus').getAttribute('aria-live').catch(() => 'NOT FOUND');
  const autoStatusAriaAtomic = await page.locator('#warReportAutoStatus').getAttribute('aria-atomic').catch(() => 'NOT FOUND');
  note('warReportAutoStatus role',       autoStatusRole,       'status');
  note('warReportAutoStatus aria-live',  autoStatusAriaLive,   'polite');
  note('warReportAutoStatus aria-atomic', autoStatusAriaAtomic, 'true');

  const closeExists        = await page.locator('#warReportClose').count();
  const closePrimaryExists = await page.locator('#warReportClosePrimary').count();
  note('warReportClose exists',        closeExists > 0,        true);
  note('warReportClosePrimary exists', closePrimaryExists > 0, true);

  const focusedId = await page.evaluate(() => document.activeElement?.id || 'none');
  note('focused element after modal open', focusedId);

  // Run first battle round
  await page.click('#warReportBattleAgainBtn');
  await page.waitForSelector('#warReportOutcome', { timeout: 5000 });
  const outcomeVisible = await page.locator('#warReportOutcome').isVisible().catch(() => false);
  note('warReportOutcome visible after first round', outcomeVisible, true);

  const stagingWrapAfterBattle = await page.locator('#warReportStagingWrap').isVisible().catch(() => false);
  note('warReportStagingWrap hidden after battle', stagingWrapAfterBattle, false);

  // Close and reopen
  await page.click('#warReportClosePrimary');
  await page.waitForSelector('#warReportModal:not([open])', { timeout: 3000 }).catch(() => {});

  await page.click('#battleBtn');
  await page.waitForSelector('#warReportModal[open]', { timeout: 5000 });
  const battleAgainTextAfter = await page.locator('#warReportBattleAgainBtn').textContent().catch(() => 'NOT FOUND');
  note('warReportBattleAgainBtn text after battle', battleAgainTextAfter.trim(), 'Battle Again');

  const prevWrapAfterBattle = await page.locator('#warReportPreviousWrap').isVisible().catch(() => false);
  note('warReportPreviousWrap visible after battle', prevWrapAfterBattle, true);

  // ── 4. PREVIEW INVALIDATION ───────────────────────────────────────────────
  await page.click('#warReportClosePrimary');
  await page.selectOption('#attackerClass', 'archers');
  await page.click('#battleBtn');
  await page.waitForSelector('#warReportModal[open]', { timeout: 5000 });
  const btnAfterClassChange = await page.locator('#warReportBattleAgainBtn').textContent().catch(() => 'NOT FOUND');
  note('warReportBattleAgainBtn resets after class change', btnAfterClassChange.trim(), 'Start Battle Roll');

  // Also check weather does NOT invalidate
  // Close, change weather, reopen — expect button to still show "Start Battle Roll" for NEW staging
  // but first run a round so we have a result, then change weather, re-check
  await page.click('#warReportBattleAgainBtn'); // run battle so we have result
  await page.waitForSelector('#warReportOutcome', { timeout: 5000 });
  await page.click('#warReportClosePrimary');
  // Change weather
  const weatherSelects = await page.locator('select#weather, select[name="weather"]').count();
  note('weather select count on page', weatherSelects);
  if (weatherSelects > 0) {
    await page.locator('select#weather, select[name="weather"]').first().selectOption({ index: 1 });
    await page.click('#battleBtn');
    await page.waitForSelector('#warReportModal[open]', { timeout: 5000 });
    const btnAfterWeather = await page.locator('#warReportBattleAgainBtn').textContent().catch(() => 'NOT FOUND');
    note('warReportBattleAgainBtn NOT reset after weather change (stays "Battle Again")', btnAfterWeather.trim(), 'Battle Again');
    await page.click('#warReportClosePrimary');
  } else {
    note('weather change invalidation check skipped', 'no weather select found');
  }

  // ── 5. AUTO-BATTLE round limit options ────────────────────────────────────
  // Note: round limit select lives inside the modal, check it exists at all
  const roundLimitCount = await page.locator('#warReportRoundLimit').count();
  note('warReportRoundLimit element exists', roundLimitCount > 0, true);

  let roundLimitOptions = [];
  if (roundLimitCount > 0) {
    // Open modal to access it (it may be inside a dialog)
    await page.click('#prefillExample');
    await page.click('#battleBtn');
    await page.waitForSelector('#warReportModal[open]');

    roundLimitOptions = await page.locator('#warReportRoundLimit option').allTextContents().catch(() => []);
    note('warReportRoundLimit options', JSON.stringify(roundLimitOptions));
    const hasUntilStop = roundLimitOptions.some(t => t.toLowerCase().includes('until') || t.toLowerCase().includes('stop'));
    note('Round limit has "until stop" option', hasUntilStop, true);

    // Check auto-resolve button exists
    const autoResolveBtnCount = await page.locator('#warReportAutoResolveBtn').count();
    note('warReportAutoResolveBtn exists', autoResolveBtnCount > 0, true);

    // Set round limit to 3 (or lowest available)
    const optionValues = await page.locator('#warReportRoundLimit option').evaluateAll(
      opts => opts.map(o => ({ value: o.value, text: o.textContent.trim() }))
    );
    note('warReportRoundLimit all option values', JSON.stringify(optionValues));

    const opt3 = optionValues.find(o => o.value === '3' || o.text === '3');
    if (opt3) {
      await page.locator('#warReportRoundLimit').selectOption(opt3.value);
      const roundLimitVal = await page.locator('#warReportRoundLimit').inputValue();
      note('warReportRoundLimit set to 3', roundLimitVal, '3');

      // Click auto-battle
      await page.click('#warReportAutoResolveBtn');

      // Poll for auto to finish — wait up to 20s checking the button text / modal state
      // instead of relying on a global variable
      let autoDone = false;
      for (let i = 0; i < 40; i++) {
        await page.waitForTimeout(500);
        const btnText = await page.locator('#warReportClosePrimary').textContent().catch(() => '');
        // When auto stops, closePrimary should say "Close" not "Stop"
        if (btnText.trim().toLowerCase() !== 'stop') { autoDone = true; break; }
      }
      note('auto-battle finished within 20s', autoDone, true);

      const autoStatusAfter = await page.locator('#warReportAutoStatus').textContent().catch(() => 'NOT FOUND');
      note('warReportAutoStatus after auto-battle', autoStatusAfter.trim());

      const closePrimaryTextAfter = await page.locator('#warReportClosePrimary').textContent().catch(() => 'NOT FOUND');
      note('warReportClosePrimary text after auto-stopped', closePrimaryTextAfter.trim(), 'Close');

      const roundLimitAfter = await page.locator('#warReportRoundLimit').inputValue();
      note('warReportRoundLimit after auto-battle (check if reset)', roundLimitAfter);
      // The expected reset value: find default (first option, likely "0" or "" or "until stop")
      const defaultOpt = optionValues[0];
      note('warReportRoundLimit default option value', defaultOpt?.value);
      note('warReportRoundLimit reset to default after auto', roundLimitAfter, defaultOpt?.value ?? '');
    } else {
      note('option with value/text "3" found in warReportRoundLimit', false, true);
    }

    // ── 6. ESC DURING AUTO-RUNNING ───────────────────────────────────────────
    // Close, re-prefill, reopen
    await page.click('#warReportClosePrimary').catch(() => {});
    await page.click('#prefillExample');
    await page.click('#battleBtn');
    await page.waitForSelector('#warReportModal[open]');

    // Try to simulate auto-running via JS globals if they exist, else skip gracefully
    const hasAutoGlobal = await page.evaluate(() => typeof _warReportAutoRunning !== 'undefined');
    note('_warReportAutoRunning global exists', hasAutoGlobal);

    if (hasAutoGlobal) {
      const hasCreateSession = await page.evaluate(() => typeof createWarReportAutoSession !== 'undefined');
      const hasOpenModal     = await page.evaluate(() => typeof openWarReportModal !== 'undefined');
      const hasSetState      = await page.evaluate(() => typeof setWarReportActionState !== 'undefined');
      note('createWarReportAutoSession exists', hasCreateSession);
      note('openWarReportModal exists',         hasOpenModal);
      note('setWarReportActionState exists',    hasSetState);

      if (hasCreateSession && hasOpenModal && hasSetState) {
        await page.evaluate(() => {
          _warReportAutoRunning = true;
          _warReportAutoLoopActive = false;
          _warReportAutoStopRequested = false;
          _warReportAutoSession = createWarReportAutoSession(null);
          openWarReportModal({ mode: 'auto-running', session: _warReportAutoSession, payload: null });
          setWarReportActionState({ result: { newAtt: 1, newDef: 1 }, stopReason: null }, 'auto-running');
        });

        const closePrimaryDuringRun = await page.locator('#warReportClosePrimary').textContent();
        note('warReportClosePrimary text while auto-running', closePrimaryDuringRun.trim(), 'Stop');

        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        const modalAfterEsc = await page.locator('#warReportModal').getAttribute('open');
        note('warReportModal still open after Esc during auto-running', modalAfterEsc !== null, true);
        const autoRunningAfterEsc = await page.evaluate(() => window._warReportAutoRunning);
        note('_warReportAutoRunning false after Esc', autoRunningAfterEsc, false);
      } else {
        note('Esc auto-running test skipped', 'required globals missing');
      }
    } else {
      note('Esc auto-running test skipped', '_warReportAutoRunning not a global');
    }
  } else {
    note('auto-battle tests skipped', 'warReportRoundLimit not found');
  }

  // ── 7. HISTORY TAB ────────────────────────────────────────────────────────
  await page.click('#warReportClosePrimary').catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(200);

  const historyTabSelector = '.tab[data-tab="history"]';
  const historyTabCount = await page.locator(historyTabSelector).count();
  note('history tab element exists', historyTabCount > 0, true);

  if (historyTabCount > 0) {
    await page.click(historyTabSelector);
    await page.waitForTimeout(200);

    const historyListCount = await page.locator('#historyList').count();
    note('historyList element exists', historyListCount > 0, true);

    if (historyListCount > 0) {
      const historyContent = await page.locator('#historyList').textContent().catch(() => 'NOT FOUND');
      note('historyList has content', historyContent.length > 0, true);
      note('historyList first 150 chars', historyContent.substring(0, 150).trim());

      // Check for session groups / toggle buttons
      const historyToggleCount = await page.locator('.historyToggleBtn, [id^="historyToggle"]').count();
      note('historyToggleBtn elements found', historyToggleCount);

      if (historyToggleCount > 0) {
        const firstToggle = page.locator('.historyToggleBtn, [id^="historyToggle"]').first();
        const ariaExpanded = await firstToggle.getAttribute('aria-expanded');
        const ariaControls = await firstToggle.getAttribute('aria-controls');
        note('first historyToggleBtn aria-expanded', ariaExpanded);
        note('first historyToggleBtn has aria-controls', ariaControls !== null, true);
      }
    }
  }

  // ── 8. ACCESSIBILITY SPOT CHECK ───────────────────────────────────────────
  // dirtyGuardModal
  const dirtyGuardExists = await page.locator('#dirtyGuardModal').count();
  note('dirtyGuardModal element exists', dirtyGuardExists > 0);
  if (dirtyGuardExists > 0) {
    const dirtyGuardTag = await page.locator('#dirtyGuardModal').evaluate(el => el.tagName.toLowerCase());
    note('dirtyGuardModal tag name', dirtyGuardTag);
    // Not currently open (no [open] attribute)
    const dirtyGuardOpen = await page.locator('#dirtyGuardModal').getAttribute('open');
    note('dirtyGuardModal open attribute initially', dirtyGuardOpen === null ? 'null (closed)' : 'open');
  }

  // warReportModal tag already checked above
  // warReportAutoStatus ARIA already checked above

  // ── 9. FOCUS ON MODAL OPEN ────────────────────────────────────────────────
  // Reopen modal to double-check focus
  await page.click('.tab[data-tab="battle"]').catch(() => {});
  await page.click('#battleBtn').catch(() => {});
  await page.waitForSelector('#warReportModal[open]', { timeout: 5000 }).catch(() => {});
  const focusedIdRecheck = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName?.toLowerCase() || 'none');
  note('focused element when modal re-opened', focusedIdRecheck);

  // ── DONE ──────────────────────────────────────────────────────────────────
  await browser.close();

  // Print report
  console.log('\n=== BATTLE FLOW AUDIT RESULTS ===\n');
  for (const f of findings) {
    const icon = f.status === 'PASS' ? '✓' : f.status === 'FAIL' ? '✗' : '•';
    const line = f.expected !== undefined
      ? `${icon} [${f.status}] ${f.label}: got "${f.value}"${f.status !== 'PASS' ? ` (expected "${f.expected}")` : ''}`
      : `${icon} [INFO] ${f.label}: "${f.value}"`;
    console.log(line);
  }

  const fails = findings.filter(f => f.status === 'FAIL');
  console.log(`\n=== SUMMARY: ${findings.filter(f => f.status === 'PASS').length} PASS, ${fails.length} FAIL, ${findings.filter(f => f.status === 'INFO').length} INFO ===`);
  if (fails.length) {
    console.log('\nFAILURES:');
    fails.forEach(f => console.log(`  ✗ ${f.label}: got "${f.value}" expected "${f.expected}"`));
  }
}

audit().catch(err => { console.error(err); process.exit(1); });
