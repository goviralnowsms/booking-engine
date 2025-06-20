import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export async function GET() {
  try {
    // Test 1: Check if tables exist by querying their structure
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["customers", "bookings", "payments", "booking_extras"])

    if (tablesError) {
      return Response.json(
        {
          error: "Failed to check tables",
          details: tablesError.message,
        },
        { status: 500 },
      )
    }

    // Test 2: Try to insert and retrieve a test customer
    const { data: testCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        first_name: "Test",
        last_name: "Customer",
        email: `test-${Date.now()}@example.com`,
        phone: "+1234567890",
      })
      .select()
      .single()

    if (customerError) {
      return Response.json(
        {
          error: "Failed to create test customer",
          details: customerError.message,
        },
        { status: 500 },
      )
    }

    // Test 3: Clean up test data
    await supabase.from("customers").delete().eq("id", testCustomer.id)

    return Response.json({
      success: true,
      message: "Database connection successful!",
      tablesFound: tables?.map((t) => t.table_name) || [],
      testCustomerCreated: !!testCustomer,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json(
      {
        error: "Database test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
