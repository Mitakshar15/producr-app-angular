import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SamplePacksComponent } from './sample-packs.component';
import { SamplePackUploadComponent } from './sample-pack-upload/sample-pack-upload.component';
import { SamplePackDetailComponent } from './sample-pack-detail/sample-pack-detail.component';
import { TrackPlayerComponent } from '../../shared/track-player/track-player.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatTooltipModule,
    SamplePacksComponent,
    SamplePackUploadComponent,
    SamplePackDetailComponent,
    TrackPlayerComponent
  ],
  exports: [
    SamplePacksComponent,
    SamplePackUploadComponent,
    SamplePackDetailComponent
  ]
})
export class SamplePacksModule { }
