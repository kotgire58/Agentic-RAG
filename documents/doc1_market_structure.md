# How Stock Markets Actually Work: Structure, Participants, and Mechanics

**Intermediate Finance Series | Market Microstructure**

Most retail investors think of the stock market as a single place where buyers and sellers meet. In reality, it's a fragmented, multi-layered ecosystem with dozens of competing venues, sophisticated participants, and mechanics that significantly impact execution quality and price discovery.

## Market Structure Overview

### Primary vs. Secondary Markets
- **Primary market:** Where securities are first issued (IPOs, secondary offerings). Companies raise capital directly from investors. Investment banks underwrite and price the offering.
- **Secondary market:** All subsequent trading between investors. The company receives no proceeds. This is what most people refer to as "the stock market."

### Exchange Fragmentation
U.S. equity trading is split across 16 registered exchanges and ~40 alternative trading systems:
- **NYSE:** Traditional auction market, specialists for less-liquid stocks
- **NASDAQ:** Electronic dealer market, market makers required for each stock
- **CBOE BZX/BYX:** High-frequency trading focused, maker-taker pricing
- **IEX:** Speed bump exchange (350 microsecond delay) designed to reduce HFT advantages
- **Dark pools:** Private venues operated by banks (e.g., Goldman Sachs Sigma X, Morgan Stanley MS Pool)

### Order Routing and NBBO
The **National Best Bid and Offer (NBBO)** is the consolidated best bid and ask price across all exchanges at any moment. Brokers are legally required to execute at the NBBO or better (best execution obligation).

When you place a market order:
1. Your broker evaluates all venues for best price
2. Order may be routed to a dark pool, exchange, or market maker
3. Payment for order flow (PFOF) means retail orders often go to wholesalers like Citadel Securities or Virtu Financial
4. Execution happens in microseconds

## Order Types and Their Strategic Uses

### Market Orders
Execute immediately at the best available price. Guarantees execution, not price. Dangerous in illiquid stocks or during volatile periods — can cause significant slippage.

**Use case:** Highly liquid stocks (AAPL, SPY) when speed matters more than exact price.

### Limit Orders
Execute only at your specified price or better. Guarantees price, not execution. Adds liquidity to the market (maker), often receives a rebate from exchanges.

**Use case:** Any situation where price certainty matters. Essential for options and less-liquid stocks.

### Stop Orders
Trigger a market order when price reaches a specified level. Common misconception: stop orders do NOT guarantee execution at the stop price — they become market orders once triggered.

**Stop-limit orders:** Trigger a limit order instead. Avoids gap-down execution but risks no fill at all.

**Use case:** Trailing stops for position management, not as guaranteed protection.

### Iceberg Orders
Large orders split into smaller visible chunks. Total size hidden from the order book. Used by institutional investors to avoid tipping their hand and causing adverse price movement.

## Market Participants and Their Impact

### Market Makers
Obligated to continuously provide two-sided quotes (bid and ask) for assigned securities. Profit from the bid-ask spread. Major market makers: Citadel Securities, Virtu Financial, Jane Street.

**Impact on traders:** Tight spreads in liquid names benefit retail. Wide spreads in illiquid names are a hidden cost. In options, market maker hedging activity creates significant price pressure.

### High-Frequency Trading (HFT) Firms
Trade millions of times per day using algorithms and co-location (servers physically adjacent to exchange matching engines). Strategies include:
- **Latency arbitrage:** Exploiting price discrepancies across venues milliseconds faster than others
- **Statistical arbitrage:** Mean-reversion strategies across correlated instruments
- **Market making:** Providing liquidity at scale for spread income

**Net impact on retail:** Controversial. Tighter spreads on average, but potential for adverse selection in volatile conditions.

### Institutional Investors
Mutual funds, pension funds, hedge funds, and sovereign wealth funds managing $10M to $1T+. Trade in sizes that move markets. Use algorithms (VWAP, TWAP, implementation shortfall) to minimize market impact.

**Impact on price action:** Large institutional flows create sustained directional moves. 13F filings (quarterly) reveal institutional holdings with a 45-day lag.

### Retail Investors
Individuals trading through brokerages. Represent ~25% of volume but have grown significantly via commission-free trading (Robinhood effect). Retail order flow is highly valued by market makers because it's considered "uninformed" (less likely to have adverse selection).

## Price Discovery Mechanisms

### Continuous Trading Session
Normal market hours (9:30 AM - 4:00 PM ET). Prices set by continuous matching of buy and sell orders. Price moves when order imbalances exist.

### Opening and Closing Auctions
**Opening auction (9:30 AM):** Collects orders during pre-market, executes all at single clearing price. Sets the official opening price.

**Closing auction (4:00 PM):** Most important auction of the day. Index rebalancing, options expiration hedging, and ETF creation/redemption all concentrate here. Volume spike at close is structural, not random.

### After-Hours Trading
Lower liquidity, wider spreads, higher volatility. Earnings releases often occur after hours deliberately — companies prefer to give investors time to digest information before full market opens. Gaps at open reflect after-hours price discovery.

## Market Depth and Level 2 Quotes

### Order Book Structure
The limit order book shows all resting orders at each price level:
```
Ask Side (sellers):
$150.05 — 2,400 shares
$150.03 — 8,100 shares
$150.01 — 15,200 shares
----- Spread -----
$150.00 — 12,800 shares  ← Best Bid
$149.98 — 22,000 shares
$149.95 — 45,000 shares
Bid Side (buyers)
```

**Bid-ask spread** = $150.01 - $150.00 = $0.01 (1 cent for liquid stock)

### Reading Order Flow
- **Large bid walls:** May indicate support, but can be spoofed (placed and cancelled)
- **Thin ask side:** Suggests limited selling pressure, potential for fast upside
- **Iceberg detection:** Repeated same-size prints at one level suggest hidden size
- **Tape reading:** Analyzing time and sales for order flow clues about institutional activity

## Trading Sessions and Volume Patterns

### Intraday Volume Distribution (U-shaped curve)
- **9:30-10:30 AM:** Highest volume, most volatile, overnight gaps resolve
- **10:30 AM-2:00 PM:** Lunch lull, lower volume, choppier price action
- **2:00-4:00 PM:** Volume picks up, directional moves often resume
- **3:45-4:00 PM:** MOC (market-on-close) orders flood in, sharp moves possible

### Key Volume Events
- **Triple witching:** Third Friday of March, June, September, December — simultaneous expiration of stock options, index options, and index futures. Massive volume, elevated volatility.
- **Index rebalancing:** Russell reconstitution (June), S&P 500 additions/deletions create predictable flows
- **FOMC days:** Trading volume and volatility spike around 2:00 PM ET announcement

## Slippage, Market Impact, and Transaction Costs

### True Cost of Trading
Retail investors often underestimate total transaction costs:
- **Commission:** $0 at most brokers now (hidden in PFOF)
- **Bid-ask spread:** $0.01 on SPY = 0.003%; $0.50 on a $10 stock = 5%
- **Market impact:** Your order moving the price against you (significant for size)
- **Opportunity cost:** Time in order queue, partial fills

### Minimizing Transaction Costs
- Use limit orders in illiquid names
- Trade during high-volume periods for tighter spreads
- Avoid market orders on options (spreads are much wider)
- Break large orders into smaller pieces over time (VWAP execution)

Understanding market structure gives traders a significant edge — most retail losses come not from bad stock picks but from poor execution, excessive trading costs, and misunderstanding how prices are actually formed.
