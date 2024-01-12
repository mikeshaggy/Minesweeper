var board = [];
var rows = 9;
var columns = 9;

var minesCount = 10;
var minesLocation = []; // "2-2", "3-4", "2-1"

var tilesClicked = 0; // goal to click all tiles except the ones containing mines
var flagEmoji = "🚩";
var bombEmoji = "💣";
var wonEmoji = "😎";
var flagEnabled = false;

var gameOver = false;
var startTime;

window.onload = function() {
    startGame();
}

function setMines() {
    let minesLeft = minesCount;
    while (minesLeft > 0) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = r.toString() + "-" + c.toString();

        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft--;
        }
    }
}

function startGame() {
    document.getElementById("minesCount").innerText = minesCount;
    setMines();
    console.log(minesLocation);

    // board initialization
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            tile.addEventListener("contextmenu", clickTile);
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }

    document.getElementById("board").addEventListener("click", startTimer);
}

function clickTile(event) {
    if (gameOver || this.classList.contains("tileClicked")) {
        return;
    }

    let tile = this;
    let isRightClick = event.which === 3 || event.button === 2;

    if (isRightClick) {
        event.preventDefault();
        if (!tile.classList.contains("flagged")) {        
            tile.classList.add("flagged");
            let flagImage = new Image();
            flagImage.src = "../images/flag.png";
            flagImage.alt = "Flag";
            flagImage.style.width = "50px";
            flagImage.style.height = "50px";
            tile.innerHTML = '';
            tile.appendChild(flagImage);
            minesCount--;
        } else {
            tile.classList.remove("flagged");
            tile.innerHTML = '';
            minesCount++;
        }
        document.getElementById("minesCount").innerText = minesCount;
    } else {
        if (minesLocation.includes(tile.id)) {
            gameOver = true;
            document.getElementById("resetButton").querySelector("img").src = "../images/lostFace.png"
            revealMines();
            return;
        }

        let coordinates = tile.id.split("-");
        let r = parseInt(coordinates[0]);
        let c = parseInt(coordinates[1]);
        checkMine(r, c);
    }
}

function revealMines() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id)) {
                if (tile.classList.contains("flagged")) {
                    tile.classList.remove("flagged");
                    let flagImage = tile.querySelector("img");
                    tile.removeChild(flagImage);
                }
                let mineImage = new Image();
                mineImage.src = "../images/mine.png"
                mineImage.style.width = "35px";
                mineImage.style.height = "35px";
                tile.appendChild(mineImage);
                tile.style.backgroundColor = "red";
            }
        }
    }
}

function checkMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    } 

    if (board[r][c].classList.contains("tileClicked")) {
        return;
    }

    board[r][c].classList.add("tileClicked");
    tilesClicked += 1;

    let minesFound = 0;

    // top 3
    minesFound += checkTile(r-1, c-1);     // top left
    minesFound += checkTile(r-1, c);       // top 
    minesFound += checkTile(r-1, c+1);     // top right

    // left and right
    minesFound += checkTile(r, c-1);       // left
    minesFound += checkTile(r, c+1);       // right

    // bottom 3
    minesFound += checkTile(r+1, c-1);     // bottom left
    minesFound += checkTile(r+1, c);       // bottom 
    minesFound += checkTile(r+1, c+1);     // bottom right

    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
        board[r][c].classList.add("x" + minesFound.toString());
    } else {
        // top 3
        checkMine(r-1, c-1);       // top left
        checkMine(r-1, c);         // top
        checkMine(r-1, c+1);       // top right

        // left and right
        checkMine(r, c-1);         // left
        checkMine(r, c+1);         // right

        // bottom 3
        checkMine(r+1, c-1);        // bottom left
        checkMine(r+1, c);          // bottom
        checkMine(r+1, c+1);        // bottom right
    }

    if (tilesClicked == rows * columns - minesCount || minesCount == 0) {
        document.getElementById("minesCount").innerText = "Cleared";
        document.getElementById("resetButton").querySelector("img").src = "../images/wonFace.png"
        gameOver = true;
    }
}

function checkTile(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return 0;
    }

    if (minesLocation.includes(r.toString() + "-" + c.toString())) {
        return 1;
    }

    return 0;
}

function startTimer() {
    if (!startTime) {
        startTime = new Date();
        setInterval(updateTimer, 1000);
    }
}

function updateTimer() {
    if (!gameOver) {
        let currentTime = new Date();
        let elapsedTime = Math.floor((currentTime - startTime) / 1000);

        document.getElementById("timer").innerText = "Time: " + elapsedTime + "s";
    }
}

function refreshPage() {
    location.reload();
}