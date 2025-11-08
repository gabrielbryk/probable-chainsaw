# GitHub Pages Implementation - Full Stack Version

## Quick Deploy Setup

Since you're experienced, here's a clean, expandable architecture you can deploy in minutes.

## Project Structure
```
joy-hunt/
├── index.html
├── style.css
├── script.js
└── riddles.json (optional - or hardcode in JS)
```

## index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Joy's Birthday Quest</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <div class="container">
            <div id="intro" class="screen active">
                <h1>Welcome to Your Birthday Quest</h1>
                <p>Ready to begin?</p>
                <button onclick="startHunt()">Begin</button>
            </div>

            <div id="riddle" class="screen">
                <h2 id="riddle-title"></h2>
                <p id="riddle-text"></p>
                <input type="text" id="answer-input" placeholder="Enter your answer..." autocomplete="off">
                <button onclick="checkAnswer()">Submit</button>
                <div id="feedback"></div>
                <div id="attempts"></div>
            </div>

            <div id="clue" class="screen">
                <h2>Correct!</h2>
                <div id="clue-content"></div>
                <button onclick="nextRiddle()">Continue</button>
            </div>

            <div id="final" class="screen">
                <h1>🎉 Quest Complete! 🎉</h1>
                <div id="final-message"></div>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

## style.css
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.container {
    max-width: 600px;
    width: 100%;
}

.screen {
    display: none;
    animation: fadeIn 0.5s;
    background: rgba(0, 0, 0, 0.3);
    padding: 40px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.screen.active {
    display: block;
}

h1, h2 {
    margin-bottom: 20px;
    text-align: center;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

p {
    margin-bottom: 20px;
    line-height: 1.6;
    font-size: 18px;
}

input {
    width: 100%;
    padding: 15px;
    font-size: 18px;
    border: none;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    margin-bottom: 20px;
}

button {
    width: 100%;
    padding: 15px;
    font-size: 18px;
    border: none;
    border-radius: 10px;
    background: #fff;
    color: #764ba2;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

#feedback {
    margin-top: 20px;
    padding: 15px;
    border-radius: 10px;
    display: none;
    text-align: center;
}

#feedback.error {
    background: rgba(255, 0, 0, 0.2);
    border: 1px solid rgba(255, 0, 0, 0.5);
    display: block;
}

#feedback.hint {
    background: rgba(255, 255, 0, 0.2);
    border: 1px solid rgba(255, 255, 0, 0.5);
    display: block;
}

#attempts {
    margin-top: 10px;
    text-align: center;
    opacity: 0.7;
    font-size: 14px;
}

#clue-content {
    padding: 20px;
    background: rgba(0, 255, 0, 0.1);
    border-radius: 10px;
    margin-bottom: 20px;
    font-size: 20px;
    text-align: center;
    border: 2px solid rgba(0, 255, 0, 0.3);
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Mobile responsiveness */
@media (max-width: 600px) {
    .screen {
        padding: 20px;
    }
    h1 { font-size: 24px; }
    h2 { font-size: 20px; }
    p, input, button { font-size: 16px; }
}
```

## script.js
```javascript
// Riddle configuration - modify these for your hunt
const riddles = [
    {
        id: 'spiral',
        title: 'The First Challenge',
        text: 'In which town does the spiral curse consume all who enter?',
        answers: ['kurouzu-cho', 'kurouzucho', 'kurouzu cho', 'kurouzu'],
        clue: 'Excellent! Your next clue: "Where Little Dog writes to a mother who cannot read, seek page 87."',
        hints: [
            'Think about the Junji Ito manga...',
            'The town name is Japanese...',
            'It starts with a K...'
        ]
    },
    {
        id: 'ocean',
        title: 'Literary Depths',
        text: 'What age marks the beginning of confession in the novel that bleeds?',
        answers: ['28', 'twenty-eight', 'twenty eight'],
        clue: 'Brilliant! Next: "In the collection of earth\'s treasures, find the Dominican phantom that must drown to live."',
        hints: [
            'The novel opens with this age...',
            'Little Dog is turning...'
        ]
    },
    {
        id: 'crystal',
        title: 'Geological Mystery',
        text: 'Name the blue pectolite that remembers Caribbean waters:',
        answers: ['larimar'],
        clue: 'Perfect! Continue to: "Where silver rests at 262 Hz, awaiting breath to sing."',
        hints: [
            'This stone is only found in one country...',
            'It\'s blue like the sea...'
        ]
    },
    {
        id: 'flute',
        title: 'Musical Mathematics',
        text: 'How many Celestial Brush techniques must a wolf master?',
        answers: ['13', 'thirteen'],
        clue: 'Wonderful! Head to: "Where minds align on the spectrum between extremes."',
        hints: [
            'Count all the brush powers in Ōkami...',
            'More than 10, less than 15...'
        ]
    },
    {
        id: 'wavelength',
        title: 'The Spectrum',
        text: 'Complete the Konami Code: ↑↑↓↓←→←→BA___',
        answers: ['start', 'select start', 'selectstart'],
        clue: 'Amazing! Your final destination awaits: Check the mystery box in [LOCATION]!',
        hints: [
            'This is a classic gaming code...',
            'What button confirms the code?'
        ]
    }
];

let currentRiddle = 0;
let attempts = {};
let startTime = {};

function startHunt() {
    showScreen('riddle');
    loadRiddle(0);
}

function loadRiddle(index) {
    const riddle = riddles[index];
    currentRiddle = index;

    if (!attempts[riddle.id]) {
        attempts[riddle.id] = 0;
        startTime[riddle.id] = Date.now();
    }

    document.getElementById('riddle-title').textContent = riddle.title;
    document.getElementById('riddle-text').textContent = riddle.text;
    document.getElementById('answer-input').value = '';
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('attempts').textContent = '';
    document.getElementById('answer-input').focus();
}

function checkAnswer() {
    const riddle = riddles[currentRiddle];
    const input = document.getElementById('answer-input').value.toLowerCase().trim();
    const feedback = document.getElementById('feedback');

    attempts[riddle.id]++;

    // Check if answer is correct
    if (riddle.answers.some(answer => answer === input)) {
        // Success!
        const timeSpent = Math.round((Date.now() - startTime[riddle.id]) / 1000);
        document.getElementById('clue-content').innerHTML =
            riddle.clue +
            `<br><br><small>Solved in ${timeSpent} seconds with ${attempts[riddle.id]} attempts!</small>`;
        showScreen('clue');

        // Log progress (you could send this to an endpoint)
        console.log(`Riddle ${riddle.id} solved:`, {
            attempts: attempts[riddle.id],
            time: timeSpent,
            answer: input
        });
    } else {
        // Wrong answer
        feedback.className = 'error';
        feedback.style.display = 'block';

        // Provide hints after certain attempts
        if (attempts[riddle.id] >= 3 && riddle.hints[0]) {
            feedback.className = 'hint';
            const hintIndex = Math.min(
                Math.floor(attempts[riddle.id] / 3) - 1,
                riddle.hints.length - 1
            );
            feedback.textContent = riddle.hints[hintIndex];
        } else {
            feedback.textContent = 'Not quite right. Try again!';
        }

        document.getElementById('attempts').textContent =
            `Attempts: ${attempts[riddle.id]}`;
    }
}

function nextRiddle() {
    if (currentRiddle < riddles.length - 1) {
        loadRiddle(currentRiddle + 1);
        showScreen('riddle');
    } else {
        // Hunt complete!
        const totalTime = Math.round(
            Object.keys(startTime).reduce((sum, key) =>
                sum + (Date.now() - startTime[key]), 0) / 1000 / 60
        );
        const totalAttempts = Object.values(attempts).reduce((a, b) => a + b, 0);

        document.getElementById('final-message').innerHTML = `
            <p>You solved all ${riddles.length} riddles!</p>
            <p>Total time: ${totalTime} minutes</p>
            <p>Total attempts: ${totalAttempts}</p>
            <p>Happy Birthday! 🎉</p>
        `;
        showScreen('final');
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Allow Enter key to submit
document.getElementById('answer-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});
```

## Advanced Features You Can Add

### 1. State Persistence
```javascript
// Save progress to localStorage
localStorage.setItem('huntProgress', JSON.stringify({
    currentRiddle,
    attempts,
    startTime
}));
```

### 2. Analytics
```javascript
// Track everything to Firebase or custom endpoint
fetch('https://your-endpoint.com/track', {
    method: 'POST',
    body: JSON.stringify({ riddle: riddle.id, success: true })
});
```

### 3. Dynamic Riddle Loading
```javascript
// Load riddles from JSON or API
fetch('riddles.json')
    .then(r => r.json())
    .then(data => riddles = data);
```

### 4. Easter Eggs
```javascript
// Special responses for specific wrong answers
const easterEggs = {
    'amaterasu': 'Close! But that's a different riddle...',
    'love': 'Sweet, but not the answer!'
};
```

### 5. Progressive Web App
```json
// manifest.json for installable app
{
  "name": "Joy's Birthday Quest",
  "short_name": "Joy Quest",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#764ba2"
}
```

## Deployment

1. Create repo: `joy-hunt`
2. Push these files
3. Settings → Pages → Deploy from main
4. Available at: `[username].github.io/joy-hunt`

## Customization Ideas

- **Animations**: Confetti on correct answers (canvas-confetti library)
- **Sound**: Audio feedback for correct/wrong
- **Images**: Show image clues between riddles
- **Timer**: Countdown timer for added pressure
- **Leaderboard**: If others will try it later
- **QR Integration**: Generate QR codes for physical locations

## Quick Modifications

Change the gradient colors for Joy's favorite colors:
```css
background: linear-gradient(135deg, #[color1] 0%, #[color2] 100%);
```

Add particle effects:
```javascript
// particles.js for background animation
```

The whole thing should take < 30 mins to customize and deploy!