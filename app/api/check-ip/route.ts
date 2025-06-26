import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check what IP Vercel is using
    const ipResponse = await fetch("https://api.ipify.org?format=json")
    const ipData = await ipResponse.json()

    console.log("Vercel is using IP:", ipData.ip)

    return NextResponse.json({
      success: true,
      vercelIP: ipData.ip,
      message: "This is the IP that Tourplan sees when we make requests from Vercel",
      recommendation: "This IP needs to be whitelisted with Tourplan, or use an AWS proxy",
    })
  } catch (error) {
    return NextResponse.json({
      error: "Failed to check IP",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
