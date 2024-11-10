import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TracingService } from './tracing.service';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { context, trace, SpanStatusCode } from '@opentelemetry/api';

@Injectable({
  providedIn: 'root'
})
export class TracedHttpService {
  constructor(
    private http: HttpClient,
    private tracingService: TracingService
  ) {}

  public get<T>(url: string, spanName: string): Observable<T> {
    const span = this.tracingService.createSpan(spanName);
    const ctx = trace.setSpan(context.active(), span);

    // Ajouter les en-têtes de propagation de trace
    const headers = new HttpHeaders({
      'traceparent': `00-${span.spanContext().traceId}-${span.spanContext().spanId}-01`,
      'tracestate': span.spanContext().traceState?.serialize() || ''
    });

    span.setAttribute('http.method', 'GET');
    span.setAttribute('http.url', url);

    return this.http.get<T>(url, { headers }).pipe(
      finalize(() => {
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
      })
    );
  }

  public post<T>(url: string, body: any, spanName: string): Observable<T> {
    const span = this.tracingService.createSpan(spanName);
    const ctx = trace.setSpan(context.active(), span);

    const headers = new HttpHeaders({
      'traceparent': `00-${span.spanContext().traceId}-${span.spanContext().spanId}-01`,
      'tracestate': span.spanContext().traceState?.serialize() || ''
    });

    span.setAttribute('http.method', 'POST');
    span.setAttribute('http.url', url);

    return this.http.post<T>(url, body, { headers }).pipe(
      finalize(() => {
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
      })
    );
  }

  
}