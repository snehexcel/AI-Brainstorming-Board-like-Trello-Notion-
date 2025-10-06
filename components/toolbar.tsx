"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Download, Trash2, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ToolbarProps {
  onClearBoard: () => void
  onExportBoard: () => void
  onExportMarkdown: () => void
}

export function Toolbar({ onClearBoard, onExportBoard, onExportMarkdown }: ToolbarProps) {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col gap-2 w-16 bg-card border-r p-2">
      <div className="flex flex-col gap-2 flex-1">
        <Button variant="ghost" size="icon" onClick={onExportBoard} title="Export as JSON">
          <Download className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onExportMarkdown} title="Export as Markdown">
          <FileText className="h-5 w-5" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Clear Board">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Board?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all cards from your board. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onClearBoard}>Clear Board</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Button variant="ghost" size="icon" onClick={logout} title={`Logout (${user?.name})`}>
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  )
}
