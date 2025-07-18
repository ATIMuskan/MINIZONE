import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private baseUrl = 'http://localhost:5000/api/images';

  constructor(private http: HttpClient) {}

  uploadProductImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  getProductImages(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  removeProductImage(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  replaceProductImage(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.put(`${this.baseUrl}/${id}`, formData);
  }
}
