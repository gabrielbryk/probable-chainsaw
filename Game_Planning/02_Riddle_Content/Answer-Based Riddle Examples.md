# Answer-Based Riddle Examples

## How Answer Riddles Work
Instead of riddles pointing to locations, these riddles require Joy to figure out a specific **answer** that she enters into the website/mechanism to unlock the next clue.

## Riddle Format Changes

### Traditional Location Riddle:
"Behind the spiral that never ends" → *Joy goes to tapestry*

### Answer-Based Riddle:
"What town does the spiral curse consume?" → *Joy types: "Kurouzu-cho"* → *Website reveals next clue*

## Level 3-5 Answer Riddles

### Junji Ito Answer Riddles

#### Level 3 (⭐⭐⭐)
**Riddle**: "In Uzumaki, how many chapters until Kirie's hair rebels?"
**Answer**: "6" or "six"

#### Level 4 (⭐⭐⭐⭐)
**Riddle**: "Calculate: (Spiral chapters × Tomie films) ÷ Souichi's cursed nails"
**Answer**: "30" (20 chapters × 9 films ÷ 6 nails)

#### Level 5 (⭐⭐⭐⭐⭐)
**Riddle**: "Rearrange 'I AM UZUK' to name the curse"
**Answer**: "uzumaki"

### Ocean Vuong Answer Riddles

#### Level 3 (⭐⭐⭐)
**Riddle**: "What age does Little Dog turn in the novel's opening?"
**Answer**: "28" or "twenty-eight"

#### Level 4 (⭐⭐⭐⭐)
**Riddle**: "Complete: 'In Vietnamese, the word for _____ and miss is the same: nhớ'"
**Answer**: "remember"

#### Level 5 (⭐⭐⭐⭐⭐)
**Riddle**: "Decode: TLILTE ODG (Caesar shift -3)"
**Answer**: "little dog"

### Crystal Answer Riddles

#### Level 3 (⭐⭐⭐)
**Riddle**: "What Caribbean nation births blue pectolite?"
**Answer**: "dominican republic" or "dominican"

#### Level 4 (⭐⭐⭐⭐)
**Riddle**: "SiO₂·nH₂O describes which October birthstone?"
**Answer**: "opal"

#### Level 5 (⭐⭐⭐⭐⭐)
**Riddle**: "Mohs 7 + 2.65 g/cm³ + radiation = ?"
**Answer**: "smoky quartz" or "smokyquartz"

### Flute Answer Riddles

#### Level 3 (⭐⭐⭐)
**Riddle**: "What frequency in Hz is middle C?"
**Answer**: "262" or "261.63"

#### Level 4 (⭐⭐⭐⭐)
**Riddle**: "Who revolutionized the flute in 1847?"
**Answer**: "Boehm" or "Theobald Boehm"

#### Level 5 (⭐⭐⭐⭐⭐)
**Riddle**: "Transpose 'YUNSRA' from B♭ to C"
**Answer**: "Syrinx" (anagram + music joke)

### Pop Culture Answer Riddles

#### EEAAO Level 4 (⭐⭐⭐⭐)
**Riddle**: "What probability triggers verse-jumping?"
**Answer**: "0.00000000001" or "one in a trillion"

#### Arcane Level 4 (⭐⭐⭐⭐)
**Riddle**: "Jinx + Vi age difference in Act 1"
**Answer**: "5" or "five"

#### Gaming Level 5 (⭐⭐⭐⭐⭐)
**Riddle**: "↑↑↓↓←→←→BA[?]"
**Answer**: "start" or "select start"

### Ōkami Answer Riddles

#### Level 3 (⭐⭐⭐)
**Riddle**: "How many Celestial Brush techniques exist?"
**Answer**: "13" or "thirteen"

#### Level 4 (⭐⭐⭐⭐)
**Riddle**: "Name Issun's legendary grandfather"
**Answer**: "Ishaku"

#### Level 5 (⭐⭐⭐⭐⭐)
**Riddle**: "天照大神 = ?"
**Answer**: "amaterasu omikami" or "amaterasu"

## Multi-Step Answer Chains

### Complex Example:
1. **Riddle 1**: "Spiral town name?" → Answer: "Kurouzu-cho"
2. **Website shows**: "Take the 3rd, 7th, and 11th letters"
3. **Joy calculates**: "R-U-O"
4. **Riddle 2**: "Rearrange these letters and add 'Y'"
5. **Final answer**: "YOUR" → Unlocks: "Check YOUR flute case"

## Answer Validation Tips

### Accept Multiple Formats:
```javascript
const acceptedAnswers = [
  "kurouzu-cho",
  "kurouzu cho",
  "kurouzucho",
  "kurouzu"
];
```

### Case-Insensitive:
```javascript
if (answer.toLowerCase().replace(/\s/g, '') === "smokyquartz")
```

### Partial Credit System:
- Close answer → Hint: "You're close! Think about the spelling..."
- Wrong answer → Hint: "That's not it. Remember the story..."

## Integration Ideas

### Mixed Hunt Flow:
1. **Physical**: Find Junji Ito poster
2. **Behind poster**: QR code to website
3. **Website riddle**: "What town?" → "Kurouzu-cho"
4. **Reveals**: "Your next clue awaits in verses of fire"
5. **Physical**: Go to Ocean Vuong book
6. **In book**: Another answer riddle
7. **Continue alternating**...

### Progressive Difficulty:
- Start with physical locations (familiar)
- Introduce answer mechanism midway
- Increase answer complexity
- End with multi-step answer puzzle

## Benefits for Joy

1. **Can't accidentally skip** - Must solve to progress
2. **Different mental challenge** - Not just "find the place"
3. **Sense of achievement** - Typing correct answer feels great
4. **No physical searching** - Some riddles are pure knowledge
5. **Builds anticipation** - Website dramatically reveals next step

## Links
- [[Answer Submission Mechanism]] - Technical setup
- [[Riddle Writing Guide]] - Core principles
- [[Escape Room Techniques]] - Other mechanisms
- Individual riddle notes for answer integration