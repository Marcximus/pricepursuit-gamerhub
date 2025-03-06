
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Get the API key from environment variables
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const body: ContactFormData = await req.json();
    const { name, email, message } = body;

    // Validate input
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: 'Laptop Hunter <onboarding@resend.dev>', // Replace with your verified sender
      to: 'youremail@example.com', // Replace with recipient email
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      // Optional: Send a copy to the sender
      cc: [email],
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: 'Your message has been sent successfully!' }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  } catch (error) {
    console.error('Error sending contact email:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to send email. Please try again later.' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
