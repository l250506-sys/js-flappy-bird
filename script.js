const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;


let lastTime = 0;

class Game{
    constructor(canvas){
        this.width = canvas.width;
        this.height = canvas.height;
        this.player = new Player(this);
        this.input = new InputHandler();
        this.background = new Background(this);
        this.pipes = [];
        this.floatingeMessages = [];
        this.pipeTimer = 0;
        this.pipeInterval = 1000;
        this.gameOver = false;
        this.score = 0;
        this.delCount = 0;
        this.passed = 0;
        this.scoreBoxX = 10;
        this.scoreBoxY = 30;
        this.chotaTime = false;
        this.jumpSound = new Audio();
        this.jumpSound.src = "ytmp3free (mp3cut.net).mp3";
        this.chotaSound = new Audio();
        this.chotaSound.src = "ytmp3free (mp3cut.net) (1).mp3";
        this.timer = 0;
        this.maxTimer  = 1000;
    }
    update(deltaTime){

        if(this.timer > this.maxTimer){
            if(!this.chotaTime && Math.random()> 0.95){
                this.chotaSound.currentTime = 0;
                this.chotaTime = true;
            }
            this.timer = 0;
        }else{
            this.timer += deltaTime
        }
        

        if(this.chotaTime && this.chotaSound.paused){
            this.chotaSound.play();
            this.floatingeMessages.push(new FloatingMessage(this,this.player.x,this.player.y,-100,-100,30,"ITS CHOTA TIME !!!!!","red"))
        }

        if(this.chotaTime && this.chotaSound.currentTime >= 10){
            this.chotaTime = false;
            this.chotaSound.pause();
            this.chotaSound.currentTime = 0;
        }


        this.player.update(deltaTime,this.input.keys);

        this.addPipes(deltaTime);

        this.pipes.forEach((pipe)=>{
            pipe.update();

            if((this.player.x > pipe.x + pipe.width) && !pipe.isPassed){
                pipe.isPassed = true;
                this.passed+= 1;
                this.floatingeMessages.push(new FloatingMessage(this,this.player.x,this.player.y,this.scoreBoxX,this.scoreBoxY,15,"+1 Big brand chota","black"))
            }

            this.collision(pipe);
        })

        this.floatingeMessages.forEach((msg)=>{
            msg.update();
        })

        this.pipes = this.pipes.filter((pipe)=> pipe.x > -pipe.width);
        this.floatingeMessages = this.floatingeMessages.filter((msg) => !msg.markedForDeletion);

        this.outOfBounds();

        

        
    }
    draw(context){
        this.background.draw(context);

        this.pipes.forEach((pipe)=>{
            pipe.draw(context);
        })

        this.player.draw(context);

        context.font = "30px Arial";
        context.fillStyle = "white";
        context.fillText("Score: " + this.passed , this.scoreBoxX,this.scoreBoxY);
        context.fillStyle = "black";
        context.fillText("Score: " + this.passed, 12,32);

        this.floatingeMessages.forEach((msg)=>{
            msg.draw(context);
        })
        if(this.gameOver){
            context.font = "30px Arial";
            context.fillStyle = "red";
            context.fillText("Ja Chota Lul", this.width/2 - 80,this.height/2 - 30);
        }
    }
    addPipes(deltaTime){
        if(this.pipeTimer > this.pipeInterval){
            this.pipes.push(new Pipe(this));
            this.pipeTimer = 0;
            this.pipeInterval = Math.random()*500 +700
        }else{
            this.pipeTimer += deltaTime;
        }
    }
    collision(pipe){
        if(this.chotaTime) {
            return
        } 
        if((this.player.x + this.player.width > pipe.x &&   
            this.player.x  < pipe.x + pipe.width &&
            this.player.y + this.player.height > pipe.y) ||
            (this.player.x + this.player.width > pipe.x &&
            this.player.x < pipe.x + pipe.width &&
            this.player.y < pipe.height2 &&
            this.player.y + this.player.height > 0)
        ){
            this.gameOver = true;
        }
    }
    outOfBounds(){
        if(this.player.y > this.height || this.player.y + this.player.height < 0  ){
                this.gameOver = true;
        }
    }
}


class Player{
    constructor(game){
        this.game = game;
        this.spriteWidth = 16;
        this.spriteHeight = 16;
        this.width = this.spriteWidth *2;
        this.height = this.spriteHeight * 2;
        this.y = game.height/2 - this.height/2;
        this.x = game.width/2 - this.width/2;
        this.frameX = 0;
        this.maxFrame = 2;
        this.flapTimer = 0;
        this.flapInterval = 30;
        this.jumpState = false;
        this.vy = 0;
        this.gravity = 0.3;
        this.image = document.getElementById("player");
    }
    update(deltaTime,input){
        if(input.includes("Up") && !this.jumpState){
            this.jumpState = true;
            this.vy = -6;
            if (this.game.jumpSound.paused) {
                this.game.jumpSound.currentTime = 0;
                this.game.jumpSound.play();
            }

            
        }

        if(this.jumpState){
            this.startJump(deltaTime)
        }

        this.y += this.vy;
        this.vy += this.gravity;
    }
    draw(context){
        context.drawImage(this.image,this.spriteWidth*this.frameX,0,this.spriteWidth,this.spriteHeight,this.x,this.y,this.width,this.height);
    }
    startJump(deltaTime){
        if (this.flapTimer > this.flapInterval){
            if(this.frameX <= this.maxFrame){
                this.frameX++
            }else{
                this.frameX = 0;
                this.jumpState = false;
            }
            this.flapTimer = 0;
        }else{
            this.flapTimer += deltaTime;
        }
    }
}

class InputHandler{
    constructor(){
        this.keys = [];
        window.addEventListener("keydown",(e) =>  {
            if(e.key === " "  && this.keys.indexOf("Up") === -1){
                this.keys.push("Up");
            }
        })
        window.addEventListener("keyup",(e)=>{
            if(e.key === " "){
                this.keys.splice(this.keys.indexOf("Up"),1);
            }
        })
    }
}

class Background{
    constructor(game){
        this.game = game;
        this.image = document.getElementById("background");
        this.chota = document.getElementById("chota");
        this.x = 0;
        this.y=0;
        this.width = 256;
        this.height = 256;
    }
    draw(context){
        if(!this.game.chotaTime){
            context.drawImage(this.image,0,0,this.width,this.height,this.x,this.y,this.game.width,this.game.height);
        }else{
            context.drawImage(this.chota,this.x,this.y,this.game.width,this.game.height)
        }
        
    }
}

class Pipe{
    constructor(game){
        this.game = game;
        this.x = game.width  * 2;
        this.spriteWidth = 32;
        this.spriteHeight = 64;
        this.width = 100;
        this.heightMultiplier = 80;
        this.heightAddition = 120;
        this.height1 = Math.random() *this.heightMultiplier +this.heightAddition;
        this.height2 = Math.random() *this.heightMultiplier +this.heightAddition;;
        this.y = this.game.height - this.height1;
        this.sy = 16;
        this.speed = 5;
        this.isPassed = false; 
        this.image = document.getElementById("pipe");
    }
    update(){
        this.x -= this.speed;
    }
    draw(context){
        context.drawImage(this.image,0,0,this.spriteWidth,this.spriteHeight,this.x,this.y,this.width,this.height1);
        context.drawImage(this.image,0,this.sy,this.spriteWidth,this.spriteHeight,this.x,0,this.width,this.height2)
    }
}

class FloatingMessage{
    constructor(game,x,y,targetX,targetY,size,text,color){
        this.game = game;
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.timer = 0;
        this.speedX = (this.x - this.targetX)/40;
        this.speedY = (this.y - this.targetY)/40; 
        this.markedForDeletion = false;
        this.size = size;
        this.text = text;
        this.color = color
    }
    update(){
        this.x -= this.speedX;
        this.y -= this.speedY;

        if(this.x <= this.targetX || this.y <= this.targetY){
            this.markedForDeletion = true;
        }
    }
    draw(context){
        context.font = this.size + "px " + "Arial";
        context.fillStyle = this.color;
        context.fillText(this.text,this.x,this.y);
    }
}



const game = new Game(canvas);


function animate(timeStamp){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    game.update(deltaTime);
    game.draw(ctx);

    if(game.gameOver){
        game.chotaSound.currentTime = 0;
        game.chotaSound.play();
    }

    if(!game.gameOver) requestAnimationFrame(animate);
}

animate(0);