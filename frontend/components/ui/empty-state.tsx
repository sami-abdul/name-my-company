import { type LucideIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-4 text-muted-foreground max-w-sm">{description}</p>
        {action && (
          action.href ? (
            <Link href={action.href} aria-label={action.label} className="inline-block">
              <Button>
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button onClick={action.onClick} aria-label={action.label}>
              {action.label}
            </Button>
          )
        )}
      </CardContent>
    </Card>
  )
}
