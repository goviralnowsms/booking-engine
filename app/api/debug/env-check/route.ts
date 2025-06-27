import { NextResponse } from "next/server"

export async function GET() {
  try {
    const requiredVars = ["TOURPLAN_API_URL", "TOURPLAN_USERNAME", "TOURPLAN_PASSWORD", "TOURPLAN_AGENT_ID"]

    const variables = requiredVars.map((varName) => ({
      name: varName,
      exists: !!process.env[varName],
      value: process.env[varName] ? `${process.env[varName]?.substring(0, 10)}...` : "NOT SET",
      length: process.env[varName]?.length || 0,
    }))

    const missingVars = variables.filter((v) => !v.exists)

    return NextResponse.json({
      success: missingVars.length === 0,
      variables,
      missingVars: missingVars.map((v) => v.name),
      message:
        missingVars.length === 0
          ? "All required environment variables are set"
          : `Missing variables: ${missingVars.map((v) => v.name).join(", ")}`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
