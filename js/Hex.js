Colors = {
  "default" : "grey",
  "player" : "red",
  "wall" : "black",
  "hall" : "grey"
};

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Hex(q, r, s, type, is_wall) {
  this.q = q;
  this.r = r;
  this.s = s;
  this.type = type;
  this.is_wall = is_wall;

  this.has_player = false;
  this.color = Colors[this.type];

  this.default_settings = {
    type : this.type,
    has_player : false,
    color : Colors[this.type]
  };
}

Hex.prototype.update_state = function(state) {
  state = state || this.default_settings;
  this.color = Colors[state.type];
  this.has_player = (state.type == "player" ? true : false);
}

Hex.prototype.is_vacant = function(state) {
  var available = false;
  if (state.type == "player") {
    return !this.is_wall && !this.has_player;
  }
  return available;
}

function hex_add(a, b) {
  return new Hex(a.q + b.q, a.r + b.r, a.s + b.s);
}

function hex_subtract(a, b) {
  return new Hex(a.q - b.q, a.r - b.r, a.s - b.s);
}

function hex_scale(a, k) {
  return new Hex(a.q * k, a.r * k, a.s * k);
}

var hex_directions = [
  new Hex(1, 0, -1),
  new Hex(1, -1, 0),
  new Hex(0, -1, 1),
  new Hex(-1, 0, 1),
  new Hex(-1, 1, 0),
  new Hex(0, 1, -1)
];

function hex_direction(direction) {
  return hex_directions[direction];
}

function hex_neighbor(hex, direction) {
  return hex_add(hex, hex_direction(direction));
}

var hex_diagonals = [
  new Hex(2, -1, -1),
  new Hex(1, -2, 1),
  new Hex(-1, -1, 2),
  new Hex(-2, 1, 1),
  new Hex(-1, 2, -1),
  new Hex(1, 1, -2)
];

function hex_diagonal_neighbor(hex, direction) {
  return hex_add(hex, hex_diagonals[direction]);
}

function hex_length(hex) {
  return Math.trunc((Math.abs(hex.q) + Math.abs(hex.r) + Math.abs(hex.s)) / 2);
}

function hex_distance(a, b) {
  return hex_length(hex_subtract(a, b));
}

function hex_round(h) {
  var q = Math.trunc(Math.round(h.q));
  var r = Math.trunc(Math.round(h.r));
  var s = Math.trunc(Math.round(h.s));
  var q_diff = Math.abs(q - h.q);
  var r_diff = Math.abs(r - h.r);
  var s_diff = Math.abs(s - h.s);
  if (q_diff > r_diff && q_diff > s_diff)
  {
      q = -r - s;
  }
  else
      if (r_diff > s_diff)
      {
          r = -q - s;
      }
      else
      {
          s = -q - r;
      }
  return new Hex(q, r, s);
}

function hex_lerp(a, b, t) {
  return new Hex(a.q * (1 - t) + b.q * t, a.r * (1 - t) + b.r * t, a.s * (1 - t) + b.s * t);
}

function hex_linedraw(a, b) {
  var N = hex_distance(a, b);
  var a_nudge = new Hex(a.q + 0.000001, a.r + 0.000001, a.s - 0.000002);
  var b_nudge = new Hex(b.q + 0.000001, b.r + 0.000001, b.s - 0.000002);
  var results = [];
  var step = 1.0 / Math.max(N, 1);
  for (var i = 0; i <= N; i++)
  {
      results.push(hex_round(hex_lerp(a_nudge, b_nudge, step * i)));
  }
  return results;
}

function OffsetCoord(col, row) {
    return {col: col, row: row};
}

var EVEN = 1;
var ODD = -1;
function qoffset_from_cube(offset, h)
{
    var col = h.q;
    var row = h.r + Math.trunc((h.q + offset * (h.q & 1)) / 2);
    return OffsetCoord(col, row);
}

function qoffset_to_cube(offset, h)
{
    var q = h.col;
    var r = h.row - Math.trunc((h.col + offset * (h.col & 1)) / 2);
    var s = -q - r;
    return new Hex(q, r, s);
}

function roffset_from_cube(offset, h)
{
    var col = h.q + Math.trunc((h.r + offset * (h.r & 1)) / 2);
    var row = h.r;
    return OffsetCoord(col, row);
}

function roffset_to_cube(offset, h)
{
    var q = h.col - Math.trunc((h.row + offset * (h.row & 1)) / 2);
    var r = h.row;
    var s = -q - r;
    return new Hex(q, r, s);
}

function Orientation(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
    return {f0: f0, f1: f1, f2: f2, f3: f3, b0: b0, b1: b1, b2: b2, b3: b3, start_angle: start_angle};
}

function Layout(orientation, size, origin) {
    return {orientation: orientation, size: size, origin: origin};
}

var layout_pointy = Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);

var layout_flat = Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);

function hex_to_pixel(layout, h)
{
    var M = layout.orientation;
    var size = layout.size;
    var origin = layout.origin;
    var x = (M.f0 * h.q + M.f1 * h.r) * size.x;
    var y = (M.f2 * h.q + M.f3 * h.r) * size.y;
    return new Point(x + origin.x, y + origin.y);
}

function pixel_to_hex(layout, p)
{
    var M = layout.orientation;
    var size = layout.size;
    var origin = layout.origin;
    var pt = new Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
    var q = M.b0 * pt.x + M.b1 * pt.y;
    var r = M.b2 * pt.x + M.b3 * pt.y;
    return new Hex(q, r, -q - r);
}

function hex_corner_offset(layout, corner)
{
    var M = layout.orientation;
    var size = layout.size;
    var angle = 2.0 * Math.PI * (M.start_angle - corner) / 6;
    return new Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
}

function polygon_corners(layout, h)
{
    var corners = [];
    var center = hex_to_pixel(layout, h);
    for (var i = 0; i < 6; i++)
    {
        var offset = hex_corner_offset(layout, i);
        corners.push(new Point(center.x + offset.x, center.y + offset.y));
    }
    return corners;
}

