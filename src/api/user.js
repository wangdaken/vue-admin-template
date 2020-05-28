import request from '@/utils/request'

export function login(data) {
  return request({
    url: 'http://localhost:8080/api/user/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: 'http://localhost:8080/api/user',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: 'http://localhost:8080/api/user/logout',
    method: 'post'
  })
}
