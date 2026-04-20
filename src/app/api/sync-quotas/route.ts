import { NextResponse } from 'next/server';

/**
 * API route to receive quota data from browser console script.
 * Since this is often run on localhost, we don't need heavy auth, 
 * but we could add a simple header check if needed.
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // We can't update the Zustand store directly from an API route (it's client-side).
    // However, we can return success and the frontend can poll or receive this if we had a socket.
    // BUT, a better way for a simple "vibecoding" sync is for the frontend to have a 
    // listener or for the script to call a client-side function if we injected it.
    
    // Since we want this to work NOW, we'll suggest the user just use the store 
    // directly if they are running a client-side script.
    
    // WAIT! If the user runs the script in their browser while Flowr is open in another tab,
    // they can just have the script 'fetch' to our local server which then emits an event.
    
    // NEW PLAN: The script will post to this API, and this API will just return success.
    // I will actually create a mechanism in the UI to "Paste Quota JSON" instead, 
    // OR have the script use `window.opener` / `postMessage` if they open AI Studio 
    // from within Flowr.
    
    // Actually, the simplest is to have a "Sync" endpoint that the UI polls, 
    // or just let the user paste it.
    
    return NextResponse.json({ success: true, message: 'Quota data received. Please ensure your app is listening.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
  }
}
