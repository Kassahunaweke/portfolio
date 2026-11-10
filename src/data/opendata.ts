// Open data sources and your own datasets for the "Data & Software" page (/data-software).
// To add a source: copy one entry and edit it. Links were checked on 2026-11-10.

export type DataSource = { name: string; what: string; coverage: string; website: string };
export type DataGroup = { id: string; title: string; sources: DataSource[] };

export const dataGroups: DataGroup[] = [
  {
    id: "data-satellite",
    title: "Satellite and climate data",
    sources: [
      {
        name: "GRACE / GRACE-FO mascons (CSR)",
        what: "Monthly terrestrial water storage anomalies from satellite gravity, the basis for groundwater storage change.",
        coverage: "Global · 2002–present",
        website: "https://www2.csr.utexas.edu/grace/RL06_mascons.html",
      },
      {
        name: "GRACE / GRACE-FO mascons (JPL)",
        what: "The NASA JPL mascon solution, with guidance on which GRACE product to choose.",
        coverage: "Global · 2002–present",
        website: "https://grace.jpl.nasa.gov/data/get-data/jpl_global_mascons/",
      },
      {
        name: "CHIRPS rainfall",
        what: "Satellite + station precipitation; performs well in data-poor regions such as East Africa.",
        coverage: "50°S–50°N · 1981–present · daily/monthly",
        website: "https://www.chc.ucsb.edu/data/chirps",
      },
      {
        name: "GLDAS",
        what: "Land-surface model outputs: soil moisture, runoff, evapotranspiration (used to isolate groundwater from GRACE).",
        coverage: "Global · 1948–present (several versions)",
        website: "https://ldas.gsfc.nasa.gov/gldas",
      },
      {
        name: "ERA5 reanalysis",
        what: "Hourly climate variables (temperature, precipitation, evaporation…) from the Copernicus Climate Data Store.",
        coverage: "Global · 1940–present",
        website: "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels",
      },
      {
        name: "NASA POWER",
        what: "Easy point or regional downloads of daily weather and solar data, handy for recharge models.",
        coverage: "Global · 1981–present",
        website: "https://power.larc.nasa.gov",
      },
    ],
  },
  {
    id: "data-terrain",
    title: "Terrain, soils and hydrogeology maps",
    sources: [
      {
        name: "OpenTopography",
        what: "Digital elevation models (SRTM, Copernicus DEM, lidar) with simple area downloads.",
        coverage: "Global",
        website: "https://opentopography.org",
      },
      {
        name: "HydroSHEDS",
        what: "Rivers, catchments and flow directions derived from elevation data.",
        coverage: "Global",
        website: "https://www.hydrosheds.org",
      },
      {
        name: "SoilGrids",
        what: "Soil properties (texture, organic carbon, bulk density…) at 250 m, useful for recharge and unsaturated-zone models.",
        coverage: "Global",
        website: "https://soilgrids.org",
      },
      {
        name: "GLHYMPS",
        what: "Global maps of near-surface permeability and porosity.",
        coverage: "Global",
        website: "https://doi.org/10.5683/SP2/DLGXYO",
      },
      {
        name: "WHYMAP",
        what: "World-wide hydrogeological mapping programme: aquifer and groundwater resource maps.",
        coverage: "Global",
        website: "https://www.whymap.org",
      },
    ],
  },
  {
    id: "data-groundwater",
    title: "Groundwater databases",
    sources: [
      {
        name: "IGRAC Global Groundwater Information System (GGIS)",
        what: "International portal for groundwater maps, monitoring data and transboundary aquifers.",
        coverage: "Global",
        website: "https://ggis.un-igrac.org",
      },
      {
        name: "Africa Groundwater Atlas",
        what: "Country-by-country hydrogeology of Africa (including Ethiopia), with maps and references.",
        coverage: "Africa",
        website: "https://www2.bgs.ac.uk/africagroundwateratlas/",
      },
      {
        name: "Groundwater Information Network (GIN)",
        what: "Canadian portal to well records, aquifer maps and groundwater monitoring data.",
        coverage: "Canada",
        website: "https://gin.gw-info.net",
      },
      {
        name: "Réseau de suivi des eaux souterraines du Québec",
        what: "Québec's groundwater-level monitoring network: observation wells and their records.",
        coverage: "Québec",
        website: "https://www.environnement.gouv.qc.ca/eau/piezo/",
      },
      {
        name: "Système d'information hydrogéologique (SIH)",
        what: "Québec's database of water wells and borehole information.",
        coverage: "Québec",
        website: "https://www.environnement.gouv.qc.ca/eau/souterraines/sih/",
      },
      {
        name: "Données Québec",
        what: "Québec's open data portal (search for “eaux souterraines”, aquifers, hydrogeological mapping projects).",
        coverage: "Québec",
        website: "https://www.donneesquebec.ca",
      },
      {
        name: "USGS Water Data for the Nation",
        what: "Groundwater levels, streamflow and water quality across the United States.",
        coverage: "United States",
        website: "https://waterdata.usgs.gov",
      },
    ],
  },
];

// Your own published datasets. Upload the files to a repository (Zenodo or Borealis) to get a DOI,
// then add an entry here, e.g.:
// { name: "…", what: "…", doi: "https://doi.org/10.5281/zenodo.xxxxxxx", licence: "CC BY 4.0" },
export type MyDataset = { name: string; what: string; doi: string; licence?: string };
export const myDatasets: MyDataset[] = [];
