# QA Testing Guide - Synchronized Pricing

## Quick Summary

**What Changed:** LEFT bucket card prices now update when discount slider moves (previously only RIGHT panel updated)

**Expected Behavior:** Moving discount slider updates BOTH panels instantly and simultaneously

---

## Test in 30 Seconds

1. Go to negotiation page
2. Look at LEFT side: "Negotiation Items" bucket card
3. Look at RIGHT side: "Make a Proposal" discount slider
4. **Move the slider from 0% to 20%**
   - ✅ RIGHT panel prices update
   - ✅ **LEFT bucket card shows "-X% off" badge (GREEN)**
   - ✅ **LEFT bucket card shows original price with strikethrough**
   - ✅ **LEFT bucket card shows discounted price in bold**
5. Move slider back to 0%
   - ✅ Badge disappears
   - ✅ Strikethrough disappears
   - ✅ Original price shows again

**If all checkmarks pass → TEST PASSED ✅**

---

## Detailed Test Steps

### Setup
- Ensure you have items in a negotiation (at least 1 bucket)
- Navigate to `/my-negotiations/[conversationId]`

### Test 1: Discount Slider Updates Both Panels

**Step 1: Observe Initial State**
```
LEFT panel (Negotiation Items):
  ✓ Bucket card shows original price
  ✓ No discount badge
  ✓ No line-through

RIGHT panel (Make a Proposal):
  ✓ Original Price: [amount]
  ✓ Discount Amount: -$0
  ✓ Final Price: [amount]
  ✓ Discount slider: 0%
```

**Step 2: Move Discount Slider to 15%**
```
RIGHT panel updates immediately:
  ✓ Discount slider shows: "15%"
  ✓ Discount Amount: -$[amount] (RED text)
  ✓ Final Price: $[reduced amount] (BLUE text)

LEFT panel updates SIMULTANEOUSLY:
  ✓ Badge appears: "-15% off" (GREEN)
  ✓ Original price: $[amount] (with line-through)
  ✓ Final price: $[reduced amount] (bold)
  ✓ NO lag or delay between panels
```

**Step 3: Move Slider to 30% (Max)**
```
Both panels update:
  ✓ Discount slider: "30%"
  ✓ Discount Amount: -$[30% of original] (RED)
  ✓ LEFT badge: "-30% off" (GREEN)
  ✓ LEFT final price: $[70% of original]
```

**Step 4: Move Slider to 0%**
```
Both panels revert:
  ✓ Discount slider: "0%"
  ✓ Discount Amount: -$0 (RED)
  ✓ LEFT badge: DISAPPEARS ✓
  ✓ LEFT line-through: DISAPPEARS ✓
  ✓ LEFT price: Original amount (no extra line)
```

### Test 2: Downpayment Slider (Should NOT Affect LEFT Prices)

**Step 1: Keep Discount at 15%**

**Step 2: Move Downpayment Slider to 50%**
```
RIGHT panel updates:
  ✓ Downpayment Amount: $[50% of final]
  ✓ Remaining Balance: $[50% of final]

LEFT panel UNCHANGED:
  ✓ Prices stay same
  ✓ Badge stays "-15% off"
  ✓ No additional changes
```

---

## Expected Prices Example

**If original bucket = $306,343.72:**

| Discount % | LEFT Badge | LEFT Original | LEFT Discounted | RIGHT Final Price |
|-----------|-----------|---------------|-----------------|------------------|
| 0% | None | $306,343.72 | (not shown) | $306,343.72 |
| 10% | -10% off | ~~$306,343.72~~ | $275,709.35 | $275,709.35 |
| 15% | -15% off | ~~$306,343.72~~ | $260,392.16 | $260,392.16 |
| 20% | -20% off | ~~$306,343.72~~ | $245,074.98 | $245,074.98 |
| 30% | -30% off | ~~$306,343.72~~ | $214,440.60 | $214,440.60 |

**Verification:** Final Price should always match between LEFT and RIGHT panels

---

## Visual Indicators

### LEFT Panel (Bucket Card)

When **discount > 0%:**
- Green badge in top-left: "-X% off"
- Original price with strikethrough
- Discounted price in bold

When **discount = 0%:**
- No badge
- No strikethrough
- Just shows original price

### RIGHT Panel (Proposal)

When **discount > 0%:**
- Discount slider shows percentage
- "Discount Amount" shows in RED: "-$X,XXX"
- "Final Price" updates (BLUE text)

When **discount = 0%:**
- Slider at 0%
- "Discount Amount" shows "-$0"
- "Final Price" shows original

---

## Common Issues to Watch For

### ❌ Issue 1: LEFT prices don't update
**Symptom:** Discount slider moves, RIGHT panel updates, LEFT stays same
**Expected:** Both should update simultaneously
**Action:** Report bug with exact discount % and bucket total

### ❌ Issue 2: Prices don't match
**Symptom:** LEFT shows different final price than RIGHT
**Expected:** Final prices should always match
**Action:** Take screenshot of both panels, report discrepancy

### ❌ Issue 3: Badge doesn't appear
**Symptom:** Move slider to 15%, no "-15% off" badge on LEFT
**Expected:** Green badge should appear
**Action:** Verify discount slider is actually moving (console check)

### ❌ Issue 4: Lag between panels
**Symptom:** RIGHT updates first, then LEFT after 1-2 seconds
**Expected:** Should update simultaneously (< 50ms)
**Action:** Report performance issue

---

## Console Verification

Open DevTools (F12) → Console tab and look for:

```javascript
DEBUG: negotiationStatus = "ongoing"
DEBUG: discount = 0
DEBUG: downpaymentPercent = 10
DEBUG: discountAmount = 0
DEBUG: buckets.length = 1
```

When you move slider:
```javascript
DEBUG: discount = 5     ← updates as you drag
DEBUG: discount = 10
DEBUG: discount = 15
DEBUG: discountAmount = 45951.56  ← recalculated
```

---

## Browser Compatibility

Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

---

## Pass/Fail Criteria

### ✅ PASS If:
- [ ] Discount slider moves smoothly (0-30%)
- [ ] LEFT bucket card "-X% off" badge appears when discount > 0
- [ ] LEFT bucket card shows original price with line-through when discount > 0
- [ ] LEFT bucket card shows discounted price that matches RIGHT panel
- [ ] RIGHT panel prices update correctly
- [ ] Badge disappears when discount = 0
- [ ] Line-through disappears when discount = 0
- [ ] Downpayment slider doesn't affect LEFT prices
- [ ] Math checks out (original - discount% = final)
- [ ] No console errors

### ❌ FAIL If:
- LEFT prices never update
- Prices don't match between LEFT and RIGHT
- Badge doesn't appear/disappear
- Lag between panel updates
- Math is incorrect
- Console errors present

---

## Report Template

If you find an issue:

```
Title: [Brief description]

Steps to Reproduce:
1. Navigate to [URL]
2. Move discount slider to [X%]
3. Observe [what happened]

Expected:
[What should happen]

Actual:
[What actually happened]

Screenshots:
[Include if helpful]

Browser: [Chrome/Firefox/Safari] v[number]
```

---

## Questions?

Refer to full documentation: `SYNCHRONIZED_PRICING_IMPLEMENTATION.md`

Key points:
- Shared state in `NegotiationClientWrapper.tsx`
- Discount passed to `NegotiationBucketCard.tsx`
- Calculations kept in sync via props
- All files compile with zero TypeScript errors

Good luck with testing! 🚀
