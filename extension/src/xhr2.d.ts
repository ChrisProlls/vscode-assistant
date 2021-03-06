declare module 'xhr2' {
    var Element: {
        prototype: any;
        new(): any;
      };

      interface Event {
        bubbles: boolean;
        cancelBubble: boolean;
        cancelable: boolean;
        currentTarget: EventTarget;
        defaultPrevented: boolean;
        eventPhase: number;
        isTrusted: boolean;
        returnValue: boolean;
        srcElement: any;
        target: EventTarget;
        timeStamp: number;
        type: string;
        initEvent(eventTypeArg: string, canBubbleArg: boolean, cancelableArg: boolean): void;
        preventDefault(): void;
        stopImmediatePropagation(): void;
        stopPropagation(): void;
        AT_TARGET: number;
        BUBBLING_PHASE: number;
        CAPTURING_PHASE: number;
      }
      
      var Event: {
        prototype: Event;
        new(type: string, eventInitDict?: EventInit): Event;
        AT_TARGET: number;
        BUBBLING_PHASE: number;
        CAPTURING_PHASE: number;
      };
      
      interface EventInit {
        bubbles?: boolean;
        cancelable?: boolean;
      }
      
      interface EventListener {
        (evt: Event): void;
      }
      
      interface EventListenerObject {
        handleEvent(evt: Event): void;
      }
      
      interface ProgressEventInit extends EventInit {
        lengthComputable?: boolean;
        loaded?: number;
        total?: number;
      }
      
      interface ErrorEvent extends Event {
          colno: number;
          error: any;
          filename: string;
          lineno: number;
          message: string;
          initErrorEvent(typeArg: string, canBubbleArg: boolean, cancelableArg: boolean, messageArg: string, filenameArg: string, linenoArg: number): void;
      }
      
      var ErrorEvent: {
          prototype: ErrorEvent;
          new(): ErrorEvent;
      };
      
      
      var ProgressEvent: {
        prototype: any;
        new(type: string, eventInitDict?: ProgressEventInit): any;
      };
      
      type EventListenerOrEventListenerObject = EventListener | EventListenerObject;
      
      interface EventTarget {
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
        dispatchEvent(evt: Event): boolean;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
      }
      
      interface XMLHttpRequestEventTarget {
        onabort: (ev: Event) => any;
        onerror: (ev: Event) => any;
        onload: (ev: Event) => any;
        onloadend: (ev: any) => any;
        onloadstart: (ev: Event) => any;
        onprogress: (ev: any) => any;
        ontimeout: (ev: any) => any;
        addEventListener(type: "abort", listener: (ev: Event) => any, useCapture?: boolean): void;
        addEventListener(type: "error", listener: (ev: ErrorEvent) => any, useCapture?: boolean): void;
        addEventListener(type: "load", listener: (ev: Event) => any, useCapture?: boolean): void;
        addEventListener(type: "loadend", listener: (ev: any) => any, useCapture?: boolean): void;
        addEventListener(type: "loadstart", listener: (ev: Event) => any, useCapture?: boolean): void;
        addEventListener(type: "progress", listener: (ev: any) => any, useCapture?: boolean): void;
        addEventListener(type: "timeout", listener: (ev: any) => any, useCapture?: boolean): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
      }
      
      interface XMLHttpRequest extends EventTarget, XMLHttpRequestEventTarget {
        msCaching: string;
        onreadystatechange: (ev: any) => any;
        readyState: number;
        response: any;
        responseBody: any;
        responseText: string;
        responseType: string;
        responseXML: any;
        status: number;
        statusText: string;
        timeout: number;
        upload: XMLHttpRequestUpload;
        withCredentials: boolean;
        abort(): void;
        getAllResponseHeaders(): string;
        getResponseHeader(header: string): string;
        msCachingEnabled(): boolean;
        open(method: string, url: string, async?: boolean, user?: string, password?: string): void;
        overrideMimeType(mime: string): void;
        send(data?: string): void;
        send(data?: any): void;
        setRequestHeader(header: string, value: string): void;
        DONE: number;
        HEADERS_RECEIVED: number;
        LOADING: number;
        OPENED: number;
        UNSENT: number;
        addEventListener(type: "abort", listener: (ev: Event) => any, useCapture?: boolean): void;
        addEventListener(type: "error", listener: (ev: ErrorEvent) => any, useCapture?: boolean): void;
        addEventListener(type: "load", listener: (ev: Event) => any, useCapture?: boolean): void;
        addEventListener(type: "loadend", listener: (ev: any) => any, useCapture?: boolean): void;
        addEventListener(type: "loadstart", listener: (ev: Event) => any, useCapture?: boolean): void;
        addEventListener(type: "progress", listener: (ev: any) => any, useCapture?: boolean): void;
        addEventListener(type: "readystatechange", listener: (ev: any) => any, useCapture?: boolean): void;
        addEventListener(type: "timeout", listener: (ev: any) => any, useCapture?: boolean): void;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
      }
      
      var XMLHttpRequest: {
        XMLHttpRequestUpload: XMLHttpRequestUpload;
        XMLHttpRequest: XMLHttpRequest;
        prototype: XMLHttpRequest;
        new(): XMLHttpRequest;
        DONE: number;
        HEADERS_RECEIVED: number;
        LOADING: number;
        OPENED: number;
        UNSENT: number;
        create(): XMLHttpRequest;
        nodejsSet(url: any): any;
      };
      
      interface XMLHttpRequestUpload {
          addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
      }
      
      var XMLHttpRequestUpload: {
        prototype: XMLHttpRequestUpload;
        new(): XMLHttpRequestUpload;
      };
      
      export = XMLHttpRequest;
} 