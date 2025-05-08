import { HttpEvent, HttpEventType, HttpInterceptorFn, HttpResponse, HttpRequest } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UploadProgressService } from '../services/upload-progress.service';
import { inject } from '@angular/core';

export const uploadProgressInterceptor: HttpInterceptorFn = (req, next) => {
  // Only handle FormData requests
  if (!(req.body instanceof FormData)) {
    return next(req);
  }

  const uploadProgressService = inject(UploadProgressService);
  
  // Clone the request to add the reportProgress option
  const clonedReq = req.clone({
    reportProgress: true
  });
  
  return next(clonedReq).pipe(
    tap((event: HttpEvent<unknown>) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        // Calculate the upload percentage
        const percentDone = Math.round(100 * event.loaded / event.total);
        uploadProgressService.updateProgress(req.url, percentDone);
      } else if (event instanceof HttpResponse) {
        // Upload complete
        uploadProgressService.updateProgress(req.url, 100);
      }
    })
  );
};
