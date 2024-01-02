import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { UserType, jwtSecret } from 'src/utils/constant';
@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse<Response>();

        const token = this.extractTokenFromCookies(request);
        if (!token) {
            response.redirect('/admin/');
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: jwtSecret,
            });
            request['username'] = payload.username;
            request['user_id'] = payload.id;
            request['user_type'] = payload.type;
            if (payload.type != UserType.ADMIN) {
                throw new UnauthorizedException();
            }
        } catch {
            response.redirect('/admin/');
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromCookies(request: Request): string | undefined {
        const token = request.cookies.access_token ?? '';
        return token;
    }
}
