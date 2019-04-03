import Routes from './routes'
import Navigator from './navigator'
import NavComponent from './components/Navigation'
import { genKey, isObjEqual } from './utils'

export default {
    install: (Vue, { router, store, moduleName = 'navigation', keyName = 'VNK' } = {}) => {
        if (!router) {
            console.error('vue-navigation need options: router')
            return
        }

        const bus = new Vue()
        const navigator = Navigator(bus, store, moduleName, keyName)

        // hack vue-router replace for replaceFlag
        const routerReplace = router.replace.bind(router)
        const routerPush = router.push.bind(router)
        let replaceFlag = false
        let pushFlag = false
        router.replace = (location, onComplete, onAbort) => {
            replaceFlag = true
            routerReplace(location, onComplete, onAbort)
        }

        router.push = (location, onComplete, onAbort) => {
            pushFlag = true
            routerPush(location, onComplete, onAbort)
        }
        // record router change
        router.afterEach((to, from) => {
            // 该 forward 用于区分『手动触发 router push』与『点击浏览器前进』，对比新推入的路由路径与本地记录的倒数第二个路径是否相等，若不相等则视为触发浏览器的前进操作
            const forward = (Routes[Routes.length - 2] || {}).path !== to.path;
            navigator.record(to, from, replaceFlag, pushFlag || forward)
            replaceFlag = false
            pushFlag = false
        })

        Vue.component('navigation', NavComponent(keyName))

        Vue.navigation = Vue.prototype.$navigation = {
            on: (event, callback) => {
                bus.$on(event, callback)
            },
            once: (event, callback) => {
                bus.$once(event, callback)
            },
            off: (event, callback) => {
                bus.$off(event, callback)
            },
            getRoutes: () => Routes.slice(),
            cleanRoutes: () => navigator.reset()
        }
    }
}
