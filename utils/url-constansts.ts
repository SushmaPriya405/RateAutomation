import { getEnvironmentUrls } from '../config/environments';

// Dynamic URLs based on current environment
const urls = getEnvironmentUrls();

export const AMSuiteBaseURL = urls.AMSuiteBaseURL;
export const AMSuiteHomePage = urls.AMSuiteHomePage;
export const AMSuite_CoreURL = urls.AMSuite_CoreURL;
export const AMSuite_GPAURL = urls.AMSuite_GPAURL;

// Log current environment URLs
console.log(`🌍 Current Environment URLs:`, urls);