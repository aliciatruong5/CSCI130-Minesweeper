document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.gameGrid')
    const flagRemaining = document.querySelector('#flagsRemaining')
    const result = document.querySelector('#result')
    const statsDisplay = document.querySelector('#stats');
    const restartButton = document.querySelector('#restartBtn');
    const width = 10
    let bombAmount = 20
    let squares = []
    let gameOver = false
    let flags = 0
    let clearedSquare = 0
    let timerStarted = false
    let timerInterval
    let timeElapsed = 0

    const backgroundMusic = new Audio('background.mp3')
    backgroundMusic.loop = true
    const loseSound = new Audio('loser.mp3') 
    const winSound = new Audio('winner.mp3')

    // Initialize stats in localStorage if not present
    if (!localStorage.getItem('gamesPlayed')) localStorage.setItem('gamesPlayed', 0);
    if (!localStorage.getItem('gamesWon')) localStorage.setItem('gamesWon', 0);
    if (!localStorage.getItem('timePlayed')) localStorage.setItem('timePlayed', 0);

    // Load stats from localStorage
    function loadStats() {
        const gamesPlayed = localStorage.getItem('gamesPlayed');
        const gamesWon = localStorage.getItem('gamesWon');
        const timePlayed = localStorage.getItem('timePlayed');

        statsDisplay.innerHTML = `
            <p>Games Played: ${gamesPlayed}</p>
            <p>Games Won: ${gamesWon}</p>
            <p>Total Time Played: ${formatTime(timePlayed)}</p>
        `;
    }

    // Format time in seconds to HH:MM:SS
    function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs}h ${mins}m ${secs}s`;
    }

    // Update stats in localStorage
    function updateStats(won) {
        const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed')) + 1;
        const gamesWon = won ? parseInt(localStorage.getItem('gamesWon')) + 1 : parseInt(localStorage.getItem('gamesWon'));
        const timePlayed = parseInt(localStorage.getItem('timePlayed')) + timeElapsed;

        localStorage.setItem('gamesPlayed', gamesPlayed);
        localStorage.setItem('gamesWon', gamesWon);
        localStorage.setItem('timePlayed', timePlayed);

        loadStats();
    }

    function startTimer() {
        const timerDisplay = document.querySelector('#timer'); // Assuming you have an element with id 'timer' in your HTML
        timerInterval = setInterval(() => {
            timeElapsed++;
            timerDisplay.innerHTML = `Time: ${timeElapsed} sec`;
        }, 1000);

        // Start background music
        backgroundMusic.play();
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }

    //creating the game board
    function createGameBoard() {    
        flagRemaining.innerHTML = bombAmount
        gameOver = false;
        flags = 0;
        clearedSquare = 0;
        squares = [];
        timeElapsed = 0; // Reset time
        timerStarted = false;

        // Reset music
        backgroundMusic.currentTime = 0;

        //randomizing the bombs in the grid
        const bombs = Array(bombAmount).fill('bomb')
        const safeSpace = Array(width * width - bombAmount).fill('safe')
        const placements = safeSpace.concat(bombs)
        const randomizingSpaces = placements.sort(() => Math.random() - 0.5)

        grid.innerHTML = '';

        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div')
            square.id = i
            square.classList.add(randomizingSpaces[i])
            grid.appendChild(square)
            squares.push(square)

            //normal clicks
            square.addEventListener('click', function() {
                if (!timerStarted) {
                    startTimer();
                    timerStarted = true;
                }
                click(square)   
            })

            //left clicks
            square.addEventListener('contextmenu', function(e) {
                e.preventDefault()
                addFlag(square)
            })
        }

        //adding numbers to the squares
        for(let i = 0; i <squares.length; i++) {
            let total = 0
            const isLeftCorner = (i % width === 0)
            const isRightCorner = (i % width === width - 1)

            if (squares[i].classList.contains('safe')) {
                if (i > 0 && !isLeftCorner && squares[i - 1].classList.contains('bomb')) total++; // Left
                if (i > width - 1 && !isRightCorner && squares[i + 1 - width].classList.contains('bomb')) total++; // Top-right
                if (i > width - 1 && squares[i - width].classList.contains('bomb')) total++; // Top
                if (i > width && !isLeftCorner && squares[i - width - 1].classList.contains('bomb')) total++; // Top-left
                if (i < width * width - 1 && !isRightCorner && squares[i + 1].classList.contains('bomb')) total++; // Right
                if (i < width * (width - 1) && !isLeftCorner && squares[i - 1 + width].classList.contains('bomb')) total++; // Bottom-left
                if (i < width * (width - 1) && !isRightCorner && squares[i + 1 + width].classList.contains('bomb')) total++; // Bottom-right
                if (i < width * (width - 1) && squares[i + width].classList.contains('bomb')) total++; // Bottom
                squares[i].setAttribute('data', total);
            }
        }
    }

    createGameBoard()
    loadStats()

    function addFlag(square) {
        if (gameOver) return
        if (!square.classList.contains('checked') && (flags < bombAmount)) {
            if(!square.classList.contains('flag')) {
                square.classList.add('flag')
                flags++
                square.innerHTML = '🐾'
                flagRemaining.innerHTML = bombAmount - flags
                winnerWinner()
            }
            else {
                square.classList.remove('flag')
                flags--
                square.innerHTML = ''
                flagRemaining.innerHTML = bombAmount - flags

            }
        }
    }

    function click(square) {
        if (gameOver || square.classList.contains('checked') || square.classList.contains('flagged')) return

        if (square.classList.contains('bomb')) {
            stopTimer()
            isGameOver()
        }
        else {
            let total = square.getAttribute('data')
            if (total != 0) {
                if (total == 1) square.classList.add('one')
                if (total == 2) square.classList.add('two')
                if (total == 3) square.classList.add('three')
                if (total == 4) square.classList.add('four')
                square.innerHTML = total
                if (!square.dataset.cleared) {
                   clearedSquare++
                   square.dataset.cleared = true
                }
                winnerDinner()
                return
            }
            checkedSquare(square)
        }
        if (!square.classList.contains('checked')) {
            square.classList.add('checked')
            if (!square.dataset.cleared) {
                clearedSquare++
                square.dataset.cleared = true
            }
        winnerDinner()
        }
    }

    function checkedSquare(square) {
        const currentId = square.id
        const isLeftCorner = (currentId % width === 0)
        const isRightCorner = (currentId % width === width - 1)

        setTimeout(() => {
            if (currentId > 0 && !isLeftCorner) click(squares[currentId - 1]); // Left
            if (currentId > width - 1 && !isRightCorner) click(squares[currentId + 1 - width]); // Top-right
            if (currentId > width - 1) click(squares[currentId - width]); // Top
            if (currentId > width && !isLeftCorner) click(squares[currentId - 1 - width]); // Top-left
            if (currentId < width * width - 1 && !isRightCorner) click(squares[currentId + 1]); // Right
            if (currentId < width * (width - 1) && !isLeftCorner) click(squares[currentId - 1 + width]); // Bottom-left
            if (currentId < width * (width - 1) && !isRightCorner) click(squares[currentId + 1 + width]); // Bottom-right
            if (currentId < width * (width - 1)) click(squares[currentId + width]); // Bottom
        }, 10)
    }

    function winnerDinner() {
        const safeSquares = width * width - bombAmount
        if (clearedSquare == safeSquares) {
            result.innerHTML = 'WINNER WINNER CHICKEN DINNER';
            gameOver = true;
            stopTimer()
            // Play win sound
            winSound.play()
            updateStats(true)
        }

        
    }


    function winnerWinner() {
        let matches = 0

        for (let i = 0; i <squares.length; i++) {
            if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')){
                matches++
            }
            if (matches === bombAmount) {
                result.innerHTML = 'WINNER WINNER CHICKEN DINNER'
                gameOver = true
                stopTimer()
                
                // Play win sound
                winSound.play()
                updateStats(true)
            }
        }
            
    }


    function isGameOver() {
        result.innerHTML = 'WOOF LUCK! GAME OVER'
        gameOver = true
        stopTimer()
        loseSound.play();

        //show all dogs
        squares.forEach(function(square){
            if (square.classList.contains('bomb')) {
                square.innerHTML = '🐶'
                square.classList.remove('bomb')
                square.classList.add('checked')
            }
        })
     // Show restart button
        restartButton.style.display = 'block';
        updateStats(false)
    }

    // Restart game
    restartButton.addEventListener('click', function() {
        restartButton.style.display = 'none'; // Hide the restart button
        result.innerHTML = '';
        createGameBoard(); // Recreate the game board
    });

})
