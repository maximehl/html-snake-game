function updateRange(newVal){
    $("#rangeVal").html(newVal);
}

var width; //number of squares wide
var scale;
var board;
var xChange = 1;
var yChange = 0;
var direc = 1;
var keyPressQueue = [];
var snakeCoords = [];
var interval = 250;
var foodX;
var foodY;
var foodEl = $("<div id='food'></div>");
var boardEl;
$(document).ready(function(){
    boardEl = $("#board");
    $("#container").hide();
    $(document).keydown(function(e){
        switch(e.keyCode){
            case 39: //right
                if(!(keyPressQueue[keyPressQueue.length-1]===1||keyPressQueue[keyPressQueue.length-1]===3||(keyPressQueue.length===0&&(direc===3||direc===1)))){
                    keyPressQueue.push(1);
                }
                break;
            case 40: //down
                if(!(keyPressQueue[keyPressQueue.length-1]===2||keyPressQueue[keyPressQueue.length-1]===4||(keyPressQueue.length===0&&(direc===4||direc===2)))){
                    keyPressQueue.push(2);
                }
                break;
            case 37: //left
                if(!(keyPressQueue[keyPressQueue.length-1]===3||keyPressQueue[keyPressQueue.length-1]===1||(keyPressQueue.length===0&&(direc===1||direc===3)))){
                    keyPressQueue.push(3);
                }
                break;
            case 38: //up
                if(!(keyPressQueue[keyPressQueue.length-1]===4||keyPressQueue[keyPressQueue.length-1]===2||(keyPressQueue.length===0&&(direc===2||direc===4)))){
                    keyPressQueue.push(4);
                }
                break;
        }
    });
});

function loadGame(){
    $("#container").show();
    board = [[]];
    xChange = 1;
    yChange = 0;
    direc = 1;
    keyPressQueue = [];
    snakeCoords = [];
    boardEl.children().remove();
    $("#score").html("<b>0 points</b>");
    width = parseInt($("#rangeVal").html());
    interval = 350-(width*4);
    scale = $(window).height()-106-47;
    //tagHere: check the window width as well
    boardEl.css({"width":scale, "height": scale});
    scale = scale/(width+2);
    foodEl.css({"width":0.8*scale, "height": 0.8*scale, "margin":0.1*scale});

    var i;
    for(i = 0; i<width+2; i++){
        board[0].push(1);
        boardEl.append($("<div class='pixel white' id='yx00" + doubleCharNum(i) + "'></div>"));
    }
    for(i = 1; i<width+1; i++){
        //all the middle rows
        board.push([1]);
        boardEl.append($("<div class='pixel white' id='yx" + doubleCharNum(i) + "00'></div>"));
        for(var n = 0; n<width; n++){
            board[i].push(0);
            boardEl.append($("<div class='pixel' id='yx" + doubleCharNum(i) + "" + doubleCharNum(n+1) + "'></div>"));
        }
        board[i].push(1);
        boardEl.append($("<div class='pixel white' id='yx" + doubleCharNum(i) + "" + doubleCharNum(width+2) + "'></div>"));
    }
    board.push([]);
    for(i = 0; i<width+2; i++){
        board[width+1].push(1);
        boardEl.append($("<div class='pixel white' id='yx" + doubleCharNum(width) + "" + doubleCharNum(i) + "'></div>"));
    }
    //set up the snake
    var middle = Math.ceil(width/2);
    foodY = middle;
    for(i = 2; i<5; i++){
        board[middle][i] = 1;
        snakeCoords.push([i, middle]);
        addBody(1, i, middle);
        //findPix(i, middle).addClass("snake");
    }

    //first food
    board[middle][width-3] = 2;
    foodX = width-3;
    findPix(width-3, middle).append(foodEl);
    oscillateFood();

    $(".pixel").css({"width":scale, "height": scale});
    //console.log(board);
    runGame();
}

function doubleCharNum(inNum){
    if(inNum<10){
        return "0" + inNum;
    }
    return inNum;
}

function findPix(pixX, pixY){
    return $("#yx" + doubleCharNum(pixY) + "" + doubleCharNum(pixX));
}

function addCorner(curDirec, newDirec, xCoord, yCoord){
    var corner = $("<div class='circle snake'></div>"); //data-new-direc='" + ((newDirec+1)%4)+1 + "'
    var hidden = $("<div class='circle'></div>");
    corner.css({"width":1.8*scale, "height": 1.8*scale, "margin": 0.1*scale});
    hidden.css({"width":0.2*scale, "height": 0.2*scale, "margin": 0.9*scale, "background-color":"lightgrey"});
    if(curDirec===1){
        //right
        if(newDirec===2){
            //down
            corner.css({"left":-1*scale});
            hidden.css({"left":-1*scale, "top": -1.9*scale});
        }else{
            //up
            corner.css({"left":-1*scale, "top":-1*scale});
            hidden.css({"left":-1*scale, "top": -2.9*scale});
        }
    }else if(curDirec===2){
        //down
        if(newDirec===1){
            //right
            corner.css({"top":-1*scale});
            hidden.css({"top": -2.9*scale});
        }else{
            //left
            corner.css({"left":-1*scale, "top":-1*scale});
            hidden.css({"left":-1*scale, "top": -2.9*scale});
        }
    }else if(curDirec===3){
        //left
        if(newDirec===2){
            //down
            hidden.css({"top": -1.9*scale});
        }else{
            //up
            corner.css({"top":-1*scale});
            hidden.css({"top": -2.9*scale});
        }
    }else if(curDirec===4){
        //up
        if(newDirec===1){
            //right
            hidden.css({"top": -1.9*scale});
        }else{
            //left
            corner.css({"left":-1*scale});
            hidden.css({"left":-1*scale, "top": -1.9*scale});
        }
    }
    findPix(xCoord,yCoord).append(corner, hidden);
}

function addBody(direc, xCoord, yCoord){
    var sBody = $("<div class='snake'></div>");
    if(direc===1||direc===3){
        //left-right
        sBody.css({"width": scale, "height": 0.8*scale, "margin": 0.1*scale+"px 0px"});
    }else{
        //up-down
        sBody.css({"width": 0.8*scale, "height": scale, "margin": "0px "+0.1*scale+"px"});
    }
    findPix(xCoord,yCoord).append(sBody);
}

function addTail(direc, xCoord, yCoord){
    //console.log(direc);
    var tail = $("<div class='snake'></div>");
    if(direc===1||direc===3){
        //left-right
        tail.css({"width": scale, "height": 0.8*scale, "margin": 0.1*scale+"px 0px", "display":"inline-block"});
        if(direc===1){
            //right
            tail.css({"border-radius": "00% 100% 100% 00% / 50% 50% 50% 50%"});
        }else{
            //left
            tail.css({"border-radius": "100% 00% 00% 100% / 50% 50% 50% 50%"});
        }
    }else{
        //up-down
        tail.css({"width": 0.8*scale, "height": scale, "margin": "0px "+0.1*scale+"px"});
        if(direc===4){
            //up
            tail.css({"border-radius": "50% 50% 50% 50% / 100% 100% 00% 00%"});
        }else{
            //down
            tail.css({"border-radius": "50% 50% 50% 50% / 00% 00% 100% 100%"});
        }
    }
    var fullBlock = $("<div id='tail" + doubleCharNum(yCoord) + doubleCharNum(xCoord) + "'></div>");
    fullBlock.css({"position": "relative"/*, "background-color":"red"*/});
    if(direc===1){
        fullBlock.css({"top": 0, "left":0/*-1*scale*/, "width":2*scale});
    }else if(direc===2){
        if(findPix(xCoord,yCoord).find(".circle").length>0){
            fullBlock.css({"top": -2*scale, "left":0});
        }else{
            fullBlock.css({"top": 0/*-1*scale*/, "left":0});
        }
    }else if(direc===3){
        fullBlock.css({"top": 0, "left":-1*scale, "width":2*scale});
    }else{
        fullBlock.css({"top": -1*scale, "left":0});
    }
    fullBlock.css("transition", (interval/500) + "s linear");
    findPix(xCoord,yCoord).append(fullBlock);
    fullBlock.css("transition-duration"); //this doesn't work if you don't check it
    //tail.css("left", -1*scale);
    var sBody = $("<div class='snake'></div>");
    if(direc===1||direc===3){
        //left-right
        sBody.css({"width": scale, "height": 0.8*scale, "margin": 0.1*scale+"px 0px", "display":"inline-block"});
    }else{
        //up-down
        sBody.css({"width": 0.8*scale, "height": scale, "margin": "0px "+0.1*scale+"px"});
    }
    if(direc===3||direc===4){
        $("#tail" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).append(tail, sBody);
    }else{
        $("#tail" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).append(sBody, tail);
    }

    if(direc===1){
        $("#tail" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).css("left", -2*scale);
    }else if(direc===2){
        if(findPix(xCoord,yCoord).find(".circle").length>0){
            $("#tail" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).css("top", -4*scale);
        }else{
            $("#tail" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).css("top", -2*scale);
        }
    }else if(direc===3){
        $("#tail" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).css("left", 1*scale);
    }else{
        $("#tail" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).css("top", 1*scale);
    }
    if(findPix(xCoord,yCoord).find(".circle").length>0){
        setTimeout(function(){
            findPix(xCoord,yCoord).find("> .snake").remove();
            //addTail(findPix(xCoord,yCoord).find("> .circle .snake").attr("data-new-direc"), xCoord, yCoord);
        }, interval);
    }
    setTimeout(function(){
        findPix(xCoord, yCoord).children().remove();
        //fullBlock.remove();
    }, 2*interval);
}

function addHead(direc, xCoord, yCoord){
    //console.log(direc);
    var head = $("<div class='snake'></div>");
    if(direc===1||direc===3){
        //left-right
        head.css({"width": scale, "height": 0.8*scale, "margin": 0.1*scale+"px 0px", "display":"inline-block"});
        if(direc===1){
            //right
            head.css({"border-radius": "00% 100% 100% 00% / 50% 50% 50% 50%"});
        }else{
            //left
            head.css({"border-radius": "100% 00% 00% 100% / 50% 50% 50% 50%"});
        }
    }else{
        //up-down
        head.css({"width": 0.8*scale, "height": scale, "margin": "0px "+0.1*scale+"px"});
        if(direc===4){
            //up
            head.css({"border-radius": "50% 50% 50% 50% / 100% 100% 00% 00%"});
        }else{
            //down
            head.css({"border-radius": "50% 50% 50% 50% / 00% 00% 100% 100%"});
        }
    }
    var fullBlock = $("<div id='head" + doubleCharNum(yCoord) + doubleCharNum(xCoord) + "'></div>");
    fullBlock.css({"position": "relative"/*, "background-color":"red"*/});
    if(direc===1){
        fullBlock.css({"top": 0, "left":-2*scale, "width":2*scale}); //tagHere figure out these values
    }else if(direc===2){
        fullBlock.css({"top": -2*scale, "left":0});
    }else if(direc===3){
        fullBlock.css({"top": 0, "left":1*scale, "width":2*scale});
    }else{
        fullBlock.css({"top": 1*scale, "left":0});
    }
    fullBlock.css("transition", (interval/500) + "s linear");
    findPix(xCoord,yCoord).append(fullBlock);
    fullBlock.css("transition-duration"); //this doesn't work if you don't check it
    //head.css("left", -1*scale);
    var sBody = $("<div class='snake'></div>");
    if(direc===1||direc===3){
        //left-right
        sBody.css({"width": scale, "height": 0.8*scale, "margin": 0.1*scale+"px 0px", "display":"inline-block"});
    }else{
        //up-down
        sBody.css({"width": 0.8*scale, "height": scale, "margin": "0px "+0.1*scale+"px"});
    }
    if(direc===3||direc===4){
        $("#head" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).append(head, sBody);
    }else{
        $("#head" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).append(sBody, head);
    }

    //tagHere: might cause errors, for up/left
    if(direc===1){
        $("#head" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).css("left", 0/*1*scale*/);
    }else if(direc===2){
        $("#head" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).css("top", 0/**scale*/);
    }else if(direc===3){
        $("#head" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).css("left", -1*scale);
    }else{
        $("#head" + doubleCharNum(yCoord) + doubleCharNum(xCoord)).css("top", -1*scale);
    }
    setTimeout(function(){
        if(findPix(xCoord,yCoord).children().length===1){
            addBody(direc, xCoord, yCoord);
        }
        fullBlock.remove();
        //setTimeout(function(){fullBlock.remove()}, 2*interval);
    }, 2*interval);
}

function runGame(){
    if(keyPressQueue.length>0){
        switch(keyPressQueue[0]){
            case 1:
                xChange = 1;
                yChange = 0;
                break;
            case 2:
                xChange = 0;
                yChange = 1;
                break;
            case 3:
                xChange = -1;
                yChange = 0;
                break;
            case 4:
                xChange = 0;
                yChange = -1;
                break;
        }
    }
    var nextPix = board[snakeCoords[snakeCoords.length-1][1]+yChange][snakeCoords[snakeCoords.length-1][0]+xChange];
    if(nextPix===2){
        //eats the food
        foodEl.remove();
        $("#score").html("<b>" + (snakeCoords.length-2) + " points</b>");
        interval-=3*width/(snakeCoords.length);
        foodX=Math.floor(Math.random()*width)+1;
        foodY=Math.floor(Math.random()*width)+1;
        while(board[foodY][foodX]>0){
            foodX=Math.floor(Math.random()*width)+1;
            foodY=Math.floor(Math.random()*width)+1;
        }
        board[foodY][foodX] = 2;
        findPix(foodX, foodY).append(foodEl);
    }else if(nextPix!==1){
        if(findPix(snakeCoords[0][0], snakeCoords[0][1]).children().length===1){
            findPix(snakeCoords[0][0], snakeCoords[0][1]).children().remove();
        }//tagHere
        //find the direction
        if(snakeCoords[0][0]-snakeCoords[1][0]===0){
            //x-coord stays the same, so y-coord is changing
            if(snakeCoords[0][1]>snakeCoords[1][1]){
                //going down
                addTail(2, snakeCoords[0][0], snakeCoords[0][1]);
            }else{
                //going up
                addTail(4, snakeCoords[0][0], snakeCoords[0][1]);
            }
            //tagHere: deal with the corners
            /*if(snakeCoords[1][0]-snakeCoords[2][0]===0){
                //no corner
                addTail(3, snakeCoords[0][0], snakeCoords[0][1]);
            }else{
                //tagHere: this is a corner
            }*/
        }else{
            if(snakeCoords[0][1]-snakeCoords[1][1]===0){
                //y-coord stays the same, so x-coord is changing
                if(snakeCoords[0][0]>snakeCoords[1][0]){
                    //going right
                    addTail(1, snakeCoords[0][0], snakeCoords[0][1]);
                }else {
                    //going left
                    addTail(3, snakeCoords[0][0], snakeCoords[0][1]);
                }
            }
        }

        board[snakeCoords[0][1]][snakeCoords[0][0]]=0;
        //delete tail coordinate
        snakeCoords.splice(0,1);
    }
    if(nextPix===1){
        //game over
        findPix(snakeCoords[snakeCoords.length-1][0], snakeCoords[snakeCoords.length-1][1]).css("background-color", "red");
        if(keyPressQueue.length>0){
            //add corner
            findPix(snakeCoords[snakeCoords.length - 1][0], snakeCoords[snakeCoords.length - 1][1]).children().remove();
            addCorner(direc, keyPressQueue[0], snakeCoords[snakeCoords.length - 1][0], snakeCoords[snakeCoords.length - 1][1]);
            direc = keyPressQueue[0];
            keyPressQueue.splice(0, 1);
        }
        return false;
    }else{
        if(keyPressQueue.length>0){
            //add corner
            findPix(snakeCoords[snakeCoords.length-1][0], snakeCoords[snakeCoords.length-1][1]).children().remove();
            addCorner(direc, keyPressQueue[0], snakeCoords[snakeCoords.length-1][0], snakeCoords[snakeCoords.length-1][1]);
            direc = keyPressQueue[0];
            keyPressQueue.splice(0,1);
            //addBody(direc, snakeCoords[snakeCoords.length-1][0]+xChange, snakeCoords[snakeCoords.length-1][1]+yChange);
            addHead(direc, snakeCoords[snakeCoords.length-1][0]+xChange, snakeCoords[snakeCoords.length-1][1]+yChange);
        }else{
            //add ordinary snake body, with current direction
            //addBody(direc, snakeCoords[snakeCoords.length-1][0]+xChange, snakeCoords[snakeCoords.length-1][1]+yChange);
            addHead(direc, snakeCoords[snakeCoords.length-1][0]+xChange, snakeCoords[snakeCoords.length-1][1]+yChange);
        }
        //findPix(snakeCoords[snakeCoords.length-1][0]+xChange, snakeCoords[snakeCoords.length-1][1]+yChange).toggleClass("snake");
        board[snakeCoords[snakeCoords.length-1][1]+yChange][snakeCoords[snakeCoords.length-1][0]+xChange]=1;
        snakeCoords.push([snakeCoords[snakeCoords.length-1][0]+xChange, snakeCoords[snakeCoords.length-1][1]+yChange]);
        setTimeout(function(){runGame()}, interval);
    }
}

function oscillateFood(){
    if(findPix(foodX,foodY).children().length===0){
        findPix(foodX,foodY).append(foodEl);
    }
    $("#food").css({"transition":"0.5s", "width":0.6*scale, "height":0.6*scale, "margin": 0.2*scale});
    setTimeout(function(){
        $("#food").css({"width":0.8*scale, "height":0.8*scale, "margin": 0.1*scale});
        setTimeout(function(){
            oscillateFood();
        }, 500);
    }, 500);
}
/*
tasks:
• corners going up from left are weird, and up from right
• check for tagHere
 */