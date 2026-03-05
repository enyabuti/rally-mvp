import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Extract metadata
      const { trip_id, member_name, member_email } = session.metadata || {};

      if (!trip_id || !member_name || !member_email) {
        console.error('Missing metadata in session:', session.id);
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // Insert member into database
      const { error } = await supabaseAdmin
        .from('members')
        .insert({
          trip_id,
          name: member_name,
          email: member_email,
          stripe_session_id: session.id,
          paid: true,
          paid_at: new Date().toISOString(),
          status: 'committed',
        });

      if (error) {
        console.error('Failed to insert member:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      console.log(`Member ${member_name} committed to trip ${trip_id}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: err.message },
      { status: 400 }
    );
  }
}
