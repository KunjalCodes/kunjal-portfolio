import { Project } from '../types';

/**
 * Project content is sourced from the public repositories at github.com/KunjalCodes
 * (READMEs, dependency files and code) and the resume. Screenshots are real captures
 * from those repositories. Nothing here should claim more than the code shows.
 */
export const projects: Project[] = [
  {
    id: 'second-brain',
    slug: 'second-brain',
    title: 'AI Second Brain — Persistent memory for AI agents',
    subtitle:
      'A memory engine that lets an agent remember people, projects and decisions across conversations, and know when a fact stopped being true',
    category: 'Memory & Retrieval',
    categories: ['Memory & Retrieval', 'Agents & MCP'],
    status: 'In progress',
    timeframe: '2025 – present',
    shortDescription:
      'Facts live in a temporal knowledge graph in Neo4j, embeddings in PostgreSQL with pgvector, and an agent with seven memory tools retrieves across both and must cite what it used.',
    tags: ['Python', 'FastAPI', 'Neo4j', 'PostgreSQL', 'pgvector', 'Gemini', 'MCP', 'Next.js', 'Cytoscape.js'],
    featured: true,
    problemStatement:
      'Chat assistants forget everything between sessions, and plain vector RAG makes it worse when facts change: if you switched from EasyOCR to PaddleOCR in May, a similarity search happily returns both as if they were equally true. An agent needs memory that keeps history, knows what is current, and can show where each fact came from.',
    projectOverview:
      'Every fact is stored as a relationship in a Neo4j graph with its own validity window. When something changes, the old edge is closed rather than deleted, so the system can answer "what do I use now" and "what did I use in March" from the same data. Embeddings in pgvector add semantic search, and retrieval combines graph, vector and keyword results. The LLM only proposes new memories; a deterministic decision engine decides whether to store, merge or flag them. On top sits an agent with seven memory tools and a Next.js memory explorer.',
    architecture: {
      summary:
        'FastAPI backend with Neo4j as the canonical memory store and PostgreSQL + pgvector for embeddings, conversations and evaluation runs. A Next.js frontend explores the graph, and an MCP adapter exposes the memory API to other agents.',
      diagramDescription:
        'Conversation or document -> LLM proposes memories -> deterministic decision engine -> Neo4j temporal graph + pgvector embeddings -> hybrid retrieval (graph + vector + keyword) -> agent with memory tools -> cited answer',
      layers: [
        {
          name: 'Extraction',
          technologies: ['FastAPI', 'Pydantic', 'Gemini (google-genai)'],
          description:
            'The LLM proposes candidate entities and relationships from a conversation turn or document. A deterministic engine resolves entities, checks for duplicates and conflicts, and records provenance before anything is written.',
        },
        {
          name: 'Storage',
          technologies: ['Neo4j', 'PostgreSQL', 'pgvector', 'asyncpg', 'Alembic'],
          description:
            'Neo4j holds the memory graph with valid-from / valid-to windows on every edge. PostgreSQL stores embeddings, conversations, review decisions and evaluation runs. Neo4j stays the source of truth.',
        },
        {
          name: 'Retrieval',
          technologies: ['Vector search', 'Cypher multi-hop', 'Keyword search'],
          description:
            'Semantic, graph and keyword candidates are merged and ranked. Graph traversal is bounded (2 hops by default, 3 at most) with relevance decay, and temporal state is re-checked in Neo4j at query time.',
        },
        {
          name: 'Agent',
          technologies: ['Custom tool-calling loop', '7 memory tools'],
          description:
            'Six read tools and one write tool that is off by default. A final answer may only cite memory ids that a tool actually returned in that turn.',
        },
        {
          name: 'Interface',
          technologies: ['Next.js 16', 'React 19', 'TanStack Query', 'Cytoscape.js', 'MCP'],
          description:
            'A memory explorer for memories, entities, a time lens, provenance and the graph itself, plus an MCP server so other agents can use the memory API.',
        },
      ],
    },
    technicalImplementation: [
      {
        aspect: 'Facts expire instead of being overwritten',
        description:
          'Each "uses" relationship carries its own validity window. Changing a tool closes the old edge and opens a new one, so history stays queryable and "previously used" vs "currently uses" is derived at query time.',
        codeSnippet: `Drawing Extractor
       |
       +── uses ──> EasyOCR     valid: January → May   (superseded)
       |
       +── uses ──> PaddleOCR   valid: May → now       (active)`,
        language: 'text',
      },
      {
        aspect: 'The LLM proposes, the application decides',
        description:
          'Extraction output is treated as a suggestion. Duplicates and semantic near-matches are flagged for review, never auto-merged, and every change to the graph writes an audit record first.',
      },
      {
        aspect: 'Answers must cite what was retrieved',
        description:
          'The agent loop validates citations structurally: an answer that references a memory id no tool returned in that turn is rejected.',
      },
    ],
    engineeringChallenges: [
      {
        challenge: 'Graph retrieval got slow at 10,000 nodes',
        solution:
          'Benchmarked synthetic dense graphs at 100, 1,000 and 10,000 nodes. The bottleneck turned out to be a missing Neo4j index, not graph fan-out.',
        outcome: 'Mean hybrid search latency on the 10,000-node graph dropped from 39.5 s to 0.58 s, about 68× faster. Every memory lookup had been scanning all 219,782 relationships.',
      },
      {
        challenge: 'Concurrent facts looked like conflicts',
        solution:
          'Added multi-valued predicates so "uses Python" and "uses TypeScript" can both be true, plus stated-time parsing and exact-duplicate corroboration.',
        outcome: 'The memory-quality evaluation went from 21/49 to 49/49 passing cases.',
      },
      {
        challenge: 'Structured output from the real model',
        solution:
          'Ran the agent against Gemini end to end instead of only scripted mocks, which surfaced three structured-output compatibility bugs that were then fixed.',
      },
    ],
    demonstrations: [],
    actualResults: [
      'Hybrid search on a 10,000-node graph went from 39.5 s to 0.58 s mean latency after adding one missing index',
      'Agent driven by Gemini reached 88.9% mean recall and 100% mean precision across 9 evaluation tasks',
      'Memory-quality evaluation improved from 21/49 to 49/49',
      'Tests run with fake LLM and embedding clients, so the suite needs no API key and costs nothing',
    ],
    limitations: [
      'Staging deployment is prepared but not deployed yet, and the system is not production-ready',
      'The agent evaluation set is small (9 tasks)',
      'Document ingestion covers TXT, Markdown and PDFs with a text layer only',
    ],
    futureImprovements: [
      'Deploy the staging environment',
      'A learned reranker for hybrid retrieval',
      'More document types (DOCX, URLs)',
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Ingest',
        input: 'Chat turn or document',
        output: 'Text with source ids',
        detail: 'Conversations and TXT / Markdown / PDF documents are chunked deterministically and tagged with provenance.',
      },
      {
        stepNumber: 2,
        title: 'Propose',
        input: 'Text',
        output: 'Candidate entities and relations',
        detail: 'Gemini returns structured candidates. Nothing is written yet.',
      },
      {
        stepNumber: 3,
        title: 'Decide',
        input: 'Candidates',
        output: 'Stored, merged or flagged memories',
        detail: 'A deterministic engine resolves entities, detects duplicates and conflicts, and opens or closes validity windows.',
      },
      {
        stepNumber: 4,
        title: 'Retrieve',
        input: 'Question',
        output: 'Ranked memories with paths',
        detail: 'Vector, graph and keyword results are merged; graph paths are real traversals, never generated.',
      },
      {
        stepNumber: 5,
        title: 'Answer',
        input: 'Tool results',
        output: 'Answer with citations',
        detail: 'The agent answers only from tool results and cites the memory ids it used.',
      },
    ],
    githubUrl: 'https://github.com/KunjalCodes/second-brain',
    metrics: [
      { label: 'Search at 10k nodes', value: '39.5s → 0.58s' },
      { label: 'Agent recall / precision', value: '88.9% / 100%' },
      { label: 'Memory tools', value: '6 read, 1 gated write' },
    ],
  },

  {
    id: 'furniture-drawing-extractor',
    slug: 'furniture-drawing-extractor',
    title: 'Drawing to Cut List — AI for furniture manufacturing',
    subtitle:
      'Upload a furniture drawing and get a cut list: OCR, computer vision and an LLM read the dimensions and parts, and the cut list goes on to the cutting optimizer',
    category: 'Applied AI',
    categories: ['Applied AI'],
    status: 'In progress',
    timeframe: 'Sep 2026 – present',
    organization: 'Igniters Hub',
    shortDescription:
      'Company project at Igniters Hub. Turns engineering drawings into structured parts and dimensions, generates the cut list and hands it to the optimizer, replacing manual takeoff.',
    tags: ['Python', 'OCR', 'Computer vision', 'OpenCV', 'LLMs', 'FastAPI', 'React', 'TypeScript'],
    featured: true,
    problemStatement:
      'Before a piece of furniture can be cut, someone reads its engineering drawing and types every panel, dimension and quantity into a cut list by hand. It is slow, and a single misread number means wasted material or a part that does not fit.',
    projectOverview:
      'I am building this at Igniters Hub. A user uploads a furniture drawing; the system reads the dimensions and annotations with OCR, uses computer vision to understand the layout, and uses an LLM to work out which dimensions belong to which component. From that it generates a cut list, which is sent to the optimizer that plans how the parts are cut from sheets.',
    architecture: {
      summary:
        'An upload-to-optimizer pipeline: drawing in, structured components and dimensions out, cut list generated and passed downstream. Shown at a high level because the code and drawings belong to the company.',
      diagramDescription:
        'Upload drawing -> OCR reads dimensions and labels -> computer vision reads the layout -> LLM maps dimensions to components -> cut list -> optimizer',
      layers: [
        {
          name: 'Upload and preprocessing',
          technologies: ['Python', 'OpenCV'],
          description: 'Takes the uploaded drawing and prepares it for reading.',
        },
        {
          name: 'Reading the drawing',
          technologies: ['OCR', 'Computer vision'],
          description: 'Extracts dimension values, part labels and annotations, and where they sit on the drawing.',
        },
        {
          name: 'Understanding the parts',
          technologies: ['LLMs', 'Structured output'],
          description: 'Associates each dimension with the component it describes and produces structured component data.',
        },
        {
          name: 'Cut list and handoff',
          technologies: ['FastAPI', 'React', 'TypeScript'],
          description: 'Generates the cut list from the extracted dimensions and sends it to the optimizer.',
        },
      ],
    },
    technicalImplementation: [
      {
        aspect: 'Why OCR alone is not enough',
        description:
          'OCR gives you numbers, not meaning. A drawing has dozens of dimensions, and the hard part is knowing that a given number is the depth of a drawer side and not the width of the top. That is where layout from computer vision and reasoning from the LLM come in.',
      },
      {
        aspect: 'Structured output end to end',
        description:
          'Each stage produces structured data rather than free text, so the cut list can be generated deterministically and checked before it reaches the optimizer.',
      },
    ],
    engineeringChallenges: [
      {
        challenge: 'Matching dimensions to the right part',
        solution: 'Combine the position of each value on the drawing with LLM reasoning about the furniture’s components, instead of relying on the text alone.',
      },
      {
        challenge: 'A wrong number is expensive',
        solution: 'Keep the output structured and reviewable so mistakes are caught before cutting, not after.',
      },
    ],
    demonstrations: [],
    actualResults: [
      'Drawing upload through to a generated cut list',
      'Cut list handed off to the optimizer for downstream manufacturing',
    ],
    limitations: [
      'Company project: the code and client drawings are confidential, so only the approach is described here',
      'Under active development',
    ],
    dataFlowSteps: [
      { stepNumber: 1, title: 'Upload', input: 'Furniture drawing', output: 'Prepared image', detail: 'The drawing is uploaded and preprocessed.' },
      { stepNumber: 2, title: 'Read', input: 'Drawing', output: 'Dimensions and labels', detail: 'OCR and computer vision extract values and where they are.' },
      { stepNumber: 3, title: 'Interpret', input: 'Dimensions and layout', output: 'Components with sizes', detail: 'The LLM maps each dimension to its part.' },
      { stepNumber: 4, title: 'Cut list', input: 'Components', output: 'Cut list', detail: 'Parts, sizes and quantities, generated from the extracted data.' },
      { stepNumber: 5, title: 'Optimize', input: 'Cut list', output: 'Cutting plan', detail: 'Sent to the optimizer that plans the cuts.' },
    ],
    metrics: [
      { label: 'Input', value: 'Furniture drawing' },
      { label: 'Output', value: 'Cut list for the optimizer' },
      { label: 'Built at', value: 'Igniters Hub' },
    ],
  },

  {
    id: 'food-lens',
    slug: 'food-lens',
    title: 'FoodLens — From a recipe video to a grocery cart',
    subtitle:
      'A Chrome extension that reads a YouTube recipe transcript, extracts the ingredients and adds matching products to a Swiggy Instamart cart',
    category: 'Agents & MCP',
    categories: ['Agents & MCP', 'Applied AI'],
    status: 'Prototype',
    timeframe: 'Mar 2026',
    shortDescription:
      'Groq’s Llama 3.3 70B turns a transcript into an ingredient list, and Swiggy’s MCP server handles product search and the cart.',
    tags: ['JavaScript', 'Chrome Extension (MV3)', 'Next.js 15', 'Groq', 'Llama 3.3 70B', 'MCP', 'mcp-remote'],
    featured: true,
    problemStatement:
      'Cooking from a video means pausing, writing down every ingredient and then searching for each one in a grocery app. The information is already in the video; the work in between is pure friction.',
    projectOverview:
      'A content script adds a FoodLens button to YouTube watch pages. It sends the transcript to a small Next.js API, which asks Groq (llama-3.3-70b-versatile) for a structured ingredient list. The same server talks to Swiggy Instamart through its MCP server, via mcp-remote for the OAuth login, to find products and add them to the cart.',
    architecture: {
      summary:
        'Manifest V3 extension for the UI, a Next.js API server for the AI and MCP calls, and Swiggy’s MCP server for product search and cart actions.',
      diagramDescription:
        'YouTube page -> Chrome extension -> Next.js API -> Groq (ingredient extraction) + mcp-remote -> Swiggy MCP (search, cart)',
      layers: [
        {
          name: 'Extension',
          technologies: ['Manifest V3', 'Content script', 'Service worker', 'Popup'],
          description:
            'Injects the FoodLens button on YouTube watch pages, reads the transcript and shows the extracted ingredients and matched products.',
        },
        {
          name: 'API server',
          technologies: ['Next.js 15', 'Route handlers'],
          description:
            'Keeps the Groq key off the client, extracts ingredients from up to 4,000 characters of transcript and proxies the MCP calls.',
        },
        {
          name: 'Model',
          technologies: ['Groq', 'llama-3.3-70b-versatile'],
          description: 'Turns a free-form transcript into ingredients with quantities.',
        },
        {
          name: 'Commerce',
          technologies: ['Swiggy Instamart MCP', 'mcp-remote'],
          description: 'Product search and cart mutation through the MCP protocol, with mcp-remote handling the one-time OAuth login.',
        },
      ],
    },
    technicalImplementation: [
      {
        aspect: 'MCP instead of scraping',
        description:
          'Product search and cart updates go through Swiggy’s MCP server, so the extension calls documented tools instead of automating the Swiggy website.',
      },
      {
        aspect: 'One click across three systems',
        description:
          'The extension, the Next.js server and the MCP server each do one job; the user only sees extract, find and add.',
      },
    ],
    engineeringChallenges: [
      {
        challenge: 'Authentication with a third-party MCP server',
        solution: 'Used mcp-remote as an OAuth and protocol bridge, so the login happens once in the browser and the server reuses the session.',
      },
      {
        challenge: 'Long, messy transcripts',
        solution: 'Trimmed the transcript to the first 4,000 characters and asked the model for a strict ingredient format, which keeps latency and cost predictable.',
      },
    ],
    demonstrations: [
      {
        title: 'Extension popup',
        caption: 'Shows whether Groq and the Swiggy MCP connection are ready, and how to use it on a recipe video',
        image: '/assets/projects/food-lens/popup.jpg',
        narrow: true,
      },
    ],
    actualResults: [
      'Recipe video to filled cart in one flow: extract, find on Swiggy, add to cart',
      'Ingredient extraction runs on Groq’s Llama 3.3 70B',
      'Cart actions go through Swiggy’s official MCP server',
    ],
    limitations: [
      'Needs the local Next.js server running and a one-time Swiggy login through mcp-remote',
      'Only supports Swiggy Instamart',
      'Depends on the video having a transcript or a description with the recipe',
    ],
    futureImprovements: ['Let users review and swap products before adding them', 'Support more grocery providers'],
    dataFlowSteps: [
      { stepNumber: 1, title: 'Capture', input: 'YouTube watch page', output: 'Transcript', detail: 'The content script reads the transcript of the open video.' },
      { stepNumber: 2, title: 'Extract', input: 'Transcript', output: 'Ingredient list', detail: 'Groq’s Llama 3.3 70B returns ingredients with quantities.' },
      { stepNumber: 3, title: 'Match', input: 'Ingredients', output: 'Products', detail: 'Swiggy MCP searches Instamart for each ingredient.' },
      { stepNumber: 4, title: 'Add to cart', input: 'Chosen products', output: 'Updated cart', detail: 'Cart mutation through the same MCP connection.' },
    ],
    githubUrl: 'https://github.com/KunjalCodes/FoodLens',
    metrics: [
      { label: 'Model', value: 'Llama 3.3 70B on Groq' },
      { label: 'Commerce', value: 'Swiggy Instamart MCP' },
      { label: 'Surface', value: 'Chrome, Manifest V3' },
    ],
  },

  {
    id: 'mcp-ai-copilot',
    slug: 'mcp-ai-copilot',
    title: 'AI Research Copilot — A local agent that uses tools over MCP',
    subtitle:
      'A command-line copilot on Llama 3 via Ollama that decides when to call Wikipedia, weather, a calculator or its own notes through an MCP server',
    category: 'Agents & MCP',
    categories: ['Agents & MCP'],
    status: 'Complete',
    timeframe: 'Feb 2026',
    shortDescription:
      'Six tools on a FastMCP server, a local Llama 3 model and a small loop that lets the model chain up to three tool calls before answering.',
    tags: ['Python', 'MCP', 'FastMCP', 'Ollama', 'Llama 3', 'Wikipedia API', 'Open-Meteo'],
    featured: true,
    problemStatement:
      'I wanted to understand tool use from the bottom up: how a model discovers tools, how it asks for one, and how results flow back, all running locally without sending data to a hosted API.',
    projectOverview:
      'server.py is a FastMCP server with six tools. copilot.py starts it over stdio, lists the tools, and puts them in the system prompt. The model replies with JSON when it wants a tool; the client calls it through the MCP session and feeds the result back. Anything that is not valid JSON is treated as the final answer.',
    architecture: {
      summary: 'An MCP server exposing tools over stdio, and a client that runs a tool-calling loop against a local Llama 3 model.',
      diagramDescription: 'User question -> Llama 3 (Ollama) -> JSON tool request -> MCP client session -> FastMCP server tool -> result -> Llama 3 -> answer',
      layers: [
        {
          name: 'MCP server',
          technologies: ['FastMCP', 'requests'],
          description: 'hello, calculate, wiki_search, get_weather, save_note and get_notes. Notes persist in notes.json.',
        },
        {
          name: 'Client loop',
          technologies: ['mcp ClientSession', 'stdio transport', 'asyncio'],
          description: 'Lists tools, sends them to the model, executes requested tools and appends the results to the conversation, up to three rounds.',
        },
        {
          name: 'Model',
          technologies: ['Ollama', 'Llama 3'],
          description: 'Runs locally, so questions and notes never leave the machine.',
        },
      ],
    },
    technicalImplementation: [
      {
        aspect: 'A tool is just a typed function',
        description: 'Weather geocodes the city with Open-Meteo, then fetches current conditions. FastMCP turns the signature and docstring into the tool schema.',
        codeSnippet: `@mcp.tool()
def get_weather(location: str) -> str:
    """Get current weather using location name"""
    geo_res = requests.get(
        "https://geocoding-api.open-meteo.com/v1/search"
        f"?name={location}&count=1").json()
    lat = geo_res["results"][0]["latitude"]
    lon = geo_res["results"][0]["longitude"]
    ...
    return f"{location}: {temp}°C, Wind {wind} km/h"`,
        language: 'python',
      },
      {
        aspect: 'The tool-calling loop',
        description: 'If the reply parses as JSON, it is a tool call; otherwise it is the answer.',
        codeSnippet: `for _ in range(3):
    response = ollama.chat(model="llama3", messages=messages)
    msg = response["message"]["content"]
    try:
        data = json.loads(msg)
        result = await session.call_tool(data["tool"], arguments=data["arguments"])
        messages.append({"role": "assistant", "content": msg})
        messages.append({"role": "tool", "content": str(result.content)})
    except:
        final_answer = msg
        break`,
        language: 'python',
      },
    ],
    engineeringChallenges: [
      {
        challenge: 'Getting a small local model to call tools reliably',
        solution: 'Asked for a strict JSON shape in the system prompt and treated anything else as a final answer, which keeps the loop simple and predictable.',
      },
      {
        challenge: 'Runaway tool loops',
        solution: 'Capped the loop at three tool rounds per question.',
      },
    ],
    demonstrations: [
      {
        title: 'Tool calls in a session',
        caption: 'Weather lookup, a calculation and saving and reading notes, each routed through the MCP server',
        image: '/assets/projects/mcp-ai-copilot/tool-calls.jpg',
      },
      {
        title: 'MCP Inspector',
        caption: 'The six tools the server exposes, inspected over stdio',
        image: '/assets/projects/mcp-ai-copilot/mcp-inspector.jpg',
      },
    ],
    actualResults: [
      'Six working tools discoverable by any MCP client, verified in MCP Inspector',
      'Multi-step answers that combine tools, fully local on Llama 3',
      'Notes persist between sessions',
    ],
    limitations: [
      'Command-line only',
      'JSON-in-text tool calling is less robust than native function calling',
      'Notes are a flat JSON file, with no search',
    ],
    dataFlowSteps: [
      { stepNumber: 1, title: 'Discover', input: 'MCP session', output: 'Tool list', detail: 'The client lists tools from the server and adds them to the system prompt.' },
      { stepNumber: 2, title: 'Decide', input: 'Question', output: 'JSON tool request or answer', detail: 'Llama 3 either asks for a tool or answers.' },
      { stepNumber: 3, title: 'Call', input: 'Tool request', output: 'Tool result', detail: 'The client calls the tool through the MCP session.' },
      { stepNumber: 4, title: 'Answer', input: 'Tool results', output: 'Final answer', detail: 'Results go back to the model, for up to three rounds.' },
    ],
    githubUrl: 'https://github.com/KunjalCodes/mcp-ai-copilot',
    metrics: [
      { label: 'Tools', value: '6 over MCP' },
      { label: 'Model', value: 'Llama 3, local' },
      { label: 'Max tool rounds', value: '3 per question' },
    ],
  },

  {
    id: 'multi-agent-builder',
    slug: 'multi-agent-builder',
    title: 'Multi-Agent Builder — From an idea to a running app',
    subtitle:
      'Five LLM agents turn a one-line idea into a frontend or FastAPI project, write it to disk and start it',
    category: 'Agents & MCP',
    categories: ['Agents & MCP', 'Applied AI'],
    status: 'Complete',
    timeframe: 'Feb 2026',
    shortDescription:
      'A classifier, planner, architect, coder and enhancer run in sequence on Groq, then a runner serves the generated project and opens the browser.',
    tags: ['Python', 'Groq', 'Llama 3.1 8B', 'FastAPI', 'uvicorn', 'uv'],
    featured: false,
    problemStatement:
      'Single-prompt code generation mixes planning, structure and implementation in one shot and tends to fall apart beyond toy examples. Splitting the job into roles makes each step smaller and easier to check.',
    projectOverview:
      'main.py runs a fixed pipeline. A type classifier decides between a frontend and a FastAPI backend, the planner writes a plan, the architect turns it into a file structure, the coder writes the files and the enhancer improves the result. A file manager writes everything under generated_projects/, and a project runner starts a static server or uvicorn and opens the browser.',
    architecture: {
      summary: 'A sequential pipeline of role-specific agents sharing one Groq client, followed by deterministic file writing and execution.',
      diagramDescription: 'Idea -> TypeClassifier -> Planner -> Architect -> Coder -> Enhancer -> FileManager -> ProjectRunner -> browser',
      layers: [
        {
          name: 'Agents',
          technologies: ['TypeClassifier', 'Planner', 'Architect', 'Coder', 'Enhancer'],
          description: 'Each agent has its own system prompt and passes plain text to the next one.',
        },
        {
          name: 'Model',
          technologies: ['Groq', 'llama-3.1-8b-instant', 'temperature 0.2'],
          description: 'A fast, low-temperature model keeps runs quick and outputs consistent.',
        },
        {
          name: 'Runtime',
          technologies: ['FileManager', 'ProjectRunner', 'uvicorn'],
          description: 'Parses files out of the response, writes them to disk, then serves a frontend or starts a FastAPI app.',
        },
      ],
    },
    technicalImplementation: [
      {
        aspect: 'The pipeline',
        description: 'Each stage gets the previous stage’s output plus the detected project type.',
        codeSnippet: `plan = PlannerAgent().run(f"PROJECT_TYPE: {project_type}\\n\\nUSER IDEA:\\n{user_input}")
architecture = ArchitectAgent().run(f"PROJECT_TYPE: {project_type}\\n\\nPLAN:\\n{plan}")
base_code = CoderAgent().run(f"PROJECT_TYPE: {project_type}\\n\\nARCHITECTURE:\\n{architecture}")
code_output = EnhancerAgent().run(base_code)`,
        language: 'python',
      },
    ],
    engineeringChallenges: [
      {
        challenge: 'Getting files out of model output',
        solution: 'The coder writes files in a fixed delimited format that the file manager parses, so a run produces a real project folder instead of a chat reply.',
      },
      {
        challenge: 'Choosing how to run the result',
        solution: 'A classifier step decides between frontend and FastAPI up front, so every later agent and the runner know what they are building.',
      },
    ],
    demonstrations: [
      {
        title: 'One run, start to finish',
        caption: 'From the prompt through classification, planning, architecture, code and enhancement to writing files and starting the server',
        image: '/assets/projects/multi-agent-builder/agent-run.jpg',
      },
      {
        title: 'The generated app',
        caption: 'The calculator produced by that run, served locally and opened automatically',
        image: '/assets/projects/multi-agent-builder/generated-app.jpg',
      },
    ],
    actualResults: [
      'Produces a runnable frontend or FastAPI project from a single sentence',
      'Writes files to disk and launches the result automatically',
    ],
    limitations: [
      'Agents run strictly in sequence, with no review or retry loop between them',
      'Generated projects are small; layout and correctness are not checked automatically',
      'An 8B model trades quality for speed',
    ],
    futureImprovements: ['A reviewer agent that runs the project and feeds errors back to the coder', 'Support larger, multi-page projects'],
    dataFlowSteps: [
      { stepNumber: 1, title: 'Classify', input: 'Idea', output: 'frontend or backend', detail: 'Decides what kind of project to build.' },
      { stepNumber: 2, title: 'Plan', input: 'Idea + type', output: 'Plan', detail: 'Features and steps.' },
      { stepNumber: 3, title: 'Design', input: 'Plan', output: 'File structure', detail: 'The architect lays out the files.' },
      { stepNumber: 4, title: 'Build', input: 'Structure', output: 'Code', detail: 'Coder writes it, enhancer improves it.' },
      { stepNumber: 5, title: 'Run', input: 'Files', output: 'Running app', detail: 'Written to disk, served and opened in the browser.' },
    ],
    githubUrl: 'https://github.com/KunjalCodes/multi-agent-builder',
    metrics: [
      { label: 'Agents', value: '5 in sequence' },
      { label: 'Model', value: 'Llama 3.1 8B on Groq' },
      { label: 'Output', value: 'Frontend or FastAPI app' },
    ],
  },

  {
    id: 'rag-ml-textbook-chatbot',
    slug: 'rag-ml-textbook-chatbot',
    title: 'ML Textbook Chatbot — RAG over one book',
    subtitle: 'A local chatbot that answers machine learning questions only from a textbook, and says it doesn’t know otherwise',
    category: 'Memory & Retrieval',
    categories: ['Memory & Retrieval', 'Applied AI'],
    status: 'Complete',
    timeframe: 'Jan 2026',
    shortDescription:
      'The book is chunked, embedded with all-MiniLM-L6-v2 into ChromaDB, and the top three passages ground Llama 3’s answer.',
    tags: ['Python', 'LangChain', 'ChromaDB', 'Sentence Transformers', 'Ollama', 'Llama 3'],
    featured: false,
    problemStatement:
      'Ask a general model a textbook question and it will answer confidently whether or not it is right. For studying, an answer that sticks to the book, or admits it can’t, is more useful.',
    projectOverview:
      'A one-time pipeline extracts the PDF’s text, splits it into 500-character chunks with 50 characters of overlap, embeds them with all-MiniLM-L6-v2 and stores them in ChromaDB. At question time the three closest chunks become the only context Llama 3 is allowed to use.',
    architecture: {
      summary: 'Offline indexing into a persistent Chroma store, and an online loop that retrieves three chunks and prompts a local model.',
      diagramDescription: 'PDF -> text -> 500-char chunks -> embeddings -> ChromaDB; question -> embedding -> top 3 chunks -> Llama 3 -> answer',
      layers: [
        { name: 'Indexing', technologies: ['pypdf', 'Sentence Transformers', 'ChromaDB'], description: 'load_pdf, chunk_text, create_embeddings and build_vectorstore run once.' },
        { name: 'Retrieval', technologies: ['LangChain', 'Chroma retriever'], description: 'k = 3 nearest chunks by embedding similarity.' },
        { name: 'Generation', technologies: ['Ollama', 'Llama 3'], description: 'Prompted to answer only from the context, or say "I don’t know".' },
      ],
    },
    technicalImplementation: [
      {
        aspect: 'Chunking with overlap',
        description: 'Overlap keeps sentences that cross a boundary retrievable from either side.',
        codeSnippet: `def chunk_text(text, chunk_size=500, overlap=50):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks`,
        language: 'python',
      },
    ],
    engineeringChallenges: [
      {
        challenge: 'Keeping answers on the book',
        solution: 'The prompt allows only the retrieved context and gives the model an explicit way out: "I don’t know".',
      },
    ],
    demonstrations: [
      {
        title: 'A grounded answer',
        caption: 'Asking about overfitting returns an answer drawn from the textbook passage',
        image: '/assets/projects/rag-ml-textbook-chatbot/chat-session.jpg',
      },
    ],
    actualResults: ['Answers grounded in the textbook, fully local', 'Admits when the book does not cover a question'],
    limitations: ['Fixed-size character chunks can split formulas and tables', 'No source page numbers in answers yet', 'Command-line only'],
    githubUrl: 'https://github.com/KunjalCodes/rag-ml-textbook-chatbot',
    metrics: [
      { label: 'Chunks', value: '500 chars, 50 overlap' },
      { label: 'Embeddings', value: 'all-MiniLM-L6-v2' },
      { label: 'Retrieval', value: 'Top 3 from ChromaDB' },
    ],
  },
];
