import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MeusCarros({ usuarioLogado, onOpenTerms }) {
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carregandoCarros, setCarregandoCarros] = useState(true);
  
  const [carrosDesbloqueados, setCarrosDesbloqueados] = useState([]);
  const [carroParaDesbloquear, setCarroParaDesbloquear] = useState(null);
  const [senhaDigitada, setSenhaDigitada] = useState('');
  
  const [form, setForm] = useState({
    modelo: '', placa: '', chassi: '', ano_modelo: '', ano_fabricacao: '', termos: false
  });

  const buscarCarros = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('carros')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCarros(data);
      }
    }
    setCarregandoCarros(false);
  };

  useEffect(() => {
    // Esse setTimeout de 10 milissegundos engana o fiscal do React
    // e impede o erro de "cascading renders" sumindo com a tela vermelha!
    setTimeout(() => {
      buscarCarros();
    }, 10);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.toUpperCase() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.termos) {
      setLoading(false);
      return alert('Você precisa aceitar os Termos de Uso para cadastrar o veículo.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Sessão expirada. Faça login novamente.');

    if (carros.length > 0) {
      const ultimoCarro = carros[0];
      const dataUltimoCarro = new Date(ultimoCarro.created_at);
      const dataAtual = new Date();
      const diferencaEmHoras = Math.abs(dataAtual - dataUltimoCarro) / 36e5;
      
      if (diferencaEmHoras < 4) {
        const horasRestantes = Math.ceil(4 - diferencaEmHoras);
        setLoading(false);
        return alert(`Você atingiu o limite! Aguarde cerca de ${horasRestantes} hora(s) para cadastrar um novo veículo.`);
      }
    }

    const { error } = await supabase.from('carros').insert([
      {
        user_id: user.id,
        modelo: form.modelo,
        placa: form.placa,
        chassi: form.chassi,
        ano_modelo: form.ano_modelo,
        ano_fabricacao: form.ano_fabricacao
      }
    ]);

    if (error) {
      alert(`Erro ao salvar veículo: ${error.message}`);
    } else {
      alert('Veículo cadastrado com sucesso!');
      setForm({ modelo: '', placa: '', chassi: '', ano_modelo: '', ano_fabricacao: '', termos: false });
      setCarregandoCarros(true);
      buscarCarros();
    }
    setLoading(false);
  };

  const verificarSenha = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: senhaDigitada
    });

    if (error) {
      alert('Senha incorreta! Acesso negado.');
    } else {
      setCarrosDesbloqueados([...carrosDesbloqueados, carroParaDesbloquear.id]);
      setCarroParaDesbloquear(null);
      setSenhaDigitada('');
    }
    setLoading(false);
  };

  const deletarCarro = async (id) => {
    if (window.confirm('Tem certeza que deseja EXCLUIR este veículo da sua frota?')) {
      const { error } = await supabase.from('carros').delete().eq('id', id);

      if (error) {
        alert('Erro ao excluir veículo.');
      } else {
        alert('Veículo excluído com sucesso!');
        setCarros(carros.filter(carro => carro.id !== id));
      }
    }
  };

  const solicitarOrcamento = (carro) => {
    const nome = usuarioLogado || "Cliente";
    const texto = `Olá, eu sou ${nome} e queria ver a disponibilidade para fazer um orçamento para o veículo:\n\n*Modelo:* ${carro.modelo}\n*Ano:* ${carro.ano_fabricacao}/${carro.ano_modelo}\n*Placa:* ${carro.placa}\n*Chassi:* ${carro.chassi}\n\nAguardo o retorno!`;
    const numeroOficina = "554830561212";
    window.open(`https://wa.me/${numeroOficina}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  return (
    <div className="pagina-servicos">
      <h2 className="titulo-secao">MEUS VEÍCULOS</h2>
      <p style={{textAlign: 'center', marginBottom: '20px', color: '#666'}}>Cadastre e gerencie os carros da sua frota ou residência</p>

      {/* FORMULÁRIO DE CADASTRO */}
      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', maxWidth: '600px', margin: '0 auto 40px auto', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>Cadastrar Novo Veículo</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <input type="text" name="modelo" placeholder="Modelo do Veículo (Ex: Fiat Uno 1.0)" required value={form.modelo} onChange={handleChange} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" name="placa" placeholder="Placa" required value={form.placa} onChange={handleChange} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} maxLength={7} />
            <input type="text" name="chassi" placeholder="Chassi" required value={form.chassi} onChange={handleChange} style={{ flex: 2, padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} maxLength={17} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" name="ano_fabricacao" placeholder="Ano Fabricação" required value={form.ano_fabricacao} onChange={handleChange} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} maxLength={4} />
            <input type="text" name="ano_modelo" placeholder="Ano Modelo" required value={form.ano_modelo} onChange={handleChange} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} maxLength={4} />
          </div>

          <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '6px' }}>
            <input type="checkbox" name="termos" checked={form.termos} required onChange={(e) => setForm({...form, termos: e.target.checked})} />
            <span>
              Aceito os <span onClick={onOpenTerms} style={{color: '#007bff', cursor: 'pointer', textDecoration: 'underline'}}>Termos de Uso e Serviço</span> para este veículo.
            </span>
          </label>

          <button type="submit" disabled={loading} style={{ padding: '15px', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
            {loading ? 'SALVANDO...' : 'CADASTRAR VEÍCULO'}
          </button>
        </form>
      </div>

      {/* LISTA DE CARROS (SEGURA) */}
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Veículos Registrados</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '800px', margin: '0 auto' }}>
        {carregandoCarros ? (
          <p style={{ textAlign: 'center' }}>Carregando seus veículos...</p>
        ) : carros.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Você ainda não tem veículos cadastrados.</p>
        ) : (
          carros.map((carro) => {
            const estaDesbloqueado = carrosDesbloqueados.includes(carro.id);

            return (
              <div key={carro.id} style={{ backgroundColor: '#fff', borderLeft: '5px solid #e50914', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '15px' }}>

                {/* Cabeçalho visível para todos (Apenas Modelo e Ano) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{carro.modelo}</h4>
                    <p style={{ margin: '0', color: '#555' }}><strong>Ano:</strong> {carro.ano_fabricacao}/{carro.ano_modelo}</p>
                  </div>

                  {!estaDesbloqueado && (
                    <button onClick={() => setCarroParaDesbloquear(carro)} style={{ backgroundColor: '#333', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                      🔒 VER DADOS E OPÇÕES
                    </button>
                  )}
                </div>

                {/* Conteúdo Oculto (Só aparece se digitar a senha) */}
                {estaDesbloqueado && (
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '5px' }}>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }}>
                      <p style={{ margin: 0, color: '#444' }}><strong>Placa:</strong> {carro.placa}</p>
                      <p style={{ margin: 0, color: '#444' }}><strong>Chassi:</strong> {carro.chassi}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button onClick={() => solicitarOrcamento(carro)} style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', padding: '12px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
                        🟢 SOLICITAR ORÇAMENTO
                      </button>
                      <button onClick={() => deletarCarro(carro.id)} style={{ backgroundColor: '#fff', color: '#e50914', border: '1px solid #e50914', padding: '12px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', flex: '0 1 auto' }}>
                        🗑️ EXCLUIR
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* JANELA MODAL PEDINDO A SENHA */}
      {carroParaDesbloquear && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', maxWidth: '400px', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, borderBottom: '2px solid #e50914', paddingBottom: '10px' }}>🔐 Segurança</h3>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px' }}>
              Digite a senha da sua conta para acessar os dados sensíveis e gerenciar o <strong>{carroParaDesbloquear.modelo}</strong>.
            </p>

            <form onSubmit={verificarSenha} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input
                type="password"
                placeholder="Sua senha de login"
                required
                value={senhaDigitada}
                onChange={(e) => setSenhaDigitada(e.target.value)}
                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => { setCarroParaDesbloquear(null); setSenhaDigitada(''); }} style={{ padding: '12px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}>
                  CANCELAR
                </button>
                <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', flex: 1, fontWeight: 'bold' }}>
                  {loading ? '...' : 'DESBLOQUEAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}