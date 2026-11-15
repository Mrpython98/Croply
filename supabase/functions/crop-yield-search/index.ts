const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SerpApiResult {
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
  displayed_link?: string;
}

interface SerpApiResponse {
  organic_results?: SerpApiResult[];
  knowledge_graph?: {
    title?: string;
    description?: string;
    source?: { name?: string; link?: string };
  };
  error?: string;
  search_information?: {
    total_results?: number;
  };
}

function resolveLink(result: SerpApiResult): string {
  const link = result.link || "";

  if (link && !link.startsWith("https://www.google.com/goto")) {
    return link;
  }

  const displayed = result.displayed_link || result.source || "";
  const match = displayed.match(/^(https?:\/\/[^ ›]+)/i);
  if (match) return match[1];

  return link;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const queryParam = url.searchParams.get("query");

    if (!queryParam) {
      return new Response(
        JSON.stringify({ error: "Missing 'query' parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("SERPAPI_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "SerpApi key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const serpUrl = new URL("https://serpapi.com/search.json");
    serpUrl.searchParams.set("engine", "google");
    serpUrl.searchParams.set("q", queryParam);
    serpUrl.searchParams.set("num", "10");
    serpUrl.searchParams.set("gl", "us");
    serpUrl.searchParams.set("hl", "en");
    serpUrl.searchParams.set("api_key", apiKey);

    const serpResponse = await fetch(serpUrl.toString());
    const serpData: SerpApiResponse = await serpResponse.json();

    if (serpData.error) {
      return new Response(
        JSON.stringify({ error: serpData.error }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results = (serpData.organic_results || [])
      .map((r) => ({
        title: r.title || "",
        link: resolveLink(r),
        snippet: r.snippet || "",
        source: r.displayed_link || r.source || "",
      }))
      .filter((r) => r.link && r.title && !r.link.startsWith("https://www.google.com/goto"));

    const knowledgeGraph = serpData.knowledge_graph
      ? {
          title: serpData.knowledge_graph.title || "",
          description: serpData.knowledge_graph.description || "",
          source: serpData.knowledge_graph.source?.link || "",
        }
      : null;

    return new Response(
      JSON.stringify({
        query: queryParam,
        results,
        knowledgeGraph,
        totalResults: serpData.search_information?.total_results || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
