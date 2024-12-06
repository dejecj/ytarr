"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NAMING_TOKENS } from "@/lib/constants/naming-tokens"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NamingTokenSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function NamingTokenSelector({ value, onChange }: NamingTokenSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Insert Token</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {Object.entries(NAMING_TOKENS).map(([category, tokens]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium capitalize">{category}</h4>
                    <div className="space-y-1">
                      {Object.entries(tokens).map(([token, description]) => (
                        <button
                          key={token}
                          onClick={() => onChange(value + token)}
                          className="w-full text-left text-sm px-2 py-1 hover:bg-accent rounded-sm"
                        >
                          <div className="font-mono">{token}</div>
                          <div className="text-xs text-muted-foreground">{description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="standard">Standard Format</SelectItem>
          <SelectItem value="organized">Organized Format</SelectItem>
          <SelectItem value="playlist">Playlist Format</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

