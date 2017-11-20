import axios from 'axios';
import Api from '../configs/api';

if (__DEV__) {
  let data = Mock.mock({
    "status": 200,  // 状态码
    "data|0-9": {
      "id": "@guid",
      "name": "@cname",
      "address": "@county(true)",
      "website": "@url",
      "email": "@email"
    },     // 数据内容
    "code": "001",  // 业务返回码
    "message": ""   // 消息文本（有业务返回码时，此字段可不显示）
  });

  console.log('(1) data',data);

  let mock = new MockAdapter(axios);

  // 模拟 200 请求
  mock.onGet(Api.getData).reply(data.status, data);
  // 模拟网络错误请求
  // mock.onGet(Api.getData).networkError();
  // 模拟超时请求
  // mock.onGet(Api.getData).timeout();
}

export function getData() {
  return axios.get(Api.getData);
}