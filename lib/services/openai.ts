import OpenAI from 'openai'

export class ReportGenerationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message)
    this.name = 'ReportGenerationError'
  }
}

interface GenerateDailyReportInput {
  author: string
  date: string
  workContent: string
  template?: 'standard' | 'detailed' | 'simple'
}

interface PromptTemplate {
  system: string
  examples: string
}

const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  standard: {
    system: `あなたは優秀な業務日報作成アシスタントです。以下のルールに従って日報を作成してください：

1. **時系列順の整理**: ユーザーが入力した業務内容を時系列順に並び替えてください。時刻が明記されている場合はその順番に、ない場合は文脈から推測してください。
2. **構造化**: 明確な見出しと箇条書きを使用してください。
3. **要約と詳細のバランス**: 重要な成果は強調し、詳細は適度に含めてください。
4. **プロフェッショナルな文体**: ビジネス文書として適切な日本語を使用してください。

出力形式は以下の構造に従ってください。`,
    examples: `# 日報 - [日付]

## 作成者情報
- **氏名**: [作成者名]
- **日付**: [日付]

## 本日の業務内容

### 午前の業務
- [時刻] [業務内容]
- [時刻] [業務内容]

### 午後の業務
- [時刻] [業務内容]
- [時刻] [業務内容]

## 主な成果
- [成果1]
- [成果2]

## 課題・懸念事項
- [課題1]
- [課題2]

## 明日の予定
- [予定1]
- [予定2]`,
  },
  detailed: {
    system: `あなたは詳細な業務日報を作成する専門家です。以下の点に注意してください：

1. **時系列順の整理**: 必ず時系列順に業務を整理してください。
2. **詳細な記述**: 各業務について、所要時間、内容、成果を詳しく記載してください。
3. **定量的な情報**: 可能な限り数値や具体的な成果物を含めてください。
4. **振り返りと改善点**: 各タスクの振り返りを含めてください。`,
    examples: `# 業務日報

**作成者**: [作成者名]  
**日付**: [日付]

## 業務サマリー
[本日の業務の概要を1-2文で記載]

## 詳細な業務内容
1. **[業務名]**
   - 時間: [所要時間]
   - 内容: [詳細な内容]
   - 成果: [具体的な成果]
   - 振り返り: [良かった点、改善点]

2. **[業務名]**
   - 時間: [所要時間]
   - 内容: [詳細な内容]
   - 成果: [具体的な成果]
   - 振り返り: [良かった点、改善点]

## 本日の学び
- [学んだこと1]
- [学んだこと2]

## 明日への申し送り
- [申し送り事項1]
- [申し送り事項2]`,
  },
  simple: {
    system: `簡潔な日報を作成してください。時系列順に整理し、要点のみを記載してください。`,
    examples: `# 日報 - [日付]

**作成者**: [作成者名]

## 本日の業務
- [業務1]
- [業務2]
- [業務3]

## 完了事項
- [完了1]
- [完了2]

## 明日の予定
- [予定1]
- [予定2]`,
  },
}

export async function generateDailyReport(
  input: GenerateDailyReportInput
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new ReportGenerationError('OpenAI API key is not configured')
  }

  const openai = new OpenAI({
    apiKey,
  })

  const template = PROMPT_TEMPLATES[input.template || 'standard']
  const cleanedWorkContent = input.workContent.trim()
  const cleanedAuthor = input.author.trim()

  const systemPrompt = `${template.system}

出力例：
${template.examples}

重要な注意事項：
- 入力された業務内容に時刻が含まれている場合は、必ず時系列順に並び替えてください
- 時刻が明記されていない項目は、文脈から適切な位置に配置してください
- 午前（〜12:00）と午後（12:00〜）で区切って整理してください
- 昼休憩は通常12:00-13:00の時間帯に配置してください`

  const userPrompt = `以下の情報を基に日報を作成してください：

作成者: ${cleanedAuthor}
日付: ${input.date}
業務内容:
${cleanedWorkContent}

上記の業務内容を時系列順に整理し、適切な日報フォーマットで出力してください。`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new ReportGenerationError('No content generated')
    }

    return content
  } catch (error) {
    if (error instanceof ReportGenerationError) {
      throw error
    }
    throw new ReportGenerationError(
      'Failed to generate report',
      error as Error
    )
  }
}