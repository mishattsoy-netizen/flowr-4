# Test Requests

Send each in a **new persistent chat**.

---

## Test 1: Note Creation via TOOLS (function calling)

**Request:**
```
create a note titled "Shopping List" with:
1. Milk
2. Eggs
3. Bread
4. Butter
```

**Expected chain:**
```
CLASSIFIER (keyword: "create a note") → TOOLS
  └─ Model with function calling (gemini/groq) calls create_note handler
  └─ blocks parameter used: [{type:"numberedList", content:"Milk"}, ...]
```

**Expected result:** Note actually created (handler executes). Numbered list shows 1, 2, 3, 4 (not all 1). Tool result card appears below the message with file icon, title, preview, and clickable arrow.

**Check:** The note EXISTS in the workspace after the message. The chat shows a card with 📄 icon.

---

## Test 2: `[m]` Mono Pills + Classifier Routing

**Request:**
```
how do I check my node version?
```

**Expected chain:**
```
CLASSIFIER → REGULAR (NOT CODING - simple terminal command)
  └─ Answer uses `[m]node -v[/m]` or `[m]node --version[/m]` for the command
```

**Expected result:** Short answer: "Use `node -v` or `node --version`" — rendered as inline code pills, NOT a fenced code block. No "I'll explain" or reasoning. Just the command.

**Check:** NO ``` fenced code blocks. `node -v` appears as an inline `` ` `` code span (green pill). The chain shows REGULAR, not CODING.
