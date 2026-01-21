"use client";

import type { Question } from "@/lib/question-types";

interface PrintableSheetProps {
  questions: Question[];
  title?: string;
}

export function PrintableSheet({ questions, title = "CPL Weight & Balance Questions" }: PrintableSheetProps) {
  return (
    <div className="printable-sheet">
      {questions.map((question, index) => (
        <div key={`q-${question.id}`}>
          {/* Question Page */}
          <div className="print-page bg-white text-black p-8">
            <header className="mb-6 border-b-2 border-gray-300 pb-4">
              <h1 className="text-xl font-bold text-black">{title}</h1>
              <p className="text-sm text-gray-600">Loading System: ECHO | Aircraft Configuration: 6 Seats</p>
            </header>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black">
                  Question {index + 1}: {question.title}
                </h2>
                <span className="rounded border border-gray-400 px-2 py-1 text-xs font-medium text-gray-700">
                  {question.type.replace("-", " ").toUpperCase()}
                </span>
              </div>
              
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Scenario:</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-black">{question.scenarioText}</p>
              </div>
              
              <div className="rounded border-2 border-gray-400 bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold text-black">Question:</h3>
                <p className="whitespace-pre-line text-sm text-black">{question.question}</p>
              </div>
              
              {/* Working Space */}
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Working Space:</h3>
                <div className="h-64 rounded border-2 border-dashed border-gray-300 bg-white" />
              </div>
            </div>
            
            <footer className="mt-auto pt-6 text-center text-xs text-gray-500">
              Page {index * 2 + 1} of {questions.length * 2}
            </footer>
          </div>
          
          {/* Answer Page */}
          <div className="print-page bg-white text-black p-8">
            <header className="mb-6 border-b-2 border-gray-300 pb-4">
              <h1 className="text-xl font-bold text-black">{title} - Answers</h1>
              <p className="text-sm text-gray-600">Question {index + 1}: {question.title}</p>
            </header>
            
            <div className="space-y-6">
              <div className="rounded border-2 border-black bg-gray-100 p-4">
                <h3 className="mb-2 font-semibold text-black">Answer:</h3>
                <p className="whitespace-pre-line font-medium text-black">{question.answer}</p>
              </div>
              
              <div>
                <h3 className="mb-3 font-semibold text-black">Detailed Working:</h3>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-gray-100 p-4 font-mono text-[10px] leading-relaxed text-black">
                  {question.workings}
                </pre>
              </div>
              
              {/* Reference Data */}
              <div className="rounded border border-gray-300 bg-gray-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-black">Quick Reference - Echo Aircraft:</h3>
                <div className="grid grid-cols-2 gap-4 text-xs text-black">
                  <div>
                    <p><strong>MAC Length:</strong> 1900 mm</p>
                    <p><strong>MAC LE:</strong> 2190 mm aft datum</p>
                    <p><strong>MTOW:</strong> 2950 kg</p>
                    <p><strong>Fuel SG:</strong> 0.72</p>
                  </div>
                  <div>
                    <p><strong>MLW:</strong> 2725 kg</p>
                    <p><strong>MZFW:</strong> 2630 kg</p>
                    <p><strong>CG Range:</strong> 2400-2680 mm</p>
                    <p><strong>Mom Index:</strong> W × Arm ÷ 10000</p>
                  </div>
                </div>
              </div>
            </div>
            
            <footer className="mt-auto pt-6 text-center text-xs text-gray-500">
              Page {index * 2 + 2} of {questions.length * 2}
            </footer>
          </div>
        </div>
      ))}
    </div>
  );
}
