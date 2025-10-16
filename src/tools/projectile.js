export class Projectile {
  constructor(mathbox, view, cartesian, three) {
    this.mathbox = mathbox;
    this.view = view;
    this.cartesian = cartesian;
    this.three = three;
    this.projectiles = [];
    this.animating = false;
    this.range = { minX: -10, maxX: 100, minY: -10, maxY: 50 };
    this.axisLabels = { x: null, y: null };
    this.zoomAnimation = null;
    this.zoomDuration = 800;
    this.paused = false;
    this.animationSpeed = 1.0; // Default speed multiplier
    this.setupGraph();
    this.createAxisLabels();
  }

  setupGraph() {
    this.view.axis({
      axis: 1,
      width: 5,
      color: 0x000000,
    });

    this.view.axis({
      axis: 2,
      width: 5,
      color: 0x000000,
    });

    this.view.scale({
      axis: 1,
      divide: 5,
      zero: false,  // Don't show zero tick on X-axis
    });

    this.view.ticks({
      width: 3,
      size: 20,
      color: 0x000000,
    });

    this.view.format({
      digits: 1,
    });

    this.view.label({
      color: 0x000000,
      size: 18,
      offset: [0, -30],
    });

    this.view.scale({
      axis: 2,
      divide: 5,
      zero: true,  // Show zero tick on Y-axis
    });

    this.view.ticks({
      width: 3,
      size: 20,
      color: 0x000000,
    });

    this.view.format({
      digits: 1,
    });

    this.view.label({
      color: 0x000000,
      size: 18,
      offset: [-30, -30],  // Move Y-axis labels down slightly
    });
  }

  createAxisLabels() {
    this.axisLabels.xData = this.view.array({
      data: [[this.range.maxX, 0, 0]],
      channels: 3,
      live: true,
    });

    this.axisLabels.xData.text({
      data: ['X (m)'],
    }).label({
      color: 0x000000,
      size: 24,
      offset: [20, 0],
    });

    this.axisLabels.yData = this.view.array({
      data: [[0, this.range.maxY, 0]],
      channels: 3,
      live: true,
    });

    this.axisLabels.yData.text({
      data: ['Y (m)'],
    }).label({
      color: 0x000000,
      size: 24,
      offset: [0, 20],
    });
  }

  updateAxisLabels() {
    if (this.axisLabels.xData) {
      this.axisLabels.xData.set('data', [[this.range.maxX, 0, 0]]);
    }
    if (this.axisLabels.yData) {
      this.axisLabels.yData.set('data', [[0, this.range.maxY, 0]]);
    }
  }

  updateRange(maxX, maxY) {
    const paddingX = Math.max(maxX * 0.2, 10);
    const paddingY = Math.max(maxY * 0.2, 5);

    const newRange = {
      minX: -paddingX * 0.2,
      maxX: maxX + paddingX,
      minY: -paddingY * 0.2,
      maxY: maxY + paddingY
    };

    this.animateZoom(newRange);
  }

  animateZoom(targetRange) {
    if (this.zoomAnimation) {
      cancelAnimationFrame(this.zoomAnimation);
    }

    const startRange = {
      minX: this.range.minX,
      maxX: this.range.maxX,
      minY: this.range.minY,
      maxY: this.range.maxY
    };

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / this.zoomDuration, 1);
      const eased = this.easeInOutCubic(progress);

      this.range.minX = startRange.minX + (targetRange.minX - startRange.minX) * eased;
      this.range.maxX = startRange.maxX + (targetRange.maxX - startRange.maxX) * eased;
      this.range.minY = startRange.minY + (targetRange.minY - startRange.minY) * eased;
      this.range.maxY = startRange.maxY + (targetRange.maxY - startRange.maxY) * eased;

      this.cartesian.set('range', [
        [this.range.minX, this.range.maxX],
        [this.range.minY, this.range.maxY],
        [-2, 2]
      ]);

      this.updateAxisLabels();

      if (progress < 1) {
        this.zoomAnimation = requestAnimationFrame(animate);
      } else {
        this.zoomAnimation = null;
      }
    };

    animate();
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  setPaused(paused) {
    console.log('setPaused called with:', paused, 'current animating:', this.animating);
    this.paused = paused;
    // Note: We don't try to restart animation here.
    // The animation loop will check this.paused and continue when it becomes false.
  }

  setAnimationSpeed(speed) {
    this.animationSpeed = speed;
    console.log('Animation speed set to:', speed);
  }

  moveLatestObject(direction) {
    if (this.projectiles.length === 0) return;

    const projectile = this.projectiles[this.projectiles.length - 1];
    if (projectile.finalX === undefined || projectile.finalY === undefined) return;

    // Calculate trajectory and move along it
    const g = projectile.g || 9.8;
    const totalTime = projectile.totalTime || 1;

    // Current time ratio
    let currentTime = 0;
    const x0 = projectile.x0;
    const y0 = projectile.y0;
    const vx = projectile.vx;
    const vy = projectile.vy;

    // Find current time based on X position (since vx is constant)
    if (vx !== 0) {
      currentTime = (projectile.finalX - x0) / vx;
    }

    // Move time by a small amount (shorter distance)
    const timeShift = totalTime * 0.02; // 2% of total time
    const newTime = direction === 'left' ? currentTime - timeShift : currentTime + timeShift;

    // Clamp time to valid range
    const clampedTime = Math.max(0, Math.min(totalTime, newTime));

    // Calculate new position on trajectory
    projectile.finalX = x0 + vx * clampedTime;
    projectile.finalY = Math.max(0, y0 + vy * clampedTime - 0.5 * g * clampedTime * clampedTime);

    projectile.data.set('data', [[projectile.finalX, projectile.finalY, 0]]);

    // Update velocity vector
    const currentVx = vx;
    const currentVy = vy - g * clampedTime;
    const vMag = Math.sqrt(currentVx * currentVx + currentVy * currentVy);
    const scale = Math.min(vMag / 5, 10);

    projectile.velocity.set('data', [
      [projectile.finalX, projectile.finalY, 0],
      [projectile.finalX + (currentVx / vMag) * scale, projectile.finalY + (currentVy / vMag) * scale, 0]
    ]);

    // Update live values display with velocity
    if (window.updateLiveValues) {
      window.updateLiveValues(projectile.finalX, projectile.finalY, currentVx, currentVy);
    }
    // Show live values if not already visible
    if (window.showLiveValues) {
      window.showLiveValues(true);
    }
  }

  replayLatest() {
    if (this.projectiles.length === 0) return;

    const projectile = this.projectiles[this.projectiles.length - 1];
    const x0 = projectile.x0;
    const y0 = projectile.y0;
    const g = projectile.g || 9.8;
    const vx = projectile.vx;
    const vy = projectile.vy;
    const totalTime = projectile.totalTime;

    // Reset animation state
    this.animating = true;
    this.paused = false;

    // Re-animate the existing projectile
    const startTime = Date.now();
    const duration = totalTime * 1000;
    let pausedTime = 0;
    let lastTime = startTime;

    if (window.showControls) window.showControls();
    if (window.showLiveValues) window.showLiveValues(true);

    const animate = () => {
      if (!this.animating) return;

      if (this.paused) {
        pausedTime += Date.now() - lastTime;
        lastTime = Date.now();
        requestAnimationFrame(animate);
        return;
      }

      lastTime = Date.now();
      const elapsed = (Date.now() - startTime - pausedTime) * this.animationSpeed;
      const progress = Math.min(elapsed / duration, 1);
      const t = progress * totalTime;

      const x = x0 + vx * t;
      const y = y0 + vy * t - 0.5 * g * t * t;

      if (y < 0 || progress >= 1) {
        this.animating = false;
        projectile.finalX = x;
        projectile.finalY = Math.max(0, y);
        delete projectile.currentX;
        delete projectile.currentY;
        if (window.showFinishedControls) window.showFinishedControls();
        // Keep live values visible after replay ends
        // Don't hide - user can navigate with left/right
        return;
      }

      projectile.currentX = x;
      projectile.currentY = y;
      projectile.currentVx = vx;
      projectile.currentVy = vy - g * t;
      projectile.finalX = x;
      projectile.finalY = y;

      projectile.data.set('data', [[x, y, 0]]);

      const currentVx = vx;
      const currentVy = vy - g * t;
      const vMag = Math.sqrt(currentVx * currentVx + currentVy * currentVy);
      const scale = Math.min(vMag / 5, 10);

      projectile.velocity.set('data', [
        [x, y, 0],
        [x + (currentVx / vMag) * scale, y + (currentVy / vMag) * scale, 0]
      ]);

      // Update live values with velocity
      if (window.updateLiveValues) {
        window.updateLiveValues(x, y, currentVx, currentVy);
      }

      requestAnimationFrame(animate);
    };

    animate();
  }

  launch(v0, theta, x0 = 0, y0 = 0, color = 0xe74c3c, g = 9.8) {
    const thetaRad = (theta * Math.PI) / 180;
    const vx = v0 * Math.cos(thetaRad);
    const vy = v0 * Math.sin(thetaRad);

    const totalTime = (vy + Math.sqrt(vy * vy + 2 * g * y0)) / g;
    const maxHeight = y0 + (vy * vy) / (2 * g);
    const range = x0 + vx * totalTime;

    this.updateRange(range, maxHeight);

    const trajectoryPoints = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * totalTime;
      const x = x0 + vx * t;
      const y = y0 + vy * t - 0.5 * g * t * t;
      if (y >= 0) {
        trajectoryPoints.push([x, y, 0]);
      }
    }

    const pathData = this.view.array({
      data: trajectoryPoints,
      channels: 3,
    });

    this.view.line({
      points: pathData,
      color: color,
      width: 2,
      opacity: 0.3,
    });

    const projectileData = this.view.array({
      data: [[x0, y0, 0]],
      channels: 3,
      live: true,
    });

    this.view.point({
      points: projectileData,
      color: color,
      size: 50,
    });

    const velocityData = this.view.array({
      data: [[x0, y0, 0], [x0, y0, 0]],
      channels: 3,
      live: true,
    });

    this.view.vector({
      points: velocityData,
      color: 0x2ecc71,
      width: 4,
      end: true,
      size: 8,
    });

    const startTime = Date.now();
    const duration = totalTime * 1000;
    let pausedTime = 0;
    let lastTime = startTime;

    const projectile = {
      v0,
      theta,
      x0,
      y0,
      color,
      g,
      vx,
      vy,
      totalTime,
      data: projectileData,
      path: pathData,
      velocity: velocityData,
      currentX: x0,
      currentY: y0,
      currentVx: vx,
      currentVy: vy,
      finalX: x0,
      finalY: y0
    };

    if (window.showControls) window.showControls();
    if (window.showLiveValues) window.showLiveValues(true);

    const animate = () => {
      if (!this.animating) return;

      if (this.paused) {
        pausedTime += Date.now() - lastTime;
        lastTime = Date.now();
        requestAnimationFrame(animate);
        return;
      }

      lastTime = Date.now();
      const elapsed = (Date.now() - startTime - pausedTime) * this.animationSpeed;
      const progress = Math.min(elapsed / duration, 1);
      const t = progress * totalTime;

      const x = x0 + vx * t;
      const y = y0 + vy * t - 0.5 * g * t * t;

      if (y < 0 || progress >= 1) {
        this.animating = false;
        delete projectile.currentX;
        delete projectile.currentY;
        // Set final position for left/right navigation
        projectile.finalX = x;
        projectile.finalY = Math.max(0, y);
        if (window.showFinishedControls) window.showFinishedControls();
        // Keep live values visible after animation ends
        // Don't hide - user can navigate with left/right
        return;
      }

      projectile.currentX = x;
      projectile.currentY = y;
      projectile.currentVx = vx;
      projectile.currentVy = vy - g * t;
      projectile.finalX = x;
      projectile.finalY = y;

      projectileData.set('data', [[x, y, 0]]);

      const currentVx = vx;
      const currentVy = vy - g * t;
      const vMag = Math.sqrt(currentVx * currentVx + currentVy * currentVy);
      const scale = Math.min(vMag / 5, 10);

      velocityData.set('data', [
        [x, y, 0],
        [x + (currentVx / vMag) * scale, y + (currentVy / vMag) * scale, 0]
      ]);

      // Update live values with velocity
      if (window.updateLiveValues) {
        window.updateLiveValues(x, y, currentVx, currentVy);
      }

      requestAnimationFrame(animate);
    };

    projectile.animate = animate;

    this.animating = true;
    animate();

    this.projectiles.push(projectile);
  }

  clear() {
    this.projectiles = [];
    this.animating = false;
  }
}
