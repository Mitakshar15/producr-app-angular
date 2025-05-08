import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  SamplePack, 
  SamplePackResponse, 
  PublishedSamplePackResponse, 
  SamplePackUploadRequest 
} from '../interfaces/sample-pack.interface';

@Injectable({
  providedIn: 'root'
})
export class SamplePackService {
  private apiUrl = `${environment.apiBaseUrl}/v1/sample-packs`;

  constructor(private http: HttpClient) {}

  /**
   * Upload a new sample pack
   * @param samplePackData The sample pack data to upload
   * @returns Observable with the created sample pack
   */
  uploadSamplePack(samplePackData: SamplePackUploadRequest): Observable<SamplePackResponse> {
    const formData = new FormData();
    formData.append('file', samplePackData.file);
    formData.append('title', samplePackData.title);
    formData.append('description', samplePackData.description);
    formData.append('price', samplePackData.price.toString());
    formData.append('enablePreviews', samplePackData.enablePreviews.toString());

    // Simple post request - Angular will handle the multipart/form-data
    // The auth interceptor will add the Authorization header
    return this.http.post<SamplePackResponse>(this.apiUrl, formData);
  }

  /**
   * Get all published sample packs
   * @param page Page number for pagination
   * @param size Number of items per page
   * @returns Observable with the list of published sample packs
   */
  getPublishedSamplePacks(page: number = 0, size: number = 20): Observable<PublishedSamplePackResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PublishedSamplePackResponse>(this.apiUrl, { params });
  }

  /**
   * Get a specific sample pack by ID
   * @param id The ID of the sample pack to retrieve
   * @returns Observable with the sample pack details
   */
  getSamplePack(id: string): Observable<SamplePackResponse> {
    return this.http.get<SamplePackResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get sample packs created by the current user
   * @param page Page number for pagination
   * @param size Number of items per page
   * @returns Observable with the list of user's sample packs
   */
  getUserSamplePacks(page: number = 0, size: number = 20): Observable<PublishedSamplePackResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PublishedSamplePackResponse>(`${this.apiUrl}/unpublished`, { params });
  }

  /**
   * Delete a sample pack
   * @param id The ID of the sample pack to delete
   * @returns Observable with the deletion response
   */
  deleteSamplePack(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Update a sample pack's details
   * @param id The ID of the sample pack to update
   * @param updateData The updated sample pack data
   * @returns Observable with the updated sample pack
   */
  updateSamplePack(id: string, updateData: Partial<SamplePack>): Observable<SamplePackResponse> {
    return this.http.put<SamplePackResponse>(`${this.apiUrl}/${id}`, updateData);
  }

  /**
   * Publish or unpublish a sample pack
   * @param id The ID of the sample pack
   * @param publish Whether to publish (true) or unpublish (false)
   * @returns Observable with the updated sample pack
   */
  togglePublishStatus(id: string, publish: boolean): Observable<SamplePackResponse> {
    return this.http.put<SamplePackResponse>(`${this.apiUrl}/${id}/publish`, { published: publish });
  }
}
