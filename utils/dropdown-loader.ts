/**
 * dropdown-loader.ts: Utility to ensure all dropdown options are properly loaded
 * This script handles dynamic dropdown loading issues in automation
 */

import { Locator, Page } from "@playwright/test";
import { getLocator } from "./locator-utils";
import { wait } from "./action-utils";
import { isElementVisible } from "./element-utils";

export interface DropdownLoadOptions {
  maxRetries?: number;
  retryDelay?: number;
  triggerField?: string | Locator;
  dependentFields?: (string | Locator)[];
  expectedMinOptions?: number;
  scrollIntoView?: boolean;
}

/**
 * Ensures dropdown options are fully loaded before interaction
 */
export async function ensureDropdownLoaded(
  dropdownLocator: string | Locator,
  options: DropdownLoadOptions = {}
): Promise<string[]> {
  const {
    maxRetries = 5,
    retryDelay = 2000,
    triggerField,
    dependentFields = [],
    expectedMinOptions = 1,
    scrollIntoView = true
  } = options;

  const dropdown = typeof dropdownLocator === 'string' 
    ? getLocator(dropdownLocator) 
    : dropdownLocator;

  console.log(`🔄 Loading dropdown options...`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📋 Attempt ${attempt}/${maxRetries} to load dropdown options`);

      // Step 1: Ensure dropdown is visible
      if (scrollIntoView) {
        await dropdown.scrollIntoViewIfNeeded();
      }
      
      await dropdown.waitFor({ state: "visible", timeout: 10000 });

      // Step 2: Trigger field interaction if specified
      if (triggerField) {
        console.log(`🎯 Triggering field interaction...`);
        const trigger = typeof triggerField === 'string' ? getLocator(triggerField) : triggerField;
        
        try {
          await trigger.click({ timeout: 5000 });
          await wait(1000);
        } catch (error) {
          console.log(`⚠️ Trigger field click failed: ${error}`);
        }
      }

      // Step 3: Wait for dependent fields to load
      if (dependentFields.length > 0) {
        console.log(`⏳ Waiting for dependent fields to load...`);
        for (const depField of dependentFields) {
          const depLocator = typeof depField === 'string' ? getLocator(depField) : depField;
          try {
            await depLocator.waitFor({ state: "visible", timeout: 5000 });
          } catch (error) {
            console.log(`⚠️ Dependent field not loaded: ${error}`);
          }
        }
      }

      // Step 4: Click dropdown to open it
      await dropdown.click({ timeout: 5000 });
      await wait(retryDelay);

      // Step 5: Get options and validate
      const options = await dropdown.locator('option').allTextContents();
      const filteredOptions = options
        .map(opt => opt.trim())
        .filter(opt => opt !== '' && opt !== 'Select...' && opt !== 'Please select');

      console.log(`📊 Found ${filteredOptions.length} options:`, filteredOptions.slice(0, 10));

      if (filteredOptions.length >= expectedMinOptions) {
        console.log(`✅ Dropdown loaded successfully with ${filteredOptions.length} options`);
        return filteredOptions;
      } else {
        console.log(`⚠️ Only ${filteredOptions.length} options found, expected at least ${expectedMinOptions}`);
        
        if (attempt < maxRetries) {
          await wait(retryDelay);
          continue;
        }
      }
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error);
      if (attempt < maxRetries) {
        await wait(retryDelay);
      }
    }
  }

  throw new Error(`Failed to load dropdown options after ${maxRetries} attempts`);
}

/**
 * Pre-loads all vehicle-related dropdowns in sequence
 */
export async function preloadVehicleDropdowns(page: Page, vehicleType?: string): Promise<void> {
  console.log(`🚗 Pre-loading vehicle dropdowns for type: ${vehicleType || 'all'}`);

  const dropdownSequence = [
    {
      name: "Vehicle Type",
      locator: "//select[@options = 'vehicleType']",
      options: { expectedMinOptions: 3 }
    },
    {
      name: "Make",
      locator: "//div[contains(@label, 'Make')]//select",
      options: { 
        expectedMinOptions: 5,
        triggerField: "//select[@options = 'vehicleType']",
        retryDelay: 3000
      }
    },
    {
      name: "Model",
      locator: "//div[@model='vehicle.model']//select",
      options: { 
        expectedMinOptions: 2,
        dependentFields: ["//div[contains(@label, 'Make')]//select"],
        retryDelay: 3000
      }
    },
    {
      name: "Hull Construction",
      locator: "//div[contains(@label, 'Hull Construction')]//select",
      options: { expectedMinOptions: 2 }
    },
    {
      name: "Engine Type",
      locator: "//div[contains(@label, 'Engine Type')]//select",
      options: { expectedMinOptions: 2 }
    },
    {
      name: "Fuel Type",
      locator: "//div[contains(@label, 'Fuel Type')]//select",
      options: { expectedMinOptions: 2 }
    },
    {
      name: "Number of Engines",
      locator: "//div[contains(@label, 'Number of Engines')]//select",
      options: { expectedMinOptions: 1 }
    }
  ];

  for (const dropdown of dropdownSequence) {
    try {
      console.log(`📋 Loading ${dropdown.name} dropdown...`);
      
      // Check if dropdown exists first
      const locator = getLocator(dropdown.locator);
      if (await isElementVisible(locator)) {
        await ensureDropdownLoaded(dropdown.locator, dropdown.options);
        console.log(`✅ ${dropdown.name} loaded successfully`);
      } else {
        console.log(`⚠️ ${dropdown.name} not visible, skipping...`);
      }
      
      await wait(1000); // Brief pause between dropdowns
    } catch (error) {
      console.log(`❌ Failed to load ${dropdown.name}:`, error);
      // Continue with next dropdown instead of failing completely
    }
  }

  console.log(`🎉 Vehicle dropdowns pre-loading completed`);
}

/**
 * Enhanced Make dropdown loader with multiple strategies
 */
export async function loadMakeDropdownOptions(page: Page, vehicleType?: string): Promise<string[]> {
  console.log(`🏭 Loading Make dropdown options for vehicle type: ${vehicleType}`);

  const makeLocators = [
    "//div[contains(@label, 'Make')]//select[@ng-model='vehicle.make.value']",
    "//div[contains(@label, 'Make')]//select",
    "//select[@ng-model='vehicle.make.value']",
    "//div[@model='vehicle.make']//select"
  ];

  for (let i = 0; i < makeLocators.length; i++) {
    try {
      console.log(`🔍 Trying Make locator ${i + 1}/${makeLocators.length}: ${makeLocators[i]}`);
      
      const options = await ensureDropdownLoaded(makeLocators[i], {
        triggerField: "//select[@options = 'vehicleType']",
        expectedMinOptions: 5,
        retryDelay: 3000,
        maxRetries: 3
      });

      if (options.length > 0) {
        console.log(`✅ Make dropdown loaded with ${options.length} options using locator ${i + 1}`);
        return options;
      }
    } catch (error) {
      console.log(`❌ Make locator ${i + 1} failed:`, error);
    }
  }

  throw new Error("Failed to load Make dropdown with any locator strategy");
}

/**
 * Force refresh all dropdowns by triggering page interactions
 */
export async function forceRefreshDropdowns(page: Page): Promise<void> {
  console.log(`🔄 Force refreshing all dropdowns...`);

  try {
    // Trigger a page refresh of dynamic content
    await page.evaluate(() => {
      // Trigger change events on all selects to refresh dependent dropdowns
      const selects = document.querySelectorAll('select');
      selects.forEach(select => {
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('focus', { bubbles: true }));
      });
    });

    await wait(2000);

    // Click on vehicle type to trigger cascade
    try {
      const vehicleTypeDropdown = getLocator("//select[@options = 'vehicleType']");
      if (await isElementVisible(vehicleTypeDropdown)) {
        await vehicleTypeDropdown.click();
        await wait(1000);
        // Click away to close dropdown
        await page.click('body');
        await wait(1000);
      }
    } catch (error) {
      console.log(`⚠️ Vehicle type refresh failed:`, error);
    }

    console.log(`✅ Dropdown refresh completed`);
  } catch (error) {
    console.log(`❌ Force refresh failed:`, error);
  }
}

/**
 * Main function to ensure all dropdowns are ready for automation
 */
export async function initializeAllDropdowns(page: Page): Promise<void> {
  console.log(`🚀 Initializing all dropdowns for automation...`);

  try {
    // Step 1: Force refresh to trigger loading
    await forceRefreshDropdowns(page);

    // Step 2: Pre-load common dropdowns
    await preloadVehicleDropdowns(page);

    // Step 3: Wait for page to stabilize
    await page.waitForLoadState('load');
    await wait(3000);

    console.log(`🎉 All dropdowns initialized successfully`);
  } catch (error) {
    console.log(`❌ Dropdown initialization failed:`, error);
    throw error;
  }
}
