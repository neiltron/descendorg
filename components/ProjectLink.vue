<template>
  <h2 ref="copy" class="mb-3 pb-3">
    <nuxt-link :to="{ path: `/work/${projectId}` }">
      <div ref="el">{{ projects[projectId].title }}</div>
    </nuxt-link>
  </h2>
</template>

<script>
import gsap from 'gsap'
import webgl from '../store/webgl.js'
import projects from '../store/projects.js'
import TextPlane from './TextPlane'

export default {
  props: {
    projectId: {
      type: String,
      default: null
    },
    index: {
      type: Number,
      default: null
    }
  },
  data: () => ({
    projects
  }),
  mounted() {
    setTimeout(() => {
      this.textPlane = new TextPlane({
        element: this.$refs.el
      })

      webgl.scene.add(this.textPlane)

      setTimeout(() => {
        gsap.fromTo(
          this.textPlane.mesh.position,
          {
            y: 80
          },
          {
            y: 32,
            duration: 0.6,
            delay: this.index / 15
          }
        )

        gsap.fromTo(
          this.textPlane.rotation,
          {
            z: 0.05
          },
          {
            z: 0,
            duration: 0.6,
            delay: this.index / 15
          }
        )

        gsap.fromTo(
          this.textPlane.mesh.material.uniforms.opacity,
          {
            value: 0
          },
          {
            value: 1,
            duration: 1,
            delay: this.index / 15
          }
        )
      }, 200)
    }, 200)
  },
  beforeDestroy() {
    webgl.scene.remove(this.textPlane)
  }
}
</script>

<style scoped>
h2 {
  color: rgba(0, 0, 0, 0);
}

span {
  display: block;
}
</style>
