import { constantRoutes } from '@/router'
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const _import = path => resolve => require([`@/views/${path}`], resolve)

/**
 * 把用户可访问的导航菜单转换成路由格式对象
 * @param menus
 */
export function formatAsyncRoutes(menus) {
  const routes = []
  menus.forEach((item, index) => {
    routes[index] = {
      path: item.menuUrl,
      name: item.menuName === '' ? undefined : item.menuName,
      component: item.childs.length > 0 ? Layout : _import(item.menuUrl),
      // redirect: 'noRedirect',
      // alwaysShow: true,
      meta: item.menuName === '' ? undefined : { title: item.menuName, icon: item.icon },
      children: item.childs.length > 0 ? formatAsyncRoutes(item.childs) : undefined
    }
  })
  return routes
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) { // roles 是用户所带的权限
    return new Promise(resolve => {
      const { menus } = roles[0] // 用户权限所关联的导航菜单
      const accessedRoutes = formatAsyncRoutes(menus)
      accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })

      // let accessedRoutes
      // if (roles.includes('admin')) {
      //   accessedRoutes = asyncRoutes || []
      // } else {
      //   accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      // }
      console.log('Access Routes: ' + JSON.stringify(accessedRoutes))
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
