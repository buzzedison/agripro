import { NextResponse } from 'next/server';
import Airtable from 'airtable';

const apiKey = process.env.AIRTABLE_ACCESS_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = 'Contact Form Submissions';

export async function POST(request: Request) {
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

    // Create a record in Airtable
    const createdRecords = await base(tableName).create([
      {
        fields: {
          Name: name,
          Email: email,
          Message: message,
        },
      },
    ]);

    console.log('Created records:', createdRecords);

    if (createdRecords.length === 0) {
      throw new Error('No records were created in Airtable');
    }

    return NextResponse.json({ message: 'Form submitted successfully', id: createdRecords[0].getId() }, { status: 200 });
  } catch (error) {
    console.error('Error submitting form to Airtable:', error);
    return NextResponse.json(
      { message: `Error submitting form: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}