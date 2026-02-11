# PM Simulator — Monte Carlo Variance Analysis

**Simulations per config:** 2000
**Total simulations:** 36000
**Ticket template pool:** 147 templates across 8 categories


## 1. Year-End Rating Distribution


### Easy Difficulty

| Strategy | Exceeds | Meets Strong | Meets | Needs Improv. | Does Not Meet | Avg Score |
|----------|---------|--------------|-------|---------------|---------------|-----------|
| Random | 17.4% | 40.9% | 34.4% | 6.8% | 0.4% | 70.2 |
| Balanced | 26.6% | 45.4% | 25.9% | 2.1% | 0.1% | 75.7 |
| CEO-Aligned | 26.6% | 42.6% | 27.9% | 2.8% | 0.1% | 75.1 |
| Growth-Focused | 0.6% | 17.6% | 53.1% | 26.2% | 2.5% | 54.0 |
| Tech-Debt-First | 24.8% | 42.7% | 29.4% | 3.0% | 0.1% | 74.2 |
| Always Overbook | 0.1% | 0.6% | 29.7% | 61.3% | 8.3% | 39.3 |

### Normal Difficulty

| Strategy | Exceeds | Meets Strong | Meets | Needs Improv. | Does Not Meet | Avg Score |
|----------|---------|--------------|-------|---------------|---------------|-----------|
| Random | 2.9% | 9.8% | 33.6% | 38.6% | 15.0% | 45.1 |
| Balanced | 6.3% | 18.1% | 40.4% | 27.8% | 7.5% | 53.3 |
| CEO-Aligned | 4.6% | 17.4% | 42.0% | 27.5% | 8.5% | 52.4 |
| Growth-Focused | 0.4% | 3.7% | 26.8% | 49.5% | 19.8% | 38.1 |
| Tech-Debt-First | 3.6% | 14.1% | 40.4% | 32.1% | 9.8% | 49.8 |
| Always Overbook | 0.0% | 0.1% | 16.5% | 56.3% | 27.2% | 32.5 |

### Hard Difficulty

| Strategy | Exceeds | Meets Strong | Meets | Needs Improv. | Does Not Meet | Avg Score |
|----------|---------|--------------|-------|---------------|---------------|-----------|
| Random | 0.0% | 0.7% | 10.2% | 50.0% | 39.2% | 29.0 |
| Balanced | 0.1% | 1.3% | 15.8% | 47.6% | 35.1% | 31.3 |
| CEO-Aligned | 0.0% | 1.5% | 16.2% | 48.6% | 33.7% | 31.5 |
| Growth-Focused | 0.0% | 0.3% | 9.6% | 54.0% | 36.1% | 29.6 |
| Tech-Debt-First | 0.0% | 0.5% | 14.1% | 49.6% | 35.6% | 30.6 |
| Always Overbook | 0.0% | 0.0% | 6.0% | 57.3% | 36.7% | 28.9 |


## 2. Ticket Outcome Probabilities

Average outcome distribution across all tickets in a full game:


### Easy

| Strategy | Clear Success | Partial | Unexpected | Soft Fail | Catastrophe | Avg Tickets/Game |
|----------|---------------|---------|------------|-----------|-------------|------------------|
| Random | 29.5% | 53.3% | 8.5% | 6.6% | 2.0% | 53.7 |
| Balanced | 30.5% | 53.3% | 8.5% | 5.7% | 1.9% | 65.9 |
| CEO-Aligned | 31.3% | 53.1% | 8.4% | 5.3% | 1.9% | 62.9 |
| Growth-Focused | 27.6% | 52.3% | 8.3% | 9.3% | 2.5% | 33.9 |
| Tech-Debt-First | 30.1% | 53.0% | 8.7% | 6.2% | 2.0% | 67.0 |
| Always Overbook | 22.7% | 50.2% | 8.5% | 14.6% | 4.0% | 28.7 |

### Normal

| Strategy | Clear Success | Partial | Unexpected | Soft Fail | Catastrophe | Avg Tickets/Game |
|----------|---------------|---------|------------|-----------|-------------|------------------|
| Random | 23.8% | 50.3% | 8.7% | 13.2% | 4.0% | 40.3 |
| Balanced | 25.4% | 50.6% | 8.8% | 11.9% | 3.3% | 51.3 |
| CEO-Aligned | 26.3% | 50.8% | 8.6% | 11.1% | 3.3% | 47.3 |
| Growth-Focused | 21.8% | 49.6% | 8.6% | 15.0% | 5.0% | 27.0 |
| Tech-Debt-First | 24.3% | 50.4% | 8.8% | 12.9% | 3.6% | 55.3 |
| Always Overbook | 18.4% | 49.2% | 8.8% | 17.8% | 5.8% | 25.4 |

### Hard

| Strategy | Clear Success | Partial | Unexpected | Soft Fail | Catastrophe | Avg Tickets/Game |
|----------|---------------|---------|------------|-----------|-------------|------------------|
| Random | 18.6% | 49.8% | 8.9% | 16.7% | 5.9% | 31.5 |
| Balanced | 20.0% | 50.4% | 8.6% | 15.4% | 5.6% | 37.8 |
| CEO-Aligned | 21.0% | 50.4% | 8.6% | 14.4% | 5.6% | 34.4 |
| Growth-Focused | 17.3% | 50.5% | 8.8% | 17.1% | 6.3% | 22.8 |
| Tech-Debt-First | 19.1% | 50.2% | 8.9% | 16.4% | 5.4% | 44.2 |
| Always Overbook | 14.2% | 51.3% | 9.3% | 18.9% | 6.3% | 23.9 |


## 3. Metric Trajectories Over Time

Average metric values at each sprint across all simulations:


### Random (Normal Difficulty)

| Sprint | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS | Capacity |
|--------|------|-----|-------|-----|------------|------------|-----------|-----|----------|
| Q1S1 | 56 | 53 | 53 | 53 | 41 | 44 | 42 | 54 | 20.5 |
| Q1S2 | 53 | 55 | 55 | 56 | 43 | 48 | 48 | 53 | 19.7 |
| Q1S3 | 50 | 57 | 55 | 59 | 44 | 52 | 53 | 53 | 18.8 |
| Q2S1 | 48 | 59 | 55 | 62 | 45 | 55 | 58 | 51 | 18.1 |
| Q2S2 | 45 | 61 | 54 | 64 | 45 | 58 | 62 | 50 | 17.6 |
| Q2S3 | 43 | 62 | 53 | 64 | 46 | 61 | 66 | 50 | 17.0 |
| Q3S1 | 41 | 63 | 50 | 63 | 46 | 63 | 70 | 48 | 16.5 |
| Q3S2 | 39 | 64 | 49 | 62 | 46 | 65 | 73 | 47 | 16.0 |
| Q3S3 | 37 | 65 | 47 | 60 | 47 | 67 | 75 | 46 | 15.4 |
| Q4S1 | 36 | 65 | 44 | 57 | 46 | 69 | 78 | 44 | 14.9 |
| Q4S2 | 35 | 65 | 42 | 56 | 46 | 70 | 80 | 44 | 14.4 |
| Q4S3 | 34 | 65 | 40 | 54 | 46 | 71 | 82 | 43 | 14.1 |

### Balanced (Normal Difficulty)

| Sprint | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS | Capacity |
|--------|------|-----|-------|-----|------------|------------|-----------|-----|----------|
| Q1S1 | 58 | 53 | 52 | 54 | 43 | 43 | 41 | 55 | 20.5 |
| Q1S2 | 56 | 56 | 54 | 60 | 46 | 46 | 45 | 55 | 20.0 |
| Q1S3 | 54 | 58 | 56 | 66 | 48 | 48 | 48 | 55 | 19.7 |
| Q2S1 | 52 | 61 | 56 | 72 | 49 | 51 | 50 | 54 | 19.6 |
| Q2S2 | 50 | 63 | 57 | 76 | 51 | 53 | 51 | 54 | 19.6 |
| Q2S3 | 49 | 65 | 58 | 79 | 53 | 56 | 52 | 53 | 19.5 |
| Q3S1 | 48 | 67 | 57 | 80 | 53 | 58 | 53 | 52 | 19.5 |
| Q3S2 | 46 | 68 | 57 | 81 | 55 | 61 | 54 | 52 | 19.4 |
| Q3S3 | 45 | 69 | 57 | 81 | 56 | 63 | 55 | 52 | 19.3 |
| Q4S1 | 44 | 70 | 55 | 81 | 56 | 65 | 56 | 51 | 19.0 |
| Q4S2 | 43 | 71 | 55 | 80 | 57 | 67 | 57 | 50 | 18.8 |
| Q4S3 | 42 | 71 | 54 | 79 | 58 | 68 | 57 | 49 | 18.6 |

### CEO-Aligned (Normal Difficulty)

| Sprint | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS | Capacity |
|--------|------|-----|-------|-----|------------|------------|-----------|-----|----------|
| Q1S1 | 58 | 53 | 52 | 54 | 41 | 44 | 41 | 54 | 20.5 |
| Q1S2 | 56 | 56 | 54 | 59 | 42 | 47 | 45 | 54 | 20.1 |
| Q1S3 | 54 | 58 | 55 | 63 | 43 | 51 | 48 | 54 | 19.7 |
| Q2S1 | 53 | 61 | 55 | 67 | 44 | 54 | 52 | 53 | 19.5 |
| Q2S2 | 51 | 63 | 55 | 70 | 45 | 57 | 54 | 52 | 19.2 |
| Q2S3 | 50 | 66 | 55 | 72 | 46 | 60 | 56 | 52 | 19.0 |
| Q3S1 | 49 | 68 | 54 | 73 | 46 | 63 | 59 | 51 | 18.9 |
| Q3S2 | 47 | 69 | 52 | 73 | 47 | 66 | 61 | 50 | 18.6 |
| Q3S3 | 46 | 70 | 51 | 73 | 47 | 68 | 61 | 50 | 18.2 |
| Q4S1 | 45 | 72 | 50 | 72 | 48 | 70 | 64 | 48 | 18.1 |
| Q4S2 | 44 | 73 | 49 | 71 | 48 | 72 | 65 | 48 | 17.7 |
| Q4S3 | 42 | 73 | 47 | 69 | 48 | 74 | 66 | 47 | 17.5 |

### Growth-Focused (Normal Difficulty)

| Sprint | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS | Capacity |
|--------|------|-----|-------|-----|------------|------------|-----------|-----|----------|
| Q1S1 | 56 | 53 | 51 | 47 | 42 | 45 | 49 | 53 | 20.5 |
| Q1S2 | 52 | 57 | 51 | 44 | 45 | 50 | 64 | 52 | 18.9 |
| Q1S3 | 49 | 59 | 50 | 40 | 47 | 54 | 78 | 51 | 16.8 |
| Q2S1 | 46 | 61 | 45 | 35 | 47 | 57 | 89 | 49 | 15.0 |
| Q2S2 | 43 | 63 | 41 | 30 | 48 | 60 | 95 | 47 | 13.7 |
| Q2S3 | 41 | 64 | 37 | 25 | 48 | 62 | 97 | 45 | 13.1 |
| Q3S1 | 39 | 65 | 32 | 20 | 48 | 64 | 99 | 43 | 12.6 |
| Q3S2 | 37 | 66 | 28 | 16 | 48 | 66 | 99 | 42 | 12.4 |
| Q3S3 | 36 | 67 | 25 | 14 | 48 | 68 | 99 | 40 | 12.2 |
| Q4S1 | 34 | 68 | 22 | 11 | 48 | 70 | 100 | 38 | 12.0 |
| Q4S2 | 33 | 68 | 19 | 9 | 48 | 71 | 100 | 36 | 11.8 |
| Q4S3 | 32 | 69 | 17 | 8 | 48 | 72 | 100 | 35 | 11.6 |

### Tech-Debt-First (Normal Difficulty)

| Sprint | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS | Capacity |
|--------|------|-----|-------|-----|------------|------------|-----------|-----|----------|
| Q1S1 | 57 | 52 | 48 | 57 | 41 | 42 | 37 | 54 | 20.5 |
| Q1S2 | 54 | 54 | 47 | 65 | 43 | 43 | 38 | 54 | 20.4 |
| Q1S3 | 52 | 57 | 45 | 73 | 45 | 45 | 38 | 53 | 20.5 |
| Q2S1 | 49 | 59 | 43 | 80 | 45 | 47 | 39 | 52 | 20.9 |
| Q2S2 | 47 | 60 | 42 | 84 | 46 | 49 | 39 | 51 | 21.1 |
| Q2S3 | 44 | 62 | 41 | 87 | 48 | 51 | 39 | 51 | 21.3 |
| Q3S1 | 43 | 64 | 40 | 89 | 48 | 53 | 40 | 50 | 21.2 |
| Q3S2 | 41 | 64 | 39 | 90 | 49 | 54 | 40 | 49 | 21.1 |
| Q3S3 | 40 | 65 | 39 | 91 | 50 | 56 | 40 | 49 | 21.0 |
| Q4S1 | 38 | 66 | 37 | 91 | 51 | 57 | 41 | 48 | 20.9 |
| Q4S2 | 37 | 67 | 37 | 91 | 51 | 59 | 41 | 47 | 20.7 |
| Q4S3 | 36 | 67 | 37 | 91 | 52 | 61 | 41 | 47 | 20.6 |

### Always Overbook (Normal Difficulty)

| Sprint | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS | Capacity |
|--------|------|-----|-------|-----|------------|------------|-----------|-----|----------|
| Q1S1 | 42 | 51 | 53 | 49 | 40 | 46 | 48 | 53 | 20.5 |
| Q1S2 | 26 | 52 | 55 | 46 | 40 | 50 | 61 | 52 | 17.3 |
| Q1S3 | 15 | 53 | 55 | 42 | 41 | 54 | 72 | 51 | 14.2 |
| Q2S1 | 8 | 53 | 51 | 38 | 39 | 57 | 83 | 49 | 11.9 |
| Q2S2 | 5 | 54 | 47 | 33 | 39 | 60 | 90 | 47 | 10.5 |
| Q2S3 | 3 | 54 | 42 | 28 | 39 | 62 | 94 | 46 | 9.7 |
| Q3S1 | 2 | 54 | 37 | 24 | 38 | 64 | 97 | 43 | 9.4 |
| Q3S2 | 2 | 54 | 33 | 20 | 37 | 66 | 98 | 42 | 9.2 |
| Q3S3 | 2 | 55 | 29 | 17 | 37 | 68 | 99 | 40 | 9.1 |
| Q4S1 | 2 | 55 | 25 | 14 | 36 | 70 | 99 | 38 | 9.0 |
| Q4S2 | 2 | 55 | 22 | 12 | 36 | 72 | 99 | 36 | 9.0 |
| Q4S3 | 2 | 55 | 19 | 10 | 35 | 74 | 99 | 35 | 9.0 |


## 4. Quarterly Review Score Distribution


### Easy

| Strategy | Q1 Avg | Q2 Avg | Q3 Avg | Q4 Avg | Std Dev | Min | Max |
|----------|--------|--------|--------|--------|---------|-----|-----|
| Random | 83.4 | 84.7 | 83.5 | 81.1 | 18.5 | 0 | 100 |
| Balanced | 86.0 | 89.3 | 90.8 | 91.4 | 15.0 | 0 | 100 |
| CEO-Aligned | 85.6 | 89.2 | 90.1 | 90.1 | 15.2 | 0 | 100 |
| Growth-Focused | 73.7 | 65.2 | 59.3 | 55.9 | 20.6 | 0 | 100 |
| Tech-Debt-First | 83.9 | 87.9 | 89.6 | 90.4 | 16.2 | 0 | 100 |
| Always Overbook | 63.7 | 48.7 | 38.6 | 32.2 | 22.7 | 0 | 100 |

### Normal

| Strategy | Q1 Avg | Q2 Avg | Q3 Avg | Q4 Avg | Std Dev | Min | Max |
|----------|--------|--------|--------|--------|---------|-----|-----|
| Random | 54.7 | 52.4 | 47.8 | 42.6 | 30.0 | 0 | 100 |
| Balanced | 59.1 | 61.9 | 61.5 | 60.1 | 29.4 | 0 | 100 |
| CEO-Aligned | 58.5 | 61.0 | 59.6 | 57.4 | 28.3 | 0 | 100 |
| Growth-Focused | 45.1 | 36.1 | 32.0 | 29.5 | 24.2 | 0 | 100 |
| Tech-Debt-First | 55.9 | 56.6 | 56.3 | 55.6 | 29.5 | 0 | 100 |
| Always Overbook | 33.6 | 23.2 | 19.2 | 16.8 | 19.8 | 0 | 89 |

### Hard

| Strategy | Q1 Avg | Q2 Avg | Q3 Avg | Q4 Avg | Std Dev | Min | Max |
|----------|--------|--------|--------|--------|---------|-----|-----|
| Random | 23.8 | 19.4 | 16.3 | 14.1 | 22.5 | 0 | 100 |
| Balanced | 29.5 | 27.5 | 24.3 | 21.2 | 25.2 | 0 | 100 |
| CEO-Aligned | 29.6 | 26.7 | 24.1 | 21.6 | 25.0 | 0 | 100 |
| Growth-Focused | 19.0 | 15.3 | 14.8 | 15.1 | 18.8 | 0 | 83 |
| Tech-Debt-First | 25.7 | 23.5 | 21.8 | 20.0 | 24.0 | 0 | 100 |
| Always Overbook | 13.0 | 9.1 | 8.1 | 8.1 | 13.0 | 0 | 78 |


## 5. Calibration ("Bell Curve") Impact

How much does the year-end calibration modifier change the outcome?


### Easy

- Average calibration modifier: **2.1**
- Range: **-8** to **12**
- Rating upgraded by calibration: **32.2%**
- Rating downgraded by calibration: **5.3%**
- Rating unchanged: **62.5%**

### Normal

- Average calibration modifier: **-0.1**
- Range: **-15** to **15**
- Rating upgraded by calibration: **21.2%**
- Rating downgraded by calibration: **17.8%**
- Rating unchanged: **61.0%**

### Hard

- Average calibration modifier: **-3.8**
- Range: **-18** to **10**
- Rating upgraded by calibration: **9.4%**
- Rating downgraded by calibration: **25.5%**
- Rating unchanged: **65.1%**


## 6. Key Balance Findings

### "Win" Rate (Exceeds or Meets Strong)

| Strategy | Easy | Normal | Hard |
|----------|------|--------|------|
| Random | 58.4% | 12.8% | 0.7% |
| Balanced | 72.0% | 24.3% | 1.4% |
| CEO-Aligned | 69.2% | 22.0% | 1.5% |
| Growth-Focused | 18.3% | 4.0% | 0.3% |
| Tech-Debt-First | 67.5% | 17.8% | 0.5% |
| Always Overbook | 0.7% | 0.1% | 0.0% |

### "Lose" Rate (Needs Improvement or Does Not Meet)

| Strategy | Easy | Normal | Hard |
|----------|------|--------|------|
| Random | 7.2% | 53.6% | 89.1% |
| Balanced | 2.1% | 35.3% | 82.8% |
| CEO-Aligned | 2.9% | 35.9% | 82.3% |
| Growth-Focused | 28.6% | 69.2% | 90.1% |
| Tech-Debt-First | 3.1% | 41.9% | 85.3% |
| Always Overbook | 69.6% | 83.5% | 94.0% |

### Tech Debt Spiral Risk

Percentage of games where tech debt reaches Crisis (>80) at any point:

| Strategy | Easy | Normal | Hard |
|----------|------|--------|------|
| Random | 27.7% | 67.7% | 94.5% |
| Balanced | 2.4% | 27.7% | 72.0% |
| CEO-Aligned | 7.8% | 45.8% | 86.7% |
| Growth-Focused | 99.6% | 100.0% | 100.0% |
| Tech-Debt-First | 0.3% | 4.4% | 25.4% |
| Always Overbook | 98.7% | 100.0% | 100.0% |

### Team Sentiment Crash Risk

Percentage of games where team sentiment drops below 20 at any point:

| Strategy | Easy | Normal | Hard |
|----------|------|--------|------|
| Random | 14.4% | 58.5% | 81.3% |
| Balanced | 8.8% | 49.8% | 83.9% |
| CEO-Aligned | 7.2% | 47.2% | 75.3% |
| Growth-Focused | 20.1% | 58.5% | 77.3% |
| Tech-Debt-First | 11.8% | 57.9% | 85.2% |
| Always Overbook | 99.9% | 100.0% | 100.0% |

### Roadmap Hijack Frequency

Average hijacks per game:

| Strategy | Easy | Normal | Hard |
|----------|------|--------|------|
| Random | 0.1 | 1.2 | 3.7 |
| Balanced | 0.1 | 0.6 | 2.2 |
| CEO-Aligned | 0.1 | 1.0 | 3.4 |
| Growth-Focused | 1.6 | 4.1 | 6.4 |
| Tech-Debt-First | 0.1 | 1.3 | 3.4 |
| Always Overbook | 1.5 | 3.9 | 5.9 |


## 7. Final Score Variance Analysis

How much does luck matter vs. strategy?


| Difficulty | Strategy | Mean | Median | Std Dev | P10 | P25 | P75 | P90 | IQR |
|-----------|----------|------|--------|---------|-----|-----|-----|-----|-----|
| easy | Random | 70.2 | 73 | 15.4 | 48 | 61 | 82 | 88 | 21 |
| easy | Balanced | 75.7 | 78 | 12.8 | 59 | 68 | 85 | 91 | 17 |
| easy | CEO-Aligned | 75.1 | 78 | 13.2 | 58 | 67 | 85 | 90 | 18 |
| easy | Growth-Focused | 54.0 | 54 | 15.3 | 34 | 43 | 66 | 74 | 23 |
| easy | Tech-Debt-First | 74.2 | 77 | 13.5 | 55 | 66 | 84 | 90 | 18 |
| easy | Always Overbook | 39.3 | 39 | 11.1 | 26 | 32 | 46 | 54 | 14 |
| normal | Random | 45.1 | 43 | 19.6 | 21 | 31 | 59 | 73 | 28 |
| normal | Balanced | 53.3 | 52 | 20.3 | 27 | 38 | 69 | 82 | 31 |
| normal | CEO-Aligned | 52.4 | 52 | 19.7 | 26 | 39 | 67 | 79 | 28 |
| normal | Growth-Focused | 38.1 | 37 | 15.8 | 18 | 27 | 47 | 59 | 20 |
| normal | Tech-Debt-First | 49.8 | 49 | 19.4 | 25 | 35 | 65 | 77 | 30 |
| normal | Always Overbook | 32.5 | 32 | 12.5 | 17 | 23 | 41 | 49 | 18 |
| hard | Random | 29.0 | 28 | 13.6 | 12 | 19 | 38 | 45 | 19 |
| hard | Balanced | 31.3 | 30 | 14.9 | 13 | 21 | 40 | 51 | 19 |
| hard | CEO-Aligned | 31.5 | 31 | 14.8 | 13 | 21 | 40 | 52 | 19 |
| hard | Growth-Focused | 29.6 | 29 | 12.1 | 15 | 21 | 38 | 44 | 17 |
| hard | Tech-Debt-First | 30.6 | 30 | 13.9 | 14 | 21 | 40 | 48 | 19 |
| hard | Always Overbook | 28.9 | 29 | 11.1 | 15 | 21 | 37 | 43 | 16 |


## 8. End-State Metrics (After Sprint 12)

Average final metric values:


### Normal Difficulty

| Strategy | Team | CEO | Sales | CTO | Self-Serve | Enterprise | Tech Debt | NPS |
|----------|------|-----|-------|-----|------------|------------|-----------|-----|
| Random | 34 | 65 | 40 | 54 | 46 | 71 | 82 | 43 |
| Balanced | 42 | 71 | 54 | 79 | 58 | 68 | 57 | 49 |
| CEO-Aligned | 42 | 73 | 47 | 69 | 48 | 74 | 66 | 47 |
| Growth-Focused | 32 | 69 | 17 | 8 | 48 | 72 | 100 | 35 |
| Tech-Debt-First | 36 | 67 | 37 | 91 | 52 | 61 | 41 | 47 |
| Always Overbook | 2 | 55 | 19 | 10 | 35 | 74 | 99 | 35 |


## 9. Effective Capacity Over Time

Average sprint capacity (Normal difficulty, Balanced strategy):

| Sprint | Avg Capacity | Min (P5) | Max (P95) |
|--------|-------------|----------|-----------|
| Q1S1 | 20.5 | 18 | 21 |
| Q1S2 | 20.0 | 15 | 24 |
| Q1S3 | 19.7 | 15 | 25 |
| Q2S1 | 19.6 | 12 | 28 |
| Q2S2 | 19.6 | 12 | 28 |
| Q2S3 | 19.5 | 12 | 28 |
| Q3S1 | 19.5 | 9 | 30 |
| Q3S2 | 19.4 | 9 | 30 |
| Q3S3 | 19.3 | 9 | 30 |
| Q4S1 | 19.0 | 9 | 30 |
| Q4S2 | 18.8 | 9 | 30 |
| Q4S3 | 18.6 | 9 | 30 |


## 10. Observations & Balance Recommendations

### Overall Distribution Shape

The game produces the following rating distribution for a Balanced strategy on Normal:

- Exceeds Expectations: 6.3%
- Meets (Strong): 18%
- Meets Expectations: 40.4%
- Needs Improvement: 27%
- Does Not Meet: 7.5%

### Strategy Impact

Best strategy on Normal: **Balanced** (avg score 53.3)
Worst strategy on Normal: **Always Overbook** (avg score 32.5)
Gap: **20.8 points**

### Difficulty Scaling

- Easy: 26.6% Exceeds, 0.1% Does Not Meet (Balanced)
- Normal: 6.3% Exceeds, 7.5% Does Not Meet (Balanced)
- Hard: 0.1% Exceeds, 35.1% Does Not Meet (Balanced)

### Tech Debt Spiral

- Normal difficulty: 27.7% of Balanced games see tech debt reach Crisis (>80)
- Hard difficulty: 72.0% of Balanced games see tech debt reach Crisis (>80)

### Calibration Variance

The calibration modifier has a standard deviation of 8.9 points on Normal difficulty, which is significant relative to the ~21-point strategy gap. This means luck in calibration can easily override smart play — which aligns with the game's thesis that "your performance review is only loosely correlated with your performance."
