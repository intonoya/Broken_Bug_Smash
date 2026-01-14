document.addEventListener("DOMContentLoaded", () => {
    const gameContainer = document.getElementById("gameContainer");
    const scoreDisplay = document.getElementById("score");
    const endGameSound = document.getElementById("endGameSound");

    let score = 0;
    let timeLeft = 30;
    let gameInterval;
    let bugSpeed = 2;
    let bugs = [];

    // Plays the background music
    document.body.addEventListener("click", () => {
        bgMusic.play().catch((error) => {
            console.log("Audio play failed:", error);
        });
    });

    function spawnBug() {
        const bug = document.createElement("img");
        bug.src = "bug.png";
        bug.classList.add("bug");
        bug.style.left = `${Math.random() * (gameContainer.clientWidth - 40)}px`;
        bug.style.top = `${Math.random() * (gameContainer.clientHeight - 40)}px`;
        gameContainer.appendChild(bug);
        bugs.push(bug);

        let directionX = (Math.random() - 0.5) * bugSpeed;
        let directionY = (Math.random() - 0.5) * bugSpeed;

        function moveBug() {
            let x = parseFloat(bug.style.left);
            let y = parseFloat(bug.style.top);

            if (x + directionX < 0 || x + directionX > gameContainer.clientWidth - 40) {
                directionX *= -1;
            }
            if (y + directionY < 0 || y + directionY > gameContainer.clientHeight - 40) {
                directionY *= -1;
            }

            bug.style.left = `${x + directionX}px`;
            bug.style.top = `${y + directionY}px`;
        }

        const moveInterval = setInterval(moveBug, 30);

        bug.addEventListener("click", () => {
            clearInterval(moveInterval);
            bug.classList.add("smashed");

            // Plays a smash sound, when you kill a bug
            const smashSound = new Audio("sounds/smash.mp3");
            smashSound.play();

            setTimeout(() => {
                gameContainer.removeChild(bug);
                bugs = bugs.filter(b => b !== bug);
            }, 300);
            score++;
            scoreDisplay.textContent = score;
            bugSpeed += 0.2;
        });
    }

    function moveBugsAwayFromCursor(event) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        bugs.forEach(bug => {
            const bugX = parseFloat(bug.style.left);
            const bugY = parseFloat(bug.style.top);
            const dx = bugX - mouseX;
            const dy = bugY - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) { 
                const angle = Math.atan2(dy, dx);
                bug.style.left = `${bugX + Math.cos(angle) * 20}px`;
                bug.style.top = `${bugY + Math.sin(angle) * 20}px`;
            }
        });
    }

    function startGame() {
        score = 0;
        timeLeft = 30;
        bugSpeed = 2;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        gameContainer.innerHTML = "";
        startGameBtn.disabled = true;
        bugs = [];


        gameInterval = setInterval(() => {
            timeLeft++;
            timeDisplay.textContent = timeLeft;
        }, 1000);

        setInterval(spawnBug, 1000);
        document.addEventListener("mousemove", moveBugsAwayFromCursor);
    }

    function endGame() {
        clearInterval(gameInterval);
        bgMusic.pause();
        bgMusic.currentTime = 0;
        endGameSound.play();
        

        if (Math.random() < 0.3) {
            score = 0;
        }

        alert(`Game over! Your final score is: ${score}`);
        startGameBtn.disabled = false;
        document.removeEventListener("mousemove", moveBugsAwayFromCursor);
    }

    startGameBtn.addEventListener("click", startGame);
});
