"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import type { Question } from "@/lib/question-types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  showAnswer?: boolean;
}

export function QuestionCard({ question, questionNumber, showAnswer = false }: QuestionCardProps) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Question {questionNumber}: {question.title}
          </CardTitle>
          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {question.type.replace("-", " ").toUpperCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="mb-2 font-medium text-muted-foreground">Scenario:</h4>
          <p className="whitespace-pre-line text-sm leading-relaxed">{question.scenarioText}</p>
        </div>
        
        <div className="rounded-lg bg-muted p-4">
          <h4 className="mb-2 font-semibold">Question:</h4>
          <p className="whitespace-pre-line text-sm">{question.question}</p>
        </div>
        
        {showAnswer && (
          <>
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
              <h4 className="mb-2 font-semibold text-primary">Answer:</h4>
              <p className="whitespace-pre-line font-medium">{question.answer}</p>
            </div>
            
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="mb-2 font-semibold text-muted-foreground">Working:</h4>
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {question.workings}
              </pre>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
