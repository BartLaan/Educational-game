 // function preload() {

    //     // REPLACE THIS WITH SPRITESHEET
    //     this.load.image('background', 'assets/achtergrond.jpg');
    //     this.load.image('als', 'assets/als.png');
    //     this.load.image('anders', 'assets/anders.png');
    //     this.load.image('stap', 'assets/stap.png');
    //     this.load.image('draailinks', 'assets/draai-links.png');
    //     this.load.image('draailinks-crnt', 'assets/draai-links-crnt.png');
    //     this.load.image('draairechts', 'assets/draai-rechts.png');
    //     this.load.image('draairechts-crnt', 'assets/draai-rechts-crnt.png');
    //     this.load.image('graden', 'assets/draai-graden.png');
    //     this.load.image('herhaal-x', 'assets/herhaal-x.png');
    //     this.load.image('herhaal', 'assets/herhaal.png');
    //     this.load.image('open', 'assets/open.jpg');
    //     this.load.image('opnieuw', 'assets/opnieuw.png');
    //     this.load.image('sluit', 'assets/sluit.jpg');
    //     this.load.image('uitvoeren', 'assets/uitvoeren.png');
    //     this.load.image('oeps', 'assets/oeps.jpg');
    //     this.load.image('ossie', 'assets/ossie.png');
    //     this.load.image('vraagteken', 'assets/vraagteken.png');

    //     this.load.image('0', 'assets/0.png');
    //     this.load.image('one', 'assets/1.png');
    //     this.load.image('2', 'assets/2.png');
    //     this.load.image('3', 'assets/3.png');
    //     this.load.image('4', 'assets/4.png');
    //     this.load.image('5', 'assets/5.png');
    //     this.load.image('6', 'assets/6.png');
    //     this.load.image('7', 'assets/7.png');
    //     this.load.image('8', 'assets/8.png');
    //     this.load.image('nine', 'assets/9.png');
    //     this.load.image('slash', 'assets/slash.png');
    // }

    // function create() {

    //     // everything is based of the window height, based on the assumpation that all screens it will be played on have width space to spare
    //     var height = window.innerHeight
    //     var width = window.innerHeight * 1.33333333333
    //     var scalingfactor = width / 1024
    //     var timedEvent;

    //     // this was done by trial and error, sorry bout that
    //     var stepsize_horizontal = window.innerHeight / 9.9
    //     var stepsize_vertical = window.innerHeight / 9.9       
        
    //     // add all assets to the game world

    //     var background = this.add.image(width/2, height/2, 'background')
    //     // var background = this.add.image(0, 0, 'background').setOrigin(0, 0)
    //     background.setDisplaySize(width, height)
        
        
    //     var player = this.add.sprite(0, 0, 'ossie')
    //     playerscaling = 0.15 * scalingfactor
    //     player.setDisplaySize(player.width * playerscaling, player.height * playerscaling)
    //     player.angle -= 20
    //     player.data = {"orientation": "right"}
    //     player.gridposition = {"x":1, "y":1}

    //     var open = this.add.sprite(0, 0, "open")
    //     openscaling = 1.0 * scalingfactor
    //     open.setDisplaySize(open.width * openscaling, open.height * openscaling)

    //     var sluit = this.add.sprite(0, 0, "sluit")
    //     sluitscaling = 1.0 * scalingfactor
    //     sluit.setDisplaySize(sluit.width * sluitscaling, sluit.height * sluitscaling)
        
    //     for (var i = 0; i < 10; i++) {
    //         var draailinks = this.add.sprite(0, 0, "draailinks")
    //         draailinksscaling = 1.0 * scalingfactor
    //         draailinks.setDisplaySize(draailinks.width * draailinksscaling, draailinks.height * draailinksscaling)
    //         Phaser.Display.Align.In.Center(draailinks, background);
    //         draailinks.x += width/7 
    //         draailinks.y += height/ 3.7
    //         draailinks.data = {"command":"draailinks", "id":i}
    //         draailinks.setOrigin(0)
    //         draailinks.setInteractive()
    //         this.input.setDraggable(draailinks)
    //     }
        
    //     for (var i = 0; i < 10; i++) {
    //         var draairechts = this.add.sprite(0, 0, "draairechts")
    //         draairechtsscaling = 1.0 * scalingfactor
    //         draairechts.setDisplaySize(draairechts.width * draairechtsscaling, draairechts.height * draairechtsscaling)
    //         Phaser.Display.Align.In.Center(draairechts, background);
    //         draairechts.x += width/3.8
    //         draairechts.y += height/ 3.95
    //         draairechts.data = {"command":"draairechts", "id":i}
    //         draairechts.setOrigin(0)
    //         draairechts.setInteractive()
    //         this.input.setDraggable(draairechts)
    //     }
        
    //     for (var i = 0; i < 10; i++) {
    //         var stap = this.add.sprite(0, 0, "stap")
    //         stapscaling = 1.0 * scalingfactor
    //         stap.setDisplaySize(stap.width * stapscaling, stap.height * stapscaling)
    //         Phaser.Display.Align.In.Center(stap, background);
    //         stap.x += width/5.9
    //         stap.y += height/4.5
    //         stap.data = {"command":"stap", "id":i}
    //         stap.setOrigin(0)
    //         stap.setInteractive()
    //         this.input.setDraggable(stap)
    //     }

    //     var uitvoeren = this.add.sprite(0, 0, "uitvoeren")
    //     uitvoerenscaling = 1.0 * scalingfactor
    //     uitvoeren.setDisplaySize(uitvoeren.width * uitvoerenscaling, uitvoeren.height * uitvoerenscaling)

    //     var opnieuw = this.add.sprite(0, 0, "opnieuw")
    //     opnieuwscaling = 0.95 * scalingfactor
    //     opnieuw.setDisplaySize(opnieuw.width * opnieuwscaling, opnieuw.height * opnieuwscaling)

    //     var vraagteken = this.add.sprite(0, 0, "vraagteken")
    //     vraagtekenscaling = 1.1 * scalingfactor
    //     vraagteken.setDisplaySize(vraagteken.width * vraagtekenscaling, vraagteken.height * vraagtekenscaling)
        
    //     var slash = this.add.sprite(0, 0, "slash")
    //     slashscaling = 1.1 * scalingfactor
    //     slash.setDisplaySize(slash.width * slashscaling, slash.height * slashscaling)

    //     var one = this.add.sprite(0, 0, "one")
    //     onescaling = 1.1 * scalingfactor
    //     one.setDisplaySize(one.width * onescaling, one.height * onescaling)

    //     var nine = this.add.sprite(0, 0, "nine")
    //     ninescaling = 1.1 * scalingfactor
    //     nine.setDisplaySize(nine.width * ninescaling, nine.height * ninescaling)

    //     var levelcount = this.add.sprite(0, 0, "one")
    //     levelcountscaling = 1.1 * scalingfactor
    //     levelcount.setDisplaySize(levelcount.width * levelcountscaling, levelcount.height * levelcountscaling)

    //     Phaser.Display.Align.In.Center(background, this.add.zone(window.innerWidth / 2, window.innerHeight /2, window.innerWidth, window.innerHeight));
    //     Phaser.Display.Align.In.Center(player, background);
    //     Phaser.Display.Align.In.Center(sluit, background);
    //     Phaser.Display.Align.In.Center(open, background);
    //     // Phaser.Display.Align.In.Center(draailinks, background);
    //     // Phaser.Display.Align.In.Center(draairechts, background);
    //     // Phaser.Display.Align.In.Center(stap, background);
    //     Phaser.Display.Align.In.Center(uitvoeren, background);
    //     Phaser.Display.Align.In.Center(opnieuw, background);
    //     Phaser.Display.Align.In.Center(vraagteken, background);
    //     Phaser.Display.Align.In.Center(slash, background);
    //     Phaser.Display.Align.In.Center(one, background);
    //     Phaser.Display.Align.In.Center(nine, background);
    //     Phaser.Display.Align.In.Center(levelcount, background);

    //     // REPOSITIONING OF ASSETS
    //     opnieuw.x -= width/ 14
    //     opnieuw.y += height/ 3.2

    //     uitvoeren.x -= width/ 7.2
    //     uitvoeren.y += height/ 6.4

    //     open.x += width/5
    //     open.y += height/ 6.5
    //     open.data = {"command":"open"}

    //     sluit.x += width/3.3
    //     sluit.y += height/ 6.5
    //     sluit.data = {"command":"sluit"}

    //     // draailinks.x += width/7 
    //     // draailinks.y += height/ 3.7
    //     // draailinks.data = {"command":"draailinks"}

    //     // draairechts.x += width/3.8
    //     // draairechts.y += height/ 3.95
    //     // draairechts.data = {"command":"draairechts"}

    //     // stap.x += width/5.9
    //     // stap.y += height/4.5
    //     // stap.data = {"command":"stap"}

    //     slash.x -= width/ 20
    //     slash.y += height/ 6.4

    //     nine.x -= width/ 120
    //     nine.y += height/ 6.4

    //     one.x -= width/ 15
    //     one.y += height/ 6.4

    //     levelcount.x -= width/ 30
    //     levelcount.y += height/ 6.4
        
    //     open.setOrigin(0)
    //     sluit.setOrigin(0)
    //     // draailinks.setOrigin(0)
    //     // draairechts.setOrigin(0)
    //     // stap.setOrigin(0)
        
    //     // PREPARING DEFAULT GAME INTERACTIONS  

    //     var zone = this.add.zone(0, 0, width/4, height/1.3).setRectangleDropZone(width/4, height/1.3);
    //     Phaser.Display.Align.In.Center(zone, background);
    //     zone.x -= width/2.8
    //     zone.y -= height/35
    //     //  Just a visual display of the drop zone
    //     var graphics = this.add.graphics();
    //     // Phaser.Display.Align.In.Center(graphics, background);
    //     // graphics.lineStyle(2, 0xffff00);
    //     // graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
    //     console.log("DROPZONE")
    //     console.log(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height)
    //     // zonevisual.setOrigin(0, 0)
    //     // Phaser.Display.Align.In.Center(zonevisual, background);   
    //     // graphics.x -= width/2.8
    //     // graphics.y -= height/35
    //     console.log("alright")
    //     var commandList = []
    //     var commandPos = {"x":zone.x - width/80, "y": height/10}
    //     var commandStepDistance = height/25
    //     var newDrag = false

    //     // RESIZE COMMANDBLOCKS AGAIN

    //     // open.setDisplaySize(open.width, commandStepDistance)
    //     // sluit.setDisplaySize(sluit.width, sluit.height + width/200)
    //     // draailinks.setDisplaySize(draailinks.width, commandStepDistance)
    //     // stap.setDisplaySize(stap.width, commandStepDistance)
    //     // draairechts.setDisplaySize(draairechts.width, commandStepDistance)
        
    //     // draailinks.setInteractive()
    //     // this.input.setDraggable(draailinks)
    //     // draairechts.setInteractive()
    //     // this.input.setDraggable(draairechts)
    //     open.setInteractive()
    //     this.input.setDraggable(open)
    //     // stap.setInteractive()
    //     // this.input.setDraggable(stap)
    //     sluit.setInteractive()
    //     this.input.setDraggable(sluit)
    //     uitvoeren.setInteractive()
    //     opnieuw.setInteractive()

    //     this.input.on('dragstart', function (pointer, gameObject) {
    //         this.children.bringToTop(gameObject);
    //         newDrag = true
    //     }, this);

    //     this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
    //         gameObject.x = dragX;
    //         gameObject.y = dragY;
    //     });

    //     this.input.on('dragenter', function (pointer, gameObject, dropZone) {
    //         graphics.clear();
    //         // graphics.lineStyle(2, 0x00ffff);
    //         // graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
    //     });

    //     this.input.on('dragleave', function (pointer, gameObject, dropZone) {
    //         graphics.clear();
    //         // graphics.lineStyle(2, 0x0aaaaa);
    //         // graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
    //     });

    //     this.input.on('drop', function (pointer, gameObject, dropZone) {
    //         gameObject.x = commandPos.x;
    //         gameObject.y = commandPos.y;
    //         gameObject.input.enabled = false;
    //         if (newDrag) {
    //             console.log(gameObject)
    //             commandList.push(gameObject)
    //             console.log(commandList)
    //             console.log("commandPos1a", commandPos)
    //             commandPos.y = commandPos.y + commandStepDistance
    //             console.log("commandPos2a", commandPos)
    //             newDrag = false
    //         }
    //     });

    //     this.input.on('dragend', function (pointer, gameObject, dropped) {
    //         if (gameObject.x > zone.x - zone.input.hitArea.width / 2 && gameObject.x < zone.x + zone.input.hitArea.width / 2 &&
    //             gameObject.y > zone.y - zone.input.hitArea.height / 2 && gameObject.y < zone.y + zone.input.hitArea.height / 2
    //             ) {
    //             if (newDrag) {
    //                 gameObject.x = commandPos.x;
    //                 gameObject.y = commandPos.y;
    //                 gameObject.input.enabled = false;
    //                 if (newDrag) {
    //                     console.log(gameObject)
    //                     commandList.push(gameObject)
    //                     console.log(commandList)
    //                     console.log("commandPos1b", commandPos)
    //                     commandPos.y = commandPos.y + commandStepDistance
    //                     console.log("commandPos2b", commandPos)
    //                     newDrag = false
    //                 }
    //             }
    //         }
    //         else if (!dropped)
    //         {
    //             gameObject.x = gameObject.input.dragStartX;
    //             gameObject.y = gameObject.input.dragStartY;
    //         }
    //         // fix case for false negatives
    //         graphics.clear();
    //         // graphics.lineStyle(2, 0xffff00);
    //         // graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
    //     });

    //     var level = 1

    //     if(level == 1) {
    //         console.log("loading level 1")
            
    //     }

    //     player.x -= width/ 6.8
    //     player.y += height/ 17

    //     vraagteken.x -= width/ 6.8
    //     vraagteken.y += height/ 17

    //     vraagteken.x += stepsize_horizontal * 7
    //     vraagteken.y -= stepsize_vertical * 4


    //     // BUTTONS  

    //     uitvoeren.on('pointerdown', function (pointer) {
    //         this.setTint(0xff0000);
    //         processCommands(commandList)
    //     });

    //     uitvoeren.on('pointerout', function (pointer) {
    //         this.clearTint();
    //     });

    //     uitvoeren.on('pointerup', function (pointer) {
    //         this.clearTint();
    //     });

    //     opnieuw.on('pointerdown', function (pointer) {
    //         this.setTint(0xff0000);
    //         this.scene.restart();
    //     });

    //     uitvoeren.on('pointerout', function (pointer) {
    //         this.clearTint();
    //     });

    //     uitvoeren.on('pointerup', function (pointer) {
    //         this.clearTint();
    //     });
        
    //     // timedEvent = this.time.delayedCall(3000, processSingle, [], this);
    //     var myself = this
    //     var commandindex = 0
    //     function processCommands(commandList) {
    //         // this.time.events.add(Phaser.Timer.SECOND * 1, processSingle, this);
    //         console.log(commandList)
    //         // timedEvent = myself.time.delayedCall(1000, processSingle, [], myself);
    //         timedEvent = myself.time.addEvent({ delay: 500, callback: processSingle, callbackScope: myself, repeat: commandList.length });
    //     }

    //     function processSingle() {
    //         if (commandindex > 0) {
    //             commandList[commandindex-1].clearTint()
    //         }
    //         commandList[commandindex].setTint(0xff0000)
    //         var commandObject = commandList[commandindex]
    //         command = commandObject.data.command
    //         console.log("processing: ", command)
    //         if(command == "stap") {
    //             if (player.data.orientation == "right") {
    //                 player.x = player.x + stepsize_horizontal
    //             }
    //             if (player.data.orientation == "up") {
    //                 player.y = player.y - stepsize_vertical
    //             }
    //             if (player.data.orientation == "left") {
    //                 player.x = player.x - stepsize_horizontal
    //             }
    //             if (player.data.orientation == "down") {
    //                 player.y = player.y + stepsize_vertical
    //             }
    //         }
    //         if(command == "draailinks") {
    //             turndict = {
    //                 "right":"up",
    //                 "left":"down",
    //                 "up":"left",
    //                 "down":"right",
    //                 }
    //             player.data.orientation = turndict[player.data.orientation]
    //             player.angle = player.angle - 90
    //         }
    //         if(command == "draairechts") {
    //             turndict = {
    //                 "right":"down",
    //                 "left":"up",
    //                 "up":"right",
    //                 "down":"left",
    //                 }
    //             player.angle = player.angle + 90
    //             player.data.orientation = turndict[player.data.orientation]
    //         }
    //         commandindex += 1
    //         // commandObject.clearTint()    
    //     }

    //     // player.x = player.x + (stepsize_horizontal * 4)
    //     // player.y = player.y - (stepsize_vertical *2)


    //     // the commands
    //     // var als = this.add.sprite(height / 1.7, width / 2.2, 'als').setScale(600 / height).setInteractive()

    //     // this.input.setDraggable(als);

    //     // this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

    //     //     // gameObject.setScale(gameObject.y / height);

    //     //     gameObject.x = pointer.x;
    //     //     gameObject.y = pointer.y;
    //     // });

    //     // this.input.on('drop', function (pointer, gameObject, dropZone) {
    //     //     gameObject.x = dropZone.x;
    //     //     gameObject.y = dropZone.y;

    //     // });

    //     // //  A drop zone
    //     // var zone = this.add.zone(100, height/2, width/2, height/2).setDropZone();

    //     // //  Just a visual display of the drop zone
    //     // var graphics = this.add.graphics();
    //     // graphics.lineStyle(2, 0xffff00);
    //     // graphics.strokeRect(zone.x + zone.input.hitArea.x, zone.y + zone.input.hitArea.y, zone.input.hitArea.width, zone.input.hitArea.height);

    // }
    // function update() {
        
    // }