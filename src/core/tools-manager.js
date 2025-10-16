/**
 * Centralized Tools Manager
 * Manages visualization tools with unified configuration and control
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as MathBox from 'mathbox';

export class ToolsManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentTool = null;
    this.currentToolName = null;
    this.registeredTools = new Map();

    // Default configuration
    this.config = {
      allowUserInput: true,
      enableZoom: false,
      enableRotate: false,
      enablePan: false,
      showAxes: true,
      showGrid: true,
      backgroundColor: 0xffffff,
      cameraPosition: { x: 0, y: 0, z: 4 },
      cartesianRange: [[-10, 10], [-10, 10], [-2, 2]],
      cartesianScale: [2, 2, 1]
    };

    this.initializeMathBox();
  }

  /**
   * Initialize MathBox with Three.js
   */
  initializeMathBox() {
    this.mathbox = MathBox.mathBox({
      plugins: ['core', 'controls', 'cursor'],
      controls: { klass: OrbitControls },
      element: this.container,
    });

    this.three = this.mathbox.three;
    this.three.renderer.setClearColor(
      new THREE.Color(this.config.backgroundColor),
      1.0
    );

    this.camera = this.three.camera;
    this.resetCamera();

    // Apply control settings
    this.applyControlSettings();

    // Create initial cartesian view
    this.createCartesian();
  }

  /**
   * Reset camera to initial position
   */
  resetCamera() {
    const { x, y, z } = this.config.cameraPosition;
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Apply control settings (zoom, rotate, pan)
   */
  applyControlSettings() {
    this.three.controls.enableZoom = this.config.enableZoom;
    this.three.controls.enableRotate = this.config.enableRotate;
    this.three.controls.enablePan = this.config.enablePan;
  }

  /**
   * Create cartesian coordinate system
   */
  createCartesian() {
    if (this.cartesian) {
      this.mathbox.remove('cartesian');
    }

    this.cartesian = this.mathbox
      .set({ focus: 1 })
      .cartesian({
        range: this.config.cartesianRange,
        scale: this.config.cartesianScale,
      });
  }

  /**
   * Update configuration
   * @param {Object} newConfig - Configuration updates
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    // Apply updates
    if ('enableZoom' in newConfig || 'enableRotate' in newConfig || 'enablePan' in newConfig) {
      this.applyControlSettings();
    }

    if ('backgroundColor' in newConfig) {
      this.three.renderer.setClearColor(
        new THREE.Color(newConfig.backgroundColor),
        1.0
      );
    }

    if ('cameraPosition' in newConfig) {
      this.resetCamera();
    }

    if ('cartesianRange' in newConfig || 'cartesianScale' in newConfig) {
      this.createCartesian();
    }
  }

  /**
   * Register a tool
   * @param {string} name - Tool identifier
   * @param {Class} ToolClass - Tool class constructor
   * @param {Object} toolConfig - Tool-specific configuration
   */
  registerTool(name, ToolClass, toolConfig = {}) {
    this.registeredTools.set(name, {
      ToolClass,
      config: toolConfig
    });
  }

  /**
   * Switch to a different tool
   * @param {string} toolName - Name of the tool to activate
   * @param {Object} toolConfig - Optional configuration overrides
   */
  switchTool(toolName, toolConfig = {}) {
    if (!this.registeredTools.has(toolName)) {
      throw new Error(`Tool "${toolName}" is not registered`);
    }

    // Clean up current tool
    if (this.currentTool && this.currentTool.destroy) {
      this.currentTool.destroy();
    }

    // Recreate cartesian for clean slate
    this.createCartesian();

    // Get tool configuration
    const { ToolClass, config: defaultConfig } = this.registeredTools.get(toolName);
    const mergedConfig = { ...defaultConfig, ...toolConfig };

    // Apply tool-specific configuration
    if (mergedConfig.config) {
      this.updateConfig(mergedConfig.config);
    }

    // Instantiate new tool
    this.currentTool = new ToolClass(
      this.mathbox,
      this.cartesian,
      this.cartesian,
      this.three
    );

    this.currentToolName = toolName;

    console.log(`Switched to tool: ${toolName}`);

    return this.currentTool;
  }

  /**
   * Get current active tool
   */
  getCurrentTool() {
    return this.currentTool;
  }

  /**
   * Get current tool name
   */
  getCurrentToolName() {
    return this.currentToolName;
  }

  /**
   * Execute a method on the current tool
   * @param {string} method - Method name
   * @param  {...any} args - Method arguments
   */
  executeToolMethod(method, ...args) {
    if (!this.currentTool) {
      throw new Error('No tool is currently active');
    }

    if (typeof this.currentTool[method] !== 'function') {
      throw new Error(`Method "${method}" not found on current tool`);
    }

    return this.currentTool[method](...args);
  }

  /**
   * Reset current tool (recreate it)
   */
  resetCurrentTool() {
    if (this.currentToolName) {
      this.switchTool(this.currentToolName);
    }
  }

  /**
   * Get list of registered tools
   */
  getRegisteredTools() {
    return Array.from(this.registeredTools.keys());
  }

  /**
   * Start animation loop
   */
  startAnimation() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.three.renderer.render(this.three.scene, this.three.camera);
    };
    animate();
  }

  /**
   * Enable/disable user input controls
   */
  setUserInputEnabled(enabled) {
    this.config.allowUserInput = enabled;
  }

  /**
   * Check if user input is enabled
   */
  isUserInputEnabled() {
    return this.config.allowUserInput;
  }

  /**
   * Destroy the manager and clean up resources
   */
  destroy() {
    if (this.currentTool && this.currentTool.destroy) {
      this.currentTool.destroy();
    }
    this.registeredTools.clear();
  }
}
