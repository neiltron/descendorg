<template>
  <div class="px-5">
    <header class="container flex-col">
      <h1 class="w-full mt-12"><a href="/">descend</a></h1>
      <div v-if="$route.params.id == null" class="w-full">
        <p class="mt-20 mb-10 lg:w-2/5 w-full header-copy">
          Hi, I'm Neil. I'm a creative developer at Grow in Norfolk, VA.
          <a href="mailto:neil@descend.org">Get in touch.</a>
        </p>
      </div>
    </header>

    <div class="container flex-col">
      <nuxt />

      <footer class="w-full my-20">
        Follow:
        <a href="https://twitter.com/realtron">twitter</a>
        <a href="https://instagram.com/neiltron">instagram</a>
        <a href="https://github.com/neiltron">github</a>
        <a href="https://dribbble.com/neiltron">dribbble</a>
      </footer>
    </div>
  </div>
</template>

<style>
html {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

body header.container {
  min-height: 70vh;
}

h1 {
  font-size: 1.4rem;
  font-weight: 805;
  min-height: auto;

  text-transform: uppercase;
}

footer {
  font-size: 1.6em;
  font-weight: 355;
}

canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  pointer-events: none;
  backface-visibility: hidden;
  width: 100%;
  height: 100%;
}

.header-copy a,
footer a {
  border-bottom: 2px solid #bde;
}
</style>
