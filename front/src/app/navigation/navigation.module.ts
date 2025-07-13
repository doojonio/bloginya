import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatNavList } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { SearchComponent } from './components/search/search.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { NewDraftService } from './services/new-draft.service';
import { SearchService } from './services/search.service';

@NgModule({
  declarations: [
    NavigationComponent,
    SidenavComponent,
    ToolbarComponent,
    FooterComponent,
    SearchComponent,
  ],
  providers: [SearchService, NewDraftService],
  exports: [NavigationComponent],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatButtonModule,
    RouterModule,
    AsyncPipe,
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatNavList,
    MatSidenavModule,
    MatToolbarModule,
    RouterModule,
  ],
})
export class NavigationModule {}
export { NavigationComponent } from './components/navigation/navigation.component';
