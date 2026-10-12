import { expect, TestInfo, type Page } from "@playwright/test";
import {
  getLocator,
  getLocatorByPlaceholder,
  getLocatorByRole,
  getLocatorByText,
} from "../../utils/locator-utils";
import {
  click,
  fill,
  gotoURL,
  scrollLocatorIntoView,
  selectByText,
  selectByValue,
  wait,
} from "../../utils/action-utils";
import { captureAndAttachforCore, captureFullPage2D } from "../../utils/report-utils";
import { getFullStateName, formatToMMDDYYYY } from "../../testdata/testData";
import { AMSuite_CoreURL, AMSuite_GPAURL } from "../../utils/url-constansts";
import { getPage } from "../../utils/page-utils";
import {
  BIG_TIMEOUT,
  MAX_TIMEOUT,
  STANDARD_TIMEOUT,
  TIMEOUT_4_SECONDS,
  TIMEOUT_8_SECONDS,
} from "../../utils/timeout-constants";
import { getText, isElementVisible } from "../../utils/element-utils";
import { get } from "http";
import { TIMEOUT } from "dns";
import { waitForPageReady } from "./RiskAnalysis_CorePage";
// hi
const getActionsButton = () => getLocator(`//span[@class='x-btn-inner x-btn-inner-left' and contains(text(), 'Actions')]`);
const getNewAccountOption = () => getLocator('[id="Desktop:DesktopMenuActions:DesktopMenuActions_Create:DesktopMenuActions_NewAccount-textEl"]');
const getFirstName = () => getLocator('[id="NewAccount:NewAccountScreen:NewAccountSearchDV:GlobalPersonNameInputSet:FirstName-inputEl"]');
const getLastName = () => getLocator('[id="NewAccount:NewAccountScreen:NewAccountSearchDV:GlobalPersonNameInputSet:LastName-inputEl"]');
const getCountry = () => getLocator('//td[@role="presentation"]//div[contains(@class,"x-form-arrow-trigger")]/parent::td/parent::tr//td[@id="NewAccount:NewAccountScreen:NewAccountSearchDV:AddressOwnerAddressInputSet:globalAddressContainer:GlobalAddressInputSet:Country-inputCell"]');
const getCity = () => getLocator('//td//input[@id="NewAccount:NewAccountScreen:NewAccountSearchDV:AddressOwnerAddressInputSet:globalAddressContainer:GlobalAddressInputSet:CityNoAutoFill-inputEl"]');
const getZipCode = () => getLocatorByRole("textbox", { name: "ZIP Code" });
const getState = () => getLocator('//td[@role="presentation"]//div[contains(@class,"x-form-arrow-trigger")]/parent::td/parent::tr//td[@id="NewAccount:NewAccountScreen:NewAccountSearchDV:AddressOwnerAddressInputSet:globalAddressContainer:GlobalAddressInputSet:State-inputCell"]');
const getSearchButton = () => getLocator('[id="NewAccount:NewAccountScreen:NewAccountSearchDV:SearchAndResetInputSet:SearchLinksInputSet:Search"]');
const getCreateNewAccountButton = () => getLocator('//span[contains(@id, "NewAccount:NewAccountScreen:NewAccountButton-btnWrap")]');
const getPersonAccount = () => getLocator('[id="NewAccount:NewAccountScreen:NewAccountButton:NewAccount_Person-textEl"]');
const getDateOfBirth = () => getLocatorByPlaceholder("MM/dd/yyyy");
const getPrimaryPhoneType = () => getLocator('//td[@id="CreateAccount:CreateAccountScreen:CreateAccountDV:CreateAccountContactInputSet:PrimaryPhone-inputCell"]');
const getHomePhoneNumber = () => getLocator('//input[@id="CreateAccount:CreateAccountScreen:CreateAccountDV:CreateAccountContactInputSet:HomePhone:GlobalPhoneInputSet:NationalSubscriberNumber-inputEl"]');
const getWorkPhoneNumber = () => getLocator('//input[contains(@id,"CreateAccountContactInputSet:Phone:GlobalPhoneInputSet:NationalSubscriberNumber-inputEl")]');
const getMobilePhoneNumber = () => getLocator('//input[contains(@id,"CellPhone:GlobalPhoneInputSet:NationalSubscriberNumber-inputEl")]');
const getFaxPhoneNumber = () => getLocator("//input[contains(@id, 'FaxPhone:GlobalPhoneInputSet:NationalSubscriberNumber-inputEl')]");
const getEmailAddress = () => getLocator('//input[contains(@id,"CreateAccountContactInputSet:EmailAddress1-inputEl")]');
const getAddressLine1 = () => getLocator('//input[contains(@id,"GlobalAddressInputSet:AddressLine1-inputEl")]');
const getAddressLine2 = () => getLocator('//input[contains(@id,"GlobalAddressInputSet:AddressLine2-inputEl")]');
const getAddressType = () => getLocator('//table[contains(@id,"CreateAccountDV:AddressType-triggerWrap")]');
const getProducerCodeinCreateAccountPage = () => getLocator('//input[contains(@id,"ProducerSelectionInputSet:ProducerCode2-inputEl")]');
const getProducerCodesearchButton = () => getLocator('//div[contains(@id,"ProducerSelectionInputSet:ProducerCode2:SelectProducerCode")]');
const getProducerCodePopUp = () => getLocator('//input[contains(@id,"ProducerCodeSearchPopup:ProducerCodeSearchScreen:ProducerCodeSearchDV:Code-inputEl")]');
const getProducerCodePopUpSearchButton = () => getLocator('//a[contains(@id,"ProducerCodeSearchDV:SearchAndResetInputSet:SearchLinksInputSet:Search")]');
const getSelectProducerCode = () => getLocator('//a[contains(@id,"ProducerCodeSearchScreen:ProducerCodeSearchLV:0:_Select")]');
const getUpdateButton = () => getLocator('//span[contains(@id,"CreateAccount:CreateAccountScreen:Validate-btnInnerEl")]');
const getAccountCreatedText = () => getLocatorByText("Account File Summary");
const getAccountNumber = () => getLocator('//div[contains(@id,"AccountFile_Summary_BasicInfoDV:AccountNumber-inputEl")]');
const getErrorText = () => getLocator(`//div[@class='message' and contains(text(), 'Click "Cancel" to try again')]`);
const getCancelErroButton = () => getLocator('//span[@id="AddressRangePopup:Cancel-btnInnerEl"]');
const getAddressLine1inPopUp = () => getLocator('//input[@id="AddressRangePopup:addressline1-inputEl"]');
const getOverRideButton = () => getLocator('//span[@id="AddressRangePopup:Override-btnInnerEl"]');
const getChooseReasonDropDown = () => getLocator('//table[@id="AddressRangePopup:OverrideReason-triggerWrap"]');
const getNewConstructionOption = () => getLocator('//li[contains(text(), "New Construction")]');
const getOverRideErrorText = () => getLocator(`//div[contains(text(), 'An error has occured while verifying this address. Click "Override" to save this address as is')]`);
const getChooseReasonErrorButton = () => getLocator(`//div[contains(text(), 'Choose Reason : Missing required field "Choose Reason"')]`);
const getContinueButton = () => getLocator('//span[@id="AddressRangePopup:ToolbarButton-btnInnerEl" and contains(text(), "Continue")]');
const getValidAddressError = () => getLocator(`//div[contains(text(), "The address entered does not appear to be a valid address. Select a verified address option or click")]`);
const getSelectFirstAddressOption = () => getLocator('[id="AddressRangePopup:AddressStandardizeLV:0:select"]');
const getYesAutomaticCalls = () => getLocator("//input[contains(@id, 'CustomerCallOptIndicator_true-inputEl')]");
const getNoAutomaticCalls = () => getLocator("//input[contains(@id, 'CustomerCallOptIndicator_false-inputEl')]");
const getMiddleName = () => getLocator('//input[contains(@id, "GlobalPersonNameInputSet:MiddleName-inputEl")]');
const getSSNInputField = () => getLocator('//input[contains(@id, "OfficialIDInputSet:OfficialIDDV_Input-inputEl")]');
const getSSNMenuButton = () => getLocator('//a[@id="CreateAccount:CreateAccountScreen:CreateAccountDV:OfficialIDInputSet:OfficialIDDV_Input_MENU"]');
const getEnterNewValueOption = () => getLocator('//a[contains(@id, "menuitem-1238-itemEl")]//span[contains(text(),"Enter New Value")]');

export async function navigateToCoreAccount_page(page: Page, testInfo: TestInfo) {
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  await gotoURL(AMSuite_CoreURL);
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
     await getActionsButton().waitFor({ state: "visible", timeout: MAX_TIMEOUT });
  // console.log("Actions button is now visible");
  await getActionsButton().click({force: true });
  await wait(2000);
  await getNewAccountOption().click({ force: true});
}
 
export async function fillCoreAccountDetails_page(page: Page, testInfo: TestInfo, AccountDetails: any) {
  //Before Starting we will hide Feedback and Chat Form to get Clean Screen Shots.
  const elements = page.locator('//img[contains(@style,"z-index")]');
  const count = await elements.count();
  for (let i = 0; i < count; i++) {
    await elements.nth(i).evaluate((el) => {
      el.style.zIndex = '-1';
    });
  }
  await waitForPageReady(page);
  await fill(getFirstName(), AccountDetails["First_Name"], { timeout: STANDARD_TIMEOUT });
  await fill(getLastName(), AccountDetails["Last_Name"], { timeout: STANDARD_TIMEOUT });
  await getCountry().click({ timeout: STANDARD_TIMEOUT });
  let country;
  if(AccountDetails["Country"]){
     country = () => getLocator(`//ul[@class="x-list-plain"]//li[text()= '${AccountDetails["Country"]}']`);
  }
  else{
    country = () => getLocator(`//ul[@class="x-list-plain"]//li[text()= 'United States']`);
  }
 
  await country().click({ force: true });
  await getCity().click({ timeout: STANDARD_TIMEOUT });
  await fill(getCity(), AccountDetails["City"]);
  await getState().click({ timeout: STANDARD_TIMEOUT });
  const fullStateName = getFullStateName(AccountDetails["State"]);
  console.log(`Mapped state: ${AccountDetails["State"]} → ${fullStateName}`);
  let stateOption = () => getLocator(`//ul[@class="x-list-plain"]//li[text()= '${fullStateName}']`);
  await stateOption().click({ force: true });
  await fill(getZipCode(), AccountDetails["ZipCode"], { timeout: STANDARD_TIMEOUT });
  await click(getSearchButton(), { timeout: STANDARD_TIMEOUT });
  await wait(4000);
  await captureFullPage2D(page, testInfo, 'Create Account Details Image',"#centerPanel");
  await getCreateNewAccountButton().click({ timeout: STANDARD_TIMEOUT });
  await wait(4000);
  await getPersonAccount().click({ timeout: STANDARD_TIMEOUT });
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  // if (await isElementVisible(getCreateNewAccountButton(), { timeout: TIMEOUT_4_SECONDS })) {
  //   await click(getCreateNewAccountButton(), { timeout: STANDARD_TIMEOUT });
  //   await click(getPersonAccount(), { timeout: STANDARD_TIMEOUT });
  // }
}
 
async function enterPhoneNumber(page: Page, testInfo: TestInfo, value: any, PhoneNumber: any) {
  await getPrimaryPhoneType().click({ timeout: STANDARD_TIMEOUT });
  let phoneTypeOption = () => getLocator(`//ul[@class="x-list-plain"]//li[text()= '${value}']`);
  await phoneTypeOption().click({ force: true });
  if (value === "Work") {
    await getWorkPhoneNumber().click({ timeout: STANDARD_TIMEOUT });
    await fill(getWorkPhoneNumber(), PhoneNumber, { timeout: STANDARD_TIMEOUT });
  }
  if (value === "Home") {
    await getHomePhoneNumber().click({ timeout: STANDARD_TIMEOUT });
    await fill(getHomePhoneNumber(), PhoneNumber, { timeout: STANDARD_TIMEOUT });
  }
  if (value === "Mobile") {
    await getMobilePhoneNumber().click({ timeout: STANDARD_TIMEOUT });
    await fill(getMobilePhoneNumber(), PhoneNumber, { timeout: STANDARD_TIMEOUT });
  }
  if (value === "Other") {
    await getHomePhoneNumber().click({ timeout: STANDARD_TIMEOUT });
    await fill(getHomePhoneNumber(), PhoneNumber, { timeout: STANDARD_TIMEOUT });
  }
}
export async function selectAutomaticCallOption(value: any) {
  if (value === "Yes") {
    await getYesAutomaticCalls().click({ timeout: STANDARD_TIMEOUT });
  }
  if (value === "No") {
    await getNoAutomaticCalls().click({ timeout: STANDARD_TIMEOUT });
  }
}
export async function enterCreateAccountDetails(page: Page, testInfo: TestInfo, AccountDetails: any) {
  await page.waitForLoadState("load", { timeout: MAX_TIMEOUT });
  await wait(8000);
  await fill(getDateOfBirth(), formatToMMDDYYYY(AccountDetails["DATE_OF_BIRTH"]), { timeout: STANDARD_TIMEOUT });
  if(AccountDetails["Middle_Name"]){
  await fill(getMiddleName(), AccountDetails["Middle_Name"], { timeout: STANDARD_TIMEOUT });
  }
  await selectAutomaticCallOption(AccountDetails["Automated_Calls/Text"]);
  await enterPhoneNumber(page, testInfo, AccountDetails["Phone_Type"], AccountDetails["Phone_Number"]);
  await wait(2000);
  await getEmailAddress().click();
  await wait(1000);
  await fill(getEmailAddress(), AccountDetails["Email_Id"], { timeout: STANDARD_TIMEOUT });
  await wait(2000);
  await fill(getEmailAddress(), AccountDetails["Email_Id"], { timeout: STANDARD_TIMEOUT });
  await wait(2000);
 
  await getAddressLine1().click({ timeout: STANDARD_TIMEOUT });
  await fill(getAddressLine1(), AccountDetails["StreetAddress1"], { timeout: STANDARD_TIMEOUT });
  await wait(4000);
  if(AccountDetails["StreetAddress2"]){
  await getAddressLine2().click({ timeout: STANDARD_TIMEOUT });
  await fill(getAddressLine2(), AccountDetails["StreetAddress2"], { timeout: STANDARD_TIMEOUT });
  await wait(2000);
  }
  await getAddressType().click({ timeout: STANDARD_TIMEOUT });
  const addressType = AccountDetails["Address_type"] ?? AccountDetails["Address_Type"];
  let addressTypeOption = () => getLocator(`//ul[@class="x-list-plain"]//li[text()= '${addressType}']`);
  await addressTypeOption().click({ force: true });
  if (AccountDetails["SSN"]) {
    // Remove readonly attribute first
    await getSSNInputField().evaluate((el: any) => {
      el.removeAttribute('readonly');
    });
    await wait(500);
    await fill(getSSNInputField(), AccountDetails["SSN"], { timeout: STANDARD_TIMEOUT });
    console.log(`✅ Filled SSN: ${AccountDetails["SSN"]}`);
  }
  await fill(getProducerCodeinCreateAccountPage(), AccountDetails["ProducerCode"], { timeout: STANDARD_TIMEOUT });
  await click(getProducerCodesearchButton(), { timeout: STANDARD_TIMEOUT });
  await fill(getProducerCodePopUp(), AccountDetails["ProducerCode"], { timeout: STANDARD_TIMEOUT });
  await click(getProducerCodePopUpSearchButton(), { timeout: STANDARD_TIMEOUT });
  await click(getSelectProducerCode(), { timeout: STANDARD_TIMEOUT });
  await wait(4000);
  if (AccountDetails["SSN"]) {
    // Remove readonly attribute first
    await getSSNInputField().evaluate((el: any) => {
      el.removeAttribute('readonly');
    });
    await wait(500);
    await fill(getSSNInputField(), AccountDetails["SSN"], { timeout: STANDARD_TIMEOUT });
    console.log(`✅ Filled SSN: ${AccountDetails["SSN"]}`);
  }
  await wait(2000);
  await captureFullPage2D(page, testInfo, 'Create Account Before Update Image',"#centerPanel");
  await click(getUpdateButton(), { timeout: STANDARD_TIMEOUT });
  await wait(4000);
  if (await isElementVisible(getValidAddressError(), { timeout: TIMEOUT_4_SECONDS })) {
    await click(getSelectFirstAddressOption(), { timeout: STANDARD_TIMEOUT });
    await wait(4000);
  }
  if (await isElementVisible(getErrorText(), { timeout: TIMEOUT_4_SECONDS })) {
    await getCancelErroButton().click({ timeout: STANDARD_TIMEOUT });
    await click(getUpdateButton(), { timeout: STANDARD_TIMEOUT });
  }
 
  if (await isElementVisible(getOverRideErrorText(), { timeout: TIMEOUT_4_SECONDS })) {
    await fill(getAddressLine1inPopUp(), AccountDetails["StreetAddress1"], { timeout: STANDARD_TIMEOUT });
    await click(getOverRideButton(), { timeout: STANDARD_TIMEOUT });
    await wait(4000);
    await fill(getAddressLine1(), AccountDetails["StreetAddress1"], { timeout: STANDARD_TIMEOUT });
    await wait(4000);
    await click(getUpdateButton(), { timeout: STANDARD_TIMEOUT });
    await wait(4000);
    if (await isElementVisible(getChooseReasonErrorButton(), { timeout: TIMEOUT_4_SECONDS })) {
      await getChooseReasonDropDown().click({ timeout: STANDARD_TIMEOUT });
      await click(getNewConstructionOption(), { timeout: STANDARD_TIMEOUT });
      await click(getContinueButton(), { timeout: STANDARD_TIMEOUT });
      await wait(4000);
      await click(getUpdateButton(), { timeout: STANDARD_TIMEOUT });
    }
  }

  await captureFullPage2D(page, testInfo, 'Create Account After Update Image',"#centerPanel");

}
export async function verifyAccountCreation(page: Page, testInfo: TestInfo) {
  await expect(getAccountCreatedText()).toBeVisible({ timeout: BIG_TIMEOUT });
  await captureAndAttachforCore(page, testInfo, 'Account Created Successfully Image');
}
export async function getAccountNumberGenerated(): Promise<string> {
  await isElementVisible(getAccountNumber(), { timeout: STANDARD_TIMEOUT });
  let acc = getAccountNumber().innerText();
  console.log(`Account number: ${acc}`);
  return acc;
}