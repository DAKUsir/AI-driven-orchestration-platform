import json
import os
from openai import OpenAI

# ── GitHub Models client (GPT-4o via OpenAI SDK) ──────────────────────
def _get_client():
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN is not set in environment variables.")
    return OpenAI(
        base_url="https://models.github.ai/inference",
        api_key=token,
    )

MODEL = "openai/gpt-4o"


# ── 1. Break a large goal into small tasks ────────────────────────────
def break_task(goal: str, context: str = ""):
    """Break a large learning goal into smaller actionable tasks."""
    try:
        client = _get_client()
        prompt = f"""Break this learning goal into 5-10 small, actionable tasks.
Each task should be completable in 30-90 minutes.

Goal: {goal}
{f'Context: {context}' if context else ''}

Return ONLY valid JSON array (no markdown):
[
  {{"title": "Task title", "description": "Brief description", "estimatedMinutes": 45, "category": "youtube|coursera|github|leetcode|gfg|kaggle|interview-prep|other", "difficulty": "easy|medium|hard", "sourceLink": "URL if applicable"}}
]"""

        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a study planning assistant. Break goals into actionable tasks. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            model=MODEL,
            temperature=0.7,
            max_tokens=2048,
        )

        result = response.choices[0].message.content.strip()
        if result.startswith("```json"): result = result[7:]
        if result.startswith("```"): result = result[3:]
        if result.endswith("```"): result = result[:-3]
        return json.loads(result.strip())

    except Exception as e:
        print(f"[AI] break_task failed: {e}")
        return [
            {"title": f"Work on: {goal}", "description": "Break this down further", "estimatedMinutes": 60, "category": "other", "difficulty": "medium", "sourceLink": ""}
        ]


# ── 2. Prioritize today's tasks ──────────────────────────────────────
def prioritize_day(tasks: list, available_hours: float = 4):
    """Given today's tasks, suggest optimal order."""
    try:
        client = _get_client()
        task_list = "\n".join([f"- {t.get('title', 'Untitled')} (priority: {t.get('priority', 'medium')}, est: {t.get('estimatedMinutes', 30)}min)" for t in tasks])

        prompt = f"""Here are today's tasks:
{task_list}

Available hours: {available_hours}

Suggest the best order to tackle these tasks. Consider:
- High priority tasks first
- Hardest tasks when energy is highest (morning)
- Quick wins to build momentum
- Flag if total estimated time exceeds available hours

Return ONLY valid JSON (no markdown):
{{
  "order": ["task title 1", "task title 2", ...],
  "overloaded": true/false,
  "tips": "Brief scheduling advice"
}}"""

        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a productivity coach. Help prioritize study tasks. Respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            model=MODEL,
            temperature=0.5,
            max_tokens=1024,
        )

        result = response.choices[0].message.content.strip()
        if result.startswith("```json"): result = result[7:]
        if result.startswith("```"): result = result[3:]
        if result.endswith("```"): result = result[:-3]
        return json.loads(result.strip())

    except Exception as e:
        print(f"[AI] prioritize_day failed: {e}")
        return {"order": [t.get("title", "") for t in tasks], "overloaded": False, "tips": "Work through tasks in order of priority."}


# ── 3. Weekly review summary ─────────────────────────────────────────
def weekly_review_summary(completed: list, skipped: list, carried: list):
    """Generate a 'what slipped this week' summary."""
    try:
        client = _get_client()
        prompt = f"""Generate a brief, encouraging weekly study review.

Completed tasks: {', '.join(completed) if completed else 'None'}
Skipped tasks: {', '.join(skipped) if skipped else 'None'}
Carried forward: {', '.join(carried) if carried else 'None'}

Include:
1. What went well
2. What slipped and why it might have happened
3. One actionable tip for next week

Keep it under 150 words. Be motivating, not judgmental."""

        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a supportive study accountability coach. Be encouraging and constructive."},
                {"role": "user", "content": prompt}
            ],
            model=MODEL,
            temperature=0.8,
            max_tokens=512,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[AI] weekly_review failed: {e}")
        c = len(completed)
        s = len(skipped)
        return f"You completed {c} tasks this week. {s} tasks were skipped. Keep pushing — consistency is key!"


# ── 4. Smart rescheduling ─────────────────────────────────────────────
def reschedule_tasks(tasks: list, available_hours: float = 4):
    """Suggest how to reschedule missed tasks across the coming week."""
    try:
        client = _get_client()
        task_list = "\n".join([f"- {t.get('title', 'Untitled')} (est: {t.get('estimatedMinutes', 30)}min, priority: {t.get('priority', 'medium')})" for t in tasks])

        prompt = f"""These tasks were missed and need rescheduling across the next 7 days.

Tasks:
{task_list}

Available hours per day: {available_hours}

Suggest a day for each task (Day 1 = tomorrow). Don't overload any single day.

Return ONLY valid JSON (no markdown):
[
  {{"title": "task title", "suggestedDay": 1, "reason": "brief reason"}}
]"""

        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a study planning assistant. Help reschedule missed tasks. Respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            model=MODEL,
            temperature=0.5,
            max_tokens=1024,
        )

        result = response.choices[0].message.content.strip()
        if result.startswith("```json"): result = result[7:]
        if result.startswith("```"): result = result[3:]
        if result.endswith("```"): result = result[:-3]
        return json.loads(result.strip())

    except Exception as e:
        print(f"[AI] reschedule failed: {e}")
        return [{"title": t.get("title", ""), "suggestedDay": i % 7 + 1, "reason": "Spread across the week"} for i, t in enumerate(tasks)]
