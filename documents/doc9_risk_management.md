# Risk Management: Position Sizing, Portfolio Construction, and Drawdown Control

**Intermediate Finance Series | Risk Management**

Most traders spend 90% of their time finding trades and 10% managing risk. Consistently profitable traders do the opposite. Risk management is not the unsexy part of trading — it IS trading. The math of survival in markets is unforgiving: a 50% drawdown requires a 100% return just to get back to even.

## The Mathematics of Drawdown

### Why Drawdowns Are Asymmetric
| Drawdown | Return needed to recover |
|----------|--------------------------|
| 10% | 11.1% |
| 20% | 25.0% |
| 30% | 42.9% |
| 40% | 66.7% |
| 50% | 100.0% |
| 75% | 300.0% |

**Implication:** Capital preservation is more important than capital growth. Avoiding catastrophic losses is more valuable than maximizing returns in good periods.

### The Compound Growth Equation
A strategy returning +20% in year 1 and -20% in year 2 does NOT break even:
- $100 × 1.20 × 0.80 = $96 (4% loss despite averaging 0% return)

**Volatility drag** (also called variance drain): Higher volatility reduces compound returns even with the same average return. Reducing volatility of returns improves compound growth.

**Geometric mean** is what actually gets deposited in your account:
- Geometric mean ≈ Arithmetic mean - (Variance/2)
- Halving your volatility can increase long-term wealth despite lower "average" returns

## Position Sizing: The Core of Risk Management

### Fixed Percentage Risk Model
Risk the same percentage of capital on every trade:
- **Rule:** Never risk more than 1-2% of total capital per trade
- **Example:** $50,000 account × 2% = $1,000 max loss per trade
- If stop is $2/share away, maximum position = 500 shares

**Why this works:**
- String of 10 consecutive losses at 2% risk = 18.3% drawdown (recoverable)
- Same string at 10% risk = 65.1% drawdown (potentially fatal to account)
- Forces position sizing consistent with stop placement

### ATR-Based Position Sizing
Normalize position size across instruments with different volatilities:
- **Target risk** = Account × Risk% (e.g., $50,000 × 1% = $500)
- **Shares** = Target risk / (ATR × multiplier)
- Example: $500 target risk, stock with 14-day ATR of $3.50, 2× ATR stop
- Stop distance = $3.50 × 2 = $7.00
- Position size = $500 / $7.00 = 71 shares

**Benefit:** A $5 volatile stock and a $200 less-volatile stock get appropriate position sizes. Same dollar risk regardless of price or volatility.

### Kelly Criterion: Theoretical Optimal Position Size
Formula: f* = (bp - q) / b
Where: b = odds received, p = probability of win, q = probability of loss (1-p)

**Example:** Trade with 55% win rate, 1:1 risk/reward
- f* = (1 × 0.55 - 0.45) / 1 = 0.10 = 10% of capital

**Full Kelly is too aggressive** — most practitioners use "Half Kelly" or "Quarter Kelly":
- Full Kelly maximizes geometric growth but produces extreme drawdowns
- Half Kelly: Roughly 75% of Kelly's expected growth with much smaller drawdowns
- In practice: Use Kelly as ceiling, not target

### Volatility-Based Allocation (Risk Parity)
Allocate position sizes so each position contributes equal risk to the portfolio:
- High-volatility asset → smaller position
- Low-volatility asset → larger position
- Every position contributes the same "risk budget"

**Example portfolio:**
- SPY (low vol): 40% allocation
- Individual tech stock (3× SPY vol): 13% allocation
- Gold (medium vol): 20% allocation
- Result: Each position contributes similar daily P&L volatility

## Stop Loss Strategies

### Types of Stops

**Hard stop (price-based):**
- Exit at predetermined price level
- "My thesis is wrong if stock breaks below $45"
- Most common, simplest to execute

**Volatility stop (ATR-based):**
- Stop placed at 1.5-2× ATR from entry
- Adjusts to current volatility of the instrument
- Prevents being stopped out by normal noise

**Time stop:**
- Exit if trade doesn't work within expected timeframe
- "If this doesn't move in my direction within 5 days, exit"
- Valuable because stagnant positions have opportunity cost

**Trailing stop:**
- Stop moves up with profit, locks in gains
- Fixed dollar: Stop stays $3 below current price
- Percent-based: Stop stays 7% below highest close since entry
- ATR-based: Stop = highest close - (2 × ATR)

### Stop Placement Principles

**Beyond natural support/resistance:**
- Don't place stops at obvious round numbers ($50.00, $100.00)
- Place stops beyond support — if support breaks, the trade is wrong
- Below the most recent swing low (uptrend) or above swing high (downtrend)

**Account for spread and slippage:**
- Your $50.00 stop may execute at $49.85 on a fast move
- On options, bid-ask spread means you exit at a worse price
- Plan for this in your risk calculations

**Avoid cluster zones:**
- Retail traders cluster stops at same obvious levels
- Market makers and algos hunt these levels — briefly spiking to trigger stops before reversing
- Place stops slightly beyond the obvious level to avoid stop hunts

### The Stop-Loss Paradox
Using stops guarantees you'll have losing trades. Not using stops risks catastrophic losses. The resolution:
- Accept that stops are the cost of admission to trading
- A 1% loss is information about a trade being wrong
- The goal is many small losses and fewer large wins, not avoiding all losses

## Portfolio Construction and Correlation

### Correlation Matrix
Positions that move together don't diversify:
- Long AAPL + Long MSFT + Long GOOGL = 3× tech exposure, not diversified
- Long SPY + Long QQQ = highly correlated (QQQ is concentrated in SPY's top holdings)
- True diversification requires assets with low or negative correlation

**Correlation ranges:**
- > 0.7: Highly correlated (treat as same trade)
- 0.3-0.7: Moderate correlation (partial diversification)
- < 0.3: Low correlation (meaningful diversification)
- Negative: True hedge (rare and valuable)

**Crisis correlation:** In market crises (2008, March 2020), correlations among risky assets spike toward 1.0. Everything falls together. Only truly uncorrelated assets (gold, volatility, treasuries) maintain diversification when needed most.

### Sector and Factor Exposure
Inadvertent concentration is common:
- 10 "different" stock picks may all be growth + momentum + large cap
- In a factor rotation, all 10 fall simultaneously
- Monitor net exposure to: market beta, growth/value, size, momentum, quality, cyclical/defensive

**Sector concentration limits:**
- No more than 20-25% in single sector
- No more than 5-10% in single position
- Monitor implied correlation across portfolio

## Risk Metrics and Performance Measurement

### Sharpe Ratio
(Return - Risk-free rate) / Standard deviation of returns

- Measures return per unit of risk
- > 1.0: Good (earning more than 1× return for each unit of risk)
- > 2.0: Excellent (institutional-grade)
- > 3.0: Outstanding (top-tier hedge fund level)

**Sharpe limitation:** Treats upside and downside volatility equally. A strategy with huge wins and small losses is penalized.

### Sortino Ratio
Like Sharpe, but only penalizes downside volatility:
- (Return - Risk-free rate) / Downside deviation
- Better measure for strategies with asymmetric return profiles
- Options strategies and trend-following show better Sortino than Sharpe

### Maximum Drawdown
Largest peak-to-trough decline in portfolio value:
- Most intuitive risk measure: "How bad did it get?"
- **Calmar ratio:** Annual return / Max drawdown (higher = better risk-adjusted return)
- **Recovery time:** How long did it take to make new equity highs?

### Win Rate vs. Risk-Reward Ratio
These two metrics together determine profitability:

**Expected value per trade = (Win rate × Avg win) - (Loss rate × Avg loss)**

You can be profitable with:
- 30% win rate if wins are 3× larger than losses
- 70% win rate if wins are only 0.5× losses

**Most sustainable trading systems:** 40-60% win rate with 1.5-2.5× risk/reward ratio

## Psychological Risk Management

### The Disposition Effect
Tendency to sell winners too early (fear of giving back profits) and hold losers too long (hope they'll recover). Mathematically backwards — should do the opposite.

**Fix:** Pre-define exit criteria for both winners (target price, trailing stop) and losers (stop loss) before entering. Remove discretion from exit decisions.

### Overconfidence After Winning Streaks
After 5 consecutive winning trades, position sizes tend to grow. This is when catastrophic losses occur — overconfidence leads to oversizing at peak vulnerability.

**Fix:** Position size is dictated by the risk model, never by recent results or emotional confidence.

### Revenge Trading
After a loss, the desire to "make it back immediately" leads to increased size and lower quality setups. Revenge trades typically make losses larger.

**Fix:** Mandatory cool-down period after significant loss (one trading day minimum). Reduce size to minimum after 3 consecutive losses.

### The Two Most Important Risk Rules
1. **Never risk more than you can afford to lose on a single trade** — one trade should never threaten the account
2. **Live to trade another day** — protecting capital when wrong is the primary job; the market will always provide new opportunities

Risk management is boring precisely because it works. The exciting, aggressive approach to trading produces spectacular stories — and spectacular blowups. Consistent, compounding growth comes from boring, disciplined risk management applied to every single trade.
