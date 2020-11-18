varying vec2 vUv;
varying vec2 vCoordinates;
attribute vec3 aCoordinates;
attribute float aSpeed;
attribute float aOffset;

uniform float move;
uniform float time;

void main() {
  vUv = uv;
  vec3 pos = position;
  pos.z = position.z + (move * 2000. * aSpeed) + aOffset;

  vec4 mvPosition = modelViewMatrix * vec4( pos, 1. );
  gl_PointSize = 1000. * ( 1. / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;

  vCoordinates = aCoordinates.xy;
}
