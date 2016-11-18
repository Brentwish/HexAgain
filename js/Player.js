function Player(properties) {
  this.hex = properties.hex;
  this.board = properties.board;
  this.orientation = 0;
  this.moves = 1;
  this.player_settings = {
    type : "player",
    color : "brown"
  }
  this.hex.update_state(this.player_settings);
}

Player.prototype.turn = function() {
  this.moves -= 1;
}

Player.prototype.is_turn = function() {
  return this.moves > 0;
}

Player.prototype.rotate_right = function() {
  this.orientation -= 1;
  this.orientation = ((this.orientation % 6) + 6 ) % 6;
}

Player.prototype.rotate_left = function() {
  this.orientation += 1;
  this.orientation = ((this.orientation % 6) + 6 ) % 6;
}

Player.prototype.move = function(dir) {
  var orientation = (dir == "backward" ? ((this.orientation + 3) % 6) : this.orientation);
  var h = hex_neighbor(this.hex, orientation);
  h = this.board.hex_at(h.q, h.r, h.s);
  if (h.is_vacant(this.player_settings)) {
    this.hex.update_state();
    this.hex = h;
    this.hex.update_state(this.player_settings);
  }
}
