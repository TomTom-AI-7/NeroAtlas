"""NeuroAtlas C2 — PSD before/after filtering, plus a band-power feature table.

Run:  python 02_spectrum_filter.py           (prints band powers, saves psd_before_after.png)
Original NeuroAtlas exercise code — MIT License.
"""
import numpy as np
from scipy.signal import butter, sosfiltfilt, iirnotch, filtfilt, welch

BANDS = {"delta": (1, 4), "theta": (4, 8), "alpha": (8, 13), "beta": (13, 30), "gamma": (30, 45)}


def make_signal(fs=250, duration=60, seed=0, eyes_closed=True):
    rng = np.random.default_rng(seed)
    t = np.arange(0, duration, 1 / fs)
    drift = 20 * np.sin(2 * np.pi * 0.1 * t)                       # electrode drift (µV)
    alpha = (12 if eyes_closed else 4) * np.sin(2 * np.pi * 10 * t)
    mains = 8 * np.sin(2 * np.pi * 50 * t)
    pink = np.cumsum(rng.standard_normal(t.size)); pink -= np.convolve(pink, np.ones(fs) / fs, "same")
    return t, drift + alpha + mains + 0.5 * pink + 3 * rng.standard_normal(t.size)


def preprocess(x, fs, band=(0.5, 40.0), notch=50.0):
    """Zero-phase band-pass + notch. Returns filtered signal and a log of the decisions."""
    sos = butter(4, band, btype="bandpass", fs=fs, output="sos")
    y = sosfiltfilt(sos, x)
    b, a = iirnotch(notch, Q=30, fs=fs)
    y = filtfilt(b, a, y)
    log = {"filter": f"Butterworth order 4 band-pass {band[0]}-{band[1]} Hz, zero-phase (sosfiltfilt)",
           "notch": f"IIR notch {notch} Hz, Q=30, zero-phase"}
    return y, log


def band_powers(x, fs):
    f, p = welch(x, fs=fs, nperseg=2 * fs)
    total = np.trapezoid(p[(f >= 1) & (f <= 45)], f[(f >= 1) & (f <= 45)])
    out = {}
    for name, (lo, hi) in BANDS.items():
        m = (f >= lo) & (f < hi)
        absolute = np.trapezoid(p[m], f[m])
        out[f"{name}_abs"] = absolute
        out[f"{name}_rel"] = absolute / total
    return out


def main():
    fs = 250
    rows = []
    for subject, closed in [("sub-01", True), ("sub-01", False)]:
        _, x = make_signal(fs=fs, eyes_closed=closed, seed=1)
        y, log = preprocess(x, fs)
        bp = band_powers(y, fs)
        rows.append({"subject_id": subject, "condition": "eyes_closed" if closed else "eyes_open", **bp})
    print("preprocessing log:", log)
    print(f"{'condition':12s} " + " ".join(f"{b+'_rel':>10s}" for b in BANDS))
    for r in rows:
        print(f"{r['condition']:12s} " + " ".join(f"{r[b + '_rel']:10.3f}" for b in BANDS))
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        _, x = make_signal(fs=fs)
        y, _ = preprocess(x, fs)
        for sig, label in [(x, "raw"), (y, "filtered 0.5–40 Hz + notch")]:
            f, p = welch(sig, fs=fs, nperseg=2 * fs)
            plt.semilogy(f, p, label=label)
        plt.xlim(0, 70); plt.xlabel("Hz"); plt.ylabel("PSD (µV²/Hz)"); plt.legend(); plt.tight_layout()
        plt.savefig("psd_before_after.png", dpi=120)
        print("saved psd_before_after.png")
    except ImportError:
        print("(matplotlib not installed — skipping figure)")


if __name__ == "__main__":
    main()
