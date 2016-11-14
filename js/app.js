var CANVAS_WIDTH = "800";
var CANVAS_HEIGHT = "800";
var ORIGIN = Point(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
var keys = new Set();
var canvas;
var ctx;

//Canvas init
(function() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.setAttribute("width", CANVAS_WIDTH);
  canvas.setAttribute("height", CANVAS_HEIGHT);
})();

var game_properties = {
  shape : 'hex',
  origin: ORIGIN,
  canvas: canvas,
  ctx: ctx,
}
game_board = new Board(game_properties);
game_board.draw_board();
window.addEventListener('keydown', on_key_down, true);
window.addEventListener('keyup', on_key_up, true);
function on_key_down(evt) {
  keys.add(evt.keyCode);
  game_board.update_state(keys);
}

function on_key_up(evt) {
  keys.delete(evt.keyCode);
}

function game() {
  //Clear Board
}
