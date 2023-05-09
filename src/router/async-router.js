const addAsyncRouter = (router) => {
    const views = require.context('../views/demo', true, /\.vue$/)
    views.keys().forEach(path => {
        const name = path.replace('./', '').replace('.vue', '')
        router.addRoute({
            path: `/${name}`,
            name: `${name}`,
            component: () => import(`@/views/demo/${name}.vue`),
        })
    })
}

export default addAsyncRouter
