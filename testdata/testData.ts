import { Page, TestInfo } from "@playwright/test";
import { Document, Packer, Paragraph, Media, Table, TableRow, TableCell, HeadingLevel } from 'docx';
import path from 'path';
import fs from 'fs';

export const LoginCredentials = {
  get username(): string {
    return process.env.username?.trim() || "autotester";
  },
  password: "amigp@ss1",
};

export function getRuleMatrixUsername(
  ruleMatrixRecords: Record<string, Record<string, Record<string, unknown>>> | undefined,
  testCase: string | number
): string {
  const testCaseRules = ruleMatrixRecords?.[String(testCase)];
  if (!testCaseRules) return "autotester";

  for (const row of Object.values(testCaseRules)) {
    const value = Object.entries(row).find(([key]) => {
    const normalizedKey = key.replace(/[\s_-]/g, "").toLowerCase();
      return normalizedKey === "user" ||
        normalizedKey === "username" ||
        normalizedKey === "loginusername";
    })?.[1];

    const username = String(value ?? "").trim();
    if (username) return username;
  }

  return "autotester";
}

export let results: {
  testCase: string;
  status: string;
  Account_number: string;
  Submission_number: string;
  Policy_number: string;
  Validation_Error: string[];
  UWIDescription: string[];
}[] = [];

export const stateAbbreviationMap: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DC: "District of Columbia",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

export function getFullStateName(abbreviation: string): string {
  return stateAbbreviationMap[abbreviation.toUpperCase()] || abbreviation;
}

export function excelDateToString(serial: number): string {
  const excelEpoch = new Date(1899, 11, 30); // Excel's epoch starts on Dec 30, 1899
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${mm}/${dd}/${yyyy}`;
}

export function convertExpiryDate(expiry: string): {
  month: string;
  year: string;
} {
  const [mm, yy] = expiry.split("/");
  const monthNames = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = monthNames[parseInt(mm, 10)];
  const year = `20${yy}`;

  return { month, year };
}
export const roofCoveringMap: Record<string, string> = {
  "Aluminum": 'Aluminum, Corrugated',
  "Architectural Shingle": 'Shingles, Architectural',
  "Composition Shingle": 'Shingles, Asphalt/Fiberglass',
  "Copper": 'Copper',
  "Fiber Cement/Concrete": 'Shingle, Cement Fiber',
  "Heavy Gauge Steel": 'Shingles, Steel',
  "Other": 'Fiberglass, Translucent Panel',
  "Recycled Roof Products": 'Shingles, Synthetic/Rubber',
  "Roll Roofing": 'Rolled Roof/Single Ply',
  "Rubber": 'Rubber',
  "Slate": 'Slate',
  "Tar and Gravel": 'Built-Up/Tar and Gravel',
  "Tile": 'Tile, Clay',
  "Tin": 'Tin',
  "Vinyl": 'Vinyl',
  "Wood or Shake Shingle": 'Shakes, Wood',
}
export function getRoofCoveringMSB(abbreviation: string): string {
  return roofCoveringMap[abbreviation] || abbreviation;
}
export const roofStyleMap: Record<string, string> = {
  "Flat":	'Flat',
  "Gambrel":'Gambrel',
  "Mansard": 'Mansard',
  "Moderate Pitch": 'Gable, Moderate Pitch',
  "Shed": 'Shed',
  "Slight Pitch": 'Gable, Slight Pitch',
  "Steep Pitch": 'Gable, Steep Pitch',
}
export function getRoofStyleMSB(abbreviation: string): string {
  return roofStyleMap[abbreviation] || abbreviation;
}
export function getResidenceTypeMSB(abbreviation: string): string {
  return residenceTypeMap[abbreviation] || abbreviation;
}
export const residenceTypeMap: Record<string, string> = { 	
  "1 Family Residence":	'1',
  "2 Family Residence":	'2',
  "3 Family Residence":	'3',
  "4 Family Residence":	'4'
}
export function getNumberofStoriesMSB(abbreviation: string): string {
  return numberOfStoriesMap[abbreviation] || abbreviation;
}
export const numberOfStoriesMap: Record<string, string> = {
  "1": "1 Story",
  "1.5": "1.5 Story",
  "2": "2 Story",
  "2.5": "2.5 Story",
  "3": "3 Story",
  "Bi-Level": "Bi-Level",
  "Tri-level": "Tri-level"
}
export const constructionTypeMap: Record<string, string> = {
  "Brick Veneer": 'Brick on Frame',
  "Brick/Masonry": 'Brick on Masonry',
  "Concrete": 'Concrete Block, Painted',
  "Frame": 'EIFS on Frame',
  "Hand Hewn Log": 'Siding, Logs, Deluxe, Hand-Hewn',
  "Log": 'Logs, Solid',
  "Stucco": 'Stucco on Frame',
}
export function getConstructionType_MSB(abbreviation: string): string {
  return constructionTypeMap[abbreviation] || abbreviation;
}
export const heatingMethodMap: Record<string, string> = {
  "Electric": 'Electric Thermal Storage Unit',
  "Electric Baseboard": 'Heating, Electric Baseboard',
  "Heat Pump": 'Geothermal System, Closed Loop',
  "Natural Gas": 'Heating, Gas Forced Air',
  "Oil": 'Heating, Oil',
  "Propane": 'Heating, Propane Gas Forced Air',
  "Radiant Ceiling or Floor": 'Ceiling Heat, Electric Radiant'
}
export function getPrimaryHeating_MSB(abbreviation: string): string {
  return heatingMethodMap[abbreviation] || abbreviation;
}
export const foundationTypeMap: Record<string, string> = {
  "Basement - Below Grade": "Basement, Below Grade",
  "Basement - Walk Out": 'Basement, Walkout',
  "Crawl Space": 'Crawl Space, Unexcavated',
  "Hillside": 'Hillside',
  "Pier and Beam": 'Piers',
  "Pier and Post/Stilts": 'Piers',
  "Slab": 'Slab at Grade'

}
export function getFoundationType_MSB(abbreviation: string): string {
  return foundationTypeMap[abbreviation] || abbreviation;
}
export function formatToMMDDYYYY(dateInput: string | number): string {
  let dateStr: string;
  
  // Handle Excel serial date numbers
  if (typeof dateInput === 'number') {
    dateStr = excelDateToString(dateInput);
  } else {
    dateStr = dateInput;
  }
  
  const trimmed = dateStr.trim().replace(/-/g, '/');
  const regex = /^\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})$/;
  if (!regex.test(trimmed)) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const [month, day, yearStr] = trimmed.split('/');
  let year: string;

  if (yearStr.length === 2) {
    const yearNum = parseInt(yearStr, 10);
    year = yearNum >= 50 ? `19${yearStr}` : `20${yearStr}`; // heuristic: 50–99 → 1900s, 00–49 → 2000s
  } else {
    year = yearStr;
  }

  const formattedMonth = month.padStart(2, '0');
  const formattedDay = day.padStart(2, '0');

  return `${formattedMonth}/${formattedDay}/${year}`;
}

