import { useState } from 'react'
import { motion } from 'framer-motion'
import { Code2, Play, RotateCcw, ChevronDown, Terminal } from 'lucide-react'
import Editor from '@monaco-editor/react'

const languages = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'typescript', label: 'TypeScript' },
]

const defaultCode = {
  javascript: `// Two Sum — LeetCode #1
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]`,
  python: `# Two Sum — LeetCode #1
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test
print(two_sum([2, 7, 11, 15], 9))  # [0, 1]`,
  java: `// Two Sum — LeetCode #1
import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
  cpp: `// Two Sum — LeetCode #1
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.count(complement)) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,
  typescript: `// Two Sum — LeetCode #1
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]`,
}

const sampleProblem = {
  title: 'Two Sum',
  difficulty: 'Easy',
  description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
  examples: [
    { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
    { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: '' },
  ],
}

export default function CodeEditorPage() {
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(defaultCode.javascript)
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode(defaultCode[lang] || '')
    setShowLangMenu(false)
  }

  const handleRun = async () => {
    setRunning(true)
    setOutput('')
    // Simulate code execution (in production, this would call a sandboxed Docker backend)
    setTimeout(() => {
      if (language === 'javascript' || language === 'typescript') {
        try {
          const logs = []
          const originalLog = console.log
          console.log = (...args) => logs.push(args.map(a => JSON.stringify(a)).join(' '))
            const indirectEval = eval
          indirectEval(code)
          console.log = originalLog
          setOutput(logs.join('\n') || 'No output')
        } catch (err) {
          setOutput(`Error: ${err.message}`)
        }
      } else {
        setOutput(`[Simulated] Code execution for ${language} requires a backend sandbox.\nOutput would appear here.`)
      }
      setRunning(false)
    }, 500)
  }

  const handleReset = () => {
    setCode(defaultCode[language] || '')
    setOutput('')
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Code Editor</h1>
        <p className="text-sm text-zinc-500 mt-1">Practice coding with the Monaco Editor</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Problem statement */}
        <div className="card p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-zinc-100">{sampleProblem.title}</h2>
            <span className="badge badge-success text-xs">{sampleProblem.difficulty}</span>
          </div>

          <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap mb-5">
            {sampleProblem.description}
          </div>

          {sampleProblem.examples.map((ex, i) => (
            <div key={i} className="mb-4 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <p className="text-xs font-medium text-zinc-400 mb-2">Example {i + 1}</p>
              <p className="text-sm text-zinc-300 font-mono"><strong className="text-zinc-200">Input:</strong> {ex.input}</p>
              <p className="text-sm text-zinc-300 font-mono"><strong className="text-zinc-200">Output:</strong> {ex.output}</p>
              {ex.explanation && (
                <p className="text-sm text-zinc-500 mt-1"><strong>Explanation:</strong> {ex.explanation}</p>
              )}
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="flex flex-col gap-3">
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="btn btn-secondary btn-sm"
                id="language-selector"
              >
                {languages.find(l => l.id === language)?.label}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showLangMenu && (
                <div className="absolute top-full mt-1 left-0 z-10 card p-1 min-w-[150px]">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        language === lang.id ? 'bg-indigo-500/12 text-indigo-400' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1" />

            <button onClick={handleReset} className="btn btn-ghost btn-sm btn-icon" title="Reset">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              className="btn btn-primary btn-sm"
              id="run-code"
            >
              {running ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="card overflow-hidden" style={{ height: '400px' }}>
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* Output */}
          <div className="card p-4" style={{ minHeight: '120px' }}>
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-medium text-zinc-400">Output</span>
            </div>
            <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap">
              {output || <span className="text-zinc-700">Run your code to see output here...</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
