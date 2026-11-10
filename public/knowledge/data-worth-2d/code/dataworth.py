"""
Data worth in a 2-D synthetic aquifer: a small, self-contained toolkit.

  1. make_ensemble()  : random ln K fields (prior) and their simulated heads and outflow (MODFLOW 6)
  2. worth(...)       : how much a set of new measurements would reduce uncertainty
  3. best_next(...)   : where the next measurement would help most (greedy monitoring design)

Uncertainty is estimated with the linear (Gaussian) data-worth formula, using covariances computed
from the ensemble:  Var(s | d) = Var(s) - Cov(s, d) [Cov(d, d) + R]^-1 Cov(d, s)
No new model runs are needed to test a monitoring design.
"""
import numpy as np

# ---------------------------------------------------------------- settings
NROW = NCOL = 50
DX = 10.0                     # m  -> 500 m x 500 m
THICK = 10.0                  # m, confined
H_WEST, H_EAST = 10.0, 5.0    # m, prescribed heads; north and south boundaries are no-flow
MEAN_LNK, VAR_LNK, RANGE = 2.16, 1.0, 200.0   # ln K (K in m/d), exponential covariance, practical range (m)
SIGMA_LNK, SIGMA_H = 0.1, 0.02                # measurement errors
N_ENS, SEED = 200, 1
LOC_RADIUS = 200.0            # m, Gaspari-Cohn localization for the ln K map (removes spurious long-range correlations)

# ---------------------------------------------------------------- 1. prior ensemble
def cell_xy():
    x = (np.arange(NCOL) + 0.5) * DX
    y = (NROW - np.arange(NROW) - 0.5) * DX
    X, Y = np.meshgrid(x, y)
    return np.column_stack([X.ravel(), Y.ravel()])

def simulate_fields(n=N_ENS, seed=SEED):
    """n Gaussian ln K fields by Cholesky decomposition of the covariance matrix."""
    p = cell_xy()
    h = np.sqrt(((p[:, None] - p[None]) ** 2).sum(-1))
    L = np.linalg.cholesky(VAR_LNK * np.exp(-3 * h / RANGE) + 1e-10 * np.eye(len(p)))
    z = np.random.default_rng(seed).standard_normal((len(p), n))
    return (MEAN_LNK + L @ z).T.reshape(n, NROW, NCOL)

def make_ensemble(n=N_ENS, seed=SEED, mf6_exe="mf6", ws="mf6_run"):
    """Prior ln K fields, steady heads and outflow (east boundary) for each member."""
    import flopy
    sim = flopy.mf6.MFSimulation(sim_ws=ws, exe_name=mf6_exe)
    flopy.mf6.ModflowTdis(sim)
    flopy.mf6.ModflowIms(sim, complexity="SIMPLE")
    g = flopy.mf6.ModflowGwf(sim, modelname="gwf", save_flows=True)
    flopy.mf6.ModflowGwfdis(g, nrow=NROW, ncol=NCOL, delr=DX, delc=DX, top=0.0, botm=-THICK)
    flopy.mf6.ModflowGwfic(g, strt=H_WEST)
    npf = flopy.mf6.ModflowGwfnpf(g, k=1.0)
    chd = [[(0, r, 0), H_WEST] for r in range(NROW)] + [[(0, r, NCOL - 1), H_EAST] for r in range(NROW)]
    flopy.mf6.ModflowGwfchd(g, stress_period_data=chd)
    flopy.mf6.ModflowGwfoc(g, head_filerecord="gwf.hds", budget_filerecord="gwf.cbc",
                           saverecord=[("HEAD", "ALL"), ("BUDGET", "ALL")])
    sim.write_simulation(silent=True)
    east = {r * NCOL + NCOL for r in range(NROW)}
    lnk = simulate_fields(n, seed)
    heads, outflow = np.empty_like(lnk), np.empty(n)
    for i in range(n):
        npf.k.set_data(np.exp(lnk[i])); npf.write()
        sim.run_simulation(silent=True)
        heads[i] = g.output.head().get_data()[0]
        f = g.output.budget().get_data(text="CHD")[0]
        outflow[i] = -sum(q for node, q in zip(f["node"], f["q"]) if node in east)
    return lnk, heads, outflow

# ---------------------------------------------------------------- 2. data worth
def gaspari_cohn(d, c=LOC_RADIUS):
    """Taper equal to 1 at distance 0 and 0 beyond 2c (Gaspari and Cohn, 1999)."""
    z = np.asarray(d, float) / c; r = np.zeros_like(z); a = z <= 1; b = (z > 1) & (z < 2)
    r[a] = -0.25 * z[a]**5 + 0.5 * z[a]**4 + 0.625 * z[a]**3 - 5 / 3 * z[a]**2 + 1
    r[b] = z[b]**5 / 12 - 0.5 * z[b]**4 + 0.625 * z[b]**3 + 5 / 3 * z[b]**2 - 5 * z[b] + 4 - 2 / (3 * z[b])
    return r

def _anomalies(lnk, heads, outflow):
    n = len(outflow)
    return (lnk.reshape(n, -1) - lnk.reshape(n, -1).mean(0),
            heads.reshape(n, -1) - heads.reshape(n, -1).mean(0),
            outflow - outflow.mean())

def worth(lnk, heads, outflow, k_cells=(), h_cells=()):
    """
    Effect of measuring ln K at k_cells and heads at h_cells (lists of (row, col)).
    Returns the outflow standard deviation before and after, and the ln K standard-deviation map after.
    """
    A_k, A_h, a_q = _anomalies(lnk, heads, outflow)
    n = len(outflow)
    idx = lambda rc: rc[0] * NCOL + rc[1]
    cols = [A_k[:, idx(c)] for c in k_cells] + [A_h[:, idx(c)] for c in h_cells]
    var_q = a_q.var(ddof=1)
    var_k = A_k.var(0, ddof=1)
    if not cols:
        return np.sqrt(var_q), np.sqrt(var_q), np.sqrt(var_k).reshape(NROW, NCOL)
    D = np.column_stack(cols)
    sd = np.array([SIGMA_LNK] * len(k_cells) + [SIGMA_H] * len(h_cells))
    M = np.linalg.inv(D.T @ D / (n - 1) + np.diag(sd ** 2))
    c_qd = a_q @ D / (n - 1)
    obs_xy = cell_xy()[[idx(c) for c in list(k_cells) + list(h_cells)]]
    rho = gaspari_cohn(np.sqrt(((cell_xy()[:, None] - obs_xy[None]) ** 2).sum(-1)))
    c_kd = rho * (A_k.T @ D / (n - 1))            # localized covariance between every cell and the data
    var_q_post = var_q - c_qd @ M @ c_qd
    var_k_post = np.clip(var_k - np.einsum("ij,jk,ik->i", c_kd, M, c_kd), 0, None)
    return np.sqrt(var_q), np.sqrt(max(var_q_post, 0)), np.sqrt(var_k_post).reshape(NROW, NCOL)

def best_next(lnk, heads, outflow, k_cells=(), h_cells=(), kind="K", step=2):
    """Share of the remaining outflow variance removed by ONE more measurement of `kind` at each candidate cell."""
    _, sd_now, _ = worth(lnk, heads, outflow, k_cells, h_cells)
    gain = np.full((NROW, NCOL), np.nan)
    for r in range(0, NROW, step):
        for c in range(1, NCOL - 1, step):
            ks, hs = (list(k_cells) + [(r, c)], list(h_cells)) if kind == "K" else (list(k_cells), list(h_cells) + [(r, c)])
            _, sd_new, _ = worth(lnk, heads, outflow, ks, hs)
            gain[r, c] = 1 - (sd_new / sd_now) ** 2
    return gain
