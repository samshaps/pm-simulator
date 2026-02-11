# PM Simulator — Monte Carlo Variance Analysis

**Simulations per config:** 2000
**Total simulations:** 36000
**Ticket template pool:** 147 templates across 8 categories


## 1. Year-End Rating Distribution


### Easy Difficulty

| Strategy | Exceeds | Meets Strong | Meets | Needs Improv. | Does Not Meet | Avg Score |
|----------|---------|--------------|-------|---------------|---------------|-----------|
| Random | 18.9% | 47.7% | 30.6% | 2.8% | 0.1% | 73.3 |
| Balanced | 24.3% | 51.9% | 22.9% | 0.8% | 0.1% | 76.5 |
| CEO-Aligned | 27.6% | 48.1% | 23.1% | 1.1% | 0.1% | 76.5 |
| Growth-Focused | 0.8% | 24.1% | 56.0% | 17.8% | 1.3% | 58.6 |
| Tech-Debt-First | 24.1% | 47.9% | 26.9% | 1.1% | 0.0% | 75.5 |
| Always Overbook | 0.0% | 2.6% | 40.6% | 53.3% | 3.6% | 43.7 |

### Normal Difficulty

| Strategy | Exceeds | Meets Strong | Meets | Needs Improv. | Does Not Meet | Avg Score |
|----------|---------|--------------|-------|---------------|---------------|-----------|
| Random | 3.0% | 14.9% | 40.3% | 32.1% | 9.7% | 49.8 |
| Balanced | 6.0% | 22.1% | 46.2% | 21.6% | 4.0% | 57.3 |
| CEO-Aligned | 5.1% | 21.1% | 46.4% | 22.8% | 4.7% | 56.1 |
| Growth-Focused | 0.1% | 6.2% | 31.6% | 48.9% | 13.2% | 41.5 |
| Tech-Debt-First | 3.9% | 15.8% | 46.8% | 28.1% | 5.4% | 53.1 |
| Always Overbook | 0.0% | 0.3% | 18.9% | 59.8% | 21.1% | 34.3 |

### Hard Difficulty

| Strategy | Exceeds | Meets Strong | Meets | Needs Improv. | Does Not Meet | Avg Score |
|----------|---------|--------------|-------|---------------|---------------|-----------|
| Random | 0.1% | 2.4% | 19.2% | 51.5% | 26.8% | 34.4 |
| Balanced | 0.4% | 4.2% | 27.9% | 48.2% | 19.4% | 38.7 |
| CEO-Aligned | 0.4% | 4.3% | 29.8% | 45.3% | 20.3% | 39.3 |
| Growth-Focused | 0.0% | 1.9% | 16.8% | 57.0% | 24.3% | 34.1 |
| Tech-Debt-First | 0.4% | 3.5% | 23.3% | 48.9% | 24.1% | 36.4 |
| Always Overbook | 0.0% | 0.1% | 9.8% | 62.5% | 27.7% | 31.0 |


## 2. Ticket Outcome Probabilities

Average outcome distribution across all tickets in a full game:


### Easy

| Strategy | Clear Success | Partial | Unexpected | Soft Fail | Catastrophe | Avg Tickets/Game |
|----------|---------------|---------|------------|-----------|-------------|------------------|
| Random | 29.8% | 53.4% | 8.6% | 6.2% | 2.0% | 56.7 |
| Balanced | 30.7% | 53.3% | 8.4% | 5.7% | 1.9% | 67.3 |
| CEO-Aligned | 31.2% | 53.4% | 8.5% | 5.1% | 1.9% | 64.8 |
| Growth-Focused | 27.7% | 52.8% | 8.6% | 8.6% | 2.4% | 35.7 |
| Tech-Debt-First | 30.4% | 52.8% | 8.7% | 6.2% | 1.9% | 67.9 |
| Always Overbook | 22.6% | 50.3% | 8.6% | 14.6% | 3.9% | 30.3 |

### Normal

| Strategy | Clear Success | Partial | Unexpected | Soft Fail | Catastrophe | Avg Tickets/Game |
|----------|---------------|---------|------------|-----------|-------------|------------------|
| Random | 23.7% | 50.5% | 8.8% | 13.2% | 3.8% | 43.0 |
| Balanced | 25.6% | 50.7% | 8.8% | 11.7% | 3.2% | 54.5 |
| CEO-Aligned | 26.3% | 50.6% | 8.8% | 11.0% | 3.2% | 50.5 |
| Growth-Focused | 21.8% | 49.9% | 8.7% | 14.8% | 4.8% | 28.2 |
| Tech-Debt-First | 24.5% | 50.3% | 8.7% | 13.1% | 3.5% | 57.4 |
| Always Overbook | 18.4% | 49.1% | 9.0% | 17.9% | 5.7% | 26.1 |

### Hard

| Strategy | Clear Success | Partial | Unexpected | Soft Fail | Catastrophe | Avg Tickets/Game |
|----------|---------------|---------|------------|-----------|-------------|------------------|
| Random | 18.9% | 50.2% | 8.9% | 16.4% | 5.7% | 35.2 |
| Balanced | 20.3% | 50.3% | 8.8% | 15.3% | 5.3% | 42.8 |
| CEO-Aligned | 21.2% | 50.7% | 8.8% | 14.1% | 5.2% | 39.6 |
| Growth-Focused | 17.4% | 51.2% | 8.7% | 16.7% | 6.0% | 24.8 |
| Tech-Debt-First | 19.1% | 50.5% | 9.0% | 16.2% | 5.3% | 48.5 |
| Always Overbook | 14.1% | 51.4% | 9.4% | 18.7% | 6.4% | 24.7 |


## 3. Metric Trajectories Over Time

Average metric values at each sprint across all simulations:


### Random (Normal Difficulty)

| Sprint | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS | Capacity |
|--------|------|-----|-------|-----|------------|------------|-----------|-----|----------|
| Q1S1 | 57 | 53 | 53 | 53 | 41 | 44 | 40 | 54 | 20.5 |
| Q1S2 | 54 | 55 | 57 | 57 | 44 | 48 | 44 | 53 | 20.0 |
| Q1S3 | 52 | 58 | 60 | 61 | 46 | 52 | 47 | 53 | 19.4 |
| Q2S1 | 50 | 60 | 60 | 65 | 47 | 55 | 51 | 51 | 19.0 |
| Q2S2 | 48 | 62 | 62 | 67 | 49 | 58 | 54 | 51 | 18.7 |
| Q2S3 | 45 | 63 | 63 | 69 | 50 | 61 | 57 | 50 | 18.4 |
| Q3S1 | 44 | 65 | 61 | 70 | 50 | 64 | 60 | 49 | 18.1 |
| Q3S2 | 42 | 66 | 61 | 69 | 52 | 67 | 62 | 48 | 17.6 |
| Q3S3 | 41 | 67 | 61 | 69 | 53 | 69 | 64 | 47 | 17.1 |
| Q4S1 | 39 | 67 | 59 | 68 | 53 | 71 | 66 | 46 | 16.9 |
| Q4S2 | 38 | 67 | 58 | 67 | 54 | 72 | 68 | 45 | 16.5 |
| Q4S3 | 37 | 67 | 58 | 65 | 54 | 74 | 69 | 44 | 16.1 |

### Balanced (Normal Difficulty)

| Sprint | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS | Capacity |
|--------|------|-----|-------|-----|------------|------------|-----------|-----|----------|
| Q1S1 | 58 | 53 | 52 | 55 | 43 | 43 | 40 | 55 | 20.5 |
| Q1S2 | 57 | 56 | 56 | 61 | 47 | 46 | 42 | 55 | 20.3 |
| Q1S3 | 55 | 59 | 59 | 68 | 49 | 48 | 43 | 55 | 20.2 |
| Q2S1 | 55 | 62 | 60 | 74 | 51 | 51 | 44 | 54 | 20.4 |
| Q2S2 | 53 | 64 | 63 | 79 | 53 | 53 | 44 | 53 | 20.7 |
| Q2S3 | 52 | 66 | 65 | 83 | 56 | 56 | 44 | 53 | 20.9 |
| Q3S1 | 51 | 68 | 66 | 85 | 57 | 59 | 43 | 52 | 21.2 |
| Q3S2 | 50 | 69 | 67 | 87 | 59 | 61 | 43 | 52 | 21.2 |
| Q3S3 | 48 | 71 | 68 | 88 | 61 | 64 | 43 | 52 | 21.3 |
| Q4S1 | 48 | 72 | 68 | 88 | 62 | 66 | 43 | 51 | 21.1 |
| Q4S2 | 47 | 73 | 69 | 88 | 64 | 69 | 43 | 50 | 21.1 |
| Q4S3 | 46 | 74 | 69 | 88 | 65 | 71 | 43 | 50 | 21.0 |

### CEO-Aligned (Normal Difficulty)

| Sprint | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS | Capacity |
|--------|------|-----|-------|-----|------------|------------|-----------|-----|----------|
| Q1S1 | 59 | 53 | 53 | 55 | 41 | 44 | 39 | 54 | 20.5 |
| Q1S2 | 57 | 56 | 56 | 60 | 43 | 47 | 41 | 54 | 20.4 |
| Q1S3 | 55 | 58 | 59 | 65 | 44 | 51 | 43 | 54 | 20.3 |
| Q2S1 | 54 | 61 | 60 | 69 | 45 | 54 | 45 | 53 | 20.2 |
| Q2S2 | 53 | 63 | 63 | 73 | 47 | 58 | 46 | 52 | 20.2 |
| Q2S3 | 52 | 66 | 64 | 76 | 48 | 61 | 47 | 51 | 20.3 |
| Q3S1 | 51 | 68 | 64 | 78 | 50 | 64 | 48 | 50 | 20.4 |
| Q3S2 | 49 | 69 | 65 | 79 | 51 | 67 | 49 | 50 | 20.2 |
| Q3S3 | 49 | 71 | 65 | 80 | 52 | 69 | 49 | 50 | 20.2 |
| Q4S1 | 48 | 72 | 64 | 80 | 53 | 72 | 50 | 49 | 20.1 |
| Q4S2 | 47 | 73 | 64 | 80 | 54 | 74 | 50 | 48 | 19.9 |
| Q4S3 | 46 | 74 | 64 | 80 | 55 | 75 | 51 | 48 | 19.8 |

### Growth-Focused (Normal Difficulty)

| Sprint | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS | Capacity |
|--------|------|-----|-------|-----|------------|------------|-----------|-----|----------|
| Q1S1 | 57 | 53 | 52 | 48 | 42 | 45 | 47 | 53 | 20.5 |
| Q1S2 | 54 | 57 | 54 | 46 | 45 | 50 | 58 | 52 | 19.3 |
| Q1S3 | 52 | 60 | 55 | 44 | 48 | 55 | 69 | 51 | 17.7 |
| Q2S1 | 49 | 62 | 53 | 40 | 50 | 58 | 79 | 49 | 16.1 |
| Q2S2 | 47 | 64 | 52 | 36 | 51 | 61 | 87 | 47 | 14.8 |
| Q2S3 | 45 | 65 | 50 | 32 | 52 | 64 | 92 | 45 | 13.9 |
| Q3S1 | 43 | 66 | 46 | 28 | 52 | 66 | 96 | 43 | 13.3 |
| Q3S2 | 42 | 68 | 44 | 24 | 53 | 69 | 97 | 41 | 13.0 |
| Q3S3 | 41 | 69 | 42 | 20 | 53 | 70 | 98 | 40 | 12.7 |
| Q4S1 | 39 | 69 | 38 | 17 | 53 | 72 | 99 | 37 | 12.5 |
| Q4S2 | 38 | 70 | 35 | 15 | 54 | 73 | 99 | 36 | 12.3 |
| Q4S3 | 37 | 71 | 33 | 13 | 54 | 75 | 99 | 34 | 12.2 |

### Tech-Debt-First (Normal Difficulty)

| Sprint | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS | Capacity |
|--------|------|-----|-------|-----|------------|------------|-----------|-----|----------|
| Q1S1 | 57 | 52 | 49 | 58 | 42 | 42 | 36 | 54 | 20.5 |
| Q1S2 | 55 | 55 | 50 | 66 | 44 | 44 | 35 | 54 | 20.5 |
| Q1S3 | 53 | 57 | 51 | 74 | 46 | 45 | 34 | 53 | 20.9 |
| Q2S1 | 51 | 59 | 50 | 81 | 47 | 47 | 34 | 52 | 21.5 |
| Q2S2 | 48 | 61 | 51 | 86 | 49 | 49 | 33 | 51 | 22.0 |
| Q2S3 | 47 | 63 | 52 | 89 | 51 | 51 | 32 | 51 | 22.2 |
| Q3S1 | 45 | 64 | 51 | 91 | 52 | 53 | 32 | 50 | 22.4 |
| Q3S2 | 43 | 65 | 52 | 93 | 54 | 56 | 31 | 50 | 22.4 |
| Q3S3 | 41 | 67 | 53 | 94 | 55 | 57 | 31 | 49 | 22.3 |
| Q4S1 | 40 | 67 | 51 | 94 | 56 | 59 | 31 | 48 | 22.2 |
| Q4S2 | 39 | 68 | 52 | 95 | 57 | 61 | 30 | 48 | 22.2 |
| Q4S3 | 38 | 69 | 52 | 95 | 59 | 62 | 30 | 48 | 22.1 |

### Always Overbook (Normal Difficulty)

| Sprint | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS | Capacity |
|--------|------|-----|-------|-----|------------|------------|-----------|-----|----------|
| Q1S1 | 42 | 51 | 54 | 49 | 40 | 46 | 45 | 53 | 20.5 |
| Q1S2 | 27 | 52 | 57 | 48 | 41 | 50 | 55 | 52 | 17.7 |
| Q1S3 | 16 | 53 | 59 | 45 | 42 | 55 | 65 | 51 | 15.0 |
| Q2S1 | 9 | 54 | 56 | 42 | 42 | 58 | 74 | 49 | 12.8 |
| Q2S2 | 5 | 54 | 55 | 38 | 42 | 61 | 81 | 47 | 11.4 |
| Q2S3 | 4 | 55 | 53 | 35 | 42 | 63 | 87 | 45 | 10.5 |
| Q3S1 | 3 | 55 | 48 | 31 | 42 | 65 | 91 | 43 | 9.9 |
| Q3S2 | 3 | 55 | 45 | 27 | 42 | 67 | 94 | 41 | 9.5 |
| Q3S3 | 2 | 55 | 42 | 24 | 43 | 69 | 96 | 40 | 9.3 |
| Q4S1 | 2 | 56 | 38 | 21 | 42 | 71 | 97 | 38 | 9.2 |
| Q4S2 | 2 | 56 | 36 | 18 | 42 | 72 | 97 | 36 | 9.1 |
| Q4S3 | 2 | 56 | 33 | 15 | 43 | 74 | 98 | 34 | 9.1 |


## 4. Quarterly Review Score Distribution


### Easy

| Strategy | Q1 Avg | Q2 Avg | Q3 Avg | Q4 Avg | Std Dev | Min | Max |
|----------|--------|--------|--------|--------|---------|-----|-----|
| Random | 85.9 | 88.3 | 88.2 | 88.0 | 15.4 | 0 | 100 |
| Balanced | 87.3 | 90.9 | 92.9 | 93.5 | 13.7 | 6 | 100 |
| CEO-Aligned | 87.1 | 90.9 | 92.4 | 93.0 | 14.0 | 0 | 100 |
| Growth-Focused | 78.1 | 71.9 | 66.6 | 63.5 | 19.0 | 0 | 100 |
| Tech-Debt-First | 85.4 | 89.8 | 91.7 | 92.6 | 14.7 | 0 | 100 |
| Always Overbook | 67.9 | 55.8 | 47.1 | 40.7 | 22.2 | 0 | 100 |

### Normal

| Strategy | Q1 Avg | Q2 Avg | Q3 Avg | Q4 Avg | Std Dev | Min | Max |
|----------|--------|--------|--------|--------|---------|-----|-----|
| Random | 58.6 | 58.6 | 56.2 | 52.7 | 29.5 | 0 | 100 |
| Balanced | 61.9 | 67.4 | 68.8 | 69.1 | 27.5 | 0 | 100 |
| CEO-Aligned | 61.4 | 65.9 | 66.4 | 65.8 | 27.6 | 0 | 100 |
| Growth-Focused | 50.7 | 42.9 | 38.5 | 36.0 | 25.7 | 0 | 100 |
| Tech-Debt-First | 58.6 | 61.6 | 62.7 | 62.7 | 28.9 | 0 | 100 |
| Always Overbook | 38.3 | 28.4 | 23.7 | 21.0 | 21.9 | 0 | 100 |

### Hard

| Strategy | Q1 Avg | Q2 Avg | Q3 Avg | Q4 Avg | Std Dev | Min | Max |
|----------|--------|--------|--------|--------|---------|-----|-----|
| Random | 36.2 | 32.5 | 28.5 | 25.2 | 27.7 | 0 | 100 |
| Balanced | 38.9 | 38.4 | 36.8 | 35.2 | 28.7 | 0 | 100 |
| CEO-Aligned | 40.8 | 40.2 | 37.4 | 36.1 | 29.2 | 0 | 100 |
| Growth-Focused | 31.5 | 26.5 | 24.2 | 23.9 | 23.8 | 0 | 93 |
| Tech-Debt-First | 37.5 | 34.6 | 33.2 | 30.8 | 27.9 | 0 | 100 |
| Always Overbook | 23.7 | 16.7 | 14.5 | 12.9 | 18.2 | 0 | 82 |


## 5. Calibration ("Bell Curve") Impact

How much does the year-end calibration modifier change the outcome?


### Easy

- Average calibration modifier: **1.3**
- Range: **-5** to **8**
- Rating upgraded by calibration: **27.4%**
- Rating downgraded by calibration: **2.8%**
- Rating unchanged: **69.8%**

### Normal

- Average calibration modifier: **0.0**
- Range: **-10** to **10**
- Rating upgraded by calibration: **14.8%**
- Rating downgraded by calibration: **11.1%**
- Rating unchanged: **74.2%**

### Hard

- Average calibration modifier: **-1.8**
- Range: **-12** to **8**
- Rating upgraded by calibration: **8.6%**
- Rating downgraded by calibration: **16.1%**
- Rating unchanged: **75.3%**


## 6. Key Balance Findings

### "Win" Rate (Exceeds or Meets Strong)

| Strategy | Easy | Normal | Hard |
|----------|------|--------|------|
| Random | 66.5% | 17.9% | 2.5% |
| Balanced | 76.2% | 28.1% | 4.5% |
| CEO-Aligned | 75.6% | 26.2% | 4.7% |
| Growth-Focused | 24.9% | 6.3% | 1.9% |
| Tech-Debt-First | 72.0% | 19.7% | 3.8% |
| Always Overbook | 2.6% | 0.3% | 0.1% |

### "Lose" Rate (Needs Improvement or Does Not Meet)

| Strategy | Easy | Normal | Hard |
|----------|------|--------|------|
| Random | 2.9% | 41.8% | 78.3% |
| Balanced | 0.9% | 25.7% | 67.6% |
| CEO-Aligned | 1.3% | 27.5% | 65.5% |
| Growth-Focused | 19.1% | 62.1% | 81.3% |
| Tech-Debt-First | 1.1% | 33.6% | 73.0% |
| Always Overbook | 56.9% | 80.8% | 90.1% |

### Tech Debt Spiral Risk

Percentage of games where tech debt reaches Crisis (>80) at any point:

| Strategy | Easy | Normal | Hard |
|----------|------|--------|------|
| Random | 10.2% | 44.8% | 77.8% |
| Balanced | 0.4% | 10.0% | 40.3% |
| CEO-Aligned | 2.5% | 25.1% | 61.9% |
| Growth-Focused | 96.9% | 99.9% | 100.0% |
| Tech-Debt-First | 0.0% | 1.9% | 8.6% |
| Always Overbook | 93.0% | 98.7% | 99.5% |

### Team Sentiment Crash Risk

Percentage of games where team sentiment drops below 20 at any point:

| Strategy | Easy | Normal | Hard |
|----------|------|--------|------|
| Random | 10.5% | 54.6% | 76.3% |
| Balanced | 8.3% | 45.0% | 79.3% |
| CEO-Aligned | 6.7% | 42.5% | 69.3% |
| Growth-Focused | 14.9% | 51.6% | 66.1% |
| Tech-Debt-First | 10.7% | 55.2% | 80.9% |
| Always Overbook | 100.0% | 100.0% | 100.0% |

### Roadmap Hijack Frequency

Average hijacks per game:

| Strategy | Easy | Normal | Hard |
|----------|------|--------|------|
| Random | 0.1 | 0.7 | 2.0 |
| Balanced | 0.0 | 0.3 | 1.3 |
| CEO-Aligned | 0.0 | 0.6 | 1.8 |
| Growth-Focused | 0.8 | 3.0 | 4.3 |
| Tech-Debt-First | 0.1 | 0.7 | 2.0 |
| Always Overbook | 0.8 | 2.8 | 4.0 |


## 7. Final Score Variance Analysis

How much does luck matter vs. strategy?


| Difficulty | Strategy | Mean | Median | Std Dev | P10 | P25 | P75 | P90 | IQR |
|-----------|----------|------|--------|---------|-----|-----|-----|-----|-----|
| easy | Random | 73.3 | 76 | 12.6 | 56 | 65 | 83 | 88 | 18 |
| easy | Balanced | 76.5 | 79 | 11.1 | 61 | 70 | 84 | 89 | 14 |
| easy | CEO-Aligned | 76.5 | 79 | 11.6 | 61 | 70 | 85 | 89 | 15 |
| easy | Growth-Focused | 58.6 | 61 | 14.2 | 39 | 49 | 69 | 76 | 20 |
| easy | Tech-Debt-First | 75.5 | 78 | 11.6 | 59 | 68 | 84 | 88 | 16 |
| easy | Always Overbook | 43.7 | 43 | 11.7 | 30 | 36 | 50 | 59 | 14 |
| normal | Random | 49.8 | 49 | 19.0 | 25 | 34 | 65 | 76 | 31 |
| normal | Balanced | 57.3 | 58 | 18.3 | 32 | 44 | 71 | 81 | 27 |
| normal | CEO-Aligned | 56.1 | 57 | 18.2 | 31 | 43 | 70 | 80 | 27 |
| normal | Growth-Focused | 41.5 | 39 | 15.7 | 22 | 30 | 52 | 64 | 22 |
| normal | Tech-Debt-First | 53.1 | 54 | 17.8 | 29 | 40 | 67 | 77 | 27 |
| normal | Always Overbook | 34.3 | 34 | 12.0 | 19 | 26 | 42 | 50 | 16 |
| hard | Random | 34.4 | 32 | 15.0 | 17 | 24 | 42 | 56 | 18 |
| hard | Balanced | 38.7 | 37 | 16.2 | 20 | 27 | 49 | 62 | 22 |
| hard | CEO-Aligned | 39.3 | 38 | 16.5 | 19 | 27 | 50 | 63 | 23 |
| hard | Growth-Focused | 34.1 | 32 | 13.7 | 18 | 25 | 41 | 53 | 16 |
| hard | Tech-Debt-First | 36.4 | 34 | 15.5 | 18 | 25 | 46 | 58 | 21 |
| hard | Always Overbook | 31.0 | 30 | 10.8 | 17 | 24 | 38 | 44 | 14 |


## 8. End-State Metrics (After Sprint 12)

Average final metric values:


### Normal Difficulty

| Strategy | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS |
|----------|------|-----|-------|-----|------------|------------|-----------|-----|
| Random | 37 | 67 | 58 | 65 | 54 | 74 | 69 | 44 |
| Balanced | 46 | 74 | 69 | 88 | 65 | 71 | 43 | 50 |
| CEO-Aligned | 46 | 74 | 64 | 80 | 55 | 75 | 51 | 48 |
| Growth-Focused | 37 | 71 | 33 | 13 | 54 | 75 | 99 | 34 |
| Tech-Debt-First | 38 | 69 | 52 | 95 | 59 | 62 | 30 | 48 |
| Always Overbook | 2 | 56 | 33 | 15 | 43 | 74 | 98 | 34 |


## 9. Effective Capacity Over Time

Average sprint capacity (Normal difficulty, Balanced strategy):

| Sprint | Avg Capacity | Min (P5) | Max (P95) |
|--------|-------------|----------|-----------|
| Q1S1 | 20.5 | 18 | 21 |
| Q1S2 | 20.3 | 15 | 24 |
| Q1S3 | 20.2 | 15 | 26 |
| Q2S1 | 20.4 | 12 | 28 |
| Q2S2 | 20.7 | 12 | 30 |
| Q2S3 | 20.9 | 12 | 30 |
| Q3S1 | 21.2 | 12 | 30 |
| Q3S2 | 21.2 | 12 | 30 |
| Q3S3 | 21.3 | 12 | 30 |
| Q4S1 | 21.1 | 12 | 30 |
| Q4S2 | 21.1 | 9 | 30 |
| Q4S3 | 21.0 | 9 | 30 |


## 10. Observations & Balance Recommendations

### Overall Distribution Shape

The game produces the following rating distribution for a Balanced strategy on Normal:

- Exceeds Expectations: 6.0%
- Meets (Strong): 22%
- Meets Expectations: 46.2%
- Needs Improvement: 21%
- Does Not Meet: 4.0%

### Strategy Impact

Best strategy on Normal: **Balanced** (avg score 57.3)
Worst strategy on Normal: **Always Overbook** (avg score 34.3)
Gap: **23.0 points**

### Difficulty Scaling

- Easy: 24.3% Exceeds, 0.1% Does Not Meet (Balanced)
- Normal: 6.0% Exceeds, 4.0% Does Not Meet (Balanced)
- Hard: 0.4% Exceeds, 19.4% Does Not Meet (Balanced)

### Tech Debt Spiral

- Normal difficulty: 10.0% of Balanced games see tech debt reach Crisis (>80)
- Hard difficulty: 40.3% of Balanced games see tech debt reach Crisis (>80)

### Calibration Variance

The calibration modifier has a standard deviation of 6.0 points on Normal difficulty, which is significant relative to the ~23-point strategy gap. This means luck in calibration can easily override smart play — which aligns with the game's thesis that "your performance review is only loosely correlated with your performance."
