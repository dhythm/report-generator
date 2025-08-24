import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import * as openaiService from '@/lib/services/openai'
import { NextRequest } from 'next/server'

vi.mock('@/lib/services/openai')

describe('POST /api/generate-report', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('日報生成リクエストを正しく処理する', async () => {
    const mockReport = `# 日報 - 2024-01-15

## 作成者情報
- **氏名**: 山田太郎
- **日付**: 2024-01-15

## 本日の業務内容
- 09:00 メールチェックと返信
- 10:00 プロジェクトAの設計書作成`

    vi.spyOn(openaiService, 'generateDailyReport').mockResolvedValueOnce(
      mockReport
    )

    const requestBody = {
      author: '山田太郎',
      date: '2024-01-15',
      workContent: '09:00 メールチェック\n10:00 設計書作成',
      template: 'standard',
    }

    const request = new NextRequest(
      'http://localhost:3000/api/generate-report',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.report).toBe(mockReport)
    expect(openaiService.generateDailyReport).toHaveBeenCalledWith(requestBody)
  })

  it('必須パラメータが不足している場合400エラーを返す', async () => {
    const requestBody = {
      author: '山田太郎',
      // date が不足
      workContent: '業務内容',
    }

    const request = new NextRequest(
      'http://localhost:3000/api/generate-report',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields')
    expect(openaiService.generateDailyReport).not.toHaveBeenCalled()
  })

  it('空の業務内容の場合400エラーを返す', async () => {
    const requestBody = {
      author: '山田太郎',
      date: '2024-01-15',
      workContent: '   ',
    }

    const request = new NextRequest(
      'http://localhost:3000/api/generate-report',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Work content cannot be empty')
    expect(openaiService.generateDailyReport).not.toHaveBeenCalled()
  })

  it('無効なJSONの場合400エラーを返す', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/generate-report',
      {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request body')
    expect(openaiService.generateDailyReport).not.toHaveBeenCalled()
  })

  it('OpenAIサービスエラーの場合500エラーを返す', async () => {
    const errorInstance = new Error('API rate limit exceeded')
    ;(errorInstance as unknown as { name: string }).name =
      'ReportGenerationError'
    ;(
      errorInstance as unknown as {
        constructor: typeof openaiService.ReportGenerationError
      }
    ).constructor = openaiService.ReportGenerationError
    Object.setPrototypeOf(
      errorInstance,
      openaiService.ReportGenerationError.prototype
    )

    vi.spyOn(openaiService, 'generateDailyReport').mockRejectedValueOnce(
      errorInstance
    )

    const requestBody = {
      author: '山田太郎',
      date: '2024-01-15',
      workContent: '業務内容',
    }

    const request = new NextRequest(
      'http://localhost:3000/api/generate-report',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to generate report')
    expect(data.details).toBe('API rate limit exceeded')
    expect(openaiService.generateDailyReport).toHaveBeenCalledWith({
      ...requestBody,
      template: 'standard',
    })
  })

  it('予期しないエラーの場合500エラーを返す', async () => {
    vi.spyOn(openaiService, 'generateDailyReport').mockRejectedValueOnce(
      new Error('Unexpected error')
    )

    const requestBody = {
      author: '山田太郎',
      date: '2024-01-15',
      workContent: '業務内容',
    }

    const request = new NextRequest(
      'http://localhost:3000/api/generate-report',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
    expect(openaiService.generateDailyReport).toHaveBeenCalledWith({
      ...requestBody,
      template: 'standard',
    })
  })

  it('テンプレートパラメータを正しく処理する', async () => {
    const mockReport = '# 詳細な日報'

    vi.spyOn(openaiService, 'generateDailyReport').mockResolvedValueOnce(
      mockReport
    )

    const requestBody = {
      author: '鈴木花子',
      date: '2024-01-16',
      workContent: '設計書作成、コードレビュー',
      template: 'detailed',
    }

    const request = new NextRequest(
      'http://localhost:3000/api/generate-report',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.report).toBe(mockReport)
    expect(openaiService.generateDailyReport).toHaveBeenCalledWith(
      expect.objectContaining({
        template: 'detailed',
      })
    )
  })
})
