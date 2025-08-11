import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DraftsComponent } from './drafts/drafts.component';

const routes: Routes = [
  {
    path: '',
    component: DraftsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DraftsRoutingModule {}
