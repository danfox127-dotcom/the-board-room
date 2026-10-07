import { POST } from '../src/app/api/generate-category/route';
import { NextRequest } from 'next/server';

async function testApi() {
  console.log('Testing /api/generate-category route with procedural 2-pass fallback...');

  const request = new NextRequest('http://localhost:3000/api/generate-category', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: '1990s Hip Hop',
    }),
  });

  const response = await POST(request);
  const data = await response.json();

  console.log('Status:', response.status);
  console.log('Topic:', data.topic);
  console.log('Pass 1 title:', data.pass1?.title);
  console.log('Pass 1 clues count:', data.pass1?.clues?.length);
  console.log('Pass 2 auditNotes:', data.pass2?.auditNotes);
  console.log('Pass 2 refinementsMade:', data.pass2?.refinementsMade);
  console.log('Final Category clues tiered:', data.category?.clues?.map((c: any) => c.value));

  if (
    response.status === 200 &&
    data.pass1?.clues?.length === 5 &&
    data.pass2?.auditNotes?.length > 0 &&
    data.category?.clues?.length === 5
  ) {
    console.log('✓ PASS: API 2-Pass Generation Pipeline Verified!');
  } else {
    console.error('✗ FAIL: API did not return expected two-pass structure');
    process.exit(1);
  }
}

testApi().catch((err) => {
  console.error(err);
  process.exit(1);
});
