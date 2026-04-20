import { auth, clerkClient } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase.schema("hrlake").from("saved_calculations").delete().eq("user_id", userId)
    await supabase.from("subscriptions").delete().eq("user_id", userId)

    const clerk = await clerkClient()
    await clerk.users.deleteUser(userId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete account error:", err)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
