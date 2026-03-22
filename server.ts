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

  // Logging middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`${req.method} ${req.path}`, req.method === 'POST' || req.method === 'PUT' ? req.body : '');
    }
    next();
  });

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
      
      const { data, esporte, liga, jogo, tipo_aposta, odd, valor_apostado, resultado, observacoes } = req.body;
      
      // Validation
      if (!data || !esporte || !liga || !jogo || !tipo_aposta || odd === undefined || valor_apostado === undefined || !resultado) {
        return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
      }

      const nOdd = parseFloat(odd as any);
      const nValor = parseFloat(valor_apostado as any);

      if (isNaN(nOdd) || isNaN(nValor)) {
        return res.status(400).json({ error: "Odd e Valor Apostado devem ser números válidos." });
      }

      let lucro_prejuizo = 0;
      if (resultado === "ganhou") {
        lucro_prejuizo = nValor * (nOdd - 1);
      } else if (resultado === "perdeu") {
        lucro_prejuizo = -nValor;
      } else {
        lucro_prejuizo = 0;
      }

      const { data: inserted, error } = await supabase
        .from("apostas")
        .insert([{ 
          data, 
          esporte, 
          liga, 
          jogo, 
          tipo_aposta, 
          odd: nOdd, 
          valor_apostado: nValor, 
          resultado, 
          lucro_prejuizo, 
          observacoes 
        }])
        .select()
        .single();

      if (error) {
        console.error("Erro Supabase Insert:", error);
        return res.status(500).json({ error: error.message || "Erro ao salvar no banco de dados" });
      }
      
      if (!inserted) {
        return res.status(500).json({ error: "Nenhum dado retornado após inserção" });
      }

      console.log("Aposta inserida com sucesso:", inserted.id);
      res.json({ id: inserted.id, lucro_prejuizo });
    } catch (error: any) {
      console.error("Erro ao criar aposta:", error);
      res.status(500).json({ error: error.message || "Erro interno ao criar aposta" });
    }
  });

  app.put("/api/apostas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { data, esporte, liga, jogo, tipo_aposta, odd, valor_apostado, resultado, observacoes } = req.body;
      
      // Validation
      if (!data || !esporte || !liga || !jogo || !tipo_aposta || odd === undefined || valor_apostado === undefined || !resultado) {
        return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
      }

      const nOdd = parseFloat(odd as any);
      const nValor = parseFloat(valor_apostado as any);

      if (isNaN(nOdd) || isNaN(nValor)) {
        return res.status(400).json({ error: "Odd e Valor Apostado devem ser números válidos." });
      }

      let lucro_prejuizo = 0;
      if (resultado === "ganhou") {
        lucro_prejuizo = nValor * (nOdd - 1);
      } else if (resultado === "perdeu") {
        lucro_prejuizo = -nValor;
      } else {
        lucro_prejuizo = 0;
      }

      const { error } = await supabase
        .from("apostas")
        .update({ 
          data, 
          esporte, 
          liga, 
          jogo, 
          tipo_aposta, 
          odd: nOdd, 
          valor_apostado: nValor, 
          resultado, 
          lucro_prejuizo, 
          observacoes 
        })
        .eq("id", id);

      if (error) {
        console.error("Erro Supabase Update:", error);
        return res.status(500).json({ error: error.message || "Erro ao atualizar no banco de dados" });
      }
      
      res.json({ success: true, lucro_prejuizo });
    } catch (error: any) {
      console.error("Erro ao atualizar aposta:", error);
      res.status(500).json({ error: error.message || "Erro interno ao atualizar aposta" });
    }
  });

  app.delete("/api/apostas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from("apostas").delete().eq("id", id);
      if (error) {
        console.error("Erro Supabase Delete:", error);
        return res.status(500).json({ error: error.message || "Erro ao excluir no banco de dados" });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Erro ao excluir aposta:", error);
      res.status(500).json({ error: error.message || "Erro interno ao excluir aposta" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: "Configuração do Supabase ausente. Verifique as variáveis de ambiente." });
      }
      const { data: stats, error: statsError } = await supabase.rpc("get_bet_stats");
      const { data: dailyStats, error: dailyError } = await supabase.rpc("get_daily_bet_stats");
      
      if (statsError) {
        console.error("Erro Supabase RPC get_bet_stats:", statsError);
        return res.status(500).json({ error: statsError.message || "Erro ao buscar estatísticas" });
      }
      if (dailyError) {
        console.error("Erro Supabase RPC get_daily_bet_stats:", dailyError);
        return res.status(500).json({ error: dailyError.message || "Erro ao buscar estatísticas diárias" });
      }

      res.json({ stats, dailyStats: dailyStats || [] });
    } catch (error: any) {
      console.error("Erro ao buscar estatísticas:", error);
      res.status(500).json({ error: error.message || "Erro interno ao buscar estatísticas" });
    }
  });

  app.post("/api/config", async (req, res) => {
    try {
      const { investimentoInicial } = req.body;
      
      if (investimentoInicial === undefined || investimentoInicial === null) {
        return res.status(400).json({ error: "Valor de investimento inicial é obrigatório" });
      }

      const valor = parseFloat(investimentoInicial);
      if (isNaN(valor)) {
        return res.status(400).json({ error: "Valor de investimento inicial inválido" });
      }

      console.log("Atualizando investimento inicial para:", valor);

      // First try to update
      const { data: updateData, error: updateError } = await supabase
        .from("configuracoes")
        .update({ investimento_inicial: valor })
        .eq("id", 1)
        .select();
      
      if (updateError) {
        console.error("Erro ao atualizar configuracoes:", updateError);
        return res.status(500).json({ error: updateError.message || "Erro ao atualizar configuração" });
      }

      if (!updateData || updateData.length === 0) {
        console.log("Nenhuma linha atualizada, tentando inserir...");
        // If update failed to find the row, insert it
        const { data: insertData, error: insertError } = await supabase
          .from("configuracoes")
          .insert({ id: 1, investimento_inicial: valor })
          .select();
        
        if (insertError) {
          console.error("Erro ao inserir configuracoes:", insertError);
          return res.status(500).json({ error: insertError.message || "Erro ao inserir configuração" });
        }
        console.log("Configuração inserida com sucesso:", insertData);
        return res.json({ success: true, data: insertData });
      }
      
      console.log("Configuração atualizada com sucesso:", updateData);
      res.json({ success: true, data: updateData });
    } catch (error: any) {
      console.error("Erro ao atualizar configuração:", error);
      res.status(500).json({ error: error.message || "Erro interno ao atualizar configuração" });
    }
  });

  // Global error handler for API routes
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("API Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
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

startServer().catch(err => {
  console.error("Critical failure starting server:", err);
});
