"""NeuroAtlas C4 — why trial-wise splits leak, and how GroupKFold fixes it.

Simulates people whose EEG features carry a person-specific "fingerprint" but NO real
difference between groups. A trial-wise split still scores far above chance.
Run:  python 03_subject_wise_cv.py
Original NeuroAtlas exercise code — MIT License.
"""
import numpy as np
from sklearn.model_selection import KFold, GroupKFold, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression


def simulate(n_sub=30, n_trials=40, n_feat=10, fingerprint=2.0, effect=0.0, seed=0):
    rng = np.random.default_rng(seed)
    labels_sub = np.repeat([0, 1], n_sub // 2)
    X, y, g = [], [], []
    for s in range(n_sub):
        fp = rng.normal(0, fingerprint, n_feat)
        shift = effect * labels_sub[s]                 # true group effect on every feature
        X.append(fp + shift + rng.normal(0, 1, (n_trials, n_feat)))
        y += [labels_sub[s]] * n_trials
        g += [s] * n_trials
    return np.vstack(X), np.array(y), np.array(g)


def evaluate(effect, seed=0):
    X, y, g = simulate(effect=effect, seed=seed)
    models = {"kNN": KNeighborsClassifier(5), "LogReg": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))}
    out = {}
    for name, m in models.items():
        trial = cross_val_score(m, X, y, cv=KFold(5, shuffle=True, random_state=seed), scoring="balanced_accuracy")
        subj = cross_val_score(m, X, y, cv=GroupKFold(5), groups=g, scoring="balanced_accuracy")
        out[name] = (trial.mean(), subj.mean(), subj.std())
    return out


def main():
    for effect in (0.0, 0.8):
        print(f"\ntrue group effect = {effect}  (chance = 0.50)")
        for name, (trial, subj, sd) in evaluate(effect).items():
            print(f"  {name:7s} trial-wise BA = {trial:.2f}   subject-wise BA = {subj:.2f} ± {sd:.2f}")
    print("\nTake-away: report subject-wise (GroupKFold / leave-one-subject-out) results for subject-level labels.")


if __name__ == "__main__":
    main()
