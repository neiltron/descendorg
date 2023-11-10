<template>
  <div id="project_list" class="w-full">
    <h3>Selected work</h3>
    <div class="md:w-3/5 w-full">
      <ProjectLink
        v-for="(key, index) in keys"
        :key="key"
        :index="index"
        :project-id="key"
        class="mb-3 pb-3"
      />
    </div>
  </div>
</template>

<script>
// import * as THREE from 'three'
// import store from '../store/webgl.js'
import ProjectLink from '../components/ProjectLink'
import projects from '../store/projects.js'

export default {
  components: {
    ProjectLink
  },
  data: () => ({
    projects
  }),
  computed: {
    keys() {
      return Object.keys(this.projects)
    }
  }
}
</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS
.container {
  @apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

h2 {
  font-size: 2rem;
  font-weight: 486;
}

h3 {
  font-size: 1.4rem;
  color: #333;
}

#project_list h2 a span {
  border-bottom: 3px solid #f0faff;
  color: #333;
}
#project_list h2 a:hover span {
  color: #111;
  border-bottom: 3px solid #f2fcff;
}

p {
  font-size: 1.6em;
  font-weight: 355;
}
</style>
