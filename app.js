import * as THREE from 'three';
let OrbitControls = require('three-orbit-controls')(THREE)
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

import gradient from './img/gradient-2.jpg';
import cat from './img/cat.png';
import lion from './img/lion.png';

export default class Sketch {
  constructor() {
    this.time = 0;
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild( this.renderer.domElement );
  
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 3000 );
    this.camera.position.z = 1000;
    this.scene = new THREE.Scene();

    this.textures = [
      new THREE.TextureLoader().load(cat),
      new THREE.TextureLoader().load(lion),
    ];
    this.mask = new THREE.TextureLoader().load(gradient),
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.addMesh();
    this.render();
  }
  
  addMesh() {
    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        progress: { type: "f", value: 0 },
        cat: { type: "t", value: this.textures[0] },
        lion: { type: "t", value: this.textures[1] },
        mask: { type: "t", value: this.mask },
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    let number = 512*512;

    this.geometry = new THREE.BufferGeometry();
    this.positions = new THREE.BufferAttribute(new Float32Array(number*3), 3);
    this.coordinates = new THREE.BufferAttribute(new Float32Array(number*3), 3);

    let index = 0;

    for (let i = 0; i < 512; i++) {
      let posX = i - 256;
      for (let j = 0; j < 512; j++) {
        this.positions.setXYZ(index, posX*2, (j - 256)*2, 0);
        this.coordinates.setXYZ(index, i, j, 0);
        index++;
      }
    }

    this.geometry.setAttribute("position", this.positions);
    this.geometry.setAttribute("aCoordinates", this.coordinates);

    this.mesh = new THREE.Points( this.geometry, this.material );
	  this.scene.add( this.mesh );
  }

  render() {
    this.time++;
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += 0.02;
    
    this.renderer.render( this.scene, this.camera );
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
