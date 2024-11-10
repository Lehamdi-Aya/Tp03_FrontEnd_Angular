import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Product } from './product';
import { TracingService } from './tracing.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(
    private http: HttpClient,
    private tracingService: TracingService
  ) {}

  getAllProducts(): Observable<Product[]> {
    const headers = this.tracingService.getTraceHeaders();
    const span = this.tracingService.createSpan('getAllProducts');

    return this.http.get<Product[]>(this.apiUrl, { headers })
      .pipe(
        tap(() => span.end())
      );
  }

  getProductById(id: string): Observable<Product> {
    const headers = this.tracingService.getTraceHeaders();
    const span = this.tracingService.createSpan('getProductById');
    span.setAttribute('product.id', id);

    return this.http.get<Product>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        tap(() => span.end())
      );
  }

  createProduct(product: Product): Observable<Product> {
    const headers = this.tracingService.getTraceHeaders();
    const span = this.tracingService.createSpan('createProduct');

    return this.http.post<Product>(`${this.apiUrl}/add`, product, { headers })
      .pipe(
        tap(() => span.end())
      );
  }

  updateProduct(product: Product): Observable<Product> {
    const headers = this.tracingService.getTraceHeaders();
    const span = this.tracingService.createSpan('updateProduct');
    span.setAttribute('product.id', product.id);

    return this.http.put<Product>(`${this.apiUrl}/update/${product.id}`, product, { headers })
      .pipe(
        tap(() => span.end())
      );
  }

  deleteProduct(productId: string): Observable<void> {
    const headers = this.tracingService.getTraceHeaders();
    const span = this.tracingService.createSpan('deleteProduct');
    span.setAttribute('product.id', productId);

    return this.http.delete<void>(`${this.apiUrl}/delete/${productId}`, { headers })
      .pipe(
        tap(() => span.end())
      );
  }
}