import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { PostListMedComponent } from '../shared/components/post-list-med/post-list-med.component';
import { ProfileReaderService } from './profile-reader.service';

@Component({
  selector: 'app-user-profile',
  imports: [
    AsyncPipe,
    MatProgressSpinnerModule,
    PostListMedComponent,
    RouterModule,
  ],
  providers: [ProfileReaderService],
  template: `
    @if(( this.user$()|async ); as user) {
    <div class="headline">
      <img [src]="user.picture" />
      <h1>{{ user.username }}</h1>
    </div>

    <div class="post-comments">
      <div class="posts">
        <h1>Posts</h1>
        <app-post-list-med [posts]="user.posts"></app-post-list-med>
      </div>
      <div class="comments">
        <h1>Comments</h1>
        @for (comment of user.comments; track comment.id) {
        <div>
          <h3>
            On post:
            <a
              [routerLink]="
                comment.post_name
                  ? ['/', comment.post_name]
                  : ['/p', comment.post_id]
              "
              >{{ comment.post_title }}</a
            >
          </h3>

          <div class="comment">
            <img [src]="user.picture" class="comment-picture" />
            <p>{{ comment.content }}</p>
          </div>
        </div>
        }
      </div>
    </div>
    } @else {
    <mat-spinner></mat-spinner>
    }
  `,
  styles: `
    :host {
      display: block;
      padding: 1rem;
    }

    .headline {
      display: flex;
      flex-flow: row nowrap;
      gap: 1rem;
      align-items: center;

      img {
        border-radius: 100%;
      }
    }

    .post-comments {
      display: flex;
      flex-flow: row nowrap;
      gap: 2rem;

    }
    .posts {
      flex-basis: 50%;
    }

    a {
      color: var(--mat-sys-primary);
    }

    mat-spinner {
      margin: auto;
    }

    .comment {
      display: flex;
      flex-flow: row nowrap;
      gap: 1rem;

      .comment-picture {
        width: 48px;
        height: 48px;
        border-radius: 100%;
      }
    }

    .comments {
      flex-basis: 50%;
    }
  `,
})
export class UserProfileComponent {
  readerS = inject(ProfileReaderService);
  userId = input.required<string>();

  user$ = computed(() => this.readerS.getUser(this.userId()));
}
