/**
* vue-navigation v1.1.4
* https://github.com/zack24q/vue-navigation
* Released under the MIT License.
*/

var routes = [];

if (window.sessionStorage.VUE_NAVIGATION) {
    routes = JSON.parse(window.sessionStorage.VUE_NAVIGATION);
}

var getRoutesMap = function getRoutesMap() {
    return routes.reduce(function (result, route) {
        result[route.path] = route.key;
        return result;
    }, {});
};

var Routes = routes;

function genKey() {
    var t = 'xxxxxxxx';
    return t.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
}

function getKey(path, key) {
    return path + '__navigation_routers_index' + (key ? '__' + key : '');
}

function matches(pattern, name) {
    if (Array.isArray(pattern)) {
        return pattern.indexOf(name) > -1;
    } else if (typeof pattern === 'string') {
        return pattern.split(',').indexOf(name) > -1;
    } else if (isRegExp(pattern)) {
        return pattern.test(name);
    }
    return false;
}

var mergePush = Routes.push.bind(Routes);

Routes.push = function (item) {
    var path = item.path,
        key = item.key;

    Routes.forEach(function (route) {
        return route.path === path && (route.key = key);
    });
    mergePush(item);
};

var Navigator = (function (bus, store, moduleName, keyName) {
    if (store) {
        store.registerModule(moduleName, {
            state: {
                routes: Routes
            },
            mutations: {
                'navigation/FORWARD': function navigationFORWARD(state, _ref) {
                    var to = _ref.to,
                        from = _ref.from,
                        name = _ref.name;

                    state.routes.push({ path: name, key: genKey() });
                },
                'navigation/BACK': function navigationBACK(state, _ref2) {
                    var to = _ref2.to,
                        from = _ref2.from,
                        count = _ref2.count;

                    state.routes.splice(state.routes.length - count, count);
                },
                'navigation/REPLACE': function navigationREPLACE(state, _ref3) {
                    var to = _ref3.to,
                        from = _ref3.from,
                        name = _ref3.name;

                    state.routes.splice(Routes.length - 1, 1, { path: name, key: genKey() });
                },
                'navigation/REFRESH': function navigationREFRESH(state, _ref4) {
                    var to = _ref4.to,
                        from = _ref4.from;
                },
                'navigation/RESET': function navigationRESET(state) {
                    state.routes.splice(0, state.routes.length);
                }
            }
        });
    }

    var forward = function forward(name, toRoute, fromRoute, pushFlag) {
        var to = { route: toRoute };
        var from = { route: fromRoute };
        var routes = store ? store.state[moduleName].routes : Routes;

        from.name = (routes[routes.length - 1] || {}).path || null;
        to.name = name;
        store ? store.commit('navigation/FORWARD', { to: to, from: from, name: name }) : routes.push({ path: name, key: genKey() });
        window.sessionStorage.VUE_NAVIGATION = JSON.stringify(routes);
        bus.$emit('forward', to, from);
    };
    var back = function back(count, toRoute, fromRoute) {
        var to = { route: toRoute };
        var from = { route: fromRoute };
        var routes = store ? store.state[moduleName].routes : Routes;
        from.name = routes[routes.length - 1].path;
        to.name = routes[routes.length - 1 - count].path;
        store ? store.commit('navigation/BACK', { to: to, from: from, count: count }) : routes.splice(Routes.length - count, count);
        window.sessionStorage.VUE_NAVIGATION = JSON.stringify(routes);
        bus.$emit('back', to, from);
    };
    var replace = function replace(name, toRoute, fromRoute) {
        var to = { route: toRoute };
        var from = { route: fromRoute };
        var routes = store ? store.state[moduleName].routes : Routes;

        from.name = routes[routes.length - 1].path || null;
        to.name = name;
        store ? store.commit('navigation/REPLACE', { to: to, from: from, name: name }) : routes.splice(Routes.length - 1, 1, { path: name, key: genKey() });
        window.sessionStorage.VUE_NAVIGATION = JSON.stringify(routes);
        bus.$emit('replace', to, from);
    };
    var refresh = function refresh(toRoute, fromRoute) {
        var to = { route: toRoute };
        var from = { route: fromRoute };
        var routes = store ? store.state[moduleName].routes : Routes;
        to.name = from.name = routes[routes.length - 1].path;
        store ? store.commit('navigation/REFRESH', { to: to, from: from }) : null;
        bus.$emit('refresh', to, from);
    };
    var reset = function reset() {
        store ? store.commit('navigation/RESET') : Routes.splice(0, Routes.length);
        window.sessionStorage.VUE_NAVIGATION = JSON.stringify([]);
        bus.$emit('reset');
    };

    var record = function record(toRoute, fromRoute, replaceFlag, pushFlag) {
        var name = toRoute.path;
        if (replaceFlag) {
            replace(name, toRoute, fromRoute);
        } else {
            if (!getRoutesMap()[name] || pushFlag) {
                forward(name, toRoute, fromRoute);
            } else if (name === Routes[Routes.length - 1].path) {
                refresh(toRoute, fromRoute);
            } else {
                back(1, toRoute, fromRoute);
            }
        }
    };

    return {
        record: record, reset: reset
    };
});

var NavComponent = (function (keyName) {
    return {
        name: 'navigation',
        abstract: true,
        props: {},
        data: function data() {
            return {
                routes: Routes
            };
        },
        computed: {},
        watch: {
            routes: function routes(val) {
                var keys = val.map(function (_ref) {
                    var path = _ref.path,
                        key = _ref.key;
                    return path + '__navigation_routers_index__' + key;
                });
                for (var key in this.cache) {
                    if (!matches(keys, key)) {
                        var vnode = this.cache[key];
                        vnode && vnode.componentInstance.$destroy();
                        delete this.cache[key];
                    }
                }
            }
        },
        created: function created() {
            this.cache = {};
        },
        destroyed: function destroyed() {
            for (var key in this.cache) {
                var vnode = this.cache[key];
                vnode && vnode.componentInstance.$destroy();
            }
        },
        render: function render() {
            var vnode = this.$slots.default ? this.$slots.default[0] : null;
            if (vnode) {
                vnode.key = vnode.key || (vnode.isComment ? 'comment' : vnode.tag);

                var routesMap = getRoutesMap();
                var key = getKey(this.$route.path, routesMap[this.$route.path]);
                if (vnode.key.indexOf(key) === -1) {
                    vnode.key = '__navigation-' + key + '-' + vnode.key;
                }
                if (this.cache[key]) {
                    if (vnode.key === this.cache[key].key) {
                        vnode.componentInstance = this.cache[key].componentInstance;
                    } else {
                        this.cache[key].componentInstance.$destroy();
                        this.cache[key] = vnode;
                    }
                } else {
                    this.cache[key] = vnode;
                }
                vnode.data.keepAlive = true;
            }
            return vnode;
        }
    };
});

var index = {
    install: function install(Vue) {
        var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            router = _ref.router,
            store = _ref.store,
            _ref$moduleName = _ref.moduleName,
            moduleName = _ref$moduleName === undefined ? 'navigation' : _ref$moduleName,
            _ref$keyName = _ref.keyName,
            keyName = _ref$keyName === undefined ? 'VNK' : _ref$keyName;

        if (!router) {
            console.error('vue-navigation need options: router');
            return;
        }

        var bus = new Vue();
        var navigator = Navigator(bus, store, moduleName, keyName);

        var routerReplace = router.replace.bind(router);
        var routerPush = router.push.bind(router);
        var replaceFlag = false;
        var pushFlag = false;
        router.replace = function (location, onComplete, onAbort) {
            replaceFlag = true;
            routerReplace(location, onComplete, onAbort);
        };

        router.push = function (location, onComplete, onAbort) {
            pushFlag = true;
            routerPush(location, onComplete, onAbort);
        };

        router.afterEach(function (to, from) {
            var forward = (Routes[Routes.length - 2] || {}).path !== to.path;
            navigator.record(to, from, replaceFlag, pushFlag || forward);
            replaceFlag = false;
            pushFlag = false;
        });

        Vue.component('navigation', NavComponent(keyName));

        Vue.navigation = Vue.prototype.$navigation = {
            on: function on(event, callback) {
                bus.$on(event, callback);
            },
            once: function once(event, callback) {
                bus.$once(event, callback);
            },
            off: function off(event, callback) {
                bus.$off(event, callback);
            },
            getRoutes: function getRoutes() {
                return Routes.slice();
            },
            cleanRoutes: function cleanRoutes() {
                return navigator.reset();
            }
        };
    }
};

export default index;
