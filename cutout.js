// Head outlines traced by hand, as [x%, y%] points around each photo's head (clockwise from the top).
window.HEAD_OUTLINES = [
  [[48, 3], [60, 4], [69, 10], [73, 20], [74, 30], [77, 33], [77, 42], [73, 48], [71, 57], [67, 67], [60, 75], [50, 78], [40, 75], [33, 68], [28, 58], [26, 49], [22, 44], [22, 34], [25, 31], [25, 22], [29, 11], [37, 5]],
  [[52, 5], [65, 7], [75, 14], [81, 25], [82, 38], [85, 44], [83, 56], [80, 66], [76, 78], [68, 89], [55, 94], [42, 92], [34, 85], [28, 72], [23, 58], [19, 50], [21, 40], [23, 28], [28, 16], [38, 8]],
  [[55, 5], [65, 6], [75, 13], [80, 25], [83, 38], [82, 52], [78, 66], [70, 79], [58, 86], [45, 86], [33, 80], [25, 70], [20, 60], [16, 52], [17, 43], [24, 41], [29, 30], [34, 20], [41, 12], [48, 7]],
  [[50, 0], [75, 1], [88, 8], [91, 25], [91, 45], [90, 65], [85, 82], [75, 95], [60, 100], [40, 100], [25, 95], [15, 82], [10, 65], [8, 45], [8, 25], [12, 8], [25, 1]],
];

// Cut a photo down to just the head: smooth outline, feathered edge, dark sticker outline.
window.makeHeadCanvas = function (img, pts, size = 256) {
  const P = pts.map(([x, y]) => [x / 100 * img.width, y / 100 * img.height]);
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const side = Math.max(x1 - x0, y1 - y0) * 1.08, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const sc = size / side, ox = cx - side / 2, oy = cy - side / 2;
  const Q = P.map(([x, y]) => [(x - ox) * sc, (y - oy) * sc]);

  const path = g => { // closed Catmull-Rom spline through the points
    const n = Q.length;
    g.beginPath(); g.moveTo(Q[0][0], Q[0][1]);
    for (let i = 0; i < n; i++) {
      const p0 = Q[(i - 1 + n) % n], p1 = Q[i], p2 = Q[(i + 1) % n], p3 = Q[(i + 2) % n];
      g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
                      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    g.closePath();
  };
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = size; return [c, c.getContext('2d')]; };

  const [face, fg] = mk();
  fg.drawImage(img, ox, oy, side, side, 0, 0, size, size);
  const [mask, mg] = mk();
  mg.filter = 'blur(1.5px)'; mg.fillStyle = '#fff'; path(mg); mg.fill();
  fg.globalCompositeOperation = 'destination-in'; fg.drawImage(mask, 0, 0);

  const [out, og] = mk();
  og.lineJoin = 'round'; og.lineWidth = size * 0.035; og.strokeStyle = 'rgba(10,8,20,.9)'; og.fillStyle = 'rgba(10,8,20,.9)';
  path(og); og.save(); og.translate(size / 2, size / 2); og.scale(0.94, 0.94); og.translate(-size / 2, -size / 2);
  path(og); og.stroke(); og.fill(); og.restore();
  og.save(); og.translate(size / 2, size / 2); og.scale(0.94, 0.94); og.translate(-size / 2, -size / 2);
  og.drawImage(face, 0, 0); og.restore();
  return out;
};
