# NeuroAtlas exercise scripts

Original, MIT-licensed scripts used in the lessons. They need only NumPy/SciPy/scikit-learn (matplotlib optional).

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python 01_synthetic_eeg.py        # P2: reproducible synthetic EEG
python 02_spectrum_filter.py      # C2: PSD before/after filtering + band-power table
python 03_subject_wise_cv.py      # C4: trial-wise vs subject-wise CV (leakage)
```

| Script | Lesson | Deliverable |
|---|---|---|
| `01_synthetic_eeg.py` | P2-1 | synthetic EEG generator with fixed seed |
| `02_spectrum_filter.py` | C2-3, C2-4 | before/after PSD figure, logged filter decisions, band-power table |
| `03_subject_wise_cv.py` | C4-2 | leakage demonstration with GroupKFold |

For real data (C3), use the official MNE example linked in the app:
<https://mne.tools/stable/auto_examples/decoding/decoding_csp_eeg.html> (BSD-3). The PhysioNet data is downloaded by MNE at run time; it is not redistributed here.
