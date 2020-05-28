import request from '@/utils/request'

export function fetchAsyncRoutes(id) {
  return request({
    url: 'http://localhost:8080/api/role/' + { id },
    method: 'get'
  })
}
