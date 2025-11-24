import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RootComponent } from './components/root/root.component';
import { TrashComponent } from './components/trash/trash.component';

const routes: Routes = [
  {
    path: '',
    component: RootComponent,
  },
  { path: 'trash', component: TrashComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
