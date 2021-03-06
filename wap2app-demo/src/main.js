import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import Vconsole from 'vconsole'

Vue.config.productionTip = false

const vConsole = new Vconsole()

console.log(111)

window.mplus.getCurrentPosition({
  plus: {
    success: function (res) {
      console.log(res, 123)
    },
    error: function (e) {
      console.log(e, 123)
    }
  },
  h5: {
    success: function (res) {
      console.log(res)
    },
    error: function () {}
  }
})

window.mplus.setConfig({
  hint: true
})

Vue.use(vConsole)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
