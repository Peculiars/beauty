import { writeClient } from "@/sanity/lib/client";

export async function POST(request: Request) {
  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !subject || !message) {
    return new Response(JSON.stringify({ error: "Name, email, subject and message are required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await writeClient.create({
      _type: "contactMessage",
      name,
      email,
      phone,
      subject,
      message,
      status: "new",
    });

    return new Response(JSON.stringify({ id: result._id }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Failed to submit message." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
