// Environment Configuration for AMOD Automation
export interface Environment {
  name: string;
  displayName: string;
  baseURL: string;
  homePage: string;
  coreURL: string;
  gpaURL: string;
  description: string;
}

export const ENVIRONMENTS: Record<string, Environment> = {  test: {
    name: 'test',
    displayName: 'Test Environment',
    baseURL: 'https://test.amsuite.amig.com/launch/bypass.html',
    homePage: 'https://test.amsuite.amig.com/dispatcher/home.do',
    coreURL: 'https://test.amsuite.amig.com/pc/PolicyCenter.do',
    gpaURL: 'https://test.amsuite.amig.com/gateway-portal/dist/html/#/home',
    description: 'Default testing environment'
  },
  test2: {
    name: 'test2',
    displayName: 'Test2 Environment',
    baseURL: 'https://test2.amsuite.amig.com/launch/bypass.html',
    homePage: 'https://test2.amsuite.amig.com/dispatcher/home.do',
    coreURL: 'https://test2.amsuite.amig.com/pc/PolicyCenter.do',
    gpaURL: 'https://test2.amsuite.amig.com/gateway-portal/dist/html/#/home',
    description: 'Test2 environment with SAML SSO'
  },
  datemove: {
    name: 'datemove',
    displayName: 'Datemove Environment',
    baseURL: 'https://datemove.amsuite.amig.com/launch/bypass.html',
    homePage: 'https://datemove.amsuite.amig.com/dispatcher/home.do',
    coreURL: 'https://datemove.amsuite.amig.com/pc/PolicyCenter.do',
    gpaURL: 'https://datemove.amsuite.amig.com/gateway-portal/dist/html/#/home',
    description: 'Datemove environment with User/Password authentication'
  },
  lab2: {
    name: 'lab2',
    displayName: 'Lab2 Environment',
    baseURL: 'https://lab2.amsuite.amig.com/launch/bypass.html',
    homePage: 'https://lab2.amsuite.amig.com/dispatcher/home.do',
    coreURL: 'https://lab2.amsuite.amig.com/pc/PolicyCenter.do',
    gpaURL: 'https://lab2.amsuite.amig.com/gateway-portal/dist/html/#/home',
    description: 'Lab2 environment with SAML SSO'
  },
  preprod: {
    name: 'Preprod',
    displayName: 'Preprod Environment',
    baseURL: 'https://preprod.amsuite.amig.com/launch/bypass.html',
    homePage: 'https://preprod.amsuite.amig.com/dispatcher/home.do',
    coreURL: 'https://preprod.amsuite.amig.com/pc/PolicyCenter.do',
    gpaURL: 'https://preprod.amsuite.amig.com/gateway-portal/dist/html/#/home',
    description: 'preprod environment with SAML SSO'
  }
};

export const DEFAULT_ENVIRONMENT = 'test';

// Enhanced environment validation function
export function validateAndSelectEnvironment(requestedEnv?: string): string {
  console.log(`🔍 Environment Selection Process:`);
  console.log(`   Requested Environment: "${requestedEnv || 'not specified'}"`);
 
  // If no environment specified, use default
  if (!requestedEnv || requestedEnv.trim() === '') {
    console.log(`   ✅ No environment specified, using default: ${DEFAULT_ENVIRONMENT}`);
    return DEFAULT_ENVIRONMENT;
  }
 
  // Check if requested environment exists
  const normalizedEnv = requestedEnv.toLowerCase();
 
  if (normalizedEnv in ENVIRONMENTS) {
    console.log(`   ✅ Valid environment found: ${normalizedEnv}`);
   
    // Show warning for production environment
    if (normalizedEnv === 'prod') {
      console.warn(`   🚨 WARNING: Running tests on PRODUCTION environment!`);
      console.warn(`   🚨 Please ensure this is intentional and necessary.`);
    }
   
    return normalizedEnv;
  }
 
  // Invalid environment - fallback to test
  console.log(`   ⚠️  Invalid environment "${requestedEnv}", falling back to: ${DEFAULT_ENVIRONMENT}`);
  console.log(`   📋 Available environments: ${Object.keys(ENVIRONMENTS).join(', ')}`);
  return DEFAULT_ENVIRONMENT;
}

// Enhanced getCurrentEnvironment function
export function getCurrentEnvironment(): string {
  // Check multiple sources in priority order:
  // 1. Command line argument (--env=staging)
  // 2. Environment variable TEST_ENV
  // 3. Environment variable NODE_ENV
  // 4. Default to test
 
  const cliArgs = process.argv;
  const cliEnvArg = cliArgs.find(arg => arg.startsWith('--env='));
  const cliEnv = cliEnvArg?.split('=')[1];
 
  const envVar = process.env.TEST_ENV || process.env.NODE_ENV;
 
  const requestedEnv = cliEnv || envVar;
 
  return validateAndSelectEnvironment(requestedEnv);
}

// Get environment configuration with enhanced validation
export function getEnvironmentConfig(envName?: string): Environment {
  const env = envName ? validateAndSelectEnvironment(envName) : getCurrentEnvironment();
  const config = ENVIRONMENTS[env];
 
  // This should never happen now due to validation, but keep as safety net
  if (!config) {
    console.error(`❌ Critical Error: Environment '${env}' not found even after validation!`);
    console.log(`   🔄 Emergency fallback to: ${DEFAULT_ENVIRONMENT}`);
    return ENVIRONMENTS[DEFAULT_ENVIRONMENT];
  }
 
  return config;
}

// Export current URLs based on environment
export function getEnvironmentUrls() {
  const config = getEnvironmentConfig();
  return {
    AMSuiteBaseURL: config.baseURL,
    AMSuiteHomePage: config.homePage,
    AMSuite_CoreURL: config.coreURL,
    AMSuite_GPAURL: config.gpaURL
  };
}