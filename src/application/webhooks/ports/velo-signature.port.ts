export interface VeloSignaturePort {
  sign(payload: string, secret: string): string;
}
