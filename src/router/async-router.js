const addAsyncRouter = (router) => {
    const views = require.context('../views/demo', true, /\.vue$/);
    views.keys().forEach(path=>{
        console.log(pathArr);
        // router.push({
        //     path:`/${pathArr[1]}`,
        //     name:`/${pathArr[1]}`,
        //     component:() => import(path),
        // })
    })
};

export default addAsyncRouter;
