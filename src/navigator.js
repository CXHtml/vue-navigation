import Routes, { getRoutesMap } from './routes'
import { genKey } from './utils'

const mergePush = Routes.push.bind(Routes);
Routes.push = (item) => {
    const { path, key } = item;
    Routes.forEach((route) => route.path === path && (route.key = key));
    mergePush(item);
}

export default (bus, store, moduleName, keyName) => {
  if (store) {
    store.registerModule(moduleName, {
      state: {
        routes: Routes
      },
      mutations: {
        'navigation/FORWARD': (state, { to, from, name }) => {
          state.routes.push({ path: name, key: genKey() })
        },
        'navigation/BACK': (state, { to, from, count }) => {
          state.routes.splice(state.routes.length - count, count)
        },
        'navigation/REPLACE': (state, { to, from, name }) => {
          state.routes.splice(Routes.length - 1, 1, { path: name, key: genKey() })
        },
        'navigation/REFRESH': (state, { to, from }) => {
        },
        'navigation/RESET': (state) => {
          state.routes.splice(0, state.routes.length)
        }
      }
    })
  }

  const forward = (name, toRoute, fromRoute, pushFlag) => {
    const to = { route: toRoute }
    const from = { route: fromRoute }
    const routes = store ? store.state[moduleName].routes : Routes
    // if from does not exist, it will be set null
    from.name = (routes[routes.length - 1] || {}).path || null
    to.name = name
    store ? store.commit('navigation/FORWARD', { to, from, name }) : routes.push({ path: name, key: genKey() })
    window.sessionStorage.VUE_NAVIGATION = JSON.stringify(routes)
    bus.$emit('forward', to, from)
  }
  const back = (count, toRoute, fromRoute) => {
    const to = { route: toRoute }
    const from = { route: fromRoute }
    const routes = store ? store.state[moduleName].routes : Routes
    from.name = routes[routes.length - 1].path
    to.name = routes[routes.length - 1 - count].path
    store ? store.commit('navigation/BACK', { to, from, count }) : routes.splice(Routes.length - count, count)
    window.sessionStorage.VUE_NAVIGATION = JSON.stringify(routes)
    bus.$emit('back', to, from)
  }
  const replace = (name, toRoute, fromRoute) => {
    const to = { route: toRoute }
    const from = { route: fromRoute }
    const routes = store ? store.state[moduleName].routes : Routes
    // if from does not exist, it will be set null
    from.name = routes[routes.length - 1].path || null
    to.name = name
    store ? store.commit('navigation/REPLACE', { to, from, name }) : routes.splice(Routes.length - 1, 1, { path: name, key: genKey() })
    window.sessionStorage.VUE_NAVIGATION = JSON.stringify(routes)
    bus.$emit('replace', to, from)
  }
  const refresh = (toRoute, fromRoute) => {
    const to = { route: toRoute }
    const from = { route: fromRoute }
    const routes = store ? store.state[moduleName].routes : Routes
    to.name = from.name = routes[routes.length - 1].path
    store ? store.commit('navigation/REFRESH', { to, from }) : null
    bus.$emit('refresh', to, from)
  }
  const reset = () => {
    store ? store.commit('navigation/RESET') : Routes.splice(0, Routes.length)
    window.sessionStorage.VUE_NAVIGATION = JSON.stringify([])
    bus.$emit('reset')
  }

  const record = (toRoute, fromRoute, replaceFlag, pushFlag) => {
    const name = toRoute.path
    if (replaceFlag) {
      replace(name, toRoute, fromRoute)
    } else {
      if (!getRoutesMap()[name] || pushFlag) {
        forward(name, toRoute, fromRoute)
      } else if (name === Routes[Routes.length - 1].path) {
        refresh(toRoute, fromRoute)
      } else {
        back(1, toRoute, fromRoute)
      }
    }
  }

  return {
    record, reset
  }
}
