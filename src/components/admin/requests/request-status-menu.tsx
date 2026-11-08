// src/components/admin/requests/request-status-menu.tsx — pano kartında "taşı" menüsü (durum değiştirir, üyeye e-posta gider)
"use client";

import { ArrowRightLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuTrigger } from "@/components/ui/menu";
import { setRequestStatus } from "@/lib/actions/admin-requests";
import { requestStatusAdminLabels, type RequestStatus } from "@/lib/types/platform";
import { useRunAction } from "@/components/admin/action-form";

const ORDER: RequestStatus[] = ["received", "quoted", "approved", "planned", "in_progress", "completed", "cancelled"];

export function RequestStatusMenu({ requestId, status }: { requestId: string; status: RequestStatus }) {
  const { run, pending } = useRunAction();
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Durumu değiştir" loading={pending}>
          {!pending && <ArrowRightLeft />}
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>Taşı</MenuLabel>
        {ORDER.map((option) => (
          <MenuItem
            key={option}
            tone={option === "cancelled" ? "danger" : "default"}
            disabled={option === status}
            onSelect={() => run(setRequestStatus, { request_id: requestId, status: option })}
          >
            {option === status ? <Check /> : <span className="size-4" />}
            {requestStatusAdminLabels[option]}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
