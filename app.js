import * as THREE from 'three';
import gsap from 'gsap';
import * as dat from 'dat.gui';

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
    this.next = 0;
    this.base = 0;
    this.one = 1;
    this.two = 0;
    this.prev = 1;  
    this.direct = {
      value: 0,
      direction: 'line',
      counter: 0,
    };
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('container').appendChild( this.renderer.domElement );
  
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 3000 );
    this.camera.position.z = 1000;
    this.scene = new THREE.Scene();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.point = new THREE.Vector2();

    this.textures = [
      new THREE.TextureLoader().load(cat),
      new THREE.TextureLoader().load(lion),
    ];
    this.mask = new THREE.TextureLoader().load(gradient),
    //this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.settings();
    this.addMesh();
    this.mouseEffects();
    this.render();
  }

  settings() {
    this.settings = {
      progress: 1,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }

  mouseEffects() {
    this.test = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2000, 2000),
      new THREE.MeshBasicMaterial()
    )

    window.addEventListener('mousewheel', (e) => {
      this.move += e.wheelDeltaY/4000;

      this.next = Math.floor(this.move + 4000)%2;

      if (this.next === 1) {
        this.prev = 0;
      } else {
        this.prev = 1;
      }
      
      let abs = Math.abs(this.move);
      let floor = Math.floor(abs);

      if (this.next !== this.direct.value) {
        if (this.direct.counter % 3 === 0) {

          if (this.direct.direction === 'back') {
            this.direct.direction = 'line';
            this.one = 1;
            this.two = 0;
          } else {
            this.direct.direction = 'back';
            this.one = 0;
            this.two = 1;
          }

          this.base = floor;
        }
        this.direct.value = this.next;
        this.direct.counter++;
      }

      let value = (abs - this.base) / 3;
      if (value > 1) { value = 1 }

      if (this.direct.direction === 'back') {
        value = 1 - value;
      }

      let diff = 1 - value;
      let newVal = 1 - diff * 2;

      if (value < 0.5) {
        newVal = Math.abs(newVal);
      }

      this.settings.progress = newVal;
    });

    window.addEventListener('mousedown', (e) => {
      gsap.to(this.material.uniforms.mousePressed, {
        duration: 1,
        value: 1,
        ease: "elastic.out(1, 0.3)"
      })
    });

    window.addEventListener('mouseup', (e) => {
      gsap.to(this.material.uniforms.mousePressed, {
        duration: 1,
        value: 0,
        ease: "elastic.out(1, 0.3)"
      })
    });

    window.addEventListener( 'mousemove', (e) => {
      this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
      // update the picking ray with the camera and mouse position
	    this.raycaster.setFromCamera( this.mouse, this.camera );

      // calculate objects intersecting the picking ray
      let intersects = this.raycaster.intersectObjects( [this.test] );

      this.point.x = intersects[0].point.x;
      this.point.y = intersects[0].point.y;
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
        move: { type: "f", value: 0 },
        time: { type: "f", value: 0 },
        mouse: { type: "v2", value: null },
        transition: { type: "f", value: null },
        mousePressed: { type: "f", value: 0 },
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
    
    this.material.uniforms.cat.value = this.textures[this.one];
    this.material.uniforms.lion.value = this.textures[this.two];
    this.material.uniforms.transition.value = this.settings.progress;
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.move.value = this.move / 3;  
    this.material.uniforms.mouse.value = this.point;

    this.renderer.render( this.scene, this.camera );
  
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
