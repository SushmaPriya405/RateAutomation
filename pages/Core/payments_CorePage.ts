import { expect, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
  getLocatorByPlaceholder,
  getLocatorByRole,
  getLocatorByText,
} from "../../utils/locator-utils";
import {
  click,
  clear,
  fill,
  gotoURL,
  scrollLocatorIntoView,
  selectByText,
  selectByValue,
  wait,
} from "../../utils/action-utils";
import { captureAndAttachforCore, captureFullPage2D } from "../../utils/report-utils";
import { getFullStateName, formatToMMDDYYYY, convertExpiryDate } from "../../testdata/testData";
import { AMSuite_GPAURL } from "../../utils/url-constansts";
import { getPage } from "../../utils/page-utils";
import {
  BIG_TIMEOUT,
  MAX_TIMEOUT,
  STANDARD_TIMEOUT,
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from "../../utils/timeout-constants";
import { getText, isElementVisible } from "../../utils/element-utils";
import { validateRulesForTestCase, ValidationResult } from "../../utils/coreRuleBasedValidation";
import { errorWordingValidationCore, warningsWordingValidationCore } from "../../utils/wordingValidation";

export const getReturnToPaymentsText = () => getLocator("//a[@id = 'Policy_IssuanceChecklistPopup:__crumb__' and contains(text(), 'Return to Payment & Signatures')]");
const getBillingTypeDropDown = () => getLocator("//td[contains(@id, 'BillingType-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");

const getBillingMethodDropDown=()=>getLocator("//td[contains(@id, 'BillingMethod-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const getRenewMethodDropDown = () => getLocator("//td[contains(@id, 'renewTo-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]")


const getPaymentMethodDropDown = () => getLocator("//a[contains(@id, 'DownPaymentInstrumentMenuIcon')]");
const getNewPaymentMethodOption = () => getLocator("//span[contains(@id, 'CreateNewPaymentInstrument-textEl') and contains(text(), 'New')]");
const getSaveForFutureYesOption = () => getLocator('//input[@id="NewPaymentInstrumentPopup:OneTime_true-inputEl"]');
const getSaveForFutureNoOption = () => getLocator('//input[@id="NewPaymentInstrumentPopup:OneTime_false-inputEl"]');
const getPaymentMethodinPOpUp = () => getLocator("//td[contains(@id, 'PaymentMethod-inputCell')]/following-sibling::td//div[contains(@class,'x-form-arrow-trigger')]");
const enterRoutingNumber = () =>
  getLocator("#PaymentWidget").contentFrame().locator("#routingNumber");
const enterAccountNumber = () =>
  getLocator("#PaymentWidget").contentFrame().locator("#accountNumber");
const getVerifyButton = () =>
  getLocator("#PaymentWidget")
    .contentFrame()
    .getByRole("button", { name: "Verify" });
const getCreditCardNameonCard = () =>
  getLocator("#PaymentWidget")
    .contentFrame()
    .locator("#creditCardNameOnCard");
const getCreditCard = () =>
  getLocator("#PaymentWidget")
    .contentFrame()
    .locator('iframe[name="eProtect-iframe"]')
    .contentFrame()
    .getByRole("textbox", { name: "* Card number" });
const getExpMonth = () =>
  getLocator("#PaymentWidget")
    .contentFrame()
    .locator('iframe[name="eProtect-iframe"]')
    .contentFrame()
    .getByLabel("Card Expiration Date");
const getExpYear = () =>
  getLocator("#PaymentWidget")
    .contentFrame()
    .locator('iframe[name="eProtect-iframe"]')
    .contentFrame()
    .locator("#expYear");
const getOkinPopUpButton = () => getLocator("//span[@id = 'NewPaymentInstrumentPopup:Update-btnInnerEl']");
const getFullPayPlanRadioButton = () => getLocator("//div[contains(text(), 'Full Pay Plan')]/parent::td/preceding-sibling::td//div[contains(@class, 'radio')]");
const getSemiPayPlanRadioButton = () => getLocator("//div[contains(text(), 'Semi-Annual Pay Plan')]/parent::td/preceding-sibling::td//div[contains(@class, 'radio')]");
const getQuarterlyPayPlanRadioButton = () => getLocator("//div[contains(text(), 'Quarterly Pay Plan')]/parent::td/preceding-sibling::td//div[contains(@class, 'radio')]");
const getBiMonthlyPayPlanRadioButton = () => getLocator("//div[contains(text(), 'Bi-Monthly Pay Plan')]/parent::td/preceding-sibling::td//div[contains(@class, 'radio')]");
const getMonthlyElectronicPay = () => getLocator("//div[contains(text(), 'Monthly Electronic Pay Plan')]/parent::td/preceding-sibling::td//div[contains(@class, 'radio')]");
const getNoticeCheckBox = () => getLocator("//input[contains(@id, 'BillingAdjustmentsDV:NoticeReadCheckbox-inputEl')]");
const getSignTraditionalCheckBox = () => getLocator("//input[contains(@id, 'inPersonSignatureChoice_Choice-inputEl')]");
const getEmailAddressField = () => getLocator("//input[contains(@id, 'BillingRequiredSignaturesDV:emailAddress-inputEl')]");
const getAutomationCallsNoOption = () => getLocator("//input[contains(@id, 'CustomerCallOptIndicator_false-inputEl')]");
const getBindOptionsDropDown = () => getLocator("//span[contains(@id, 'BindOptions-btnWrap')]");
const getIssuePolicyButton = () => getLocator("//span[contains(@id, 'BindOptions:BindAndIssue-textEl') and contains(text(), 'Issue Policy')]");
const getOKButtonOnIssuePolicyPopUp = () => getLocator("//div[contains(@class, 'x-window-closable')]//span[contains(text(), 'OK')]");
const getPolicyNumber = () => getLocator("//div[contains(@id, 'obComplete:JobCompleteScreen:JobCompleteDV:ViewPolicy-inputEl')]");
const getViewYourSubmissionText = () => getLocator("//div[@id='JobComplete:JobCompleteScreen:JobCompleteDV:ViewJob-inputEl']");
const getClearButtoninRiskAnalysisCore = () => getLocator("//span[contains(@id, 'ClearButton-btnInnerEl')]");
const selectRecurringDropdownOption = () => getLocator("//table[contains(@id, 'BillingAdjustmentsDV:RecurringPaymentInstrument')]//tbody//tr//div[contains(@class, 'x-form-arrow-trigger')]");
const selectOptionforRecurringPaymentMethod = () => getLocator("(//ul[@class='x-list-plain']//li)[2]");
const getAvailablePaymentPlansText = () => getLocator("//label[normalize-space()='Available Payment Plans']");

async function enterNewPaymentMethodDetails(paymentData: any, AccountDetails: any) {
  await wait(2000);
  if(await isElementVisible(getPaymentMethodDropDown())){
    await click(getPaymentMethodDropDown());
  
    
    
  await wait(1000);
  await click(getNewPaymentMethodOption());
  }
  await wait(TIMEOUT_4_SECONDS);
  if (paymentData["Billing_Type"] === "Recurring Electronic") {
    await click(getSaveForFutureYesOption());
  } else {
    await click(getSaveForFutureNoOption());
  }
  await wait(TIMEOUT_4_SECONDS);
  await click(getPaymentMethodinPOpUp());
  const paymentMethodOption = getLocator(`//ul[@class='x-list-plain']//li[text()='${paymentData["Payment_Method"]}']`);
  await click(paymentMethodOption);
  await wait(1000);
  if (paymentData["Payment_Method"] == "EFT") {
    await enterRoutingNumber().click({ force: true });
    await fill(enterRoutingNumber(), paymentData["Routing_Number"].toString());
    await enterAccountNumber().click({ force: true });
    await fill(enterAccountNumber(), paymentData["Account_Number"].toString());
  }
  if (paymentData["Payment_Method"] == "Credit Card") {
    await fill(getCreditCardNameonCard(), AccountDetails["First_Name"]);
    await fill(getCreditCard(), paymentData["Credit_Card_Number"].toString());

    const expiry = paymentData["Exp_Date"].toString();
    const { month, year } = convertExpiryDate(expiry);

    await selectByText(getExpMonth(), month);
    await selectByText(getExpYear(), year);
  }
  await click(getVerifyButton());
  await wait(TIMEOUT_4_SECONDS);
  await click(getOkinPopUpButton());
  await wait(TIMEOUT_4_SECONDS);
}
async function selectRecurringPaymentMethod() {
  if(await isElementVisible(selectRecurringDropdownOption())){
  await click(selectRecurringDropdownOption());
  await click(selectOptionforRecurringPaymentMethod());
  await wait(TIMEOUT_4_SECONDS);
  }
}
async function selectPaymentPlan(PaymentPlan: string) {
  if (PaymentPlan === "Semi-Annual Pay Plan" ||
    PaymentPlan === "Semi-Annual pay Plan" ||
    PaymentPlan === "Semi-Annual pay plan"
  ) {
    await scrollLocatorIntoView(getSemiPayPlanRadioButton());
    await getSemiPayPlanRadioButton().click({ force: true });
  } else if (PaymentPlan === "Quarterly Pay Plan") {
    await scrollLocatorIntoView(getQuarterlyPayPlanRadioButton());
    await getQuarterlyPayPlanRadioButton().click({ force: true });
  } else if (PaymentPlan === "Bi-Monthly Pay Plan") {
    await scrollLocatorIntoView(getBiMonthlyPayPlanRadioButton());
    await getBiMonthlyPayPlanRadioButton().click({ force: true });
  } else if (PaymentPlan === "Monthly Electronic Pay Plan") {
    await scrollLocatorIntoView(getMonthlyElectronicPay());
    await getMonthlyElectronicPay().click({ force: true });
  } else if (PaymentPlan === "Full Pay Plan") {
    await getFullPayPlanRadioButton().scrollIntoViewIfNeeded();
    await getFullPayPlanRadioButton().click({ force: true });
  }
}


export async function enterPaymentDetails(page: Page, testInfo: TestInfo, paymentData: any, AccountData: any, ruleMatrix: Record<string, Record<string, any>>, blockingContext: string, testCaseId: any): Promise<ValidationResult> {

  console.log("Entering Payment Details...");
  await wait(1000);
  console.log("Payment Data: ", paymentData); 
  try {
    if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
      await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
    }
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    if (await isElementVisible(getReturnToPaymentsText())) {
      await scrollLocatorIntoView(getReturnToPaymentsText());
      await click(getReturnToPaymentsText());
    }
    await wait(TIMEOUT_4_SECONDS);
    await wait(4000);

    await click(getBillingMethodDropDown());
    await wait(1000);
    const optionLocator1 = getLocator(`//ul[@class='x-list-plain']//li[text()='${paymentData["Billing_Method"] || paymentData["Billing_Method "]  || paymentData["Billing_Method "]}']`);
    console.log("Billing Method Option Locator: ", optionLocator1);
    await click(optionLocator1);
    await wait(8000);
  if (await isElementVisible(getRenewMethodDropDown())){
    await click(getRenewMethodDropDown());
    await wait(1000);
    const optionLocator2 = getLocator(`//ul[@class='x-list-plain']//li[text()='${paymentData["Renew_Method"]}']`);
    console.log("Renew Type Option Locator: ", optionLocator2);
    await click(optionLocator2);
    await wait(1000);
  }


  if (await isElementVisible(getBillingTypeDropDown())){
    await scrollLocatorIntoView(getBillingTypeDropDown());
    await click(getBillingTypeDropDown());
    await wait(1000);
    const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${paymentData["Billing_Type"]}']`);
    console.log("Billing Type Option Locator: ", optionLocator);
    await click(optionLocator);
    await wait(2000);
    }
    await wait(2000);
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    if(await isElementVisible(getAvailablePaymentPlansText())){
    await enterNewPaymentMethodDetails(paymentData, AccountData);

    await wait(TIMEOUT_4_SECONDS);
    await selectPaymentPlan(paymentData["Payment_Plan"]);
    await wait(TIMEOUT_4_SECONDS);
    await selectRecurringPaymentMethod();
    if (await isElementVisible(getNoticeCheckBox())) {
      await wait(TIMEOUT_4_SECONDS);
      await click(getNoticeCheckBox());
    }
    await wait(TIMEOUT_4_SECONDS);
  }
  await wait(TIMEOUT_4_SECONDS);
    await click(getSignTraditionalCheckBox());
    await wait(TIMEOUT_4_SECONDS);
    if (AccountData["Email_Id"]) {
      console.log("Email Address Value: ", AccountData["Email_Id"]);
      await fill(getEmailAddressField(), AccountData["Email_Id"]);
      await wait(TIMEOUT_4_SECONDS);
    }
    await click(getAutomationCallsNoOption());
    await wait(TIMEOUT_4_SECONDS);
    if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
      await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
    }
    await wait(3000);
    const container = page.locator('#centerPanel');
    // await container.evaluate(el => {
    //   el.style.scrollBehavior = 'auto';
    //   el.scrollTop = 0;
    // });
    // await page.waitForTimeout(3000);
    // await captureAndAttachforCore(page, testInfo, "PaymentDetailsEntered_1 of 2", {
    //   fullPage: true
    // });
    // await page.waitForTimeout(3000);
    // await container.evaluate(el => {
    //   el.style.scrollBehavior = 'auto';
    //   el.scrollTop = el.scrollHeight - el.clientHeight;
    // });
    // await captureAndAttachforCore(page, testInfo, "PaymentDetailsEntered_2 of 2", {
    //   fullPage: false
    // });
    await captureFullPage2D(page, testInfo, "Payment Details Entered", "#centerPanel");
    await wait(3000);
    await getBindOptionsDropDown().click();
    await wait(3000);
    await click(getIssuePolicyButton());
    await wait(TIMEOUT_8_SECONDS);
    await click(getOKButtonOnIssuePolicyPopUp());
    await wait(TIMEOUT_8_SECONDS);
    await wait(8000);

    console.log("🔍 Performing rule-based validation for Policy Details...");
    const validationResult = await validateRulesForTestCase(
      testCaseId,
      blockingContext,
      ruleMatrix,
      page,
      testInfo
    );
    await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
    await wait(8000);
    if (await isElementVisible(getBindOptionsDropDown()) && !await isElementVisible(getViewYourSubmissionText())) {
      await wait(4000);
      if (await isElementVisible(getBindOptionsDropDown())) {
      await wait(4000);
      await getBindOptionsDropDown().click();
      await wait(3000);
      await click(getIssuePolicyButton());
      await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
      await click(getOKButtonOnIssuePolicyPopUp());
      await wait(TIMEOUT_4_SECONDS);
      }
      await wait(8000);
    }
    await getViewYourSubmissionText().waitFor({ state: 'visible', timeout: BIG_TIMEOUT });
    await captureFullPage2D(page, testInfo, "Policy Issued","#centerPanel");

    console.log("Payment Details validation result:", validationResult);
    return validationResult;
  }
  catch (error) {
    console.error("Operation failed:", error);
    throw error;

  }
}
export async function getPolicyNumberGenerated(page: Page, testInfo: TestInfo) {

  const rawText = await getPolicyNumber().textContent();
  const policy = rawText?.replace("View your policy ", "").replace("(", '').replace(")", '').replace("#", '').trim();

  return policy ?? "";

}

export async function enterPaymentDetails_CV(testInfo: TestInfo,
  page: Page,
  paymentdetailsData: any,
  AccountDetails: any,
  ruleMatrix: Record<string, Record<string, any>>,
  blockingContext: string,
  testCaseId: any
): Promise<ValidationResult> {

  console.log("Entering Payment Details...");
  await wait(1000);
  if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }
  if (await isElementVisible(getReturnToPaymentsText())) {
    await scrollLocatorIntoView(getReturnToPaymentsText());
    await click(getReturnToPaymentsText());
    await wait(TIMEOUT_4_SECONDS);
  }
  await click(getBillingTypeDropDown());
  await wait(1000);
  const optionLocator = getLocator(`//ul[@class='x-list-plain']//li[text()='${paymentdetailsData["Billing_Type"]}']`);
  console.log("Billing Type Option Locator: ", optionLocator);
  await click(optionLocator);

  await wait(2000);
  await enterNewPaymentMethodDetails(paymentdetailsData, AccountDetails);

  await wait(TIMEOUT_4_SECONDS);
  await selectPaymentPlan(paymentdetailsData["Payment_Plan"]);
  await wait(TIMEOUT_4_SECONDS);
  if (await isElementVisible(getNoticeCheckBox())) {
    await wait(TIMEOUT_4_SECONDS);
    await click(getNoticeCheckBox());
  }
  await wait(TIMEOUT_4_SECONDS);
  await click(getSignTraditionalCheckBox());
  await wait(TIMEOUT_4_SECONDS);
  if (paymentdetailsData["Email_id"]) {
    console.log("Email Address Value: ", paymentdetailsData["Email_id"]);
    await fill(getEmailAddressField(), paymentdetailsData["Email_id"]);
    await wait(TIMEOUT_4_SECONDS);
    await fill(getEmailAddressField(), paymentdetailsData["Email_id"]);
    await wait(TIMEOUT_4_SECONDS);
  }
  await click(getAutomationCallsNoOption());
  await wait(TIMEOUT_4_SECONDS);
  if (await isElementVisible(getClearButtoninRiskAnalysisCore())) {
    await getClearButtoninRiskAnalysisCore().click({ timeout: TIMEOUT_8_SECONDS });
  }
  await wait(3000);
  await getBindOptionsDropDown().scrollIntoViewIfNeeded();
  await wait(1000);
  const container = page.locator('#centerPanel');
  await container.evaluate(el => {
    el.style.scrollBehavior = 'auto';
    el.scrollTop = 0;
  });
  await page.waitForTimeout(3000);
  await captureAndAttachforCore(page, testInfo, "PaymentDetailsEntered 1 of 2", {
    fullPage: false
  });
  await page.waitForTimeout(3000);
  await container.evaluate(el => {
    el.style.scrollBehavior = 'auto';
    el.scrollTop = el.scrollHeight - el.clientHeight;
  });
  await page.waitForTimeout(3000);
  await captureAndAttachforCore(page, testInfo, "PaymentDetailsEntered 2 of 2", {
    fullPage: false
  });
  // await captureAndAttachforCore(page, testInfo, "PaymentDetailsEntered", {fullPage: true});
  await getBindOptionsDropDown().click();
  await wait(1000);
  await click(getIssuePolicyButton());
  await wait(TIMEOUT_8_SECONDS);
  await click(getOKButtonOnIssuePolicyPopUp());
  await wait(TIMEOUT_8_SECONDS);
  await getViewYourSubmissionText().waitFor({ state: 'visible', timeout: BIG_TIMEOUT });
  await captureAndAttachforCore(page, testInfo, "PolicyIssued", { fullPage: true });
  // Handle warnings first


  // Use rule-based validation for payment context
  const validationResult = await validateRulesForTestCase(testCaseId, blockingContext, ruleMatrix, page, testInfo);

  await wait(3000);
  return validationResult;
}
