import { NextRequest, NextResponse } from 'next/server'
import { getTourplanAPI } from '@/lib/tourplan-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { buttonName, destinationName, opt, info, dateFrom, dateTo, roomConfigs } = body

    // Support both old format (buttonName/destinationName) and new format (opt/dateFrom/dateTo/roomConfigs)
    const isOldFormat = buttonName && destinationName
    const isNewFormat = opt

    // Validate required fields based on format
    if (!isOldFormat && !isNewFormat) {
      return NextResponse.json(
        { error: 'Missing required fields. Use either (buttonName, destinationName, info) or (opt, info) format' },
        { status: 400 }
      )
    }

    if (!info) {
      return NextResponse.json(
        { error: 'Missing required field: info' },
        { status: 400 }
      )
    }

    // Validate info type - support both old format (G/S/R/A) and new format (GS, etc.)
    const validInfoTypes = ['G', 'S', 'R', 'A', 'GS']
    if (!validInfoTypes.includes(info)) {
      return NextResponse.json(
        { error: 'Invalid info type. Must be G (General), S (Stay Pricing), R (Rates), A (Availability), or GS (General Search)' },
        { status: 400 }
      )
    }

    console.log('OptionInfoRequest received:', {
      buttonName,
      destinationName,
      opt,
      info,
      dateFrom,
      dateTo,
      roomConfigs
    })

    const tourplanAPI = getTourplanAPI()
    const result = await tourplanAPI.getOptionInfo({
      buttonName,
      destinationName,
      opt,
      info,
      dateFrom,
      dateTo,
      roomConfigs
    })

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('OptionInfoRequest failed:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'OptionInfoRequest endpoint',
    description: 'POST to this endpoint with either old format (buttonName/destinationName) or new format (opt/dateFrom/dateTo/roomConfigs)',
    formats: {
      old: {
        description: 'Original format using ButtonName and DestinationName',
        parameters: {
          buttonName: 'string - Service button name',
          destinationName: 'string - Destination name',
          info: 'string - G (General), S (Stay Pricing), R (Rates), A (Availability)'
        },
        example: {
          buttonName: 'service_button',
          destinationName: 'Cape Town',
          info: 'G'
        }
      },
      new: {
        description: 'New format using Opt, DateFrom, DateTo, and RoomConfigs',
        parameters: {
          opt: 'string - Option identifier',
          info: 'string - GS (General Search), G (General), S (Stay Pricing), R (Rates), A (Availability)',
          dateFrom: 'string - Start date (YYYY-MM-DD) - optional',
          dateTo: 'string - End date (YYYY-MM-DD) - optional',
          roomConfigs: 'array - Room configurations - optional'
        },
        example: {
          opt: 'option_identifier',
          info: 'GS',
          dateFrom: '2024-01-01',
          dateTo: '2024-01-05',
          roomConfigs: [
            {
              adults: 2,
              roomType: 'DB'
            }
          ]
        }
      }
    }
  })
}
