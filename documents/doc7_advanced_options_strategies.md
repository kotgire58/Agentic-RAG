# Advanced Options Strategies: Spreads, Calendars, and Volatility Trades

**Intermediate Finance Series | Options Strategies**

Beyond buying calls and puts, options enable sophisticated strategies that profit from specific combinations of direction, volatility, and time. These multi-leg strategies are how professional traders and hedge funds use options — not as lottery tickets, but as precisely engineered positions with defined risk/reward characteristics.

## Vertical Spreads: Directional with Defined Risk

### Bull Call Spread Construction
Buy lower strike call, sell higher strike call, same expiration:
- **Example:** Buy $150 Call for $5.00, Sell $155 Call for $2.00
- **Net debit:** $3.00 per share ($300 per contract)
- **Max profit:** $5.00 - $3.00 = $2.00 ($200) — occurs when stock > $155 at expiration
- **Max loss:** $3.00 ($300) — occurs when stock < $150 at expiration
- **Breakeven:** $150 + $3.00 = $153.00

**Why use instead of long call?**
- Lower cost, lower breakeven
- Tradeoff: Capped upside above short strike
- Better in high IV environments (selling expensive premium against your long)

### Bear Put Spread
Buy higher strike put, sell lower strike put:
- **Example:** Buy $150 Put for $5.00, Sell $145 Put for $2.00
- **Net debit:** $3.00, max profit $2.00 if stock < $145

### Credit Spreads: Selling Premium with Protection
**Bull put spread (put credit spread):** Sell higher strike put, buy lower strike put
- Receive credit upfront
- Profit if stock stays above short strike
- Max loss = spread width - credit received

**Example:**
- Sell $145 Put for $3.00, Buy $140 Put for $1.00
- Net credit: $2.00 ($200 per contract)
- Max profit: $2.00 (keep entire credit if SPY > $145)
- Max loss: $5.00 - $2.00 = $3.00 (if SPY < $140)
- Breakeven: $145 - $2.00 = $143.00

**Probability of profit:** Short strike at 30 delta = ~70% chance of keeping full credit

### Optimal Credit Spread Management
- Enter at 45 DTE, target 30 delta short strike
- Close at 50% of max profit (50% of credit received)
- Close or roll if short strike is tested
- Maximum loss should be defined before entry

## Calendar Spreads: Trading Time and Volatility

### Horizontal Calendar Spread
Sell near-term option, buy far-term option at same strike:
- **Example:** Sell 30 DTE $150 Call for $3.00, Buy 60 DTE $150 Call for $4.50
- **Net debit:** $1.50
- **Profit driver:** Near-term option decays faster than far-term (theta differential)
- **Also profits from:** IV expansion (long vega from far-term option)

**Risk:** Large move in either direction hurts. Calendar spreads have negative gamma — big moves are bad.

**Ideal conditions:** Low IV (cheap to buy far-term), stock expected to stay near strike through near-term expiration.

**Earnings play application:** Sell weekly options that expire after earnings (inflated IV), buy next week's options at same strike. If stock doesn't move much, near-term vol collapses more than far-term, generating profit.

### Diagonal Spread
Calendar spread with different strikes:
- Sell near-term lower strike call, buy far-term higher strike call
- Combines directional exposure with time decay benefit
- Creates "poor man's covered call" using LEAPS

**Poor Man's Covered Call:**
- Buy 6-12 month ITM call (80+ delta, acts like stock)
- Sell 30-45 DTE OTM call against it monthly
- Collect premium without owning 100 shares
- Capital-efficient alternative to covered call

## The Iron Condor: Range-Bound Premium Collection

### Full Iron Condor Construction
Simultaneously selling an OTM call spread and OTM put spread:

**Example with SPY at $450:**
- Sell $430 Put, Buy $425 Put (bull put spread) — collect $1.50
- Sell $470 Call, Buy $475 Call (bear call spread) — collect $1.50
- **Total credit:** $3.00 ($300 per contract)
- **Max profit:** $3.00 (SPY stays between $430-$470 at expiration)
- **Max loss:** $5.00 - $3.00 = $2.00 (SPY goes beyond either wing)
- **Breakeven levels:** $427 and $473

**Profit zone:** Wide range from $427 to $473 — SPY must move 5%+ in either direction to lose money.

### Iron Condor Setup Criteria
- **IV Rank:** >50 (selling inflated premium)
- **DTE:** 30-45 days
- **Short strikes:** 15-20 delta (OTM with ~80% probability of expiring worthless)
- **Wing width:** 5 points for SPY, wider for more volatile underlyings
- **Credit received:** At least 33% of max risk (ideally 40%+)

### Iron Condor Adjustments
When the tested side approaches your short strike:

**Rolling the tested side:**
- Close threatened spread, re-open at new strike further OTM
- May need to roll for a debit if IV has expanded
- Extends duration, allows more time for position to recover

**Defensive rolling (convert to broken-wing butterfly):**
- Leave untested side, convert tested side to asymmetric structure
- Creates different risk profile, requires active management

**Stop loss:** Close entire position if loss = 2× credit received (risk $600 to protect $300 potential profit)

## The Straddle and Strangle: Pure Volatility Plays

### Long Straddle: Maximum Uncertainty Play
Buy ATM call + Buy ATM put, same strike, same expiration:
- **Profit from:** Large move in either direction
- **Loss from:** Stock staying near strike (theta decay)
- **Breakeven:** Strike ± total premium paid

**Example:** Stock at $100, Buy $100 Call for $5, Buy $100 Put for $4
- Total cost: $9.00
- Upside breakeven: $109
- Downside breakeven: $91
- Profit zone: Stock > $109 or < $91

**Ideal conditions:** Low IV environment, pending catalyst (earnings, FDA decision, merger vote), expect large move but uncertain direction.

### Short Straddle: Maximum Stability Play
Sell ATM call + Sell ATM put:
- Collect full premium, profit if stock stays near strike
- Theoretically unlimited risk on both sides
- Only suitable with defined stop losses or in managed account

**Short strangle:** Sell OTM call + Sell OTM put (wider breakevens, lower credit)
- More forgiving range, but less premium collected
- Defined-risk version = iron condor

### Measuring Straddle Efficiency: Expected Move
The straddle price ≈ expected move for the underlying:
- Stock at $100, 30 DTE straddle costs $7.00
- Market implying ~$7 (7%) expected move in 30 days
- This is how to quickly assess if options are pricing a move correctly

**Earnings expected move:**
- Calculate as (call price + put price) for ATM weekly options expiring right after earnings
- If straddle = $8 on $100 stock, market expects ±8% earnings move
- Historical average earnings moves for that stock tell you if options are cheap or expensive

## Ratio Spreads and Backspreads

### Call Backspread (Long Volatility, Bullish Bias)
Sell 1 lower strike call, buy 2 higher strike calls:
- **Example:** Sell 1 $150 Call for $5.00, Buy 2 $155 Calls for $2.50 each
- **Net credit:** $0 (even spread in this case)
- **Profit if:** Stock rallies strongly above $155 (you have 2 long calls working)
- **Profit if:** Stock stays below $150 (keep small credit or no loss)
- **Loss zone:** Stock finishes right at $155 (both calls expire worthless, owe on short)

**Use case:** Expecting explosive move higher or no move; want to avoid paying significant premium.

### Put Backspread (Long Volatility, Bearish Bias)
Sell 1 higher strike put, buy 2 lower strike puts:
- Profits from sharp downside move or very little movement
- Loss if stock falls modestly (lands on long puts with short put overhead)

## Risk Reversal: Synthetic Stock with Options

Buy OTM call + Sell OTM put (or reverse):
- **Long risk reversal:** Sell $145 Put, Buy $155 Call
- Usually done for small debit or credit (strikes chosen to equalize premium)
- Payoff mimics long stock position (profits on rally, loses on decline)
- Used by large investors to get leveraged directional exposure

**Corporate hedging application:** Company selling in Euros buys call on USD/EUR (protection if euro weakens) by selling put (gives up upside if euro strengthens). Zero-cost collar.

## LEAPS: Long-Term Options as Stock Substitutes

Long-term Equity Anticipation Securities (1-3 year expirations):

**Deep ITM LEAPS call as stock replacement:**
- Buy 70-80 delta call expiring 1-2 years out
- Costs 30-40% of stock price (leverage)
- Still participates in most of stock's upside
- Risk = premium paid (vs. full stock loss in crash)
- Theta decay is slow at these timeframes

**LEAPS as portfolio hedge:**
- Buy ATM or slightly OTM put LEAPS on SPY
- 2-year protection against major market decline
- Costs ~5-8% per year (expensive but defined risk)
- Better than constant put buying (avoids frequent theta decay)

The most important principle: every options strategy is a trade-off between probability of profit, magnitude of profit, and premium paid. There is no "best" strategy — only strategies that match your market view, risk tolerance, and current volatility environment.
