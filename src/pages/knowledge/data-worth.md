---
layout: ../../layouts/ResourceLayout.astro
title: "Where should we measure? Data worth in groundwater modelling"
summary: "A hands-on introduction to data worth: why some measurements reduce prediction uncertainty and others don't, with an interactive explorer to design a monitoring network."
tags: [groundwater, uncertainty, data worth, MODFLOW 6, monitoring design]
level: "Graduate / practitioner"
topic: "Groundwater modelling"
topicId: "groundwater-modelling"
downloads:
  - label: "monitoring_design.ipynb"
    href: "/knowledge/data-worth-2d/code/monitoring_design.ipynb"
    note: "step-by-step notebook (with outputs)"
  - label: "dataworth.py"
    href: "/knowledge/data-worth-2d/code/dataworth.py"
    note: "toolkit: ensemble, data worth, best next location"
  - label: "full-experiment-code.zip"
    href: "/knowledge/data-worth-2d/code/full-experiment-code.zip"
    note: "complete ES-MDA experiment (advanced)"
---

Groundwater models are built from few data: a handful of conductivity measurements, a few observation wells. When the budget allows **one more measurement**, the useful question is not "how much data do we have?" but **"which measurement would reduce the uncertainty of the prediction we care about?"**. That is what **data-worth analysis** answers.

This page explains the idea with a small synthetic aquifer, and lets you test monitoring designs yourself.

## 1. The idea in one formula

For a prediction *s* (for example, the flow leaving an aquifer) and a new measurement *d*:

> **Var(s after) = Var(s before) − Cov(s, d)² / [ Var(d) + error² ]**

In plain words, a measurement is worth a lot only if it is:

1. **related to the prediction** (large covariance): it "sees" what the prediction depends on;
2. **not already known** from existing data (not redundant);
3. **precise enough** (small measurement error).

The formula contains **no measured value**, so it can be used **before collecting data**: that is what makes it a design tool.

## 2. The test aquifer

- A confined aquifer of 500 m × 500 m, 10 m thick, modelled with **MODFLOW 6**.
- Heads are **fixed at 10 m on the west side and 5 m on the east side**; the north and south sides are closed.
- Conductivity K is unknown: we describe it with **200 random fields** that share the same statistics (mean K ≈ 8.7 m/d, correlation range 200 m).
- **The prediction:** the outflow through the east boundary (about 430 ± 120 m³/d before any data).

The spread of the 200 model results is the **prior uncertainty**. Data worth tells us how much each measurement would shrink it.

## 3. The key result: K measurements versus heads

![The same 36 locations measured as K (left) or as heads (right)](/knowledge/data-worth-2d/figures/k-versus-heads.png)

Both types of data reduce the uncertainty of the **conductivity field**, but only **K measurements** strongly reduce the uncertainty of the **outflow**. Why?

- With heads fixed at the boundaries, **multiplying K everywhere by the same factor does not change the heads**. Heads therefore cannot tell how permeable the aquifer is **overall**.
- A head measures the **contrast** between upstream and downstream conductivities: think of two resistances in series, where the head in the middle depends on how the resistance is shared, not on its total.
- The outflow depends on exactly what heads cannot see: the **overall** conductivity.

**Lesson:** the worth of a measurement is **specific to the prediction**. The same head can be very useful for mapping K and almost useless for predicting the outflow.

## 4. Try it: the monitoring design explorer

<p><a class="open-explorer" href="/knowledge/data-worth-2d/explorer/monitoring-explorer.html" target="_blank" rel="noopener">Open the explorer</a></p>

<iframe class="resource-embed" src="/knowledge/data-worth-2d/explorer/monitoring-explorer.html" title="Monitoring design explorer" loading="lazy"></iframe>
<p class="embed-note">On a phone, the explorer is easier to use in its own tab: use the "Open the explorer" button above.</p>

Click on the map to add a K measurement or a head, and watch the uncertainty of the outflow and of the K field change. Then switch to **"Best next location"** to see where one more measurement would help most.

**Things to try:**

1. Add four heads anywhere: the outflow uncertainty barely moves. Then add four K measurements.
2. Show the best next location for the outflow: almost blank for heads, bright for K.
3. Change the target to "the conductivity field": heads become useful.
4. Put two K measurements side by side: the second adds little (**redundancy**).
5. Click **"Add best next"** several times: a simple, step-by-step monitoring design. Each step helps less than the one before.

## 5. What a full experiment adds

The explorer uses the linear formula. In a complete study, the data are actually **assimilated** (here with an ensemble smoother, ES-MDA, in MODFLOW 6), and the results are compared with the known "true" aquifer. Doing so confirmed the same picture, and added two lessons:

- Adding 32 measurements to a sparse network reduced the outflow uncertainty from about **90 to 31 m³/d as K data**, but only to **86 m³/d as heads**.
- **Lower uncertainty does not always mean a smaller error.** With one particular set of 16 measurements that happened to sample above-average conductivities, the predicted outflow moved *away* from the truth, while its reported uncertainty decreased. A prediction must therefore be checked against independent data, not only by its spread.

## 6. Limits to keep in mind

- The formula is **linear**: exact for K measurements in this example, approximate for heads.
- It measures the reduction of **reported uncertainty**, not whether the prediction becomes **correct**: that also requires an adequate model and prior.
- With a finite ensemble, small correlations appear by chance; the explorer removes them with **distance localization**.
- The results depend on the **boundary conditions**: with a fixed inflow instead of fixed heads, heads become informative about the overall conductivity.

## 7. Run it yourself

| File | What it is |
|---|---|
| <a href="/knowledge/data-worth-2d/explorer/monitoring-explorer.html" target="_blank" rel="noopener"><code>explorer/monitoring-explorer.html</code></a> | The interactive explorer (works offline in any browser) |
| <a href="/knowledge/data-worth-2d/code/dataworth.py" download><code>code/dataworth.py</code></a> | A short toolkit: build the ensemble, compute data worth, find the best next location |
| <a href="/knowledge/data-worth-2d/code/monitoring_design.ipynb" download><code>code/monitoring_design.ipynb</code></a> | A step-by-step notebook using the toolkit |
| <a href="/knowledge/data-worth-2d/code/full-experiment-code.zip" download><code>code/full-experiment-code.zip</code></a> | The complete experiment: progressive assimilation with ES-MDA, exact-posterior check, replicates |

Requirements: Python with `numpy`, `matplotlib` and `flopy`, and the **MODFLOW 6** executable.

## References

- Carrera, J., Neuman, S.P., 1986. Estimation of aquifer parameters under transient and steady state conditions: 2. Uniqueness, stability, and solution algorithms. *Water Resources Research* 22(2), 211–227.
- Emerick, A.A., Reynolds, A.C., 2013. Ensemble smoother with multiple data assimilation. *Computers & Geosciences* 55, 3–15.
- Fienen, M.N., Schachter, L.A., Hunt, R.J., 2025. A model uncertainty quantification protocol for evaluating the value of observation data. U.S. Geological Survey Scientific Investigations Report 2025-5007.
- Kerrou, J., Renard, P., Hendricks Franssen, H.-J., Lunati, I., 2008. Issues in characterizing heterogeneity and connectivity in non-multiGaussian media. *Advances in Water Resources* 31, 147–159.
- Tarantola, A., 2005. *Inverse Problem Theory and Methods for Model Parameter Estimation*. SIAM.

---

*Prepared by Kassahun Aweke Arega. This material grew out of a doctoral exam exercise; the code and text were developed with the help of an AI assistant (Claude) and checked by the author. Text and figures: CC BY 4.0. Code: MIT licence.*
