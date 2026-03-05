import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { trip_id, member_name, member_email } = await request.json();

    if (!trip_id || !member_name || !member_email) {
      return NextResponse.json(
        { error: 'Missing required fields: trip_id, member_name, member_email' },
        { status: 400 }
      );
    }

    // Fetch trip details to get deposit amount
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', trip_id)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Get base URL for redirects
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://rally-mvp-xi.vercel.app';

    console.log('Creating checkout session with base URL:', baseUrl);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${trip.name} - Trip Deposit`,
              description: `Commitment deposit for ${trip.destination}`,
            },
            unit_amount: trip.deposit_amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/trip/${trip_id}?success=true`,
      cancel_url: `${baseUrl}/trip/${trip_id}?canceled=true`,
      metadata: {
        trip_id,
        member_name,
        member_email,
      },
      customer_email: member_email,
    });

    console.log('Checkout session created:', session.id, 'URL:', session.url);

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: err.message },
      { status: 500 }
    );
  }
}
