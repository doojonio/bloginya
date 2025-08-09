import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShortnameComponent } from './shortname/shortname.component';

const routes: Routes = [
  {
    path: '',
    component: ShortnameComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShortnameRoutingModule {}
