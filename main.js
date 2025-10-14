import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as MathBox from 'mathbox';
import { Graph2D } from './tools/2dgraph.js';
import { Projectile } from './tools/projectile.js';

const container = document.getElementById('container');

const mathbox = MathBox.mathBox({
  plugins: ['core', 'controls', 'cursor'],
  controls: { klass: OrbitControls },
  element: container,
});

const three = mathbox.three;
three.renderer.setClearColor(new THREE.Color(0xffffff), 1.0);

const camera = three.camera;
const initialCameraPosition = { x: 0, y: 0, z: 4 };
camera.position.set(initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z);
camera.lookAt(0, 0, 0);

// Disable orbit controls zoom and rotation
three.controls.enableZoom = false;
three.controls.enableRotate = false;
three.controls.enablePan = false;

const cartesian = mathbox
  .set({
    focus: 1,
  })
  .cartesian({
    range: [[-10, 10], [-10, 10], [-2, 2]],
    scale: [2, 2, 1],
  });

let currentTool = null;
let currentToolName = '2dgraph';
let graph = null;
let projectile = null;

const switchTool = (toolName) => {
  const oldCartesian = document.querySelector('canvas').parentElement;

  mathbox.remove('cartesian');

  const newCartesian = mathbox
    .set({
      focus: 1,
    })
    .cartesian({
      range: [[-10, 10], [-10, 10], [-2, 2]],
      scale: [2, 2, 1],
    });

  currentToolName = toolName;

  if (toolName === '2dgraph') {
    graph = new Graph2D(mathbox, newCartesian, newCartesian, three);
    currentTool = graph;
  } else if (toolName === 'projectile') {
    projectile = new Projectile(mathbox, newCartesian, newCartesian, three);
    currentTool = projectile;
  }
};

window.switchTool = switchTool;
window.addPoint = (x, y, color) => graph?.addPoint(x, y, color);
window.launchProjectile = (v0, theta, x0, y0, color) => projectile?.launch(v0, theta, x0, y0, color);
window.resetTool = () => {
  switchTool(currentToolName);
};
window.togglePause = (paused) => {
  if (currentTool && currentTool.setPaused) {
    currentTool.setPaused(paused);
  }
};
window.moveObject = (direction) => {
  if (currentTool && currentTool.moveLatestObject) {
    currentTool.moveLatestObject(direction);
  }
};
window.replayAnimation = () => {
  if (currentTool && currentTool.replayLatest) {
    currentTool.replayLatest();
  }
};

switchTool('2dgraph');
window.graph = graph;
window.projectile = projectile;

function animate() {
  requestAnimationFrame(animate);
  three.renderer.render(three.scene, three.camera);
}

animate();

console.log('2D Graph ready. Use: addPoint(x, y, color)');
console.log('Example: addPoint(5, 3, 0x3498db)');
