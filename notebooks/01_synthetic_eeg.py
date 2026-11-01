"""NeuroAtlas P2 — build a reproducible synthetic EEG signal.

Run:  python 01_synthetic_eeg.py            (prints summary, saves synthetic_eeg.csv)
      python 01_synthetic_eeg.py --plot     (also shows the waveform)
Original NeuroAtlas exercise code — MIT License.
"""
import argparse
import numpy as np


def synthetic_eeg(fs=250, duration=10.0, alpha_uv=10.0, beta_uv=3.0, mains_hz=50.0, mains_uv=5.0,
                  noise_uv=4.0, eyes_closed=True, seed=42):
    """Return (t, x) with x in volts. Alpha is stronger with eyes closed."""
    rng = np.random.default_rng(seed)
    t = np.arange(0, duration, 1 / fs)
    alpha_amp = alpha_uv if eyes_closed else alpha_uv * 0.3
    # Alpha with slow amplitude modulation ("waxing and waning"), like real recordings
    envelope = 1 + 0.4 * np.sin(2 * np.pi * 0.2 * t)
    x = (alpha_amp * envelope * np.sin(2 * np.pi * 10 * t)
         + beta_uv * np.sin(2 * np.pi * 20 * t + 1.0)
         + mains_uv * np.sin(2 * np.pi * mains_hz * t)
         + noise_uv * rng.standard_normal(t.size))
    return t, x * 1e-6


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--plot", action="store_true")
    ap.add_argument("--eyes-open", action="store_true")
    args = ap.parse_args()
    fs = 250
    t, x = synthetic_eeg(fs=fs, eyes_closed=not args.eyes_open)
    print(f"samples={x.size}  duration={x.size / fs:.1f} s  fs={fs} Hz")
    print(f"std = {x.std() * 1e6:.2f} µV   peak-to-peak = {np.ptp(x) * 1e6:.1f} µV")
    np.savetxt("synthetic_eeg.csv", np.c_[t, x], delimiter=",", header="time_s,eeg_V", comments="")
    print("saved synthetic_eeg.csv")
    if args.plot:
        import matplotlib.pyplot as plt
        plt.figure(figsize=(9, 3))
        plt.plot(t[: 2 * fs], x[: 2 * fs] * 1e6, lw=0.8)
        plt.xlabel("time (s)"); plt.ylabel("µV"); plt.title("Synthetic EEG (first 2 s)")
        plt.tight_layout(); plt.show()


if __name__ == "__main__":
    main()
