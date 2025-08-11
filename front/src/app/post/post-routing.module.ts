import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostViewComponent } from './post-view/post-view.component';

const routes: Routes = [
  {
    path: ':postId',
    component: PostViewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostRoutingModule {}
