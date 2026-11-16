import { Project } from '../types';

export const projects: Project[] = [
  {
    id: 'second-brain',
    slug: 'second-brain',
    title: 'AI Second Brain — Persistent AI Memory Engine',
    subtitle: 'Deployable persistent graph & vector memory engine for AI agents with temporal reasoning, provenance tracking, and 7+ controlled tools',
    category: 'AI / Machine Learning',
    status: 'Active Development',
    timeframe: 'Ongoing (2025 — Present)',
    shortDescription: 'A production-grade persistent memory engine that allows AI agents to maintain contextual long-term knowledge across conversations and documents. Combines Neo4j temporal knowledge graphs, PostgreSQL with pgvector, and a 7-tool agent runtime.',
    tags: ['Python', 'Neo4j', 'PostgreSQL', 'pgvector', 'FastAPI', 'Next.js 16', 'RAG', 'LLMs', 'Cytoscape.js'],
    featured: true,
    problemStatement: 'Modern LLM agents suffer from episodic amnesia: conversation history is either truncated to fit context windows or coarsely retrieved as isolated vector chunks. When facts evolve over time (e.g. switching software frameworks, updated architectural decisions), standard RAG mixes outdated facts with active ones and fails at multi-hop associative queries.',
    projectOverview: 'AI Second Brain introduces a dual-engine architecture: an evolving temporal knowledge graph in Neo4j coupled with dense vector retrieval in PostgreSQL (pgvector). Facts maintain explicit valid-time windows (edges are superseded, never deleted) with full provenance tracking back to source documents or conversational turns. An autonomous agent interacts via 7+ governed memory tools to execute multi-hop reasoning.',
    architecture: {
      summary: 'A decoupled client-server architecture with FastAPI powering authoritative ingestion, hybrid vector + graph retrieval, and a Next.js 16 Cytoscape.js explorer.',
      diagramDescription: 'User Ingestion (Chat / Document) -> FastAPI Ingestion -> Entity Resolution & Temporal Validity -> Dual Storage: [PostgreSQL pgvector (Semantic) + Neo4j (Knowledge Graph)] -> Hybrid Retrieval Engine (Vector Search + Cypher Multi-Hop + Keyword) -> Reciprocal Rank Fusion -> Controlled Tool-Using Agent',
      layers: [
        {
          name: '1. Ingestion & Entity Resolution',
          technologies: ['FastAPI', 'Pydantic v2', 'Sentence Transformers'],
          description: 'Extracts entities, relationships, and temporal anchors. Performs canonical entity deduplication and assigns provenance identifiers before database commit.'
        },
        {
          name: '2. Dual Persistent Storage',
          technologies: ['PostgreSQL (pgvector)', 'Neo4j Enterprise / Community'],
          description: 'Vector store indexes semantic text embeddings (HNSW index); Neo4j manages directed property graphs with valid-from and valid-to temporal relationship windows.'
        },
        {
          name: '3. Hybrid Retrieval Engine',
          technologies: ['Cypher Queries', 'Cosine Similarity', 'RRF (Reciprocal Rank Fusion)'],
          description: 'Executes parallel dense semantic search and multi-hop graph traversals. Merges and re-ranks candidate memories based on semantic relevance, graph proximity, and temporal freshness.'
        },
        {
          name: '4. Controlled Agent Memory Tools',
          technologies: ['Python AsyncIO', 'LiteLLM / Ollama', '7+ Core Memory Tools'],
          description: 'Exposes governed tools: search_memory(), get_entity(), traverse_graph(), get_memory_history(), search_documents(), get_source(), and save_memory() with strict schema verification.'
        },
        {
          name: '5. Visual Memory Explorer',
          technologies: ['Next.js 16 (App Router)', 'TypeScript', 'Cytoscape.js', 'Tailwind CSS'],
          description: 'Interactive visualization allowing humans to inspect node clusters, trace source citations, view timeline diffs, and inspect entity lifecycles.'
        }
      ]
    },
    technicalImplementation: [
      {
        aspect: 'Temporal Edge Representation & Historical Validity',
        description: 'Relationships are never overwritten or deleted. When an engineering decision updates (e.g. switching from EasyOCR to PaddleOCR), the existing relationship receives a valid_to timestamp, and a new relationship is created, preserving full audit history.',
        language: 'cypher',
        codeSnippet: `// Superseding a fact while preserving temporal provenance
MATCH (p:Entity {id: 'drawing-extractor'})-[r:USES {status: 'active'}]->(t:Entity {name: 'EasyOCR'})
SET r.valid_to = datetime('2026-05-01T00:00:00Z'),
    r.status = 'superseded'
WITH p
MERGE (t2:Entity {name: 'PaddleOCR'})
CREATE (p)-[:USES {
    valid_from: datetime('2026-05-01T00:00:00Z'),
    valid_to: null,
    status: 'active',
    source_id: 'doc-session-9842',
    memory_id: 'mem-88192'
}]->(t2)`
      },
      {
        aspect: 'Governed Memory Tool Dispatcher',
        description: 'Agent tools enforce strict input validation, prevent unbounded traversals, and return structured provenance citations for every retrieved fact.',
        language: 'python',
        codeSnippet: `async def traverse_graph(
    entity_id: str, 
    max_depth: int = 2, 
    as_of: Optional[datetime] = None
) -> GraphTraversalResult:
    """Traverse temporal relationships up to max_depth."""
    query = """
    MATCH path = (start:Entity {id: $entity_id})-[r:RELATES_TO*1..2]-(target:Entity)
    WHERE ($as_of IS NULL OR (r.valid_from <= $as_of AND (r.valid_to IS NULL OR r.valid_to > $as_of)))
    RETURN path, relationships(path) as rels
    LIMIT 50
    """
    async with neo4j_driver.session() as session:
        result = await session.run(query, entity_id=entity_id, as_of=as_of)
        return format_traversal_result(await result.data())`
      }
    ],
    engineeringChallenges: [
      {
        challenge: 'Graph Traversal Latency Bottleneck on 10,000-Node Dense Benchmark',
        solution: 'During dense multi-hop benchmarking with ~1% high-degree hub entities, traversal latency scaled up to ~39.5s. Profiling identified a missing index on the relational bridge property RELATES_TO.memory_id. Implementing targeted composite property indexes reduced latency to ~0.58s.',
        outcome: 'Graph retrieval latency dropped from ~39.5s to 0.58s (a 68x measured improvement on a 10,000-node synthetic benchmark).'
      },
      {
        challenge: 'Preventing LLM Hallucinations during Memory Ingestion',
        solution: 'Designed an entity resolution pipeline requiring dual verification: schema-constrained extraction validates candidate entity attributes before invoking Cypher graph mutations, with an explicit human-in-the-loop review queue for ambiguous merges.',
        outcome: '100% syntactically valid graph mutations with verifiable source provenance.'
      }
    ],
    demonstrations: [
      {
        title: 'Temporal Graph Exploration Viewport',
        caption: 'Cytoscape.js interactive graph showing active vs superseded entity relationships over time.',
        type: 'ui',
        placeholderText: '[Interactive Graph Viewport: Nodes represent projects, tools, and entities; edges display temporal validity intervals]'
      },
      {
        title: 'Multi-Hop Retrieval & Source Citation Trace',
        caption: 'Console trace demonstrating multi-hop tool traversal resolving cross-document dependencies.',
        type: 'pipeline',
        placeholderText: '[Agent Execution Trace: search_memory() -> traverse_graph() -> get_source() -> grounded answer]'
      }
    ],
    actualResults: [
      'Documented benchmark: Dense graph multi-hop traversal optimized from ~39.5s down to ~0.58s on a 10,000-node benchmark.',
      'Implemented 7+ functional memory tools supporting multi-hop reasoning, contextual recall, and source provenance.',
      'Dual persistence operational with PostgreSQL pgvector (HNSW) and Neo4j temporal graph schemas.'
    ],
    limitations: [
      'Benchmark results were measured on synthetic dense graphs with 1% hub distribution; real-world production performance varies based on hardware and memory cache sizes.',
      'Automatic semantic merging of ambiguous entity aliases currently requires manual confirmation in ambiguous cases.'
    ],
    futureImprovements: [
      'Deploy an automated cross-encoder learned re-ranker model to fuse graph distance and cosine similarity scores.',
      'Implement streaming Cypher edge mutations directly from background asynchronous workers.',
      'Support decentralized graph partition sharding for enterprise deployments beyond 500,000 entities.'
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Input Ingestion & Tokenization',
        input: 'User Prompt / Uploaded Technical Document',
        output: 'Clean Text Chunks + Metadata Context',
        detail: 'Parses incoming content, chunks text with overlapping token windows, and extracts candidate entities.'
      },
      {
        stepNumber: 2,
        title: 'Entity & Relation Extraction',
        input: 'Text Chunks',
        output: 'Structured Entity Triples [Subject, Predicate, Object, Timestamp]',
        detail: 'Constrained structured LLM extraction identifies entities and temporal validity intervals.'
      },
      {
        stepNumber: 3,
        title: 'Dual Database Ingestion',
        input: 'Entity Triples + Text Embeddings',
        output: 'PostgreSQL pgvector Embeddings + Neo4j Temporal Edges',
        detail: 'Commits dense vector representations to pgvector and links graph nodes in Neo4j with valid_from/valid_to bounds.'
      },
      {
        stepNumber: 4,
        title: 'Hybrid Multi-Channel Retrieval',
        input: 'Agent Query or Tool Invocation',
        output: 'Fused Candidate Memory Graph Slice',
        detail: 'Runs vector similarity and multi-hop Cypher traversal in parallel; merges results via Reciprocal Rank Fusion (RRF).'
      },
      {
        stepNumber: 5,
        title: 'Agent Reasoning & Citation Output',
        input: 'Ranked Memory Slice + Provenance Targets',
        output: 'Grounded Answer with Verified Source IDs',
        detail: 'Agent uses memory tools to form answers where every assertion points directly to a verified memory ID.'
      }
    ],
    githubUrl: 'https://github.com/KunjalCodes/second-brain',
    demoUrl: undefined,
    metrics: [
      { label: 'Graph Optimization', value: '39.5s → 0.58s (10k nodes)' },
      { label: 'Controlled Tools', value: '7+ Memory Tools' },
      { label: 'Architecture', value: 'Temporal Graph + Vector RAG' }
    ]
  },
  {
    id: 'food-lens',
    slug: 'food-lens',
    title: 'FoodLens — AI-Powered Chrome Extension',
    subtitle: 'Converts YouTube cooking recipe videos into instant, actionable grocery shopping carts on Swiggy Instamart using Groq & Model Context Protocol (MCP)',
    category: 'Software Engineering',
    status: 'Production',
    timeframe: 'Mar 2026',
    shortDescription: 'An applied AI Chrome extension that transforms unstructured YouTube recipe videos into automated grocery carts on Swiggy Instamart. Integrates video transcript extraction, Groq Llama-3.3-70b ingredient parsing, and MCP tool bridges.',
    tags: ['JavaScript', 'Next.js 15', 'Chrome Extension Manifest V3', 'Groq (Llama-3.3-70b)', 'Model Context Protocol (MCP)', 'mcp-remote', 'Swiggy Instamart'],
    featured: true,
    problemStatement: 'Watching culinary recipes online requires tedious manual transcription of ingredients, converting vague culinary units into grocery quantities, and searching for each individual item on quick-commerce apps—causing high drop-off between viewing and purchasing.',
    projectOverview: 'FoodLens automates the recipe-to-cart journey in a single click. When a user opens any YouTube cooking video, the Chrome extension extracts the video transcript, prompts a Groq-hosted Llama-3.3-70b model to isolate exact grocery items and quantities, and coordinates with an authenticated Swiggy Instamart MCP server via mcp-remote to discover products and populate the cart automatically.',
    architecture: {
      summary: 'A multi-tier client-server pipeline connecting Chrome Manifest V3, a Next.js 15 backend orchestrator, Groq LLM inference, and an authenticated Swiggy MCP server.',
      diagramDescription: 'YouTube Video -> Chrome Extension UI (Manifest V3) -> Next.js 15 Server -> Groq LLM (Llama-3.3-70b Ingredient Extraction) -> mcp-remote OAuth Bridge -> Swiggy Instamart MCP Server -> Automated Cart Addition',
      layers: [
        {
          name: '1. Extension UI Layer',
          technologies: ['Chrome Extension Manifest V3', 'JavaScript', 'Content Scripts'],
          description: 'Injects an interactive action pill directly into the YouTube player interface. Captures active video ID and initiates extraction.'
        },
        {
          name: '2. Orchestration Server',
          technologies: ['Next.js 15 (App Router)', 'TypeScript', 'Node.js'],
          description: 'Manages API endpoints, transcript fetching, session tokens, and coordinates LLM prompting with MCP tool calls.'
        },
        {
          name: '3. LLM Extraction Engine',
          technologies: ['Groq Cloud', 'Llama-3.3-70b-Versatile'],
          description: 'High-speed JSON extraction isolating ingredients, quantities, standard units (grams, ml, pieces), and discarding culinary conversational filler.'
        },
        {
          name: '4. Swiggy MCP Bridge',
          technologies: ['Model Context Protocol (MCP)', 'mcp-remote', 'Swiggy Instamart Tools'],
          description: 'Authenticates via OAuth and calls Swiggy Instamart product search and cart mutation tools to populate real grocery baskets.'
        }
      ]
    },
    technicalImplementation: [
      {
        aspect: 'YouTube Transcript Extraction & LLM Structured Parsing',
        description: 'Fetches timed text captions from YouTube, cleans timecode offsets, and streams the transcript to Groq for sub-second structured JSON ingredient extraction.',
        language: 'javascript',
        codeSnippet: `// Server-side Groq ingredient extraction prompt
const prompt = \`Extract all cooking ingredients and grocery items from this recipe transcript.
Return ONLY valid JSON matching this schema:
{
  "recipe_name": string,
  "ingredients": [
    { "name": string, "quantity": number, "unit": string, "search_query": string }
  ]
}
Transcript: "\${transcriptText}"\`;

const chatCompletion = await groq.chat.completions.create({
  messages: [{ role: 'user', content: prompt }],
  model: 'llama-3.3-70b-versatile',
  response_format: { type: 'json_object' }
});`
      },
      {
        aspect: 'MCP-Remote Tool Protocol Execution',
        description: 'Connects to Swiggy Instamart through the Model Context Protocol to execute product discovery queries and add matched items directly into the user session cart.',
        language: 'javascript',
        codeSnippet: `// Dispatching search queries through Swiggy MCP tool interface
for (const item of extractedIngredients) {
  const searchResult = await mcpClient.callTool({
    name: 'swiggy_search_products',
    arguments: { query: item.search_query, store_id: userStoreId }
  });
  
  if (searchResult.products?.length > 0) {
    const topMatch = searchResult.products[0];
    await mcpClient.callTool({
      name: 'swiggy_add_to_cart',
      arguments: { product_id: topMatch.id, quantity: 1 }
    });
  }
}`
      }
    ],
    engineeringChallenges: [
      {
        challenge: 'Ambiguous Ingredient Matching on Quick-Commerce Catalogs',
        solution: 'Recipe transcripts often state colloquial terms (e.g. "a pinch of hing" or "two medium onions"). Designed a normalization step generating targeted e-commerce search keywords (e.g. "Asafoetida powder 50g", "Fresh Red Onion 1kg") before querying the catalog.',
        outcome: 'Significantly higher product match rates on Swiggy Instamart with minimal zero-result searches.'
      },
      {
        challenge: 'Chrome Manifest V3 Background Service Worker Lifecycles',
        solution: 'Decoupled long-running MCP tool orchestration from the ephemeral Manifest V3 service worker into an independent Next.js backend server with SSE status streaming.',
        outcome: 'Stable execution unaffected by background worker termination.'
      }
    ],
    demonstrations: [
      {
        title: 'Recipe-to-Cart Extension Workflow',
        caption: 'Extension interface showing extracted ingredient items, product matches, and one-click cart insertion on Swiggy Instamart.',
        type: 'ui',
        placeholderText: '[Live Extension UI: Video Overlay -> Parsed Ingredient Checklist -> Swiggy Instamart Cart Status]'
      }
    ],
    actualResults: [
      'Successfully deployed and functional with public live demo at food-lens-seven.vercel.app.',
      'Achieves <1.5s total ingredient extraction latency using Groq Llama-3.3-70b.',
      'End-to-end recipe-to-cart automation verified across real Indian culinary recipe videos.'
    ],
    limitations: [
      'Currently relies on videos having auto-generated or uploaded English or Hindi captions.',
      'Swiggy Instamart product availability is location-dependent based on the user pincode/store.'
    ],
    futureImprovements: [
      'Incorporate client-side Whisper.wasm to transcribe audio directly when YouTube captions are disabled.',
      'Expand MCP product bridges to additional delivery platforms (Blinkit, Zepto, Amazon Fresh).'
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Video Capture & Transcript Ingestion',
        input: 'YouTube Video URL / Active Tab ID',
        output: 'Raw Text Transcript Stream',
        detail: 'Extracts timed text captions and cleans timestamp headers.'
      },
      {
        stepNumber: 2,
        title: 'Groq LLM Ingredient Extraction',
        input: 'Raw Transcript',
        output: 'Structured Ingredient List [Name, Quantity, Unit, Search Keyword]',
        detail: 'Llama-3.3-70b parses cooking instructions into standardized grocery items.'
      },
      {
        stepNumber: 3,
        title: 'Swiggy MCP Catalog Discovery',
        input: 'Optimized Search Queries',
        output: 'Instamart Catalog Product Matches & Prices',
        detail: 'Queries Swiggy MCP server via mcp-remote bridge for available in-stock items.'
      },
      {
        stepNumber: 4,
        title: 'Automated Cart Mutation',
        input: 'Selected Product IDs & Quantities',
        output: 'Populated Swiggy Instamart Cart Confirmation',
        detail: 'Executes cart addition tool calls and returns checkout summary to extension.'
      }
    ],
    githubUrl: 'https://github.com/KunjalCodes/FoodLens',
    demoUrl: 'https://food-lens-seven.vercel.app',
    metrics: [
      { label: 'Extraction Latency', value: '< 1.5s (Groq Llama-3.3)' },
      { label: 'Live Demo', value: 'Deployed on Vercel' },
      { label: 'Tool Bridge', value: 'Swiggy MCP Protocol' }
    ]
  },
  {
    id: 'multi-agent-builder',
    slug: 'multi-agent-builder',
    title: 'Multi-Agent AI Project Builder',
    subtitle: 'Autonomous multi-agent system that converts natural language ideas into runnable frontend and FastAPI applications',
    category: 'AI / Machine Learning',
    status: 'Active Development',
    timeframe: 'Feb 2026',
    shortDescription: 'An autonomous software generation pipeline powered by specialized AI agents executing sequential design, implementation, code enhancement, and automated runtime execution.',
    tags: ['Python', 'FastAPI', 'Groq LLM API', 'Multi-Agent Orchestration', 'AsyncIO', 'uv'],
    featured: true,
    problemStatement: 'Single-prompt code generation models often collapse when asked to scaffold full applications: they omit file structures, generate broken dependency files, produce unfinished placeholders, and cannot verify or run the generated code.',
    projectOverview: 'Multi-Agent Project Builder decomposes the software engineering lifecycle into dedicated autonomous roles: TypeClassifier determines frontend or backend requirements, Planner constructs architecture specs, Architect designs file trees, Coder writes modular implementation files, Enhancer polishes the UI/UX, FileManager commits artifacts to disk, and ProjectRunner launches the live server automatically.',
    architecture: {
      summary: 'A staged pipeline with sequential agent handoffs, structured JSON inter-agent communication, and runtime file execution.',
      diagramDescription: 'User Natural Language Prompt -> TypeClassifier -> Planner -> Architect -> Coder -> Enhancer -> FileManager -> ProjectRunner (Live Server + Browser Auto-launch)',
      layers: [
        {
          name: '1. Ingestion & Classification',
          technologies: ['FastAPI', 'Groq API'],
          description: 'TypeClassifier inspects user intent and classifies project architecture (Static Frontend, React SPA, or FastAPI Backend).'
        },
        {
          name: '2. Planning & Architecture Design',
          technologies: ['LLM Structured Generation', 'Pydantic'],
          description: 'Planner defines feature scope and technical dependencies; Architect generates a clean directory tree and file signatures.'
        },
        {
          name: '3. Implementation & Code Generation',
          technologies: ['Python AsyncIO', 'Groq Llama-3'],
          description: 'Coder implements each file sequentially with full logic; Enhancer adds responsive styles, dark mode, and UI polish.'
        },
        {
          name: '4. File Management & Execution',
          technologies: ['Python os/shutil', 'uv / subprocess'],
          description: 'FileManager writes verified code to disk; ProjectRunner installs dependencies, starts the local server, and launches the browser.'
        }
      ]
    },
    technicalImplementation: [
      {
        aspect: 'Multi-Agent Sequential Handoff Loop',
        description: 'Each agent runs with focused system prompts and receives the exact output schema from the preceding agent, eliminating hallucinations and ensuring architectural alignment.',
        language: 'python',
        codeSnippet: `async def build_project_pipeline(user_prompt: str):
    # Step 1: Type classification
    project_type = await type_classifier.classify(user_prompt)
    
    # Step 2: System plan & architecture specification
    plan = await planner.create_plan(user_prompt, project_type)
    file_tree = await architect.design_structure(plan)
    
    # Step 3: Modular code implementation
    generated_files = {}
    for file_spec in file_tree.files:
        code = await coder.write_code(file_spec, plan, generated_files)
        enhanced_code = await enhancer.polish(code, file_spec.filename)
        generated_files[file_spec.path] = enhanced_code
        
    # Step 4: Write to disk and auto-run
    project_path = await file_manager.save_project(generated_files)
    await project_runner.execute(project_path, project_type)`
      }
    ],
    engineeringChallenges: [
      {
        challenge: 'Inter-file Dependency Mismatches during Code Generation',
        solution: 'Passed accumulated code dictionaries of previously generated files into subsequent agent prompts, allowing the Coder to inspect exact function signatures and import paths.',
        outcome: 'Zero import errors across generated multi-file applications.'
      }
    ],
    demonstrations: [
      {
        title: 'Interactive Multi-Agent Terminal Workflow',
        caption: 'Console trace showing TypeClassifier -> Planner -> Architect -> Coder handoffs.',
        type: 'pipeline',
        placeholderText: 'https://github.com/user-attachments/assets/ca6fdd54-0cf4-4307-9a39-a54dc72f253b'
      },
      {
        title: 'Generated Project File Tree & Server Execution',
        caption: 'Generated directory structure and automatic local server execution in browser.',
        type: 'ui',
        placeholderText: 'https://github.com/user-attachments/assets/5aa1d84d-98d0-4c7c-aaf1-0b9388e357f0'
      }
    ],
    actualResults: [
      'Documented working autonomous pipeline generating runnable FastAPI backends and responsive frontend applications from natural language prompts.',
      'Automated dependency resolution and live browser auto-launch upon project completion.'
    ],
    limitations: [
      'Currently optimized for single-service applications; multi-container Docker compose scaffolding is experimental.',
      'Iterative bug fixing loop is triggered post-execution rather than through continuous static type analysis.'
    ],
    futureImprovements: [
      'Integrate static analysis (Ruff / Pyright) into a self-healing retry loop before saving files to disk.',
      'Add support for full-stack Next.js + PostgreSQL database generation.'
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Type Classification',
        input: 'Natural Language Idea Prompt',
        output: 'Classified Project Stack (Frontend / FastAPI)',
        detail: 'Analyzes intent to select appropriate architectural templates.'
      },
      {
        stepNumber: 2,
        title: 'Planning & Architecture',
        input: 'Project Stack + Requirements',
        output: 'System Plan & File Tree Manifest',
        detail: 'Designs directory structure, components, and module interfaces.'
      },
      {
        stepNumber: 3,
        title: 'Code Generation & Polish',
        input: 'File Tree + Architectural Context',
        output: 'Complete Production-Ready Source Code',
        detail: 'Generates modular files and passes code through UI enhancement layer.'
      },
      {
        stepNumber: 4,
        title: 'Disk Write & Auto Execution',
        input: 'Generated File Dictionary',
        output: 'Running Server & Browser Window',
        detail: 'Writes files, resolves dependencies, and boots the live server.'
      }
    ],
    githubUrl: 'https://github.com/KunjalCodes/multi-agent-builder',
    metrics: [
      { label: 'Pipeline Agents', value: '7 Specialized Roles' },
      { label: 'Runtime Target', value: 'Frontend & FastAPI' },
      { label: 'Execution', value: 'Auto-launch in browser' }
    ]
  },
  {
    id: 'mcp-ai-copilot',
    slug: 'mcp-ai-copilot',
    title: 'AI Research Copilot (MCP + Ollama)',
    subtitle: 'Tool-using research agent leveraging the Model Context Protocol and local LLMs for private multi-step information retrieval',
    category: 'Experiments',
    status: 'Active Development',
    timeframe: 'Feb 2026',
    shortDescription: 'An autonomous research assistant built on the Model Context Protocol (MCP) and local Ollama inference. Features a custom MCP server exposing search, weather, calculation, and persistent notes memory.',
    tags: ['Python', 'Model Context Protocol (MCP)', 'Ollama (Llama 3)', 'Wikipedia API', 'Open-Meteo', 'Local Storage'],
    featured: true,
    problemStatement: 'Researchers requiring AI-assisted synthesis frequently encounter two issues: cloud APIs leak sensitive personal notes, and generic chat models hallucinate factual data without verified access to deterministic tools.',
    projectOverview: 'AI Research Copilot demonstrates private, low-latency agentic problem solving using local Ollama (Llama 3) runtime and a custom Python Model Context Protocol (MCP) server. The agent autonomously selects, parameterizes, and invokes tools—including Wikipedia retrieval, meteorological data, calculations, and persistent notes memory—in a multi-step reasoning loop.',
    architecture: {
      summary: 'Local client-server architecture linking an Ollama agent loop to a custom MCP server via standard JSON-RPC protocol.',
      diagramDescription: 'User Research Query -> Local Ollama Agent (Llama 3) -> Tool Selection via MCP Protocol -> Custom MCP Server [Wikipedia API, Open-Meteo, Math Engine, Persistent Notes Memory] -> Multi-step Synthesis -> Grounded Research Brief',
      layers: [
        {
          name: '1. Local Inference Core',
          technologies: ['Ollama', 'Llama 3 8B', 'Python AsyncIO'],
          description: 'Runs private on-device reasoning and tool selection without exposing prompts to third-party cloud APIs.'
        },
        {
          name: '2. Custom MCP Server',
          technologies: ['Model Context Protocol (MCP)', 'JSON-RPC over stdio'],
          description: 'Exposes typed tools: wikipedia_search(), get_live_weather(), calculate_expression(), and save_note().'
        },
        {
          name: '3. Persistent Memory Layer',
          technologies: ['JSON Local Store', 'File System'],
          description: 'Stores categorized research notes and allows the agent to recall prior findings in subsequent multi-turn queries.'
        }
      ]
    },
    technicalImplementation: [
      {
        aspect: 'MCP Server Tool Registration',
        description: 'Implements typed tool definitions following the official Model Context Protocol specification for tool-calling agents.',
        language: 'python',
        codeSnippet: `@mcp.tool()
def wikipedia_search(query: str, max_results: int = 3) -> str:
    """Search Wikipedia for factual background on technical concepts."""
    results = wikipedia.search(query, results=max_results)
    if not results:
        return "No Wikipedia articles found for query."
    summary = wikipedia.summary(results[0], sentences=4)
    return f"Title: {results[0]}\\nSummary: {summary}"`
      }
    ],
    engineeringChallenges: [
      {
        challenge: 'Multi-Step Tool Chaining with Small Local Language Models',
        solution: 'Implemented structured tool validation to prevent 8B parameter models from generating malformed tool parameters when chaining calculations after search queries.',
        outcome: 'Reliable multi-step tool execution across research workflows.'
      }
    ],
    demonstrations: [
      {
        title: 'Multi-Step Research Execution Trace',
        caption: 'Console trace showing Ollama agent invoking Wikipedia and Weather tools sequentially.',
        type: 'ui',
        placeholderText: 'https://github.com/user-attachments/assets/1bb96193-34ef-4829-9acd-8d814a676da5'
      },
      {
        title: 'Persistent Memory Notes Recall',
        caption: 'Agent recalling previously saved research notes during conversation turn.',
        type: 'demo',
        placeholderText: 'https://github.com/user-attachments/assets/0acc485b-1213-4c08-90f1-5063798e9412'
      }
    ],
    actualResults: [
      'Documented working MCP tool-calling agent running entirely locally on Ollama.',
      'Functional tool integration across Wikipedia, Open-Meteo, mathematical computation, and persistent notes memory.'
    ],
    limitations: [
      'Search results depend on public Wikipedia endpoints and require internet access for API queries.',
      'Local model reasoning depth is bounded by Llama 3 8B parameter capacity.'
    ],
    futureImprovements: [
      'Add ArXiv academic paper search and PDF text extraction tools to the MCP server.',
      'Implement local vector store indexing over downloaded research documents.'
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Query Ingestion & Intent Analysis',
        input: 'User Research Question',
        output: 'Tool Call Decision Proposal',
        detail: 'Local Llama 3 determines if external factual knowledge or calculation is required.'
      },
      {
        stepNumber: 2,
        title: 'MCP Protocol Tool Dispatch',
        input: 'Structured Tool Arguments (JSON)',
        output: 'Tool Execution Results',
        detail: 'Dispatches JSON-RPC request to custom MCP server to query Wikipedia, Open-Meteo, or memory.'
      },
      {
        stepNumber: 3,
        title: 'Multi-Turn Synthesis',
        input: 'Tool Outputs + User Context',
        output: 'Verified Fact-Grounded Response',
        detail: 'Synthesizes information and optionally commits key insights into persistent notes memory.'
      }
    ],
    githubUrl: 'https://github.com/KunjalCodes/mcp-ai-copilot',
    metrics: [
      { label: 'Protocol', value: 'Model Context Protocol (MCP)' },
      { label: 'Inference', value: '100% Local (Ollama / Llama 3)' },
      { label: 'Memory', value: 'Persistent Local Notes' }
    ]
  },
  {
    id: 'rag-ml-textbook-chatbot',
    slug: 'rag-ml-textbook-chatbot',
    title: 'RAG ML Textbook Chatbot',
    subtitle: 'Grounded document-level retrieval system answering machine learning queries from textbook sources without hallucinations',
    category: 'AI / Machine Learning',
    status: 'Production',
    timeframe: 'Jan 2026',
    shortDescription: 'A focused Retrieval-Augmented Generation (RAG) implementation that ingests academic machine learning textbooks into ChromaDB, queries semantic vector embeddings, and generates verified answers via local Llama 3.',
    tags: ['Python', 'LangChain', 'ChromaDB', 'Sentence Transformers', 'Ollama', 'Llama 3', 'RAG'],
    featured: false,
    problemStatement: 'When students query language models on machine learning theory, models frequently hallucinate mathematical derivations or mix up domain-specific definitions (e.g. VC dimension vs Rademacher complexity).',
    projectOverview: 'This project implements a clean RAG pipeline where an academic textbook serves as the sole source of truth. Text is chunked with sliding token overlap, embedded via Sentence Transformers, indexed in ChromaDB, and retrieved using semantic similarity to ground local Llama 3 inference.',
    architecture: {
      summary: 'Deterministic document chunking and vector retrieval pipeline orchestrated through LangChain and Ollama.',
      diagramDescription: 'PDF Textbook -> Text Extraction -> Recursive Chunking -> Sentence Transformers -> ChromaDB Vector Store -> Semantic Search -> Retrieved Context -> Local Llama 3 -> Grounded Answer',
      layers: [
        {
          name: '1. Document Chunking & Embedding',
          technologies: ['LangChain PyPDFLoader', 'Sentence Transformers'],
          description: 'Splits technical chapters into 500-token chunks with 50-token overlap to maintain equation context.'
        },
        {
          name: '2. Vector Database',
          technologies: ['ChromaDB', 'Cosine Distance'],
          description: 'Indexes dense embeddings for sub-10ms nearest neighbor semantic lookup.'
        },
        {
          name: '3. Grounded Synthesis',
          technologies: ['Ollama', 'Llama 3 8B'],
          description: 'Generates answers strictly constrained to retrieved context chunks, citing page numbers.'
        }
      ]
    },
    technicalImplementation: [
      {
        aspect: 'Context-Constrained RAG Prompting',
        description: 'Enforces strict adherence to retrieved textbook excerpts, instructing the model to reject queries absent from the source material.',
        language: 'python',
        codeSnippet: `template = """You are an academic ML tutor. Answer the question using ONLY the provided textbook context:
{context}

Question: {question}

If the context does not contain the answer, state: "Information not found in the textbook." Do not extrapolate."""`
      }
    ],
    engineeringChallenges: [
      {
        challenge: 'Mathematical Notation Formatting Across Chunk Boundaries',
        solution: 'Implemented recursive character text splitting respecting paragraph and LaTeX math delimiters to prevent equations from splitting in half.',
        outcome: 'Preserved mathematical formula integrity in retrieved context blocks.'
      }
    ],
    demonstrations: [
      {
        title: 'ChromaDB Semantic Retrieval Trace',
        caption: 'Console log showing top-k semantic matches retrieved from machine learning textbook chapters.',
        type: 'demo',
        placeholderText: 'https://github.com/user-attachments/assets/5b7aca1a-55d7-49a2-b490-93555dffd34d'
      }
    ],
    actualResults: [
      'Documented functional RAG chatbot accurately answering technical machine learning questions strictly from textbook pages.',
      'Demonstrated zero hallucination on out-of-domain queries by enforcing explicit negative constraints.'
    ],
    limitations: [
      'Currently limited to single-document textbook ingestion; multi-textbook cross-referencing is planned.',
      'Visual diagram and chart figures inside PDFs are omitted during text-only extraction.'
    ],
    futureImprovements: [
      'Implement ColBERT late interaction multi-vector retrieval for enhanced mathematical formula matching.',
      'Add multimodal PDF extraction to incorporate textbook charts into the retrieval store.'
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Textbook Parsing & Chunking',
        input: 'Machine Learning Textbook PDF',
        output: 'Token Chunks with Chapter Metadata',
        detail: 'Extracts clean text and chunks with 500-token boundaries and overlap.'
      },
      {
        stepNumber: 2,
        title: 'Dense Vector Indexing',
        input: 'Text Chunks',
        output: 'ChromaDB Vector Embeddings',
        detail: 'Generates 384-dimensional embeddings via Sentence Transformers.'
      },
      {
        stepNumber: 3,
        title: 'Semantic Query & Retrieval',
        input: 'User Question',
        output: 'Top-k Relevant Context Passages',
        detail: 'Computes cosine similarity in ChromaDB to retrieve most pertinent textbook sections.'
      },
      {
        stepNumber: 4,
        title: 'Grounded Answer Generation',
        input: 'Retrieved Passages + User Question',
        output: 'Hallucination-free ML Answer',
        detail: 'Llama 3 synthesizes an answer referencing source material.'
      }
    ],
    githubUrl: 'https://github.com/KunjalCodes/rag-ml-textbook-chatbot',
    metrics: [
      { label: 'Vector Store', value: 'ChromaDB' },
      { label: 'Embeddings', value: 'Sentence Transformers' },
      { label: 'Inference', value: 'Local Llama 3 via Ollama' }
    ]
  },
  {
    id: 'furniture-drawing-extractor',
    slug: 'furniture-drawing-extractor',
    title: 'AI Furniture Drawing Extraction System',
    subtitle: 'Automated engineering drawing extraction engine for furniture manufacturing utilizing OCR, computer vision, and LLM-based interpretation',
    category: 'Computer Vision',
    status: 'Active Development',
    timeframe: 'Sep 2026 — Present (Igniters Hub)',
    shortDescription: 'Enterprise computer vision and OCR system engineered at Igniters Hub to automate dimension, joinery, and component schedule extraction from complex furniture technical drawings. (Proprietary company code & confidential datasets withheld).',
    tags: ['Python', 'OpenCV', 'EasyOCR', 'LLMs', 'Computer Vision', 'FastAPI', 'CAD Schematics'],
    featured: true,
    problemStatement: 'Furniture manufacturing relies heavily on 2D technical drawings (PDF/TIFF) containing cut lists, panel dimensions, hardware callouts, and joinery details. Manual takeoff by estimators is labor-intensive and prone to calculation errors that lead to wasted lumber and fabrication delays.',
    projectOverview: 'As a Software Developer at Igniters Hub, I am building an automated drawing extraction pipeline that parses technical furniture schematics. The system combines classical computer vision (morphological kernels, line removal, caliper isolation) with deep OCR and multimodal LLM interpretation to extract structured bills of materials (BOM), panel dimensions, and hardware schedules for downstream manufacturing.',
    architecture: {
      summary: 'Staged computer vision and OCR pipeline engineered for high-accuracy furniture drawing takeoff. (High-level architecture displayed to respect company confidentiality).',
      diagramDescription: 'Furniture Technical Drawing -> Morphological Line & Text Separation -> OCR Bounding Box Proposals -> LLM Semantic Interpretation -> Dimensional Validation & Unit Normalization -> Manufacturing Bill of Materials (BOM) JSON',
      layers: [
        {
          name: '1. Drawing Ingestion & Preprocessing',
          technologies: ['OpenCV (C++ / Python)', 'Bilateral Filter', 'Adaptive Thresholding'],
          description: 'Ingests high-DPI furniture assembly drawings, cleans scanner grain, and isolates boundary edges.'
        },
        {
          name: '2. Geometric & Text Separation',
          technologies: ['Morphological Kernels (OpenCV)'],
          description: 'Separates continuous panel vector boundaries from dimensional extension lines and text annotations.'
        },
        {
          name: '3. OCR & Dimension Caliper Reading',
          technologies: ['OCR Models (EasyOCR / Tesseract)', 'Directional NMS'],
          description: 'Extracts alphanumeric dimension measurements, tolerance callouts, and panel identifiers.'
        },
        {
          name: '4. Component & Joinery Interpretation',
          technologies: ['LLM Processing', 'Pydantic v2'],
          description: 'Associates dimensions with physical furniture components (e.g. tabletop, drawer sides, modesty panel) and classifies joinery types.'
        },
        {
          name: '5. Manufacturing Output Generation',
          technologies: ['FastAPI', 'Structured JSON Schema'],
          description: 'Formats verified panel lists into machine-readable JSON for downstream CNC and ERP cutting software.'
        }
      ]
    },
    technicalImplementation: [
      {
        aspect: 'High-Level Pipeline Architecture (Confidentiality Protected)',
        description: 'To protect proprietary enterprise intellectual property, internal company algorithms and confidential production datasets are omitted. The pipeline operates on classical morphological filtering coupled with structured language model validation.',
        language: 'text',
        codeSnippet: `// High-Level Extraction Architecture Overview
Drawing Scan (PDF / TIFF)
  │
  ├── 1. Grayscale & Bilateral Filtering (Denoise while preserving edge acuity)
  ├── 2. Morphological Kernel Decomposition (Strip text from intersecting panel lines)
  ├── 3. OCR Text & Dimension Proposal Generation
  ├── 4. LLM Semantic Parsing & Component Grouping
  └── 5. Structured Manufacturing JSON Schema Export`
      }
    ],
    engineeringChallenges: [
      {
        challenge: 'Dense Furniture Dimension Calipers Overlapping Wood Grain Hatching',
        solution: 'Developed multi-stage morphological filtering that suppresses repetitive diagonal hatching patterns before running character segmentation.',
        outcome: 'Substantial improvement in dimension number recognition accuracy on technical furniture drawings.'
      }
    ],
    demonstrations: [
      {
        title: 'Furniture Drawing Extraction Architecture',
        caption: 'Conceptual decomposition showing panel line isolation and component schedule extraction.',
        type: 'pipeline',
        placeholderText: '[Enterprise Showcase: Furniture Technical Schematic -> Dimension Extraction -> Structured BOM Output]'
      }
    ],
    actualResults: [
      'Active enterprise development at Igniters Hub automating manual drawing takeoff for furniture manufacturing.',
      'Automated extraction of panel dimensions, joinery callouts, and component schedules into structured JSON schemas.'
    ],
    limitations: [
      'Proprietary enterprise project: internal source code, production API keys, and client drawing datasets are strictly confidential and withheld.',
      'Hand-annotated shop revisions currently require manual verification before CNC cutting export.'
    ],
    futureImprovements: [
      'Direct integration with automated CNC panel optimization software (nesting algorithms).',
      '3D parametric assembly preview generated directly from extracted 2D drawing panels.'
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Drawing Preprocessing',
        input: 'Furniture Technical PDF / Scan',
        output: 'Cleaned Binary Pixel Mask',
        detail: 'Removes paper grain and enhances dimensional line edges.'
      },
      {
        stepNumber: 2,
        title: 'Line & Text Separation',
        input: 'Binary Pixel Mask',
        output: 'Isolated Panel Vectors & Text Candidate Patches',
        detail: 'Directional morphological kernels separate continuous cut lines from alphanumeric dimensions.'
      },
      {
        stepNumber: 3,
        title: 'OCR & Caliper Reading',
        input: 'Text Patches',
        output: 'Dimension Proposals [mm / inches]',
        detail: 'Transcribes panel measurements, tolerances, and hardware codes.'
      },
      {
        stepNumber: 4,
        title: 'Component Association',
        input: 'Dimensions + Drawing Layout Context',
        output: 'Structured Bill of Materials (BOM)',
        detail: 'Maps dimensions to specific furniture parts (e.g. table legs, drawer runners) with Pydantic verification.'
      }
    ],
    githubUrl: undefined,
    demoUrl: undefined,
    metrics: [
      { label: 'Role & Org', value: 'Software Developer @ Igniters Hub' },
      { label: 'Domain', value: 'Furniture Engineering Takeoff' },
      { label: 'Status', value: 'Enterprise Active R&D' }
    ]
  }
];
