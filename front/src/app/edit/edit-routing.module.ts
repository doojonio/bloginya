import { RouterModule, Routes } from '@angular/router';
import { PostEditorComponent } from './components/post-editor/post-editor.component';

import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: ':postId',
    component: PostEditorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditRoutingModule {}
