// import { expect, type Locator, type Page } from '@playwright/test'
import { click, clickAndNavigate, fill, gotoURL, wait } from "../../utils/action-utils";
import { getRuleMatrixUsername, LoginCredentials } from "../../testdata/testData";
import { getLocator, getLocatorByRole } from "../../utils/locator-utils";
import { AMSuiteBaseURL, AMSuiteHomePage } from "../../utils/url-constansts";
import { isElementVisible } from "../../utils/element-utils";
import { MAX_TIMEOUT, NAVIGATION_TIMEOUT } from "../../utils/timeout-constants";
import { getPage } from "../../utils/page-utils";

const getUsername = "#username";
const getPassword = () => getLocator("#password");
const getNextButton = () => getLocatorByRole("button", { name: "Next" });
const getLoginButton = () => getLocatorByRole("button", { name: "Log in" });
const AMuite_PolicyLoginURL =
  '//a[@href="/pc/PolicyCenter.do?nosso=true&internal=true"] | //a[@href="https://test2.amsuite.amig.com/dispatcher/home.do?nosso=true&internal=true"] |  //a[@href="/pc/PolicyCenter.do?nosso=true"]'
export async function navigateToAMSuiteLoginPage() {
  await gotoURL(AMSuiteBaseURL);
  await getPage().waitForLoadState("load", { timeout: MAX_TIMEOUT });
  if (await isElementVisible(AMuite_PolicyLoginURL)) {
    await click(AMuite_PolicyLoginURL);
  }
  await getPage().waitForLoadState("load", { timeout: MAX_TIMEOUT });
  // Clear localStorage and sessionStorage
  await getPage().evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await isElementVisible(getUsername, { timeout: MAX_TIMEOUT });
}
export async function logInSuccesfully(
  ruleMatrixRecords?: Record<string, Record<string, Record<string, unknown>>>,
  testCase?: string | number
) {
  const username = testCase === undefined
    ? LoginCredentials.username
    : getRuleMatrixUsername(ruleMatrixRecords, testCase);
  await fill(getUsername, username);

  await clickAndNavigate(getNextButton());
  await fill(getPassword(), LoginCredentials.password);

  await click(getLoginButton());
}
