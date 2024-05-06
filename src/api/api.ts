import request from './request';

/**
 * 游戏得分上传
 */
export const digital = (data: any) => {
  return request('/game/addGameHistory', {
    method: 'post',
    data,
  });
};
