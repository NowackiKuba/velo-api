type BenchmarkOptions = {
  baseUrl?: string;
  projectId?: string;
  totalRequests?: number;
  concurrencyLimit?: number;
};

const DEFAULT_PROJECT_ID = 'e3775302-a0c7-41ff-9a0f-56bacf5d0a7b';

const payload = {
  event: 'benchmark.test',
  timestamp: new Date().toISOString(),
  data: {
    foo: 'bar',
    nested: { info: 'Velo performance test' },
  },
};

async function sendRequest(targetUrl: string): Promise<{ success: boolean; latency: number; status: number }> {
  const start = performance.now();

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Provider': 'stripe',
      },
      body: JSON.stringify(payload),
    });

    const latency = performance.now() - start;
    return { success: response.status === 202, latency, status: response.status };
  } catch {
    const latency = performance.now() - start;
    return { success: false, latency, status: 0 };
  }
}

export async function runBenchmark(options: BenchmarkOptions = {}) {
  const baseUrl = options.baseUrl ?? 'http://localhost:3000';
  const projectId = options.projectId ?? process.env.BENCHMARK_PROJECT_ID ?? DEFAULT_PROJECT_ID;
  const totalRequests = options.totalRequests ?? Number(process.env.BENCHMARK_REQUESTS ?? 10000);
  const concurrencyLimit = options.concurrencyLimit ?? Number(process.env.BENCHMARK_CONCURRENCY ?? 50);
  const targetUrl = `${baseUrl}/api/v1/ingest/${projectId}`;

  console.log(`\n🚀 Running benchmark: ${totalRequests} requests → ${targetUrl}`);
  const startTime = performance.now();

  const results: Array<{ success: boolean; latency: number; status: number }> = [];
  const queue = Array.from({ length: totalRequests }, (_, i) => i);

  async function worker() {
    while (queue.length > 0) {
      const id = queue.pop();
      if (id === undefined) break;
      results.push(await sendRequest(targetUrl));
    }
  }

  await Promise.all(Array.from({ length: concurrencyLimit }, () => worker()));

  const totalTimeMs = performance.now() - startTime;
  const successful = results.filter((r) => r.success).length;
  const failed = totalRequests - successful;
  const latencies = results.map((r) => r.latency).sort((a, b) => a - b);
  const avgLatency = latencies.reduce((acc, l) => acc + l, 0) / totalRequests;
  const p95Latency = latencies[Math.floor(totalRequests * 0.95)] ?? 0;

  console.log('\n📊 === BENCHMARK RESULTS ===');
  console.log(`⏱️  Total time: ${(totalTimeMs / 1000).toFixed(2)}s`);
  console.log(`🚀 Throughput: ${(totalRequests / (totalTimeMs / 1000)).toFixed(0)} req/sec`);
  console.log(`✅ Success (202 Accepted): ${successful}/${totalRequests}`);
  console.log(`❌ Failures: ${failed}/${totalRequests}`);
  console.log(`📉 Avg API latency: ${avgLatency.toFixed(1)}ms`);
  console.log(`⚡ p95: ${p95Latency.toFixed(1)}ms`);

  if (failed > 0) {
    const statusCounts = results.reduce<Record<number, number>>((acc, result) => {
      acc[result.status] = (acc[result.status] ?? 0) + 1;
      return acc;
    }, {});
    console.log('📋 Status breakdown:', statusCounts);
  }
}

if (import.meta.main) {
  void runBenchmark();
}
