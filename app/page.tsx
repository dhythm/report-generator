"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  CalendarDays,
  Settings,
  Sparkles,
  Copy,
  Download,
  Send,
  Upload,
  FileText,
  Eye,
  Code,
  Mic,
  MicOff,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ReportGenerator() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("daily")
  const [isGenerating, setIsGenerating] = useState(false)
  const [dailyReport, setDailyReport] = useState("")
  const [weeklyReport, setWeeklyReport] = useState("")
  const [viewMode, setViewMode] = useState<"markdown" | "preview">("markdown")
  const [isRecording, setIsRecording] = useState(false)

  const [dailyForm, setDailyForm] = useState({
    author: "",
    date: new Date().toISOString().split("T")[0],
    workContent: "",
  })

  // Weekly report form state
  const [weeklyForm, setWeeklyForm] = useState({
    author: "",
    dateRange: {
      start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
    dailyReports: "",
    uploadedFile: null as File | null,
  })

  // Settings state
  const [settings, setSettings] = useState({
    slackWebhook: "",
    defaultChannel: "#general",
    template: "standard",
  })

  const startVoiceRecording = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.lang = "ja-JP"
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsRecording(true)
        toast({
          title: "音声入力を開始しました",
          description: "話してください...",
        })
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setDailyForm((prev) => ({
            ...prev,
            workContent: prev.workContent + (prev.workContent ? "\n" : "") + finalTranscript,
          }))
        }
      }

      recognition.onerror = () => {
        setIsRecording(false)
        toast({
          title: "音声入力エラー",
          description: "音声入力に失敗しました。",
          variant: "destructive",
        })
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognition.start()
    } else {
      toast({
        title: "音声入力未対応",
        description: "このブラウザは音声入力に対応していません。",
        variant: "destructive",
      })
    }
  }

  const stopVoiceRecording = () => {
    setIsRecording(false)
    // The recognition will automatically stop and trigger onend
  }

  const generateDailyReport = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: dailyForm.author,
          date: dailyForm.date,
          workContent: dailyForm.workContent,
          template: settings.template,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }

      const data = await response.json()
      setDailyReport(data.report)
      
      toast({
        title: "日報を生成しました",
        description: "右側のプレビューエリアで確認できます。",
      })
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "日報の生成に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateWeeklyReport = async () => {
    setIsGenerating(true)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const sampleWeeklyReport = `# 週報 - ${weeklyForm.dateRange.start} ～ ${weeklyForm.dateRange.end}

## 作成者情報
- **氏名**: ${weeklyForm.author || "山田太郎"}
- **期間**: ${weeklyForm.dateRange.start} ～ ${weeklyForm.dateRange.end}

## 週間サマリー
今週は主にプロジェクトAの基盤設計と実装に注力しました。API設計書の作成からデータベース設計の見直しまで、幅広い技術的課題に取り組みました。

## 主な成果・達成事項
### 技術面
- **API設計書の完成**: RESTful APIの設計書を作成し、チームレビューを完了
- **データベース最適化**: クエリパフォーマンスを30%改善
- **バグ修正**: 重要度高のバグ15件を修正完了

### プロジェクト管理
- 週次進捗会議の司会進行
- 新メンバーのオンボーディング支援
- 顧客要件の整理と優先度付け

## 今週の課題・学び
### 技術的課題
- 外部API仕様変更への対応が予想以上に時間を要した
- テスト環境の安定性向上が必要

### 改善点
- 事前の技術調査をより詳細に行う必要性を実感
- チーム内のコミュニケーション頻度を増やす

## 来週の目標・計画
### 開発タスク
- [ ] 新機能の実装開始（ユーザー認証機能）
- [ ] テスト環境の安定化対応
- [ ] コードレビュープロセスの改善

### ミーティング・打ち合わせ
- 月曜日: プロジェクト定例会議
- 水曜日: 顧客要件確認ミーティング
- 金曜日: 技術勉強会の開催

## 工数サマリー
- **開発作業**: 28時間
- **会議・打ち合わせ**: 8時間
- **調査・学習**: 4時間
- **合計**: 40時間
`

    setWeeklyReport(sampleWeeklyReport)
    setIsGenerating(false)
    toast({
      title: "週報を生成しました",
      description: "生成された週報を確認してください。",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "コピーしました",
      description: "クリップボードにコピーされました。",
    })
  }

  const downloadMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: "ダウンロード完了",
      description: `${filename}をダウンロードしました。`,
    })
  }

  const sendToSlack = () => {
    toast({
      title: "Slackに送信しました",
      description: "設定されたチャンネルに送信されました。",
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setWeeklyForm((prev) => ({ ...prev, uploadedFile: file }))
      toast({
        title: "ファイルをアップロードしました",
        description: file.name,
      })
    }
  }

  const renderMarkdownPreview = (content: string) => {
    // Process markdown content into proper HTML structure
    const lines = content.split('\n')
    const htmlElements: string[] = []
    let inList = false
    let listItems: string[] = []
    let consecutiveEmptyLines = 0
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Handle list items
      if (line.match(/^[-*]\s+(.*)$/)) {
        consecutiveEmptyLines = 0
        let listContent = line.replace(/^[-*]\s+(.*)$/, '$1')
        // Apply markdown formatting to list items
        listContent = listContent
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
        listItems.push(`<li>${listContent}</li>`)
        inList = true
        continue
      } else if (inList && listItems.length > 0) {
        // Close the list when we encounter a non-list item
        htmlElements.push(`<ul class="list-disc list-inside space-y-1 my-2">${listItems.join('')}</ul>`)
        listItems = []
        inList = false
      }
      
      // Handle empty lines - only add space for the first empty line in a sequence
      if (line.trim() === '') {
        consecutiveEmptyLines++
        if (consecutiveEmptyLines === 1 && !inList) {
          htmlElements.push('<div class="h-2"></div>')
        }
        continue
      }
      
      // Reset empty line counter
      consecutiveEmptyLines = 0
      
      // Handle headings with reduced margins
      if (line.match(/^###\s+(.*)$/)) {
        htmlElements.push(line.replace(/^###\s+(.*)$/, '<h3 class="text-lg font-medium mt-2 mb-1">$1</h3>'))
      } else if (line.match(/^##\s+(.*)$/)) {
        htmlElements.push(line.replace(/^##\s+(.*)$/, '<h2 class="text-xl font-semibold mt-3 mb-2">$1</h2>'))
      } else if (line.match(/^#\s+(.*)$/)) {
        htmlElements.push(line.replace(/^#\s+(.*)$/, '<h1 class="text-2xl font-bold mb-2">$1</h1>'))
      } else {
        // Regular paragraph
        let processedLine = line
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
        
        if (!inList) {
          htmlElements.push(`<p class="leading-relaxed mb-1">${processedLine}</p>`)
        }
      }
    }
    
    // Handle any remaining list items
    if (inList && listItems.length > 0) {
      htmlElements.push(`<ul class="list-disc list-inside space-y-1 my-2">${listItems.join('')}</ul>`)
    }
    
    return (
      <div>
        <div
          dangerouslySetInnerHTML={{
            __html: htmlElements.join('')
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">レポート生成システム</h1>
          <p className="text-muted-foreground">日報・週報を効率的に作成・管理できるツールです</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              日報作成
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              週報作成
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              設定
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    日報入力フォーム
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="author" className="block mb-3">
                      作成者名 *
                    </Label>
                    <Input
                      id="author"
                      value={dailyForm.author}
                      onChange={(e) => setDailyForm((prev) => ({ ...prev, author: e.target.value }))}
                      placeholder="山田太郎"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date" className="block mb-3">
                      日付
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={dailyForm.date}
                      onChange={(e) => setDailyForm((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="workContent" className="block mb-3">
                      業務内容
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="workContent"
                        value={dailyForm.workContent}
                        onChange={(e) => setDailyForm((prev) => ({ ...prev, workContent: e.target.value }))}
                        placeholder="今日行った業務内容を記入してください..."
                        className="min-h-48 pr-12"
                      />
                      <Button
                        type="button"
                        variant={isRecording ? "destructive" : "outline"}
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                    {isRecording && (
                      <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        音声入力中...
                      </p>
                    )}
                  </div>

                  <Button onClick={generateDailyReport} disabled={isGenerating || !dailyForm.author} className="w-full">
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        生成
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output Area */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>生成された日報</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === "markdown" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("markdown")}
                      >
                        <Code className="w-4 h-4 mr-1" />
                        Markdown
                      </Button>
                      <Button
                        variant={viewMode === "preview" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("preview")}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        プレビュー
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="min-h-96 border rounded-lg p-4 bg-muted/30">
                    {dailyReport ? (
                      viewMode === "markdown" ? (
                        <Textarea
                          value={dailyReport}
                          onChange={(e) => setDailyReport(e.target.value)}
                          className="min-h-80 text-sm leading-relaxed bg-transparent border-none resize-none"
                          style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                        />
                      ) : (
                        <div className="min-h-80 overflow-auto">{renderMarkdownPreview(dailyReport)}</div>
                      )
                    ) : (
                      <div className="flex items-center justify-center h-80 text-muted-foreground">
                        「生成」ボタンをクリックして日報を作成してください
                      </div>
                    )}
                  </div>

                  {dailyReport && (
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(dailyReport)}>
                        <Copy className="w-4 h-4 mr-1" />
                        コピー
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadMarkdown(dailyReport, `日報_${dailyForm.date}.md`)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        ダウンロード
                      </Button>
                      <Button variant="outline" size="sm" onClick={sendToSlack}>
                        <Send className="w-4 h-4 mr-1" />
                        Slackに送信
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="weekly">
            <div className="space-y-6">
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    週報入力
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="weeklyAuthor" className="block mb-3">
                        作成者名
                      </Label>
                      <Input
                        id="weeklyAuthor"
                        value={weeklyForm.author}
                        onChange={(e) => setWeeklyForm((prev) => ({ ...prev, author: e.target.value }))}
                        placeholder="山田太郎"
                      />
                    </div>
                    <div>
                      <Label htmlFor="startDate" className="block mb-3">
                        開始日
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={weeklyForm.dateRange.start}
                        onChange={(e) =>
                          setWeeklyForm((prev) => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, start: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="block mb-3">
                        終了日
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={weeklyForm.dateRange.end}
                        onChange={(e) =>
                          setWeeklyForm((prev) => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, end: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dailyReports" className="block mb-3">
                      日報データの貼り付け
                    </Label>
                    <Textarea
                      id="dailyReports"
                      value={weeklyForm.dailyReports}
                      onChange={(e) => setWeeklyForm((prev) => ({ ...prev, dailyReports: e.target.value }))}
                      placeholder="複数の日報データをここに貼り付けてください...

例：
# 日報 - 2024-01-15
## 作成者: 山田太郎
## 業務内容:
- API開発
- バグ修正

# 日報 - 2024-01-16
## 作成者: 山田太郎
## 業務内容:
- テスト作成
- レビュー対応"
                      className="min-h-48"
                    />
                  </div>

                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <Label htmlFor="fileUpload" className="cursor-pointer">
                        <span className="text-sm font-medium">ファイルをドラッグ&ドロップ</span>
                        <span className="text-sm text-muted-foreground block">または クリックしてファイルを選択</span>
                      </Label>
                      <Input
                        id="fileUpload"
                        type="file"
                        accept=".txt,.md,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {weeklyForm.uploadedFile && (
                        <Badge variant="secondary" className="mt-2">
                          {weeklyForm.uploadedFile.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button onClick={generateWeeklyReport} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        週報を生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        週報を生成
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>生成された週報</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === "markdown" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("markdown")}
                      >
                        <Code className="w-4 h-4 mr-1" />
                        Markdown
                      </Button>
                      <Button
                        variant={viewMode === "preview" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("preview")}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        プレビュー
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="min-h-96 border rounded-lg p-4 bg-muted/30">
                    {weeklyReport ? (
                      viewMode === "markdown" ? (
                        <Textarea
                          value={weeklyReport}
                          onChange={(e) => setWeeklyReport(e.target.value)}
                          className="min-h-80 text-sm leading-relaxed bg-transparent border-none resize-none"
                          style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
                        />
                      ) : (
                        <div className="min-h-80 overflow-auto">{renderMarkdownPreview(weeklyReport)}</div>
                      )
                    ) : (
                      <div className="flex items-center justify-center h-80 text-muted-foreground">
                        「週報を生成」ボタンをクリックして週報を作成してください
                      </div>
                    )}
                  </div>

                  {weeklyReport && (
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(weeklyReport)}>
                        <Copy className="w-4 h-4 mr-1" />
                        コピー
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadMarkdown(
                            weeklyReport,
                            `週報_${weeklyForm.dateRange.start}_${weeklyForm.dateRange.end}.md`,
                          )
                        }
                      >
                        <Download className="w-4 h-4 mr-1" />
                        ダウンロード
                      </Button>
                      <Button variant="outline" size="sm" onClick={sendToSlack}>
                        <Send className="w-4 h-4 mr-1" />
                        Slackに送信
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  システム設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="slackWebhook" className="block mb-3">
                    Slack Webhook URL
                  </Label>
                  <Input
                    id="slackWebhook"
                    type="password"
                    value={settings.slackWebhook}
                    onChange={(e) => setSettings((prev) => ({ ...prev, slackWebhook: e.target.value }))}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>

                <div>
                  <Label htmlFor="defaultChannel" className="block mb-3">
                    デフォルトSlackチャンネル
                  </Label>
                  <Input
                    id="defaultChannel"
                    value={settings.defaultChannel}
                    onChange={(e) => setSettings((prev) => ({ ...prev, defaultChannel: e.target.value }))}
                    placeholder="#general"
                  />
                </div>

                <div>
                  <Label htmlFor="template" className="block mb-3">
                    デフォルトテンプレート
                  </Label>
                  <select
                    id="template"
                    value={settings.template}
                    onChange={(e) => setSettings((prev) => ({ ...prev, template: e.target.value }))}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="standard">標準テンプレート</option>
                    <option value="detailed">詳細テンプレート</option>
                    <option value="simple">シンプルテンプレート</option>
                  </select>
                </div>

                <Button
                  onClick={() => toast({ title: "設定を保存しました", description: "設定が正常に保存されました。" })}
                  className="w-full"
                >
                  設定を保存
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
