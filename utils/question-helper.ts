import { getLocator } from "./locator-utils";
import { expect, Locator, Page, TestInfo } from "@playwright/test";
import { selectByText } from "./action-utils";
// (removed incorrect import of selectYesNoRadioCore, selectDropdownCore)


import { createAutoQuestionFetcher } from "./questionTextMapper";
import { MAX_TIMEOUT } from "./timeout-constants";
import { isElementVisible } from "./element-utils";
/**
 * Checks if a question is present in the DOM by resolving the question text from shortCode.
 * Uses partial, case-insensitive match for robustness.
 */
export async function safeQuestionPresent(page: Page, shortCode: string): Promise<boolean> {
  if (!shortCode) return false;
  const getQuestion = createAutoQuestionFetcher(page);
  const questionText = await getQuestion(shortCode, { optional: true });
  if (!questionText) {
    console.log(`[SKIP] Could not resolve question text for shortCode '${shortCode}'.`);
    return false;
  }
  const normalizedLabel = questionText.trim().toLowerCase();
  const locator = page.locator(`//*[contains(translate(normalize-space(text()), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "${normalizedLabel}")]`);
  const isVisible = await locator.first().isVisible().catch(() => false);
  if (!isVisible) {
    console.log(`[SKIP] Question with text '${questionText}' (shortCode: ${shortCode}) not present in DOM.`);
  }
  return isVisible;
}
/**
 * Only answer Yes/No radio if the label is visible in the current tab.
 */
/**
 * Only answer Yes/No radio if the question is visible in the current tab (question text resolved from shortCode).
 */
export async function safeSelectYesNoRadioCore(
  page: Page,
  shortCode: string,
  value: string | undefined,
  options: {
    retries?: number;
    retryDelay?: number;
    optional?: boolean;
  } = {}
): Promise<boolean> {
  if (await safeQuestionPresent(page, shortCode)) {
    return await selectYesNoRadioCore(page, shortCode, value, options);
  } else {
    console.log(`[SKIP] Question '${shortCode}' not visible, skipping.`);
    return false;
  }
}

/**
 * Only answer dropdown if the label is visible in the current tab.
 */
/**
 * Only answer dropdown if the question is visible in the current tab (question text resolved from shortCode).
 */
export async function safeSelectDropdownCore(
  page: Page,
  shortCode: string,
  value: string | undefined,
  options: {
    retries?: number;
    retryDelay?: number;
    optional?: boolean;
  } = {}
): Promise<boolean> {
  if (await safeQuestionPresent(page, shortCode)) {
    return await selectDropdownCore(page, shortCode, value, options);
  } else {
    console.log(`[SKIP] Dropdown '${shortCode}' not visible, skipping.`);
    return false;
  }
}
// (removed duplicate import)
/**
 * Generic helper for Core radio buttons using question code and Excel data.
 * This is similar to selectYesNoCore but can be used for any radio group (not just Yes/No).
 */
export async function selectRadioCore(
  page: Page,
  shortCode: string,
  answer: string | undefined,
  options: {
    retries?: number;
    retryDelay?: number;
    optional?: boolean;
  } = {}
): Promise<boolean> {
  const { retries = 2, retryDelay = 300, optional = true } = options;
  if (!answer) {
    console.log(`⚠️ No answer provided for ${shortCode}, skipping`);
    return false;
  }
  const normalized = answer.trim();
  if (!normalized) {
    console.log(`⚠️ Blank answer for ${shortCode}, skipping`);
    return false;
  }
  const getQuestion = createAutoQuestionFetcher(page);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const questionText = await getQuestion(shortCode, { optional });
      if (!questionText) {
        if (attempt < retries) {
          console.log(`⏳ Core radio question ${shortCode} not found yet, retry ${attempt}/${retries}...`);
          await page.waitForTimeout(retryDelay);
          continue;
        } else {
          console.log(`⚠️ Core radio question ${shortCode} not found after ${retries} attempts`);
          return false;
        }
      }

      // Try all locator patterns for this question text, once per attempt
      const locatorPatterns = [
        // Main value-based locator (case-insensitive, trimmed)
        `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//td//input[translate(normalize-space(@value),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')=translate('${normalized}','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')]`,
        // Yes/No inputvalue pattern
        normalized.toLowerCase() === 'yes'
          ? `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//td//input[@inputvalue='true']`
          : `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//td//input[@inputvalue='false']`,
        // ExtJS radio button (inputvalue)
        `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//input[@type='button' and contains(@class,'x-form-radio') and translate(@inputvalue,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')=translate('${normalized}','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')]`,
        // Native radio (input type=radio)
        `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//input[@type='radio' and (translate(@value,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')=translate('${normalized}','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'))]`,
        // Label-based radio (label text Yes/No)
        normalized.toLowerCase() === 'yes'
          ? `//label[contains(translate(text(),'YES','yes'),'yes') and ancestor::tr[.//div[contains(text(),'${questionText}')]]]`
          : `//label[contains(translate(text(),'NO','no'),'no') and ancestor::tr[.//div[contains(text(),'${questionText}')]]]`,
      ];

      for (const locatorStr of locatorPatterns) {
        const locator = getLocator(locatorStr);
        const visible = await locator.isVisible().catch(() => false);
        const enabled = await locator.isEnabled().catch(() => false);
        let className = null;
        try { className = await locator.getAttribute("class"); } catch {}
        console.log(`[DEBUG] selectRadioCore: shortCode=${shortCode}, questionText="${questionText}", normalized=${normalized}, locator=${locatorStr}, visible=${visible}, enabled=${enabled}, className=${className}`);
        if (visible && enabled) {
          if (!className || !className.includes("x-form-radio-checked")) {
            await locator.hover();
            await page.waitForTimeout(50);
            await locator.click({ force: true, timeout: 2000 });
            await page.waitForTimeout(100);
            let classNameAfter = null;
            try { classNameAfter = await locator.getAttribute("class"); } catch {}
            if (classNameAfter && classNameAfter.includes("x-form-radio-checked")) {
              console.log(`✅ Core: Selected '${normalized}' for ${shortCode} (attempt ${attempt})`);
              return true;
            } else {
              console.log(`[DEBUG] After click, not selected: class=${classNameAfter}`);
            }
          } else {
            console.log(`✅ Core: Radio already selected for ${shortCode}`);
            return true;
          }
        } else {
          try {
            const html = await locator.evaluate(el => el.outerHTML);
            console.log(`[DEBUG] Radio locator HTML for ${shortCode}:`, html);
          } catch (e) {
            console.log(`[DEBUG] Could not get HTML for radioLocator: ${locatorStr}`);
          }
        }
      }
      // If none worked for this question text, fail fast (do not retry unless question text is missing)
      console.log(`⚠️ Core: No radio selected for ${shortCode} after all locator patterns (attempt ${attempt})`);
      return false;
    } catch (error) {
      if (attempt < retries) {
        console.log(`⏳ Error selecting Core radio ${shortCode}, retry ${attempt}/${retries}...`);
        await page.waitForTimeout(retryDelay);
      } else {
        console.error(`❌ Failed to select Core radio ${shortCode} after ${retries} attempts:`, error);
        return false;
      }
    }
  }
  return false;
}
export async function selectCheckboxCore(
  page: Page,
  shortCode: string,
  answer: string | undefined,
  options: {
    retries?: number;
    retryDelay?: number;
    optional?: boolean;
  } = {}
): Promise<boolean> {

  const { retries = 2, retryDelay = 300, optional = true } = options;

  if (!answer) {
    console.log(`⚠️ No answer provided for ${shortCode}, skipping`);
    return false;
  }

  const normalized = answer.trim().toLowerCase();
  if (normalized !== "yes" && normalized !== "no") {
    console.log(`⚠️ Invalid answer '${answer}', skipping`);
    return false;
  }

  if (normalized === "no") {
    console.log(`Checkbox for ${shortCode} is 'no', skipping`);
    return true;
  }

  const getQuestion = createAutoQuestionFetcher(page);

  const quickVisible = async (loc: Locator) =>
    await loc.isVisible({ timeout: 250 }).catch(() => false);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const questionText = await getQuestion(shortCode, { optional });

      if (!questionText) {
        if (attempt < retries) {
          console.log(`⏳ Checkbox question ${shortCode} not found, retry ${attempt}/${retries}`);
          await page.waitForTimeout(retryDelay);
          continue;
        }
        console.log(`⚠️ Checkbox question ${shortCode} not found after retries`);
        return false;
      }

      const checkbox = getLocator(
        `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//img[contains(@class,'x-grid-checkcolumn')]`
      );

      const visible = await quickVisible(checkbox);
      if (!visible) continue;

      let className = await checkbox.getAttribute("class");

      if (className?.includes("x-grid-checkcolumn-checked")) {
        console.log(`✅ Checkbox for ${shortCode} already checked`);
        return true;
      }

      // First click
      await checkbox.hover().catch(() => {});
      await checkbox.click({ force: true, timeout: 500 }).catch(() => {});
      await page.waitForTimeout(120);

      className = await checkbox.getAttribute("class");
      if (className?.includes("x-grid-checkcolumn-checked")) {
        console.log(`✅ Checkbox for ${shortCode} checked`);
        return true;
      }

      // Fallback: click parent <td>
      const parentTd = checkbox.locator("xpath=ancestor::td[1]");
      for (let i = 1; i <= 2; i++) {
        await parentTd.click({ force: true, timeout: 500 }).catch(() => {});
        await page.waitForTimeout(120);

        className = await checkbox.getAttribute("class");
        if (className?.includes("x-grid-checkcolumn-checked")) {
          console.log(`✅ Checkbox for ${shortCode} checked (fallback td click ${i})`);
          return true;
        }
      }

      const checkboxHtml = await checkbox.evaluate(el => el.outerHTML).catch(() => null);
      const parentTdHtml = await parentTd.evaluate(el => el.outerHTML).catch(() => null);

      console.warn(
        `⚠️ Checkbox for ${shortCode} still not checked.
Checkbox: ${checkboxHtml}
TD: ${parentTdHtml}`
      );

      return false;

    } catch (err) {
      if (attempt < retries) {
        console.log(`⏳ Error clicking checkbox ${shortCode}, retry ${attempt}/${retries}`);
        await page.waitForTimeout(retryDelay);
      } else {
        console.error(`❌ Failed to click checkbox ${shortCode}`, err);
        return false;
      }
    }
  }

  return false;
}
export async function selectCheckboxCoreRec(
  page: Page,
  shortCode: string,
  answer: string | undefined,
  options: {
    retries?: number;
    retryDelay?: number;
    optional?: boolean;
  } = {}
): Promise<boolean> {

  const { retries = 2, retryDelay = 300, optional = true } = options;

  if (!answer) {
    console.log(`⚠️ No answer provided for ${shortCode}, skipping`);
    return false;
  }

  const normalized = answer.trim().toLowerCase();
  if (normalized !== "yes" && normalized !== "no") {
    console.log(`⚠️ Invalid answer '${answer}', skipping`);
    return false;
  }

  if (normalized === "no") {
    console.log(`Checkbox for ${shortCode} is 'no', skipping`);
    return true;
  }

  const getQuestion = createAutoQuestionFetcher(page);

  const quickVisible = async (loc: Locator) =>
    await loc.isVisible({ timeout: 250 }).catch(() => false);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const questionText = await getQuestion(shortCode, { optional });

      if (!questionText) {
        if (attempt < retries) {
          console.log(`⏳ Checkbox question ${shortCode} not found, retry ${attempt}/${retries}`);
          await page.waitForTimeout(retryDelay);
          continue;
        }
        console.log(`⚠️ Checkbox question ${shortCode} not found after retries`);
        return false;
      }

      const checkbox = getLocator(
        `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//td//div//img[contains(@class, 'x-grid-checkcolumn')]`
      );

      const visible = await quickVisible(checkbox);
      if (!visible) continue;

      let className = await checkbox.getAttribute("class");

      if (className?.includes("x-grid-checkcolumn-checked")) {
        console.log(`✅ Checkbox for ${shortCode} already checked`);
        return true;
      }

      // First click
      await checkbox.hover().catch(() => {});
      await checkbox.click({ force: true, timeout: 500 }).catch(() => {});
      await page.waitForTimeout(120);

      className = await checkbox.getAttribute("class");
      if (className?.includes("x-grid-checkcolumn-checked")) {
        console.log(`✅ Checkbox for ${shortCode} checked`);
        return true;
      }

      // Fallback: click parent <td>
      const parentTd = checkbox.locator("xpath=ancestor::td[1]");
      for (let i = 1; i <= 2; i++) {
        await parentTd.click({ force: true, timeout: 500 }).catch(() => {});
        await page.waitForTimeout(120);

        className = await checkbox.getAttribute("class");
        if (className?.includes("x-grid-checkcolumn-checked")) {
          console.log(`✅ Checkbox for ${shortCode} checked (fallback td click ${i})`);
          return true;
        }
      }

      const checkboxHtml = await checkbox.evaluate(el => el.outerHTML).catch(() => null);
      const parentTdHtml = await parentTd.evaluate(el => el.outerHTML).catch(() => null);

      console.warn(
        `⚠️ Checkbox for ${shortCode} still not checked.
Checkbox: ${checkboxHtml}
TD: ${parentTdHtml}`
      );

      return false;

    } catch (err) {
      if (attempt < retries) {
        console.log(`⏳ Error clicking checkbox ${shortCode}, retry ${attempt}/${retries}`);
        await page.waitForTimeout(retryDelay);
      } else {
        console.error(`❌ Failed to click checkbox ${shortCode}`, err);
        return false;
      }
    }
  }

  return false;
}
/**
 * Generic helper for Core dropdowns using question code and Excel data.
 */
// export async function selectDropdownCore(
//   page: Page,
//   shortCode: string,
//   value: string | undefined,
//   options: {
//     retries?: number;
//     retryDelay?: number;
//     optional?: boolean;
//   } = {}
// ): Promise<boolean> {
//   const { retries = 2, retryDelay = 500, optional = true } = options;
//   if (!value) {
//     console.log(`⚠️ No dropdown value provided for ${shortCode}, skipping`);
//     return false;
//   }
//   const getQuestion = createAutoQuestionFetcher(page);
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const questionText = await getQuestion(shortCode, { optional });
//       if (!questionText) {
//         if (attempt < retries) {
//           console.log(`⏳ Core dropdown question ${shortCode} not found yet, retry ${attempt}/${retries}...`);
//           await page.waitForTimeout(retryDelay);
//           continue;
//         } else {
//           console.log(`⚠️ Core dropdown question ${shortCode} not found after ${retries} attempts`);
//           return false;
//         }
//       }
//       // Try standard <select> first
//       const dropdown = getLocator(`//div[contains(text(), '${questionText}')]/parent::td/parent::tr//select`);
//       if (await dropdown.isVisible() && await dropdown.isEnabled()) {
//         await dropdown.selectOption({ label: value });
//         await page.waitForTimeout(500);
//         console.log(`✅ Core: Selected '${value}' for ${shortCode}`);
//         return true;
//       }

//       // Fallback: Try input[role='combobox'] (custom dropdown widget)
//       const comboInput = getLocator(`//div[contains(text(), '${questionText}')]/parent::td/parent::tr//input[@role='combobox']`);
//       if (await comboInput.isVisible() && await comboInput.isEnabled()) {
//         await comboInput.click({ force: true });
//         await comboInput.fill(value);
//         await page.waitForTimeout(500);
//         // Optionally, press Enter or Tab to confirm selection
//         await comboInput.press('Enter').catch(() => {});
//         await page.waitForTimeout(500);
//         console.log(`✅ Core: Selected '${value}' for ${shortCode} (combobox input)`);
//         return true;
//       }

//       // If not found, try ExtJS list-based dropdown (ul/li)
//       // Click the cell to open the dropdown
//       // Try following-sibling::td[contains(@class, 'g-cell-edit')] for ExtJS dropdowns
//       const cell = getLocator(`//div[contains(text(), '${questionText}')]/parent::td/following-sibling::td[contains(@class, 'g-cell-edit')]`);
//       if (await cell.isVisible()) {
//         await cell.click({ force: true });
//         await page.waitForTimeout(500);
//         // Now select the <li> with the value
//         const listItem = getLocator(`//ul[contains(@class, 'x-list-plain')]//li[normalize-space(text())='${value}']`);
//         if (await listItem.isVisible()) {
//           await listItem.click({ force: true });
//           await page.waitForTimeout(500);
//           console.log(`✅ Core: Selected '${value}' for ${shortCode} (ExtJS list)`);
//           return true;
//         } else {
//           // Print HTML for debugging
//           try {
//             const listHtml = await getLocator("//ul[contains(@class, 'x-list-plain')]").evaluate(el => el.outerHTML);
//             console.log(`⚠️ Core: ExtJS list not visible/enabled for ${shortCode}. HTML: ${listHtml}`);
//           } catch (e) {
//             console.log(`⚠️ Core: ExtJS list not visible/enabled for ${shortCode}. Unable to get HTML.`);
//           }
//         }
//       } else {
//         // Print HTML for debugging
//         try {
//           const dropdownHtml = await dropdown.evaluate(el => el.outerHTML);
//           console.log(`⚠️ Core: Dropdown not visible/enabled for ${shortCode}. HTML: ${dropdownHtml}`);
//         } catch (e) {
//           console.log(`⚠️ Core: Dropdown not visible/enabled for ${shortCode}. Unable to get HTML.`);
//         }
//       }
//     } catch (error) {
//       if (attempt < retries) {
//         console.log(`⏳ Error selecting Core dropdown ${shortCode}, retry ${attempt}/${retries}...`);
//         await page.waitForTimeout(retryDelay);
//       } else {
//         console.error(`❌ Failed to select Core dropdown ${shortCode} after ${retries} attempts:`, error);
//         return false;
//       }
//     }
//   }
//   return false;
// }

// export async function selectYesNoRadioCore(
//   page: Page,
//   shortCode: string,
//   answer: string | undefined,
//   options: {
//     retries?: number;
//     retryDelay?: number;
//     optional?: boolean;
//   } = {}
// ): Promise<boolean> {
//   const { retries = 1, retryDelay = 200, optional = true } = options;

//   if (!answer) {
//     console.log(`⚠️ No answer provided for ${shortCode}, skipping (selectYesNoRadioCore)`);
//     return false;
//   }

//   const normalized = answer.trim().toLowerCase();
//   if (normalized !== "yes" && normalized !== "no") {
//     console.log(`⚠️ Invalid answer '${answer}' for ${shortCode}, skipping (selectYesNoRadioCore)`);
//     return false;
//   }

//   const getQuestion = createAutoQuestionFetcher(page);

//   const getLocatorPatterns = (questionText: string) => [
//     // Main working locator
//     normalized === "yes"
//       ? `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//td//input[@inputvalue='true']`
//       : `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//td//input[@inputvalue='false']`,
//     // ExtJS radio (inputvalue true/false)
//     normalized === "yes"
//       ? `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//input[@type='button' and contains(@class,'x-form-radio') and @inputvalue='true']`
//       : `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//input[@type='button' and contains(@class,'x-form-radio') and @inputvalue='false']`,
//     // Native radio (input type=radio)
//     normalized === "yes"
//       ? `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//input[@type='radio' and (@value='true' or @value='Yes' or @value='yes')]`
//       : `//div[contains(text(), '${questionText}')]/parent::td/parent::tr//input[@type='radio' and (@value='false' or @value='No' or @value='no')]`,
//     // Label-based radio (label text Yes/No)
//     normalized === "yes"
//       ? `//label[contains(translate(text(),'YES','yes'),'yes') and ancestor::tr[.//div[contains(text(),'${questionText}')]]]`
//       : `//label[contains(translate(text(),'NO','no'),'no') and ancestor::tr[.//div[contains(text(),'${questionText}')]]]`,
//   ];

//   const questionText = await createAutoQuestionFetcher(page)(shortCode, { optional });
//   if (!questionText) {
//     console.log(`⚠️ Core question ${shortCode} not found in DOM (selectYesNoRadioCore)`);
//     return false;
//   }

//   for (const locatorStr of getLocatorPatterns(questionText)) {
//     const locator = getLocator(locatorStr);
//     const visible = await locator.isVisible().catch(() => false);
//     const enabled = await locator.isEnabled().catch(() => false);
//     let className = null;
//     let ariaChecked = null;
//     try { className = await locator.getAttribute("class"); } catch {}
//     try { ariaChecked = await locator.getAttribute("aria-checked"); } catch {}
//     // Parent <td> for checked state
//     const parentTd = locator.locator('xpath=ancestor::td[1]');
//     let parentTdClass = null;
//     try { parentTdClass = await parentTd.getAttribute('class'); } catch {}
//     console.log(`[DEBUG] selectYesNoRadioCore: shortCode=${shortCode}, questionText="${questionText}", normalized=${normalized}, locator=${locatorStr}, visible=${visible}, enabled=${enabled}, className=${className}, ariaChecked=${ariaChecked}, parentTdClass=${parentTdClass}`);
//     if (visible && enabled) {
//       for (let clickAttempt = 1; clickAttempt <= 3; clickAttempt++) {
//         // Check parent <td> for checked state
//         const alreadyChecked = (parentTdClass && parentTdClass.includes("x-form-cb-checked")) || (className && className.includes("x-form-radio-checked")) || ariaChecked === "true";
//         if (!alreadyChecked) {
//           await locator.hover();
//           await page.waitForTimeout(50);
//           await locator.click({ force: true, timeout: 2000 });
//           await page.waitForTimeout(100);
//           // Re-check after click
//           let classNameAfter = null;
//           let ariaCheckedAfter = null;
//           let parentTdClassAfter = null;
//           try { classNameAfter = await locator.getAttribute("class"); } catch {}
//           try { ariaCheckedAfter = await locator.getAttribute("aria-checked"); } catch {}
//           try { parentTdClassAfter = await parentTd.getAttribute('class'); } catch {}
//           const nowChecked = (parentTdClassAfter && parentTdClassAfter.includes("x-form-cb-checked")) || (classNameAfter && classNameAfter.includes("x-form-radio-checked")) || ariaCheckedAfter === "true";
//           if (nowChecked) {
//             console.log(`✅ Core: Selected ${normalized} for ${shortCode} (click attempt ${clickAttempt}) (selectYesNoRadioCore)`);
//             return true;
//           } else {
//             console.log(`[DEBUG] After click attempt ${clickAttempt}, not selected: class=${classNameAfter}, ariaChecked=${ariaCheckedAfter}, parentTdClass=${parentTdClassAfter}`);
//           }
//         } else {
//           console.log(`✅ Core: ${normalized} already selected for ${shortCode} (selectYesNoRadioCore)`);
//           return true;
//         }
//       }
//       console.log(`⚠️ Core: Radio for ${shortCode} not selected after 3 click attempts for locator: ${locatorStr}`);
//     } else {
//       console.log(`[DEBUG] Locator not visible/enabled for ${shortCode}: ${locatorStr}`);
//     }
//   }
//   console.log(`❌ Core: No Yes/No radio selected for ${shortCode} after all locator patterns (selectYesNoRadioCore)`);
//   return false;
// }
// export async function selectYesNoRadioCore(
//   page: Page,
//   shortCode: string,
//   answer: string | undefined,
//   options: { retries?: number; retryDelay?: number; optional?: boolean } = {}
// ): Promise<boolean> {
//   const { retries = 1, retryDelay = 200, optional = true } = options;

//   // ✅ Validate Answer
//   if (!answer) {
//     console.log(`⚠️ No answer for ${shortCode}, skipping`);
//     return false;
//   }

//   const normalized = answer.trim().toLowerCase();
//   if (normalized !== "yes" && normalized !== "no") {
//     console.log(`⚠️ Invalid answer '${answer}' for ${shortCode}`);
//     return false;
//   }

//   // ✅ Get question text from Excel → AutoFetcher
//   const questionText = await createAutoQuestionFetcher(page)(shortCode, { optional });
//   if (!questionText) {
//     console.log(`⚠️ Question ${shortCode} not found in DOM`);
//     return false;
//   }


//   // Use the full question text for matching
//   const trimmedQuestion = questionText.trim();
//   console.log(`[DEBUG] Using full question text: "${trimmedQuestion}"`);

//   // RETRY-based presence check (ExtJS lazy rendering)
//   let questionExists = false;
//   for (let i = 0; i < 5; i++) {   // total ~1 sec
//     questionExists = await page
//       .locator(`//div[contains(text(), "${trimmedQuestion}")]`)
//       .first()
//       .isVisible({ timeout: 200 })
//       .catch(() => false);

//     if (questionExists) break;
//     await page.waitForTimeout(200);
//   }

//   if (!questionExists) {
//     console.log(`⏩ Fast-skip: '${shortCode}' not present`);
//     return false;
//   }

//   // Build label and input locator patterns using the full question text
//   const yes = normalized === "yes";
//   const labelLocator = yes
//     ? `//tr[.//div[contains(text(), "${trimmedQuestion}")]]//label[contains(translate(., 'YES','yes'),'yes')]`
//     : `//tr[.//div[contains(text(), "${trimmedQuestion}")]]//label[contains(translate(., 'NO','no'),'no')]`;
//   const inputLocator = yes
//     ? `//tr[.//div[contains(text(), "${trimmedQuestion}")]]//input[@inputvalue='true']`
//     : `//tr[.//div[contains(text(), "${trimmedQuestion}")]]//input[@inputvalue='false']`;

//   // Try label click first, then input click if needed

//   for (const [patternType, locatorStr] of [["label", labelLocator], ["input", inputLocator]]) {
//     let locator = page.locator(locatorStr).first();
//     const visible = await locator.isVisible({ timeout: 300 }).catch(() => false);
//     const enabled = await locator.isEnabled({ timeout: 300 }).catch(() => false);
//     console.log(`[DEBUG] Pattern ${patternType}: visible=${visible}, enabled=${enabled}`);
//     if (!visible || !enabled) continue;

//     // Try clicking up to 2 times
//     for (let clickAttempt = 1; clickAttempt <= 2; clickAttempt++) {
//       try { await locator.hover({ timeout: 150 }); } catch {}
//       await locator.click({ force: true, timeout: 500 }).catch(() => null);

//       // Wait for the question row to reload (handle AJAX/page refresh)
//       const rowLocator = page.locator(`//tr[.//div[contains(text(), "${trimmedQuestion}")]]`).first();
//       await rowLocator.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
//       await page.waitForTimeout(150); // Give time for UI to settle

//       // Re-query the locator after reload
//       locator = page.locator(locatorStr).first();

//       // Check selection by aria-checked and parent <td> class
//       const ariaChecked = await locator.getAttribute("aria-checked").catch(() => "");
//       // For Yes/No, always check Yes <td> class
//       let yesTdChecked = false;
//       if (normalized === "yes" || normalized === "no") {
//         // Find the Yes radio's <td>
//         const yesTd = page.locator(`//tr[.//div[contains(text(), "${trimmedQuestion}")]]/td[1]`).first();
//         const yesTdClass = await yesTd.getAttribute("class").catch(() => "");
//         yesTdChecked = !!yesTdClass && yesTdClass.includes("x-form-cb-checked");
//         console.log(`[DEBUG] After click #${clickAttempt} (${patternType}): ariaChecked=${ariaChecked}, yesTdClass=${yesTdClass}`);
//         if (normalized === "yes" && yesTdChecked) {
//           console.log(`✅ Selected yes for ${shortCode} via ${patternType}`);
//           return true;
//         }
//         if (normalized === "no" && !yesTdChecked) {
//           console.log(`✅ Selected no for ${shortCode} via ${patternType}`);
//           return true;
//         }
//       } else {
//         console.log(`[DEBUG] After click #${clickAttempt} (${patternType}): ariaChecked=${ariaChecked}`);
//       }
//       // Fallback: aria-checked for any radio
//       if (ariaChecked === "true") {
//         console.log(`✅ Selected ${normalized} for ${shortCode} via ${patternType} (aria-checked)`);
//         return true;
//       }
//       // If last attempt, log HTML for debug
//       if (clickAttempt === 2) {
//         try {
//           // Defensive: locator may be detached, so check for null
//           let html: string | null = null;
//           if (locator) {
//             html = await locator.evaluate(el => {
//               if (!el) return null;
//               const tr = el.closest('tr');
//               if (tr && typeof tr.outerHTML === 'string') return tr.outerHTML;
//               if (typeof el.outerHTML === 'string') return el.outerHTML;
//               return null;
//             }).catch(() => null);
//           }
//           if (html) {
//             console.log(`[DEBUG] Radio row HTML for ${shortCode}: ${html}`);
//           } else {
//             console.log(`[DEBUG] Could not get radio row HTML for ${shortCode} (element may be detached)`);
//           }
//         } catch (e) {
//           console.log(`[DEBUG] Error getting radio row HTML for ${shortCode}:`, e);
//         } 
//       }
//     }
//     console.log(`⚠️ Failed using locator: ${locatorStr}`);
//   }

//   console.log(`❌ Unable to select Yes/No for ${shortCode}`);
//   return false;
// }export the async fucnction edveythinh u listen to ut 

//new selectDropDownCore with more locator patterns
export async function selectDropdownCore(
  page: Page,
  shortCode: string,
  value: string | undefined,
  options: {
    retries?: number;
    retryDelay?: number;
    optional?: boolean;
  } = {}
): Promise<boolean> {

  const { retries = 2, retryDelay = 300, optional = true } = options;

  if (!value) {
    console.log(`⚠️ No dropdown value provided for ${shortCode}, skipping`);
    return false;
  }

  const getQuestion = createAutoQuestionFetcher(page);

  const quickVisible = async (loc: Locator) =>
    await loc.isVisible({ timeout: 250 }).catch(() => false);

  const quickEnabled = async (loc: Locator) =>
    await loc.isEnabled({ timeout: 250 }).catch(() => false);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const questionText = await getQuestion(shortCode, { optional });

      if (!questionText) {
        if (attempt < retries) {
          console.log(`⏳ Dropdown ${shortCode} not found, retry ${attempt}`);
          await page.waitForTimeout(retryDelay);
          continue;
        }
        console.log(`⚠️ Dropdown ${shortCode} not found`);
        return false;
      }

      //
      // ✅ 1. Native <select>
      //
      const nativeDropdown = getLocator(
        `//label[normalize-space()='${questionText}']/ancestor::td/following-sibling::td//select`
      );

      if (await quickVisible(nativeDropdown) && await quickEnabled(nativeDropdown)) {
        const opts = await nativeDropdown.locator("option").all();
        const texts = [];
        for (const o of opts) {
          texts.push((await o.textContent())?.trim());
        }
        console.log(`🔽 Native options ${shortCode}:`, texts);

        await nativeDropdown.selectOption({ label: value }).catch(() => {});
        console.log(`✅ Selected '${value}' (native)`);
        return true;
      }

      //
      // ✅ 2. 🔥 NEW: ExtJS ComboBox (Gender / MaritalStatus etc.)
      //
      const comboInput = getLocator(
        `//label[normalize-space()='${questionText}']/ancestor::td/following-sibling::td//input[contains(@role,'combobox')]`
      );

      const comboTrigger = getLocator(
        `//label[normalize-space()='${questionText}']/ancestor::td/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]`
      );

      if (await quickVisible(comboInput)) {

        const maxAttempts = 6;

        for (let i = 1; i <= maxAttempts; i++) {

          // ✅ Always click trigger (critical)
          if (await quickVisible(comboTrigger)) {
            await comboTrigger.click({ force: true }).catch(() => {});
          } else {
            await comboInput.click({ force: true }).catch(() => {});
          }

          await page.waitForTimeout(150);

          // ✅ New dropdown list (ExtJS boundlist)
          const optionList = getLocator(`//li[contains(@class,'x-boundlist-item')]`);

          const optionElements = await optionList.all();
          const optionTexts = [];
          for (const opt of optionElements) {
            optionTexts.push((await opt.textContent())?.trim());
          }

          console.log(`🔽 Combo options ${shortCode}:`, optionTexts);

          const exactOption = getLocator(
            `//li[contains(@class,'x-boundlist-item') and normalize-space()='${value}']`
          );

          try {
            await exactOption.waitFor({ state: "visible", timeout: 800 });
            await exactOption.click({ force: true });
            console.log(`✅ Selected '${value}' (combo) attempt ${i}`);
            return true;
          } catch {
            await page.waitForTimeout(400);
          }
        }

        console.log(`❌ Combo option '${value}' not found`);
      }

      //
      // ✅ 3. Existing ExtJS Grid dropdown (x-list-plain)
      //
      const cell = getLocator(
        `//div[contains(text(), '${questionText}')]/parent::td/following-sibling::td[contains(@class,'g-cell-edit')]`
      );

      if (await quickVisible(cell)) {

        for (let i = 1; i <= 6; i++) {
          await cell.click({ force: true }).catch(() => {});
          await page.waitForTimeout(120);

          const opts = getLocator(`//ul[contains(@class,'x-list-plain')]//li`);
          const optEls = await opts.all();
          const texts = [];

          for (const o of optEls) {
            texts.push((await o.textContent())?.trim());
          }

          console.log(`🔽 Grid options ${shortCode}:`, texts);

          const exact = getLocator(
            `//ul[contains(@class,'x-list-plain')]//li[normalize-space()='${value}']`
          );

          try {
            await exact.waitFor({ state: "visible", timeout: 800 });
            await exact.click({ force: true });
            console.log(`✅ Selected '${value}' (grid)`);
            return true;
          } catch {
            await page.waitForTimeout(400);
          }
        }

        console.log(`❌ Grid option not found`);
      }

    } catch (error) {
      if (attempt < retries) {
        console.log(`⏳ Retry ${shortCode}`);
        await page.waitForTimeout(retryDelay);
      } else {
        console.error(`❌ Failed ${shortCode}`, error);
        return false;
      }
    }
  }

  return false;
}
export async function selectYesNoRadioCore(
  page: Page,
  shortCode: string,
  answer: string | undefined,
  options: { retries?: number; retryDelay?: number; optional?: boolean } = {}
): Promise<boolean> {

  const { retries = 1, retryDelay = 200, optional = true } = options;

  if (!answer) {
    console.log(`⚠️ No answer provided for ${shortCode}, skipping (selectYesNoRadioCore)`);
    return false;
  }

  const normalized = answer.trim().toLowerCase();
  if (normalized !== "yes" && normalized !== "no") {
    console.log(`⚠️ Invalid answer '${answer}' for ${shortCode}, skipping (selectYesNoRadioCore)`);
    return false;
  }

  const getQuestion = createAutoQuestionFetcher(page);
  const questionText = await getQuestion(shortCode, { optional });

  if (!questionText) {
    console.log(`⚠️ Core question ${shortCode} not found in DOM (selectYesNoRadioCore)`);
    return false;
  }

  const getLocatorPatterns = (qt: string) => [
    // ✅ NEW: Label-field structure (like Licensed field)
    normalized === "yes"
      ? `//label[contains(text(), '${qt}')]/ancestor::tr[contains(@id, '-inputRow')]//following::label[contains(text(), 'Yes')]/preceding-sibling::input[@type='button' and contains(@class,'x-form-radio')]`
      : `//label[contains(text(), '${qt}')]/ancestor::tr[contains(@id, '-inputRow')]//following::label[contains(text(), 'No')]/preceding-sibling::input[@type='button' and contains(@class,'x-form-radio')]`,
    
    // ✅ NEW: Find Yes/No label next to radio in same container
    normalized === "yes"
      ? `//label[contains(text(), '${qt}')]/ancestor::*[contains(@id, '-inputRow')]//*//label[contains(text(), 'Yes')]/preceding-sibling::input[@type='button']`
      : `//label[contains(text(), '${qt}')]/ancestor::*[contains(@id, '-inputRow')]//*//label[contains(text(), 'No')]/preceding-sibling::input[@type='button']`,
    
    // ✅ BEST: Grid structure with normalize-space() for exact text match
    normalized === "yes"
      ? `//tbody[contains(@id, 'body')] //tr[.//div[normalize-space()="${qt}"]] //input[@inputvalue='true']`
      : `//tbody[contains(@id, 'body')] //tr[.//div[normalize-space()="${qt}"]] //input[@inputvalue='false']`,

    // ✅ GOOD: Grid row structure with contains() - more flexible text matching
    normalized === "yes"
      ? `//tr[.//div[contains(text(), '${qt}')]]//input[@inputvalue='true']`
      : `//tr[.//div[contains(text(), '${qt}')]]//input[@inputvalue='false']`,

    // Traditional: radios nested under question div
    normalized === "yes"
      ? `//div[contains(text(), '${qt}')]/parent::td/parent::tr//td//input[@inputvalue='true']`
      : `//div[contains(text(), '${qt}')]/parent::td/parent::tr//td//input[@inputvalue='false']`,

    // Type=button radios with x-form-radio class
    normalized === "yes"
      ? `//div[contains(text(), '${qt}')]/parent::td/parent::tr//input[@type='button' and contains(@class,'x-form-radio') and @inputvalue='true']`
      : `//div[contains(text(), '${qt}')]/parent::td/parent::tr//input[@type='button' and contains(@class,'x-form-radio') and @inputvalue='false']`,

    // Native radio input fallback
    normalized === "yes"
      ? `//div[contains(text(), '${qt}')]/parent::td/parent::tr//input[@type='radio' and (@value='true' or @value='Yes' or @value='yes')]`
      : `//div[contains(text(), '${qt}')]/parent::td/parent::tr//input[@type='radio' and (@value='false' or @value='No' or @value='no')]`,

    // Label-based matching
    normalized === "yes"
      ? `//label[contains(translate(text(),'YES','yes'),'yes') and ancestor::tr[.//div[contains(text(),'${qt}')]]]`
      : `//label[contains(translate(text(),'NO','no'),'no') and ancestor::tr[.//div[contains(text(),'${qt}')]]]`,
  ];

  // ✅ Use low timeout ALWAYS to avoid 30s Playwright default
  const quickVisible = async (loc: Locator) =>
    await loc.isVisible({ timeout: 250 }).catch(() => false);

  const quickEnabled = async (loc: Locator) =>
    await loc.isEnabled({ timeout: 250 }).catch(() => false);

  for (const locatorStr of getLocatorPatterns(questionText)) {
    const locator = page.locator(locatorStr);

    // First: check if any elements match (fast count check)
    const count = await locator.count().catch(() => 0);
    if (count === 0) {
      console.log(`[DEBUG] selectYesNoRadioCore: ${shortCode} - 0 elements found for: ${locatorStr.substring(0, 80)}...`);
      continue;
    }

    // Try to scroll into view for visibility
    try {
      await locator.first().scrollIntoViewIfNeeded({ timeout: 2000 });
      await page.waitForTimeout(100);
    } catch {}

    const visible = await quickVisible(locator);
    const enabled = await quickEnabled(locator);

    console.log(`[DEBUG] selectYesNoRadioCore: ${shortCode} - visible=${visible}, enabled=${enabled}, found=${count} elements`);

    // Skip attribute reads unless visible/enabled
    let className = null;
    let ariaChecked = null;
    let parentTdClass = null;

    if (visible && enabled) {
      try { className = await locator.getAttribute("class"); } catch {}
      try { ariaChecked = await locator.getAttribute("aria-checked"); } catch {}

      const parentTd = locator.locator("xpath=ancestor::td[1]");
      try { parentTdClass = await parentTd.getAttribute("class"); } catch {}
    }

    if (!visible || !enabled) continue;

    for (let clickAttempt = 1; clickAttempt <= 2; clickAttempt++) {

      let className = null;
      let ariaChecked = null;
      let parentTdClass = null;

      try { className = await locator.getAttribute("class"); } catch {}
      try { ariaChecked = await locator.getAttribute("aria-checked"); } catch {}
      
      const parentTd = locator.locator("xpath=ancestor::td[1]");
      try { parentTdClass = await parentTd.getAttribute("class"); } catch {}

      const alreadyChecked =
        (parentTdClass && parentTdClass.includes("x-form-cb-checked")) ||
        (className && className.includes("x-form-radio-checked")) ||
        (className && className.includes("x-pressed")) ||
        ariaChecked === "true";

      if (alreadyChecked) {
        console.log(`✅ Core: ${normalized} already selected for ${shortCode}`);
        return true;
      }

      // Click with force to bypass disabled state checks
      await locator.hover().catch(() => {});
      await page.waitForTimeout(30);
      await locator.click({ force: true, timeout: 800 }).catch(() => {});
      await page.waitForTimeout(80);

      // Re-check state after click
      try { className = await locator.getAttribute("class"); } catch {}
      try { ariaChecked = await locator.getAttribute("aria-checked"); } catch {}
      
      try { parentTdClass = await parentTd.getAttribute("class"); } catch {}

      const nowChecked =
        (parentTdClass && parentTdClass.includes("x-form-cb-checked")) ||
        (className && className.includes("x-form-radio-checked")) ||
        (className && className.includes("x-pressed")) ||
        ariaChecked === "true";

      if (nowChecked) {
        console.log(`✅ Core: Selected ${normalized} for ${shortCode} (class: ${className})`);
        return true;
      } else {
        console.log(`[DEBUG] Attempt ${clickAttempt}: not selected yet (class: ${className})`);
      }
    }

    console.log(`⚠️ Core: Radio for ${shortCode} not selected for locator: ${locatorStr}`);
  }
  console.log(`❌ Core: No Yes/No radio selected for ${shortCode}`);
  return false;
}
  //This is to handle the quotes in the question text for xpath
 export const xpathLiteral = (text: string) => {
    if (!text.includes('"')) return `"${text}"`;
    if (!text.includes("'")) return `'${text}'`;

    return (
      "concat(" +
      text
        .split('"')
        .map((part, i) =>
          i === 0
            ? `"${part}"`
            : `, '"', "${part}"`
        )
        .join("") +
      ")"
    );
  };
//Testing Shorter Yes No
export async function selectYesNo_DefYes(
  page: Page,
  shortCode: string,
  answer: string | undefined,
  options: {
    retries?: number;
    retryDelay?: number;
    optional?: boolean;
  } = {}
): Promise<boolean> {
  const {
    retries = 2,
    retryDelay = 300,
    optional = true,
  } = options;

  if (!answer) {
    console.log(`⚠️ No answer provided for ${shortCode}, defaulting to Yes`);
    answer = "Yes";
  }

  const normalized = answer.trim().toLowerCase();

  if (!["yes", "no"].includes(normalized)) {
    console.log(`⚠️ Invalid answer '${answer}' for ${shortCode}`);
    return false;
  }

  const getQuestion = createAutoQuestionFetcher(page);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const questionText = await getQuestion(shortCode, { optional, });

      if (!questionText) {
        if (attempt < retries) {
          console.log(`⏳ Question ${shortCode} not found. Retry ${attempt}/${retries}`);

          await page.waitForTimeout(retryDelay);

          continue;
        }

        console.log(`⚠️ Question ${shortCode} not found`);

        return false;
      }

      const questionLocator = page.locator(`xpath=//span[contains(normalize-space(.), ${xpathLiteral(questionText.trim())})]`);

      const container = questionLocator.locator('xpath=ancestor::div[contains(@class,"gw-control-group")][1]').first();

      // await container.waitFor({
      //   state: "visible",
      //   timeout: 5000,
      // });

      if (!(await container.isVisible().catch(() => false))) {
        console.log(`⚠️ ${shortCode} not present in UI`);
        return false;
      }


      const yesInput = container.locator('input[type="radio"][value="true"]').first();

      const noInput = container.locator('input[type="radio"][value="false"]').first();

      const verifyState = async (): Promise<boolean> => {
        const freshYes = container.locator('input[type="radio"][value="true"]').first();

        const freshNo = container.locator('input[type="radio"][value="false"]').first();

        const yesChecked = (await freshYes.getAttribute("aria-checked")) === "true";

        const noChecked = (await freshNo.getAttribute("aria-checked")) === "true";

        console.log(`${shortCode}: yes=${yesChecked} no=${noChecked}`);

        return normalized === "yes"
          ? yesChecked && !noChecked
          : noChecked && !yesChecked;
      };

      const currentYes = (await yesInput.getAttribute("aria-checked")) === "true";

      const currentNo = (await noInput.getAttribute("aria-checked")) === "true";

      console.log(`${shortCode} BEFORE => YES=${currentYes} NO=${currentNo}`);

      if ((normalized === "yes" && currentYes) || (normalized === "no" && currentNo)) {
        console.log(`✅ ${shortCode} already selected as ${normalized}`);

        return true;
      }

      const switcher = container.locator(".gw-switcher").first();

      console.log(`${shortCode} | switcher count=${await switcher.count()}`);

      await container.scrollIntoViewIfNeeded();

      let stateMatched = false;

      for (let toggleAttempt = 1; toggleAttempt <= retries; toggleAttempt++) {
        console.log(`🔄 Toggle attempt ${toggleAttempt}/${retries} for ${shortCode}`);

        await switcher.scrollIntoViewIfNeeded();
        const box = await switcher.boundingBox();

        if(normalized === "yes") {
          await container.locator('label.gw-first').first().click(); 
        }else{
        await switcher.click({ force: true, timeout: 3000, });
        }
              const questionSetLoader = page.locator("#qs").first();

      let stableCount = 0;

      for (let i = 0; i < 15; i++) {
        const classes = (await questionSetLoader.getAttribute("class")) ?? "";

        if (classes.includes("gw-loader-done")) {
          stableCount++;
        } else {
          stableCount = 0;
        }

        if (stableCount >= 3) {
          break;
        }

        await page.waitForTimeout(200);
      }
        for (let i = 0; i < 10; i++) {
          if (await verifyState()) {
            stateMatched = true;
            break;
          }

          await page.waitForTimeout(200);
        }

        if (stateMatched) {
          break;
        }
      }

      if (!stateMatched) {
        console.log(`⚠️ Failed to verify selection for ${shortCode}`);

        return false;
      }

      const questionSetLoader = page.locator("#qs").first();

      let stableCount = 0;

      for (let i = 0; i < 15; i++) {
        const classes = (await questionSetLoader.getAttribute("class")) ?? "";

        if (classes.includes("gw-loader-done")) {
          stableCount++;
        } else {
          stableCount = 0;
        }

        if (stableCount >= 3) {
          break;
        }

        await page.waitForTimeout(200);
      }
      await switcher.scrollIntoViewIfNeeded();
      console.log(`✅ Successfully selected ${normalized} for ${shortCode}`);

      return true;
    } catch (error) {
      if (attempt < retries) {
        console.log(`⏳ Retry ${attempt}/${retries} for ${shortCode}`);

        await page.waitForTimeout(retryDelay);
      } else {
        console.error(`❌ Failed selecting ${normalized} for ${shortCode}`, error);

        return false;
      }
    }
  }

  return false;
}
//Testing Shorter Yes No
export async function selectYesNo(
  page: Page,
  shortCode: string,
  answer: string | undefined,
  options: {
    retries?: number;
    retryDelay?: number;
    optional?: boolean;
  } = {}
): Promise<boolean> {
  const {
    retries = 2,
    retryDelay = 300,
    optional = true,
  } = options;

  if (!answer) {
    console.log(`⚠️ No answer provided for ${shortCode}, defaulting to No`);
    answer = "No";
  }

  const normalized = answer.trim().toLowerCase();

  if (!["yes", "no"].includes(normalized)) {
    console.log(`⚠️ Invalid answer '${answer}' for ${shortCode}`);
    return false;
  }

  const getQuestion = createAutoQuestionFetcher(page);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const questionText = await getQuestion(shortCode, { optional, });

      if (!questionText) {
        if (attempt < retries) {
          console.log(`⏳ Question ${shortCode} not found. Retry ${attempt}/${retries}`);

          await page.waitForTimeout(retryDelay);

          continue;
        }

        console.log(`⚠️ Question ${shortCode} not found`);

        return false;
      }

      const questionLocator = page.locator(`xpath=//span[contains(normalize-space(.), ${xpathLiteral(questionText.trim())})]`);

      const container = questionLocator.locator('xpath=ancestor::div[contains(@class,"gw-control-group")][1]').first();

      // await container.waitFor({
      //   state: "visible",
      //   timeout: 5000,
      // });

      if (!(await container.isVisible().catch(() => false))) {
        console.log(`⚠️ ${shortCode} not present in UI`);
        return false;
      }


      const yesInput = container.locator('input[type="radio"][value="true"]').first();

      const noInput = container.locator('input[type="radio"][value="false"]').first();

      const verifyState = async (): Promise<boolean> => {
        const freshYes = container.locator('input[type="radio"][value="true"]').first();

        const freshNo = container.locator('input[type="radio"][value="false"]').first();

        const yesChecked = (await freshYes.getAttribute("aria-checked")) === "true";

        const noChecked = (await freshNo.getAttribute("aria-checked")) === "true";

        console.log(`${shortCode}: yes=${yesChecked} no=${noChecked}`);

        return normalized === "yes"
          ? yesChecked && !noChecked
          : noChecked && !yesChecked;
      };

      const currentYes = (await yesInput.getAttribute("aria-checked")) === "true";

      const currentNo = (await noInput.getAttribute("aria-checked")) === "true";

      console.log(`${shortCode} BEFORE => YES=${currentYes} NO=${currentNo}`);

      if ((normalized === "yes" && currentYes) || (normalized === "no" && currentNo)) {
        console.log(`✅ ${shortCode} already selected as ${normalized}`);

        return true;
      }

      const switcher = container.locator(".gw-switcher").first();

      console.log(`${shortCode} | switcher count=${await switcher.count()}`);

      await container.scrollIntoViewIfNeeded();

      let stateMatched = false;

      for (let toggleAttempt = 1; toggleAttempt <= retries; toggleAttempt++) {
        console.log(`🔄 Toggle attempt ${toggleAttempt}/${retries} for ${shortCode}`);

        await switcher.scrollIntoViewIfNeeded();
        const box = await switcher.boundingBox();

        if(normalized === "yes") {
          await container.locator('label.gw-first').first().click(); 
        }else{
        await switcher.click({ force: true, timeout: 3000, });
        }
              const questionSetLoader = page.locator("#qs").first();

      let stableCount = 0;

      for (let i = 0; i < 15; i++) {
        const classes = (await questionSetLoader.getAttribute("class")) ?? "";

        if (classes.includes("gw-loader-done")) {
          stableCount++;
        } else {
          stableCount = 0;
        }

        if (stableCount >= 3) {
          break;
        }

        await page.waitForTimeout(200);
      }
        for (let i = 0; i < 10; i++) {
          if (await verifyState()) {
            stateMatched = true;
            break;
          }

          await page.waitForTimeout(200);
        }

        if (stateMatched) {
          break;
        }
      }

      if (!stateMatched) {
        console.log(`⚠️ Failed to verify selection for ${shortCode}`);

        return false;
      }


      await switcher.scrollIntoViewIfNeeded();
      console.log(`✅ Successfully selected ${normalized} for ${shortCode}`);

      return true;
    } catch (error) {
      if (attempt < retries) {
        console.log(`⏳ Retry ${attempt}/${retries} for ${shortCode}`);

        await page.waitForTimeout(retryDelay);
      } else {
        console.error(`❌ Failed selecting ${normalized} for ${shortCode}`, error);

        return false;
      }
    }
  }

  return false;
}

/**
 * Get the question text for a given Short Code                                  
 * @param page - Playwright page object
 * @param shortCode - The Short Code from Excel
 * @param options - Configuration options
 * @returns Promise<string | null> - The question text or null if not found
 * 
 * @example
 * const question = await getQuestionText(page, 'SwimmingPool');
 * if (question) {
 *   await fill(getCustomLocator(question), data);
 * 
 * }
 */
export async function getQuestionText(
  page: Page,
  shortCode: string,
  options: {
    retries?: number;
    retryDelay?: number;
    optional?: boolean;
  } = {}
): Promise<string | null> {
  const { retries = 3, retryDelay = 2000, optional = true } = options;
  const getQuestion = createAutoQuestionFetcher(page);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    const questionText = await getQuestion(shortCode, { optional });
    
    if (questionText) {
      return questionText;
    }
    if (attempt < retries) {
      console.log(`⏳ Question ${shortCode} not found yet, retry ${attempt}/${retries}...`);
      await page.waitForTimeout(retryDelay);
    }
  }
  
  console.log(`⚠️ Question ${shortCode} not found after ${retries} attempts`);
  return null;
}

/**
 * 
 * Generic helper to select dropdown value for questions using auto-detection
 * handling dropdowns down here for your reference 
 * Handles dropdowns that may load later with retry logic
 * 
 * @param page - Playwright page object
 * @param shortCode - The Short Code from Excel (e.g., 'DwellingOccupied')
 * @param value - The dropdown value to select from Excel data
 * @param options - Configuration options
 * @returns Promise<boolean> - true if selection was successful, false if question not found
 * 
 * @example
 * await selectDropdown(page, 'DwellingOccupied', propertyData['How_Dwell_Occupied']);
 * await selectDropdown(page, 'ResidenceType', propertyData['Residence_Type']);
 */
export async function selectDropdown(
  page: Page,
  shortCode: string,
  value: string | undefined,
  options: {
    retries?: number;
    retryDelay?: number;
    optional?: boolean;
  } = {}
): Promise<boolean> {
  const { retries = 3, retryDelay = 2000, optional = true } = options;
  
  if (!value) {
    console.log(`⚠️ No value provided for ${shortCode}, skipping`);
    return false;
  }

  const getQuestion = createAutoQuestionFetcher(page);
  
  // Retry logic for questions that load later
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const questionText = await getQuestion(shortCode, { optional });
      
      if (!questionText) {
        if (attempt < retries) {
          console.log(`⏳ Question ${shortCode} not found yet, retry ${attempt}/${retries}...`);
          await page.waitForTimeout(retryDelay);
          continue;
        } else {
          console.log(`⚠️ Question ${shortCode} not found after ${retries} attempts`);
          return false;
        }
      }

      // Question found, now select dropdown value
      const dropdownLocator = getLocator(
        `//div[contains(@label, '${questionText}')]/div/div//select`
      );
      if(!(await isElementVisible(dropdownLocator))){
        console.log(`⚠️ Dropdown for ${shortCode} is not visible`);
        return false;
      }

      await dropdownLocator.waitFor({ state: 'visible', timeout: 5000 });
      
      if (await dropdownLocator.isEnabled()) {
        await selectByText(dropdownLocator, value);
        console.log(`✅ Selected '${value}' for ${shortCode}`);
        return true;
      } else {
        console.log(`⚠️ Dropdown ${shortCode} is not enabled`);
        return false;
      }
    } catch (error) {
      if (attempt < retries) {
        console.log(`⏳ Error selecting ${shortCode}, retry ${attempt}/${retries}...`);
        await page.waitForTimeout(retryDelay);
      } else {
        console.error(`❌ Failed to select ${shortCode} after ${retries} attempts:`, error);
        return false;
      }
    }
  }
  
  return false;
}

/**
 * Generic function to answer qualification questions using Excel mapping and dynamic locator templates.
 * @param page Playwright page object
 * @param testInfo TestInfo object
 * @param qualificationsData Excel data for qualification questions
 * @param questionConfigs Array of { key, type, locatorTemplate }
 *        locatorTemplate: a function (questionText, answer) => locator
 * the function is for handling the dynamic qulifications
 */
export async function answerDynamicQualificationQuestions(
  page: Page,
  testInfo: TestInfo,
  qualificationsData: any,
  questionConfigs: Array<{
    key: string;
    type: 'checkbox' | 'radio';
    locatorTemplate: (questionText: string, answer?: string) => ReturnType<typeof getLocator>;
  }>
): Promise<void> {
  for (const config of questionConfigs) {
    const answer = qualificationsData[config.key];
    if (!answer) continue;
    const questionText = await getQuestionText(page, config.key);
    if (!questionText) continue;
    const locator = config.locatorTemplate(questionText, answer);
    if (config.type === 'checkbox') {
      if (answer.trim().toLowerCase() === 'yes') {
        const className = await locator.getAttribute('class');
        if (!className?.includes('x-grid-checkcolumn-checked')) {
          await locator.hover();
          await locator.click({ force: true, timeout: 6000 });
          await page.waitForTimeout(500);
        }
      }
    } else if (config.type === 'radio') {
      if (await locator.isVisible()) {
        await locator.click({ force: true, timeout: 4000 });
        await page.waitForTimeout(500);
      }
    }
  }
}
