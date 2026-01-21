"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card";
import { QuestionCard } from "./question-card";
import { generateQuestionSet } from "@/lib/question-generator";
import type { Question, QuestionType } from "@/lib/question-types";
import { Printer, RefreshCw, Eye, EyeOff, FileText } from "lucide-react";

const QUESTION_TYPES: { type: QuestionType; label: string; description: string }[] = [
  { type: "percent-mac", label: "%MAC", description: "Calculate CG as percentage of MAC" },
  { type: "forward-cg-limit", label: "Forward CG Limit", description: "Determine forward CG limits" },
  { type: "weight-balance", label: "Weight & Balance", description: "Full W&B verification" },
  { type: "ballast", label: "Ballast", description: "Calculate ballast requirements" },
];

export function QuestionGenerator() {
  const router = useRouter();
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["percent-mac"]);
  const [questionsPerType, setQuestionsPerType] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);

  const toggleType = useCallback((type: QuestionType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  const generateQuestions = useCallback(() => {
    if (selectedTypes.length === 0) return;
    const newQuestions = generateQuestionSet(selectedTypes, questionsPerType);
    setQuestions(newQuestions);
    setShowAnswers(false);
  }, [selectedTypes, questionsPerType]);

  const handlePrint = useCallback(() => {
    sessionStorage.setItem("printQuestions", JSON.stringify(questions));
    router.push("/print");
  }, [questions, router]);

  return (
    <div className="space-y-6">
      {/* Generator Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Question Generator
          </CardTitle>
          <CardDescription>
            Select question types and generate randomized CPL weight and balance questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Type Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium">Question Types:</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {QUESTION_TYPES.map(({ type, label, description }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    selectedTypes.includes(type)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                      selectedTypes.includes(type) 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground"
                    }`}>
                      {selectedTypes.includes(type) && (
                        <svg viewBox="0 0 24 24" className="h-3 w-3 text-primary-foreground">
                          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{label}</span>
                  </div>
                  <p className="mt-1 pl-6 text-xs text-muted-foreground">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Questions Per Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Questions per type: {questionsPerType}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={questionsPerType}
              onChange={(e) => setQuestionsPerType(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>5</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={generateQuestions} 
              disabled={selectedTypes.length === 0}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate {selectedTypes.length * questionsPerType} Question{selectedTypes.length * questionsPerType !== 1 ? 's' : ''}
            </Button>
            
            {questions.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAnswers(!showAnswers)}
                >
                  {showAnswers ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Hide Answers
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Show Answers
                    </>
                  )}
                </Button>
                
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Sheets
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Questions */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Generated Questions ({questions.length})
          </h2>
          <div className="grid gap-6">
            {questions.map((question, index) => (
              <QuestionCard 
                key={question.id} 
                question={question} 
                questionNumber={index + 1}
                showAnswer={showAnswers}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
