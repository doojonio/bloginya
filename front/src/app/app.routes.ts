import { Routes } from '@angular/router';
import { BlogEditorComponent } from './blog-editor/blog-editor.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { BlogViewComponent } from './blog-view/blog-view.component';
import { DraftsComponent } from './drafts/drafts.component';
import { BlogPublisherComponent } from './blog-publisher/blog-publisher.component';
import { CollectionComponent } from './collection/collection.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'new', component: BlogEditorComponent },
  { path: 'blog/:id', component: BlogViewComponent },
  { path: 'edit/:id', component: BlogEditorComponent },
  { path: 'publish', component: BlogPublisherComponent },
  { path: 'drafts', component: DraftsComponent },
  { path: 'collection/:id', component: CollectionComponent },
  { path: '**', component: PageNotFoundComponent },
];
