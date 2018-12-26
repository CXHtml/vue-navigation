let routes = []

if (window.sessionStorage.VUE_NAVIGATION) {
  routes = JSON.parse(window.sessionStorage.VUE_NAVIGATION)
}

export const getRoutesMap = () => routes.reduce((result, route) => {
    result[route.path] = route.key;
    return result;
}, {});

export default routes
