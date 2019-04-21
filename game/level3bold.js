var level3b = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function level3b ()
    {
        Phaser.Scene.call(this, { key: 'level3b' });
    },

    preload: function ()
    {
        // REPLACE THIS WITH SPRITESHEET
        this.load.image('background', 'assets/3-achtergrond.jpg');
        this.load.image('als', 'assets/als.png');
        this.load.image('anders', 'assets/anders.png');
        this.load.image('stap', 'assets/stap.png');
        this.load.image('draailinks', 'assets/draai-links.png');
        this.load.image('draai-graden', 'assets/draai-graden.png');
        this.load.image('draailinks-crnt', 'assets/draai-links-crnt.png');
        this.load.image('draairechts', 'assets/draai-rechts.png');
        this.load.image('draairechts-crnt', 'assets/draai-rechts-crnt.png');
        this.load.image('graden', 'assets/draai-graden.png');
        this.load.image('herhaal-x', 'assets/herhaal-x.png');
        this.load.image('herhaal', 'assets/herhaal.png');
        this.load.image('open', 'assets/open.png');
        this.load.image('opnieuw', 'assets/opnieuw.png');
        this.load.image('sluit', 'assets/sluit.jpg');
        this.load.image('uitvoeren', 'assets/uitvoeren.png');
        this.load.image('oeps', 'assets/oeps.jpg');
        this.load.image('ossie', 'assets/ossie.png');
        // this.load.image('vraagteken', 'assets/vraagteken.png');
        this.load.image('victory', 'assets/placeholder_victory.png');
        this.load.image('bracket1', 'assets/nest-1.png')
        this.load.image('bracket2', 'assets/nest-2.png')
        this.load.image('bracket3', 'assets/nest-3.png')
        this.load.image('bracket4', 'assets/nest-4.png')
        this.load.image('bracket5', 'assets/nest-5.png')
        this.load.image('bracket6', 'assets/nest-6.png')

        // hover textures
        this.load.image('opnieuw-hover', 'assets/opnieuw-hover.png');
        this.load.image('open-hover', 'assets/open-hover.png');
        this.load.image('herhaal-hover', 'assets/herhaal-hover.png');
        this.load.image('herhaal-x-hover', 'assets/herhaal-x-hover.png');
        this.load.image('uitvoeren-hover', 'assets/uitvoeren-hover.png');
        this.load.image('stap-hover', 'assets/stap-hover.png');
        this.load.image('sluit-hover', 'assets/sluit-hover.png');
        this.load.image('draailinks-hover', 'assets/draai-links-hover.png');
        this.load.image('draairechts-hover', 'assets/draai-rechts-hover.png');
        this.load.image('draai-graden-hover', 'assets/draai-graden-hover.png');

        this.load.image('0', 'assets/0.png');
        this.load.image('one', 'assets/1.png');
        this.load.image('2', 'assets/2.png');
        this.load.image('3', 'assets/3.png');
        this.load.image('4', 'assets/4.png');
        this.load.image('5', 'assets/5.png');
        this.load.image('6', 'assets/6.png');
        this.load.image('7', 'assets/7.png');
        this.load.image('8', 'assets/8.png');
        this.load.image('nine', 'assets/9.png');
        this.load.image('slash', 'assets/slash.png');
    },

    create: function ()
    {
        // everything is based of the window height, based on the assumpation that all screens it will be played on have width space to spare
        var height = window.innerHeight
        var width = window.innerHeight * 1.33333333333
        var scalingfactor = width / 1024
        var timedEvent;
        var selectedObject = null
        var bracketrange = 1
        var myself = this

        // this was done by trial and error, sorry bout that
        var stepsize_horizontal = window.innerHeight / 9.9
        var stepsize_vertical = window.innerHeight / 9.9       
        
        // ================================================================
        // PREPARING ASSETS
        // ================================================================

        var background = this.add.image(width/2, height/2, 'background')
        background.setDisplaySize(width, height)
        
        var player = this.add.sprite(0, 0, 'ossie')
        playerscaling = 0.15 * scalingfactor
        player.setDisplaySize(player.width * playerscaling, player.height * playerscaling)
        player.angle -= 20
        player.data = {"orientation": "right"}
        player.gridposition = {"x":0, "y":5}
        var victorypos = {"x":5, "y":0}

        
        var linksbuttons = []
        for (var i = 0; i < 20; i++) {
            var draailinks = this.add.sprite(0, 0, "draailinks")
            draailinksscaling = 1.0 * scalingfactor
            draailinks.setDisplaySize(draailinks.width * draailinksscaling, draailinks.height * draailinksscaling)
            draailinks.setDepth(2)
            linksbuttons.push(draailinks)
        }
       
        var open = this.add.sprite(0, 0, "open")
        openscaling = 1.0 * scalingfactor
        open.setDisplaySize(open.width * openscaling, linksbuttons[0].height) // hotfix for heigth
        open.setDepth(2)

        var sluit = this.add.sprite(0, 0, "sluit")
        sluitscaling = 1.0 * scalingfactor
        sluit.setDisplaySize(sluit.width * sluitscaling, linksbuttons[0].height) // hotfix for heigth
        
        var rechtsbuttons = []
        for (var i = 0; i < 20; i++) {
            var draairechts = this.add.sprite(0, 0, "draairechts")
            draairechtsscaling = 1.0 * scalingfactor
            draairechts.setDisplaySize(draairechts.width * draairechtsscaling, draairechts.height * draairechtsscaling)
            draairechts.setDepth(2)
            rechtsbuttons.push(draairechts)
        }
        
        var stapbuttons  = []
        for (var i = 0; i < 20; i++) {
            let stap = this.add.sprite(0, 0, "stap")
            stapscaling = 1.0 * scalingfactor
            stap.setDisplaySize(stap.width * stapscaling, stap.height * stapscaling)
            stap.setDepth(2)
            stapbuttons.push(stap)
        }

        var herhaalbuttons  = []
        for (var i = 0; i < 20; i++) {
            let singlebracketgroup = this.add.group()
            let herhaal = this.add.sprite(0, 0, "herhaal")
            herhaalscaling = 1 * scalingfactor
            herhaal.setDisplaySize(herhaal.width * herhaalscaling, herhaal.height * herhaalscaling)
            let bracket = this.add.sprite(0, 0, 'bracket1')
            bracket.alpha = 0
            singlebracketgroup.add(herhaal)
            singlebracketgroup.add(bracket)

            herhaalbuttons.push(herhaal)
        }

        // var herhaalxbuttons  = []
        // for (var i = 0; i < 20; i++) {
        //     let singlebracketgroup = this.add.group()
        //     let herhaalx = this.add.sprite(0, 0, "herhaal-x")
        //     herhaalxscaling = 1 * scalingfactor
        //     herhaalx.setDisplaySize(herhaalx.width * herhaalxscaling, herhaalx.height * 0.6 * herhaalxscaling)
        //     let bracket = this.add.sprite(0, 0, 'bracket1')
        //     bracket.alpha = 0
        //     singlebracketgroup.add(herhaalx)
        //     singlebracketgroup.add(bracket)

        //     herhaalxbuttons.push(herhaalx)
        // }
        

        var uitvoeren = this.add.sprite(0, 0, "uitvoeren")
        uitvoerenscaling = 1.0 * scalingfactor
        uitvoeren.setDisplaySize(uitvoeren.width * uitvoerenscaling, uitvoeren.height * uitvoerenscaling)

        var opnieuw = this.add.sprite(0, 0, "opnieuw")
        opnieuwscaling = 0.95 * scalingfactor
        opnieuw.setDisplaySize(opnieuw.width * opnieuwscaling, opnieuw.height * opnieuwscaling)

        // var vraagteken = this.add.sprite(0, 0, "vraagteken")
        // vraagtekenscaling = 1.1 * scalingfactor
        // vraagteken.setDisplaySize(vraagteken.width * vraagtekenscaling, vraagteken.height * vraagtekenscaling)
        
        var slash = this.add.sprite(0, 0, "slash")
        slashscaling = 1.1 * scalingfactor
        slash.setDisplaySize(slash.width * slashscaling, slash.height * slashscaling)

        var one = this.add.sprite(0, 0, "one")
        onescaling = 1.1 * scalingfactor
        one.setDisplaySize(one.width * onescaling, one.height * onescaling)

        var nine = this.add.sprite(0, 0, "nine")
        ninescaling = 1.1 * scalingfactor
        nine.setDisplaySize(nine.width * ninescaling, nine.height * ninescaling)

        var levelcount = this.add.sprite(0, 0, "one")
        levelcountscaling = 1.1 * scalingfactor
        levelcount.setDisplaySize(levelcount.width * levelcountscaling, levelcount.height * levelcountscaling)

        // it's important to center the background first and then the rest of the assets
        Phaser.Display.Align.In.Center(background, this.add.zone(window.innerWidth / 2, window.innerHeight /2, window.innerWidth, window.innerHeight));

        linksbuttons.forEach(function(element) {
            Phaser.Display.Align.In.Center(element, background);
            element.x += width/7 
            element.y += height/ 3.7
            element.data = {"command":"draailinks", "id":i}
            element.setOrigin(0)
            element.setInteractive()
            myself.input.setDraggable(element)
        });

        rechtsbuttons.forEach(function(element) {
            Phaser.Display.Align.In.Center(element, background);
            element.x += width/3.8
            element.y += height/ 3.95
            element.data = {"command":"draairechts", "id":i}
            element.setOrigin(0)
            element.setInteractive()
            myself.input.setDraggable(element)
        });

        stapbuttons.forEach(function(element) {
            Phaser.Display.Align.In.Center(element, background);
            element.x += width/5.2 
            element.y += height/4.5
            element.data = {"command":"stap", "id":i}
            element.setOrigin(0)
            element.setInteractive()
            myself.input.setDraggable(element)
        });

        herhaalbuttons.forEach(function(element) {
            Phaser.Display.Align.In.Center(element, background);
            element.x += width/7 
            element.y += height/3
            element.data = {"command":"herhaal", "id":i, "range": 1, "startindex":0, "bracket": null}
            element.setOrigin(0)
            element.setInteractive()
            myself.input.setDraggable(element)
        });

        // herhaalxbuttons.forEach(function(element) {
        //     Phaser.Display.Align.In.Center(element, background);
        //     element.x += width/4 
        //     element.y += height/3
        //     element.data = {"command":"herhaal-x", "id":i, "range": 1, "startindex":0, "bracket": null, "repeats": 1}
        //     element.setOrigin(0)
        //     element.setInteractive()
        //     myself.input.setDraggable(element)
        // });

        Phaser.Display.Align.In.Center(player, background);
        Phaser.Display.Align.In.Center(sluit, background);
        Phaser.Display.Align.In.Center(open, background);
        Phaser.Display.Align.In.Center(uitvoeren, background);
        Phaser.Display.Align.In.Center(opnieuw, background);
        // Phaser.Display.Align.In.Center(vraagteken, background);
        Phaser.Display.Align.In.Center(slash, background);
        Phaser.Display.Align.In.Center(one, background);
        Phaser.Display.Align.In.Center(nine, background);
        Phaser.Display.Align.In.Center(levelcount, background);

        // REPOSITIONING OF ASSETS
        opnieuw.x -= width/ 14
        opnieuw.y += height/ 3.2
        uitvoeren.x -= width/ 7.2
        uitvoeren.y += height/ 6.4
        open.x += width/5
        open.y += height/6.5
        open.data = {"command":"open"}
        sluit.x += width/3.3
        sluit.y += height/6.5
        sluit.data = {"command":"sluit"}
        slash.x -= width/ 20
        slash.y += height/ 6.4
        nine.x -= width/ 120
        nine.y += height/ 6.4
        one.x -= width/ 15
        one.y += height/ 6.4
        levelcount.x -= width/ 30
        levelcount.y += height/ 6.4
        
        open.setOrigin(0)
        sluit.setOrigin(0)

        open.setInteractive()
        this.input.setDraggable(open)
        sluit.setInteractive()
        this.input.setDraggable(sluit)
        uitvoeren.setInteractive()
        opnieuw.setInteractive()

        // ================================================================
        // PREPARING DEFAULT GAME INTERACTIONS  
        // ================================================================

        var zone = this.add.zone(0, 0, width/4, height/1.3).setRectangleDropZone(width/4, height/1.3);
        Phaser.Display.Align.In.Center(zone, background);
        zone.x -= width/2.8
        zone.y -= height/35

        //  Just a visual display of the drop zone
        var graphics = this.add.graphics();
        // Phaser.Display.Align.In.Center(graphics, background);
        // graphics.lineStyle(2, 0xffff00);
        // graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
        

        var commandList = []
        var commandPos = {"x":zone.x, "y": height/10}
        var commandStepDistance = height/25
        var newDrag = false

        player.x -= width/ 6.8
        player.y += height/ 17

        // vraagteken.x -= width/ 6.8
        // vraagteken.y += height/ 17

        // vraagteken.x += stepsize_horizontal * 7
        // vraagteken.y -= stepsize_vertical * 4

        // ================================================================
        // handle click events for different buttons
        // ================================================================
        
        this.input.on('dragstart', function (pointer, gameObject) {
            this.children.bringToTop(gameObject);
            newDrag = true
        }, this);

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragenter', function (pointer, gameObject, dropZone) {
            graphics.clear();
            // graphics.lineStyle(2, 0x00ffff);
            // graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
        });

        this.input.on('dragleave', function (pointer, gameObject, dropZone) {
            graphics.clear();
            // graphics.lineStyle(2, 0x0aaaaa);
            // graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
        });

        this.input.on('drop', function (pointer, gameObject, dropZone) {
            gameObject.x = commandPos.x;
            gameObject.y = commandPos.y;
            if(gameObject.data.command == "herhaal" && newDrag) {
                toggleRepeatOverlay();
                selectedObject = gameObject
            } else if(gameObject.data.command == "herhaal" && newDrag) {
                positionHerhaal(pointer, gameObject)
            } else if (newDrag) {
                gameObject.input.enabled = false;
                commandList.push(gameObject)
                commandPos.y = commandPos.y + commandStepDistance
                newDrag = false // fixes the bug where this function triggers all the time
            }
        });

        this.input.on('dragend', function (pointer, gameObject, dropped) {
            if (gameObject.x > zone.x - zone.input.hitArea.width / 2 && gameObject.x < zone.x + zone.input.hitArea.width / 2 &&
                gameObject.y > zone.y - zone.input.hitArea.height / 2 && gameObject.y < zone.y + zone.input.hitArea.height / 2
                ) {
                if(gameObject.data.command == "herhaal" && newDrag) {
                    // renderRepeatPrompt("")
                    toggleRepeatOverlay();
                    selectedObject = gameObject
                    // positionHerhaal(pointer, gameObject)
                }else if(gameObject.data.command == "herhaal" && newDrag) {
                    positionHerhaal(pointer, gameObject)
                } else if (newDrag) {
                    gameObject.x = commandPos.x;
                    gameObject.y = commandPos.y;
                    gameObject.input.enabled = false;
                    commandList.push(gameObject)
                    commandPos.y = commandPos.y + commandStepDistance
                    newDrag = false
                }
            }
            // fix case for false negatives
            else if (!dropped)
            {
                gameObject.x = gameObject.input.dragStartX;
                gameObject.y = gameObject.input.dragStartY;
            }
            graphics.clear();
            // graphics.lineStyle(2, 0xffff00);
            // graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
        });

        uitvoeren.on('pointerdown', function (pointer) {
            this.setTint(0xff0000);
            processCommands(commandList)
        });

        uitvoeren.on('pointerout', function (pointer) {
            this.clearTint();
        });

        uitvoeren.on('pointerup', function (pointer) {
            this.clearTint();
        });

        // rewrite this function using restart and this. methods
        // reloads the whole scene, should instead just reposition objects etc.
        opnieuw.on('pointerdown', function (pointer) {
            console.log("restarting level")
            game.scene.stop('level3b');
            game.scene.start('level3b');
        }, this);

        uitvoeren.on('pointerout', function (pointer) {
            this.clearTint();
        });

        uitvoeren.on('pointerup', function (pointer) {
            this.clearTint();
        });
        
        opnieuw.on('pointerover', function (event, gameObjects) {
            opnieuw.setTexture("opnieuw-hover")
        });
        opnieuw.on('pointerout', function (event, gameObjects) {
            opnieuw.setTexture("opnieuw")
        });

        uitvoeren.on('pointerover', function (event, gameObjects) {
            uitvoeren.setTexture("uitvoeren-hover")
        });
        uitvoeren.on('pointerout', function (event, gameObjects) {
            uitvoeren.setTexture("uitvoeren")
        });

        // global variable used to determine position in the commandList
        var commandIndex = 0
        
        /**
        * process the commandList, calls processSingle using timed events.
        */
        function processCommands(commandList) {
            if(commandList.length > 0 && commandIndex == 0) {

                let extra_steps = 0 //extra steps added by repeat
                let commandNames = []
                commandList.forEach(function(commandObject) { 
                    commandNames.push(commandObject.data.command)
                    if (commandObject.data.command == "herhaal") {
                        extra_steps += commandObject.data.range
                    }
                    if (commandObject.data.command == "herhaal-x") {
                        extra_steps += commandObject.data.range * commandObject.data.repeats
                    }
                    
                });
                console.log("executing the follow command chain: ", commandNames)
                console.log("lenght of command chain: ", commandList.length)
                console.log("extra steps added for repeated commands: ", extra_steps)
                // process the commands using a timed event to allow player to see what's happening
                timedEvent = myself.time.addEvent({ delay: 500, callback: processSingle, callbackScope: myself, repeat: commandList.length-1 + extra_steps});
            }
        }
        
        /**
        * displays a victory image on screen when victory event is fired
        */
        this.events.on('victory', handlevictory, this);
        function handlevictory()
        {   
            var victoryimage = this.add.image(0, 0, 'victory');
            Phaser.Display.Align.In.Center(victoryimage, background);
            victoryimage.setDisplaySize(width/4, height/4)
            victoryimage.setInteractive()
            victoryimage.on('pointerdown', function (pointer) {
                console.log("loading next level")
                game.scene.stop('level3b');
                game.scene.start('level3b');
            }, this);
        }

        // ================================================================
        // PLAYER AND COMMAND MOVEMENT INTERACTIONS
        // ================================================================

        // gameboard internal representation, board is 0-indiced, 1 means block is taken, 0 means free
        var filledblocks =  [[1,1,1,1,0,0,1,1,1],
                            [1,1,1,0,0,1,1,1,1],
                            [1,1,0,0,1,1,1,1,1],
                            [1,0,0,1,1,1,1,1,1],
                            [0,0,1,1,1,1,1,1,1],
                            [0,1,1,1,1,1,1,1,1]
                            ]
        
        var herhaalcounter = 0 // commands left in the repeated section (moving through the section)
        var herhaalrange = 0 // range of the repeated section (next x commands to repeat)
        var herhaalx = 0 // times the section needs to be repeated
        var clearIndex = false // flag to clear the tint of a certain index
        var indexToClear = 0

        /**
        * Processes a single command from the commandList, takes the command at the global commandIndex variable
        */
        function processSingle() {
            // clear color of previous command if applicable
            if (commandIndex > 0) {
                commandList[commandIndex-1].clearTint()
            }
            if (clearIndex) {
                commandList[indexToClear].clearTint()
            }

            // emit victory event if player is positioned at the victorypoint
            if (player.gridposition.x == victorypos.x && player.gridposition.y == victorypos.y) {
                myself.events.emit('victory');
                return;
            }

            // color the current command if it is not the repeat command
            var commandObject = commandList[commandIndex]
            command = commandObject.data.command
            if (command != "herhaal") {
                commandList[commandIndex].setTint(0xff0000)
            }

            console.log("-------------")
            console.log("commandIndex: ", commandIndex)
            console.log("processing command: ", command)
            console.log("player position on grid: ", player.gridposition)
            console.log("herhaalcounter", herhaalcounter)
            console.log("herhaalrange", herhaalrange)
            console.log("herhaalx", herhaalx)

            // process stap command based on player orientation and availability of block
            try {
                if(command == "stap") {
                    if (player.data.orientation == "right" && filledblocks[player.gridposition.y][player.gridposition.x + 1] != null) {
                        if(filledblocks[player.gridposition.y][player.gridposition.x + 1] == 0) {
                            player.x = player.x + stepsize_horizontal
                            player.gridposition.x += 1
                        }
                    }
                    if (player.data.orientation == "up" && filledblocks[player.gridposition.y - 1][player.gridposition.x] != null) {
                        if(filledblocks[player.gridposition.y - 1][player.gridposition.x] == 0) {
                            player.y = player.y - stepsize_vertical
                            player.gridposition.y -= 1
                        }
                    }
                    if (player.data.orientation == "left" && filledblocks[player.gridposition.y][player.gridposition.x - 1] != null) {
                        if(filledblocks[player.gridposition.y][player.gridposition.x - 1] == 0) {
                            player.x = player.x + stepsize_horizontal
                            player.gridposition.x -= 1
                        }
                    }
                    if (player.data.orientation == "down" && filledblocks[player.gridposition.y + 1][player.gridposition.x] != null) {
                        if(filledblocks[player.gridposition.y + 1][player.gridposition.x] == 0) {
                            player.y = player.y + stepsize_vertical
                            player.gridposition.y += 1
                        }
                    }
                }
            }
            catch(err) {
                console.log("player move not possible")
            }
            // FIX THE COLLISIONS WHEN USING REPEAT-X
            // process turn commands
            if(command == "draailinks") {
                turndict = {
                    "right":"up",
                    "left":"down",
                    "up":"left",
                    "down":"right",
                    }
                player.data.orientation = turndict[player.data.orientation]
                player.angle = player.angle - 90
            }
            if(command == "draairechts") {
                turndict = {
                    "right":"down",
                    "left":"up",
                    "up":"right",
                    "down":"left",
                    }
                player.angle = player.angle + 90
                player.data.orientation = turndict[player.data.orientation]
            }

            // check if if we are at the end of a repeated section of commands
            if(herhaalcounter > 0) {
                herhaalcounter -= 1
            } 
            if (herhaalcounter == 0) {
                    if (herhaalx == 0) {
                        // commandIndex -= herhaalrange // 
                        herhaalrange = 0 // reset herhaalrange
                    } else {
                        clearIndex = true
                        indexToClear = commandIndex
                        herhaalx -= 1
                        herhaalcounter = herhaalrange
                        commandIndex -= herhaalrange
                        console.log("commandindex", commandIndex)
                    }
                }

            // check if the current command is herhaal/repeat
            if (command == "herhaal") {
                herhaalrange = commandObject.data.range
                herhaalcounter = herhaalrange
                herhaalx = 20
                commandList[commandIndex+1].setTint(0xff0000)

            }
            // use the sluit command for testing purposes
            if (command == "herhaal-x") {
                herhaalrange = commandObject.data.range
                herhaalcounter = herhaalrange
                herhaalx = commandObject.data.repeats
                commandList[commandIndex+1].setTint(0xff0000)
            }
            commandIndex += 1
        }

        /**
        * Position the herhaal command and the corresponding bracket in the commandzone
        */
        function positionHerhaal(pointer, gameObject) {
                console.log("after making bracket" + gameObject)
                // snap to nearest step
                let herhaalheight = height/10
                let herhaalindex = 0
                while (gameObject.y > herhaalheight && herhaalheight < commandPos.y) {
                    herhaalheight += commandStepDistance
                    herhaalindex += 1
                }

                // extra steps in case of another herhaal command being present
                let extra_steps = 0
                commandList.forEach(function(commandObject) {
                    if (commandObject.data.command == "herhaal-x") {
                        extra_steps += commandObject.data.range
                    }
                    if (commandObject.data.command == "herhaal") {
                        extra_steps += commandObject.data.range
                    }

                });
                herhaalindex += extra_steps
                herhaalheight -= commandStepDistance
                herhaalindex -= 1

                gameObject.data.startindex = herhaalindex
                gameObject.input.enabled = true
                myself.input.setDraggable(gameObject)
                gameObject.y = herhaalheight + commandStepDistance/6 //stap.height used for standard stepsize

                gameObject.x = commandPos.x - width/8
                commandList.splice(herhaalindex, 0, gameObject)

                // add a bracket to the herhaal sprite, change this to be able to find the bracket.
                console.log(bracketrange)
                var bracket = myself.add.sprite(0, 0, "bracket" + bracketrange)
                bracket.setInteractive()
                
                bracket.input.enabled = true;
                Phaser.Display.Align.In.Center(bracket, background);
                bracket.y = herhaalheight + commandStepDistance/2
                bracket.x = commandPos.x

                console.log(bracket.height)
                bracket.setDisplaySize(bracket.width, bracketrange * commandStepDistance)

                gameObject.y += commandStepDistance * (bracketrange /2)
                bracket.y += commandStepDistance * (bracketrange /2)

                gameObject.y -= commandStepDistance/2
                bracket.y -= commandStepDistance/2
                // console.log("math: ",commandStepDistance * (bracketrange /2))
                // position bracket underneat regular commands
                bracket.setDepth(1)
        }
        
        this.input.on('pointerover', function (event, gameObjectList) {
            try {
                console.log(gameObjectList[0])
                // gameObjectList[0].setTint(0xff0000)
                gameObjectList[0].setTexture(gameObjectList[0].texture.key + "-hover")
            }
            catch(err) {
                console.log(err.message);
            }
        });

        this.input.on('pointerout', function (event, gameObjectList) {
            try {
                // gameObjectList[0].clearTint();
                gameObjectList[0].setTexture(gameObjectList[0].texture.key.slice(0,-6))
            }
            catch(err) {
                console.log(err.message);
            }
        });
        
        window.handleRepeat = function() {
            console.log("herhalingen: ", document.repeatform.range.value)
            toggleRepeatOverlay()
            selectedObject.data.range = document.repeatform.range.value
            bracketrange = document.repeatform.range.value
            // console.log(selectedObject)
            // console.log("that was the object")
            positionHerhaal(null, selectedObject)
        }

        // FUNCTIONS TO HANDLE INTERACTION WITH HTML
        renderRepeatPrompt("")
        function renderRepeatPrompt(text) {
            el = document.getElementById("repeatOverlay");
            var html = "";
                
            html += "<p>Je hebt de <img src ='assets/herhaal.png'/> knop gebruikt, hoeveel commando wil je dat er herhaald worden(1-6)?</p>" +
            "<form action='javascript:handleRepeat()' name='repeatform' class='close' accept-charset='utf-8'>" +
            "<input type='text' name='range' value=''>" +
            "<input type='submit' value='Submit'>" +
            "</form>"

            // html += "<button class ='close' onclick='toggleRepeatOverlay()'>close window (NOT FOR FINAL GAME)</button><ul>" +
            // "<p>Je hebt de <img src ='assets/herhaal.png'/> knop gebruikt, hoe vaak wil je dat de commando's herhaald worden?</p>" +
            // "<form action='javascript:handleRepeat()' name='repeatform' class='close' accept-charset='utf-8'>" +
            // "<input type='text' name='herhalingen' value=''>" +
            // "<input type='submit' value='Submit'>" +
            // "</form>"
            
            // console.log(html)
            html += "</ul>";
            el.innerHTML = html;
        }
    }
    });