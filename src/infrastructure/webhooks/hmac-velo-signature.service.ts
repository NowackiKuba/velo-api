import { VeloSignaturePort } from '@/application/webhooks/ports/velo-signature.port';
import { createHmac } from 'crypto';

export class HmacVeloSignatureService implements VeloSignaturePort {
  sign(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }
}
