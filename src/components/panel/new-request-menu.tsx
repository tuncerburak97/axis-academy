// src/components/panel/new-request-menu.tsx — "Yeni talep" açılır menüsü; talepler public sihirbazda oluşturulur
"use client";

import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "@/components/ui/menu";
import { newRequestLinks } from "@/lib/queries/member-types";

export function NewRequestMenu({
  variant = "outline",
  size,
  className,
  align = "end",
  side = "bottom",
  icon,
  label = "Yeni talep",
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
  icon?: React.ReactNode;
  label?: string;
}) {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {icon ?? <Plus aria-hidden />}
          {label}
          <ChevronDown className="opacity-60" aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuContent align={align} side={side} className="w-72">
        <MenuLabel>Ne için destek istiyorsun?</MenuLabel>
        {newRequestLinks.map((link) => (
          <MenuItem key={link.href} asChild className="min-h-12 flex-col items-start justify-center gap-0.5 py-2">
            <Link href={link.href}>
              <span className="font-semibold">{link.label}</span>
              <span className="text-xs text-ink-soft">{link.description}</span>
            </Link>
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
