import { NextResponse } from 'next/server';
import Airtable from 'airtable';

const apiKey = process.env.AIRTABLE_ACCESS_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = 'Contact Form Submissions';

export async function GET() {
  if (typeof apiKey !== 'string' || typeof baseId !== 'string') {
    return NextResponse.json({ error: 'Airtable configuration is invalid' }, { status: 500 });
  }

  const base = new Airtable({ apiKey }).base(baseId);

  try {
    const testRecord = await base(tableName).create({
      Name: 'Test User',
      Email: 'test@example.com',
      Message: 'This is a test message',
    });
    return NextResponse.json({ message: 'Test record created', record: testRecord }, { status: 200 });
  } catch (error) {
    console.error('Error creating test record:', error);
    return NextResponse.json({ error: 'Failed to create test record' }, { status: 500 });
  }
}