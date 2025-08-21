import { NextResponse } from 'next/server';
import Airtable from 'airtable';

const apiKey = process.env.AIRTABLE_ACCESS_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = 'Contact Form Submissions';

export async function POST(request: Request) {
  console.log('API route called');
  console.log('API Key:', apiKey ? 'Set' : 'Not set');
  console.log('Base ID:', baseId ? 'Set' : 'Not set');
  console.log('Table Name:', tableName);

  if (typeof apiKey !== 'string' || typeof baseId !== 'string') {
    console.error('Airtable access token or base ID is missing or invalid');
    return NextResponse.json(
      { message: 'Airtable access token or base ID is missing or invalid' },
      { status: 500 }
    );
  }

  const base = new Airtable({ apiKey }).base(baseId);

  try {
    const { name, email, message } = await request.json();
    console.log('Received form data:', { name, email, message });

    console.log('Attempting to create record in Airtable...');
    const createdRecords = await base(tableName).create([
      {
        fields: {
          Name: name,
          Email: email,
          Message: message,
        },
      },
    ]);
    console.log('Airtable response:', JSON.stringify(createdRecords, null, 2));

    if (createdRecords.length === 0) {
      throw new Error('No records were created in Airtable');
    }

    return NextResponse.json({ message: 'Form submitted successfully', id: createdRecords[0].getId() }, { status: 200 });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { message: `Error submitting form: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }

  try {
    const testRecord = await base(tableName).create({
      Name: 'Test User',
      Email: 'test@example.com',
      Message: 'This is a test message',
    });
    console.log('Test record created:', JSON.stringify(testRecord, null, 2));
  } catch (testError) {
    console.error('Error creating test record:', testError);
  }
}