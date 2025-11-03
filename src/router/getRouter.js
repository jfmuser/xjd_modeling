import Router from './routers/router';

export default (router) => {
    let newRouter = []
    Router.forEach(item => {
        if (router.includes('authRole.binding')) {
            router.push('auth-role-permission')
        }
        if (router.includes(item.name)) {
            newRouter.push(item)
        }
    })
    return newRouter
}