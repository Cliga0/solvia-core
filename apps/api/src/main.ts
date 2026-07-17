import { bootstrapSolvia } from "@solvia/core";

import { AppModule } from "./app.module";


async function bootstrap(): Promise<void> {
  await bootstrapSolvia({
    module: AppModule,
  });
}

bootstrap();