import { AsyncPipe, DatePipe } from '@angular/common';
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
    DatePipe,
  ],
  providers: [ProfileReaderService],
  template: `
    @if(( this.user$()|async ); as user) {
    <div class="headline">
      <img [src]="user.picture" />
      <div class="info">
        <h1>{{ user.username }}</h1>
        <p>{{ user.created_at | date }}</p>
      </div>
    </div>

    <div class="post-comments">
      <div class="posts">
        @if (user.posts.length) {
        <h2>Posts</h2>
        <app-post-list-med [posts]="user.posts"></app-post-list-med>
        } @else {
        <h2>This user has no posts!</h2>
        }
      </div>
      <div class="comments">
        @if (user.comments.length) {

        <h2>Comments</h2>
        @for (comment of user.comments; track comment.id) {
        <div>
          <p>
            On post:
            <a
              [routerLink]="
                comment.post_name
                  ? ['/', comment.post_name]
                  : ['/p', comment.post_id]
              "
              >{{ comment.post_title }}</a
            >
          </p>

          <div class="comment">
            <img [src]="user.picture" class="comment-picture" />
            <p>{{ comment.content }}</p>
          </div>
        </div>
        } } @else {

        <h2>This user has no comments!</h2>
        }
      </div>
    </div>
    } @else {
    <mat-spinner></mat-spinner>
    }
  `,
  styles: `
    @use 'mixins' as mixs;
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

      .info {
        display: flex;
        flex-flow: column nowrap;
        gap: 0.5rem;
        justify-content: center;

        h1 {
          color: var(--mat-sys-primary);
        }

        & > * {
          margin: 0;
        }
      }
    }

    .post-comments {
      display: flex;
      flex-flow: row nowrap;
      gap: 2rem;

      @include mixs.for-size(handset) {
        flex-flow: column;
      }
    }
    .posts {
      flex-basis: 50%;
    }

    a {
      color: var(--mat-sys-primary);
      font-weight: bold;
    }

    mat-spinner {
      margin: auto;
    }

    .comment {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      gap: 1rem;

      .comment-picture {
        width: 2rem;
        height: 2rem;
        border-radius: 100%;
      }
    }

    .comments {
      flex-basis: 50%;
      display: flex;
      flex-flow: column nowrap;
    }
  `,
})
export class UserProfileComponent {
  readerS = inject(ProfileReaderService);
  userId = input.required<string>();

  user$ = computed(() => this.readerS.getUser(this.userId()));
}
