"use client";

import { useEffect, useState } from "react";
import { PrintableSheet } from "@/components/printable-sheet";
import type { Question } from "@/lib/question-types";
import { Button } from "@/components/button";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrintPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("printQuestions");
    if (stored) {
      try {
        setQuestions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse questions:", e);
      }
    }
    setIsLoading(false);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No questions to print. Generate questions first.</p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Generator
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Print Controls - Hidden when printing */}
      <div className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background p-4 print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Generator
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {questions.length} question{questions.length !== 1 ? "s" : ""} ready to print
            </span>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Sheets
            </Button>
          </div>
        </div>
      </div>
      
      {/* Printable Content */}
      <div className="pt-20 print:pt-0">
        <PrintableSheet questions={questions} />
      </div>
    </div>
  );
}
