import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { AdminState } from '../../common/enums';
import { AdminGrade } from '../../common/enums';
import { JwtAuthGuard } from './jwt.auth.guard';
import { RequestWithUser } from '../interfaces';

export const RoleGuard = (grade: AdminGrade): Type<CanActivate> => {
    class RoleGuardMixin extends JwtAuthGuard {
        async canActivate(context: ExecutionContext) {
            await super.canActivate(context);

            const request = context.switchToHttp().getRequest<RequestWithUser>();
            const admin = request.user;
            let isValid = false;

            if (admin?.adminState.includes(AdminState.ACTIVE)) {
                isValid = admin?.grade >= grade;
            }

            return isValid;
        }
    }

    return mixin(RoleGuardMixin);
};
