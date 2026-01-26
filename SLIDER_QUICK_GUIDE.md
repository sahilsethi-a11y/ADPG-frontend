# Slider Quick Reference Guide

## Slider Controls - Make a Proposal Panel

### 📊 Discount Slider
**Range:** 1% - 20%
**What it does:** Applies a percentage discount to the total negotiation price (applied per-bucket)

**How it works:**
```
Original Total: $10,000
Move slider to: 15%
Result:
  - Discount Amount: -$1,500
  - Final Price: $8,500
```

**Real-time Updates:**
- Discount % display updates instantly
- "Discount Amount" field updates (red text)
- "Final Price" field updates (blue text)
- Downpayment and Remaining Balance recalculate automatically

---

### 💰 Downpayment Slider
**Range:** 10% - 100%
**What it does:** Sets what percentage of the FINAL PRICE must be paid upfront

**How it works:**
```
Final Price: $8,500
Move slider to: 50%
Result:
  - Downpayment Amount: $4,250
  - Remaining Balance: $4,250
```

**Real-time Updates:**
- Downpayment % display updates instantly
- "Downpayment Amount" field updates
- "Remaining Balance" field updates immediately

**Key Point:** Downpayment is calculated from the DISCOUNTED FINAL PRICE, not the original price.

---

## Example Flow

### Step 1: Customer sees original price
```
Original Price: $50,000
Discount: 1%
Final Price: $49,500
Downpayment: 10% of $49,500 = $4,950
Remaining: $44,550
```

### Step 2: Adjust discount (offer better deal)
```
Original Price: $50,000
Discount: 15% ← moved slider
Final Price: $42,500
Downpayment: 10% of $42,500 = $4,250
Remaining: $38,250
```

### Step 3: Adjust downpayment (higher upfront)
```
Original Price: $50,000
Discount: 15%
Final Price: $42,500
Downpayment: 50% of $42,500 = $21,250 ← moved slider
Remaining: $21,250
```

---

## Storage & Sync

When you move either slider:
1. **Instantly:** UI updates with new values
2. **Immediately:** Calculations reflect changes
3. **Automatically:** Proposal amount synced to localStorage (`quoteBuilderOfferAmount`)
4. **Automatically:** Conversation component gets notified (can see your proposed amount)

---

## Disabled State

**Sliders are disabled (grayed out) when:**
- Negotiation status is NOT "ongoing"
- Available statuses: "ongoing", "agreed", "otppending", etc.
- Only active negotiation allows proposal changes

---

## Common Scenarios

### Scenario 1: Tight Budget
- **Goal:** Maximize discount while keeping downpayment reasonable
- **Action:** Increase discount slider, keep downpayment at minimum (10%)
- **Result:** Lower final price, minimal upfront cash

### Scenario 2: Quick Sale
- **Goal:** Close the deal fast
- **Action:** Moderate discount, high downpayment (75-100%)
- **Result:** Shows buyer seriousness, keeps profit margin

### Scenario 3: Balanced Offer
- **Goal:** Fair price with split payments
- **Action:** Mid-range discount (8-10%), mid-range downpayment (40-50%)
- **Result:** Reasonable deal, balanced cash flow

---

## Verification Checklist

Before submitting proposal, verify:

- [ ] Discount % is what you intended (1-20%)
- [ ] Final Price looks reasonable
- [ ] Downpayment Amount is acceptable (10-100%)
- [ ] Remaining Balance covers your terms
- [ ] Total = Downpayment + Remaining Balance

---

## Troubleshooting

### Sliders Not Moving?
- Check if negotiation status is "ongoing"
- If not, status must be "ongoing" to enable sliders
- Refresh page if sliders appear stuck

### Numbers Not Updating?
- Check browser console for errors
- Verify JavaScript is enabled
- Try refreshing the page

### Wrong Calculation?
- Verify downpayment is calculated from FINAL PRICE (after discount)
- Check that sum of downpayment + remaining = final price
- Example: $42,500 final → 50% down = $21,250 + $21,250 = $42,500 ✓

### localStorage Not Syncing?
- Open DevTools → Application → localStorage
- Look for `quoteBuilderOfferAmount` key
- Move slider and check if value updates
- If not updating: localStorage might be disabled in browser

---

## Technical Details

### Calculations Behind the Scenes

**Discount Calculation:**
```
discountedTotal = sum of (each bucket × (1 - discount/100))
discountAmount = originalTotal - discountedTotal
```

**Downpayment Calculation:**
```
downpaymentAmount = discountedTotal × (downpaymentPercent / 100)
remainingBalance = discountedTotal - downpaymentAmount
```

### Storage Keys
- `quoteBuilderItems` - stores all items added to quote
- `quoteBuilderOfferAmount` - stores rounded final negotiation price
- Updates automatically when you move discount slider

### Events
- `quoteOfferUpdated` - fired when downpayment changes (notifies Conversation component)

---

## Tips & Best Practices

1. **Always preview first** - Move sliders to see impact before submitting
2. **Round numbers** - Proposal amounts are rounded to nearest dollar
3. **Check constraints** - Discount limited to 20% max (vendor policy)
4. **Down payment matters** - Shows buyer commitment, affects terms
5. **Final agreement** - Both parties must agree on final price via OTP

---

For detailed technical information, see:
- [SLIDER_VERIFICATION.md](./SLIDER_VERIFICATION.md) - Complete testing guide
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Full implementation summary
