import { describe, expect, test } from 'vitest';

import { getContentCover } from './content-cover';

describe('content cover helpers', () => {
  test('uses the explicit cover before defaulting', () => {
    expect(
      getContentCover({
        type: 'post',
        title: '文章',
        coverImageUrl: ' /uploads/custom.png ',
        coverAltText: ' 自定义封面 ',
      }),
    ).toEqual({
      imageUrl: '/uploads/custom.png',
      altText: '自定义封面',
      isDefault: false,
    });
  });

  test('omits the image area when no authored cover exists', () => {
    expect(getContentCover({ type: 'post', title: '没有封面的文章' })).toBeNull();
    expect(getContentCover({ type: 'post', title: '空封面', coverImageUrl: '  ' })).toBeNull();
  });

  test('does not add default article covers to non-post content', () => {
    expect(getContentCover({ type: 'note', title: '笔记' })).toBeNull();
    expect(getContentCover({ type: 'project', title: '项目' })).toBeNull();
  });
});
