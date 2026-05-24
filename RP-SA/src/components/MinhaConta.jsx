import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function MinhaConta({ onLogin, onLogout, abrirModal }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [user, setUser] = useState(null);
  
  const [form, setForm] = useState({
    nome: '', cpf: '', telefone: '', email: '', senha: '', confSenha: '', termos: false
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        onLogin(session.user.user_metadata?.nome || session.user.email);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        onLogin(session.user.user_metadata?.nome || session.user.email);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [onLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      const formatted = formatarTelefone(value);
      setForm({ ...form, [name]: formatted });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    
    if (numeros.length <= 2) {
      return numeros.length ? `(${numeros}` : '';
    } else if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    } else {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }
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

  const validarTelefone = (telefone) => {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length === 10 || numeros.length === 11;
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.senha,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          showMessage('error', 'Email ou senha incorretos!');
        } else if (error.message.includes('Email not confirmed')) {
          showMessage('error', 'Por favor, confirme seu email antes de fazer login.');
        } else {
          showMessage('error', error.message);
        }
        return;
      }

      showMessage('success', 'Login realizado com sucesso!');
      setUser(data.user);
      onLogin(data.user.user_metadata?.nome || data.user.email);
    } catch (error) {
      showMessage('error', 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (form.senha !== form.confSenha) {
      showMessage('error', 'As senhas não coincidem!');
      return;
    }
    if (!form.termos) {
      showMessage('error', 'Aceite os termos de uso!');
      return;
    }
    if (!validarCpfCnpj(form.cpf)) {
      showMessage('error', 'CPF ou CNPJ inválido! Digite um documento válido.');
      return;
    }
    if (!validarTelefone(form.telefone)) {
      showMessage('error', 'Telefone inválido! Digite um número com DDD.');
      return;
    }
    if (form.senha.length < 6) {
      showMessage('error', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.senha,
        options: {
          data: {
            nome: form.nome,
            cpf: form.cpf.replace(/\D/g, ''),
            telefone: form.telefone.replace(/\D/g, ''),
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          showMessage('error', 'Este email já está cadastrado.');
        } else {
          showMessage('error', error.message);
        }
        return;
      }

      if (data.user && !data.session) {
        showMessage('success', 'Conta criada! Verifique seu email para confirmar o cadastro.');
        setIsLogin(true);
      } else if (data.session) {
        showMessage('success', 'Conta criada e login realizado com sucesso!');
        setUser(data.user);
        onLogin(data.user.user_metadata?.nome || data.user.email);
      }
    } catch (error) {
      showMessage('error', 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      onLogout();
      showMessage('success', 'Logout realizado com sucesso!');
    } catch (error) {
      showMessage('error', 'Erro ao fazer logout.');
    } finally {
      setLoading(false);
    }
  };

  const formatarCpfExibicao = (cpf) => {
    if (cpf.length === 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cpf.length === 14) {
      return cpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cpf;
  };

  const formatarTelefoneExibicao = (tel) => {
    if (tel.length === 10) {
      return tel.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (tel.length === 11) {
      return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return tel;
  };

  if (user) {
    return (
      <div className="flex justify-center px-5 py-10">
        <div className="bg-white p-8 sm:p-10 rounded-lg shadow-lg w-full max-w-md border-t-4 border-[#b71c1c]">
          <h2 className="text-2xl font-bold text-[#0d2137] mb-6 text-center">Minha Conta</h2>
          
          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium text-[#0d2137]">{user.email}</p>
            </div>
            
            {user.user_metadata?.nome && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Nome</p>
                <p className="font-medium text-[#0d2137]">{user.user_metadata.nome}</p>
              </div>
            )}
            
            {user.user_metadata?.cpf && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">CPF/CNPJ</p>
                <p className="font-medium text-[#0d2137]">
                  {formatarCpfExibicao(user.user_metadata.cpf)}
                </p>
              </div>
            )}

            {user.user_metadata?.telefone && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Telefone/WhatsApp</p>
                <p className="font-medium text-[#0d2137]">
                  {formatarTelefoneExibicao(user.user_metadata.telefone)}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-[#b71c1c] text-white py-3 rounded font-bold hover:bg-[#8e1616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saindo...' : 'SAIR DA CONTA'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-5 py-10">
      <div className="bg-white p-8 sm:p-10 rounded-lg shadow-lg w-full max-w-md border-t-4 border-[#b71c1c]">
        <h2 className="text-2xl font-bold text-[#0d2137] mb-6 text-center">
          {isLogin ? 'Acessar Conta' : 'Criar Conta'}
        </h2>

        {message.text && (
          <div className={`mb-4 p-3 rounded text-sm text-center ${
            message.type === 'error' 
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleSignUp} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <input 
                type="text" 
                name="nome" 
                placeholder="Nome Completo" 
                required 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#b71c1c] focus:ring-1 focus:ring-[#b71c1c] transition-colors"
              />
              <input 
                type="text" 
                name="cpf" 
                placeholder="CPF/CNPJ (Apenas números)" 
                required 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#b71c1c] focus:ring-1 focus:ring-[#b71c1c] transition-colors"
              />
              <input 
                type="tel" 
                name="telefone" 
                placeholder="Telefone/WhatsApp" 
                required 
                value={form.telefone}
                onChange={handleChange}
                maxLength={15}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#b71c1c] focus:ring-1 focus:ring-[#b71c1c] transition-colors"
              />
            </>
          )}
          
          <input 
            type="email" 
            name="email" 
            placeholder="E-mail" 
            required 
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#b71c1c] focus:ring-1 focus:ring-[#b71c1c] transition-colors"
          />

          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              name="senha" 
              placeholder="Senha" 
              required 
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded focus:outline-none focus:border-[#b71c1c] focus:ring-1 focus:ring-[#b71c1c] transition-colors"
            />
            <button 
              type="button" 
              onMouseDown={handleHoldPassword} 
              onMouseUp={handleReleasePassword} 
              onMouseLeave={handleReleasePassword} 
              onTouchStart={handleHoldPassword} 
              onTouchEnd={handleReleasePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-500 hover:text-gray-700 p-1"
              aria-label="Mostrar senha"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>

          {!isLogin && (
            <>
              <input 
                type="password" 
                name="confSenha" 
                placeholder="Confirmar Senha" 
                required 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#b71c1c] focus:ring-1 focus:ring-[#b71c1c] transition-colors"
              />
              <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="termos" 
                  required 
                  onChange={(e) => setForm({...form, termos: e.target.checked})}
                  className="mt-0.5 accent-[#b71c1c]"
                />
                <span>
                  Aceito os{' '}
                  <a 
                    onClick={(e) => { e.preventDefault(); abrirModal('termos'); }} 
                    className="text-[#b71c1c] underline cursor-pointer hover:text-[#8e1616]"
                  >
                    termos de uso
                  </a>
                  {' '}e{' '}
                  <a 
                    onClick={(e) => { e.preventDefault(); abrirModal('privacidade'); }} 
                    className="text-[#b71c1c] underline cursor-pointer hover:text-[#8e1616]"
                  >
                    políticas de privacidade
                  </a>
                </span>
              </label>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0d2137] text-white py-3 rounded font-bold hover:bg-[#1a3654] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Aguarde...' : (isLogin ? 'ENTRAR' : 'CADASTRAR')}
          </button>
        </form>

        <p 
          onClick={() => !loading && setIsLogin(!isLogin)} 
          className="text-[#b71c1c] cursor-pointer mt-5 text-sm text-center underline hover:text-[#8e1616] transition-colors"
        >
          {isLogin ? 'Não tem conta? Crie uma.' : 'Já tem conta? Faça login.'}
        </p>
      </div>
    </div>
  );
}
