import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MyAccount({ onLogin, onOpenTerms, onOpenPrivacy, setPaginaAtual }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    nome: '', cpf: '', telefone: '', email: '', senha: '', confSenha: '', termos: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefone') {
      setForm({ ...form, [name]: mTelefone(value) });
    } else if (name === 'cpf') {
      setForm({ ...form, [name]: mCPFCNPJ(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Máscara de Telefone: (99) 99999-9999
  const mTelefone = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value.slice(0, 15);
  };

  // Máscara Inteligente para CPF ou CNPJ
  const mCPFCNPJ = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      value = value.replace(/^(\d{2})(\d)/, "$1.$2");
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
      value = value.replace(/(\d{4})(\d)/, "$1-$2");
    }
    return value.slice(0, 18);
  };

  const handleHoldPassword = (e) => { e.preventDefault(); setShowPassword(true); };
  const handleReleasePassword = () => setShowPassword(false);

  const validarCpfCnpj = (val) => {
    const doc = val.replace(/\D/g, '');
    if (doc.length === 11) return validarCPF(doc);
    if (doc.length === 14) return validarCNPJ(doc);
    return false;
  };

  const validarCPF = (cpf) => {
    if (/^(\d)\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  };

  const validarCNPJ = (cnpj) => {
    if (/^(\d)\1+$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2, numeros = cnpj.substring(0, tamanho), digitos = cnpj.substring(tamanho), soma = 0, pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) { soma += numeros.charAt(tamanho - i) * pos--; if (pos < 2) pos = 9; }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    tamanho = tamanho + 1; numeros = cnpj.substring(0, tamanho); soma = 0; pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) { soma += numeros.charAt(tamanho - i) * pos--; if (pos < 2) pos = 9; }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.senha,
      });

      if (error) {
        alert(`Erro no login: ${error.message}`);
      } else {
        // Pega o nome do perfil (profiles) e usa o metadata/email apenas como fallback.
        const nomeDoUsuario = await resolverNomeUsuario(data.user);
        if (onLogin) onLogin(nomeDoUsuario);
        alert('Login efetuado com sucesso!');
        // Redireciona para a página inicial logo em seguida
        if (setPaginaAtual) setPaginaAtual('inicio');
      }
    } else {
      if (form.senha !== form.confSenha) {
        setLoading(false);
        return alert('As senhas não coincidem!');
      }
      if (!form.termos) {
        setLoading(false);
        return alert('Aceite os termos de uso!');
      }
      if (!validarCpfCnpj(form.cpf)) {
        setLoading(false);
        return alert('CPF ou CNPJ INVÁLIDO! Digite um documento real.');
      }

      // LGPD: NÃO enviamos dados sensíveis (cpf_cnpj, telefone) para o
      // raw_user_meta_data do auth.users. Apenas o nome fica no metadata
      // (para exibição rápida); os dados sensíveis vão para a tabela "profiles".
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
        options: {
          data: {
            nome_completo: form.nome,
          },
        },
      });

      if (error) {
        alert(`Erro ao criar conta: ${error.message}`);
        setLoading(false);
        return;
      }

      // Garante uma sessão autenticada para conseguir gravar em "profiles"
      // (a RLS exige auth.uid() = id). Quando a confirmação de e-mail está
      // desativada, o signUp já retorna sessão; caso contrário, autenticamos.
      let userId = signUpData?.user?.id;
      let sessionAtiva = !!signUpData?.session;

      if (!sessionAtiva) {
        const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.senha,
        });
        if (!loginErr && loginData?.user) {
          userId = loginData.user.id;
          sessionAtiva = true;
        }
      }

      if (sessionAtiva && userId) {
        const { error: perfilErr } = await supabase.from('profiles').upsert({
          id: userId,
          nome_completo: form.nome,
          cpf_cnpj: form.cpf,
          telefone: form.telefone,
          updated_at: new Date().toISOString(),
        });

        if (perfilErr) {
          console.log('[v0] Erro ao salvar profile:', perfilErr.message);
          alert('Conta criada, mas houve um erro ao salvar seus dados de perfil. Tente atualizar mais tarde em "Minha Conta".');
        } else {
          alert('Conta criada com sucesso!');
        }

        // Usuário já está logado: leva direto para o início.
        if (onLogin) onLogin(form.nome || form.email.split('@')[0]);
        if (setPaginaAtual) setPaginaAtual('inicio');
      } else {
        // Confirmação de e-mail ativada: o perfil será salvo no primeiro login.
        alert('Conta criada! Confirme seu e-mail e depois faça login para concluir o cadastro.');
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  // Resolve o nome de exibição priorizando a tabela "profiles".
  const resolverNomeUsuario = async (user) => {
    if (!user) return '';
    const { data: perfil } = await supabase
      .from('profiles')
      .select('nome_completo')
      .eq('id', user.id)
      .maybeSingle();

    return (
      perfil?.nome_completo ||
      user.user_metadata?.nome_completo ||
      user.email.split('@')[0]
    );
  };

  return (
    <div className="conta-container">
      <div className="conta-box">
        <h2>{isLogin ? 'Acessar Conta' : 'Criar Conta'}</h2>
        <form onSubmit={handleSubmit} className="form-conta">
          
          <input 
            type="email" 
            name="email" 
            placeholder="Seu E-mail" 
            required 
            value={form.email}
            onChange={handleChange} 
          />

          {!isLogin && (
            <>
              <input type="text" name="nome" placeholder="Nome Completo" required value={form.nome} onChange={handleChange} />
              <input type="text" name="cpf" placeholder="CPF/CNPJ" required value={form.cpf} onChange={handleChange} />
              <input 
                type="text" 
                name="telefone" 
                placeholder="Telefone / WhatsApp" 
                required 
                value={form.telefone} 
                onChange={handleChange} 
              />
            </>
          )}

          <div className="senha-input-box">
            <input type={showPassword ? "text" : "password"} name="senha" placeholder="Senha" required value={form.senha} onChange={handleChange} />
            <button type="button" onMouseDown={handleHoldPassword} onMouseUp={handleReleasePassword} onMouseLeave={handleReleasePassword} onTouchStart={handleHoldPassword} onTouchEnd={handleReleasePassword} className="btn-ver-senha">👁️</button>
          </div>

          {!isLogin && (
            <>
              <input type="password" name="confSenha" placeholder="Confirmar Senha" required value={form.confSenha} onChange={handleChange} />
              <label className="termos-label" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
                <input type="checkbox" name="termos" checked={form.termos} required onChange={(e) => setForm({...form, termos: e.target.checked})} />
                <span>
                  Aceito os <span onClick={onOpenTerms} style={{color: '#007bff', cursor: 'pointer', textDecoration: 'underline'}}>termos de uso</span> e <span onClick={onOpenPrivacy} style={{color: '#007bff', cursor: 'pointer', textDecoration: 'underline'}}>políticas de privacidade</span>
                </span>
              </label>
            </>
          )}

          <button type="submit" disabled={loading} className="btn-submit-conta" style={{ marginTop: '15px' }}>
            {loading ? 'CARREGANDO...' : (isLogin ? 'ENTRAR' : 'CADASTRAR')}
          </button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)} className="toggle-conta" style={{ cursor: 'pointer', marginTop: '15px' }}>
          {isLogin ? 'Não tem conta? Crie uma.' : 'Já tem conta? Faça login.'}
        </p>
      </div>
    </div>
  );
}
