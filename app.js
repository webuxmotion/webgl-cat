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
    this.move = 0;
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild( this.renderer.domElement );
  
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 3000 );
    this.camera.position.z = 1000;
    this.scene = new THREE.Scene();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.textures = [
      new THREE.TextureLoader().load(cat),
      new THREE.TextureLoader().load(lion),
    ];
    this.mask = new THREE.TextureLoader().load(gradient),
    //this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.addMesh();
    this.mouseEffects();
    this.render();
  }

  mouseEffects() {
    this.test = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2000, 2000),
      new THREE.MeshBasicMaterial()
    )

    window.addEventListener('mousewheel', (e) => {
      this.move += e.wheelDeltaY/1000;
    });

    window.addEventListener( 'mousemove', (e) => {
      this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
      // update the picking ray with the camera and mouse position
	    this.raycaster.setFromCamera( this.mouse, this.camera );

      // calculate objects intersecting the picking ray
      let intersects = this.raycaster.intersectObjects( [this.test] );
      console.log(intersects[0].point);
    }, false );
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
        move: { type: "t", value: 0 },
        time: { type: "t", value: 0 },
        mouse: { type: "v2", value: null },
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
    this.speeds = new THREE.BufferAttribute(new Float32Array(number), 1);
    this.offset = new THREE.BufferAttribute(new Float32Array(number), 1);
    this.direction = new THREE.BufferAttribute(new Float32Array(number), 1);
    this.press = new THREE.BufferAttribute(new Float32Array(number), 1);

    let index = 0;

    function rand(a, b) {
      return a + (b - a)*Math.random();
    }

    for (let i = 0; i < 512; i++) {
      let posX = i - 256;
      for (let j = 0; j < 512; j++) {
        this.positions.setXYZ(index, posX*2, (j - 256)*2, 0);
        this.coordinates.setXYZ(index, i, j, 0);
        this.offset.setX(index, rand(-1000, 1000));
        this.speeds.setX(index, rand(0.4, 1));
        this.direction.setX(index, Math.random() > 0.5 ? 1 : -1);
        this.press.setX(index, rand(0.4, 1));
        index++;
      }
    }

    this.geometry.setAttribute("position", this.positions);
    this.geometry.setAttribute("aCoordinates", this.coordinates);
    this.geometry.setAttribute("aOffset", this.offset);
    this.geometry.setAttribute("aSpeed", this.speeds);
    this.geometry.setAttribute("aPress", this.press);
    this.geometry.setAttribute("aDirection", this.direction);

    this.mesh = new THREE.Points( this.geometry, this.material );
	  this.scene.add( this.mesh );
  }

  render() {
    this.time++;
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += 0.02;
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.move.value = this.move;
    this.material.uniforms.mouse.value = this.mouse;

    this.renderer.render( this.scene, this.camera );
  
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
