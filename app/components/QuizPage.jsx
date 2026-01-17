"use client";
import { useState } from "react";

export default function QuizApp() {
  const [response, setResponse] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = () => {
    if (!input) return;
    setIsLoading(true);

    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: "You are a quiz generator. please generate 10 quiz",
          },
          {
            role: "user",
            content: input,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "quiz_set",
            schema: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  minItems: 10,
                  maxItems: 10,
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      question: { type: "string" },
                      options: {
                        type: "array",
                        items: { type: "string" },
                        minItems: 4,
                        maxItems: 4,
                      },
                      answer: { type: "string" },
                    },
                    required: ["id", "question", "options", "answer"],
                  },
                },
              },
              required: ["questions"],
            },
          },
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        let jsonData = data.choices[0].message.content;
        let quiaeObeject = JSON.parse(jsonData);
        console.log(quiaeObeject);
        setResponse(quiaeObeject.questions);
        setInput("");
        setIsLoading(false);
      });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto min-h-screen">
      <input
        type="text"
        placeholder="Write a question..."
        className="w-full p-2 border rounded-lg text-white mb-4"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {isLoading && <div>Loading...</div>}
      <button
        className="border border-gray-700 hover:bg-zinc-700 text-sm px-3 py-1 rounded-full cursor-pointer"
        onClick={sendMessage}
      >
        Generate
      </button>
      <div className="space-y-6">
        {response.map((q) => (
          <div key={q.id} className="mt-6">
            <div className="px-4 py-2 bg-zinc-800 text-white rounded-lg shadow">
              {q.question}
            </div>

            <div className="mt-3 space-y-2">
              {q.options.map((opt) => (
                <div
                  key={opt}
                  className="px-4 py-2 bg-gray-200 text-red-500 rounded-lg shadow cursor-pointer hover:bg-gray-300"
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
