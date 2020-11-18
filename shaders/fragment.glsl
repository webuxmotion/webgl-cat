varying vec2 vCoordinates;
varying vec3 vPos;
uniform sampler2D cat;
uniform sampler2D lion;
uniform sampler2D mask;

void main() {
  vec4 gradientTexture = texture2D(mask, gl_PointCoord);
  vec2 myUV = vec2(vCoordinates.x/512.,vCoordinates.y/512.);
  vec4 image = texture2D(cat, myUV);

  float alpha = 1. - clamp(0., 1., abs(vPos.z/900.));
  gl_FragColor = image;
  //gl_FragColor = gradientTexture;
  gl_FragColor.a *= gradientTexture.r * alpha;
}
