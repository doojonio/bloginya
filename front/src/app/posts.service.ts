import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  langs: string[] = ['English', 'Korean', 'Chinese', 'Russian', 'Japanese'];
  newPosts: NewPost[] = [
    {
      picture:
        'https://postfiles.pstatic.net/MjAyNDAyMjZfMTUw/MDAxNzA4OTMwNDUxMDMz.Djj0xHVfnj7IcVDtnTfzjCd-YKKEUS25373Thhuwz2Ag.yOERrqOoTDxetYq_LSxH1ZeYRzqawhEL_UZYNLJKQBcg.JPEG/IMG%EF%BC%BF20240215%EF%BC%BF130740.jpg?type=w3840',
      category_name: '한국어',
      created_at: new Date('2024-05-29'),
      title: '벚꽃 안녕하세요',
      tags: ['봄', '벚꽃'],
    },
    {
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfNTQg/MDAxNjc1NjA1ODEwNDU0.QXH7xTv9SxBrYtWPZ085-LL6wcCoq6mylvOQBFFiIc4g._7A86Wsv7nT5mCSRId1KbDNKSXa1PulyvqQHzZ9I6X8g.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113434.jpg?type=w3840',
      category_name: 'Russian',
      created_at: new Date('2024-05-29'),
      title: 'Здравствуйте, люди',
      tags: ['봄', '벚꽃'],
    },
    {
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfMTIw/MDAxNjc1NjA1ODEwNTc0.ab9g2lyX8XGYyD42iZqTL2pO2E3OcqtHX_NWKixMwyEg.UkBY579l2nVrATWec2p84oU6VhI8tMmv6oOe1wTyY7cg.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113440.jpg?type=w3840',
      category_name: 'English',
      created_at: new Date('2024-05-29'),
      title: 'Hello, people!',
      tags: ['봄', '벚꽃'],
    },
  ];
  langPosts: LangPost[] = [
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyNDAyMjZfMTUw/MDAxNzA4OTMwNDUxMDMz.Djj0xHVfnj7IcVDtnTfzjCd-YKKEUS25373Thhuwz2Ag.yOERrqOoTDxetYq_LSxH1ZeYRzqawhEL_UZYNLJKQBcg.JPEG/IMG%EF%BC%BF20240215%EF%BC%BF130740.jpg?type=w3840',
      title: '벚꽃 안녕하세요',
      descr: '안녕하세요 여러분. 십알',
      tags: ['봄', '벚꽃'],
    },
    {
      id: '321',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfNTQg/MDAxNjc1NjA1ODEwNDU0.QXH7xTv9SxBrYtWPZ085-LL6wcCoq6mylvOQBFFiIc4g._7A86Wsv7nT5mCSRId1KbDNKSXa1PulyvqQHzZ9I6X8g.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113434.jpg?type=w3840',
      descr: '안녕하세요 여러분. 십알',
      title: 'Здравствуйте, люди',
      tags: ['봄', '벚꽃'],
    },
    {
      id: '231',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfMTIw/MDAxNjc1NjA1ODEwNTc0.ab9g2lyX8XGYyD42iZqTL2pO2E3OcqtHX_NWKixMwyEg.UkBY579l2nVrATWec2p84oU6VhI8tMmv6oOe1wTyY7cg.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113440.jpg?type=w3840',
      descr: '안녕하세요 여러분. 십알',
      title: 'Hello, people!',
      tags: ['봄', '벚꽃'],
    },
  ];
  popularPosts: PopularPost[] = [
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyNDAyMjZfMTUw/MDAxNzA4OTMwNDUxMDMz.Djj0xHVfnj7IcVDtnTfzjCd-YKKEUS25373Thhuwz2Ag.yOERrqOoTDxetYq_LSxH1ZeYRzqawhEL_UZYNLJKQBcg.JPEG/IMG%EF%BC%BF20240215%EF%BC%BF130740.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfNTQg/MDAxNjc1NjA1ODEwNDU0.QXH7xTv9SxBrYtWPZ085-LL6wcCoq6mylvOQBFFiIc4g._7A86Wsv7nT5mCSRId1KbDNKSXa1PulyvqQHzZ9I6X8g.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113434.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfMTIw/MDAxNjc1NjA1ODEwNTc0.ab9g2lyX8XGYyD42iZqTL2pO2E3OcqtHX_NWKixMwyEg.UkBY579l2nVrATWec2p84oU6VhI8tMmv6oOe1wTyY7cg.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113440.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfNTQg/MDAxNjc1NjA1ODEwNDU0.QXH7xTv9SxBrYtWPZ085-LL6wcCoq6mylvOQBFFiIc4g._7A86Wsv7nT5mCSRId1KbDNKSXa1PulyvqQHzZ9I6X8g.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113434.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfMTIw/MDAxNjc1NjA1ODEwNTc0.ab9g2lyX8XGYyD42iZqTL2pO2E3OcqtHX_NWKixMwyEg.UkBY579l2nVrATWec2p84oU6VhI8tMmv6oOe1wTyY7cg.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113440.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyNDAyMjZfMTUw/MDAxNzA4OTMwNDUxMDMz.Djj0xHVfnj7IcVDtnTfzjCd-YKKEUS25373Thhuwz2Ag.yOERrqOoTDxetYq_LSxH1ZeYRzqawhEL_UZYNLJKQBcg.JPEG/IMG%EF%BC%BF20240215%EF%BC%BF130740.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyNDAyMjZfMTUw/MDAxNzA4OTMwNDUxMDMz.Djj0xHVfnj7IcVDtnTfzjCd-YKKEUS25373Thhuwz2Ag.yOERrqOoTDxetYq_LSxH1ZeYRzqawhEL_UZYNLJKQBcg.JPEG/IMG%EF%BC%BF20240215%EF%BC%BF130740.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfNTQg/MDAxNjc1NjA1ODEwNDU0.QXH7xTv9SxBrYtWPZ085-LL6wcCoq6mylvOQBFFiIc4g._7A86Wsv7nT5mCSRId1KbDNKSXa1PulyvqQHzZ9I6X8g.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113434.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfMTIw/MDAxNjc1NjA1ODEwNTc0.ab9g2lyX8XGYyD42iZqTL2pO2E3OcqtHX_NWKixMwyEg.UkBY579l2nVrATWec2p84oU6VhI8tMmv6oOe1wTyY7cg.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113440.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfNTQg/MDAxNjc1NjA1ODEwNDU0.QXH7xTv9SxBrYtWPZ085-LL6wcCoq6mylvOQBFFiIc4g._7A86Wsv7nT5mCSRId1KbDNKSXa1PulyvqQHzZ9I6X8g.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113434.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfMTIw/MDAxNjc1NjA1ODEwNTc0.ab9g2lyX8XGYyD42iZqTL2pO2E3OcqtHX_NWKixMwyEg.UkBY579l2nVrATWec2p84oU6VhI8tMmv6oOe1wTyY7cg.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113440.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyNDAyMjZfMTUw/MDAxNzA4OTMwNDUxMDMz.Djj0xHVfnj7IcVDtnTfzjCd-YKKEUS25373Thhuwz2Ag.yOERrqOoTDxetYq_LSxH1ZeYRzqawhEL_UZYNLJKQBcg.JPEG/IMG%EF%BC%BF20240215%EF%BC%BF130740.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyNDAyMjZfMTUw/MDAxNzA4OTMwNDUxMDMz.Djj0xHVfnj7IcVDtnTfzjCd-YKKEUS25373Thhuwz2Ag.yOERrqOoTDxetYq_LSxH1ZeYRzqawhEL_UZYNLJKQBcg.JPEG/IMG%EF%BC%BF20240215%EF%BC%BF130740.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfNTQg/MDAxNjc1NjA1ODEwNDU0.QXH7xTv9SxBrYtWPZ085-LL6wcCoq6mylvOQBFFiIc4g._7A86Wsv7nT5mCSRId1KbDNKSXa1PulyvqQHzZ9I6X8g.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113434.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfMTIw/MDAxNjc1NjA1ODEwNTc0.ab9g2lyX8XGYyD42iZqTL2pO2E3OcqtHX_NWKixMwyEg.UkBY579l2nVrATWec2p84oU6VhI8tMmv6oOe1wTyY7cg.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113440.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfNTQg/MDAxNjc1NjA1ODEwNDU0.QXH7xTv9SxBrYtWPZ085-LL6wcCoq6mylvOQBFFiIc4g._7A86Wsv7nT5mCSRId1KbDNKSXa1PulyvqQHzZ9I6X8g.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113434.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyMzAyMDVfMTIw/MDAxNjc1NjA1ODEwNTc0.ab9g2lyX8XGYyD42iZqTL2pO2E3OcqtHX_NWKixMwyEg.UkBY579l2nVrATWec2p84oU6VhI8tMmv6oOe1wTyY7cg.JPEG.ine1103/IMG%EF%BC%BF20230119%EF%BC%BF113440.jpg?type=w3840',
    },
    {
      id: '123',
      picture:
        'https://postfiles.pstatic.net/MjAyNDAyMjZfMTUw/MDAxNzA4OTMwNDUxMDMz.Djj0xHVfnj7IcVDtnTfzjCd-YKKEUS25373Thhuwz2Ag.yOERrqOoTDxetYq_LSxH1ZeYRzqawhEL_UZYNLJKQBcg.JPEG/IMG%EF%BC%BF20240215%EF%BC%BF130740.jpg?type=w3840',
    },
  ];

  constructor() {}

  getPopularPosts() {
    return of(this.popularPosts);
  }

  getNewPosts() {
    return of(this.newPosts);
  }

  getLangPosts(lang: string) {
    return of(this.langPosts);
  }

  getLangs() {
    return of(this.langs);
  }
}
export interface LangPost {
  id: string;
  picture: string;
  title: string;
  descr: string;
  tags: string[];
}
export interface PopularPost {
  id: string;
  picture: string;
}
export interface NewPost {
  picture: string;
  category_name: string;
  created_at: Date;
  title: string;
  tags: string[];
}
