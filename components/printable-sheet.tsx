"use client";

import type { Question } from "@/lib/question-types";
import React from "react";

interface PrintableSheetProps {
  questions: Question[];
  title?: string;
}

export function PrintableSheet({ questions, title = "CPL Weight & Balance Questions" }: PrintableSheetProps) {
  return (
    <div className="printable-sheet bg-white text-black">
      {questions.map((question, index) => (
        <React.Fragment key={`q-${question.id}`}>
          {/* Question Page */}
          <div 
            className="print-page flex flex-col bg-white text-black p-12"
          >
            <header className="mb-6 border-b-2 border-gray-400 pb-4">
              <h1 className="text-xl font-bold text-black">{title}</h1>
              <p className="text-sm text-gray-600">Loading System: ECHO | Aircraft Configuration: 6 Seats</p>
            </header>
            
            <div className="flex-1 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black">
                  Question {index + 1}: {question.title}
                </h2>
                <span className="rounded border border-gray-500 px-2 py-1 text-xs font-medium text-gray-700 uppercase">
                  {question.type.replace("-", " ")}
                </span>
              </div>
              
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Scenario:</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-black">{question.scenarioText}</p>
              </div>
              
              <div className="rounded border-2 border-gray-500 bg-gray-100 p-4">
                <h3 className="mb-2 font-semibold text-black">Required:</h3>
                <p className="whitespace-pre-line text-sm text-black">{question.question}</p>
              </div>
              
              {/* Working Space */}
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Working Space:</h3>
                <div className="h-86 rounded border-2 border-dashed border-gray-400 bg-white" />
              </div>
            </div>
          </div>
          
          {/* Answer Page */}
          <div 
            className="print-page flex flex-col bg-white text-black p-12"
          >
            <header className="mb-6 border-b-2 border-gray-400 pb-4">
              <h1 className="text-xl font-bold text-black">{title} - Answers</h1>
              <p className="text-sm text-gray-600">Question {index + 1}: {question.title}</p>
            </header>
            
            <div className="flex-1 space-y-4">
              <div className="rounded border-2 border-black bg-gray-200 p-4">
                <h3 className="mb-2 font-semibold text-black">Answer:</h3>
                <p className="whitespace-pre-line font-medium text-black">{question.answer}</p>
              </div>
              
              <div>
                <h3 className="mb-2 font-semibold text-black">Detailed Working:</h3>
                <pre className="overflow-hidden whitespace-pre-wrap rounded bg-gray-100 p-3 font-mono text-[9px] leading-tight text-black border border-gray-300">
                  {question.workings}
                </pre>
              </div>
              
              {/* Reference Data */}
              <div className="rounded border border-gray-400 bg-gray-50 p-3">
                <h3 className="mb-2 text-sm font-semibold text-black">Quick Reference - Echo Aircraft:</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-black">
                  <p><span className="font-semibold">MAC Length:</span> 1900 mm</p>
                  <p><span className="font-semibold">MAC LE:</span> 2190 mm aft datum</p>
                  <p><span className="font-semibold">MTOW:</span> 2950 kg</p>
                  <p><span className="font-semibold">MLW:</span> 2725 kg</p>
                  <p><span className="font-semibold">MZFW:</span> 2630 kg</p>
                  <p><span className="font-semibold">Fuel SG:</span> 0.72</p>
                  <p><span className="font-semibold">CG Range:</span> 2400-2680 mm</p>
                  <p><span className="font-semibold">Mom Index:</span> W x Arm / 10000</p>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
