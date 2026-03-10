"use client"

import { useState } from "react"
import {
  Bell,
  FileBarChart,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Zap,
  Mail,
  FolderInput,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export type WorkflowTrigger = "new-document" | "processing-complete" | "amount-exceeds" | "category-match"
export type WorkflowAction = "send-alert" | "generate-report" | "move-to-folder" | "send-email"

export interface Workflow {
  id: string
  name: string
  description: string
  trigger: WorkflowTrigger
  action: WorkflowAction
  enabled: boolean
  lastRun?: string
  runCount: number
  config?: {
    threshold?: number
    folder?: string
    email?: string
    category?: string
  }
}

const triggerLabels: Record<WorkflowTrigger, string> = {
  "new-document": "New document uploaded",
  "processing-complete": "Document processing complete",
  "amount-exceeds": "Invoice amount exceeds threshold",
  "category-match": "Document matches category",
}

const actionLabels: Record<WorkflowAction, string> = {
  "send-alert": "Send in-app alert",
  "generate-report": "Generate summary report",
  "move-to-folder": "Auto-move to folder",
  "send-email": "Send email notification",
}

const actionIcons: Record<WorkflowAction, React.ElementType> = {
  "send-alert": Bell,
  "generate-report": FileBarChart,
  "move-to-folder": FolderInput,
  "send-email": Mail,
}

const sampleWorkflows: Workflow[] = [
  {
    id: "wf-1",
    name: "Invoice Alert",
    description: "Alert when a new invoice exceeds $1,000",
    trigger: "amount-exceeds",
    action: "send-alert",
    enabled: true,
    lastRun: "2 hours ago",
    runCount: 14,
    config: { threshold: 1000 },
  },
  {
    id: "wf-2",
    name: "Weekly Report",
    description: "Generate a summary report when processing completes",
    trigger: "processing-complete",
    action: "generate-report",
    enabled: true,
    lastRun: "1 day ago",
    runCount: 32,
  },
  {
    id: "wf-3",
    name: "Contract Auto-Filing",
    description: "Move contracts to the Contracts folder automatically",
    trigger: "new-document",
    action: "move-to-folder",
    enabled: true,
    lastRun: "5 hours ago",
    runCount: 28,
    config: { folder: "Contracts", category: "contract" },
  },
  {
    id: "wf-4",
    name: "High-Value Invoice Email",
    description: "Email notification for invoices over $5,000",
    trigger: "amount-exceeds",
    action: "send-email",
    enabled: false,
    lastRun: "3 days ago",
    runCount: 5,
    config: { threshold: 5000, email: "finance@company.com" },
  },
]

const recentAlerts = [
  {
    id: "a1",
    type: "alert" as const,
    message: "Invoice INV-2024-042 exceeds $1,000 threshold ($1,234.56)",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "a2",
    type: "report" as const,
    message: "Weekly summary report generated: 24 documents processed",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "a3",
    type: "folder" as const,
    message: "Contract_Q1_2024.pdf moved to Contracts folder",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "a4",
    type: "alert" as const,
    message: "Invoice INV-2024-038 exceeds $1,000 threshold ($2,450.00)",
    time: "5 hours ago",
    read: true,
  },
]

interface NewWorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (workflow: Workflow) => void
}

function NewWorkflowDialog({ open, onOpenChange, onAdd }: NewWorkflowDialogProps) {
  const [name, setName] = useState("")
  const [trigger, setTrigger] = useState<WorkflowTrigger>("new-document")
  const [action, setAction] = useState<WorkflowAction>("send-alert")
  const [threshold, setThreshold] = useState("1000")
  const [folder, setFolder] = useState("Invoices")
  const [email, setEmail] = useState("")

  const handleAdd = () => {
    if (!name.trim()) return
    const workflow: Workflow = {
      id: `wf-${Date.now()}`,
      name,
      description: `${triggerLabels[trigger]} → ${actionLabels[action]}`,
      trigger,
      action,
      enabled: true,
      runCount: 0,
      config: {
        threshold: trigger === "amount-exceeds" ? parseFloat(threshold) : undefined,
        folder: action === "move-to-folder" ? folder : undefined,
        email: action === "send-email" ? email : undefined,
      },
    }
    onAdd(workflow)
    setName("")
    setTrigger("new-document")
    setAction("send-alert")
    setThreshold("1000")
    setFolder("Invoices")
    setEmail("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Workflow</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Automate actions based on document events
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="wf-name">Workflow Name</Label>
            <Input
              id="wf-name"
              placeholder="e.g. Invoice Alert"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Trigger</Label>
            <Select value={trigger} onValueChange={(v) => setTrigger(v as WorkflowTrigger)}>
              <SelectTrigger className="bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(triggerLabels) as [WorkflowTrigger, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {trigger === "amount-exceeds" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="wf-threshold">Amount Threshold ($)</Label>
              <Input
                id="wf-threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="bg-secondary"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Action</Label>
            <Select value={action} onValueChange={(v) => setAction(v as WorkflowAction)}>
              <SelectTrigger className="bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(actionLabels) as [WorkflowAction, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {action === "move-to-folder" && (
            <div className="flex flex-col gap-2">
              <Label>Target Folder</Label>
              <Select value={folder} onValueChange={setFolder}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Invoices", "Contracts", "Receipts", "Reports"].map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {action === "send-email" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="wf-email">Recipient Email</Label>
              <Input
                id="wf-email"
                type="email"
                placeholder="team@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!name.trim()}>
            Create Workflow
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function WorkflowsView() {
  const [workflows, setWorkflows] = useState<Workflow[]>(sampleWorkflows)
  const [alerts, setAlerts] = useState(recentAlerts)
  const [newWorkflowOpen, setNewWorkflowOpen] = useState(false)

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === id ? { ...wf, enabled: !wf.enabled } : wf))
    )
  }

  const deleteWorkflow = (id: string) => {
    setWorkflows((prev) => prev.filter((wf) => wf.id !== id))
  }

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }

  const unreadCount = alerts.filter((a) => !a.read).length
  const enabledCount = workflows.filter((wf) => wf.enabled).length

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">Workflows & Alerts</h2>
          <Badge variant="secondary" className="text-xs">
            {enabledCount} active
          </Badge>
        </div>
        <Button
          className="h-9 gap-2"
          onClick={() => setNewWorkflowOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Workflow
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid gap-6 p-6 lg:grid-cols-3">
          {/* Workflows List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Automation Rules</h3>
            </div>

            {workflows.map((workflow) => {
              const ActionIcon = actionIcons[workflow.action]
              return (
                <Card key={workflow.id} className="bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <ActionIcon className="h-5 w-5 text-primary" />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-medium text-foreground">
                            {workflow.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={workflow.enabled}
                              onCheckedChange={() => toggleWorkflow(workflow.id)}
                              className="scale-90"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteWorkflow(workflow.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {workflow.description}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            When: {triggerLabels[workflow.trigger]}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-primary border-primary/30">
                            Then: {actionLabels[workflow.action]}
                          </Badge>
                        </div>

                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          {workflow.lastRun && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last run {workflow.lastRun}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            {workflow.runCount} runs
                          </span>
                          {!workflow.enabled && (
                            <Badge variant="secondary" className="text-xs text-muted-foreground">
                              Paused
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {workflows.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center">
                <Zap className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No workflows yet</p>
                <Button variant="outline" size="sm" onClick={() => setNewWorkflowOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first workflow
                </Button>
              </div>
            )}
          </div>

          {/* Alerts Panel */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
                {unreadCount > 0 && (
                  <Badge className="text-xs px-1.5 py-0">{unreadCount}</Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={markAllRead}
                >
                  Mark all read
                </Button>
              )}
            </div>

            <Card className="bg-card">
              <CardContent className="p-0">
                <div className="flex flex-col divide-y divide-border">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-4 ${!alert.read ? "bg-primary/5" : ""}`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                        {alert.type === "alert" && (
                          <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                        )}
                        {alert.type === "report" && (
                          <FileBarChart className="h-3.5 w-3.5 text-primary" />
                        )}
                        {alert.type === "folder" && (
                          <FolderInput className="h-3.5 w-3.5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <p className={`text-xs leading-snug ${!alert.read ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {alert.message}
                        </p>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                      {!alert.read && (
                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Workflow Stats */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">Automation Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-card">
                  <CardContent className="p-3">
                    <div className="text-2xl font-bold text-foreground">
                      {workflows.reduce((sum, wf) => sum + wf.runCount, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total runs</div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-3">
                    <div className="text-2xl font-bold text-primary">{enabledCount}</div>
                    <div className="text-xs text-muted-foreground">Active rules</div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-3">
                    <div className="text-2xl font-bold text-foreground">
                      {workflows.filter((wf) => wf.action === "send-alert" || wf.action === "send-email").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Alert rules</div>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardContent className="p-3">
                    <div className="text-2xl font-bold text-foreground">
                      {workflows.filter((wf) => wf.action === "generate-report").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Report rules</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <NewWorkflowDialog
        open={newWorkflowOpen}
        onOpenChange={setNewWorkflowOpen}
        onAdd={(wf) => setWorkflows((prev) => [wf, ...prev])}
      />
    </div>
  )
}
