# Options Contracts: Mechanics, Pricing, and Strategic Foundations

**Intermediate Finance Series | Derivatives**

Options are among the most misunderstood instruments in retail trading — simultaneously a tool for leverage, income generation, hedging, and speculation. Understanding their mechanics deeply separates profitable options traders from the majority who lose money buying calls and puts directionally.

## What Options Actually Are

An option is a contract giving the buyer the **right but not the obligation** to buy (call) or sell (put) 100 shares of an underlying asset at a specified price (strike) before or on a specified date (expiration).

Key distinction: The buyer has rights. The seller has obligations. This asymmetry is fundamental to everything else.

### Calls vs. Puts

**Call option:** Right to BUY 100 shares at the strike price
- Buyer profits when underlying rises above strike + premium paid
- Seller (writer) profits when underlying stays below strike
- Max loss for buyer: premium paid. Max gain: theoretically unlimited.

**Put option:** Right to SELL 100 shares at the strike price
- Buyer profits when underlying falls below strike - premium paid
- Seller profits when underlying stays above strike
- Max loss for buyer: premium paid. Max gain: strike price (stock can't go below zero).

### Moneyness
- **In-the-money (ITM):** Call with strike below current price; put with strike above current price. Has intrinsic value.
- **At-the-money (ATM):** Strike approximately equal to current price. All time value, no intrinsic value.
- **Out-of-the-money (OTM):** Call with strike above current price; put with strike below. Pure time value, expires worthless if nothing changes.

**Example:** Stock at $150
- $140 Call = $10 ITM (intrinsic value $10)
- $150 Call = ATM
- $160 Call = $10 OTM (needs $10 move just to break even)

## Options Pricing: What You're Actually Paying For

### Intrinsic Value vs. Time Value
**Option premium = Intrinsic value + Time value (extrinsic value)**

- **Intrinsic value:** How much the option is worth if exercised right now. ITM options only.
- **Time value:** The additional premium reflecting the possibility of future price movement. Decays to zero at expiration.

**Example:** $150 stock, $145 Call trading at $8
- Intrinsic value: $5 ($150 - $145)
- Time value: $3 ($8 - $5)

### The Black-Scholes Model
The foundational options pricing model (1973) uses five inputs:
1. **Current stock price (S)**
2. **Strike price (K)**
3. **Time to expiration (T)** — in years
4. **Risk-free interest rate (r)**
5. **Implied volatility (σ)** — the most important and only unknown

Formula (conceptually): Premium = f(S, K, T, r, σ)

The model assumes continuous trading, no dividends, log-normal price distribution, and constant volatility — all of which are violated in real markets. Despite limitations, it's the industry standard framework.

### Implied Volatility: The Market's Expectation
Implied volatility (IV) is derived by working the Black-Scholes formula backwards from the market price. It represents the market's consensus expectation of future price movement, annualized.

**IV of 20%** means the market expects the stock to move approximately ±20% over the next year, or roughly ±1.25% per day (20% / √252 trading days).

**Key insight:** You're not just betting on direction when you buy options — you're also betting on volatility. You can be right about direction and still lose if IV collapses.

### IV Rank and IV Percentile
Raw IV numbers are meaningless without context:
- **IV Rank:** Where current IV sits relative to its 52-week range. IV Rank of 80 means IV is in the 80th percentile of its range.
- **IV Percentile:** Percentage of days in the past year where IV was lower than current level.

**High IV (>50 rank):** Options are "expensive" — selling premium is statistically favorable
**Low IV (<20 rank):** Options are "cheap" — buying options costs less, directional plays more efficient

## The Greeks: Measuring Option Sensitivity

### Delta (Δ) — Price Sensitivity
Rate of change of option price per $1 move in the underlying.
- Calls: 0 to +1.0 (ATM ≈ 0.50)
- Puts: -1.0 to 0 (ATM ≈ -0.50)

**Practical use:**
- Delta ≈ probability of expiring ITM (rough approximation)
- 0.30 delta call = ~30% chance of finishing ITM
- Position sizing: 100-share equivalent exposure = 1/delta options needed

**Delta hedging:** Market makers buying/selling underlying to stay "delta neutral" — their options book doesn't make or lose money from directional moves. This hedging activity creates real buying/selling pressure in the underlying.

### Gamma (Γ) — Delta's Rate of Change
How much delta changes per $1 move in the underlying.
- Highest near ATM, near expiration
- "Gamma risk" is why selling short-dated ATM options is dangerous

**Gamma squeeze:** When market makers are short gamma (sold calls), a rising stock forces them to buy more shares to stay delta neutral, accelerating the move. GME January 2021 was a textbook gamma squeeze.

### Theta (Θ) — Time Decay
Rate at which option loses value per day as expiration approaches.
- Always negative for long options (you pay theta)
- Always positive for short options (you collect theta)
- Accelerates exponentially in final 30 days (theta decay curve)

**Practical reality:** Buying 30 DTE options and holding to expiration is a negative expected value trade on average — you need a significant move just to overcome theta decay.

### Vega (V) — Volatility Sensitivity
Change in option price per 1% change in implied volatility.
- Long options have positive vega (benefit from IV expansion)
- Short options have negative vega (hurt by IV expansion)

**Volatility crush:** IV typically spikes before earnings, then collapses after the event regardless of direction. Buying options before earnings often loses money even if the stock moves significantly — the IV collapse overwhelms the directional move.

### Rho (ρ) — Interest Rate Sensitivity
Change in option price per 1% change in risk-free interest rates.
- Least important Greek for most retail traders
- More significant for LEAPS (long-dated options) and in high rate environments

## Options Strategies: Building Positions

### Long Call — Directional Bullish
- Buy 1 call at strike K, pay premium P
- Profit if stock > K + P at expiration
- Max loss = P. Unlimited upside.
- **When to use:** High conviction directional move, low IV environment

### Covered Call — Income Generation
- Own 100 shares + sell 1 call at higher strike
- Collect premium, cap upside at strike
- **When to use:** Neutral to mildly bullish, want income, willing to sell stock at strike

### Cash-Secured Put — Acquiring Stock at Discount
- Sell 1 put at desired entry price, hold cash as collateral
- Collect premium, obligated to buy stock at strike if assigned
- Equivalent to covered call in terms of risk/reward
- **When to use:** Want to own stock but at lower price, collect premium while waiting

### Vertical Spreads — Defined Risk Directional
**Bull call spread:** Buy lower strike call, sell higher strike call. Reduces cost and capped profit.
**Bear put spread:** Buy higher strike put, sell lower strike put. Same concept for bearish bet.

- Max profit = width of spread - premium paid
- Max loss = premium paid
- **When to use:** Directional bet with defined risk, expensive IV environment

### Iron Condor — Range-Bound Income
Sell OTM call spread + sell OTM put spread simultaneously.
- Profit if stock stays within a range
- Defined risk on both sides
- **When to use:** High IV, stock expected to stay rangebound (after earnings, consolidation periods)

### Straddle/Strangle — Volatility Plays
**Long straddle:** Buy ATM call + buy ATM put. Profit from large move in either direction.
**Long strangle:** Buy OTM call + buy OTM put. Cheaper, needs bigger move.

- **When to use:** Expect big move but uncertain direction (before catalyst), IV is low
- **Short straddle/strangle:** Sell both sides. Profit from low realized volatility. High risk.

## Options Expiration Mechanics

### Weekly vs. Monthly Expirations
- **Weeklies (0-7 DTE):** Highest gamma, fastest decay, highest leverage. Preferred by retail for lotto plays.
- **Monthlies (3rd Friday):** Most liquid, tightest spreads, standard for most strategies
- **LEAPS (1-2+ years):** Behave more like stock, lower theta decay, good for long-term directional plays

### Expiration Risk: Pin Risk and Assignment
- **Pin risk:** Stock closes exactly at strike. Call seller uncertain if they'll be assigned.
- **Early assignment:** American-style options can be exercised any time. Usually only rational just before ex-dividend date for calls.
- **Auto-exercise:** OCC automatically exercises options $0.01+ ITM at expiration. Close or roll positions you don't want exercised.

## Common Mistakes and Why Most Options Buyers Lose

1. **Buying OTM weeklies directionally** — theta decay overwhelms small moves; need large, fast move
2. **Ignoring IV** — buying expensive options before events that everyone knows about
3. **Not managing winners** — holding to expiration instead of taking 50% profits
4. **Overleveraging** — treating options as lottery tickets rather than position sizing correctly
5. **Misunderstanding probability** — a 30-delta option has 70% chance of expiring worthless

The structural edge in options markets belongs to sellers (premium collectors) in high-IV environments and to buyers in low-IV environments with a catalyst. Most profitable retail options traders focus on defined-risk premium selling strategies.
