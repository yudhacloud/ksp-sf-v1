import { NextResponse } from "next/server";
import { fetchMembers } from "@/src/services/members";

export async function GET() {
  try {
    const members = await fetchMembers();
    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
