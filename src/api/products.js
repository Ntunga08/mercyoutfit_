import api from './axios'

export const categoriesApi = {
  list: () => api.get('categories/'),
  create: (data) => api.post('categories/', data),
  update: (id, data) => api.patch(`categories/${id}/`, data),
  remove: (id) => api.delete(`categories/${id}/`),
}

export const productsApi = {
  list: () => api.get('products/'),
  get: (id) => api.get(`products/${id}/`),
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('products/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return api.post('products/', data)
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.patch(`products/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return api.patch(`products/${id}/`, data)
  },
  remove: (id) => api.delete(`products/${id}/`),
}

export const variantsApi = {
  list: () => api.get('variants/'),
  create: (data) => api.post('variants/', data),
  update: (id, data) => api.patch(`variants/${id}/`, data),
  remove: (id) => api.delete(`variants/${id}/`),
}
