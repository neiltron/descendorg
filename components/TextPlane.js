import font from '../assets/Inter.json'
import fontPng from '../assets/Inter.png'

const THREE = require('three')

const glslify = require('glslify')

let createTextGeometry = null

if (typeof document !== 'undefined') {
  createTextGeometry = require('three-bmfont-text')
}

class TextPlane extends THREE.Object3D {
  constructor(opts = {}) {
    super()

    this.isTextPlane = true
    this.element = opts.element

    const rect = this.element.getBoundingClientRect()

    this.position.x = rect.left - window.innerWidth / 2
    this.position.y =
      rect.top + document.scrollingElement.scrollTop + rect.height - 32

    this.initialPosition = new THREE.Vector3().copy(this.position)

    this.geometry = createTextGeometry({
      font,
      width: rect.width * 2 + 100,
      align: 'left',
      // eslint-disable-next-line unicorn/prefer-text-content
      text: this.element.innerText,
      lineHeight: 96
      // negate: true,
    })

    this.scale.set(32 / 72, 32 / 72, 1)

    // the resulting layout has metrics and bounds
    // console.log(this.geometry.layout.height)
    // console.log(this.geometry.layout.descender)

    this.loadTexture()
  }

  update(dt = 0, time = 0) {
    this.rotation.z += 0.01
    if (this.material) {
      this.material.uniforms.time.value = time
    }
  }

  resize(width) {
    const rect = this.element.getBoundingClientRect()

    this.position.x = rect.left - width / 2
    this.position.y =
      rect.top + document.scrollingElement.scrollTop + rect.height - 32

    this.material.uniforms.scrollPos.value = -document.scrollingElement
      .scrollTop

    this.geometry.update({ width: rect.width * 2 + 100 })
  }

  updateMousePos(e) {
    this.material.uniforms.mousepos.value = [e.pageX, e.pageY]
  }

  loadTexture() {
    const textureLoader = new THREE.TextureLoader()

    textureLoader.load(fontPng, (texture) => {
      // we can use a simple ThreeJS material
      // var material = new THREE.MeshBasicMaterial({
      //   color: '#f0f',
      //   side: THREE.DoubleSide,
      // })

      texture.needsUpdate = true

      this.createMaterial(texture)

      // now do something with our mesh!
      this.mesh = new THREE.Mesh(this.geometry, this.material)

      this.add(this.mesh)
    })
  }

  createMaterial(texture) {
    const fragmentShader = `
      uniform vec3 color;
      uniform float time;
      uniform float opacity;
      uniform sampler2D map;
      varying vec2 vUv;
      varying vec2 v_pos;
      varying float noise;

      float median(float r, float g, float b) {
        return max(min(r, g), min(max(r, g), b));
      }

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main(){
        vec4 texColor = texture2D(map, vUv);
        // Only render the inside of the glyph.
        float noise = snoise(v_pos.xy / 1000. - time / 4.) * .2;
        float sigDist = median(texColor.r, texColor.g, texColor.b);
        float alpha = smoothstep(.2, 1., sigDist - noise * 2. * ((sin(-time + v_pos.x / 600.) + 1.) / 2.));

        gl_FragColor = vec4(color, alpha * opacity);
        // gl_FragColor = vec4(color, 1);
        // if (gl_FragColor.a < 0.0001) discard;
      }
    `
    const vertexShader = glslify(`
      varying vec2 vUv;
      varying vec2 v_pos;
      varying float noise;
      uniform float scrollPos;
      uniform float time;

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        float noise = snoise(position.yy / 400. + time / 4.) * .2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);

        v_pos = position.xy;
        vUv = uv;
      }
    `)

    this.material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      transparent: true,
      uniforms: {
        map: { value: texture },
        // eslint-disable-next-line unicorn/number-literal-case
        color: { value: new THREE.Color(0x333333) },
        scrollPos: { value: 0 },
        time: { value: 0 },
        opacity: { value: 0 }
      }
    })
  }
}

export default TextPlane
