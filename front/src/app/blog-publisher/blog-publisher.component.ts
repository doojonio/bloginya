import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  CollectionsService,
  ListCollectionsResponseItem,
} from '../collections.service';
import { NewCollectionComponent } from '../new-collection/new-collection.component';
import { BlogsService } from '../blogs.service';

@Component({
  selector: 'app-blog-publisher',
  imports: [
    MatIconModule,
    MatRippleModule,
    NewCollectionComponent,
    RouterModule,
  ],
  templateUrl: './blog-publisher.component.html',
  styleUrl: './blog-publisher.component.scss',
})
export class BlogPublisherComponent implements OnInit, OnDestroy {
  private collections = inject(CollectionsService);
  private blogs = inject(BlogsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  id?: string;
  parentId?: string;
  parentTitle?: string;
  parentImgSrc?: string;
  isCanAddNew: boolean = false;

  availableCollections: ListCollectionsResponseItem[] = [];
  isAdding = false;
  querySub: any;

  addCollection() {
    this.isAdding = true;
  }

  publishInCollection(collectionId?: string) {
    if (!this.id) {
      return;
    }

    this.blogs
      .publishBlog(this.id, collectionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.router.navigate(['/blog/', this.id]);
      });
  }

  onNewCollection(newCollection: ListCollectionsResponseItem) {
    this.availableCollections.unshift(newCollection);
    this.isAdding = false;
  }

  onNewCancel() {
    this.isAdding = false;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.querySub = this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const id = params.get('id');
        if (!id) {
          this.router.navigate(['/drafts']);
          return;
        }
        this.id = id;
        this.parentId = params.get('pid') || undefined;

        this.fetchCollections();
      });
  }

  fetchCollections() {
    this.collections
      .listCollections(this.parentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp) => {
        this.availableCollections.length = 0;
        for (const c of resp.collections) {
          this.availableCollections.push(c);
        }

        this.parentTitle = resp.parent_title;
        this.parentImgSrc = resp.parent_img_src;
        this.isCanAddNew = !resp.grandparent_id;
      });
  }

  navigateToCollection(pid: string) {
    return this.router.navigate(['/publish'], {
      queryParams: { id: this.id, pid },
    });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.destroy$.next();
    this.destroy$.complete();
  }
}
