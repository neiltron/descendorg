<template>
  <div class="w-full">
    <div>
      <h2>{{ projects[$route.params.id].title }}</h2>
      <p>{{ projects[$route.params.id].body }}</p>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import store from '../../store/webgl.js'
import projects from '../../store/projects.js'

export default {
  components: {},
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data: () => ({
    projects,
    mesh: new THREE.Mesh(
      new THREE.BoxBufferGeometry(200, 200, 200),
      new THREE.MeshBasicMaterial({ color: '#f0f' })
    )
  }),
  mounted() {
    store.scene.add(this.mesh)
  },
  beforeDestroy() {
    store.scene.add(this.mesh)
  }
}
</script>

<style scoped>
p {
  font-family: 'Inter', sans-serif;
}
</style>
