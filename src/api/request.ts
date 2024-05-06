import axios, { AxiosRequestConfig } from 'axios';

const instance = axios.create({
  // baseURL: 'http://localhost:8432/v1',
  baseURL: 'https://hangpiao.blogwxb.cn/goMiddlePlatform/v1',
  timeout: 1000 * 60,
});

instance.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      //   if (response.data.code === 10003) {
      //     localStorage.clear();
      //     window.location.reload();
      //     return;
      //   }
      return response.data;
    } else {
      Promise.reject();
    }
  },
  (error) => {
    console.log(error);
    return Promise.reject();
  }
);

function request(url: string, options: AxiosRequestConfig = {}) {
  return new Promise((resolve, reject) => {
    const token = window.localStorage.getItem('token');
    const headers = {
      token,
    };

    if (options.method === 'get' || options.method === 'delete') {
      if (options.data && typeof options.data === 'object') {
        url = `${url}?`;
        let count = 0;
        for (const k in options.data) {
          if (count > 0) {
            url += '&' + k + '=' + options.data[k];
          } else {
            url += k + '=' + options.data[k];
          }
          count++;
        }
      }

      return instance[options.method](url, {
        ...options,
        headers,
      })
        .then((response) => {
          resolve(response);
        })
        .catch((response) => {
          reject(response);
        });
    } else if (options.method === 'post') {
      return instance
        .post(url, options.data, { headers })
        .then((response) => {
          resolve(response);
        })
        .catch((response) => {
          resolve({
            success: false,
          });
        });
    } else if (options.method === 'put') {
      return instance
        .put(url, options.data, { headers })
        .then((response) => {
          resolve(response);
        })
        .catch((response) => {
          resolve({
            success: false,
          });
        });
    }
  });
}

export default request;
