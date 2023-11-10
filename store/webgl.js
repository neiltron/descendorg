// eslint-disable-next-line prettier/prettier
const THREE = global.THREE = require('three')

const width = typeof window !== 'undefined' ? window.innerWidth : 0
const height = typeof window !== 'undefined' ? window.innerHeight : 0

const renderer =
  typeof document !== 'undefined'
    ? new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      })
    : null

if (typeof document !== 'undefined') {
  document.body.appendChild(renderer.domElement)
  renderer.setClearColor('#fff', 1)
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
}

const camera =
  typeof document !== 'undefined'
    ? new THREE.OrthographicCamera(width / -2, width / 2, 0, height, 0.01, 20)
    : null

if (camera != null) {
  camera.position.z = 1
}

const scene = typeof document !== 'undefined' ? new THREE.Scene() : null

const render = () => {
  if (scene.children.length > 0) {
    scene.traverse((child) => {
      if (child.mesh && child.mesh.isMesh) {
        child.mesh.material.uniforms.time.value = performance.now() / 1000
      }
    })

    renderer.render(scene, camera)
  }

  requestAnimationFrame(render)
}

let resizeTimer
const resize = () => {
  const width = window.innerWidth
  const height = window.innerHeight

  renderer.setSize(width, height)
  camera.left = width / -2
  camera.right = width / 2
  camera.top = 0
  camera.bottom = height

  camera.updateProjectionMatrix()

  scene.traverse((child) => {
    if (child.mesh && child.isTextPlane) {
      child.resize(width)
    }
  })
}

if (typeof document !== 'undefined') {
  render()

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)

    resizeTimer = setTimeout(resize, 200)
  })

  window.addEventListener('scroll', (e) => {
    scene.position.y = -document.scrollingElement.scrollTop
  })
}

export default {
  width,
  height,
  renderer,
  camera,
  scene
}
