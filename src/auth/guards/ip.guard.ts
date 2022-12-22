import * as requestIp from '@supercharge/request-ip';
import { CanActivate, ExecutionContext, mixin, Type } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt.auth.guard";

export const IpGuard = (allowedIps: string[]): Type<CanActivate> => {
  class IpGuardMixin extends JwtAuthGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const request = context.switchToHttp().getRequest();
      const reqIp = requestIp.getClientIp(request);
      console.log(reqIp);
      return (allowedIps.includes(reqIp));
    }
  }

  return mixin(IpGuardMixin);
}