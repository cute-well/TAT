"use client"

import {
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const uploadData = [
  { date: "Mon", documents: 12 },
  { date: "Tue", documents: 18 },
  { date: "Wed", documents: 15 },
  { date: "Thu", documents: 25 },
  { date: "Fri", documents: 22 },
  { date: "Sat", documents: 8 },
  { date: "Sun", documents: 5 },
]

const processingData = [
  { name: "Invoices", count: 45, extracted: 520 },
  { name: "Contracts", count: 28, extracted: 890 },
  { name: "Receipts", count: 67, extracted: 340 },
  { name: "Reports", count: 16, extracted: 280 },
]

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative"
  icon: React.ElementType
}

function StatCard({ title, value, change, changeType, icon: Icon }: StatCardProps) {
  return (
    <Card className="bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold text-foreground">{value}</span>
            <div className="flex items-center gap-1">
              {changeType === "positive" ? (
                <ArrowUpRight className="h-4 w-4 text-primary" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              )}
              <span
                className={`text-sm ${
                  changeType === "positive" ? "text-primary" : "text-destructive"
                }`}
              >
                {change}
              </span>
              <span className="text-sm text-muted-foreground">vs last week</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
        </div>
        <Select defaultValue="7d">
          <SelectTrigger className="h-9 w-32 bg-secondary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Documents"
              value="156"
              change="12%"
              changeType="positive"
              icon={FileText}
            />
            <StatCard
              title="Processed Today"
              value="24"
              change="8%"
              changeType="positive"
              icon={CheckCircle2}
            />
            <StatCard
              title="Fields Extracted"
              value="2,847"
              change="23%"
              changeType="positive"
              icon={TrendingUp}
            />
            <StatCard
              title="Avg. Processing Time"
              value="3.2s"
              change="5%"
              changeType="negative"
              icon={Clock}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base">Documents Uploaded</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    documents: {
                      label: "Documents",
                      color: "var(--primary)",
                    },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={uploadData}>
                      <XAxis
                        dataKey="date"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="documents"
                        stroke="var(--primary)"
                        fill="var(--primary)"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base">Documents by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Documents",
                      color: "var(--primary)",
                    },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processingData}>
                      <XAxis
                        dataKey="name"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        fill="var(--primary)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {[
                  {
                    action: "Document processed",
                    file: "Invoice_2024_001.pdf",
                    time: "2 minutes ago",
                    fields: 12,
                  },
                  {
                    action: "Document uploaded",
                    file: "Contract_Agreement.pdf",
                    time: "15 minutes ago",
                    fields: null,
                  },
                  {
                    action: "Document processed",
                    file: "Receipt_March.png",
                    time: "1 hour ago",
                    fields: 8,
                  },
                  {
                    action: "Document processed",
                    file: "Tax_Form_2023.pdf",
                    time: "2 hours ago",
                    fields: 45,
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-secondary p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {activity.action}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {activity.file}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                      {activity.fields && (
                        <span className="text-xs text-primary">
                          {activity.fields} fields extracted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
