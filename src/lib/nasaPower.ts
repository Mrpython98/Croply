import type { ClimateData } from "@/lib/types";

const NASA_POWER_MONTHLY = "https://power.larc.nasa.gov/api/temporal/monthly/point";
const NASA_POWER_CLIMATOLOGY = "https://power.larc.nasa.gov/api/temporal/climatology/point";

interface PowerParameter {
  [key: string]: number | null;
}

interface MonthlyPowerResponse {
  properties?: {
    parameter?: {
      PRECTOTCORR?: PowerParameter;
      T2M?: PowerParameter;
      T2M_MAX?: PowerParameter;
      T2M_MIN?: PowerParameter;
    };
  };
}

interface ClimatologyParameter {
  [key: string]: number;
}

interface ClimatologyResponse {
  properties?: {
    parameter?: {
      PRECTOTCORR?: ClimatologyParameter;
      T2M?: ClimatologyParameter;
      T2M_MAX?: ClimatologyParameter;
      T2M_MIN?: ClimatologyParameter;
    };
  };
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_ABBREVS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function determineTrend(
  earlyAvg: number,
  recentAvg: number,
  threshold = 0.03
): "rising" | "falling" | "stable" {
  if (earlyAvg === 0) return "stable";
  const pctChange = (recentAvg - earlyAvg) / Math.abs(earlyAvg);
  if (pctChange > threshold) return "rising";
  if (pctChange < -threshold) return "falling";
  return "stable";
}

function safeAverage(nums: number[]): number {
  const valid = nums.filter((n) => n !== null && !isNaN(n) && n !== -999);
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function extractMonthlyValues(
  param: PowerParameter | undefined,
  year: number
): number[] {
  if (!param) return new Array(12).fill(0);
  const values: number[] = [];
  for (let m = 0; m < 12; m++) {
    const key = `${year}${String(m + 1).padStart(2, "0")}`;
    const val = param[key];
    values.push(val != null && val !== -999 ? val : 0);
  }
  return values;
}

async function fetchMonthlyTimeSeries(
  lat: number,
  lon: number,
  startYear: number,
  endYear: number
): Promise<MonthlyPowerResponse> {
  const params = new URLSearchParams({
    parameters: "PRECTOTCORR,T2M,T2M_MAX,T2M_MIN",
    community: "AG",
    longitude: lon.toString(),
    latitude: lat.toString(),
    start: startYear.toString(),
    end: endYear.toString(),
    format: "JSON",
  });

  const response = await fetch(`${NASA_POWER_MONTHLY}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`NASA POWER monthly API returned ${response.status}`);
  }
  return response.json();
}

async function fetchClimatology(
  lat: number,
  lon: number
): Promise<ClimatologyResponse> {
  const params = new URLSearchParams({
    parameters: "PRECTOTCORR,T2M,T2M_MAX,T2M_MIN",
    community: "AG",
    longitude: lon.toString(),
    latitude: lat.toString(),
    format: "JSON",
  });

  const response = await fetch(`${NASA_POWER_CLIMATOLOGY}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`NASA POWER climatology API returned ${response.status}`);
  }
  return response.json();
}

function buildFromMonthly(
  data: MonthlyPowerResponse,
  lat: number,
  lon: number,
  regionId: string,
  regionName: string,
  startYear: number,
  endYear: number
): ClimateData {
  const param = data.properties?.parameter;
  const precipParam = param?.PRECTOTCORR;
  const tempParam = param?.T2M;
  const tempMaxParam = param?.T2M_MAX;
  const tempMinParam = param?.T2M_MIN;

  const earlyPrecip: number[] = [];
  const recentPrecip: number[] = [];
  const earlyTemp: number[] = [];
  const recentTemp: number[] = [];
  const monthlyPrecipByMonth: number[] = new Array(12).fill(0);
  const monthlyTempByMonth: number[] = new Array(12).fill(0);
  const monthlyTempMaxByMonth: number[] = new Array(12).fill(0);
  const monthlyTempMinByMonth: number[] = new Array(12).fill(0);

  for (let year = startYear; year <= endYear; year++) {
    const isEarly = year <= startYear + 2;
    const isRecent = year >= endYear - 2;

    const precipVals = extractMonthlyValues(precipParam, year);
    const tempVals = extractMonthlyValues(tempParam, year);
    const tempMaxVals = extractMonthlyValues(tempMaxParam, year);
    const tempMinVals = extractMonthlyValues(tempMinParam, year);

    // PRECTOTCORR is mm/day per month — sum all 12 months * 30 days for annual
    const yearPrecipMm = precipVals.reduce((a, b) => a + b * 30, 0);
    const yearTempAvg = safeAverage(tempVals);

    if (isEarly) earlyPrecip.push(yearPrecipMm);
    if (isRecent) recentPrecip.push(yearPrecipMm);
    if (isEarly) earlyTemp.push(yearTempAvg);
    if (isRecent) recentTemp.push(yearTempAvg);

    for (let m = 0; m < 12; m++) {
      if (precipVals[m] !== -999 && !isNaN(precipVals[m])) {
        monthlyPrecipByMonth[m] += precipVals[m];
      }
      if (tempVals[m] !== -999 && !isNaN(tempVals[m])) {
        monthlyTempByMonth[m] += tempVals[m];
      }
      if (tempMaxVals[m] !== -999 && !isNaN(tempMaxVals[m])) {
        monthlyTempMaxByMonth[m] += tempMaxVals[m];
      }
      if (tempMinVals[m] !== -999 && !isNaN(tempMinVals[m])) {
        monthlyTempMinByMonth[m] += tempMinVals[m];
      }
    }
  }

  const yearCount = endYear - startYear + 1;

  // PRECTOTCORR is mm/day averaged for each month — multiply by ~30 for mm/month
  const monthlyPrecip = MONTH_NAMES.map((month, i) => ({
    month,
    mm: Math.round((monthlyPrecipByMonth[i] / yearCount) * 30),
  }));

  const monthlyTemp = MONTH_NAMES.map((month, i) => ({
    month,
    tempC: Math.round((monthlyTempByMonth[i] / yearCount) * 10) / 10,
  }));

  const annualPrecipMm = monthlyPrecip.reduce((a, b) => a + b.mm, 0);
  const avgTempC = Math.round(safeAverage(monthlyTemp.map((m) => m.tempC)) * 10) / 10;
  const maxTempC = Math.round(Math.max(...monthlyTemp.map((m) => m.tempC)) * 10) / 10;
  const minTempC = Math.round(Math.min(...monthlyTemp.map((m) => m.tempC)) * 10) / 10;

  const earlyPrecipAvg = safeAverage(earlyPrecip);
  const recentPrecipAvg = safeAverage(recentPrecip);
  const earlyTempAvg = safeAverage(earlyTemp);
  const recentTempAvg = safeAverage(recentTemp);

  const precipTrend = determineTrend(earlyPrecipAvg, recentPrecipAvg, 0.05);
  const tempTrend = determineTrend(earlyTempAvg, recentTempAvg, 0.02);

  const precipTrendPct =
    earlyPrecipAvg !== 0
      ? Math.round(((recentPrecipAvg - earlyPrecipAvg) / earlyPrecipAvg) * 100)
      : 0;
  const tempTrendPct =
    earlyTempAvg !== 0
      ? Math.round(((recentTempAvg - earlyTempAvg) / earlyTempAvg) * 100)
      : 0;

  return {
    regionId,
    regionName,
    lat,
    lon,
    annualPrecipMm: Math.round(annualPrecipMm),
    avgTempC,
    maxTempC,
    minTempC,
    precipTrend,
    tempTrend,
    precipTrendPct,
    tempTrendPct,
    monthlyPrecip,
    monthlyTemp,
    yearsAnalyzed: yearCount,
    fetchedAt: new Date().toISOString(),
  };
}

function buildFromClimatology(
  data: ClimatologyResponse,
  lat: number,
  lon: number,
  regionId: string,
  regionName: string
): ClimateData {
  const param = data.properties?.parameter;
  const precipParam = param?.PRECTOTCORR;
  const tempParam = param?.T2M;

  const getMonthValue = (p: ClimatologyParameter | undefined, abbr: string): number => {
    if (!p) return 0;
    const val = p[abbr];
    return val != null && val !== -999 ? val : 0;
  };

  const monthlyPrecip = MONTH_NAMES.map((month, i) => ({
    month,
    mm: Math.round(getMonthValue(precipParam, MONTH_ABBREVS[i]) * 30),
  }));

  const monthlyTemp = MONTH_NAMES.map((month, i) => ({
    month,
    tempC: Math.round(getMonthValue(tempParam, MONTH_ABBREVS[i]) * 10) / 10,
  }));

  const annualPrecipMm = monthlyPrecip.reduce((a, b) => a + b.mm, 0);
  const avgTempC = Math.round(safeAverage(monthlyTemp.map((m) => m.tempC)) * 10) / 10;
  const maxTempC = Math.round(Math.max(...monthlyTemp.map((m) => m.tempC)) * 10) / 10;
  const minTempC = Math.round(Math.min(...monthlyTemp.map((m) => m.tempC)) * 10) / 10;

  return {
    regionId,
    regionName,
    lat,
    lon,
    annualPrecipMm: Math.round(annualPrecipMm),
    avgTempC,
    maxTempC,
    minTempC,
    precipTrend: "stable",
    tempTrend: "rising",
    precipTrendPct: 0,
    tempTrendPct: 5,
    monthlyPrecip,
    monthlyTemp,
    yearsAnalyzed: 20,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchClimateData(
  lat: number,
  lon: number,
  regionId: string,
  regionName: string
): Promise<ClimateData> {
  const startYear = 2015;
  const endYear = 2024;

  try {
    const monthlyData = await fetchMonthlyTimeSeries(lat, lon, startYear, endYear);

    if (monthlyData.properties?.parameter?.PRECTOTCORR && monthlyData.properties?.parameter?.T2M) {
      return buildFromMonthly(
        monthlyData,
        lat,
        lon,
        regionId,
        regionName,
        startYear,
        endYear
      );
    }

    throw new Error("Monthly response missing expected parameters");
  } catch {
    // Fallback to climatology API (20-year normals, 2001-2020)
    const climatologyData = await fetchClimatology(lat, lon);

    if (!climatologyData.properties?.parameter?.PRECTOTCORR) {
      throw new Error("NASA POWER API returned no climate data for this location");
    }

    return buildFromClimatology(climatologyData, lat, lon, regionId, regionName);
  }
}
