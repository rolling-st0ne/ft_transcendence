import PongView from "./views/pong"
import MainSPA from "./main_spa";
export default function pong_game(view) {
    var canvas = document.getElementById("pongCanvas");
    var ctx = canvas.getContext("2d");
    const CENTER_X = canvas.width / 2;
    const CENTER_Y = canvas.height / 2;
    const MAX_SCORE = 11
    var x = CENTER_X;
    var y = CENTER_Y;
    var ball_throw = 0 // this is for change side ball throw
    var change_side = -1
    var dx = 5;
    var dy = 5;
    var	start_direction = dx
    var ballRadius = 4;
    var padHeight = 4
    var padWidth = 32
    var leftPadX = padHeight
    var leftPadY = (canvas.height - padWidth) / 2
    var rightPadX = canvas.width - padHeight - padHeight
    var rightPadY = (canvas.height - padWidth) / 2;
    var leftUpBtn = false
    var leftDownBtn = false
    var rightUpBtn = false
    var rightDownBtn = false
    var	leftScore = 0
    var rightScore = 0
    var gameShift = -600
    var dg = 3
    var gameStop = 700
    var gameID
    var startTime = 3000
    var loopID
    var is_player_left = 0;
    var is_player_right = 0;
    var is_spectator = 0;
    if (MainSPA.SPA.router.currentuser.get('id') == view.first_player_id) {
        is_player_left = 1;
    }
    else if (MainSPA.SPA.router.currentuser.get('id') == view.second_player_id) {
        is_player_right = 1;
    }
    else {
        is_spectator = 1;
    }
    console.log(is_player_left, is_player_right, is_spectator)
    console.log(view)
    const  delay = (callback, wait = 1000) => {
        setTimeout(callback, wait)
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    function leftDownHandler(e) {
        if(e.key == "Down" || e.key == "ArrowDown") {
            leftDownBtn = true;
        }
        else if(e.key == "Up" || e.key == "ArrowUp") {
            leftUpBtn = true;
        }
    }

    function leftUpHandler(e) {
        if(e.key == "Down" || e.key == "ArrowDown") {
            leftDownBtn = false;
        }
        else if(e.key == "Up" || e.key == "ArrowUp") {
            leftUpBtn = false;
        }
    }

    function rightDownHandler(e) {
        if(e.key == "w") {
            rightUpBtn = true;
        }
        else if(e.key == "s") {
            rightDownBtn = true;
        }
    }

    function rightUpHandler(e) {
        if(e.key == "w") {
            rightUpBtn = false;
        }
        else if(e.key == "s") {
            rightDownBtn = false;
        }
    }

    if (is_player_right == 1) {
        document.addEventListener("keydown", rightDownHandler, false);
        document.addEventListener("keyup", rightUpHandler, false);
    }
    if (is_player_left == 1) {
        document.addEventListener("keydown", leftDownHandler, false);
        document.addEventListener("keyup", leftUpHandler, false);
    }
    function drawPixel() {
        ctx.beginPath();
        ctx.rect(leftPadX, leftPadY, 5, 5);
        ctx.fillStyle = "#FF0000";
        ctx.fill();
        ctx.closePath();
    }

    function drawLeftPad() {
        ctx.beginPath();
        leftPadY = view.getLeftPadY();
        ctx.rect(leftPadX, leftPadY, padHeight, padWidth);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.closePath();
    }

    function drawRightPad() {
        ctx.beginPath()
        rightPadY = view.getRightPadY();
        ctx.rect(rightPadX, rightPadY, padHeight, padWidth);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.closePath();
    }

    function drawBall() {
        ctx.beginPath();
        if (is_player_left == 0)
        {
            x = view.getBallX();
            y = view.getBallY();
        }
        ctx.arc(x, y, ballRadius, 0, Math.PI*2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.closePath();
    }

    function checkStats() {
        if (is_player_left != 1)
        {
            rightScore = view.getRightScore();
            leftScore = view.getLeftScore();
        }
        else
        {
            if (x < 0)
            {
                rightScore += 1
                view.broadcastScore({score: {left: leftScore, right: rightScore}})
                view.setSecondPlayerScore(rightScore);
                x = CENTER_X;
                y = CENTER_Y;
                ball_throw++

            }
            else if (x > canvas.width)
            {
                
                leftScore += 1
                view.broadcastScore({score: {left: leftScore, right: rightScore}});
                view.setFirstPlayerScore(leftScore);
                x = CENTER_X;
                y = CENTER_Y;
                ball_throw++
            }
        }
        if (leftScore >= MAX_SCORE || rightScore >= MAX_SCORE)
        {
            clearInterval(loopID) // the main loop breaks here
            if (leftScore >= MAX_SCORE) {
                console.log("left won");
                if (is_player_left == 1)
                {
                    view.finishGame(view.first_player_id);
                }
            }
            if (rightScore >= MAX_SCORE) {
                console.log("right won");
                if (is_player_left == 1)
                {
                    view.finishGame(view.second_player_id);
                }
            }
            gameID = setInterval(drawGame, 10)
        }
        if (ball_throw === 2)
        {
            ball_throw = 0
            dx = change_side * start_direction
            change_side *= -1
        }
    }

    function drawSquare(x, y, size = 10)
    {
        ctx.beginPath();
        ctx.rect(x, y, size, size);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.closePath();
    }

    function drawBorders()
    {

    }

    function drawRect(x, y, h, w)
    {
        ctx.beginPath();
        ctx.rect(x, y, h, w);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.closePath();
    }

    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSquare(210 + gameShift, 110) //G
        drawSquare(200 + gameShift, 100)
        drawSquare(190 + gameShift, 100)
        drawSquare(180 + gameShift, 100)
        drawSquare(170 + gameShift, 100)
        drawSquare(160 + gameShift, 110)
        drawSquare(160 + gameShift, 120)
        drawSquare(160 + gameShift, 130)
        drawSquare(155 + gameShift, 130, 5)
        drawSquare(155 + gameShift, 135, 5)
        drawSquare(155 + gameShift, 140, 5)
        drawSquare(155 + gameShift, 145, 5)
        drawSquare(160 + gameShift, 140)
        drawSquare(160 + gameShift, 150)
        drawSquare(155 + gameShift, 150, 5)
        drawSquare(155 + gameShift, 155, 5)
        drawSquare(160 + gameShift, 160)
        drawSquare(160 + gameShift, 170)
        drawSquare(170 + gameShift, 180)
        drawSquare(180 + gameShift, 180)
        drawSquare(190 + gameShift, 180)
        drawSquare(200 + gameShift, 180)
        drawSquare(210 + gameShift, 180)
        drawSquare(210 + gameShift, 170)
        drawSquare(210 + gameShift, 160)
        drawSquare(210 + gameShift, 170)
        drawSquare(210 + gameShift, 150)
        drawSquare(200 + gameShift, 150)
        drawSquare(290 + gameShift, 100) // A
        drawSquare(280 + gameShift, 110)
        drawSquare(270 + gameShift, 120)
        drawSquare(270 + gameShift, 130)
        drawSquare(260 + gameShift, 140)
        drawSquare(260 + gameShift, 150)
        drawSquare(260 + gameShift, 160)
        drawSquare(260 + gameShift, 170)
        drawSquare(260 + gameShift, 180)
        drawSquare(300 + gameShift, 110)
        drawSquare(310 + gameShift, 120)
        drawSquare(310 + gameShift, 130)
        drawSquare(320 + gameShift, 140)
        drawSquare(320 + gameShift, 150)
        drawSquare(320 + gameShift, 160)
        drawSquare(320 + gameShift, 170)
        drawSquare(320 + gameShift, 180)
        drawRect(260 + gameShift, 160, 70, 10)
        drawRect(370 + gameShift, 100, 10, 90) // M
        drawSquare(370 + gameShift, 100)
        drawSquare(380 + gameShift, 110)
        drawSquare(390 + gameShift, 120)
        drawSquare(400 + gameShift, 130)
        drawSquare(410 + gameShift, 140)
        drawSquare(420 + gameShift, 130)
        drawSquare(430 + gameShift, 120)
        drawSquare(440 + gameShift, 110)
        drawSquare(450 + gameShift, 100)
        drawRect(450 + gameShift, 100, 10, 90) //E
        drawRect(500 + gameShift, 100, 10, 90)
        drawRect(500 + gameShift, 100, 60, 10)
        drawRect(500 + gameShift, 140, 60, 10)
        drawRect(500 + gameShift, 180, 60, 10)
        drawRect(600 + gameShift, 100, 10, 60)
        drawSquare(600 + gameShift, 180)
        gameShift += dg
        if (gameShift >= -30)
        {
            drawScore()
            clearInterval(gameID)
        }

    }


    function countPrepare() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLeftPad();
        drawRightPad();
        drawBall();
    }

    function Zero(x, y)
    {
        drawRect(x, y, 3, 20)
        drawRect(x - 10, y, 10, 3)
        drawRect(x - 10, y, 3, 20)
        drawRect(x - 10, y + 18, 13, 3)
    }

    function One(x, y)
    {
        drawRect(x, y, 3, 21)
    }

    function Two(x, y)
    {
        drawRect(x, y, 3, 9)
        drawRect(x - 10, y, 10, 3)
        drawRect(x - 10 , y + 9, 13, 3)
        drawRect(x - 10, y + 10, 3, 10)
        drawRect(x - 10, y + 18, 13, 3)
    }

    function Three(x, y)
    {
        drawRect(x, y, 3, 20)
        drawRect(x - 10, y, 10, 3)
        drawRect(x - 10, y + 9, 10, 3)
        drawRect(x - 10, y + 18, 13, 3)
    }

    function Four(x, y)
    {
        drawRect(x, y, 3, 21)
        drawRect(x - 10, y, 3, 10)
        drawRect(x - 10, y + 9, 10, 3)
    }

    function Five(x, y)
    {
        drawRect(x - 10, y, 13, 3)
        drawRect(x - 10, y + 9, 13, 3)
        drawRect(x - 10, y + 18, 13, 3)
        drawRect(x - 10, y, 3, 10)
        drawRect(x, y + 10, 3, 10)

    }

    function Six(x, y)
    {
        Five(x, y)
        drawRect(x - 10, y + 10, 3, 10)
    }

    function Seven(x, y)
    {
        drawRect(x, y, 3, 21)
        drawRect(x - 10, y, 13, 3)
    }

    function Eight(x, y)
    {
        Zero(x, y)
        drawRect(x - 10, y + 9, 13, 3)
    }

    function Nine(x, y)
    {
        Four(x, y)
        drawRect(x - 10, y, 13, 3)
    }

    function Ten(x, y)
    {
        Zero(x, y);
        drawRect(x - 17, y, 3, 21)
    }

    function Eleven(x, y)
    {
        One(x, y)
        One(x - 17, y)
    }

    function drawLeftScore()
    {
        if (leftScore == 0)
            Zero((canvas.width / 2 ) - 50, 20)
        else if (leftScore == 1)
            One((canvas.width / 2 ) - 50, 20)
        else if (leftScore == 2)
            Two((canvas.width / 2) - 50, 20)
        else if (leftScore == 3)
            Three((canvas.width / 2) - 50, 20)
        else if (leftScore == 4)
            Four((canvas.width / 2) - 50, 20)
        else if (leftScore == 5)
            Five((canvas.width / 2) - 50, 20)
        else if (leftScore == 6)
            Six((canvas.width / 2) - 50, 20)
        else if (leftScore == 7)
            Seven((canvas.width / 2) - 50, 20)
        else if (leftScore == 8)
            Eight((canvas.width / 2) - 50, 20)
        else if (leftScore == 9)
            Nine((canvas.width / 2) - 50, 20)
        else if (leftScore == 10)
            Ten((canvas.width / 2) - 50, 20)
        else
            Eleven((canvas.width / 2) - 50, 20)


    }

    function drawRightScore()
    {
        if (rightScore == 0)
            Zero((canvas.width / 2 ) + 50, 20)
        else if (rightScore == 1)
            One((canvas.width / 2) + 50, 20)
        else if (rightScore == 2)
            Two((canvas.width / 2) + 50, 20)
        else if (rightScore == 3)
            Three((canvas.width / 2) + 50, 20)
        else if (rightScore == 4)
            Four((canvas.width / 2) + 50, 20)
        else if (rightScore == 5)
            Five((canvas.width / 2) + 50, 20)
        else if (rightScore == 6)
            Six((canvas.width / 2) + 50, 20)
        else if (rightScore == 7)
            Seven((canvas.width / 2) + 50, 20)
        else if (rightScore == 8)
            Eight((canvas.width / 2) + 50, 20)
        else if (rightScore == 9)
            Nine((canvas.width / 2) + 50, 20)
        else if (rightScore == 10)
            Ten((canvas.width / 2) + 50, 20)
        else
            Eleven((canvas.width / 2) + 50, 20)


    }

    function drawScore()
    {
        drawLeftScore()
        drawRightScore()
    }
    //THIS IS MAIN LOOP. Its starts below
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        checkStats();
        drawBall();
        drawScore();
        drawRect(canvas.width / 2, 0, 1, canvas.height)
        //bounce from sides and bounce from Pad boards
        if (y + dy < 0 || y + dy > canvas.height)
            dy = -dy
        else if ((y + dy == leftPadY || y + dy == leftPadY + padWidth) && x + dx < leftPadX + padHeight && x + dx > leftPadX)
            dy = -dy
        else if ((y + dy == leftPadY || y + dy == leftPadY + padWidth) && x + dx > rightPadX && x + dx < (rightPadX + padHeight + 2))
            dy = -dy
        //bounce from pad
        if ((x + dx < leftPadX + padHeight && x + dx > leftPadX && y > leftPadY &&
            y < leftPadY + padWidth) || (x + dx > rightPadX && x + dx < (rightPadX + padHeight + 2) &&
            y > rightPadY && y < rightPadY + padWidth))
            dx = -dx
        if (leftUpBtn) {
            leftPadY -= 7;
            if (leftPadY < 0)
                leftPadY = 0
            view.broadcastLeft(leftPadY);
        }
        else if(leftDownBtn) {
            leftPadY += 7;
            if (leftPadY + padWidth > canvas.height)
                leftPadY = canvas.height - padWidth;
            view.broadcastLeft(leftPadY);
        }

        if (rightUpBtn) {
            rightPadY -= 7;
            if (rightPadY < 0)
                rightPadY = 0
            view.broadcastRight(rightPadY);
        }
        else if (rightDownBtn) {
            rightPadY += 7;
            if (rightPadY + padWidth > canvas.height)
                rightPadY = canvas.height - padWidth;
            view.broadcastRight(rightPadY);
        }
        //view.broadcastAll(rightPadY, leftPadY);
        //view.broadcastData(rightPadX, rightPadY, leftPadX, leftPadY);
        drawLeftPad()
        drawRightPad()
        x += dx;
        y += dy;
        if (is_player_left) 
            view.broadcastBall({x: x, y: y});
    }

    function start()
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        startTime -= 10
        //view.broadcastData(rightPadX, rightPadY, leftPadX, leftPadY);
    //    drawLeftPad()
    //    drawRightPad()
        if (startTime > 2000)
            Three(CENTER_X, CENTER_Y)
        else if (startTime > 1000)
            Two(CENTER_X, CENTER_Y)
        else if (startTime > 0)
            One(CENTER_X, CENTER_Y)
        else
        {
            clearInterval(startID)
            loopID = setInterval(draw, 10); //main loop
        }
    }

    if (getRandomInt(10)  < 5) {
        change_side *= -1
        dx = -dx
    }
    //here the 'start' loop starts. the  main loop starts inside
    var startID = setInterval(start, 10);

}
