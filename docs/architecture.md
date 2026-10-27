## Core Components & Request Flow

OpenGP uses a modular NestJS architecture to retrieve motorsport data from external APIs and return it in a consistent format.

### Request Flow

```text
HTTP Request
    ↓
EventsController
Receives requests and extracts parameters
    ↓
EventsService
Selects and coordinates data providers
    ↓
RacingDataProviderRegistry
Resolves the appropriate provider for a racing series
    ↓
OpenF1Provider (example)
Manages F1-specific data retrieval and processing
    ├── OpenF1Client
    │   Fetches raw data from the OpenF1 API
    └── OpenF1Mapper
        Converts raw data into OpenGP's shared models
    ↓
EventsService → EventsController
    ↓
HTTP Response (JSON)
```

### Component Responsibilities

| Component | Responsibility |
|---|---|
| **Module** | Organizes and registers related components and dependencies. |
| **Controller** | Handles HTTP requests, extracts parameters, and returns responses. |
| **Service** | Coordinates business logic and data providers. |
| **Registry** | Resolves the appropriate racing data provider based on the series. |
| **Racing Data Provider** | Handles series-specific data retrieval, filtering, and processing. |
| **Client** | Communicates with external APIs, including HTTP requests, retries, and caching. |
| **Mapper** | Transforms external API data into OpenGP's standardized data models. |

**Design Principle:** The frontend consumes OpenGP's standardized API responses instead of depending directly on external data providers. This allows data sources to be replaced or extended with minimal impact on the frontend.

### Simple NestJS Example

The following simplified example demonstrates how a Module, Controller, Service, and Provider work together.

**Goal:** A request to `GET /hello` returns `"Hello OpenGP!"`.

**1. Module — Registers components**

```typescript
@Module({
  controllers: [HelloController],
  providers: [HelloService],
})
export class HelloModule {}
```

**2. Controller — Handles the HTTP request**

```typescript
@Controller()
export class HelloController {
  constructor(private readonly service: HelloService) {}

  @Get('hello')
  getHello() {
    return this.service.sayHello();
  }
}
```

**3. Service — Executes business logic**

```typescript
@Injectable()
export class HelloService {
  sayHello() {
    return 'Hello OpenGP!';
  }
}
```

**4. Provider — Supplies dependencies**

`HelloService` is also a NestJS Provider. By registering it in the Module's `providers` array, NestJS can automatically create and inject it into `HelloController`.

**Execution Flow:**

```text
Application Startup
    ↓
HelloModule
Registers HelloController and HelloService
    ↓
GET /hello
    ↓
HelloController.getHello()
    ↓
HelloService.sayHello()
    ↓
HTTP Response: "Hello OpenGP!"
```

The Module registers dependencies during application initialization; it does not execute for every HTTP request.

**Key Takeaway:**

- **Module:** Organizes components.
- **Controller:** Handles requests and responses.
- **Service:** Executes business logic.
- **NestJS Provider:** A managed, injectable dependency; services are commonly providers.

In OpenGP, `OpenF1Provider` is both a NestJS Provider and a racing-specific data provider. These are two different meanings of the word *Provider*.
