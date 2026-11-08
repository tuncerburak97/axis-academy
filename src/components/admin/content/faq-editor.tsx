// src/components/admin/content/faq-editor.tsx — SSS düzenleyicisi: sıralanabilir soru/cevap listesi
"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { saveFaq } from "@/lib/actions/admin-content";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";

interface Item {
  key: number;
  question: string;
  answer: string;
}

export function FaqEditor({ initial }: { initial: { question: string; answer: string }[] }) {
  const counter = React.useRef(initial.length);
  const [items, setItems] = React.useState<Item[]>(() => initial.map((item, index) => ({ ...item, key: index })));

  function update(key: number, patch: Partial<Item>) {
    setItems((list) => list.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }
  function move(index: number, delta: number) {
    setItems((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });
  }

  return (
    <ActionForm action={saveFaq} className="flex flex-col gap-3">
      <input type="hidden" name="items" value={JSON.stringify(items.map(({ question, answer }) => ({ question, answer })))} />
      <ol className="flex flex-col gap-3">
        {items.map((item, index) => (
          <li key={item.key} className="rounded-2xl border border-line bg-surface/40 p-3.5">
            <div className="flex items-start gap-2">
              <span className="tabular mt-2.5 w-6 shrink-0 font-mono text-sm text-ink-muted">{index + 1}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <label className="sr-only" htmlFor={`faq-q-${item.key}`}>
                  Soru {index + 1}
                </label>
                <Input
                  id={`faq-q-${item.key}`}
                  value={item.question}
                  onChange={(event) => update(item.key, { question: event.target.value })}
                  placeholder="Soru"
                  maxLength={300}
                  className="font-medium"
                />
                <label className="sr-only" htmlFor={`faq-a-${item.key}`}>
                  Cevap {index + 1}
                </label>
                <Textarea
                  id={`faq-a-${item.key}`}
                  value={item.answer}
                  onChange={(event) => update(item.key, { answer: event.target.value })}
                  placeholder="Cevap"
                  rows={2}
                  maxLength={2000}
                />
              </div>
              <div className="flex shrink-0 flex-col">
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Yukarı taşı" disabled={index === 0} onClick={() => move(index, -1)}>
                  <ArrowUp />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Aşağı taşı" disabled={index === items.length - 1} onClick={() => move(index, 1)}>
                  <ArrowDown />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Soruyu sil"
                  onClick={() => setItems((list) => list.filter((entry) => entry.key !== item.key))}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setItems((list) => [...list, { key: ++counter.current, question: "", answer: "" }])}
        >
          <Plus /> Soru ekle
        </Button>
        <SubmitButton variant="secondary">SSS'yi kaydet</SubmitButton>
      </div>
    </ActionForm>
  );
}
