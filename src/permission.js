import router from './router'
import store from './store'
import {Message} from 'element-ui'
import NProgress from 'nprogress' // progress bar 一个进度条插件
import 'nprogress/nprogress.css' // progress bar style
import {getToken} from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({showSpinner: false}) // NProgress Configuration 是否有转圈效果

const whiteList = ['/login'] // no redirect whitelist 没有重定向白名单

router.beforeEach(async (to, from, next) => {
  // start progress bar 开启进度条
  NProgress.start()

  // set page title 设置页面标题
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in 确定用户是否已登录
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page 如果已登录，则重定向到首页
      next({path: '/'})
      NProgress.done()
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        // 有角色信息
        next()
      } else {
        // 没有角色信息
        try {
          // get user info 获得用户信息
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const {roles} = await store.dispatch('user/getInfo')

          // generate accessible routes map based on roles 基于角色生成可访问的路由表
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // dynamically add accessible routes 动态添加可访问的路由表
          router.addRoutes(accessRoutes)

          // hack method to ensure that addRoutes is complete Hack
          // set the replace: true, so the navigation will not leave a history record
          next({...to, replace: true}) // 方法，确保 addRoutes 已完成
        } catch (error) {
          // remove token and go to login page to re-login 删除 Token 进入登录页面重新登录
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly 请求地址在白名单列表中，可以直接进去。
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      // 没有访问权限的页面将会被重定向到登录页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar 完成进度条
  NProgress.done()
})
