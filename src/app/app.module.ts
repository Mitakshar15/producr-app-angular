// This file can be safely deleted since we're using standalone components
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';

import { routes } from './app-routing.module';
import { AppComponent } from './app.component';
import { authInterceptor } from './interceptors/auth.interceptor';
import { uploadProgressInterceptor } from './interceptors/upload-progress.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    routes,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CommonModule
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, uploadProgressInterceptor]))
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
