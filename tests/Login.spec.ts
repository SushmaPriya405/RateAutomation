import { test } from '@playwright/test';
import * as LoginPage from '../pages/GPA/Residential/LoginPage';

test('Login to AMSuite successfully', async ({ page }) => {
  
  await LoginPage.navigateToAMSuiteLoginPage();
  await LoginPage.logInSuccesfully();
  // await Loginpage.ClickonNext();
  // await Loginpage.EnterPassword();
  // await Loginpage.ClickonLoginButton();
  
});