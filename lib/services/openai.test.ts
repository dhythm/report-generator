import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateDailyReport, ReportGenerationError } from './openai'
import OpenAI from 'openai'

vi.mock('openai')

describe('OpenAI Service', () => {
  const mockOpenAI = {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('OPENAI_API_KEY', 'test-api-key')
    ;(OpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockOpenAI)
  })

  describe('generateDailyReport', () => {
    it('時系列順に業務内容を並び替えて日報を生成する', async () => {
      const input = {
        author: '山田太郎',
        date: '2024-01-15',
        workContent: `
          15:00 チームミーティングに参加
          09:00 メールチェックと返信
          13:00 昼休憩
          10:00 プロジェクトAの設計書作成
          17:00 明日のタスク整理
          14:00 バグ修正対応
        `,
      }

      const expectedMarkdown = `# 日報 - 2024-01-15

## 作成者情報
- **氏名**: 山田太郎
- **日付**: 2024-01-15

## 本日の業務内容

### 午前の業務
- 09:00 メールチェックと返信
- 10:00 プロジェクトAの設計書作成

### 午後の業務
- 13:00 昼休憩
- 14:00 バグ修正対応
- 15:00 チームミーティングに参加
- 17:00 明日のタスク整理

## 主な成果
- プロジェクトAの設計書作成を進めた
- バグ修正を完了した

## 課題・懸念事項
- 特になし

## 明日の予定
- 設計書のレビュー対応
- 新機能の実装開始`

      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: expectedMarkdown,
            },
          },
        ],
      })

      const result = await generateDailyReport(input)

      expect(result).toBe(expectedMarkdown)
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1)
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0]
      expect(callArgs.model).toBe('gpt-4o-mini')
      expect(callArgs.temperature).toBe(0.7)
      expect(callArgs.max_tokens).toBe(2000)
      expect(callArgs.messages[0].role).toBe('system')
      expect(callArgs.messages[0].content).toContain('時系列順')
      expect(callArgs.messages[1].role).toBe('user')
      expect(callArgs.messages[1].content).toContain('山田太郎')
      expect(callArgs.messages[1].content).toContain('15:00 チームミーティングに参加')
    })

    it('学習データに基づいて出力形式を調整する', async () => {
      const input = {
        author: '鈴木花子',
        date: '2024-01-16',
        workContent: '設計書作成、コードレビュー、ミーティング',
        template: 'detailed' as const,
      }

      const expectedMarkdown = `# 業務日報

**作成者**: 鈴木花子  
**日付**: 2024-01-16

## 業務サマリー
本日は設計書作成とコードレビューを中心に業務を進めました。

## 詳細な業務内容
1. **設計書作成**
   - 時間: 3時間
   - 内容: API設計書の初版を作成
   - 成果: ドラフト版完成

2. **コードレビュー**
   - 時間: 2時間
   - 内容: プルリクエスト3件のレビュー
   - 成果: 全て承認済み

3. **ミーティング**
   - 時間: 1時間
   - 内容: 週次定例会議
   - 成果: 来週のタスク確定`

      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: expectedMarkdown,
            },
          },
        ],
      })

      const result = await generateDailyReport(input)

      expect(result).toBe(expectedMarkdown)
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1)
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0]
      expect(callArgs.messages[0].role).toBe('system')
      expect(callArgs.messages[0].content).toContain('詳細')
    })

    it('APIエラー時に適切なエラーをスローする', async () => {
      const input = {
        author: 'テスト太郎',
        date: '2024-01-17',
        workContent: '業務内容',
      }

      mockOpenAI.chat.completions.create.mockRejectedValueOnce(
        new Error('API rate limit exceeded')
      )

      await expect(generateDailyReport(input)).rejects.toThrow(
        ReportGenerationError
      )
    })

    it('空のレスポンスの場合にエラーをスローする', async () => {
      const input = {
        author: 'テスト太郎',
        date: '2024-01-17',
        workContent: '業務内容',
      }

      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [],
      })

      await expect(generateDailyReport(input)).rejects.toThrow(
        ReportGenerationError
      )
    })

    it('入力内容の前処理を正しく行う', async () => {
      const input = {
        author: '  山田太郎  ',
        date: '2024-01-18',
        workContent: `
          
          09:00 朝会
          
          10:00 開発作業
          
        `,
      }

      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: '# 日報',
            },
          },
        ],
      })

      await generateDailyReport(input)

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1)
      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0]
      expect(callArgs.messages[1].role).toBe('user')
      expect(callArgs.messages[1].content).toContain('山田太郎')
    })
  })
})