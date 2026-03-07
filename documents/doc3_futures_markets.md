# Futures Markets: Mechanics, Participants, and Trading Applications

**Intermediate Finance Series | Futures & Commodities**

Futures contracts are among the oldest financial instruments, originally created for farmers and merchants to hedge commodity price risk. Today, futures markets span equities, interest rates, currencies, and commodities — trading nearly 24 hours a day with combined notional value exceeding $500 trillion annually.

## Futures Contract Fundamentals

### What a Futures Contract Is
A futures contract is a legally binding agreement to buy or sell a specific quantity of an asset at a predetermined price on a specific future date. Unlike options, both parties are **obligated** to fulfill the contract.

Key distinction from options: No premium is paid upfront. Instead, both parties post margin (good faith deposit) and mark positions to market daily.

### Standardization
Futures are highly standardized:
- **Underlying asset:** Precisely defined (e.g., West Texas Intermediate crude oil, COMEX gold 99.5% pure)
- **Contract size:** Fixed quantity (e.g., 1,000 barrels of oil, 100 troy ounces of gold, $250 × S&P 500 index)
- **Delivery month:** March, June, September, December cycle for most financial futures
- **Tick size:** Minimum price movement ($0.25/barrel = $250/contract for crude oil)
- **Delivery terms:** Physical vs. cash settlement

### Cash Settlement vs. Physical Delivery
- **Cash settled:** Most financial futures (S&P 500, Nasdaq, Eurodollars). No actual delivery — positions are settled in cash at expiration based on final index/rate value.
- **Physically delivered:** Most commodity futures technically allow delivery, but 98%+ of positions are closed or rolled before expiration. Very few traders want 1,000 barrels of oil delivered.

## Major Futures Markets

### Equity Index Futures
Most heavily traded futures globally:

**E-mini S&P 500 (ES):**
- Contract value: $50 × S&P 500 index (~$250,000 per contract at S&P 5000)
- Tick size: 0.25 points = $12.50/contract
- Trading hours: Nearly 24/5 (Sunday 6PM - Friday 5PM ET)
- Use: Hedge equity portfolios, speculate on market direction, arbitrage vs. ETFs

**Micro E-mini S&P 500 (MES):**
- 1/10th the size of ES ($5 × S&P 500)
- Accessible to retail traders with smaller accounts
- Same liquidity profile as ES

**Nasdaq 100 (NQ) and Micro (MNQ):**
- Contract value: $20 × Nasdaq 100 index
- Higher volatility than ES due to tech concentration

**Key insight:** Futures trade overnight when stock market is closed. ES futures at 3 AM reflect global sentiment about the upcoming U.S. session. "Futures are up/down" in morning news refers to ES/NQ.

### Interest Rate Futures
Reflect expectations for future interest rates:

**10-Year Treasury Note Futures (ZN):**
- Contract value: $100,000 face value of 10-year T-notes
- Inverse relationship: Rising rates = falling futures price
- Most liquid fixed income futures globally
- Used by bond portfolio managers to hedge duration risk

**Fed Funds Futures:**
- Cash-settled against average Fed Funds rate for delivery month
- Most direct market instrument for pricing Fed rate expectations
- "Market pricing 75% chance of rate cut" comes from Fed Funds futures

**Eurodollar Futures (now SOFR Futures):**
- Reflects 3-month short-term interest rate expectations
- Massive market, used for interest rate risk management by banks

### Commodity Futures

**Crude Oil (CL — WTI, QM — Brent):**
- Contract size: 1,000 barrels
- Most actively traded commodity globally
- Price drivers: OPEC+ production decisions, global demand, USD strength, geopolitical risk
- Contango vs. backwardation signals about supply/demand conditions

**Gold (GC):**
- Contract size: 100 troy ounces (~$200,000+ per contract)
- Micro Gold (MGC): 10 oz
- Safe haven asset; inversely correlated with real interest rates and USD
- "Gold goes up when real rates fall" — core relationship to understand

**Natural Gas (NG):**
- Contract size: 10,000 MMBtu
- Highly seasonal (winter heating demand spikes)
- Extremely volatile; 20-30% swings in weeks are common

**Agricultural Futures (CME/CBOT):**
- Corn (ZC): 5,000 bushels
- Soybeans (ZS): 5,000 bushels
- Wheat (ZW): 5,000 bushels
- Driven by weather, USDA crop reports, export demand

### Currency Futures (CME)
- Euro (6E), British Pound (6B), Japanese Yen (6J), etc.
- Standardized alternative to spot forex trading
- Used by multinationals to hedge foreign exchange exposure
- Relationship: Currency futures prices reflect interest rate differentials (covered interest parity)

## Margin, Leverage, and Mark-to-Market

### Initial and Maintenance Margin
Futures require posting margin — a performance bond, not a down payment:
- **Initial margin:** Amount required to open a position (set by exchange, typically 3-12% of contract value)
- **Maintenance margin:** Minimum account balance to hold position (usually 75-80% of initial)
- **Margin call:** If account falls below maintenance, must deposit to restore to initial margin or position is liquidated

**Example — E-mini S&P 500:**
- Contract value: $50 × 5,000 = $250,000
- Initial margin: ~$12,000 per contract
- Leverage ratio: ~20:1
- A 1% move in S&P = $2,500 profit/loss = 20% of margin

### Mark-to-Market: Daily Settlement
Unlike stocks (unrealized gain/loss), futures are marked to market daily:
- End of each session, gains are credited and losses are debited to your account immediately
- This prevents large loss accumulation; also means profits can be withdrawn daily
- **Practical implication:** A large adverse move can trigger same-day margin calls

### Roll Yield and Curve Structure
Futures have expiration dates; holding a position beyond expiration requires "rolling" to the next contract:

**Contango:** Future prices higher than spot (normal for commodities with storage costs). Rolling costs money — you sell expiring contract at lower price, buy next at higher price.

**Backwardation:** Future prices lower than spot (occurs when current supply is tight). Rolling earns money — sell higher, buy lower.

**Equity index futures:** Small contango due to financing cost minus dividends. Impact is minimal for short-term traders.

## Futures Market Participants

### Hedgers (Commercial Users)
Use futures to reduce price risk in their core business:
- **Oil producer:** Sells crude oil futures to lock in selling price for future production
- **Airline:** Buys jet fuel futures to cap fuel costs
- **Corn farmer:** Sells corn futures before harvest to guarantee price
- **Bond fund manager:** Sells Treasury futures to reduce duration if rates expected to rise

Hedgers are price-insensitive — they'll accept unfavorable prices to remove risk. This creates profit opportunities for speculators.

### Speculators
Provide liquidity and price discovery:
- **Day traders:** Enter and exit within same session, flat overnight
- **Swing traders:** Hold days to weeks on technical or fundamental views
- **Macro hedge funds:** Large positions based on global economic themes
- **CTA (Commodity Trading Advisors):** Systematic trend-following funds managing $300B+

### Arbitrageurs
Keep futures prices in line with underlying assets:
- **Cash-and-carry arbitrage:** Buy stock basket, sell futures when futures premium is too high
- **ETF arbitrage:** SPY vs. ES futures kept in line by authorized participants
- **Calendar spread arbitrage:** Related contract months kept in proper relationship

### Commitment of Traders (COT) Report
The CFTC publishes weekly COT data showing positioning by category:
- **Commercial hedgers:** Often contrarian signal — extreme short positions by commercials can signal price floors
- **Large speculators (funds):** Trend followers; extreme positioning suggests crowded trade
- **Small speculators:** Often wrong at extremes; contrarian indicator

## Technical Application of Futures

### 24-Hour Price Action
Futures provide continuous price data unlike stocks. Overnight developments create:
- **Gap ups/downs:** S&P futures reaction to Asian/European markets, news events
- **Support/resistance zones:** Overnight highs/lows often become intraday reference levels
- **Volume profile:** Volume-at-price analysis more complete with 24-hour data

### Basis and Fair Value
**Fair value** = Spot price + Financing cost - Dividends
When futures trade above fair value, expect selling pressure at open (futures will come down to meet stocks).
When futures trade below fair value, expect buying pressure at open.

### Key Futures Price Levels
- **Previous day high/low:** Widely watched by futures traders
- **Globex (overnight) high/low:** Often acts as support/resistance during regular session
- **Weekly/monthly pivots:** Calculated from prior period OHLC
- **Point of Control (POC):** Price level with highest volume in the session — acts as magnet

## Practical Trading Considerations

### Choosing Between Futures, ETFs, and Options
| Instrument | Best For | Tax Treatment |
|------------|----------|---------------|
| ES Futures | Active trading, hedging | 60/40 (60% long-term) |
| SPY ETF | Passive holding, options | Standard rates |
| SPX Options | Large premium strategies | 60/40 treatment |

**Tax advantage:** U.S. futures (Section 1256 contracts) receive 60/40 tax treatment — 60% taxed as long-term gains, 40% short-term, regardless of holding period.

### Risk Management in Futures
Given high leverage, position sizing is critical:
- **Dollar risk per trade:** Never risk more than 1-2% of account per trade
- **ATR-based stops:** Place stops at 1-2× Average True Range from entry
- **Correlation awareness:** Long ES + long NQ = very correlated, not diversified
- **Overnight gap risk:** Holding through major events (FOMC, CPI) dramatically increases gap risk

Futures reward disciplined risk management more than almost any other instrument. The combination of leverage and mark-to-market settlement means poorly managed positions can deteriorate rapidly.
