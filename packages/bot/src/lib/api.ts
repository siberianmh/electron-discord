import axios, { AxiosRequestHeaders } from 'axios'

const baseURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'http://edis-server.default.svc.cluster.local:8080'

const headers: AxiosRequestHeaders =
  process.env.NODE_ENV === 'development'
    ? {}
    : { Authorization: `Bot ${process.env.SERVER_TOKEN}` }

export const api = axios.create({
  withCredentials: true,
  baseURL,
  headers,
})
