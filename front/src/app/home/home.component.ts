import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface NewPost {
  picture: string;
  category_name: string;
  created_at: Date;
  title: string;
  tags: string[];
}

export interface LanguageBlog {
  id: string;
  picture: string;
  title: string;
  descr: string;
  tags: string[];
}

export interface PopularBlog {
  id: string;
  picture: string;
}

@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
    UpperCasePipe,
    MatChipsModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private breakpointObserver = inject(BreakpointObserver);
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  langs: string[] = ['English', 'Korean', 'Chinese', 'Russian', 'Japanese'];
  selected: string = 'English';

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

  langBlogs: LanguageBlog[] = [
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
  popular: PopularBlog[] = [
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
}
