// Software list for the Software page (/software).
// To add a program: copy one entry inside a category and edit it.
// Links were checked on 2026-11-10. Versions change: always point to the official page.

export type Licence = "Public domain" | "Open source" | "Free download" | "Commercial";

export type Tool = {
  name: string;
  what: string;
  licence: Licence;
  platforms: string;
  website: string;
  download?: string;
  note?: string;
};

export type Category = { id: string; title: string; intro?: string; tools: Tool[] };

export const categories: Category[] = [
  {
    id: "modelling",
    title: "Groundwater flow and transport modelling",
    tools: [
      {
        name: "MODFLOW 6",
        what: "The USGS groundwater model. Simulates flow (GWF), solute transport (GWT) and particle tracking (PRT).",
        licence: "Public domain",
        platforms: "Windows · macOS · Linux",
        website: "https://www.usgs.gov/software/modflow-6-usgs-modular-hydrologic-model",
        download: "https://github.com/MODFLOW-ORG/modflow6/releases/latest",
        note: "Windows: download the file ending in _win64.zip.",
      },
      {
        name: "ModelMuse",
        what: "Free graphical interface (GUI) for building and running MODFLOW 6, MODFLOW-2005, SUTRA and more, including PEST support.",
        licence: "Public domain",
        platforms: "Windows",
        website: "https://www.usgs.gov/software/modelmuse-a-graphical-user-interface-groundwater-models",
        download: "https://water.usgs.gov/water-resources/software/ModelMuse/",
        note: "See the setup guide below.",
      },
      {
        name: "MODPATH 7",
        what: "Particle tracking for MODFLOW: flow paths, travel times, capture zones.",
        licence: "Public domain",
        platforms: "Windows (source code for others)",
        website: "https://www.usgs.gov/software/modpath-particle-tracking-model-modflow",
        download: "https://water.usgs.gov/water-resources/software/MODPATH/modpath_7_2_001.zip",
      },
    ],
  },
  {
    id: "unsaturated",
    title: "Unsaturated zone",
    tools: [
      {
        name: "HYDRUS-1D",
        what: "Water, heat and solute movement in variably saturated soil profiles (infiltration, recharge, root uptake).",
        licence: "Public domain",
        platforms: "Windows",
        website: "https://www.pc-progress.com/en/Default.aspx?hydrus-1d",
        download: "https://www.pc-progress.com/en/Default.aspx?H1d-downloads",
        note: "Version 4.17 stays free (public domain) but is no longer developed; new 1-D features are in HYDRUS version 5.",
      },
      {
        name: "phydrus",
        what: "Python package to build, run and read HYDRUS-1D models from a script or notebook.",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://github.com/phydrus/phydrus",
      },
    ],
  },
  {
    id: "calibration",
    title: "Calibration, uncertainty and data worth",
    tools: [
      {
        name: "PEST++",
        what: "Parameter estimation and uncertainty analysis for any model, including ensemble methods (pestpp-ies).",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://github.com/usgs/pestpp",
        download: "https://github.com/usgs/pestpp/releases",
        note: "Or install from Python: get-pestpp :pyemu",
      },
      {
        name: "pyEMU",
        what: "Python tools for PEST/PEST++: set up problems, linear uncertainty and data-worth analysis.",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://github.com/pypest/pyemu",
      },
      {
        name: "PEST",
        what: "The original model-independent parameter estimation suite, with groundwater utilities and a free book.",
        licence: "Free download",
        platforms: "Windows · Linux",
        website: "https://pesthomepage.org",
        download: "https://pesthomepage.org/programs",
      },
    ],
  },
  {
    id: "geochemistry",
    title: "Hydrogeochemistry",
    tools: [
      {
        name: "PHREEQC",
        what: "Aqueous geochemistry: speciation, saturation indices, mixing, reactive transport.",
        licence: "Public domain",
        platforms: "Windows · macOS · Linux",
        website: "https://www.usgs.gov/software/phreeqc-version-3",
        download: "https://www.usgs.gov/software/phreeqc-version-3",
        note: "Windows users can choose the interactive version (PhreeqcI) or the batch version.",
      },
      {
        name: "WQChartPy",
        what: "Python package for Piper, Stiff, Durov and other water-chemistry diagrams.",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://github.com/jyangfsu/WQChartPy",
        note: "pip install wqchartpy",
      },
    ],
  },
  {
    id: "timeseries",
    title: "Groundwater levels, pumping tests and analytic models",
    tools: [
      {
        name: "Pastas",
        what: "Time-series analysis of groundwater levels: response to rainfall, evaporation and pumping.",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://pastas.readthedocs.io",
        note: "pip install pastas",
      },
      {
        name: "TTim",
        what: "Transient analytic element model, useful for pumping tests and multi-aquifer systems.",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://github.com/mbakker7/ttim",
      },
      {
        name: "TimML",
        what: "Steady-state analytic element model for quick regional flow and capture-zone sketches.",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://github.com/mbakker7/timml",
      },
    ],
  },
  {
    id: "geostatistics",
    title: "Geostatistics",
    tools: [
      {
        name: "GSTools",
        what: "Variograms, kriging and random-field simulation in Python.",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://github.com/GeoStat-Framework/GSTools",
      },
      {
        name: "PyKrige",
        what: "Simple Python kriging (ordinary, universal) in 2-D and 3-D.",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://github.com/GeoStat-Framework/PyKrige",
      },
    ],
  },
  {
    id: "gis",
    title: "GIS and visualisation",
    tools: [
      {
        name: "QGIS",
        what: "Full desktop GIS: maps, rasters, interpolation, catchments, well locations.",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://qgis.org",
        download: "https://qgis.org/download/",
        note: "Choose the Long Term Release (LTR) for stability.",
      },
      {
        name: "ParaView",
        what: "3-D visualisation of model results (FloPy can export VTK files for it).",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://www.paraview.org",
        download: "https://www.paraview.org/download/",
      },
    ],
  },
  {
    id: "python",
    title: "Python for hydrogeology",
    intro: "One Python setup runs most of the open tools on this page. See the setup guide below.",
    tools: [
      {
        name: "Miniforge (conda)",
        what: "Recommended way to install Python and scientific packages, from the community conda-forge channel.",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://github.com/conda-forge/miniforge",
        download: "https://conda-forge.org/download/",
      },
      {
        name: "FloPy",
        what: "Build, run and post-process MODFLOW models in Python. Its get-modflow command installs MODFLOW 6 for you.",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://flopy.readthedocs.io",
      },
      {
        name: "JupyterLab",
        what: "Notebooks: code, figures and notes together. Ideal for learning and reproducible analyses.",
        licence: "Open source",
        platforms: "Windows · macOS · Linux",
        website: "https://jupyter.org/install",
      },
      {
        name: "Visual Studio Code",
        what: "Free code editor with Python and notebook support.",
        licence: "Free download",
        platforms: "Windows · macOS · Linux",
        website: "https://code.visualstudio.com",
        download: "https://code.visualstudio.com/download",
      },
    ],
  },
];

export const commercial = [
  { name: "GMS (Aquaveo)", website: "https://aquaveo.com/software/gms/introduction" },
  { name: "Visual MODFLOW Flex", website: "https://www.waterloohydrogeologic.com/products/visual-modflow-flex/" },
  { name: "Groundwater Vistas", website: "https://www.groundwatermodels.com" },
  { name: "FEFLOW (DHI)", website: "https://www.dhigroup.com/technologies/mikepoweredbydhi/feflow" },
];
