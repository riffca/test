<template>
  <div class="spinner" :style="style">
    <div class="dot1" :style="styleDots"></div>
    <div class="dot2" :style="styleDots"></div>
  </div>
</template>

<style>
 .spinner {
  margin: 100px auto;
  width: 40px;
  height: 40px;
  position: relative;
  text-align: center;

  animation: sk-rotate 2.0s infinite linear;
}

.dot1, .dot2 {
  width: 60%;
  height: 60%;
  display: inline-block;
  position: absolute;
  top: 0;
  background-color: inherit;;
  border-radius: 100%;

  animation: sk-bounce 2.0s infinite ease-in-out;
}

.dot2 {
  top: auto;
  bottom: 0;
  -webkit-animation-delay: -1.0s;
  animation-delay: -1.0s;
}

@-webkit-keyframes sk-rotate { 100% {
  -webkit-transform: rotate(360deg) }}

@keyframes sk-rotate { 100% {
  transform: rotate(360deg);
  -webkit-transform: rotate(360deg) }}

@-webkit-keyframes sk-bounce {
  0%, 100% { -webkit-transform: scale(0.0) }
  50% { -webkit-transform: scale(1.0) }
}

@keyframes sk-bounce {
  0%, 100% {
    transform: scale(0.0);
    -webkit-transform: scale(0.0);
  } 50% {
    transform: scale(1.0);
    -webkit-transform: scale(1.0);
  }
}
</style>

<script>
  export default {
    props: {
      color: { default: 'black' },
      size:  { default: 40 },
    },
    computed: {
      style() {
        var width = `width: ${this.size}px`;
        var height = `height: ${this.size}px`;

        return `${width}; ${height};`;
      },
      styleDots() {
        return `background-color: ${this.color}`
      }
    },
  }
</script>
