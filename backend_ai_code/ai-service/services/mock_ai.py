import random
import json

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
            {"title": "Watch: React Performance Patterns", "description": "Watch and implement patterns from Kent C. Dodds on React performance.", "platform": "YouTube", "platformLink": "https://youtube.com", "difficulty": "easy", "taskType": "video", "estimatedMinutes": 45},
            {"title": "Write Tests for Your Components", "description": "Add unit tests using React Testing Library for the todo app components.", "platform": "GitHub", "platformLink": "https://github.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 90},
            {"title": "Deploy App to Vercel", "description": "Deploy your todo application to Vercel with CI/CD pipeline.", "platform": "Vercel", "platformLink": "https://vercel.com", "difficulty": "easy", "taskType": "project", "estimatedMinutes": 30},
            {"title": "System Design: Design Twitter Feed", "description": "Design the architecture for a social media feed, focusing on component tree and data flow.", "platform": "System Design", "platformLink": "https://systemdesign.io", "difficulty": "hard", "taskType": "system-design", "estimatedMinutes": 60},
            {"title": "Mock Interview: Frontend Round", "description": "Practice a 45-minute mock frontend interview covering React, CSS, and system design.", "platform": "AI Mentor", "platformLink": "/mentor", "difficulty": "hard", "taskType": "mock-interview", "estimatedMinutes": 45}
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
            {"title": "Redis Caching Layer", "description": "Add Redis caching to your API with proper cache invalidation strategies.", "platform": "GitHub", "platformLink": "https://github.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 90},
            {"title": "Dockerize Your Application", "description": "Create Dockerfiles and docker-compose for your backend application.", "platform": "GitHub", "platformLink": "https://github.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 60},
            {"title": "Write API Integration Tests", "description": "Write comprehensive integration tests for all your API endpoints.", "platform": "GitHub", "platformLink": "https://github.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 60},
            {"title": "Set Up CI/CD Pipeline", "description": "Configure GitHub Actions for automated testing and deployment.", "platform": "GitHub", "platformLink": "https://github.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 45},
            {"title": "System Design: Design URL Shortener", "description": "Design a scalable URL shortening service like TinyURL.", "platform": "System Design", "platformLink": "https://systemdesign.io", "difficulty": "hard", "taskType": "system-design", "estimatedMinutes": 60},
            {"title": "Mock Interview: Backend Round", "description": "Practice a 45-minute mock backend interview covering APIs, databases, design.", "platform": "AI Mentor", "platformLink": "/mentor", "difficulty": "hard", "taskType": "mock-interview", "estimatedMinutes": 45}
        ]
    },
    "data scientist": {
        "title": "Data Science & ML Roadmap",
        "durationWeeks": 12,
        "milestones": [
            {"week": 1, "title": "Python for Data Science", "description": "NumPy, Pandas, data manipulation and cleaning."},
            {"week": 2, "title": "Statistics & Probability", "description": "Descriptive statistics, probability distributions, hypothesis testing."},
            {"week": 3, "title": "Data Visualization", "description": "Matplotlib, Seaborn, Plotly, storytelling with data."},
            {"week": 4, "title": "Machine Learning Fundamentals", "description": "Supervised vs unsupervised learning, train/test split, cross-validation."},
            {"week": 5, "title": "Regression Models", "description": "Linear regression, polynomial regression, regularization techniques."},
            {"week": 6, "title": "Classification Algorithms", "description": "Logistic regression, decision trees, random forests, SVM."},
            {"week": 7, "title": "Feature Engineering & Selection", "description": "Feature scaling, encoding, PCA, feature importance."},
            {"week": 8, "title": "Deep Learning Basics", "description": "Neural networks, TensorFlow/Keras, CNNs for image classification."},
            {"week": 9, "title": "NLP Fundamentals", "description": "Text preprocessing, embeddings, transformers, BERT basics."},
            {"week": 10, "title": "MLOps & Deployment", "description": "Model deployment, MLflow, Docker for ML, API serving."},
            {"week": 11, "title": "Kaggle Competitions", "description": "End-to-end Kaggle workflow, feature engineering for competition data."},
            {"week": 12, "title": "Capstone & Interview Prep", "description": "Complete a full ML project and prepare for data science interviews."}
        ],
        "tasks": [
            {"title": "Pandas Data Cleaning Project", "description": "Clean and preprocess a real-world dataset (handling missing values, outliers).", "platform": "Kaggle", "platformLink": "https://kaggle.com", "difficulty": "easy", "taskType": "project", "estimatedMinutes": 90},
            {"title": "Exploratory Data Analysis", "description": "Perform EDA on the Titanic dataset with visualizations and insights.", "platform": "Kaggle", "platformLink": "https://kaggle.com", "difficulty": "easy", "taskType": "problem-solving", "estimatedMinutes": 60},
            {"title": "Build a Linear Regression Model", "description": "Predict house prices using linear regression with scikit-learn.", "platform": "Kaggle", "platformLink": "https://kaggle.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 60},
            {"title": "Classification with Random Forest", "description": "Build a random forest classifier for the Iris/Wine dataset.", "platform": "Kaggle", "platformLink": "https://kaggle.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 60},
            {"title": "Feature Engineering Challenge", "description": "Create new features and select the best ones for improved model performance.", "platform": "Kaggle", "platformLink": "https://kaggle.com", "difficulty": "medium", "taskType": "problem-solving", "estimatedMinutes": 90},
            {"title": "CNN Image Classifier", "description": "Build a CNN to classify images from CIFAR-10 using TensorFlow.", "platform": "Kaggle", "platformLink": "https://kaggle.com", "difficulty": "hard", "taskType": "project", "estimatedMinutes": 120},
            {"title": "NLP Sentiment Analysis", "description": "Build a sentiment analysis model using BERT or traditional ML approaches.", "platform": "Kaggle", "platformLink": "https://kaggle.com", "difficulty": "hard", "taskType": "project", "estimatedMinutes": 120},
            {"title": "Deploy ML Model as API", "description": "Create a FastAPI endpoint for your ML model and deploy it.", "platform": "GitHub", "platformLink": "https://github.com", "difficulty": "medium", "taskType": "project", "estimatedMinutes": 90},
            {"title": "Kaggle Competition Entry", "description": "Submit your first Kaggle competition entry with a complete pipeline.", "platform": "Kaggle", "platformLink": "https://kaggle.com/competitions", "difficulty": "hard", "taskType": "project", "estimatedMinutes": 180},
            {"title": "Mock Interview: Data Science", "description": "Practice a data science mock interview covering ML theory and case studies.", "platform": "AI Mentor", "platformLink": "/mentor", "difficulty": "hard", "taskType": "mock-interview", "estimatedMinutes": 45}
        ]
    }
}

RESUME_ANALYSES = {
    "software engineer": {
        "atsScore": 78,
        "strengths": [
            "Strong project experience with modern web technologies (React, Node.js)",
            "Clear demonstration of full-stack development capabilities",
            "Good use of action verbs and quantifiable achievements",
            "Relevant technical skills section with proper categorization",
            "Includes links to GitHub portfolio and live projects"
        ],
        "weaknesses": [
            "Summary section lacks specificity about career goals",
            "Experience section could use more metrics and KPIs",
            "Education section placement could be optimized",
            "Missing keywords for ATS: 'CI/CD', 'Docker', 'testing frameworks'",
            "Formatting inconsistencies in bullet point structure"
        ],
        "suggestions": [
            "Add a professional summary tailored to the target role at the top",
            "Quantify achievements: 'Increased API response time by 40%' instead of 'Improved API performance'",
            "Include relevant certifications and online courses",
            "Add a 'Technical Skills' section grouped by proficiency level",
            "Optimize for ATS by including keywords from the job description",
            "Add links to your LeetCode/GitHub profiles for credibility",
            "Use consistent past tense for all previous roles",
            "Include a projects section with 2-3 standout projects and their impact"
        ]
    },
    "data scientist": {
        "atsScore": 72,
        "strengths": [
            "Strong technical skills in Python, SQL, and machine learning frameworks",
            "Good demonstration of statistical analysis experience",
            "Relevant data visualization portfolio included",
            "Clear educational background in quantitative field"
        ],
        "weaknesses": [
            "Missing specific ML project outcomes and metrics",
            "Limited mention of big data tools (Spark, Hadoop)",
            "No evidence of MLOps or model deployment experience",
            "GitHub link not provided or inactive",
            "Kaggle profile/competition experience not mentioned"
        ],
        "suggestions": [
            "Highlight specific model performance metrics (accuracy, F1, AUC-ROC)",
            "Add a 'Projects' section with links to GitHub repositories",
            "Include Kaggle competition results and rankings",
            "Mention experience with cloud platforms (AWS SageMaker, GCP AI Platform)",
            "Add deployment experience: Docker, FastAPI, Streamlit for model serving",
            "Include A/B testing and experiment design experience",
            "Showcase domain expertise with industry-specific projects",
            "Add links to published notebooks or blog posts"
        ]
    },
    "product manager": {
        "atsScore": 75,
        "strengths": [
            "Strong cross-functional collaboration experience demonstrated",
            "Clear examples of product lifecycle management",
            "Good balance of technical and business acumen",
            "Data-driven decision making highlighted in experience"
        ],
        "weaknesses": [
            "Missing specific metrics on product impact (revenue, users, retention)",
            "Limited mention of agile/scrum methodology certifications",
            "Could better showcase stakeholder management skills",
            "No mention of A/B testing or experimentation frameworks",
            "Product roadmap examples not clearly articulated"
        ],
        "suggestions": [
            "Quantify product impact: 'Launched feature that increased retention by 25%'",
            "Include specific examples of cross-team collaboration",
            "Add certifications: CSPO, SAFe, or equivalent",
            "Showcase experience with product analytics tools (Mixpanel, Amplitude)",
            "Include user research and customer discovery examples",
            "Demonstrate understanding of technical trade-offs in product decisions",
            "Add a 'Key Achievements' section with measurable outcomes",
            "Highlight experience with OKRs and KPI tracking"
        ]
    }
}

CHAT_RESPONSES = {
    "roadmap": [
        "Based on your current progress, I recommend focusing on {topic} this week. Your weak areas from the last assessment suggest we need more practice with data structures. Here's a targeted plan:\n\n1. **Review**: Binary Trees fundamentals (30 min)\n2. **Practice**: Solve 2 medium LeetCode tree problems (60 min)\n3. **Build**: Implement a tree traversal visualizer (45 min)\n4. **Review**: Watch the 'Tree Algorithms Explained' video (20 min)\n\nWould you like me to break down any of these tasks further?",
        "Great question! Let me analyze your progress pattern. You've been consistently solving easy problems but haven't attempted many hard ones yet. For your target role at {role}, you need to focus on:\n\n- **Priority 1**: System Design fundamentals (you're at 30% proficiency)\n- **Priority 2**: Dynamic Programming patterns (only 2 solved so far)\n- **Priority 3**: Concurrency & multithreading concepts\n\nI've updated your roadmap to include more DP practice this week. Start with the 'House Robber' pattern - it's foundational for understanding DP optimization.",
        "I see you've completed 60% of this week's tasks. Excellent progress! Here's what I suggest for the remaining tasks:\n\n✅ **Completed**: Arrays, Strings, Basic Recursion\n📋 **Remaining**: Graph traversal, Dynamic Programming\n\n⚠️ **Note**: You spent 45min on the recursion problem - that's normal for this stage. The key insight is understanding the state space tree.\n\n💡 **Pro Tip**: For the upcoming graph problems, try drawing the adjacency list before coding. Most candidates find this reduces implementation time by 30%.",
        "Let me help you debug that issue. Looking at your code pattern:\n\n```\nThe issue is likely that you're mutating state directly instead of creating a new reference.\n```\n\nHere's the fix:\n```javascript\n// Instead of:\narr[0] = newValue;\n\n// Use:\nconst newArr = [...arr];\nnewArr[0] = newValue;\n```\n\nThis ensures React's reconciliation detects the change. Would you like me to explain why this matters for virtual DOM diffing?",
        "Your current study velocity is 3.2 tasks/day. To complete your roadmap in 8 weeks, you need to maintain 2.8 tasks/day. You're **ahead of schedule**! 🎉\n\nConsider using the extra time to:\n1. Deep dive into weak topics (I've identified 3)\n2. Build a portfolio project integrating multiple concepts\n3. Practice mock interviews (I can simulate one for you)\n\nWant me to generate a revised roadmap that capitalizes on your momentum?"
    ],
    "interview": [
        "Let's practice a real interview question. Here's a common one for {role}:\n\n**Question**: \"Design a URL shortening service like TinyURL.\"\n\nTake 2 minutes to think, then explain:\n1. What functional and non-functional requirements would you consider?\n2. How would you handle the database schema?\n3. What's your approach to generating short URLs?\n\nI'll evaluate your answer across: **System Design**, **Scalability**, **Database Knowledge**, and **Communication**.",
        "Great answer! Here's my feedback:\n\n**Strengths**:\n✅ Clear explanation of hash-based URL generation\n✅ Good consideration of read-heavy workload\n✅ Mentioned caching layer (Redis)\n\n**Areas to Improve**:\n⚠️ Database sharding strategy could be more specific\n⚠️ Didn't discuss URL expiration/cleanup\n⚠️ Could elaborate on analytics tracking\n\n**Score**: 7.5/10\n\nWould you like a follow-up question on database partitioning?",
        "Here's a behavioral question for you:\n\n**Tell me about a time you had to make a difficult technical decision with limited information.**\n\nUse the STAR method:\n- **S**ituation: What was the context?\n- **T**ask: What was your objective?\n- **A**ction: What steps did you take?\n- **R**esult: What was the outcome?\n\nTake your time. I'll give you structured feedback on your response clarity, problem-solving approach, and leadership indicators.",
    ],
    "resume": [
        "I've analyzed your resume against the target role. Here's the summary:\n\n**ATS Score**: 78/100\n\n**Top 3 Recommendations**:\n1. **Quantify achievements**: Replace 'Improved performance' with 'Reduced API latency by 40%'\n2. **Add keywords**: Include 'CI/CD', 'Docker', 'Microservices' to match job descriptions\n3. **Restructure**: Move your Technical Skills section above Experience for better ATS parsing\n\nWant me to rewrite any specific section?",
        "Comparing your resume to 50+ job descriptions for {role}, here's what's missing:\n\n🔴 **Critical Gaps**: Kubernetes, System Design experience\n🟡 **Nice to Have**: GraphQL, gRPC, event-driven architecture\n🟢 **Well Covered**: React, Node.js, MongoDB, REST APIs\n\nI suggest adding a 'Key Projects' section that demonstrates system design skills. Would you like a template?"
    ],
    "debugging": [
        "I found the bug! Here's the analysis:\n\n**Root Cause**: The issue is an off-by-one error in your loop condition. You're iterating past the array bounds.\n\n```javascript\n// Bug:\nfor (let i = 0; i <= arr.length; i++) { ... }\n\n// Fix:\nfor (let i = 0; i < arr.length; i++) { ... }\n```\n\n**Why it happens**: Arrays are 0-indexed, so the last valid index is `arr.length - 1`. Using `<=` causes an access at `arr[arr.length]` which is `undefined`.\n\n**Prevention tip**: Use `.forEach()` or `for...of` when you don't need the index to avoid this class of bugs entirely.",
        "This is a classic closure issue in JavaScript. Let me explain:\n\n**Problem**: Your `var` declaration creates function-scoped variables, so all callbacks share the same `i`.\n\n```javascript\n// Bug:\nfor (var i = 0; i < 5; i++) {\n  setTimeout(() => console.log(i), 100); // Prints 5 five times\n}\n\n// Fix 1 - Use let:\nfor (let i = 0; i < 5; i++) {\n  setTimeout(() => console.log(i), 100); // Prints 0,1,2,3,4\n}\n\n// Fix 2 - IIFE:\nfor (var i = 0; i < 5; i++) {\n  ((j) => setTimeout(() => console.log(j), 100))(i);\n}\n```\n\nThis is a common interview question. Understanding the execution context and lexical scoping is key!"
    ],
    "career": [
        "Based on your profile and market trends, here are 3 high-impact focus areas:\n\n1. **System Design**: 80% of senior+ interviews focus here\n2. **Behavioral Storytelling**: Prepare 5 STAR stories covering conflict, failure, success, leadership, and technical decisions\n3. **Depth over Breadth**: Pick one area (backend/frontend/ML) and become exceptional\n\nYour current roadmap already covers #1 well. Want to work on your STAR stories?",
        "Here's a personalized career growth plan:\n\n**Short-term (1-3 months)**: Master the {role} interview loop\n- Complete all roadmap tasks\n- 3 mock interviews per week\n- 1 system design practice daily\n\n**Medium-term (3-6 months)**: Build portfolio depth\n- Contribute to open source\n- Write technical blog posts\n- Build a showcase project\n\n**Long-term (6-12 months)**: Establish expertise\n- Speak at meetups/conferences\n- Start a technical YouTube channel\n- Mentor junior developers\n\nWhat timeline interests you most?"
    ]
}

TOPICS = [
    "binary trees", "dynamic programming", "graph algorithms", "system design",
    "database indexing", "caching strategies", "RESTful APIs", "testing patterns",
    "concurrency", "networking fundamentals", "OOP principles", "SQL optimization"
]

def generate_roadmap(role: str, skills: list, experience_level: str, daily_hours: int):
    role_lower = role.lower()
    for key, value in SAMPLE_ROADMAPS.items():
        if key in role_lower or role_lower in key:
            roadmap = value
            break
    else:
        roadmap = SAMPLE_ROADMAPS["backend engineer"]

    roadmap_copy = json.loads(json.dumps(roadmap))
    topic = random.choice(TOPICS)
    roadmap_copy["milestones"][2]["description"] = f"Deep dive into {topic} algorithms and patterns."
    roadmap_copy["durationWeeks"] = max(4, min(24, daily_hours * 6))

    return roadmap_copy


def chat_response(messages: list, context_type: str):
    last_message = messages[-1]["content"].lower() if messages else "hello"
    context_type = context_type if context_type in CHAT_RESPONSES else "roadmap"

    responses = CHAT_RESPONSES[context_type]
    response = random.choice(responses)

    role = "Software Engineer"
    topic = random.choice(TOPICS)
    response = response.replace("{topic}", topic).replace("{role}", role)

    return response


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


def debug_code(code: str, language: str, error: str = None):
    responses = CHAT_RESPONSES["debugging"]
    response = random.choice(responses)

    fixed_code = code
    if "for (" in code and "<= arr.length" in code:
        fixed_code = code.replace("<= arr.length", "< arr.length")
    elif "var i = 0" in code:
        fixed_code = code.replace("var i = 0", "let i = 0")

    suggestions = [
        "Add input validation at function boundaries",
        "Consider edge cases: empty input, null values, large data sets",
        "Add logging for easier debugging in production",
        "Extract reusable logic into separate functions",
        "Write unit tests before implementing changes",
    ]

    return {
        "explanation": response,
        "fixedCode": fixed_code,
        "suggestions": random.sample(suggestions, 3)
    }


def generate_interview_questions(interview_type: str, difficulty: str, role: str):
    questions_db = {
        "technical": [
            {"question": "Explain the difference between REST and GraphQL. When would you choose one over the other?", "category": "API Design", "difficulty": "medium"},
            {"question": "How does JavaScript's event loop work? Explain microtasks vs macrotasks.", "category": "JavaScript", "difficulty": "medium"},
            {"question": "Design a rate limiter for a distributed system.", "category": "System Design", "difficulty": "hard"},
            {"question": "What is the difference between optimistic and pessimistic concurrency control?", "category": "Databases", "difficulty": "hard"},
            {"question": "Explain how garbage collection works in V8 engine.", "category": "JavaScript", "difficulty": "medium"},
            {"question": "How would you design a real-time collaborative editor like Google Docs?", "category": "System Design", "difficulty": "hard"},
            {"question": "What are React Server Components and how do they differ from client components?", "category": "React", "difficulty": "medium"},
            {"question": "Explain database indexing strategies: B-tree vs Hash vs GiST indexes.", "category": "Databases", "difficulty": "hard"},
            {"question": "How would you implement a WebSocket-based chat application at scale?", "category": "System Design", "difficulty": "hard"},
            {"question": "Describe the virtual DOM reconciliation process in React.", "category": "React", "difficulty": "medium"},
        ],
        "behavioral": [
            {"question": "Tell me about a time you had to make a difficult technical decision with limited information.", "category": "Decision Making", "difficulty": "medium"},
            {"question": "Describe a situation where you disagreed with a teammate. How did you resolve it?", "category": "Teamwork", "difficulty": "medium"},
            {"question": "Tell me about a project that failed. What did you learn from it?", "category": "Learning", "difficulty": "medium"},
            {"question": "Describe a time you went above and beyond for a project or team.", "category": "Leadership", "difficulty": "medium"},
            {"question": "How do you stay updated with the latest technology trends?", "category": "Growth", "difficulty": "easy"},
        ],
        "system-design": [
            {"question": "Design a URL shortening service like TinyURL.", "category": "System Design", "difficulty": "medium"},
            {"question": "Design Twitter's news feed.", "category": "System Design", "difficulty": "hard"},
            {"question": "Design a distributed key-value store.", "category": "System Design", "difficulty": "hard"},
            {"question": "Design an e-commerce checkout system.", "category": "System Design", "difficulty": "hard"},
            {"question": "Design a video streaming platform like YouTube.", "category": "System Design", "difficulty": "hard"},
        ]
    }

    questions = questions_db.get(interview_type, questions_db["technical"])
    difficulty_map = {"easy": 0, "medium": 1, "hard": 2}
    target_diff = difficulty_map.get(difficulty, 1)

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
            "Effective use of examples to illustrate points"
        ],
        "improvements": [
            "Work on providing more structured responses (STAR method)",
            "Practice whiteboard/system design handson",
            "Improve time management during long-form answers"
        ]
    }

    return {"questions": selected, "feedback": feedback}
