import {
  Injectable, CanActivate, ExecutionContext
} from '@nestjs/common';
import { STATUS } from 'src/kernel/constants';
import { AuthService } from '../services';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization || request?.query?.authorization || request?.query?.Authorization;
    if (!token) return false;
    const decodded = await this.authService.verifyJWT(token);
    if (!decodded) {
      return false;
    }
    const user = request.user || await this.authService.getSourceFromJWT(token);
    if (!user || user.status !== STATUS.ACTIVE) {
      return false;
    }
    if (!request.user) request.user = user;
    if (!request.authUser) request.authUser = decodded;
    if (!request.jwToken) request.jwToken = token;
    return true;
  }
}
