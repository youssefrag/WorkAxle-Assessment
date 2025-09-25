import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "POLICY_PACKAGE",
        transport: Transport.GRPC,
        options: {
          package: 'policy',
          protoPath: join(__dirname, '../../proto/policy.proto'),
          url: process.env.POLICY_GRPC_URL || 'policy:50051',
          loader: {keepCase: true}
        }
      }
    ])
  ],
  exports: [ClientsModule]
})
export class PolicyClientModule {}