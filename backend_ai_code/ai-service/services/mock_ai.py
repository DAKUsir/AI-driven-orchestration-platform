import random
import json
import os
from openai import OpenAI

# ── GitHub Models client (GPT-4o via OpenAI SDK) ──────────────────────
def _get_client(custom_api_key: str = None):
    token = custom_api_key or os.environ.get("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN is not set in environment variables.")
    return OpenAI(
        base_url="https://models.github.ai/inference",
        api_key=token,
    )

MODEL = "openai/gpt-4o"

# ── Static roadmap fallbacks (used when AI generation fails) ──────────
SAMPLE_ROADMAPS = {
    "frontend engineer": {
        "title": "Frontend Mastery Roadmap",
        "durationWeeks": 12,
        "milestones": [
            {"week": 1, "title": "HTML5 & CSS3 Foundations", "description": "Master semantic HTML and modern CSS layouts including Flexbox and Grid."},
            {"week": 2, "title": "JavaScript Core Concepts", "description": "Deep dive into closures, promises, async/await, and ES6+ features."},
            {"week": 3, "title": "React Fundamentals", "description": "Components, props, state, hooks, and the React lifecycle."},
            {"week": 4, "title": "State Management & Routing", "description": "Redux/Zustand, React Router, and context API patterns."},
            {"week": 5, "title": "Styling in React", "description": "Tailwind CSS, CSS-in-JS, component libraries, responsive design."},
            {"week": 6, "title": "API Integration", "description": "REST APIs, GraphQL, React Query, axios patterns, error handling."},
            {"week": 7, "title": "Testing & Debugging", "description": "Jest, React Testing Library, Cypress, debugging strategies."},
            {"week": 8, "title": "Performance Optimization", "description": "Lazy loading, code splitting, memoization, Core Web Vitals."},
            {"week": 9, "title": "Build Tools & Deployment", "description": "Vite, Webpack, CI/CD, Docker, Vercel/Netlify deployment."},
            {"week": 10, "title": "System Design for Frontend", "description": "Component architecture, micro-frontends, design systems."},
            {"week": 11, "title": "Mock Interviews & Projects", "description": "Build a production-grade app with all concepts learned."},
            {"week": 12, "title": "Final Review & Interview Prep", "description": "Comprehensive revision, behavioral questions, portfolio polish."}
        ],
        "tasks": [
            {"title": "Build a responsive navbar with Flexbox", "description": "Create a fully responsive navigation bar using CSS Flexbox with mobile hamburger menu.", "platform": "Frontend Mentor", "platformLink": "https://frontendmentor.io", "difficulty": "easy", "taskType": "project", "estimatedMinutes": 90},
            {"title": "JavaScript Promises Deep Dive", "description": "Solve 5 problems on promise chaining, error handling, and Promise.all.", "platform": "JavaScript.info", "platformLink": "https://javascript.info/promise-chaining", "difficulty": "medium", "taskType": "problem-solving", "estimatedMinutes": 60},
            {"title": "Build a Todo App with React Hooks", "description": "Implement a full CRUD todo application using useState, useEffect, and useContext.", "platform": "GitHub", "platformLink": "https://github.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 120},
            {"title": "State Management with Zustand", "description": "Convert the todo app to use Zustand for state management.", "platform": "GitHub", "platformLink": "https://github.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 60},
            {"title": "LeetCode: Design a Navigation System", "description": "Solve a medium-level problem on designing a browser navigation system using stacks.", "platform": "LeetCode", "platformLink": "https://leetcode.com/problems/design-browser-history", "difficulty": "medium", "taskType": "problem-solving", "estimatedMinutes": 45},
        ]
    },
    "backend engineer": {
        "title": "Backend Engineering Roadmap",
        "durationWeeks": 12,
        "milestones": [
            {"week": 1, "title": "Node.js Foundations", "description": "Event loop, modules, file system, streams, and buffers."},
            {"week": 2, "title": "Express.js & REST APIs", "description": "Routing, middleware, error handling, RESTful design principles."},
            {"week": 3, "title": "Databases: SQL & NoSQL", "description": "PostgreSQL basics, MongoDB with Mongoose, schema design, indexing."},
            {"week": 4, "title": "Authentication & Authorization", "description": "JWT, OAuth, session management, RBAC, security best practices."},
            {"week": 5, "title": "API Design Patterns", "description": "Clean architecture, dependency injection, repository pattern, DTOs."},
            {"week": 6, "title": "Testing & TDD", "description": "Jest, supertest, integration tests, mocking, test coverage."},
            {"week": 7, "title": "Caching & Performance", "description": "Redis, CDN, database indexing, query optimization, connection pooling."},
            {"week": 8, "title": "Message Queues & Events", "description": "RabbitMQ, Kafka, Bull for async job processing, event-driven architecture."},
            {"week": 9, "title": "Docker & Containerization", "description": "Dockerfiles, docker-compose, multi-stage builds, container networking."},
            {"week": 10, "title": "CI/CD & DevOps", "description": "GitHub Actions, deployment strategies, monitoring, logging."},
            {"week": 11, "title": "System Design & Scalability", "description": "Load balancing, horizontal scaling, microservices, database sharding."},
            {"week": 12, "title": "Mock Interviews & Portfolio", "description": "Comprehensive backend interviews, portfolio projects review."}
        ],
        "tasks": [
            {"title": "Build a REST API with Express", "description": "Create a complete CRUD API for a blog platform with authentication.", "platform": "GitHub", "platformLink": "https://github.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 120},
            {"title": "MongoDB Schema Design", "description": "Design schemas for an e-commerce platform with proper indexing and relations.", "platform": "MongoDB", "platformLink": "https://mongodb.com", "difficulty": "medium", "taskType": "problem-solving", "estimatedMinutes": 60},
            {"title": "Implement JWT Auth Flow", "description": "Build a complete JWT authentication system with refresh tokens and cookies.", "platform": "GitHub", "platformLink": "https://github.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 90},
            {"title": "LeetCode: Design a Rate Limiter", "description": "Implement a rate limiting algorithm (token bucket or sliding window).", "platform": "LeetCode", "platformLink": "https://leetcode.com", "difficulty": "hard", "taskType": "problem-solving", "estimatedMinutes": 60},
            {"title": "Dockerize Your Application", "description": "Create Dockerfiles and docker-compose for your backend application.", "platform": "GitHub", "platformLink": "https://github.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 60},
        ]
    },
}


# ── AI-Powered Roadmap Generation ─────────────────────────────────────
def generate_roadmap(role: str, skills: list, experience_level: str, daily_hours: int,
                     specific_track: str = None, specific_role: str = None):
    """Generate a personalized learning roadmap using GPT-4o. Falls back to static data on failure."""
    try:
        client = _get_client()

        track_info = f" specializing in {specific_track}" if specific_track else ""
        role_info = f" targeting {specific_role} position" if specific_role else ""

        prompt = f"""Generate a detailed, personalized learning roadmap as valid JSON. The user wants to become a {role}{track_info}{role_info}.

User Profile:
- Experience Level: {experience_level}
- Current Skills: {', '.join(skills) if skills else 'None specified'}
- Daily Study Hours: {daily_hours}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{{
  "title": "Descriptive Roadmap Title",
  "durationWeeks": <number based on experience and daily hours>,
  "milestones": [
    {{"week": 1, "title": "Milestone Title", "description": "What to learn this week"}},
    ... (8-16 milestones)
  ],
  "tasks": [
    {{
      "title": "Task Title",
      "description": "Detailed task description",
      "platform": "Platform Name (LeetCode, GitHub, Kaggle, etc.)",
      "platformLink": "https://...",
      "difficulty": "easy|medium|hard",
      "taskType": "problem-solving|project|mock-interview|video|article|quiz|system-design",
      "estimatedMinutes": <number>
    }},
    ... (10-20 tasks)
  ]
}}

Make it realistic, actionable, and tailored to the user's level. Include real platform links where possible."""

        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert career coach and technical mentor. You generate highly personalized, actionable learning roadmaps. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            model=MODEL,
            temperature=0.7,
            max_tokens=4096,
            top_p=1
        )

        result_text = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.strip()

        roadmap_data = json.loads(result_text)
        # Validate required fields
        assert "title" in roadmap_data
        assert "milestones" in roadmap_data
        assert "tasks" in roadmap_data
        return roadmap_data

    except Exception as e:
        print(f"[AI Roadmap] GPT-4o generation failed, using fallback: {e}")
        # Fallback to static data
        role_lower = role.lower() if role else "backend engineer"
        for key, value in SAMPLE_ROADMAPS.items():
            if key in role_lower or role_lower in key:
                roadmap = value
                break
        else:
            roadmap = SAMPLE_ROADMAPS["backend engineer"]

        roadmap_copy = json.loads(json.dumps(roadmap))
        roadmap_copy["durationWeeks"] = max(4, min(24, daily_hours * 6))
        return roadmap_copy


# ── AI Chat (GPT-4o) ──────────────────────────────────────────────────
SYSTEM_PROMPTS = {
    "mentor": (
        "You are an expert AI coding mentor on a competitive learning platform. "
        "Help users learn programming concepts, debug code, explain algorithms, and prepare for technical interviews. "
        "Be encouraging, structured, and concise. Use code examples when helpful. "
        "Format responses with markdown: use **bold** for emphasis, `code` for inline code, and ```language blocks for code snippets."
    ),
    "code-editor": (
        "You are an AI coding assistant embedded in a code editor. The user will share their code context with you. "
        "Help them understand their code, find bugs, optimize performance, and learn best practices. "
        "When giving hints, don't give the full solution directly — guide them to discover the answer. "
        "Use code snippets and clear explanations."
    ),
    "roadmap": (
        "You are an AI mentor helping a user with their personalized learning roadmap. "
        "Provide concise, encouraging, and structured advice about their learning path, suggest resources, and help them prioritize."
    ),
    "interview": (
        "You are an AI technical interviewer. Ask relevant interview questions, "
        "provide structured feedback on answers, and help users improve their interview skills. "
        "Use the STAR method for behavioral questions."
    ),
    "debugging": (
        "You are an AI debugging specialist. Analyze code carefully, identify bugs, explain root causes clearly, "
        "and provide corrected code with explanations. Be thorough but concise."
    ),
    "resume": (
        "You are an AI career coach specializing in resume review. Provide constructive, actionable feedback on resumes."
    ),
    "behavioral": (
        "You are an AI behavioral interview coach. Help users craft compelling STAR stories and practice behavioral questions."
    ),
    "career": (
        "You are an AI career advisor. Help users plan their career path, suggest skill development areas, and provide industry insights."
    ),
    "general": (
        "You are an expert AI coding mentor. Help users with any programming questions, concepts, or career advice. "
        "Be concise, encouraging, and use code examples when helpful."
    ),
}


def chat_response(messages: list, context_type: str, custom_api_key: str = None):
    """Send a chat message to GPT-4o and return the response."""
    try:
        client = _get_client(custom_api_key)

        sys_prompt = SYSTEM_PROMPTS.get(context_type, SYSTEM_PROMPTS["general"])

        formatted_messages = [{"role": "system", "content": sys_prompt}]

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant"):
                formatted_messages.append({"role": role, "content": content})

        response = client.chat.completions.create(
            messages=formatted_messages,
            model=MODEL,
            temperature=0.8,
            max_tokens=4096,
            top_p=1
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"I'm having trouble connecting to the AI service right now. Error: {str(e)}"


# ── AI Code Debugging ─────────────────────────────────────────────────
def debug_code(code: str, language: str, error: str = None, custom_api_key: str = None):
    """Debug code using GPT-4o."""
    try:
        client = _get_client(custom_api_key)

        sys_prompt = (
            f"You are an expert {language} developer. The user will provide code and optionally an error message. "
            f"Debug it and respond with a JSON object exactly in this format: "
            f'{{"explanation": "A string explaining the issue", "fixedCode": "The corrected code", "suggestions": ["suggestion1", "suggestion2"]}}. '
            f"Ensure your response is valid JSON without markdown wrapping."
        )

        user_content = f"Code:\n{code}\n"
        if error:
            user_content += f"\nError Message:\n{error}\n"

        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_content}
            ],
            model=MODEL,
            temperature=0.3,
            max_tokens=4096,
            top_p=1
        )

        result_text = response.choices[0].message.content
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.strip()

        try:
            result_data = json.loads(result_text)
            return {
                "explanation": result_data.get("explanation", "No explanation provided."),
                "fixedCode": result_data.get("fixedCode", code),
                "suggestions": result_data.get("suggestions", [])
            }
        except json.JSONDecodeError:
            return {
                "explanation": result_text,
                "fixedCode": code,
                "suggestions": ["Could not parse structured response from AI."]
            }
    except Exception as e:
        return {
            "explanation": f"Error communicating with AI service: {str(e)}",
            "fixedCode": code,
            "suggestions": []
        }


# ── Resume Analysis (static mock — unchanged) ─────────────────────────
RESUME_ANALYSES = {
    "software engineer": {
        "atsScore": 78,
        "strengths": [
            "Strong project experience with modern web technologies (React, Node.js)",
            "Clear demonstration of full-stack development capabilities",
            "Good use of action verbs and quantifiable achievements",
        ],
        "weaknesses": [
            "Summary section lacks specificity about career goals",
            "Experience section could use more metrics and KPIs",
            "Missing keywords for ATS: 'CI/CD', 'Docker', 'testing frameworks'",
        ],
        "suggestions": [
            "Add a professional summary tailored to the target role at the top",
            "Quantify achievements: 'Increased API response time by 40%'",
            "Include relevant certifications and online courses",
            "Add a 'Technical Skills' section grouped by proficiency level",
        ]
    },
}


def analyze_resume(text: str, target_role: str):
    role_lower = target_role.lower()
    for key, value in RESUME_ANALYSES.items():
        if key in role_lower:
            analysis = value
            break
    else:
        analysis = RESUME_ANALYSES["software engineer"]

    analysis_copy = json.loads(json.dumps(analysis))
    analysis_copy["atsScore"] = max(40, min(95, analysis_copy["atsScore"] + random.randint(-10, 10)))
    return analysis_copy


# ── Interview Questions (static mock — unchanged) ─────────────────────
def generate_interview_questions(interview_type: str, difficulty: str, role: str):
    questions_db = {
        "technical": [
            {"question": "Explain the difference between REST and GraphQL. When would you choose one over the other?", "category": "API Design", "difficulty": "medium"},
            {"question": "How does JavaScript's event loop work? Explain microtasks vs macrotasks.", "category": "JavaScript", "difficulty": "medium"},
            {"question": "Design a rate limiter for a distributed system.", "category": "System Design", "difficulty": "hard"},
            {"question": "What is the difference between optimistic and pessimistic concurrency control?", "category": "Databases", "difficulty": "hard"},
            {"question": "Explain how garbage collection works in V8 engine.", "category": "JavaScript", "difficulty": "medium"},
        ],
        "behavioral": [
            {"question": "Tell me about a time you had to make a difficult technical decision with limited information.", "category": "Decision Making", "difficulty": "medium"},
            {"question": "Describe a situation where you disagreed with a teammate. How did you resolve it?", "category": "Teamwork", "difficulty": "medium"},
            {"question": "Tell me about a project that failed. What did you learn from it?", "category": "Learning", "difficulty": "medium"},
        ],
        "system-design": [
            {"question": "Design a URL shortening service like TinyURL.", "category": "System Design", "difficulty": "medium"},
            {"question": "Design Twitter's news feed.", "category": "System Design", "difficulty": "hard"},
            {"question": "Design a distributed key-value store.", "category": "System Design", "difficulty": "hard"},
        ]
    }

    questions = questions_db.get(interview_type, questions_db["technical"])
    filtered = [q for q in questions if q["difficulty"] == difficulty] or questions
    selected = random.sample(filtered, min(5, len(filtered)))

    feedback = {
        "overall": random.randint(65, 92),
        "technical": random.randint(60, 95),
        "communication": random.randint(70, 95),
        "confidence": random.randint(55, 90),
        "strengths": [
            "Strong analytical thinking and problem decomposition",
            "Good communication of complex technical concepts",
        ],
        "improvements": [
            "Work on providing more structured responses (STAR method)",
            "Practice whiteboard/system design hands-on",
        ]
    }

    return {"questions": selected, "feedback": feedback}
