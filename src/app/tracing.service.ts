import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { context, trace, Span } from '@opentelemetry/api';

@Injectable({
  providedIn: 'root'
})
export class TracingService {
  private tracer: any;

  constructor() {
    this.initializeTracing();
  }

  private initializeTracing() {
    // Create a tracer provider
    const provider = new WebTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'angular-frontend',
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0'
      }),
    });

    // Configure the Zipkin exporter
    const exporter = new ZipkinExporter({
      url: 'http://localhost:9411/api/v2/spans',
    });

    // Add the exporter to the provider
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

    // Register the provider
    provider.register();

    // Get a tracer
    this.tracer = trace.getTracer('default');
  }

  getTraceHeaders(): HttpHeaders {
    const currentSpan = trace.getSpan(context.active());
    const headers = new HttpHeaders();

    if (currentSpan) {
      const spanContext = currentSpan.spanContext();
      const traceId = spanContext.traceId;
      const spanId = spanContext.spanId;

      // Format W3C traceparent header
      headers.set('traceparent', `00-${traceId}-${spanId}-01`);

      if (spanContext.traceState) {
        headers.set('tracestate', spanContext.traceState.serialize());
      }
    }

    return headers;
  }

  createSpan(name: string): Span {
    return this.tracer.startSpan(name);
  }
}