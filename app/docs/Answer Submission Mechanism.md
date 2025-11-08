# Answer Submission Mechanism

## Core Concept
Instead of riddles leading to physical locations, some riddles require Joy to determine a specific **answer** (word, phrase, number, sequence) and submit it to unlock the next clue.

## Implementation Options

### Option 1: Simple Website/Web Form
**Tech Required**: Basic HTML/JS hosted on GitHub Pages or Netlify
```javascript
// Simple answer checker
if (answer.toLowerCase() === "uzumaki") {
  showNextClue();
}
```
**Pros**:
- Easy to set up
- Can add multiple checkpoints
- Works on phone/computer
- Can track attempts/time

**Cons**:
- Requires internet
- Answers visible in source code (unless encrypted)

### Option 2: Google Form with Logic
**Tech Required**: Google Forms with conditional logic
- Set up form with answer field
- Use response validation
- Show different pages based on correct answer

**Pros**:
- No coding needed
- Easy to modify
- Can see attempts/timestamps

**Cons**:
- Less customizable
- Requires Google account

### Option 3: Local Python Script
**Tech Required**: Simple Python script on laptop
```python
answer = input("Enter answer: ").lower()
if answer == "larimar":
    print("Next clue: [riddle text]")
```

**Pros**:
- Completely offline
- Can add complex logic
- More secure

**Cons**:
- Needs computer access
- Less elegant

### Option 4: Cipher/Decoder Wheel
**Physical + Digital Hybrid**
- Create physical decoder wheel
- Answer reveals next clue when aligned
- Or answer is the key to decode encrypted text

**Pros**:
- Tactile element
- No tech needed for basic version
- Feels like escape room prop

### Option 5: Password-Protected Files
**Tech Required**: Encrypted PDFs or password-protected zips
- Each answer is the password
- Opens file with next riddle

**Pros**:
- Works offline
- Multiple apps support this
- Secure

**Cons**:
- Need to prepare all files ahead

## Recommended Approach: Hybrid System

### Primary Method: Simple Static Website
Host on GitHub Pages (free, easy):

```html
<!DOCTYPE html>
<html>
<head>
    <title>Joy's Scavenger Hunt</title>
    <style>
        body {
            background: #1a1a1a;
            color: #fff;
            font-family: 'Courier New', monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        input {
            background: #333;
            color: #fff;
            border: 1px solid #666;
            padding: 10px;
            font-size: 18px;
        }
        .hidden { display: none; }
        .clue {
            margin-top: 20px;
            padding: 20px;
            border: 2px solid #gold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Enter Your Answer</h1>
        <input type="text" id="answer" placeholder="Type answer here...">
        <button onclick="checkAnswer()">Submit</button>

        <div id="clue1" class="clue hidden">
            <!-- Next riddle appears here -->
        </div>
    </div>

    <script>
        // Encrypted answers (use simple encoding)
        const answers = {
            'stage1': btoa('kurouzucho'), // Base64 encode
            'stage2': btoa('littledog'),
            'stage3': btoa('larimar')
        };

        function checkAnswer() {
            const input = document.getElementById('answer').value.toLowerCase();
            const encoded = btoa(input);

            if (encoded === answers.stage1) {
                showClue('clue1', 'Next riddle text here...');
            }
            // Add more stages
        }

        function showClue(id, text) {
            document.getElementById(id).innerHTML = text;
            document.getElementById(id).classList.remove('hidden');
        }
    </script>
</body>
</html>
```

## New Riddle Possibilities

With answer submission, you can create:

### 1. **Knowledge Questions**
Instead of: "Go to where X is"
Now: "What is the name of the town in Uzumaki?" → Answer: "Kurouzu-cho"

### 2. **Math/Logic Puzzles**
"Calculate: (13 Celestial Brush techniques × 8 Orochi heads) - 100 years" → Answer: "4"

### 3. **Wordplay/Anagrams**
"Rearrange 'A MUTE RASA' to find the goddess" → Answer: "AMATERASU"

### 4. **Multiple Choice Sequences**
"Choose the correct sequence:
A) Power Slash, Cherry Bomb, Bloom
B) Sunrise, Restore, Galestorm
C) Rejuvenation, Powerslash, Sunrise"
→ Answer: "B"

### 5. **Translation Challenges**
"Translate 天照大神" → Answer: "Amaterasu Omikami"

### 6. **Audio/Visual Elements**
- Play audio clip of flute melody → Answer: "Debussy"
- Show partial image → Answer: "Spiral"

## Setup Instructions

### Quick GitHub Pages Setup:
1. Create GitHub account
2. Create new repository named "joy-hunt"
3. Create index.html with code above
4. Enable GitHub Pages in settings
5. Site available at: username.github.io/joy-hunt

### Security Considerations:
- Use base64 encoding (deters casual viewing)
- Or use simple Caesar cipher
- For true security, use backend (Netlify Functions)
- Alternative: Multiple HTML pages with obscure names

## Integration with Physical Hunt

### Mixed Format Example:
1. Physical riddle → Find Junji Ito poster
2. Behind poster: "Go to huntforjoy.com"
3. Website riddle requires answer
4. Correct answer reveals: "Check your flute case"
5. Physical riddle continues...

### QR Codes:
- Place QR codes at physical locations
- Each links to different puzzle page
- Adds tech element without breaking flow

## Answer Types to Use

### Easy to Type:
- Single words: "spiral", "amaterasu", "larimar"
- Numbers: "13", "1847", "698"
- Short phrases (no spaces): "celestialbrush", "oceansings"

### Avoid:
- Long sentences
- Special characters
- Case-sensitive answers (unless intentional)

## Benefits of Answer System

1. **More riddle variety** - Not limited to "find location" format
2. **Harder to bypass** - Can't accidentally find next clue
3. **Progress tracking** - Know exactly where she is
4. **Remote hints** - Can update website if she's stuck
5. **Memorable** - Unique mechanic adds to experience
6. **Replayable** - Others could try with different answers

## Links
- [[Escape Room Techniques]]
- [[Special Effects Options]]
- [[Riddle Writing Guide]]
- Individual riddle notes for answer integration