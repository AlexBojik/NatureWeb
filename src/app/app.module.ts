import '@angular/common/locales/global/ru';
import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {ImportComponent} from './import/import.component';
import {MenuComponent} from './menu/menu.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AdminComponent} from './menu/admin/admin.component';
import {ConnectDbComponent} from './menu/admin/db/connect-db/connect-db.component';
import {CreateDbComponent} from './menu/admin/db/create-db/create-db.component';
import {BackupDbComponent} from './menu/admin/db/backup-db/backup-db.component';
import {RestoreDbComponent} from './menu/admin/db/restore-db/restore-db.component';
import {CheckDbComponent} from './menu/admin/db/check-db/check-db.component';
import {RestoreDbTablesComponent} from './menu/admin/db/restore-db-tables/restore-db-tables.component';
import {RestoreDbIndexesComponent} from './menu/admin/db/restore-db-indexes/restore-db-indexes.component';
import {UsersComponent} from './users/users.component';
import {DictionariesComponent} from './menu/dictionaries/dictionaries.component';
import {FieldsComponent} from './fields/fields.component';
import {LayerTreeComponent} from './layers/layer-tree/layer-tree.component';
import {TypesComponent} from './types/types.component';
import {ObjectsComponent} from './objects/object/objects.component';
import {HttpClientModule} from '@angular/common/http';
import {MatTreeModule} from '@angular/material/tree';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MapboxComponent} from './mapbox/mapbox.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatRippleModule} from '@angular/material/core';
import {MatRadioModule} from '@angular/material/radio';
import {MatExpansionModule} from '@angular/material/expansion';
import {DataService} from './services/data.service';
import {UploadComponent} from './upload/upload.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';
import {LayerMainComponent} from './layers/layer-main/layer-main.component';
import {LayerSideComponent} from './layers/layer-side/layer-side.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {LayerDetailComponent} from './layers/layer-detail/layer-detail.component';
import {ObjectTableComponent} from './objects/object-table/object-table.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MAT_COLOR_FORMATS, NgxMatColorPickerModule, NGX_MAT_COLOR_FORMATS} from '@angular-material-components/color-picker';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTabsModule} from '@angular/material/tabs';
import {MatPaginatorModule} from '@angular/material/paginator';
import {ObjectFieldsComponent} from './object-fields/object-fields.component';
import {ObjectCoordinatesComponent} from './object-coordinates/object-coordinates.component';
import {CoordinatesDirective} from './coordinates.directive';
import {DictionaryComponent} from './menu/dictionaries/dictionary/dictionary.component';
import {MapComponent} from './map/map.component';
import {ImportKPTComponent} from './import-kpt/import-kpt.component';
import {WarningComponent} from './warning/warning.component';
import {InfoComponent} from './info/info.component';
import {FilterComponent} from './filter/filter.component';
import {MessagesComponent} from './messages/messages.component';
import {MessageComponent} from './messages/message/message.component';
import {MatBadgeModule} from '@angular/material/badge';
import {ImagesComponent} from './images/images.component';
import {CoordinateComponent} from './coordinate/coordinate.component';
import {BaseLayerComponent} from './base-layers/base-layer/base-layer.component';
import {BaseLayerListComponent} from './base-layers/base-layer-list/base-layer-list.component';
import {BaseLayerAdminComponent} from './base-layers/base-layer-admin/base-layer-admin.component';
import { UserListComponent } from './user-list/user-list.component';
import { NewsComponent } from './news/news.component';
import { NewsEditComponent } from './news/news-edit/news-edit.component';
import { NewsEditFormComponent } from './news/news-edit/news-edit-form/news-edit-form.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { UserComponent } from './user/user.component';
import { UserGroupComponent } from './user-group/user-group.component';
@NgModule({
  declarations: [
    AppComponent,
    ImportComponent,
    MenuComponent,
    AdminComponent,
    ConnectDbComponent,
    CreateDbComponent,
    BackupDbComponent,
    RestoreDbComponent,
    CheckDbComponent,
    RestoreDbTablesComponent,
    RestoreDbIndexesComponent,
    UsersComponent,
    DictionariesComponent,
    FieldsComponent,
    LayerTreeComponent,
    TypesComponent,
    ObjectsComponent,
    MapboxComponent,
    UploadComponent,
    LayerMainComponent,
    LayerSideComponent,
    LayerDetailComponent,
    ObjectTableComponent,
    ObjectFieldsComponent,
    ObjectCoordinatesComponent,
    CoordinatesDirective,
    DictionaryComponent,
    MapComponent,
    ImportKPTComponent,
    WarningComponent,
    InfoComponent,
    FilterComponent,
    MessagesComponent,
    MessageComponent,
    ImagesComponent,
    CoordinateComponent,
    BaseLayerComponent,
    BaseLayerListComponent,
    BaseLayerAdminComponent,
    UserListComponent,
    NewsComponent,
    NewsEditComponent,
    NewsEditFormComponent,
    UserComponent,
    UserGroupComponent,
  ],
  imports: [
    BrowserModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatTreeModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    FormsModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatListModule,
    MatSidenavModule,
    MatButtonToggleModule,
    MatRippleModule,
    MatRadioModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatCardModule,
    MatGridListModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NgxMatColorPickerModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatPaginatorModule,
    MatBadgeModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [DataService,
    {
      provide: MAT_COLOR_FORMATS, useValue: NGX_MAT_COLOR_FORMATS
    },
    {
      provide: LOCALE_ID, useValue: 'ru'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
