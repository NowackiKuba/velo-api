// mock-client.ts
import { Elysia } from 'elysia';

const app = new Elysia()
  // Endpoint, pod który Twój worker będzie forwardował webhooki
  .post('/webhook-receiver', ({ body, headers, set }) => {
    console.log('\n==================================================');
    console.log(`📥 [${new Date().toLocaleTimeString()}] OTRZYMANO WEBHOOK Z SILNIKA VELO`);
    console.log('==================================================');

    // Zobacz, czy nagłówek zabezpieczający od Velo dociera poprawnie
    console.log('🛡️  Velo-Signature:', headers['x-velo-signature'] || 'BRAK SIGNATURE!');
    console.log('🔌 Provider:', headers['x-provider'] || 'unknown');

    console.log('\n📦 Payload (Dane):');
    console.log(JSON.stringify(body, null, 2));
    console.log('==================================================\n');

    // Zwracamy status 200, żeby worker wiedział, że klient odebrał paczkę z sukcesem
    set.status = 200;
    return {
      success: true,
      message: 'Webhook processed by mockup client successfully',
    };
  })

  // Możesz też dodać endpoint zwracający błąd do testowania scenariuszy awaryjnych (Edge Cases)
  .post('/webhook-fail-test', ({ set }) => {
    console.log('🚨 Symuluję awarię serwera klienta (Status 500)...');
    set.status = 500;
    return { error: 'Internal Server Error on client side' };
  })

  .listen(4000);

console.log(`🟢 Mock serwera klienta Velo nasłuchuje na: http://localhost:4000`);
console.log(`👉 Główny URL do testów: http://localhost:4000/webhook-receiver`);
