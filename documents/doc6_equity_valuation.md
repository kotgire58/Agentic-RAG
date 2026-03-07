# Equity Valuation: How Stocks Are Actually Priced

**Intermediate Finance Series | Fundamental Analysis**

Price is what you pay. Value is what you get. Understanding the gap between price and value — and when the market misprices that relationship — is the foundation of fundamental investing. Technical analysis tells you when to buy; fundamental analysis tells you what to buy.

## The Intrinsic Value Framework

### Discounted Cash Flow (DCF) Analysis
The theoretically correct way to value any asset: the present value of all future cash flows.

**Formula:** Intrinsic Value = Σ (FCF_t / (1+r)^t) + Terminal Value / (1+r)^n

Where:
- FCF = Free cash flow in year t
- r = Discount rate (WACC)
- Terminal Value = FCF_n × (1+g) / (r-g)
- g = Long-term growth rate

**DCF is sensitive to assumptions:**
- Change discount rate from 8% to 10% → value drops ~25%
- Change terminal growth from 3% to 2% → value drops ~15%
- This is why DCF is called "garbage in, garbage out"

**Practical DCF framework:**
1. Project FCF for 5-10 years using historical growth rates, industry trends, management guidance
2. Choose WACC based on company's risk profile (beta, debt/equity, current rates)
3. Apply conservative terminal growth rate (usually GDP growth rate, 2-3%)
4. Calculate present value, compare to current market cap
5. Add margin of safety (buy at 30-50% discount to intrinsic value)

### Free Cash Flow: The Most Important Metric
FCF = Operating Cash Flow - Capital Expenditures

Unlike earnings (which can be manipulated via accounting), cash flow is harder to fake. Companies can report positive earnings while burning cash; they cannot pay dividends, buy back stock, or service debt with accounting profits.

**FCF yield** = FCF / Market Cap
- FCF yield > 5% suggests reasonable valuation
- FCF yield > 8% suggests potential undervaluation
- Negative FCF companies (growth stage) must be valued on future FCF projections

## Valuation Multiples: Relative Valuation

### P/E Ratio (Price-to-Earnings)
Most widely used valuation metric: Market Cap / Net Income (or Price / EPS)

**Limitations:**
- Earnings are accounting-based (can be manipulated)
- Cyclical companies look expensive at cycle peaks (low earnings) and cheap at troughs
- Doesn't account for growth rate differences between companies
- Meaningless for negative-earnings companies

**P/E in context:**
- S&P 500 historical average: ~15-17x
- Growth stocks (SaaS, tech): 25-50x+ is normal if high growth
- Value stocks (banks, energy): 8-12x typical
- P/E alone tells you nothing without comparing to growth rate

### PEG Ratio (Price/Earnings-to-Growth)
Adjusts P/E for growth rate: PEG = P/E ÷ Earnings Growth Rate

- PEG < 1.0: Potentially undervalued relative to growth
- PEG 1.0: Fairly valued
- PEG > 2.0: Expensive relative to growth

**Rule of thumb:** A company growing earnings at 20% annually should trade at ~20x P/E (PEG of 1.0). If it trades at 15x, it may be cheap on a growth-adjusted basis.

### EV/EBITDA (Enterprise Value / EBITDA)
More comprehensive than P/E because it's capital structure neutral:
- **Enterprise Value** = Market Cap + Debt - Cash (total cost to acquire the business)
- **EBITDA** = Earnings Before Interest, Taxes, Depreciation, and Amortization

**Why EV/EBITDA is preferred:**
- Unaffected by capital structure (debt levels)
- Easier to compare across companies in same industry
- Better for capital-intensive businesses

**Typical ranges by sector:**
- Technology (high growth): 20-40x EV/EBITDA
- Consumer staples: 12-18x
- Industrial: 8-14x
- Energy: 4-8x

### Price-to-Sales (P/S)
Used when companies have no earnings:
- Revenue is harder to manipulate than earnings
- Useful for early-stage growth companies, SaaS businesses
- **SaaS benchmark:** 8-12x P/S for ~20% growth; 15-25x for >30% growth
- Requires high gross margins to be meaningful (40%+ for tech; 70%+ for SaaS)

### Price-to-Book (P/B)
Market value relative to accounting book value (assets minus liabilities):
- **Banking sector:** P/B is primary valuation metric (banks are essentially their book value)
- P/B < 1.0: Trading below book value, possibly distressed or deeply undervalued
- Tangible Book Value (excludes intangibles/goodwill) is more conservative

## Key Financial Ratios for Stock Analysis

### Profitability Metrics
**Gross Margin** = Gross Profit / Revenue
- Software: 65-80% (almost no variable costs)
- Retail: 25-40%
- Manufacturing: 15-30%
- Higher margins = pricing power, competitive moat

**Operating Margin** = Operating Income / Revenue
- Reflects efficiency after all operating costs
- Expanding margins = leverage in the business model
- Compressing margins = cost pressure or competition

**Return on Equity (ROE)** = Net Income / Shareholders' Equity
- Measures how efficiently equity capital generates profits
- ROE > 15% is considered strong
- Warren Buffett focuses heavily on consistently high ROE
- **DuPont analysis:** ROE = Net Margin × Asset Turnover × Leverage

**Return on Invested Capital (ROIC)**
- Most comprehensive profitability measure
- ROIC > WACC = company creates value
- ROIC < WACC = company destroys value despite profitable operations
- Sustained high ROIC (>15%) signals durable competitive advantage

### Leverage and Debt
**Debt/EBITDA** = Total Debt / EBITDA
- < 2x: Conservative leverage, financial flexibility
- 2-4x: Moderate, common in stable businesses
- > 4x: High leverage, increases bankruptcy risk in downturns
- > 6x: Typically only sustainable for utilities and stable cash flow businesses

**Interest Coverage Ratio** = EBIT / Interest Expense
- < 1.5x: Danger zone, struggling to cover interest
- > 3x: Comfortable coverage
- > 10x: Very conservative, minimal credit risk

### Liquidity Ratios
**Current Ratio** = Current Assets / Current Liabilities
- > 1.5: Generally adequate short-term liquidity
- < 1.0: Potential liquidity problem (can't cover near-term obligations with near-term assets)

## Sector-Specific Valuation

### Technology / SaaS
Key metrics:
- **ARR (Annual Recurring Revenue):** Predictable revenue base
- **Net Revenue Retention (NRR):** Revenue from existing customers including expansions. >120% = product is sticky
- **Rule of 40:** Growth Rate + Profit Margin > 40% = healthy SaaS business
- **CAC Payback Period:** Months to recoup customer acquisition cost. < 18 months = efficient

### Financial Services (Banks)
- **Net Interest Margin (NIM):** Spread between loan rates and deposit rates
- **Efficiency Ratio:** Non-interest expense / revenue (lower = more efficient)
- **CET1 Ratio:** Core equity capital / risk-weighted assets (regulatory requirement)
- **Price-to-Book and Price-to-Tangible-Book** primary valuation metrics

### Energy
- **EV/EBITDA** primary multiple
- **Reserve replacement ratio:** New reserves discovered / reserves extracted
- **Break-even oil price:** What oil price needed for positive FCF
- **Production growth rate:** % increase in barrels produced

### Retail
- **Same-store sales growth (SSS/comps):** Revenue growth from existing stores (strips out new store openings)
- **Gross margin trend:** Key indicator of pricing power vs. cost pressure
- **Inventory turnover:** Higher = more efficient inventory management

## Competitive Moats: Why Some Businesses Deserve Premium Valuations

Warren Buffett's concept: A **moat** is a sustainable competitive advantage protecting high returns on capital.

### Types of Moats

**Network effects:** Value increases with each new user (Visa, MSFT Office, Meta). Strongest moat type.

**Switching costs:** High cost/friction to leave (Oracle databases, Salesforce CRM, Adobe Creative Cloud). Creates captive customers willing to pay premium.

**Cost advantages:** Structural cost advantages from scale, location, or proprietary processes (Walmart, Amazon, Nucor Steel).

**Intangible assets:** Brands, patents, regulatory licenses. (Coca-Cola brand, Pfizer patents, Moody's credit rating license).

**Efficient scale:** Market only supports one or few players; new entrants can't earn their cost of capital (local utility, regional airport).

### Moat Durability Assessment
- Is the moat getting wider or narrower over time?
- Are competitors successfully attacking the moat?
- Is technology disrupting the moat (streaming vs. cable, EVs vs. ICE)?
- Does management reinvest in widening the moat vs. extracting value?

Fundamentals tell you what a business is worth. The market's job is to price it. The gap between the two — driven by sentiment, fear, and short-term thinking — is where investment opportunity lives.
