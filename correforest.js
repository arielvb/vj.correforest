var CorreForest;

(function ($) {
	"use strict";

	// Private functions
	function message(display, on, text) {
		if (on) {
			display.style.display = 'block';
			display.innerHTML = text;
		} else {
			display.style.display = 'none';
		}
	}

	function lives2string(lives) {
		var i, string = '';
		if (lives === 0) {
			return 'GAME OVER';
		}
		for (i = 0; i < lives; i += 1) {
			string += '♥';
		}
		string += ' Lives';
		return string;
	}

	function speed2string(speed) {
		return 'Speed ' + (new Array(speed + 1)).join('♦');
	}

	function newRoad(l, r) {
		var offset = Math.floor(Math.random() * 3);
		if (offset === 0) {
			offset = -1;
		}
		if (offset === 2) {
			offset = 0;
		}
		// Validate inside canvas
		offset *= 5;
		if (l + offset < 0) {
			offset = 0;
		}
		if (r + offset > 490) {
			offset = 0;
		}
		return [l + offset, r + offset];
	}

	// The class for the Game
	CorreForest = function (config) {
		this.config = config;
		this.init();
		this.createUI(config.wrapper);
		this.ciclo();
	};

	// Prototype
	CorreForest.prototype = {
		restart: false,
		gameover: false,
		lives: 0,
		play: true,
		metros: 0,
		position: {x: 0, y: 0},
		init: function () {
			var i;
			// Read configuration
			this.lives = this.config.lives;
			this.speed = this.config.speed.min;
			this.play = this.config.autoplay;
			this.gameover = false;
			this.metros = 0;
			this.road = [];
			this.position = this.config.position;
			// Init the road
			for (i = 0; i < this.config.position.y; i += 1) {
				this.road.push([500 / 2 - this.config.road / 2, 500 / 2 + this.config.road / 2]);
			}
			for (i = this.config.position.y; i < 600 / 10; i += 1) {
				this.road.push(newRoad(this.road[i - 1][0], this.road[i - 1][1]));
			}
		},
		// Creates the UI (executed only once)
		createUI: function (c) {
			var i, wrapper, that = this;
			wrapper = document.getElementById(c);
			this.canvas = document.createElement('canvas');
			this.canvas.width = 500;
			this.canvas.height = 600;
			wrapper.appendChild(this.canvas);
			// Menu: displays counters
			this.menubar = document.createElement('div');
			this.menubar.className = 'menu';
			this.canvas.parentNode.insertBefore(this.menubar, this.canvas);
			// speed counter
			this.speedElement = document.createElement('div');
			this.speedElement.className = 'speed';
			this.menubar.appendChild(this.speedElement);
			// Lives counter
			this.livesElement = document.createElement('div');
			this.livesElement.className = 'lives';
			this.menubar.appendChild(this.livesElement);
			// Length counter
			this.metrosElement = document.createElement('div');
			this.metrosElement.className = 'counter';
			this.menubar.appendChild(this.metrosElement);
			// Display: popup with a message
			this.display = document.createElement('div');
			this.display.className = 'display';
			this.display.style.display = 'none';
			this.canvas.parentNode.insertBefore(this.display, this.canvas);
			// Keyboard listener
			// You can use the canvas as listener if you add the tab index property and will catch events
			// wen the canvas is focused.
			window.addEventListener('keydown', function (event) {
				var key = event.keyCode;
				if (that.play) {
					if (key === that.config.keys.left) {
						// Move left
						that.position.x -= 1;
						event.preventDefault();
					} else if (key === that.config.keys.right) {
						// Move right
						that.position.x += 1;
						event.preventDefault();
					} else if (key === that.config.keys.up) {
						// Increase speed
						that.speed += 1;
						event.preventDefault();

					} else if (key === that.config.keys.down) {
						// Decrease speed
						event.preventDefault();
						that.speed -= 1;
					}
				}
				if (key === that.config.keys.pause) {
					event.preventDefault();
					if (that.gameover) {
						// Notify restart
						that.restart = true;
					} else {
						// Change play/pause
						that.play = !that.play;
						// Display message on pause (!play)
						message(that.display, !that.play, that.config.strings.pause);
					}
				}
			}, true);
			// No autoplay => render background and display
			if (!this.play) {
				this.salida();
				message(this.display, true, that.config.strings.start);
			}
		},
		// reset - read config; disable display and turn game on
		reset : function () {
			this.init();
			message(this.display, false);
			this.play = true;
		},
		// proceso - colision detection and new road's row
		proceso: function () {
			var colision, MAX = this.canvas.width / 10 - 1;
			if (this.position.x > MAX) {
				this.position.x = MAX;
			} else if (this.position.x < 0) {
				this.position.x = 0;
			}
			if (this.speed > this.config.speed.max) {
				this.speed = this.config.speed.max;
			} else if (this.speed < 1) {
				this.speed = 1;
			}
			colision = (this.road[this.position.y][0] >= this.position.x * 10) || (this.road[this.position.y][1] <= this.position.x * 10 + 5);
			if (colision) {
				this.lives -= 1;
				this.speed = 1;
				this.position.x = this.road[this.position.y][0] / 10 + 5;
			} else {
				this.metros += this.speed;
			}
			// New road's row
			this.road.shift();
			this.road.push(newRoad(this.road[this.road.length - 1][0], this.road[this.road.length - 1][1]));
		},
		// salida - draw the game and status
		salida: function () {
			var context = this.canvas.getContext("2d"), i, row, player = {};
			context.beginPath();
			// Draw the trees
			context.fillStyle = this.config.colors.trees;
			context.fillRect(0, 0, this.canvas.width, this.canvas.height);
			// Draw the road
			context.fillStyle = this.config.colors.road;
			for (i = 0, row = this.canvas.height - 10; i < this.road.length; i += 1, row -= 10) {
				context.fillRect(this.road[i][0] + 5, row, this.road[i][1] - this.road[i][0], 10);
			}
			// Draw the player
			context.fillStyle = this.config.colors.player.outside;
			// Translate player position
			player.x = this.position.x * 10;
			player.y = this.canvas.height - (this.position.y * 10);
			context.fillRect(player.x, player.y, 10, 10);
			context.fillStyle  = this.config.colors.player.inside;
			context.fillRect(player.x + 2, player.y + 2, 6, 6);
			context.stroke();
			// Draw Speed, lives, and counter
			this.speedElement.innerHTML = speed2string(this.speed);
			this.livesElement.innerHTML = lives2string(this.lives);
			this.metrosElement.innerHTML = this.metros + ' m';
		},
		// cicle - the main loop
		ciclo: function () {
			var that = this;
			if (this.restart) {
				this.reset();
				this.restart = false;
			}
			if (this.play) {
				this.proceso();
				this.salida();
			}
			if (this.lives === 0) {
				this.gameover = true;
				this.play = false;
				message(this.display, true, this.config.strings.gameover);
			}
			setTimeout(function () { this.ciclo(); }.bind(this), 60 - this.speed * 5);
		}
	};
}(window));




