function Board(properties) {
  this.shape = properties.shape;
  this.canvas = properties.canvas;
  this.ctx = properties.ctx;
  this.origin = properties.origin;
  this.size = new Point(20,20);
  this.orientation = layout_flat;
  this.layout = Layout(this.orientation, this.size, this.origin)

  this.tiles = (function() {
    var tiles = [];
    this.radius = 8;
    var i = 0;
    for ( var q = -this.radius; q <= this.radius; q++ ) {
      var r1 = Math.max(-this.radius, -q - this.radius);
      var r2 = Math.min(this.radius, -q + this.radius);
      for (var r = r1; r <= r2; r++) {
          var is_wall = false;
          if (Math.abs(q) + Math.abs(r) + Math.abs(-q-r) == (2 * this.radius)) {
            is_wall = true;
          }
          var type = is_wall ? "wall" : "hall";
          tiles.push(new Hex(q, r, -q-r, type, is_wall));
          i++;
      }
    }
    return tiles;
  })();

  this.player = (function() {
    var player_properties = {
      hex: this.get_start_hex(),
      board: this
    };
    var player = new Player(player_properties);

    return player;
  }).bind(this)();
}

Board.prototype.turn = function() {
  if (!this.player.is_turn()) {
    this.player.moves = 1;
  }
}

Board.prototype.hex_at = function(q, r, s) {
  for (var i = 0; i < this.tiles.length; i++) {
    tile = this.tiles[i];
    if (tile.q == q && tile.r == r && tile.s == s) {
      return this.tiles[i];
    }
  }
  return null;
}

Board.prototype.update_state = function(keys) {
  keys.forEach(function(key) {
    if (this.is_passive_key(key)) {
      this.do_key(key)
    } else if (this.is_active_key(key) && this.player.is_turn()) {
      this.do_key(key);
      this.player.turn();
    }
  }.bind(this));
  this.turn();
  this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  this.draw_board();
}

Board.prototype.is_passive_key = function(k) {
  return k == 81 || k == 69; //q or e
}

Board.prototype.is_active_key = function(k) {
  return k == 83 || k == 87; // s or w
}

Board.prototype.do_key = function(k) {
  if (k == 81) { //q
    this.player.rotate_left();
  } else if (k == 69) { //e
    this.player.rotate_right();
  } else if (k == 83) { //s
    this.player.move("backward");
  } else if (k == 87) { //w
    this.player.move("forward");
  }
}

Board.prototype.get_start_hex = function() {
  return this.hex_at(0,0,0);
}

Board.prototype.draw_board = function() {
  for (var i = 0; i < this.tiles.length; i++) {
    this.draw_hex(this.tiles[i]);
  }
}

Board.prototype.draw_hex = function(h) {
  var corners = polygon_corners(this.layout, h);
  var color = h.color || "grey";
  for ( var i = 0; i < corners.length; i++ ) {
    this.line_between(corners[i], corners[(i + 1) % corners.length]);
  }

  this.ctx.fillStyle = color;
  this.ctx.beginPath();
  for ( var i = 0; i < corners.length; i++ ) {
    this.ctx.lineTo(corners[(i + 1) % corners.length].x, corners[(i + 1) % corners.length].y);
  }
  this.ctx.closePath();
  this.ctx.fill();
}

Board.prototype.line_between = function(a, b) {
  this.ctx.moveTo(a.x, a.y);
  this.ctx.lineTo(b.x, b.y);
  this.ctx.stroke();
}
