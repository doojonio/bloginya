import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TrashService } from '../../services/trash.service';

@Component({
  selector: 'app-trash',
  standalone: false,
  template: `
    @if(trash(); as trash) {

    <div class="posts-comments">
      <div class="posts">
        @if (trash.deleted_posts.length) {
        <h2>Deleted posts</h2>
        <app-post-list-med [posts]="trash.deleted_posts"></app-post-list-med>
        } @else {
        <h2>No posts to delete!</h2>
        }
      </div>
      <div class="comments">
        @if (trash.deleted_comments.length) {

        <h2>Deleted Comments</h2>
        @for (comment of trash.deleted_comments; track comment.id) {
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

            by
            <a routerLink="/user/{{ comment.user_id }}">{{
              comment.username
            }}</a>
          </p>

          <div class="comment">
            <img [src]="comment.user_picture" class="comment-picture" />
            <p>{{ comment.content }}</p>
          </div>
        </div>
        } } @else {

        <h2>No comments to delete!</h2>
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
    }
    .posts-comments {
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
export class TrashComponent {
  private readonly trashService = inject(TrashService);

  trash = toSignal(this.trashService.getTrash());
}
