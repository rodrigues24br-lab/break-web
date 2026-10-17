import { NextResponse } from "next/server";
import { getMockProStore } from "@/lib/firebase/admin";

/** Debug helper for local mock mode — lists in-memory Pro grants. */
export async function GET() {
  return NextResponse.json({
    mockProUsers: getMockProStore(),
  });
}
