
/**
 * Creates one global p5 instance that owns a <canvas id="background‑canvas">.
 * Call this once from your view – subsequent calls just return the same p5.
 */
let instance = null;

export default function createBasicSpiral () {
  if (instance) return instance;          // already running

  instance = new p5((p) => {
    let angle = 0;

    p.setup = () => {
      const c = p.createCanvas(p.windowWidth, p.windowHeight);
      c.id("background-canvas");
      // put it behind everything and ignore pointer events
      c.style("position", "fixed");
      c.style("top", "0");
      c.style("left", "0");
      c.style("z-index", "-1");
      c.style("pointer-events", "none");

      p.colorMode(p.HSB, 360, 100, 100, 100);
      p.noFill();
      p.strokeWeight(2);
    };

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.draw = () => {
      // subtle trailing blur
      p.background(0, 0, 0, 10);

      p.translate(p.width / 2, p.height / 2);
      p.rotate(angle);

      // spiral radius oscillates over time
      const r = p.map(p.frameCount % 720, 0, 720,
                      20, Math.min(p.width, p.height) * 0.5);
      p.stroke((p.frameCount * 0.4) % 360, 80, 90, 60);
      p.ellipse(0, 0, r * 2, r * 2);

      angle += 0.01;
    };
  });

  return instance;
}
