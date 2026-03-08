import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/apostas", async (req, res) => {
    try {
      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: "Configuração do Supabase ausente. Verifique as variáveis de ambiente." });
      }
      const { esporte, resultado, dataInicio, dataFim, page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      let query = supabase.from("apostas").select("*", { count: "exact" });

      if (esporte) {
        query = query.eq("esporte", esporte);
      }
      if (resultado) {
        query = query.eq("resultado", resultado);
      }
      if (dataInicio) {
        query = query.gte("data", dataInicio);
      }
      if (dataFim) {
        query = query.lte("data", dataFim);
      }

      const { data, count, error } = await query
        .order("data", { ascending: false })
        .order("id", { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) throw error;

      res.json({
        data: data || [],
        total: count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit))
      });
    } catch (error) {
      console.error("Erro ao buscar apostas:", error);
      res.status(500).json({ error: "Erro ao buscar apostas" });
    }
  });

  app.post("/api/apostas", async (req, res) => {
    try {
      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: "Configuração do Supabase ausente. Verifique as variáveis de ambiente." });
      }
      console.log("Recebendo nova aposta:", req.body);
      const { data, esporte, liga, jogo, tipo_aposta, odd, valor_apostado, resultado, observacoes } = req.body;
      
      let lucro_prejuizo = 0;
      if (resultado === "ganhou") {
        lucro_prejuizo = valor_apostado * (odd - 1);
      } else if (resultado === "perdeu") {
        lucro_prejuizo = -valor_apostado;
      } else {
        lucro_prejuizo = 0;
      }

      const { data: inserted, error } = await supabase
        .from("apostas")
        .insert([{ data, esporte, liga, jogo, tipo_aposta, odd, valor_apostado, resultado, lucro_prejuizo, observacoes }])
        .select()
        .single();

      if (error) {
        console.error("Erro Supabase Insert:", error);
        throw error;
      }
      
      if (!inserted) {
        throw new Error("Nenhum dado retornado após inserção");
      }

      console.log("Aposta inserida com sucesso:", inserted.id);
      res.json({ id: inserted.id, lucro_prejuizo });
    } catch (error: any) {
      console.error("Erro ao criar aposta:", error.message || error);
      res.status(500).json({ error: error.message || "Erro ao criar aposta" });
    }
  });

  app.put("/api/apostas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { data, esporte, liga, jogo, tipo_aposta, odd, valor_apostado, resultado, observacoes } = req.body;
      
      let lucro_prejuizo = 0;
      if (resultado === "ganhou") {
        lucro_prejuizo = valor_apostado * (odd - 1);
      } else if (resultado === "perdeu") {
        lucro_prejuizo = -valor_apostado;
      } else {
        lucro_prejuizo = 0;
      }

      const { error } = await supabase
        .from("apostas")
        .update({ data, esporte, liga, jogo, tipo_aposta, odd, valor_apostado, resultado, lucro_prejuizo, observacoes })
        .eq("id", id);

      if (error) throw error;
      res.json({ success: true, lucro_prejuizo });
    } catch (error) {
      console.error("Erro ao atualizar aposta:", error);
      res.status(500).json({ error: "Erro ao atualizar aposta" });
    }
  });

  app.delete("/api/apostas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from("apostas").delete().eq("id", id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao excluir aposta:", error);
      res.status(500).json({ error: "Erro ao excluir aposta" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: "Configuração do Supabase ausente. Verifique as variáveis de ambiente." });
      }
      const { data: stats, error: statsError } = await supabase.rpc("get_bet_stats");
      const { data: dailyStats, error: dailyError } = await supabase.rpc("get_daily_bet_stats");

      if (statsError) throw statsError;
      if (dailyError) throw dailyError;

      res.json({ stats, dailyStats: dailyStats || [] });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
