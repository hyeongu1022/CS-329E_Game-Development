//load the game
var game = new Phaser.Game(800, 500, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var player;
var platforms;
var sound;
var music;
var hp=100;
var maxhp=100;
var hppercent= hp/maxhp;
var hpText;
var enemyhp=100;
var enemyhpText;
var enemyhppercent=enemyhp/maxhp;
var lasers;
var nextFire=0;
var fireRate=500;
var hpcontainer;
var hpimage;
var hpred;
var enemyhpcontainer;
var enemyhpimage;
var enemyhpred;

    function preload(){
        //load all the sprites
        game.load.spritesheet('boy', 'assets/mcdesign(240x225).png', 240, 225);
        game.load.spritesheet('alien', 'assets/enemydesign(135x155).png', 135, 155);
        game.load.audio('sound', 'assets/sound.mp3');
        game.load.audio('music', 'assets/apocalypse.wav');
        game.load.image('laser', 'assets/fireball copy.png');
        game.load.image('background', 'assets/background copy.png');
        game.load.image('grass', 'assets/grass.png');
        game.load.image('hpcontainer','assets/hpbar copy.png');
        game.load.image('healthy','assets/hpgreen copy.png');
        game.load.image('redhealth', 'assets/hpred.png');
    }


    function create (){
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        //add background
        game.add.image(0, 0, 'background');
        //set physics to the game
        game.physics.startSystem(Phaser.Physics.ARCADE);
        grass = game.add.sprite(0, 400, 'grass');
        hpred= game.add.sprite(65,56,'redhealth');
        hpimage = game.add.sprite(65,56,'healthy');
        enemyhpred= game.add.sprite(735,56,'redhealth');
        enemyhpimage = game.add.sprite(735,56,'healthy');
        hpcontainer = game.add.sprite(50,50,'hpcontainer');
        enemyhpcontainer = game.add.sprite(750,50,'hpcontainer');
        enemyhpred.scale.setTo(-1,1);
        enemyhpimage.scale.setTo(-1,1);
        enemyhpcontainer.scale.setTo(-1,1);
        hpimage.scale.setTo(hppercent,1);
        music = game.add.audio('music');
        sound = game.add.audio('sound');
        music.play();
        
        //add ground and enable physics

        
        //add the player at position (0,0) and scale(smaller)
        player = game.add.sprite(50, 200, 'boy');
        player.scale.setTo(0.7, 0.7);
        player.anchor.setTo(0.5,0.5);
        
        //add alien
        alien = game.add.sprite(700, 200, 'alien');
        alien.scale.setTo(-0.7, 0.7);
        alien.anchor.setTo(0.5,0.5);

        //enable physics on the player
        game.physics.arcade.enable(player);
        game.physics.arcade.enable(alien);
        game.physics.arcade.enable(grass);
        grass.body.immovable = true;
        
        //enable gravity on the player
        player.body.gravity.y = 300;
        player.body.collideWorldBounds = true;
        
        //enable gravity on the player
        alien.body.gravity.y = 300;
        alien.body.collideWorldBounds = true;

        //the sprites for the boy walking
        player.animations.add('playeridle',[0,1,2,3]);
        player.animations.add('playerwalk',[4,5,6,7,8,9]); 
        player.animations.add('playerlaser',[11]);
        
        alien.animations.add('alienidle', [0,1,2,3,4,5,6,7,8]);
        alien.animations.add('alienwalk',[9,10,11,12,13,14]); 
        alien.animations.add('alienattack',[16]);
        lasers = game.add.group();
        lasers.enableBody=true;
        lasers.physicsBodyType= Phaser.Physics.ARCADE;
        lasers.createMultiple(500, 'laser');
        lasers.setAll('checkWorldBounds', 'true');
        lasers.setAll('outOfBoundsKill','true');
        lasers.scale.setTo(0.7,0.7);
        

    }


    function update(){
        music.resume();
        var collide = game.physics.arcade.collide([player, alien], grass);
        //collisions between ground, platform, and players

        var hitPlayer = game.physics.arcade.overlap(player, alien, takeDamage);
        var hitEnemy = game.physics.arcade.overlap(lasers, alien, enemyDamage);
        //set velocity of player
        var speed = 4;
        var alienspeed=3;
        
        //move the player according to keyboard arrows
        if(game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
            player.scale.setTo(0.7, 0.7);
            player.body.velocity.x = 300;
            player.animations.play('playerwalk', 15, true);
        }
        else if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
            //negative sign makes player face opp. direction
            player.scale.setTo(-0.7, 0.7);
            player.body.velocity.x = -300;
            player.animations.play('playerwalk', 15, true);
        }
        else{
            //when player is not moving set to idle sprite
            player.animations.play('playeridle',9, true);
            player.body.velocity.x=0;
            
        }
        if(game.input.keyboard.isDown(Phaser.Keyboard.UP) && player.body.touching.down){
            player.body.velocity.y=-200;
        }
        if(game.input.keyboard.isDown(Phaser.Keyboard.A))
        {   
            player.animations.stop('playeridle');
            player.animations.play('playerlaser', 9,true);
            laserFire();
        }
        if(player.x> alien.x){
            alien.scale.setTo(0.7,0.7);
        } else{
            alien.scale.setTo(-0.7,0.7);
        }
        if(Math.abs(player.x - alien.x) <= 300){
            if(alien.x > player.x){
                alien.body.velocity.x = -200;
            }else if(alien.x < player.x){
                alien.body.velocity.x = 200;
            }else{
                alien.body.velocity.x=0;
            }
        }
        if(Math.abs(player.x - alien.x) <= 150 ){
            alien.animations.play('alienattack', 9, true);
        }else if(Math.abs(player.x - alien.x) <= 300){
            alien.animations.play('alienwalk',9, true);
        }else{
            alien.animations.play('alienidle',9, true);
        }
        if (hp==0){
            console.log('gameover');
            enemyhpText.text= '';
            hpText.text='YOU LOST!';
            game.paused=true;
            
        }
        if(enemyhp==0){
            console.log('You win!');
            enemyhpText.text= '';
            hpText.text='YOU WIN!';
            game.paused=true;
        }
        

    }
    function takeDamage(){
        hp-=10;
        hppercent=hp/maxhp;
        hpimage.scale.setTo(hppercent,1);
        hpred.scale.setTo(hppercent,1);
        if(hppercent<0.4){
            hpimage.scale.setTo(0,0);
        }
        if(alien.body.x> player.body.x){
            if(player.body.x<50){
                player.body.x=600;
            }else{
                player.body.x-=300;
            }
        
        }else if (alien.body.x< player.body.x){
            if(player.body.x>600){
                player.body.x=200;
            }else{
                player.body.x+=300;
            }
        
        }
    }
    function laserFire(){
        
        if(game.time.now >nextFire){
            nextFire = game.time.now + fireRate;
            var laser = lasers.getFirstDead();
            sound.play();
            laser.anchor.setTo(0.5,0.5);
            if(player.body.x<alien.body.x){
                laser.reset(player.body.x+310, player.body.y+220);
                laser.body.velocity.x= 5000;
            } else{
                laser.scale.setTo(-0.7,0.7);
                laser.reset(player.body.x+200, player.body.y+220);
                laser.body.velocity.x= -5000;
            }
            
        }
    }
    function enemyDamage(){
        enemyhp-=1;
        enemyhppercent=enemyhp/maxhp;
        enemyhpimage.scale.setTo(-enemyhppercent,1);
        enemyhpred.scale.setTo(-enemyhppercent,1);
        if(enemyhppercent<0.4){
            enemyhpimage.scale.setTo(0,0);
        }
    }


