var CorreForestConfig, CorreForest;

CorreForestConfig =  {
	MAX : 49,
	MIN : 0,
	LEFT: 37,
	DOWN: 40,
	RIGHT: 39,
	UP: 38,
	position: 23,
	autoplay: true
};

CorreForest = function () {};

CorreForest.prototype = {
	config: CorreForestConfig,
	realposition: 0,
	road: [],
	play: true,
	metros : 0,
	velocity : 1,
	lives : 4,
	canvas : null,
	menubar : null,
	newRoad: function (l, r) {
		var offset = Math.floor(Math.random() * 3);
		if (offset === 0) {
			offset = -1;
		}
		if (offset === 2) {
			offset = 0;
		}
		offset *= 5;
		if (l + offset < 0) {
			offset = 0;
		}
		if (r + offset > 490) {
			offset = 0;
		}
		return [l + offset, r + offset];
	},
	init: function (c, m) {
		var i, LEFT = this.config.LEFT, RIGHT = this.config.RIGHT, UP = this.config.UP, DOWN = this.config.DOWN, that = this;
		this.play = this.config.autoplay;
		this.canvas = document.getElementById(c);
		this.menubar = document.getElementById(m);
		this.position = this.config.position;
		window.addEventListener('keydown', function (event) {
			// Keyboard listener
			var key = event.keyCode;
			if (that.play) {
				if (key === LEFT) {
					that.position -= 1;
				} else if (key === RIGHT) {
					that.position += 1;
				} else if (key === UP) {
					that.velocity += 1;
				} else if (key === DOWN) {
					that.velocity -= 1;
				}
			}
			if (key === 32) {
				that.play = !that.play;
			}

		}, false);
		// Init menubar
		// Velocity display
		this.velocityElement = document.createElement('div');
		this.velocityElement.id = 'correforest-speed';
		this.menubar.appendChild(this.velocityElement);

		// Init lives counter
		this.livesElement = document.createElement('div');
		this.livesElement.id = 'correforest-lives';
		this.menubar.appendChild(this.livesElement);

		this.metrosElement = document.createElement('div');
		this.metrosElement.id = 'correforest-metros';
		this.menubar.appendChild(this.metrosElement);
		this.metrosElement.style.textAlign = 'center';
		// Init the road
		for (i = 0; i < 12; i += 1) {
			this.road.push([180, 280]);
		}
		for (i = 12; i < 60; i += 1) {
			this.road.push(this.newRoad(this.road[i - 1][0], this.road[i - 1][1]));
		}
		this.road.reverse();
		this.ciclo();
	},
	lives2string: function (lives) {
		var i, string = 'Lives: ';
		if (lives === 0) {
			return 'GAME OVER';
		}
		for (i = 0; i < lives; i += 1) {
			string += '♥';
		}

		return string;
	},
	velocity2string: function (velocity) {
		return 'Velocity: ' + (new Array(velocity + 1)).join('♦');
	},
	proceso: function () {
		var colision = false, MAX = this.config.MAX, MIN = this.config.MIN;
		if (this.position > MAX) {
			this.position = MAX;
		} else if (this.position < MIN) {
			this.position = MIN;
		}
		if (this.velocity > 10) {
			this.velocity = 10;
		} else if (this.velocity < 1) {
			this.velocity = 1;
		}
		colision = (this.road[50][0] >= this.position * 10) || (this.road[50][1] <= this.position * 10 + 5);
		if (colision) {
			this.lives -= 1;
			this.velocity = 1;
			this.position = this.road[50][0] / 10 + 5;
		} else {
			this.metros += this.velocity;
		}

		// nuevo trozo de carretera
		this.road.reverse();
		this.road.shift();
		this.road.push(this.newRoad(this.road[this.road.length - 1][0], this.road[this.road.length - 1][1]));
		this.road.reverse();
	},
	salida: function () {
		var context = this.canvas.getContext("2d"), i;
		context.beginPath();
		// The sea
		context.fillStyle   = 'green'; // brown
		context.fillRect(0, 0, 500, 600);
		// The road
		for (i = 0; i < this.road.length; i += 1) {
			context.fillStyle = '#a5682a';
			context.fillRect(this.road[i][0] + 5, i * 10, this.road[i][1] - this.road[i][0], 10);
		}

		// Player
		context.fillStyle = 'black';
		this.realposition = this.position * 10;
		context.fillRect(this.realposition, 530, 10, 10);
		context.fillStyle   = 'white';
		context.fillRect(this.realposition + 2, 532, 6, 6);

		context.stroke();
		// Velocity
		this.velocityElement.innerHTML = this.velocity2string(this.velocity);
		// Lives
		this.livesElement.innerHTML = this.lives2string(this.lives);
		this.metrosElement.innerHTML = this.metros + ' m';

	},
	ciclo: function () {
		var that = this;
		if (this.play) {
			this.proceso();
			this.salida();

		}
		if (this.lives  > 0) {
			setTimeout(function () { that.ciclo(); }, 60 - this.velocity * 5);
		}
	}
};





