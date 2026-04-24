// // bootstrap the app (create server + start listening)
// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { EventsModule } from './events/events.module';

// @Module({
//   imports: [EventsModule],
//   // load feature modules (events)

//   controllers: [AppController],
//   // handle incoming requests (entry points)

//   providers: [AppService],
//   // provide business logic (used by controllers)
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
