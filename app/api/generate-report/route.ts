import { NextRequest, NextResponse } from 'next/server'
import { generateDailyReport, ReportGenerationError } from '@/lib/services/openai'

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { author, date, workContent, template } = body

    // バリデーション
    if (!author || !date || !workContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (typeof workContent !== 'string' || !workContent.trim()) {
      return NextResponse.json(
        { error: 'Work content cannot be empty' },
        { status: 400 }
      )
    }

    // テンプレートの検証
    const validTemplates = ['standard', 'detailed', 'simple']
    const templateToUse = validTemplates.includes(template) ? template : 'standard'

    // 日報生成
    const report = await generateDailyReport({
      author,
      date,
      workContent,
      template: templateToUse as 'standard' | 'detailed' | 'simple',
    })

    return NextResponse.json({ report }, { status: 200 })
  } catch (error) {
    console.error('Error generating report:', error)

    if (error instanceof ReportGenerationError) {
      return NextResponse.json(
        {
          error: 'Failed to generate report',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}