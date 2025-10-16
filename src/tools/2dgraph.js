export class Graph2D {
  constructor(mathbox, view, cartesian, three) {
    this.mathbox = mathbox;
    this.view = view;
    this.cartesian = cartesian;
    this.three = three;
    this.points = [];
    this.animatingPoint = null;
    this.range = { minX: -10, maxX: 10, minY: -10, maxY: 10 };
    this.axisLabels = { x: null, y: null };
    this.zoomAnimation = null;
    this.zoomDuration = 800;
    this.paused = false;
    this.animationSpeed = 1.0;
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
      zero: false,
    });

    this.view.ticks({
      width: 3,
      size: 20,
      color: 0x000000,
      classes: ['x-axis'],
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
      zero: true,
    });

    this.view.ticks({
      width: 3,
      size: 20,
      color: 0x000000,
      classes: ['y-axis'],
    });

    this.view.format({
      digits: 1,
    });

    this.view.label({
      color: 0x000000,
      size: 18,
      offset: [-30, -30],
    });
  }

  createAxisLabels() {
    this.axisLabels.xData = this.view.array({
      data: [[this.range.maxX, 0, 0]],
      channels: 3,
      live: true,
    });

    this.axisLabels.xData.text({
      data: ['X'],
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
      data: ['Y'],
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

  updateRange(x, y) {
    let needsUpdate = false;

    if (x < this.range.minX || x > this.range.maxX || y < this.range.minY || y > this.range.maxY) {
      needsUpdate = true;
    }

    if (needsUpdate) {
      const allX = [...this.points.map(p => p.x), x];
      const allY = [...this.points.map(p => p.y), y];

      const minX = Math.min(...allX, 0);
      const maxX = Math.max(...allX, 0);
      const minY = Math.min(...allY, 0);
      const maxY = Math.max(...allY, 0);

      const paddingX = Math.max((maxX - minX) * 0.2, 2);
      const paddingY = Math.max((maxY - minY) * 0.2, 2);

      const newRange = {
        minX: minX - paddingX,
        maxX: maxX + paddingX,
        minY: minY - paddingY,
        maxY: maxY + paddingY
      };

      this.animateZoom(newRange);
    }
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

  setPaused(paused) {
    this.paused = paused;
  }

  setAnimationSpeed(speed) {
    this.animationSpeed = speed;
  }

  moveLatestObject(direction) {
    if (this.points.length === 0) return;

    const point = this.points[this.points.length - 1];

    if (!point.originalX) point.originalX = point.x;
    if (!point.originalY) point.originalY = point.y;
    if (!point.pathProgress) point.pathProgress = 1;

    const targetX = point.originalX;
    const targetY = point.originalY;
    const shift = 0.02;

    point.pathProgress = direction === 'left'
      ? Math.max(0, point.pathProgress - shift)
      : Math.min(1, point.pathProgress + shift);

    let currentX, currentY;

    if (point.pathProgress < 0.5) {
      const phase1Progress = point.pathProgress * 2;
      currentX = targetX * phase1Progress;
      currentY = 0;

      if (point.path) {
        point.path.set('data', [[0, 0, 0], [currentX, 0, 0]]);
      }
    } else {
      const phase2Progress = (point.pathProgress - 0.5) * 2;
      currentX = targetX;
      currentY = targetY * phase2Progress;

      if (point.path) {
        point.path.set('data', [[0, 0, 0], [targetX, 0, 0], [targetX, currentY, 0]]);
      }
    }

    point.x = currentX;
    point.y = currentY;

    point.data.set('data', [[currentX, currentY, 0]]);

    if (point.line) {
      point.line.set('data', [[0, 0, 0], [currentX, currentY, 0]]);
    }

    if (point.finalLine) {
      point.finalLine.set('opacity', point.pathProgress >= 1 ? 0.6 : 0);
    }

    if (window.updateLiveValues) {
      window.updateLiveValues(currentX, currentY);
    }
    if (window.showLiveValues) {
      window.showLiveValues();
    }
  }

  replayLatest() {
    if (this.points.length === 0) return;

    const point = this.points[this.points.length - 1];
    const targetX = point.originalX !== undefined ? point.originalX : point.x;
    const targetY = point.originalY !== undefined ? point.originalY : point.y;

    point.pathProgress = 0;

    if (point.finalLine) {
      point.finalLine.set('opacity', 0);
    }

    this.paused = false;

    const startTime = Date.now();
    let pausedTime = 0;
    let lastTime = startTime;
    const duration = 2000;

    if (window.showControls) window.showControls();
    if (window.showLiveValues) window.showLiveValues();

    const animate = () => {
      if (this.animatingPoint === null) return;

      if (this.paused) {
        pausedTime += Date.now() - lastTime;
        lastTime = Date.now();
        requestAnimationFrame(animate);
        return;
      }

      lastTime = Date.now();
      const elapsed = (Date.now() - startTime - pausedTime) * this.animationSpeed;
      const progress = Math.min(elapsed / duration, 1);

      let currentX, currentY;

      if (progress < 0.5) {
        const phase1Progress = progress * 2;
        const eased = this.easeInOutCubic(phase1Progress);
        currentX = targetX * eased;
        currentY = 0;

        if (point.path) {
          point.path.set('data', [[0, 0, 0], [currentX, 0, 0]]);
        }
      } else {
        const phase2Progress = (progress - 0.5) * 2;
        const eased = this.easeInOutCubic(phase2Progress);
        currentX = targetX;
        currentY = targetY * eased;

        if (point.path) {
          point.path.set('data', [[0, 0, 0], [targetX, 0, 0], [targetX, currentY, 0]]);
        }
      }

      point.data.set('data', [[currentX, currentY, 0]]);

      if (window.updateLiveValues) {
        window.updateLiveValues(currentX, currentY);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        point.x = targetX;
        point.y = targetY;
        point.pathProgress = 1;

        if (point.line) {
          point.line.set('data', [[0, 0, 0], [targetX, targetY, 0]]);
        }
        if (point.finalLine) {
          point.finalLine.set('opacity', 0.6);
        }

        this.animatingPoint = null;
        if (window.showFinishedControls) window.showFinishedControls();
      }
    };

    this.animatingPoint = { targetX, targetY, startTime, duration };
    animate();
  }

  addPoint(targetX, targetY, color = 0x3498db, duration = 2000) {
    this.updateRange(targetX, targetY);

    const pointData = this.view.array({
      data: [[0, 0, 0]],
      channels: 3,
      live: true,
    });

    this.view.point({
      points: pointData,
      color: color,
      size: 50,
    });

    // Temporary path line that shows the L-shaped movement
    const pathData = this.view.array({
      data: [[0, 0, 0], [0, 0, 0]],
      channels: 3,
      live: true,
    });

    this.view.line({
      points: pathData,
      color: color,
      width: 3,
      opacity: 0.4,
    });

    const lineData = this.view.array({
      data: [[0, 0, 0], [0, 0, 0]],
      channels: 3,
      live: true,
    });

    const finalLine = this.view.line({
      points: lineData,
      color: color,
      width: 3,
      opacity: 0,
    });

    const startTime = Date.now();
    let pausedTime = 0;
    let lastTime = startTime;

    if (window.showControls) window.showControls();
    if (window.showLiveValues) window.showLiveValues();

    const animate = () => {
      if (this.paused) {
        pausedTime += Date.now() - lastTime;
        lastTime = Date.now();
        requestAnimationFrame(animate);
        return;
      }

      lastTime = Date.now();
      const elapsed = (Date.now() - startTime - pausedTime) * this.animationSpeed;
      const progress = Math.min(elapsed / duration, 1);

      let currentX, currentY;

      if (progress < 0.5) {
        const phase1Progress = progress * 2;
        const eased = this.easeInOutCubic(phase1Progress);
        currentX = targetX * eased;
        currentY = 0;

        pathData.set('data', [[0, 0, 0], [currentX, 0, 0]]);
      } else {
        const phase2Progress = (progress - 0.5) * 2;
        const eased = this.easeInOutCubic(phase2Progress);
        currentX = targetX;
        currentY = targetY * eased;

        pathData.set('data', [[0, 0, 0], [targetX, 0, 0], [targetX, currentY, 0]]);
      }

      pointData.set('data', [[currentX, currentY, 0]]);

      if (window.updateLiveValues) {
        window.updateLiveValues(currentX, currentY);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        lineData.set('data', [[0, 0, 0], [targetX, targetY, 0]]);
        finalLine.set('opacity', 0.6);

        this.animatingPoint = null;
        if (window.showFinishedControls) window.showFinishedControls();
      }
    };

    this.animatingPoint = { targetX, targetY, startTime, duration };
    animate();

    this.points.push({ x: targetX, y: targetY, data: pointData, line: lineData, path: pathData, finalLine: finalLine, color });
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  clear() {
    this.points = [];
    this.animatingPoint = null;
  }
}
