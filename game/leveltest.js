var level1 = new Phaser.Class({
	Extends: Phaser.Scene,
	preload: function() {
		
	}
});

let exampleStack = [
	{
		func: "for",
		counts: 3,
		do: [
			{ func: "step" },
		],

	},
	{
		func: "turnR",
	},
	{
		func: "step",
	},
	{
		func: "step",
	},
	{
		func: "if",
		condition: function(ossie){ return !ossie.facingWall() },
		do: [
			{ func: "step" }
		],
		else: [
			{ func: "turnR" }
		],
	},
	{
		func: "step",
	},
	{
		func: "turnL",
	},
	{
		func: "step",
	},
];

let exampleBoard = [
	[1,1,1,0,0],
	[0,0,1,0,0],
	[0,1,1,0,0],
	[0,2,0,0,0],
];

let exampleNodes = Utils.boardToNodes(exampleBoard);
console.log(exampleNodes);

let examplePos = {
	nodeLocation: '0,0',
	orientation: 'east',
};

let exampleOnEvent = function(eventCode) {
	console.log('logging event:', eventCode);
}

let exampleGame = new window.Ossie(exampleNodes, examplePos, exampleOnEvent);
exampleGame.stack = exampleStack;
exampleGame.gameStart();
